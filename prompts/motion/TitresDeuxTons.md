# Titres deux tons — composition `Kit-TitresDeuxTons` (3,3 s)

```
Crée des blocs de titres en deux tons.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43, orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ; mouvements en spring ou easing expo/cubic, jamais linéaires.

ANIMATION
- Bloc 1 (bordeaux) : « VOUS AVEZ UN PROJET » en extra-bold, puis 2 lignes en light ; chaque ligne monte derrière un masque, décalage de 5 images.
- Bloc 2 (vert anis) : « NOUS AVONS / LES SOLUTIONS » arrive flou et très espacé puis se resserre (effet mise au point).

PARAMÈTRES (props)
- lignes {texte, graisse, couleur, taille}, mode 'rise' ou 'spread', délai, décalage, alignement.

TECH
- Remotion + TypeScript, composant réutilisable avec props dans src/kit/, démo 1920x1080 30 fps ; animation pilotée par useCurrentFrame() + spring()/interpolate() (déterministe, random(seed) si hasard).

RÉUSSI SI
- texte net à la fin ; interlignage serré ; aucune ligne ne déborde.
```
