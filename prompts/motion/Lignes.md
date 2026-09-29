# Lignes qui serpentent — composition `Kit-Lignes` (4 s)

```
Crée des lignes fines qui serpentent avec des boucles.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires.

ANIMATION
- 4 tracés prédéfinis (haut, milieu, bas, diagonale) en SVG, chacun avec une boucle.
- La tête se dessine (strokeDasharray, easing inOut cubic), puis la queue suit et efface la ligne.

PARAMÈTRES (props)
- tracé, couleur, épaisseur, délai, durée du dessin, délai de la queue (null = la ligne reste).

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- trait régulier sans à-coup ; la boucle est visible ; pas de ligne coupée net au bord.
```
