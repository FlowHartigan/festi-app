import { readFileSync } from 'node:fs';
import { openDatabase } from './database.js';
import { accountSecret } from './account-config.js';
import { importGuests } from './account-database.js';

const path = process.argv[2];
if (!path) throw new Error('Usage : npm run guests:import -- chemin/vers/invites.json');
const secret = accountSecret();
const db = openDatabase();
try {
  let input: unknown;
  try { input = JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, '')); }
  catch { throw new Error('Le fichier doit être un document JSON lisible.'); }
  console.log(`${importGuests(db, input, secret)} comptes importés. Les réponses existantes sont conservées.`);
} finally { db.close(); }
