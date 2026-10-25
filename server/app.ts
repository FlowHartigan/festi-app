import express from 'express';
import type { DatabaseSync } from 'node:sqlite';
import { readFestival } from './database.js';
import { accountRoutes, type AccountOptions } from './account-routes.js';
import { accountSecret } from './account-config.js';

export function createApp(db: DatabaseSync, options: AccountOptions = { secret: accountSecret(), secureCookies: process.env.NODE_ENV === 'production' }) {
  const app = express();
  app.disable('x-powered-by');
  if (process.env.TRUST_PROXY === 'loopback') app.set('trust proxy', 'loopback');
  app.use('/api/account', accountRoutes(db, options));
  app.get('/api/health', (_req, res) => {
    db.prepare('SELECT 1').get();
    res.json({ status: 'ok' });
  });
  app.get('/api/festival', (_req, res) => {
    res.set('Cache-Control', 'no-store').json(readFestival(db));
  });
  app.use((_req, res) => res.status(404).json({ error: 'Ressource introuvable' }));
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = (error as { status?: number })?.status;
    if (status === 400 || status === 413) { res.status(status).json({ error: 'La requête est invalide ou trop volumineuse.' }); return; }
    console.error('Erreur API : traitement impossible');
    res.status(500).json({ error: 'Le contenu est momentanément indisponible' });
  });
  return app;
}
