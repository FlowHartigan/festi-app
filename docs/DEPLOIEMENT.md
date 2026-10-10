# Déploiement Ubuntu

Les fichiers de `deploy` sont des modèles à adapter au domaine et au serveur. Aucun serveur n'a été configuré à ce stade.

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
```

6. Installer `deploy/festi-app.service` dans `/etc/systemd/system/`, puis exécuter `sudo systemctl daemon-reload` et `sudo systemctl enable --now festi-app`.
7. Adapter le domaine dans `deploy/nginx.conf`, installer la configuration dans les sites Nginx et l'activer. Vérifier `sudo nginx -t` avant de recharger Nginx.
8. Configurer le DNS et un certificat HTTPS pour le domaine avant ouverture aux invités. Le modèle fourni couvre seulement HTTP ; ajouter la configuration TLS et la redirection vers HTTPS avec l'outil de certificat choisi.

Vérifier `curl http://127.0.0.1:3001/api/health`, les quatre URL publiques en accès direct, puis les images et les erreurs API. Les journaux sont disponibles via `journalctl -u festi-app`.

## Sauvegarde et restauration

Utiliser la sauvegarde SQLite pour obtenir un fichier cohérent, même avec le mode WAL. Depuis un compte ayant les droits nécessaires :

```sh
sqlite3 /var/lib/festi-app/festi.sqlite ".backup '/chemin/sauvegardes/festi.sqlite'"
sqlite3 /chemin/sauvegardes/festi.sqlite "PRAGMA integrity_check;"
```

Planifier les sauvegardes selon la fréquence de modification du contenu et conserver une copie hors du serveur. Vérifier une restauration sur une copie avant de considérer la procédure comme validée.

Pour restaurer : arrêter le service, conserver l'ensemble de la base actuelle et de ses éventuels fichiers `-wal` et `-shm` dans un répertoire de secours, installer la sauvegarde à la place de la base, rétablir le propriétaire `festi-app`, puis redémarrer et vérifier l'API. Ne pas associer les anciens fichiers WAL à la base restaurée.

## Mise à jour et retour arrière

Compiler une nouvelle version séparément, sauvegarder SQLite, basculer le lien `current` et redémarrer le service. Vérifier immédiatement `/api/health`, `/api/festival` et les routes du frontend. Revenir au lien précédent seulement si son code reste compatible avec les migrations appliquées ; sinon utiliser une procédure de restauration préparée. La base reste toujours hors des répertoires de version.
