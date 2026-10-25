import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { openDatabase, readFestival } from '../server/database.js';
import { createApp } from '../server/app.js';
import { festivalSchema } from '../shared/festival.js';

test('Les migrations préservent le contenu modifié après un redémarrage', () => {
  const directory = mkdtempSync(join(tmpdir(), 'festi-test-'));
  const path = join(directory, 'festival.sqlite');
  let db = openDatabase(path);
  try {
    const content = { ...readFestival(db), name: 'Festival mis à jour' };
    // Reconstitue un contenu personnalisé avant les migrations de programme et d’informations.
    content.program = content.program.filter(moment => moment.id === 'ouverture');
    content.information = content.information.filter(item => !['horaires', 'petits-bouts', 'hebergements-proximite'].includes(item.id));
    content.information.push({ id: 'horaires', title: 'Horaires', body: 'Ancienne présentation des horaires.' });
    content.information = content.information.map(item => item.id === 'lieu' ? { id: 'lieu', title: 'Le lieu', body: 'Ancienne adresse.' } : item);
    db.prepare('UPDATE festival_content SET content = ? WHERE id = 1').run(JSON.stringify(content));
    db.exec('DELETE FROM migrations WHERE version IN (2, 6, 7, 8, 9)');
    db.close();
    db = openDatabase(path);
    assert.equal(readFestival(db).name, 'Festival mis à jour');
    assert.deepEqual(readFestival(db).program.map(({ time, endTime }) => [time, endTime]), [
      ['16:30', undefined], ['17:00', '19:00'], ['19:00', '20:00'],
    ]);
    db.close();
    db = openDatabase(path);
    assert.equal(readFestival(db).program.length, 3);
    assert.equal(readFestival(db).information.filter(item => item.id === 'horaires').length, 1);
    assert.ok(readFestival(db).information.some(item => item.id === 'lieu'));
    assert.deepEqual(readFestival(db).information.find(item => item.id === 'horaires')?.schedule?.map(moment => moment.time), ['16:30', '04:00', '05:00']);
    assert.equal(readFestival(db).information.filter(item => item.id === 'petits-bouts').length, 1);
    const lodgings = readFestival(db).information.find(item => item.id === 'hebergements-proximite')?.lodgings;
    assert.equal(lodgings?.length, 10);
    assert.equal(new Set(lodgings?.map(lodging => lodging.url)).size, 10);
    assert.ok(lodgings?.every(lodging => lodging.url.startsWith('https://')));
    assert.equal(readFestival(db).information.filter(item => item.id === 'hebergements-proximite').length, 1);
    assert.equal(readFestival(db).information.filter(item => item.id === 'lieu').length, 1);
    assert.deepEqual(readFestival(db).information.find(item => item.id === 'lieu')?.location, {
      name: 'La Source du Buron', address: 'Domaine de Luc', town: '15500 Saint-Poncy, France',
    });
    assert.equal(db.prepare('SELECT count(*) AS total FROM migrations').get()?.total, 10);
    assert.equal(db.prepare('PRAGMA integrity_check').get()?.integrity_check, 'ok');
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test('L’API fournit le contenu validé et refuse les routes d’écriture', async () => {
  const db = openDatabase(':memory:');
  const server = createApp(db, { secret: 'integration-test-secret-not-for-production' }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: 'ok' });
    const response = await fetch(`${base}/api/festival`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const content = festivalSchema.parse(await response.json());
    assert.equal(content.date, '2027-09-04');
    assert.equal(content.program.some(moment => moment.time === '14:30'), false);
    const write = await fetch(`${base}/api/festival`, { method: 'POST' });
    assert.equal(write.status, 404);
    assert.deepEqual(readFestival(db), content);
    const missing = await fetch(`${base}/api/inconnue`);
    assert.equal(missing.status, 404);
    assert.match(missing.headers.get('content-type') ?? '', /application\/json/);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    db.close();
  }
});

test('Un contenu invalide ne peut pas être envoyé aux invités', async () => {
  const db = openDatabase(':memory:');
  const server = createApp(db, { secret: 'integration-test-secret-not-for-production' }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  try {
    db.prepare('UPDATE festival_content SET content = ? WHERE id = 1').run('{}');
    const response = await fetch(`http://127.0.0.1:${address.port}/api/festival`);
    assert.equal(response.status, 500);
    const body = await response.json();
    assert.deepEqual(body, { error: 'Le contenu est momentanément indisponible' });
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    db.close();
  }
});
