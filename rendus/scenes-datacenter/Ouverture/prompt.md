# Scène Ouverture — composition `DC-Ouverture` (5 s)

```
Crée l'ouverture : salve de confettis, triangle vert, grappe de carrés, logo « oise datapark » et accroche « CAMPUS NUMÉRIQUE BAS CARBONE ».

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires. Scène de la vidéo « Data center dans l'Oise » (voir ../videos/DatacenterOise.md), textes dans src/datacenter/content.ts.

ANIMATION
- 0–1 s confettis ; 0,4–1,2 s triangle vert qui pop puis rétrécit ; 1 s grappe ; 1,4 s logo ; 2,2 s accroche (effet mise au point) ; une ligne serpente et s'efface.

PARAMÈTRES (props)
- aucune (textes et chiffres dans content.ts).

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- aucun chevauchement de texte ; cohérent avec les scènes voisines.
```
