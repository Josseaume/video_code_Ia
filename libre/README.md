# libre/ — « Data center dans l'Oise » sans Remotion

La même vidéo que `src/datacenter/` (79 s, 14 scènes, 2375 images à 30 fps), refaite avec deux
moteurs libres. Remotion est payant pour les entreprises de plus de 3 personnes ; ceux-ci ne le sont pas.

| dossier | moteur | licence | rendu sur le MacBook Air M2 |
|---|---|---|---|
| `revideo/` | [Revideo](https://github.com/redotvideo/revideo) (fork de Motion Canvas, TypeScript) | MIT | ≈ 2 min |
| `threejs/` | [Three.js](https://threejs.org/) + Playwright pour la capture | MIT / Apache-2.0 | ≈ 5 min 30 |

Rien à installer sur le système : Chrome déjà présent sur le Mac, et le ffmpeg embarqué dans
`revideo/node_modules`. Lancer `npm install` dans `revideo/` d'abord (la version Three.js réutilise son ffmpeg).

```bash
cd libre/revideo && npm install && npm run render     # → libre/out/datacenter-oise-revideo.mp4
npm run frame -- 900                                   # image 900 du dernier rendu → libre/out/stills/

cd libre/threejs && npm install && npm run render     # → libre/out/datacenter-oise-threejs.mp4
npm run frame -- 900                                   # image 900, rendue directement
npm run preview                                        # aperçu dans le navigateur (console : renderFrame(900))
```

## Comment c'est organisé

- `shared/core.js` — tout ce qui ne dépend pas du moteur : textes et chiffres (repris de
  `src/datacenter/content.ts`), palette, durée et transition de chaque scène, et les fonctions
  d'animation (`spring`, `interp`, easings) qui donnent **les mêmes courbes que Remotion**.
- `revideo/src/kit.tsx` et `threejs/kit.js` — le kit institutionnel, brique par brique (mêmes noms
  que `src/kit/`). `scenes.tsx` / `scenes.js` — les 14 scènes, mêmes réglages que l'original.
- `threejs/stage.js` — Three.js ne sait dessiner ni texte ni mise en page : ce fichier ajoute une
  petite couche 2D (rectangles, photos, texte en textures, masques, transitions).

## Différences avec l'original

- Scène 1 : les formes de la salve d'ouverture et les trajectoires d'arrivée des petits carrés ne sont
  pas aux mêmes endroits (le tirage « aléatoire » de Remotion n'est pas réutilisable hors Remotion).
- Revideo : le blanc sort à 253/255 et la qualité d'encodage n'est pas réglable depuis le rendu en ligne de commande.
- Tout le reste est aligné image par image (vérifié sur une trentaine d'images réparties dans les 14 scènes).

## À savoir

- Si un texte ou un chiffre change dans `src/datacenter/content.ts`, il faut le reporter dans `shared/core.js`.
- Revideo envoie des statistiques d'usage par défaut : coupé dans les scripts (`DISABLE_TELEMETRY=true`).
- Revideo 0.11 plante si le contenu d'un `Txt` est calculé à chaque image : les compteurs passent par
  `liveText()` (voir `kit.tsx`).
- La version Three.js lance un petit serveur de fichiers le temps du rendu ; il n'écoute que sur
  `127.0.0.1` (cette machine uniquement) et s'arrête à la fin.
