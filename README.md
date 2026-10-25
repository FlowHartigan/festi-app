# Once Upon a Fest — Festi App

Application web React pensée pour mobile : Accueil, Line-up, Plan, Informations et Compte, accessibles par un dock inspiré d'iOS. API Node.js et petite base SQLite persistante.

## Démarrer

Prérequis : Node.js 24.14 ou supérieur dans la branche 24, npm.

```sh
npm ci
npm run dev
```

Ouvrir http://localhost:5173. L'API écoute sur `127.0.0.1:3001`. La base `.data/festi.sqlite` est créée au premier démarrage.

Copier `.env.example` vers `.env` pour modifier la configuration. Si le port de l'API change, adapter aussi le proxy dans `vite.config.ts`.

| Variable | Défaut | Usage |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | Interface d'écoute de l'API |
| `PORT` | `3001` | Port de l'API |
| `DATABASE_PATH` | `.data/festi.sqlite` | Chemin de la base persistante |

## Vérifier et compiler

```sh
npm run lint
npm test
npm run build
```

La compilation vérifie TypeScript puis produit `dist` (frontend) et `dist-server` (API). `npm start` lance l'API compilée ; le frontend doit être servi séparément, par exemple via Nginx. `npm run db:migrate` applique les migrations sans démarrer l'API.

## Contenu et suite

Les données initiales sont dans `server/seed.ts` ; elles sont insérées seulement lors de la création de la base. Le programme dépliable comprend les trois moments confirmés. Le plan SVG propose onze espaces sélectionnables et un zoom ; leurs descriptions restent à compléter.

L’onglet Compte permet à chaque invité d’entrer son code personnel à quatre chiffres, puis d’enregistrer ou de modifier sa présence et son intention de dormir en van. Les comptes doivent être importés côté serveur. Il n’existe pas d’administration web.

```sh
npm run guests:import -- resources/private/invites.json
npm run guests:export
```

L’export crée `resources/private/reponses.csv`, lisible dans un tableur. Il contient les noms et réponses, sans les codes. Ces fichiers sont confidentiels et exclus de Git. Voir [la gestion des comptes](docs/COMPTES.md) pour le format d’import, les sessions et la configuration de production.

Voir [l'architecture](docs/ARCHITECTURE.md), [le contexte produit](docs/CONTEXTE-PRODUIT.md) et [le déploiement Ubuntu](docs/DEPLOIEMENT.md).
