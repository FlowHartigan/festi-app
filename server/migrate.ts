import { openDatabase } from './database.js';
const db = openDatabase();
db.close();
console.log('Migrations appliquées. Les données existantes sont conservées.');
