import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { openDatabase } from './database.js';

const path = process.argv[2] ?? 'resources/private/reponses.csv';
const db = openDatabase();
try {
  const rows = db.prepare('SELECT name, attending, van, updated_at FROM guests ORDER BY name').all();
  const cell = (value: unknown) => {
    const text = String(value ?? '');
    return `"${(/^[=+@\-\t\r\n]/.test(text) ? `'${text}` : text).replaceAll('"', '""')}"`;
  };
  const answer = (value: unknown) => value === null ? 'Sans réponse' : value === 1 ? 'Oui' : 'Non';
  const lines = [['Invité', 'Présence', 'Nuit en van', 'Dernière réponse'], ...rows.map(row =>
    [row.name, answer(row.attending), answer(row.van), row.updated_at])];
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, '\uFEFF' + lines.map(row => row.map(cell).join(';')).join('\r\n'), { mode: 0o600 });
  console.log(`${rows.length} réponses exportées dans le fichier demandé.`);
} finally { db.close(); }
