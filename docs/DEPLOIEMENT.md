# Déploiement Ubuntu

## Serveur existant — vérifié le 26 octobre 2026

- Hôte SSH : `vps-328a8329.vps.ovh.ca` (IPv4 constatée : `15.235.100.20`). Utiliser le nom d’hôte.
- Utilisateur : `ubuntu` ; clé locale à sélectionner explicitement : `C:\Users\flori\.ssh\festi-app-vps`.
- Site : `https://dms-app.fr/` ; service `festi-app` constaté actif.
- Version active depuis le 26 octobre 2026 : /var/www/festi-app/releases/20261026-0.2.0, via le lien /var/www/festi-app/current.
- Maestro partage ce serveur sous `/maestro/`. Préserver ses fichiers, ses conteneurs et ses routes Nginx ; ne pas remplacer la configuration Nginx complète par le modèle local.
- L’ancienne cible `187.77.142.73` ne correspond pas à l’adresse actuelle du serveur documenté et ne doit pas servir au déploiement de cette application.

La procédure d’installation ci-dessous reste un modèle pour une nouvelle installation. Pour le serveur existant, inspecter sa configuration effective avant une mise à jour.

### Livraison du 17 octobre 2026

**Correction ultérieure des comptes :** la liste finale de 164 invités remplace l’import initial de 190 décrit ci-dessous. Voir [COMPTES.md](COMPTES.md) pour la source et la sauvegarde de cette synchronisation.

- Version précédente conservée : `/var/www/festi-app/releases/20261010-01`.
- Sauvegarde cohérente SQLite, environnement privé, configuration Nginx et chemin de la version précédente : `/var/backups/festi-app/20261017-accounts-info-140429`, accessible à root seulement. Intégrité SQLite vérifiée avant et après migration.
- Dix migrations appliquées ; 190 comptes importés depuis le fichier privé, sans publication de noms ni de codes dans les fichiers web. Clé serveur créée sur place, conservée dans `/etc/festi-app.env` en mode 600. Fichier d’import temporaire supprimé.
- `TRUST_PROXY=loopback` et remplacement de l’en-tête `X-Forwarded-For` par l’adresse vue par Nginx. Routes Maestro et configuration TLS conservées ; contrôle Nginx réussi.
- Vérifications : lint, typage, compilation, huit tests ; cinq routes publiques et API HTTPS accessibles ; informations, horaires, localisation, plan et formulaire Compte contrôlés sur mobile/paysage. HTML de l’accueil Maestro identique avant et après. Aucun compte réel utilisé pour les vérifications navigateur en production.
- Retour arrière : arrêter le service, préserver la base courante et ses WAL, restaurer la sauvegarde cohérente et l’environnement privé, puis rétablir le lien vers la version précédente et redémarrer. Vérifier les données avant toute restauration ; cette opération peut supprimer les réponses reçues depuis la sauvegarde.

## Installation

1. Installer Node.js 24.14 ou supérieur dans la branche 24, Nginx et le client `sqlite3` sur Ubuntu. Vérifier le chemin de Node avec `command -v node` et adapter `ExecStart` si nécessaire.
2. Créer un utilisateur système `festi-app`, sans connexion interactive. Créer `/var/lib/festi-app` appartenant à cet utilisateur et accessible uniquement à son groupe (mode 750).
3. Placer une version du projet dans `/var/www/festi-app/releases/<version>`, puis lancer `npm ci` et `npm run build`. Conserver les dépendances de production nécessaires à l'API ; après compilation, `npm prune --omit=dev` est possible.
4. Faire pointer `/var/www/festi-app/current` vers cette version. Node doit pouvoir lire le code ; Nginx doit pouvoir lire `dist` et traverser ses répertoires parents.
5. Créer `/etc/festi-app.env`, lisible par root seulement (mode 600). systemd le lit avant de changer d'utilisateur :

```dotenv
HOST=127.0.0.1
PORT=3001
DATABASE_PATH=/var/lib/festi-app/festi.sqlite
ACCOUNT_SECRET=<cle-aleatoire-stable-au-moins-32-caracteres>
TRUST_PROXY=loopback
```

6. Installer `deploy/festi-app.service` dans `/etc/systemd/system/`, puis exécuter `sudo systemctl daemon-reload` et `sudo systemctl enable --now festi-app`.
7. Adapter le domaine dans `deploy/nginx.conf`, installer la configuration dans les sites Nginx et l'activer. Vérifier `sudo nginx -t` avant de recharger Nginx.
8. Configurer le DNS et un certificat HTTPS pour le domaine avant ouverture aux invités. Le modèle fourni couvre seulement HTTP ; ajouter la configuration TLS et la redirection vers HTTPS avec l'outil de certificat choisi.

Importer les comptes avec la même clé et la même base que le service, selon [COMPTES.md](COMPTES.md). Sans import, aucun code n’est accepté. La clé est obligatoire pour démarrer le service en production.

Vérifier `curl http://127.0.0.1:3001/api/health`, les cinq URL en accès direct, puis les images et les erreurs API. Tester connexion, réponse, reconnexion et déconnexion sur HTTPS. Les journaux sont disponibles via `journalctl -u festi-app`.

## Sauvegarde et restauration

Utiliser la sauvegarde SQLite pour obtenir un fichier cohérent, même avec le mode WAL. Depuis un compte ayant les droits nécessaires :

```sh
sqlite3 /var/lib/festi-app/festi.sqlite ".backup '/chemin/sauvegardes/festi.sqlite'"
sqlite3 /chemin/sauvegardes/festi.sqlite "PRAGMA integrity_check;"
```

Planifier les sauvegardes selon la fréquence de modification du contenu et conserver une copie hors du serveur. Sauvegarder également `ACCOUNT_SECRET` dans un emplacement sécurisé distinct de la base : les empreintes des codes en dépendent. Vérifier une restauration sur une copie avant de considérer la procédure comme validée.

Pour restaurer : arrêter le service, conserver l'ensemble de la base actuelle et de ses éventuels fichiers `-wal` et `-shm` dans un répertoire de secours, installer la sauvegarde à la place de la base, rétablir le propriétaire `festi-app`, puis redémarrer et vérifier l'API. Ne pas associer les anciens fichiers WAL à la base restaurée.

## Mise à jour et retour arrière

Compiler une nouvelle version séparément, sauvegarder SQLite, basculer le lien `current` et redémarrer le service. Vérifier immédiatement `/api/health`, `/api/festival` et les routes du frontend. Revenir au lien précédent seulement si son code reste compatible avec les migrations appliquées ; sinon utiliser une procédure de restauration préparée. La base reste toujours hors des répertoires de version.

## Livraison de la refonte 0.2.0

La refonte ne modifie aucun module serveur, aucune migration et aucune dépendance. Compiler depuis le commit validé et livrer dist, dist-server, package.json et package-lock.json dans une nouvelle release. Comparer dist-server à la release active avant la bascule : toute différence doit être examinée, pas déployée implicitement. Les dépendances de production existantes peuvent être recopiées puisque leurs versions sont inchangées.

Avant la bascule, créer une sauvegarde cohérente SQLite avec .backup dans un répertoire root en mode 700 et vérifier son intégrité. Conserver le chemin de la release précédente et une copie protégée de la configuration. Contrôler aussi la page Maestro, qui partage le serveur.

Basculer atomiquement le lien current, redémarrer festi-app et vérifier la santé, les cinq routes et la police locale via HTTPS. Pour cette livraison sans migration, un retour au lien précédent puis un redémarrage suffisent ; ne pas restaurer la base, ce qui effacerait des réponses reçues entre-temps. La base et la clé restent dans leurs chemins persistants.

### Livraison 0.2.0 — 26 octobre 2026

- Source : commit 8a0873b521f25768e07a5c6c663fbef136f65be6, PR de design #2 après remise à niveau du dépôt #1.
- Release active : /var/www/festi-app/releases/20261026-0.2.0. Précédente conservée : /var/www/festi-app/releases/20261017-accounts-info.
- Sauvegardes cohérentes vérifiées : /var/backups/festi-app/20261026-0.2.0/festi.sqlite et festi-before-switch.sqlite. Configuration privée et chemin précédent conservés dans ce répertoire root en mode 700.
- Les seuls écarts de compilation serveur étaient des fins de ligne CRLF. Après vérification, les modules de production ont été recopiés à l’identique ; aucune migration ni réimport de comptes.
- Contrôles après bascule : service actif, santé locale et HTTPS, cinq routes et police locale, intégrité SQLite, 10 migrations et 164 comptes ; empreinte de la page Maestro inchangée.
- Contrôles Chromium HTTPS : cinq pages mobiles, palette et police chargées, aucun débordement horizontal ni exception JavaScript. Aucun compte réel utilisé.
- Retour arrière compatible : rétablir atomiquement current vers la release du 17 octobre et redémarrer festi-app ; conserver la base courante et ses réponses.
### Livraison 0.2.1 — 27 octobre 2026

- Source : tag v0.2.1, commit a04b74e35b535ad8a108a88e4b14363f37c86113, PR #4.
- Release active : /var/www/festi-app/releases/20261026-0.2.1. Le nom conserve la date de préparation ; la bascule a eu lieu le 27 octobre.
- Précédente conservée : /var/www/festi-app/releases/20261026-0.2.0.
- Sauvegarde cohérente vérifiée : /var/backups/festi-app/20261026-0.2.1/festi.sqlite ; configuration protégée et chemin précédent dans le même répertoire root en mode 700.
- Modules serveur conservés à l’identique après comparaison ; aucune migration ni réimport.
- Vérifications après bascule : Nginx valide, santé locale et HTTPS, cinq routes, police locale, intégrité SQLite, 164 comptes, 10 migrations et empreinte Maestro inchangée.
- Chromium en 390×844 : cinq réponses HTTP 200, aucune exception JavaScript ni débordement horizontal, destination active correcte. Aucun compte réel utilisé.
- Retour arrière : rétablir atomiquement current vers la release 0.2.0 et redémarrer festi-app ; conserver la base courante et ses réponses.
