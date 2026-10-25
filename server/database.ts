import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { festivalSchema } from '../shared/festival.js';
import { initialFestival } from './seed.js';
import { programV2 } from './program-v2.js';
import { migrateAccounts, migrateSeparateResponses } from './account-database.js';
import { practicalHours } from './practical-hours.js';
import { childrenInformation } from './children-information.js';
import { nearbyAccommodation } from './nearby-accommodation.js';
import { venueLocation } from './venue-location.js';

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
  migrateAccounts(db);
  migrateSeparateResponses(db);
  if (!db.prepare('SELECT version FROM migrations WHERE version = 5').get()) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const festival = readFestival(db);
      if (!festival.information.some(item => item.id === practicalHours.id)) {
        festival.information.push(practicalHours);
        db.prepare('UPDATE festival_content SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
          .run(JSON.stringify(festivalSchema.parse(festival)));
      }
      db.prepare('INSERT INTO migrations (version) VALUES (?)').run(5);
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); db.close(); throw error; }
  }
  if (!db.prepare('SELECT version FROM migrations WHERE version = 6').get()) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const festival = readFestival(db);
      festival.information = festival.information.map(item => item.id === practicalHours.id ? practicalHours : item);
      db.prepare('UPDATE festival_content SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
        .run(JSON.stringify(festivalSchema.parse(festival)));
      db.prepare('INSERT INTO migrations (version) VALUES (?)').run(6);
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); db.close(); throw error; }
  }
  if (!db.prepare('SELECT version FROM migrations WHERE version = 7').get()) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const festival = readFestival(db);
      if (!festival.information.some(item => item.id === childrenInformation.id)) {
        festival.information.push(childrenInformation);
        db.prepare('UPDATE festival_content SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
          .run(JSON.stringify(festivalSchema.parse(festival)));
      }
      db.prepare('INSERT INTO migrations (version) VALUES (?)').run(7);
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); db.close(); throw error; }
  }
  if (!db.prepare('SELECT version FROM migrations WHERE version = 8').get()) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const festival = readFestival(db);
      if (!festival.information.some(item => item.id === nearbyAccommodation.id)) {
        festival.information.push(nearbyAccommodation);
        db.prepare('UPDATE festival_content SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
          .run(JSON.stringify(festivalSchema.parse(festival)));
      }
      db.prepare('INSERT INTO migrations (version) VALUES (?)').run(8);
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); db.close(); throw error; }
  }
  if (!db.prepare('SELECT version FROM migrations WHERE version = 9').get()) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const festival = readFestival(db);
      const index = festival.information.findIndex(item => item.id === venueLocation.id);
      if (index < 0) festival.information.push(venueLocation);
      else festival.information[index] = venueLocation;
      db.prepare('UPDATE festival_content SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
        .run(JSON.stringify(festivalSchema.parse(festival)));
      db.prepare('INSERT INTO migrations (version) VALUES (?)').run(9);
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); db.close(); throw error; }
  }
  if (!db.prepare('SELECT version FROM migrations WHERE version = 10').get()) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const festival = readFestival(db);
      const hours = festival.information.find(item => item.id === practicalHours.id);
      const musicEnd = hours?.schedule?.find(moment => moment.time === '04:00' && moment.title === 'Fin du son');
      if (musicEnd) musicEnd.title = 'Fin de la musique';
      db.prepare('UPDATE festival_content SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
        .run(JSON.stringify(festivalSchema.parse(festival)));
      db.prepare('INSERT INTO migrations (version) VALUES (?)').run(10);
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
