# Mots-clés sur photo — composition `Kit-MotsClesPhoto` (5 s)

```
Crée des groupes de mots-clés qui se succèdent sur une photo plein écran.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires.

ANIMATION
- Photo plein écran avec zoom lent et dégradé sombre côté texte.
- Groupe 1 (« EXPERTISE / connaissance du marché ») arrive ligne par ligne (flou → net, montée) ; au temps du groupe 2, il part vers le haut en fondu et « ÉVALUATION AU JUSTE PRIX » (orange) le remplace.

PARAMÈTRES (props)
- photo, groupes {temps d'apparition, lignes}, position, alignement, taille.

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- jamais deux groupes lisibles en même temps ; contraste suffisant.
```
