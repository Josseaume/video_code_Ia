# Scène Question — composition `DC-Question` (6,7 s)

```
Crée la question : titre deux tons « COMMENT ACCUEILLIR / le numérique de demain / sans oublier le territoire ? », mosaïque de 4 photos, réponse « NOUS AVONS UN PROJET » en vert anis.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires. Scène de la vidéo « Data center dans l'Oise » (voir ../videos/DatacenterOise.md), textes dans src/datacenter/content.ts.

ANIMATION
- Titre puis mosaïque (décalage 4 images) puis réponse à 2,3 s ; flash vert anis à 5 s ; ligne blanche sur les photos.

PARAMÈTRES (props)
- aucune (textes et chiffres dans content.ts).

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- aucun chevauchement de texte ; cohérent avec les scènes voisines.
```
