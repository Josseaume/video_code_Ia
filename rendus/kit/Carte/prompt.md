# Carte de l'Oise — composition `Kit-Carte` (5 s)

```
Crée une carte animée du département de l'Oise.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires.

ANIMATION
- Le contour (polygone simplifié projeté depuis lon/lat) se trace, puis se remplit en vert anis léger.
- Les villes apparaissent (carré + nom) ; une épingle orange tombe sur le site avec des ondes ; une ligne pointillée bordeaux file vers Paris avec « PARIS · 50 KM ».

PARAMÈTRES (props)
- position/échelle, villes {nom, lon, lat, principale}, site {lon, lat, libellé}, texte de distance.

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- aucune étiquette ne se chevauche ; carte clairement stylisée (pas un fond cartographique).
```
