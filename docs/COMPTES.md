# Comptes des invités

## Parcours

`/compte` est le cinquième onglet du dock. Chaque code de quatre chiffres identifie une personne. Après connexion, deux boutons ouvrent des rubriques distinctes : **Ma présence** (`?rubrique=presence`) et **Ma nuit en van** (`?rubrique=van`). Chacun affiche l’état de la réponse enregistrée et ouvre son propre formulaire, avec retour vers le compte.

La présence s’enregistre indépendamment du van : une présence confirmée peut donc conserver `van = null` jusqu’à la réponse à cette seconde question. La rubrique van invite d’abord à confirmer la présence si nécessaire. Une absence enregistre automatiquement `van = false`. Si la personne revient sur son absence pour confirmer sa présence, le van repasse « À confirmer ». Confirmer de nouveau une présence déjà enregistrée préserve le choix de van existant. L’invité peut revenir modifier ses choix et se déconnecter.

Les erreurs réseau préservent les choix affichés. Une session expirée demande une reconnexion ; seules les réponses déjà enregistrées sont alors rechargées.

## Import privé

La source actuelle est le classeur original `C:\Users\flori\iCloudDrive\Documents\Florian\Important\Mariage\mariage-2027.xlsx`, feuille `liste_invité_final` (164 invités au 17 octobre 2026). Les deux colonnes prénom/nom et la colonne « Code accès » produisent `resources/private/invites.json`. Le classeur et sa conversion restent hors de Git et du frontend. La copie historique `resources/private/mariage-2027.xlsx`, feuille `liste_invites`, contient une ancienne liste et ne doit plus alimenter les imports.

Le 17 octobre 2026, les bases locale et de production ont été alignées sur les 164 codes de la liste finale : 22 libellés actualisés, 26 comptes absents retirés avec leurs sessions. Les identifiants, codes, réponses et dates des comptes conservés ont été comparés avant/après dans la transaction et sont inchangés. Sauvegarde production : `/var/backups/festi-app/before-final-guests-20261017-140755.sqlite`. Le fichier privé `codes-acces.md` est également actualisé. L’import standard ci-dessous ne supprime toujours pas les comptes absents ; une nouvelle synchronisation complète doit être explicitement demandée et précédée d’une sauvegarde.

Format attendu, avec données fictives :

```json
[{ "name": "Invité Exemple", "code": "0123" }]
```

Conserver les codes sous forme de chaînes pour préserver les zéros initiaux. Tous les codes doivent être uniques. L’import valide l’ensemble avant toute écriture et s’exécute dans une transaction.

```sh
npm run guests:import -- resources/private/invites.json
```

Un réimport du même code met à jour le nom et conserve les réponses. Il ne supprime pas les personnes absentes du fichier. Un changement de code n’est pas une opération de rotation : il créerait un nouveau compte. Une suppression ou une rotation exige une opération explicite sur le compte existant et la révocation de ses sessions.

En production, après compilation, exécuter `node --env-file=/chemin/config.env dist-server/server/import-guests.js /chemin/prive/invites.json` avec la même configuration et les droits d’accès à la base que le service. Le fichier doit être stocké hors du répertoire servi par Nginx. Supprimer les copies temporaires d’import devenues inutiles selon les besoins d’exploitation.

## Récupérer les réponses

```sh
npm run guests:export
# Ou après compilation, avec la configuration de production :
node --env-file=/chemin/config.env dist-server/server/export-responses.js /chemin/prive/reponses.csv
```

L’export remplace le fichier de destination. Il contient nom, présence, nuit en van et date de dernière réponse. Les non-répondants sont identifiés par « Sans réponse ». Aucun code ni jeton de session n’est exporté. Le CSV est encodé en UTF-8 avec BOM et séparateur point-virgule ; les cellules pouvant être interprétées comme des formules sont neutralisées.

## Stockage et protection

La migration 3 crée `guests`, `account_sessions` et `account_attempts`. La migration 4 adapte les contraintes de `guests` pour permettre une présence confirmée avec un van encore sans réponse. Elle préserve les identifiants, réponses et sessions existantes, puis vérifie les références. Les réponses sont liées à l’identité obtenue depuis la session côté serveur. Le navigateur ne choisit jamais l’identifiant d’un invité. L’API publique `/api/festival` reste indépendante des données personnelles.

- Codes : empreinte HMAC-SHA256 avec une clé secrète serveur. Aucun code en clair dans SQLite.
- Sessions : jetons aléatoires de 32 octets, empreintes SHA-256 stockées en base, expiration après sept jours. La reconnexion remplace la session du navigateur ; la déconnexion la révoque.
- Cookie : `HttpOnly`, `SameSite=Strict`, chemin `/api/account`, `Secure` en production. Pas de jeton dans le stockage JavaScript du navigateur.
- Écritures : en-tête `X-Account-Request: 1` requis, requêtes déclarées cross-site refusées et aucun accès CORS autorisé.
- Essais : cinq échecs par adresse sur quinze minutes, plafond global de cinquante échecs sur la même durée. Les compteurs sont persistants ; les adresses sont enregistrées sous forme d’empreintes HMAC, et les entrées expirées sont purgées lors d’une connexion. Les connexions réussies ne consomment pas ce quota.
- Le code à quatre chiffres reste un secret court : ne pas ajouter de données sensibles à cet espace sans réévaluer ce mode d’accès.

Routes : `POST /api/account/login`, `GET /api/account`, `PUT /api/account/presence` (champ `attending`), `PUT /api/account/van` (champ `van`), `POST /api/account/logout`. La route combinée `PUT /api/account/response` reste disponible pour compatibilité. Les réponses de compte sont marquées `Cache-Control: no-store`.

## Configuration et sauvegarde

`ACCOUNT_SECRET` doit être une valeur aléatoire d’au moins 32 caractères, stable dans le temps. Elle est obligatoire avec `NODE_ENV=production`. Pour la générer : `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Conserver la valeur dans la configuration privée du serveur, jamais dans Git.

En développement, si la variable est absente, une clé est créée dans `account.key`, à côté de la base (par défaut `.data/account.key`). La conserver avec les sauvegardes locales. Changer ou perdre la clé empêche de retrouver les comptes par leur code : un réimport avec une autre clé créerait de nouveaux comptes. Sauvegarder la base **et** la clé séparément, avec des accès limités.

Avec le Nginx local fourni : définir `TRUST_PROXY=loopback`, laisser Node écouter sur `127.0.0.1` et utiliser HTTPS. Nginx remplace les en-têtes de provenance ; ne pas activer cette confiance sans le proxy correspondant. La configuration systemd fixe déjà `NODE_ENV=production`.

Références consultées : [proxy Express](https://expressjs.com/en/guide/behind-proxies/), [cookies HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie), [crypto Node.js](https://nodejs.org/docs/latest-v24.x/api/crypto.html).
