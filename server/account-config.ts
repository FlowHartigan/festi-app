import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export function accountSecret() {
  const configured = process.env.ACCOUNT_SECRET;
  if (configured) {
    if (configured.length < 32) throw new Error('ACCOUNT_SECRET doit contenir au moins 32 caractères.');
    return configured;
  }
  if (process.env.NODE_ENV === 'production') throw new Error('ACCOUNT_SECRET est obligatoire en production.');
  const path = resolve(dirname(process.env.DATABASE_PATH ?? '.data/festi.sqlite'), 'account.key');
  mkdirSync(dirname(path), { recursive: true });
  try { writeFileSync(path, randomBytes(32).toString('hex'), { flag: 'wx', mode: 0o600 }); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
  const secret = readFileSync(path, 'utf8').trim();
  if (secret.length < 32) throw new Error('La clé locale des comptes est invalide.');
  return secret;
}
