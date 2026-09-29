# Transitions — composition `Kit-Transitions` (4,3 s)

```
Crée un jeu de transitions réutilisables.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires.

ANIMATION
- Voile de couleur plein écran (vert anis, multiply) qui monte puis redescend.
- Volet : un aplat de couleur balaie l'écran et le dévoile (dans les deux sens).
- Triangle orange qui arrive en tournant puis fonce vers la caméra jusqu'à remplir l'écran.

PARAMÈTRES (props)
- couleur, moment, durée, sens ; triangle : position, sortie 'zoom' ou 'shrink'.

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- aucune image entièrement vide non voulue ; transitions courtes (< 20 images).
```
