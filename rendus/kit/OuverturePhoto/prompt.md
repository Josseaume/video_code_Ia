# Ouverture sur photo — composition `Kit-OuverturePhoto` (4 s)

```
Crée une ouverture plein écran sur photo avec liste de mots.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires.

ANIMATION
- La photo se dévoile de gauche à droite, d'abord teintée vert anis (multiply) puis la teinte disparaît.
- Zoom arrière lent. À droite, des mots en majuscules blanches s'empilent un par un (translateX + fondu), terminés par « … ».

PARAMÈTRES (props)
- photo, liste de mots, couleur du voile, délai et rythme des mots.

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- mots lisibles sur la photo (ombre portée douce) ; alignement à droite propre.
```
