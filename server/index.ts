import { createApp } from './app.js';
import { openDatabase } from './database.js';

const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT invalide');
const db = openDatabase();
const server = createApp(db).listen(port, process.env.HOST ?? '127.0.0.1', () => {
  console.log(`API prête sur le port ${port}`);
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    server.close(() => { db.close(); process.exit(0); });
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}
