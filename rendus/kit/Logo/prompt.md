# Logo animé — composition `Kit-Logo` (3 s)

```
Crée un logo de projet animé + badge.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires.

ANIMATION
- La marque (4 carrés en 2×2) arrive en tournant de -90° avec un spring.
- Le nom se dévoile de gauche à droite (clip-path) : 1er mot en light, 2e en extra-bold.
- Une grappe de carrés se pose à gauche ; un badge carré orange (nom en blanc) pop en bas à droite.

PARAMÈTRES (props)
- nom en deux parties, taille, délai, couleur unique optionnelle (version monochrome).

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- aucune reprise d'un logo existant ; le nom est lisible dès 1,5 s.
```
