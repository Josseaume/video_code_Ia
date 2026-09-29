# Scène MotsCles — composition `DC-MotsCles` (7 s)

```
Crée les mots-clés sur photo (technicien en salle serveurs) : « SOBRIÉTÉ énergétique » → « refroidissement LIQUIDE PUE 1,2 » → « 100 % ÉLECTRICITÉ bas carbone ».

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires. Scène de la vidéo « Data center dans l'Oise » (voir ../videos/DatacenterOise.md), textes dans src/datacenter/content.ts.

ANIMATION
- Voir la brique MotsClesPhoto ; groupes à 0,3 s, 2,4 s et 4,7 s.

PARAMÈTRES (props)
- aucune (textes et chiffres dans content.ts).

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- aucun chevauchement de texte ; cohérent avec les scènes voisines.
```
