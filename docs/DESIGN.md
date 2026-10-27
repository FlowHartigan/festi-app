# Direction artistique — faire-part

La correction 0.2.1 reprend les deux maquettes validées (Accueil / Informations / Compte et Line-up / Plan) plutôt qu’une simple adaptation de leur palette.

- Fond crème #fff8e9, encre olive #35401e, surfaces #fffdf7 ; safran et corail réservés aux ornements.
- Accueil et quatre titres principaux : graphismes recréés à partir des maquettes, servis localement en WebP dans public/assets/identity. Les titres possèdent un équivalent textuel accessible. Berkshire Swash reste disponible pour les titres variables du compte.
- Accueil : grand lettrage, bouquet, rubans, noms en capitales, date et lieu centrés.
- Informations : six lignes avec séparateurs fins, chevrons et fleur à tige.
- Compte : clé à gauche du texte de bienvenue, champ pleine largeur, bouton olive et aide sous le bouton.
- Line-up : horaires sur une ligne, activités ouvertes initialement, détails natifs dépliables.
- Plan : illustration source détaillée optimisée en WebP, zones interactives tracées sur ses coordonnées, zoom vertical flottant et fiche de sélection. Cette illustration remplace le dessin SVG simplifié pour répondre à la demande explicite de fidélité.
- Dock clair sans fond coloré sur la destination active, icône de repère pour Plan.
- Les contenus de l’API, comptes, données et migrations restent inchangés. Les différences de programme entre faire-part et API ne sont pas arbitrées par cette refonte.

Les maquettes sont des images de présentation : les cadres de téléphone et barres système ne sont pas reproduits dans la page web. Les graphismes ont été recréés, et ne constituent pas des fichiers de design vectoriels originaux.

## Vérifications de la correction

Lint, typage et compilation ; huit tests serveur réussis. Comparaison visuelle des captures mobiles avec les deux maquettes. Contrôles Chromium sur cinq routes aux formats 320×568, 390×844, 844×390 et 1280×800 : aucun débordement horizontal, dock dans la fenêtre, destination active correcte.

Ouverture/fermeture du programme au clavier, accordéons Informations, zoom/réinitialisation et sélection du plan, erreur de code puis connexion avec un compte synthétique. Aucun compte réel utilisé. Les contrôles navigateur ne remplacent pas un essai sur iPhone physique.

## Repères du plan — 0.2.3

Les onze lieux cliquables possèdent un repère permanent avec une icône distincte. Les boutons de 44 pixels conservent leur taille pendant le zoom ; le lieu sélectionné passe en safran et sa fiche reprend la même icône. Les zones de l’illustration restent cliquables à la souris, les repères assurent l’accès clavier et lecteur d’écran sans doubler les arrêts de tabulation.
