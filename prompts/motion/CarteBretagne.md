# Carte de la Bretagne — composition `Kit-CarteBretagne` (6,7 s)

```
Crée une carte animée de la région Bretagne, dans le même style que la carte de l'Oise (brique Carte),
de même durée que la scène DC-Carte (200 images) pour pouvoir la remplacer au montage.

STYLE
- Style institutionnel (réf. vidéos Groupe Safer) : fond blanc, palette vert anis #9CC31C, vert #1F9A43,
  orange #E3900F, bleu canard #3BA5BF, bordeaux #852245 ; police Montserrat 300/800 en majuscules ;
  mouvements en spring ou easing expo/cubic, jamais linéaires.

ANIMATION
- À gauche : « UN EMPLACEMENT / STRATÉGIQUE / EN BRETAGNE » (titre deux tons, lignes qui montent).
- À droite : contour simplifié de la Bretagne (4 départements, lon/lat) qui se trace puis se remplit en vert anis léger.
- Villes : Rennes et Brest (principales, bordeaux), Quimper, Lorient, Vannes, Saint-Brieuc (bleu canard).
- Épingle orange « LE SITE » au centre de la Bretagne avec ondes ; ligne pointillée bordeaux vers Rennes.

PARAMÈTRES (props)
- Composant générique MapRegion : région ('oise' | 'bretagne'), position/échelle, villes, site, lien {lon, lat, libellé}.
- Ajouter une région = ajouter son contour (lon/lat), son coin haut-gauche et son latScale ≈ 1/cos(latitude) dans REGIONS.

TECH
- Remotion + TypeScript ; MapOise reste un raccourci de MapRegion pour ne pas casser la vidéo existante.

RÉUSSI SI
- La forme est reconnaissable (Finistère, pointe du Raz, golfe du Morbihan) ; aucune étiquette ne se chevauche ;
  la vidéo DatacenterOise est inchangée.
```
