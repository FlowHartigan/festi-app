import express from 'express';
import type { DatabaseSync } from 'node:sqlite';
import { readFestival } from './database.js';

export function createApp(db: DatabaseSync) {
  const app = express();
  app.disable('x-powered-by');
  app.get('/api/health', (_req, res) => {
    db.prepare('SELECT 1').get();
    res.json({ status: 'ok' });
  });
  app.get('/api/festival', (_req, res) => {
    res.set('Cache-Control', 'no-store').json(readFestival(db));
  });
  app.use((_req, res) => res.status(404).json({ error: 'Ressource introuvable' }));
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Erreur API', error instanceof Error ? error.message : 'Erreur inconnue');
    res.status(500).json({ error: 'Le contenu est momentanément indisponible' });
  });
  return app;
}
