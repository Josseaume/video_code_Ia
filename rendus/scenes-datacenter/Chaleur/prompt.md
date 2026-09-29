# Scène Chaleur — composition `DC-Chaleur` (6,7 s)

```
Crée la chaleur valorisée : grande photo titrée « UNE CHALEUR VALORISÉE » + photos et libellés colorés « SERRES AGRICOLES », « ÉQUIPEMENTS PUBLICS », « RÉSEAU DE CHALEUR ≈ 8 000 LOGEMENTS ».

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires. Scène de la vidéo « Data center dans l'Oise » (voir ../videos/DatacenterOise.md), textes dans src/datacenter/content.ts.

ANIMATION
- Collage qui se construit élément par élément (~2,5 s), dérive -90 px, dégradé sombre sous le titre blanc.

PARAMÈTRES (props)
- aucune (textes et chiffres dans content.ts).

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- aucun chevauchement de texte ; cohérent avec les scènes voisines.
```
