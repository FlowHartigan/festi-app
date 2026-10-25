import { createHmac, randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import { accountSchema } from '../shared/account.js';

export function migrateAccounts(db: DatabaseSync) {
  if (db.prepare('SELECT version FROM migrations WHERE version = 3').get()) return;
  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec(`
      CREATE TABLE guests (
        id TEXT PRIMARY KEY,
        code_hash TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        attending INTEGER CHECK (attending IN (0, 1)),
        van INTEGER CHECK (van IN (0, 1)),
        updated_at TEXT,
        CHECK ((attending IS NULL AND van IS NULL) OR
          (attending IS NOT NULL AND van IS NOT NULL AND (attending = 1 OR van = 0)))
      );
      CREATE TABLE account_sessions (
        token_hash TEXT PRIMARY KEY,
        guest_id TEXT NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
        expires_at INTEGER NOT NULL
      );
      CREATE INDEX account_sessions_expiry ON account_sessions(expires_at);
      CREATE TABLE account_attempts (
        key TEXT PRIMARY KEY,
        count INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      );
      INSERT INTO migrations (version) VALUES (3);
    `);
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}

export function privateHash(secret: string, purpose: string, value: string) {
  return createHmac('sha256', secret).update(`${purpose}:${value}`).digest('hex');
}

export function migrateSeparateResponses(db: DatabaseSync) {
  if (db.prepare('SELECT version FROM migrations WHERE version = 4').get()) return;
  // Rebuild the constraint while keeping existing guest IDs and session references.
  db.exec('PRAGMA foreign_keys = OFF;');
  try {
    db.exec('BEGIN IMMEDIATE');
    try {
      db.exec(`
        CREATE TABLE guests_v4 (
          id TEXT PRIMARY KEY,
          code_hash TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          attending INTEGER CHECK (attending IN (0, 1)),
          van INTEGER CHECK (van IN (0, 1)),
          updated_at TEXT,
          CHECK (attending IS NOT NULL OR van IS NULL),
          CHECK (attending IS NOT 0 OR van IS 0),
          CHECK (van IS NOT 1 OR attending IS 1)
        );
        INSERT INTO guests_v4 SELECT id, code_hash, name, attending, van, updated_at FROM guests;
        DROP TABLE guests;
        ALTER TABLE guests_v4 RENAME TO guests;
        INSERT INTO migrations (version) VALUES (4);
      `);
      if (db.prepare('PRAGMA foreign_key_check').all().length) throw new Error('Références de comptes invalides.');
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  } finally { db.exec('PRAGMA foreign_keys = ON;'); }
}

export const guestImportSchema = z.array(z.object({
  name: z.string().trim().min(1).max(150), code: z.string().regex(/^\d{4}$/),
}).strict()).min(1).max(10000).refine(rows => new Set(rows.map(row => row.code)).size === rows.length);

export function importGuests(db: DatabaseSync, input: unknown, secret: string) {
  const parsed = guestImportSchema.safeParse(input);
  if (!parsed.success) throw new Error('Import invalide : noms et codes uniques à quatre chiffres requis.');
  const statement = db.prepare(`INSERT INTO guests (id, code_hash, name) VALUES (?, ?, ?)
    ON CONFLICT(code_hash) DO UPDATE SET name = excluded.name`);
  db.exec('BEGIN IMMEDIATE');
  try {
    for (const guest of parsed.data) statement.run(randomUUID(), privateHash(secret, 'code', guest.code), guest.name);
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
  return parsed.data.length;
}

export function readAccount(db: DatabaseSync, id: string) {
  const row = db.prepare('SELECT name, attending, van, updated_at FROM guests WHERE id = ?').get(id);
  if (!row) throw new Error('Compte introuvable');
  return accountSchema.parse({ name: row.name, attending: row.attending === null ? null : row.attending === 1,
    van: row.van === null ? null : row.van === 1, updatedAt: row.updated_at });
}
