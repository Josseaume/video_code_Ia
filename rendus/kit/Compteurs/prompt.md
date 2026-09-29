# Compteurs — composition `Kit-Compteurs` (3 s)

```
Crée une rangée de chiffres clés qui défilent.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires.

ANIMATION
- 3 colonnes ; pour chacune, un carré de couleur pop en tournant, le nombre compte de 0 à sa valeur (easing out quart), le libellé apparaît dessous.

PARAMÈTRES (props)
- éléments {valeur, préfixe, suffixe, libellé, couleur}, y, délai, décalage.

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- les nombres ne tremblent pas (tabular-nums) ; format français.
```
