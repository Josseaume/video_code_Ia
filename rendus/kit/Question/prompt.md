# Question tapée — composition `Kit-Question` (2,7 s)

```
Crée une question qui s'écrit lettre par lettre.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires.

ANIMATION
- « ET SI ON EN PARLAIT ? » en bordeaux extra-bold ; chaque lettre atterrit depuis 2× sa taille avec un léger rebond (easing back).
- Une petite grappe de carrés se pose à gauche du texte.

PARAMÈTRES (props)
- texte, position, taille, couleur, délai, vitesse (lettres par image).

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- rythme régulier ; les espaces sont conservés ; texte stable à la fin.
```
