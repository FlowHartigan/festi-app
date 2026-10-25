import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { openDatabase } from '../server/database.js';
import { createApp } from '../server/app.js';
import { accountSchema } from '../shared/account.js';
import { importGuests, migrateAccounts, migrateSeparateResponses, privateHash, readAccount } from '../server/account-database.js';

const secret = 'fictional-account-test-secret-with-no-real-data';
const guests = [{ name: 'Invité Alpha', code: '0123' }, { name: 'Invité Bêta', code: '4567' }];

async function fixture(path = ':memory:', secureCookies = false) {
  let time = Date.now();
  const db = openDatabase(path);
  importGuests(db, guests, secret);
  const server = createApp(db, { secret, secureCookies, now: () => time }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const request = (path: string, method = 'GET', body?: unknown, cookie = '', headers: Record<string, string> = {}) =>
    fetch(`${base}/api/account${path}`, { method, headers: { 'Content-Type': 'application/json', 'X-Account-Request': '1', Cookie: cookie, ...headers },
      body: body === undefined ? undefined : JSON.stringify(body) });
  return { db, request, advance: (ms: number) => { time += ms; }, close: async () => {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); db.close();
  } };
}

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
