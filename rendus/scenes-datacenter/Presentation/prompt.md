# Scène Presentation — composition `DC-Presentation` (5,7 s)

```
Crée la présentation : rangée photo / badge vert anis / photo / photo, puis « PRÉSENTE / OISE DATA PARK / CAMPUS NUMÉRIQUE BAS CARBONE » sous la 3e vignette.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires. Scène de la vidéo « Data center dans l'Oise » (voir ../videos/DatacenterOise.md), textes dans src/datacenter/content.ts.

ANIMATION
- Vignettes décalées de 6 images, texte à 1 s, légère dérive latérale de l'ensemble.

PARAMÈTRES (props)
- aucune (textes et chiffres dans content.ts).

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- aucun chevauchement de texte ; cohérent avec les scènes voisines.
```
