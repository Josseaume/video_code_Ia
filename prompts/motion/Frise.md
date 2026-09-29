# Frise chronologique — composition `Kit-Frise` (4 s)

```
Crée une frise chronologique horizontale.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires.

ANIMATION
- Une ligne se trace de gauche à droite ; à chaque jalon, un carré de couleur pop en tournant, une photo s'ouvre au-dessus, l'année (grand, couleur) et le libellé montent en dessous.

PARAMÈTRES (props)
- jalons {année, libellé, photo, couleur}, position y, délai, décalage.

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- jalons régulièrement espacés ; années lisibles de loin.
```
