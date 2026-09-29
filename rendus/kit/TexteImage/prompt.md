# Texte rempli de photo — composition `Kit-TexteImage` (3,7 s)

```
Crée des mots géants remplis par une photo.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires.

ANIMATION
- 4 mots empilés et centrés (« ACHETER / INSTALLER / DÉVELOPPER / TRANSMETTRE ») en Montserrat 800 ~190 px.
- Chaque mot est un masque SVG (clipPath <text>) sur la même photo plein cadre, dévoilé par un balayage gauche → droite, décalage de 12 images.

PARAMÈTRES (props)
- photo, liste de mots, taille, délai, décalage, identifiant unique des masques.

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- la photo est continue d'un mot à l'autre ; choisir une photo texturée et contrastée.
```
