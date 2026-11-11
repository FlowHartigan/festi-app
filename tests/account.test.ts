import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { openDatabase } from '../server/database.js';
import { createApp } from '../server/app.js';
import { accountSchema, organizerResponsesSchema } from '../shared/account.js';
import { importGuests, migrateAccounts, migrateSeparateResponses, privateHash, readAccount } from '../server/account-database.js';

const secret = 'fictional-account-test-secret-with-no-real-data';
const guests = [{ name: 'Invité Alpha', code: '0123' }, { name: 'Invité Bêta', code: '4567' }];

async function fixture(path = ':memory:', secureCookies = false, organizerKey = '') {
  let time = Date.now();
  const db = openDatabase(path);
  importGuests(db, guests, secret);
  const server = createApp(db, { secret, secureCookies, now: () => time }, organizerKey).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const request = (path: string, method = 'GET', body?: unknown, cookie = '', headers: Record<string, string> = {}) =>
    fetch(`${base}/api/account${path}`, { method, headers: { 'Content-Type': 'application/json', 'X-Account-Request': '1', Cookie: cookie, ...headers },
      body: body === undefined ? undefined : JSON.stringify(body) });
  return { db, base, request, advance: (ms: number) => { time += ms; }, close: async () => {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); db.close();
  } };
}

test('Organisateur : accès privé aux choix enregistrés et aux invités sans réponse', async () => {
  const key = 'a'.repeat(64);
  const f = await fixture(':memory:', false, key);
  try {
    const url = `${f.base}/api/organizer/responses`;
    const login = await f.request('/login', 'POST', { code: guests[0].code });
    const cookie = login.headers.get('set-cookie')!.split(';')[0];
    const saved = await f.request('/presence', 'PUT', { attending: true }, cookie);
    assert.equal(saved.status, 200);
    assert.equal((await fetch(url, { headers: { Cookie: cookie } })).status, 401);
    assert.equal((await fetch(url, { headers: { Authorization: `Bearer ${'b'.repeat(64)}` } })).status, 401);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const rows = organizerResponsesSchema.parse(await response.json());
    assert.notEqual(rows[0].id, rows[1].id);
    assert.deepEqual(rows.map(row => accountSchema.parse(row)), [
      { name: guests[0].name, attending: true, van: null, updatedAt: accountSchema.parse(await saved.json()).updatedAt },
      { name: guests[1].name, attending: null, van: null, updatedAt: null },
    ]);
  } finally { await f.close(); }
});

test('Organisateur : cinq codes incorrects bloquent le code pendant 24 heures', async () => {
  const f = await fixture(':memory:', false, '7621');
  const request = (code: string) => fetch(`${f.base}/api/organizer/responses`, {
    headers: { Authorization: `Bearer ${code}` },
  });
  try {
    assert.equal((await request('7621')).status, 200);
    for (let attempt = 0; attempt < 5; attempt++) {
      assert.equal((await request('0000')).status, 401);
    }
    const blocked = await request('7621');
    assert.equal(blocked.status, 429);
    assert.equal(blocked.headers.get('retry-after'), '86400');
    f.advance(86400 * 1000);
    assert.equal((await request('7621')).status, 200);
  } finally { await f.close(); }
});

test('Organisateur : modifier la présence met à jour le compte et le choix de van', async () => {
  const key = 'c'.repeat(64);
  const f = await fixture(':memory:', false, key);
  try {
    const login = await f.request('/login', 'POST', { code: guests[0].code });
    const cookie = login.headers.get('set-cookie')!.split(';')[0];
    assert.equal((await f.request('/response', 'PUT', { attending: true, van: true }, cookie)).status, 200);
    const id = f.db.prepare('SELECT id FROM guests WHERE name = ?').get(guests[0].name)?.id;
    const put = (target: unknown, attending: unknown, organizerKey?: string) => fetch(
      `${f.base}/api/organizer/responses/${target}/presence`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Cookie: cookie, ...(organizerKey && { Authorization: `Bearer ${organizerKey}` }) },
        body: JSON.stringify({ attending }),
      },
    );
    assert.equal((await put(id, false)).status, 401);
    assert.equal((await f.request('/presence', 'PUT', { attending: null }, cookie)).status, 400);
    assert.equal((await put(id, 'non', key)).status, 400);
    assert.equal((await put('63b8b318-3b97-4a83-a9f2-1a5374b23aac', false, key)).status, 404);
    for (const [attending, van] of [[true, true], [false, false], [true, null], [null, null]] as const) {
      const response = await put(id, attending, key);
      assert.equal(response.status, 200);
      const account = accountSchema.parse(await response.json());
      assert.equal(account.attending, attending);
      assert.equal(account.van, van);
      if (attending === null) assert.equal(account.updatedAt, null);
      assert.deepEqual(await (await f.request('', 'GET', undefined, cookie)).json(), account);
    }
  } finally { await f.close(); }
});

test('Compte : code avec zéro initial, session, réponses isolées, modification et déconnexion', async () => {
  const f = await fixture();
  try {
    assert.equal((await f.request('')).status, 401);
    assert.equal((await f.request('/response', 'PUT', { attending: true, van: true })).status, 401);
    assert.equal((await f.request('/login', 'POST', { code: '9999' })).status, 401);
    const login = await f.request('/login', 'POST', { code: '0123' });
    assert.equal(login.status, 200);
    const cookieHeader = login.headers.get('set-cookie')!;
    assert.match(cookieHeader, /HttpOnly/); assert.match(cookieHeader, /SameSite=Strict/);
    assert.match(cookieHeader, /Path=\/api\/account/);
    const cookie = cookieHeader.split(';')[0];
    assert.deepEqual(await login.json(), { name: guests[0].name, attending: null, van: null, updatedAt: null });
    const saved = await f.request('/response', 'PUT', { attending: true, van: true }, cookie);
    assert.equal(saved.status, 200);
    assert.equal(accountSchema.parse(await saved.json()).van, true);
    assert.equal(accountSchema.parse(await (await f.request('', 'GET', undefined, cookie)).json()).attending, true);
    assert.equal((await f.request('/response', 'PUT', { attending: false, van: true }, cookie)).status, 400);
    assert.equal((await f.request('/response', 'PUT', { attending: 'yes', van: false }, cookie)).status, 400);
    assert.equal((await f.request('/response', 'PUT', { attending: true, van: true, guestId: 'other' }, cookie)).status, 400);
    assert.equal((await f.request('/response', 'PUT', { attending: true, van: true }, cookie, { 'X-Account-Request': '' })).status, 403);
    assert.equal((await f.request('/response', 'PUT', { attending: true, van: true }, cookie, { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
    const other = await f.request('/login', 'POST', { code: '4567' });
    assert.equal(accountSchema.parse(await other.json()).attending, null);
    const otherCookie = other.headers.get('set-cookie')!.split(';')[0];
    assert.equal((await f.request('/response', 'PUT', { attending: false, van: false }, otherCookie)).status, 200);
    assert.equal(accountSchema.parse(await (await f.request('', 'GET', undefined, cookie)).json()).van, true);
    const changed = await f.request('/response', 'PUT', { attending: false, van: false }, cookie);
    assert.equal(accountSchema.parse(await changed.json()).van, false);
    assert.equal((await f.request('/logout', 'POST', undefined, cookie)).status, 204);
    assert.equal((await f.request('', 'GET', undefined, cookie)).status, 401);
    assert.equal((await f.request('', 'GET', undefined, otherCookie)).status, 200);
    assert.ok(f.db.prepare('SELECT code_hash FROM guests').all().every(row => typeof row.code_hash === 'string' && /^[a-f0-9]{64}$/.test(row.code_hash)));
    assert.ok(!f.db.prepare('PRAGMA table_info(guests)').all().some(row => row.name === 'code'));
  } finally { await f.close(); }
});

test('Limitation persistante des essais, expiration de session et cookie HTTPS', async () => {
  const f = await fixture(':memory:', true);
  try {
    for (let i = 0; i < 5; i++) assert.equal((await f.request('/login', 'POST', { code: '9999' })).status, 401);
    const blocked = await f.request('/login', 'POST', { code: '0123' });
    assert.equal(blocked.status, 429); assert.equal(blocked.headers.get('retry-after'), '900');
    f.advance(15 * 60 * 1000);
    const login = await f.request('/login', 'POST', { code: '0123' });
    assert.equal(login.status, 200); assert.match(login.headers.get('set-cookie')!, /Secure/);
    const cookie = login.headers.get('set-cookie')!.split(';')[0];
    f.advance(7 * 24 * 60 * 60 * 1000 + 1);
    assert.equal((await f.request('', 'GET', undefined, cookie)).status, 401);
    assert.equal((await f.request('/response', 'PUT', { attending: true, van: true }, cookie)).status, 401);
    f.db.prepare("INSERT INTO account_attempts (key, count, expires_at) VALUES ('global', 50, ?)").run(Date.now() + 10 * 24 * 60 * 60 * 1000);
    assert.equal((await f.request('/login', 'POST', { code: '0123' })).status, 429);
  } finally { await f.close(); }
});

test('Présence et van se confirment séparément sans écraser une autre réponse', async () => {
  const f = await fixture();
  try {
    assert.equal((await f.request('/presence', 'PUT', { attending: true })).status, 401);
    assert.equal((await f.request('/van', 'PUT', { van: true })).status, 401);
    const login = await f.request('/login', 'POST', { code: '0123' });
    const cookie = login.headers.get('set-cookie')!.split(';')[0];
    assert.equal((await f.request('/van', 'PUT', { van: true }, cookie)).status, 409);
    const presence = await f.request('/presence', 'PUT', { attending: true }, cookie);
    assert.equal(presence.status, 200);
    const account = accountSchema.parse(await presence.json());
    assert.equal(account.attending, true); assert.equal(account.van, null);
    const van = await f.request('/van', 'PUT', { van: true }, cookie);
    assert.equal(van.status, 200); assert.equal(accountSchema.parse(await van.json()).van, true);
    const samePresence = await f.request('/presence', 'PUT', { attending: true }, cookie);
    assert.equal(accountSchema.parse(await samePresence.json()).van, true);
    assert.equal((await f.request('/presence', 'PUT', { attending: true, van: false }, cookie)).status, 400);
    assert.equal((await f.request('/van', 'PUT', { van: 'yes' }, cookie)).status, 400);
    assert.equal((await f.request('/van', 'PUT', { van: false }, cookie, { 'X-Account-Request': '' })).status, 403);
    const absence = await f.request('/presence', 'PUT', { attending: false }, cookie);
    assert.equal(accountSchema.parse(await absence.json()).van, false);
    assert.equal((await f.request('/van', 'PUT', { van: true }, cookie)).status, 409);
    const returning = await f.request('/presence', 'PUT', { attending: true }, cookie);
    assert.equal(accountSchema.parse(await returning.json()).van, null);
    const noVan = await f.request('/van', 'PUT', { van: false }, cookie);
    const final = accountSchema.parse(await noVan.json());
    assert.equal(final.attending, true); assert.equal(final.van, false);
  } finally { await f.close(); }
});

test('La migration 4 conserve les comptes, les réponses et leurs sessions actives', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON; CREATE TABLE migrations (version INTEGER PRIMARY KEY);');
  try {
    migrateAccounts(db);
    importGuests(db, guests, secret);
    const id = String(db.prepare('SELECT id FROM guests WHERE code_hash = ?').get(privateHash(secret, 'code', '0123'))?.id);
    db.prepare('UPDATE guests SET attending = 1, van = 1 WHERE id = ?').run(id);
    db.prepare('INSERT INTO account_sessions VALUES (?, ?, ?)').run('fictional-session-hash', id, Date.now() + 10000);
    migrateSeparateResponses(db);
    assert.equal(readAccount(db, id).van, true);
    assert.equal(db.prepare('SELECT guest_id FROM account_sessions').get()?.guest_id, id);
    assert.equal(db.prepare('PRAGMA foreign_keys').get()?.foreign_keys, 1);
    assert.equal(db.prepare('PRAGMA foreign_key_check').all().length, 0);
    db.prepare('UPDATE guests SET van = NULL WHERE id = ?').run(id);
    assert.equal(readAccount(db, id).van, null);
    assert.throws(() => db.prepare('UPDATE guests SET attending = NULL, van = 1 WHERE id = ?').run(id));
    assert.throws(() => db.prepare('UPDATE guests SET attending = 0, van = NULL WHERE id = ?').run(id));
    migrateSeparateResponses(db);
    assert.equal(db.prepare('SELECT count(*) AS n FROM account_sessions').get()?.n, 1);
  } finally { db.close(); }
});

test('Réponses et sessions conservées au redémarrage, réimport sans perte et doublons refusés', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'festi-account-'));
  const path = join(directory, 'test.sqlite');
  const f = await fixture(path);
  let cookie: string;
  try {
    const login = await f.request('/login', 'POST', { code: '0123' });
    cookie = login.headers.get('set-cookie')!.split(';')[0];
    await f.request('/response', 'PUT', { attending: true, van: false }, cookie);
    assert.throws(() => importGuests(f.db, [guests[0], guests[0]], secret), /Import invalide/);
    assert.equal(f.db.prepare('SELECT count(*) AS n FROM guests').get()?.n, 2);
    for (let i = 0; i < 5; i++) await f.request('/login', 'POST', { code: '9999' });
  } finally { await f.close(); }
  const reopened = await fixture(path);
  try {
    const response = await reopened.request('', 'GET', undefined, cookie);
    assert.equal(response.status, 200);
    assert.equal((await reopened.request('/login', 'POST', { code: '0123' })).status, 429);
    assert.equal(accountSchema.parse(await response.json()).attending, true);
    assert.equal(reopened.db.prepare('SELECT van FROM guests WHERE code_hash = ?').get(privateHash(secret, 'code', '0123'))?.van, 0);
    assert.equal(reopened.db.prepare('PRAGMA integrity_check').get()?.integrity_check, 'ok');
  } finally { await reopened.close(); rmSync(directory, { recursive: true, force: true }); }
});
