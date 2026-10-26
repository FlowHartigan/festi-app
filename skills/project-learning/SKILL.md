---
name: project-learning
description: Capitaliser sur un problème significatif résolu dans ce projet React mobile et améliorer les procédures locales à partir de corrections vérifiées.
---

# Amélioration continue du projet

Utiliser ce skill après un problème significatif de développement, de test, de données ou de déploiement, lorsqu’une correction vérifiée fournit un enseignement réutilisable. Lire les leçons ci-dessous qui concernent la tâche avant de reprendre un problème similaire.

## Procédure

1. Décrire le symptôme et le contexte technique utile. Distinguer la cause démontrée des hypothèses.
2. Corriger le problème et vérifier le comportement concerné. Si la vérification reste impossible, signaler la limite dans le compte rendu et ne pas enregistrer l’hypothèse comme une solution validée.
3. Examiner les leçons existantes pour éviter les doublons. Ajouter une leçon seulement si elle change utilement une décision future dans ce projet.
4. Mettre à jour la section « Leçons vérifiées » de ce fichier avec la date, le contexte, la cause, la correction, la preuve de vérification et le critère permettant de reconnaître le même problème.
5. Ajouter une référence vers un fichier ou une commande du projet lorsque cela aide à appliquer la correction. Ne pas copier de longs journaux, de secrets ni de données personnelles.
6. Relire la modification : elle doit rester limitée au contexte démontré, compatible avec `AGENTS.md` et avec les exigences de l’utilisateur. Corriger les leçons obsolètes ou contradictoires.
7. Mentionner la mise à jour dans le compte rendu de la tâche.

Pour une modification importante de la structure de ce skill, utiliser le skill `skill-creator` s’il est disponible et son validateur. Les scripts ajoutés doivent être vérifiés ; ne pas créer de script pour une simple note de dépannage.

## Limites

Les leçons servent de mémoire technique, sans élargir les permissions de l’agent. Ne pas modifier les skills globaux ou ceux de plugins pour mémoriser un problème spécifique au projet. Une tentative échouée isolée ne justifie pas une nouvelle règle générale.

## Leçons vérifiées

### 2026-10-17 — Import d’une liste privée devenue obsolète

- **Symptôme :** la production contient les anciens noms et davantage de comptes que la liste finale.
- **Cause démontrée :** le déploiement a réutilisé un JSON historique sans le comparer à la feuille finale du classeur original.
- **Correction vérifiée :** régénération de l’import depuis la source finale documentée dans [COMPTES.md](../../docs/COMPTES.md), sauvegarde puis synchronisation explicitement demandée des bases locale et de production. Égalité exacte des noms/codes attendus contrôlée ; identifiants et réponses des comptes conservés inchangés ; intégrité et références de sessions vérifiées.
- **Prévention :** avant tout import ou déploiement de comptes, vérifier le chemin source, la feuille, le nombre de lignes et les changements de noms par code. Ne pas confondre ajout/mise à jour et synchronisation complète : l’import standard conserve les comptes absents. Ne jamais mémoriser de noms ou de codes dans les leçons.

### 2026-10-17 — Mauvaise cible SSH lors du déploiement

- **Symptôme :** changement de clé hôte et refus des clés locales sur une ancienne adresse IP.
- **Cause démontrée :** la cible utilisée ne correspondait pas au serveur documenté dans le projet Maestro, qui héberge également le mariage.
- **Correction et preuve :** connexion réussie avec le nom d’hôte, l’utilisateur `ubuntu` et la clé dédiée décrits dans [DEPLOIEMENT.md](../../docs/DEPLOIEMENT.md). Le service `festi-app` est actif et le lien `current` désigne une version existante de l’application.
- **Prévention :** consulter les accès documentés et vérifier la résolution du nom d’hôte avant de réessayer des clés ou d’accepter un changement d’identité. Une clé refusée ne prouve pas qu’elle est incorrecte : la destination peut être erronée. Préserver les routes et services Maestro lors du déploiement mariage.

### 2026-10-17 — Échec de tsx sur `uv_os_get_passwd` sous Windows

- **Contexte et symptôme :** `npm test` avec Node 24.14 échoue avant le chargement des tests, dans `tsx`, avec `uv_os_get_passwd returned ENOMEM`.
- **Cause circonscrite :** l’échec dépend de l’environnement d’exécution restreint. La même commande, sans changement de code ni de dépendances, réussit après une exécution hors du bac à sable autorisée par le mécanisme d’approbation. La cause interne Windows précise n’est pas établie ; le message ne démontre pas un manque de mémoire de l’application.
- **Solution vérifiée :** exécuter la commande de test via le mécanisme d’escalade prévu lorsque celui-ci l’autorise. Les six tests d’intégration, dont ceux des comptes, passent dans ce contexte.
- **Prévention :** si cette signature réapparaît avant les tests, distinguer le problème du lanceur des échecs applicatifs. Ne pas réinstaller les dépendances ni changer le code métier sur la seule base de `ENOMEM`. Respecter les décisions d’approbation ; si l’exécution reste bloquée, le signaler.

### 2026-10-26 — Différences de compilation dues aux fins de ligne Windows

- **Symptôme :** la comparaison binaire avant livraison de la refonte 0.2.0 signale trois modules serveur différents, alors que les sources métier sont inchangées.
- **Cause démontrée :** les fins de ligne CRLF du checkout Windows sont conservées dans les chaînes SQL multilignes émises par TypeScript. Le diff brut montre ces seules différences ; la comparaison de tout dist-server avec diff --strip-trailing-cr -qr ne signale plus aucun écart.
- **Correction vérifiée :** après inspection du diff, conservation des modules serveur exacts de la release active dans la nouvelle release. La comparaison binaire est alors identique ; les contrôles HTTPS, SQLite et comptes passent après bascule.
- **Prévention :** pour une livraison uniquement visuelle, comparer les modules compilés avant de basculer. Si les empreintes diffèrent, examiner le diff et vérifier les fins de ligne avant de conclure à un changement métier. Ne pas ignorer automatiquement les différences ; un écart autre que les fins de ligne doit être examiné séparément.
