# Confettis — composition `Kit-Confettis` (3 s)

```
Crée une salve de confettis géométriques puis une grappe de carrés.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires.

ANIMATION
- 0–1 s : ~26 carrés et triangles traversent l'écran de droite à gauche à grande vitesse, étirés et flous (flou de mouvement simulé : scaleX + blur proportionnels à la vitesse).
- 1–3 s : 9 carrés de tailles variées arrivent de loin en tournant, se posent en grappe (spring) puis flottent très légèrement.

PARAMÈTRES (props)
- nombre de formes, graine aléatoire, délai ; position de la grappe et liste des carrés {dx, dy, taille, couleur}.

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- aucune forme ne clignote ; la grappe reste stable et lisible ; même rendu à chaque fois.
```
