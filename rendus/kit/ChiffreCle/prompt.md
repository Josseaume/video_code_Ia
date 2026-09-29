# Carte chiffre clé — composition `Kit-ChiffreCle` (3,7 s)

```
Crée une carte photo avec chiffre clé qui défile.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires.

ANIMATION
- La carte photo s'ouvre ; un carré orange pop dans le coin haut-gauche, à cheval sur le bord.
- En bas à gauche, des lignes blanches glissent depuis la gauche : « ENTRE », un grand nombre qui compte de 0 à 1 200, « ET », 1 400, « OPÉRATIONS ».

PARAMÈTRES (props)
- photo, position/taille de la carte, lignes (texte ou compteur {to, suffix}, grand/petit), couleur d'accent.

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- chiffres au format français (espace des milliers), chasse fixe (tabular-nums) pour éviter que le nombre tremble.
```
