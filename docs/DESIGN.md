# Direction artistique — faire-part

Direction validée sur maquette le 25 octobre 2026, intégrée le 26 octobre 2026.

- Fond crème #fff8e9, encre olive #35401e, surfaces #fffdf7.
- Safran #cc861a et corail #df684d réservés aux ornements. Les textes utiles restent foncés.
- Titres Berkshire Swash (SIL Open Font License), fichier servi localement depuis public/assets/fonts/. Texte courant en police système ; aucune requête Google Fonts au chargement.
- Accueil : titre typographique inspiré du faire-part, deux fleurs vectorielles, rubans et date. Les sources du logo historique restent conservées.
- Écrans pratiques : une petite fleur dans le titre, listes et formulaires aérés. Dock fixe à cinq destinations et zones de sécurité conservés.
- Line-up : détails natifs dépliables. Plan : illustration SVG existante, zoom, sélection et liste de lieux repliable. La disposition du lieu ne change pas.
- Aucun changement des horaires, de l’API, des comptes ou des migrations.

La police est une adaptation web de la direction approuvée, pas une extraction de la typographie du faire-part. Les ornements sont du SVG léger, masqué aux technologies d’assistance.

## Vérifications

Contrôles navigateur Chromium sur le build local, avec une base dédiée et un compte fictif : cinq routes aux formats 320×568, 390×844, 844×390 et 1280×800, absence de débordement horizontal, destination active et dock dans la fenêtre. Captures inspectées des cinq écrans.

Accordéons multiples, ouverture du Line-up au clavier, zoom/réinitialisation et sélection du plan ; connexion invalide puis valide ; erreur réseau avec réponse conservée ; présence et van enregistrés séparément ; déconnexion/reconnexion et rechargement avec réponses persistantes ; absence bloquant le van.

Les contrôles de fenêtres ne remplacent pas un essai sur un iPhone physique avec clavier virtuel. Les horaires du faire-part diffèrent de ceux du projet : harmonisation à décider séparément.

Références : [police](https://fonts.google.com/specimen/Berkshire+Swash), [champs contrôlés React](https://react.dev/reference/react-dom/components/input), [polices locales CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face).
