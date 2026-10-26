# Contexte produit — Once Upon a Fest

## Objectif

Créer une application web destinée aux invités du mariage de Florian et Charline, Once Upon a Fest. Elle doit être facile à utiliser sur téléphone et faire ressentir l’ambiance d’un mariage festival / guinguette.

Cette note rassemble le périmètre initial demandé par Florian. Le contexte du mariage et les décisions concernant l’événement sont décrits dans [le skill mariage](../skills/mariage/SKILL.md). Les consignes techniques sont dans [AGENTS.md](../AGENTS.md).

## Direction de l’interface

**Demande confirmée : une application web dans le style d’une application iOS.**

Traduire cette intention par une interface mobile soignée, une hiérarchie claire, des interactions tactiles confortables et une navigation familière. La réalisation reste une application web React accessible dans un navigateur.

Le style iOS et l’identité festival doivent fonctionner ensemble : l’ergonomie évoque une application iOS, tandis que les couleurs, les textes et les éléments visuels reflètent Once Upon a Fest. Respecter le logo choisi et harmoniser la palette et la typographie avec lui.

Les détails visuels — couleurs précises, formes du dock, icônes, transparence et animations — seront proposés lors de la conception. Ils ne sont pas encore validés.

## Navigation confirmée

L’application comporte **cinq pages principales**, accessibles par un **dock en bas de l’écran**.

| Position | Page | Fonction principale |
|---|---|---|
| 1 | Accueil | Présenter le festival, son logo et sa date |
| 2 | Line-up | Découvrir les différents moments du festival |
| 3 | Plan | Explorer le plan interactif du mariage |
| 4 | Informations | Consulter les informations relatives au mariage |
| 5 | Compte | Répondre pour sa présence et son couchage en van |

Principes de réalisation du dock :

- Le rendre accessible sur chacune des cinq pages.
- Identifier clairement la page active.
- Associer une icône et un libellé compréhensible à chaque destination.
- Réserver suffisamment d’espace pour qu’il ne masque pas le contenu.
- Tenir compte de la zone de sécurité en bas des téléphones.

## Page 1 — Accueil

### Contenu demandé

- Le logo du mariage.
- La date du festival.

Le contexte mariage donne le nom **Once Upon a Fest** et la date du **samedi 4 septembre 2027**. Utiliser le fichier [logo-mariage.pdf](../assets/logo-mariage.pdf) comme source du logo.

La priorité de cet écran est de faire reconnaître immédiatement l’événement et sa date. Tout contenu supplémentaire reste à décider ; un compte à rebours ou des raccourcis ne font pas partie de la demande initiale.

## Page 2 — Line-up

### Contenu demandé

Présenter les différents moments du mariage comme le line-up d’un festival.

### Interprétation de réalisation

Organiser les moments dans un ordre chronologique lisible sur téléphone, avec les heures dans une colonne à gauche et les étapes à droite, comme un planning de festival. Chaque étape est cliquable : elle déplie sa description et son lieu sous le titre, puis se replie au second clic. Le toucher et le clavier doivent fonctionner. Plusieurs étapes peuvent rester ouvertes pour consulter le programme.

La référence visuelle fournie inspire la structure du planning uniquement. Appliquer la direction du faire-part validée : fond crème, encre olive, accents safran et corail, titres rétro et texte système. Ne pas reprendre les couleurs violettes de la référence. Les heures viennent du programme fourni ; ne pas ajouter de créneaux fictifs pour remplir la liste.

Le traitement visuel doit évoquer un programme de festival. Il n’impose pas que chaque moment soit un concert ou un artiste.

### Informations à compléter

Programme public confirmé :

- 16 h 30 : début des festivités à La Source du Buron.
- 17 h à 19 h : activités, avec des jeux en bois dans l’espace activités.
- 19 h à 20 h : DJ set années 2000 sur la scène.

- La liste des moments à afficher aux invités.
- Les horaires, lieux et descriptions de chaque moment.
- La présentation éventuelle des différentes catégories de moments.

Respecter les repères confirmés du skill mariage. La cérémonie civile à Issoire est en comité restreint : ne pas l’afficher comme une invitation ouverte à tous. Ne pas inventer d’animations ni d’horaires pour compléter la page.

## Page 3 — Plan du festival

### Fonction demandée

Créer une carte interactive à partir du [plan-mariage.png](../assets/plan-mariage.png) présent dans le projet. L’utilisateur doit pouvoir cliquer ou toucher des éléments du plan.

### Interprétation de réalisation

Recréer le plan fourni en éléments web vectoriels (SVG), en conservant la disposition et en se rapprochant du graphisme illustré original. Les arbres, chemins, bâtiments, tente, véhicules et étang doivent être de vrais éléments web, et non une image de fond avec des repères. Les espaces représentés peuvent être sélectionnés ; leurs informations détaillées seront complétées ensuite. Un zoom et une liste de lieux facilitent l’utilisation sur téléphone.

Avant l’implémentation, inspecter le fichier pour déterminer son format, sa lisibilité et la manière de l’intégrer. Préserver la position des espaces représentés ; ne pas inventer de coordonnées ou de zones à partir du seul contexte du mariage.

### Informations à compléter

- Les zones et points qui doivent être interactifs.
- Le nom et les informations associés à chacun.
- L’intérêt d’un zoom et d’un déplacement du plan sur petit écran.

Les interactions doivent fonctionner au toucher et au clavier. Prévoir une alternative lisible aux seuls repères visuels, par exemple une liste des lieux.

## Page 4 — Informations

### Contenu demandé

Rassembler les informations utiles relatives au mariage dans six catégories dépliables, dans cet ordre : **Horaires**, **Petits bouts**, **Restauration**, **Hébergement**, **Localisation**, **Infos divers**. Toutes sont repliées à l’ouverture ; plusieurs peuvent rester ouvertes simultanément. Le toucher et le clavier doivent permettre de les ouvrir et de les fermer.

La rubrique Horaires présente les repères pratiques confirmés dans un langage festival : ouverture à 16 h 30 le samedi, coupure du son à 4 h du matin et départ du site à 5 h dans la nuit du samedi au dimanche. Aucun programme n’est prévu le dimanche. Le détail des activités reste dans le Line-up. Les informations existantes sur les vans sont rangées dans Hébergement, le lieu dans Localisation et l’esprit du festival dans Infos divers. Les rubriques encore sans contenu affichent une indication d’informations à venir, sans inventer de consignes pour les enfants, de menus ni de modalités d’hébergement.

### Contenu à définir

La rubrique « Petits bouts » précise que les enfants ne peuvent pas être accueillis pour des raisons d’organisation et de contraintes liées au lieu. Le texte exprime les regrets des mariés et remercie les invités de leur compréhension. Aucune exception ni solution de garde n’est définie.

La catégorie Hébergement contient deux sous-rubriques dépliables : **Venir en van** et **Dormir à proximité**. La première conserve les informations confirmées sur l’espace vans. La seconde présente dix hébergements autour de Saint-Poncy, avec nom, type, commune et lien direct, ouvrant dans un nouvel onglet. Les adresses sont vérifiées mais ne constituent pas des disponibilités confirmées pour le mariage ni des réservations. Voir [les sources de la sélection](HEBERGEMENTS.md).

Le contenu détaillé des six rubriques reste à préciser. L’accès au lieu, les possibilités de dormir sur place et les conseils pratiques sont des pistes cohérentes avec le contexte mariage, à sélectionner selon les besoins réels des invités.

Présenter seulement les informations disponibles et distinguer les réservations confirmées des options envisagées. Ne pas créer de contacts, de modalités de transport ou de consignes qui n’ont pas été fournis.

## Périmètre initial

Le périmètre confirmé porte sur les cinq pages, leur navigation par dock, le style iOS, le thème mariage festival, le plan interactif et l’espace personnel.

Depuis le 17 octobre 2026, l’onglet Compte et l’accès par code personnel à quatre chiffres sont demandés. Chaque invité confirme individuellement sa présence et indique s’il compte dormir dans un van sur l’espace dédié. Le classeur privé fournit les codes individuels ; les noms et codes ne doivent jamais être intégrés aux fichiers publics.

L’accueil du compte propose deux boutons distincts : « Ma présence » et « Ma nuit en van ». Chaque bouton ouvre son formulaire et son enregistrement séparé ; la présence peut être confirmée sans répondre immédiatement pour le van. Les deux boutons indiquent l’état des réponses et permettent de les modifier. La rubrique van demande d’abord de confirmer sa présence.

Les réponses sont modifiables et persistantes. Une absence implique l’absence de couchage en van. Tant qu’un invité n’a pas enregistré sa réponse, il reste « sans réponse ». Le choix du van indique une intention de couchage, sans promettre une réservation ni une capacité qui n’a pas été définie. L’organisateur peut récupérer les réponses par export local.

Un espace d’administration web, les notifications, le mode hors ligne et l’installation sur l’écran d’accueil restent des décisions distinctes.

La base de données et l’hébergement Linux font partie du cadre technique existant. Le choix des données à stocker et leur mode de mise à jour se fera à partir du contenu et des besoins de gestion réellement définis.

## Critères d’acceptation de la première version

- Les cinq pages sont accessibles depuis le dock et la destination active est identifiable.
- Le code personnel ouvre uniquement les réponses de l’invité concerné. La présence et le van sont enregistrés, restent disponibles après reconnexion et peuvent être modifiés.
- L’accueil montre le logo choisi et la date correcte du festival.
- Le line-up présente les moments fournis de façon lisible et respecte leurs conditions d’accès.
- Le plan reprend le document fourni et les zones définies réagissent à la sélection en donnant accès à leurs informations.
- La page Informations rassemble le contenu validé pour les invités.
- L’interface reste lisible et utilisable sur téléphone, sans contenu caché par le dock.
- Les textes et le design respectent l’identité du mariage et les indications du skill mariage.

## Évolution de cette note

La rubrique « Localisation » présente l’adresse de La Source du Buron (Domaine de Luc, 15500 Saint-Poncy), trois accès directs à Google Maps, Plans et Waze, ainsi qu’une carte Google Maps interactive.

Mettre à jour cette note au fil des décisions de Florian et Charline. Une nouvelle instruction explicite remplace une décision antérieure ; conserver une distinction claire entre demandes confirmées, propositions de réalisation et informations encore manquantes.

## Direction artistique validée — 26 octobre 2026

Les maquettes inspirées du faire-part remplacent la charte blanche initiale. L’accueil utilise un titre typographique rétro et quelques motifs floraux, les autres pages restent sobres. Le dock à cinq onglets et les parcours sont conservés. Voir [la direction et ses vérifications](DESIGN.md). Les fichiers du logo historique restent disponibles comme sources ; cette présentation remplace son affichage sur l’accueil. Les horaires restent ceux de l’API en attendant leur harmonisation explicite.