# Architecture de Festi App

## Choix de départ

Un dépôt unique contient React + TypeScript + Vite, une API Express et une base SQLite locale. Cette architecture convient à une petite application hébergée sur une seule machine Ubuntu. Elle évite de multiplier les services et reste évolutive si le besoin change.

L'accès SQLite utilise le module intégré `node:sqlite`, encore signalé expérimental par Node 24. Le projet fixe cette branche de Node et teste les migrations et la persistance ; toute mise à niveau du runtime doit repasser ces vérifications. Les lectures synchrones restent adaptées au petit document de contenu actuel.

Le navigateur demande `GET /api/festival`. Le serveur lit SQLite et valide le contenu avec le schéma Zod de `shared/festival.ts`. React valide aussi la réponse avant de l'afficher. Aucun accès à la base ne part du navigateur.

## Organisation

| Répertoire | Responsabilité |
| --- | --- |
| `src/pages` | Accueil, Line-up, Plan et Informations |
| `src/components` | Structure commune et dock |
| `src/lib` | Chargement des données |
| `shared` | Contrat de données partagé |
| `server` | API, migration initiale et données de départ |
| `assets` | Fichiers sources fournis : logo, plan et futurs visuels |
| `public/assets` | Versions des visuels utilisées par le navigateur |
| `deploy` | Modèles Nginx et systemd pour Ubuntu |
| `tests` | Vérifications d'intégration API et persistance |
| `skills` | Instructions et contexte du projet |

Les quatre URL sont `/`, `/line-up`, `/plan` et `/informations`. La navigation conserve la structure commune. Une erreur de chargement propose un rechargement ; une URL inconnue affiche une page dédiée.

## Données et migrations

Pour ce premier périmètre de consultation, `festival_content` contient un document JSON validé, identifié par `id = 1`. Le programme, les informations et les points du plan font partie du même contenu. La table `migrations` mémorise les versions appliquées. La migration initiale est transactionnelle et ne réinitialise jamais une base existante au redémarrage.

`server/seed.ts` fournit uniquement le contenu initial. Modifier ce fichier ne met pas à jour une base déjà créée. L'édition des données persistées devra passer par un outil explicite ou une future interface d'administration, avec validation et sauvegarde. Il n'existe actuellement aucune route publique d'écriture.

La migration 2 ajoute les activités de 17 h à 19 h et le DJ set de 19 h à 20 h, confirmés par les mariés. Elle conserve le contenu existant et évite les doublons par identifiant. Les étapes acceptent une heure de fin facultative et se déplient dans le planning pour afficher description et lieu.

Des tables dédiées deviendront pertinentes avec des inscriptions, des droits ou une édition concurrente. PostgreSQL sera à considérer si plusieurs serveurs doivent écrire dans la même base. Ces fonctionnalités ne font pas partie du socle actuel.

La date du mariage est une date civile ; l'affichage utilise `Europe/Paris`. Le programme public contient seulement les moments confirmés pour les invités. La cérémonie civile en petit comité n'est pas ajoutée au programme public.

## Plan et identité

Le logo PNG est un rendu du PDF fourni. Les originaux du logo et du plan sont conservés dans `assets`.

Le plan affiché est une illustration SVG React dans `src/components/FestivalMapArtwork.tsx`, reconstruite d’après le plan source dans un repère de 1536 × 1024. Arbres, reliefs, chemins, bâtiments, tente, mobilier, véhicules et étang sont des formes vectorielles ; aucun fond bitmap n’est utilisé. Les motifs et symboles SVG mutualisent les éléments répétés. Les onze espaces identifiés sur le document sont des groupes sélectionnables au toucher, à la souris et au clavier (Entrée/Espace), avec une liste HTML alternative. Le zoom de 100 à 300 % utilise un conteneur défilant sans agrandir la page.

Les identifiants de `mapSpaces` relient les zones aux éventuelles descriptions de `places` fournies par l’API. Les descriptions absentes restent explicitement à compléter. Les points supplémentaires configurés dans l’API conservent leurs coordonnées en pourcentage et leur bouton superposé. La reconstruction graphique ne modifie pas la base de données.

## Exploitation

En développement, Vite transmet `/api` au serveur local. En production, Nginx sert `dist` et transmet `/api` à Node sur l'interface locale. systemd supervise l'API. La base est conservée dans `/var/lib/festi-app`, hors du répertoire des versions déployées.

Le démarrage applique les migrations manquantes. Avant une nouvelle migration en production, sauvegarder la base et vérifier sa compatibilité avec le retour à la version précédente. Les modèles fournis ne constituent pas un déploiement exécuté.
