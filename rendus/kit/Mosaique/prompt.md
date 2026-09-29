# Mosaïque photo — composition `Kit-Mosaique` (3,7 s)

```
Crée une rangée de vignettes photo qui s'ouvrent.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires.

ANIMATION
- 5 photos en rangée centrée ; chacune s'ouvre depuis son centre (clip-path inset + léger scale, spring), décalage de 5 images.
- À l'intérieur, zoom lent (Ken Burns). Une ligne blanche fine serpente par-dessus.

PARAMÈTRES (props)
- liste de photos, position y, largeur, hauteur, espacement, délai, décalage.

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- vignettes parfaitement alignées ; photos jamais déformées (object-fit: cover).
```
