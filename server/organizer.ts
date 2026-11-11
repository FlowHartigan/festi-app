import { timingSafeEqual } from 'node:crypto';
import { Router, json } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import { organizerPresenceSchema } from '../shared/account.js';
import { readAccount, updatePresence } from './account-database.js';

const pinPattern = /^\d{4}$/;
const attemptWindow = 24 * 60 * 60 * 1000;
const attemptKey = 'organizer-pin';

export function organizerRoutes(db: DatabaseSync, key: string | undefined, now = Date.now) {
  const router = Router();
  const pin = key !== undefined && pinPattern.test(key);
  const expected = key && (pin || /^[a-f0-9]{64}$/.test(key)) ? Buffer.from(`Bearer ${key}`) : null;
  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!expected) {
      res.status(503).json({ error: 'Le tableau de bord doit être activé sur le serveur.' });
      return;
    }
    const header = req.get('Authorization') ?? '';
    const authorization = Buffer.from(header);
    const checkPin = pin && /^Bearer \d{4}$/.test(header);
    const timestamp = now();
    if (checkPin) {
      db.prepare('DELETE FROM account_attempts WHERE key = ? AND expires_at <= ?').run(attemptKey, timestamp);
      const attempt = db.prepare('SELECT count, expires_at FROM account_attempts WHERE key = ?').get(attemptKey);
      if (attempt && Number(attempt.count) >= 5) {
        res.set('Retry-After', String(Math.ceil((Number(attempt.expires_at) - timestamp) / 1000)));
        res.status(429).json({ error: 'Trop de tentatives. Réessayez plus tard.' });
        return;
      }
    }
    if (authorization.length !== expected.length || !timingSafeEqual(authorization, expected)) {
      if (checkPin) {
        db.prepare(`INSERT INTO account_attempts (key, count, expires_at) VALUES (?, 1, ?)
          ON CONFLICT(key) DO UPDATE SET count = count + 1`).run(attemptKey, timestamp + attemptWindow);
      }
      res.status(401).json({ error: 'Clé organisateur incorrecte.' });
      return;
    }
    next();
  });

  router.get('/', (_req, res) => {
    const rows = db.prepare('SELECT id, name, attending, van, updated_at FROM guests ORDER BY name, id').all();
    res.json(rows.map(row => ({
      id: row.id,
      name: row.name,
      attending: row.attending === null ? null : row.attending === 1,
      van: row.van === null ? null : row.van === 1,
      updatedAt: row.updated_at,
    })));
  });
  router.put('/:id/presence', json({ limit: '2kb' }), (req, res) => {
    const id = z.uuid().safeParse(req.params.id);
    const presence = organizerPresenceSchema.safeParse(req.body);
    if (!id.success || !presence.success) {
      res.status(400).json({ error: 'La modification de présence est invalide.' });
      return;
    }
    if (!updatePresence(db, id.data, presence.data.attending, now())) {
      res.status(404).json({ error: 'Invité introuvable.' });
      return;
    }
    res.json({ id: id.data, ...readAccount(db, id.data) });
  });
  return router;
}
