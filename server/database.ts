import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { festivalSchema } from '../shared/festival.js';
import { initialFestival } from './seed.js';
import { programV2 } from './program-v2.js';

export function openDatabase(path = process.env.DATABASE_PATH ?? '.data/festi.sqlite') {
  if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true });
  const db = new DatabaseSync(path, { timeout: 5000 });
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec('CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY);');
  const applied = db.prepare('SELECT version FROM migrations WHERE version = 1').get();
  if (!applied) {
    db.exec('BEGIN IMMEDIATE');
    try {
      db.exec(`CREATE TABLE festival_content (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        content TEXT NOT NULL CHECK (json_valid(content)),
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`);
      db.prepare('INSERT INTO festival_content (id, content) VALUES (1, ?)')
        .run(JSON.stringify(festivalSchema.parse(initialFestival)));
      db.prepare('INSERT INTO migrations (version) VALUES (?)').run(1);
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); db.close(); throw error; }
  }
  if (!db.prepare('SELECT version FROM migrations WHERE version = 2').get()) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const festival = readFestival(db);
      const existingIds = new Set(festival.program.map(moment => moment.id));
      festival.program.push(...programV2.filter(moment => !existingIds.has(moment.id)));
      db.prepare('UPDATE festival_content SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
        .run(JSON.stringify(festivalSchema.parse(festival)));
      db.prepare('INSERT INTO migrations (version) VALUES (?)').run(2);
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); db.close(); throw error; }
  }
  return db;
}

export function readFestival(db: DatabaseSync) {
  const row = db.prepare('SELECT content FROM festival_content WHERE id = 1').get();
  if (!row || typeof row.content !== 'string') throw new Error('Contenu du festival absent');
  return festivalSchema.parse(JSON.parse(row.content));
}
