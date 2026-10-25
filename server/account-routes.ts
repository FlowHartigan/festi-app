import { createHash, randomBytes } from 'node:crypto';
import { Router, json } from 'express';
import type { Request } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import { loginSchema, presenceSchema, responseSchema, vanSchema } from '../shared/account.js';
import { privateHash, readAccount } from './account-database.js';

export interface AccountOptions { secret: string; secureCookies?: boolean; now?: () => number; }
const cookieName = 'festi_account';
const sessionDuration = 7 * 24 * 60 * 60 * 1000;
const windowDuration = 15 * 60 * 1000;
const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');

function sessionToken(req: Request) {
  return req.headers.cookie?.split(';').map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1) ?? '';
}

export function accountRoutes(db: DatabaseSync, options: AccountOptions) {
  const router = Router();
  const now = options.now ?? Date.now;
  const cookieOptions = { httpOnly: true, secure: options.secureCookies ?? false, sameSite: 'strict' as const, path: '/api/account' };
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  // A cross-origin form cannot supply this header; no CORS access is enabled.
  router.use((req, res, next) => {
    if (req.method !== 'GET' && (req.get('X-Account-Request') !== '1' || req.get('Sec-Fetch-Site') === 'cross-site')) {
      res.status(403).json({ error: 'Cette action doit être effectuée depuis l’application.' }); return;
    }
    next();
  });
  router.use(json({ limit: '2kb' }));

  router.post('/login', (req, res) => {
    const timestamp = now();
    db.prepare('DELETE FROM account_attempts WHERE expires_at <= ?').run(timestamp);
    const key = privateHash(options.secret, 'ip', req.ip ?? req.socket.remoteAddress ?? 'unknown');
    const attempt = db.prepare('SELECT count, expires_at FROM account_attempts WHERE key = ?').get(key);
    const global = db.prepare("SELECT count, expires_at FROM account_attempts WHERE key = 'global'").get();
    const blocked = attempt && Number(attempt.count) >= 5 ? attempt : global && Number(global.count) >= 50 ? global : null;
    if (blocked) {
      res.set('Retry-After', String(Math.max(1, Math.ceil((Number(blocked.expires_at) - timestamp) / 1000))));
      res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' }); return;
    }
    const increment = db.prepare(`INSERT INTO account_attempts (key, count, expires_at) VALUES (?, 1, ?)
      ON CONFLICT(key) DO UPDATE SET count = count + 1`);
    const parsed = loginSchema.safeParse(req.body);
    const guest = parsed.success ? db.prepare('SELECT id FROM guests WHERE code_hash = ?')
      .get(privateHash(options.secret, 'code', parsed.data.code)) : undefined;
    if (!guest) {
      increment.run(key, timestamp + windowDuration);
      increment.run('global', timestamp + windowDuration);
      res.status(401).json({ error: 'Code non reconnu. Vérifiez les quatre chiffres de votre invitation.' }); return;
    }
    const token = randomBytes(32).toString('hex');
    db.prepare('DELETE FROM account_sessions WHERE expires_at <= ? OR token_hash = ?').run(timestamp, tokenHash(sessionToken(req)));
    db.prepare('INSERT INTO account_sessions (token_hash, guest_id, expires_at) VALUES (?, ?, ?)')
      .run(tokenHash(token), guest.id, timestamp + sessionDuration);
    res.cookie(cookieName, token, { ...cookieOptions, maxAge: sessionDuration }).json(readAccount(db, String(guest.id)));
  });

  router.post('/logout', (req, res) => {
    db.prepare('DELETE FROM account_sessions WHERE token_hash = ?').run(tokenHash(sessionToken(req)));
    res.clearCookie(cookieName, cookieOptions).status(204).end();
  });

  router.use((req, res, next) => {
    const session = db.prepare('SELECT guest_id FROM account_sessions WHERE token_hash = ? AND expires_at > ?')
      .get(tokenHash(sessionToken(req)), now());
    if (!session) { res.status(401).json({ error: 'Votre session a expiré. Saisissez votre code pour vous reconnecter.' }); return; }
    res.locals.guestId = String(session.guest_id);
    next();
  });
  router.get('/', (_req, res) => res.json(readAccount(db, res.locals.guestId)));
  router.put('/presence', (req, res) => {
    const parsed = presenceSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Choisissez votre réponse pour la présence.' }); return; }
    const attending = Number(parsed.data.attending);
    db.prepare(`UPDATE guests SET van = CASE WHEN ? = 0 THEN 0 WHEN attending = 0 THEN NULL ELSE van END,
      attending = ?, updated_at = ? WHERE id = ?`)
      .run(attending, attending, new Date(now()).toISOString(), res.locals.guestId);
    res.json(readAccount(db, res.locals.guestId));
  });
  router.put('/van', (req, res) => {
    const parsed = vanSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Choisissez votre réponse pour la nuit en van.' }); return; }
    if (readAccount(db, res.locals.guestId).attending !== true) {
      res.status(409).json({ error: 'Confirmez d’abord votre présence au mariage pour répondre pour le van.' }); return;
    }
    db.prepare('UPDATE guests SET van = ?, updated_at = ? WHERE id = ?')
      .run(Number(parsed.data.van), new Date(now()).toISOString(), res.locals.guestId);
    res.json(readAccount(db, res.locals.guestId));
  });
  router.put('/response', (req, res) => {
    const parsed = responseSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Choisissez votre présence et votre réponse pour le van.' }); return; }
    const { attending, van } = parsed.data;
    db.prepare('UPDATE guests SET attending = ?, van = ?, updated_at = ? WHERE id = ?')
      .run(Number(attending), Number(van), new Date(now()).toISOString(), res.locals.guestId);
    res.json(readAccount(db, res.locals.guestId));
  });
  return router;
}
