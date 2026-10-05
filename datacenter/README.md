# inside the data center — 3 moteurs libres, 1 storyboard

Le même film de 20 s (1920×1080, 60 fps) produit avec trois technologies libres
(alternatives à Remotion, payant pour les entreprises de plus de 3 personnes).
Les trois versions lisent **le même fichier** `shared/spec.json` (couleurs, textes,
timings, valeurs du HUD, cues son) et passent par **le même finishing FFmpeg**
(`shared/finish.sh` : bloom, grain, scanlines, vignette).

| version | techno | licence | rendu ici (4 CPU, sans GPU) |
|---|---|---|---|
| `revideo/` | [Revideo](https://github.com/redotvideo/revideo) — fork de Motion Canvas, TypeScript, 2D | MIT | **75 s** |
| `manim/`   | [Manim Community](https://www.manim.community/) — Python, 2D vectoriel (Cairo) | MIT | ~16 min |
| `threejs/` | [Three.js](https://threejs.org/) (3D WebGL) + Playwright + FFmpeg | MIT / Apache-2.0 / LGPL-GPL | 7 min 30 |

## Storyboard

| t | scène |
|---|---|
| 0–3 s   | une requête (point orange) arrive par la fibre jusqu'au routeur de bordure — `GET /v1/generate · 1.2 KB` |
| 3–7 s   | recul caméra : réseau spine-leaf, les liens se dessinent, le paquet saute edge → spine → leaf |
| 7–12 s  | la rangée de baies apparaît, le paquet entre dans une baie, vague de calcul GPU, HUD (gpu util, puissance, tokens/s) |
| 12–16 s | refroidissement : air froid (blanc) qui monte, air chaud (orange) évacué, températures inlet/outlet |
| 16–20 s | la réponse repart en flux de tokens, tout s'effondre en un point orange, carte de fin « inside the data center », fondu |

Direction artistique identique au premier film : noir pur, orange `#FF6A1A` + `#FFB070`,
blanc en faible opacité, JetBrains Mono, easing expo uniquement, tout est fonction du temps (déterministe).

## Lancer

Prérequis communs : Node 20+, `ffmpeg` dans le PATH.

```bash
# Revideo
cd revideo && npm install && npm run render         # → out/datacenter-revideo.mp4

# Manim (prérequis : cairo/pango, police JetBrains Mono installée sur le système)
cd manim && pip install -r requirements.txt && ./render.sh   # → out/datacenter-manim.mp4
STILL_T=13.5 manim -s -qh -r 1920,1080 still.py Still        # une image à t = 13.5 s

# Three.js
cd threejs && npm install && npm run render         # → out/datacenter-threejs.mp4
node render.mjs --stills 240,700                     # images isolées dans out/stills/
node render.mjs --serve                              # aperçu dans le navigateur

# cues son (frame + temps de chaque moment clé)
node shared/export-cues.mjs                          # → sfx-cues.json
```

Navigateur : Revideo et Three.js utilisent Chromium. Les scripts prennent `CHROME_PATH`
si défini, sinon le Chromium de Playwright s'il est présent.

## Résultats des tests

| techno | licence | résultat |
|---|---|---|
| **Revideo** 0.11 | MIT | ✅ Rendu headless avec l'exporteur FFmpeg. L'encodeur navigateur (WebCodecs) échoue sans H.264 propriétaire, d'où `@revideo/core/ffmpeg` dans `project.ts`. Le rendu multi-workers a produit des frames en double et s'est bloqué une fois → 1 worker par défaut (`WORKERS=4` pour essayer). Télémétrie active par défaut : coupée via `DISABLE_TELEMETRY=true` dans les scripts. Un `Txt` dont le texte est un signal calculé plante en 0.11 → les textes dynamiques sont mis à jour dans la boucle de frames. |
| **Manim CE** 0.21 | MIT | ✅ Le plus lent ici (rendu Cairo sur CPU), mais aucune dépendance navigateur. Pas de flou/ombre natif : le glow est simulé par des traits superposés, le bloom vient du finishing. |
| **Three.js** 0.186 + Playwright | MIT / Apache-2.0 | ✅ Vraie 3D. WebGL en logiciel (SwiftShader) ≈ 0,37 s/frame ; beaucoup plus rapide avec un GPU. HUD et textes en HTML/CSS par-dessus le canvas. |
| **Blender** 5.0 (`bpy`) | GPL-3 (les rendus vous appartiennent) | ⚠️ Fonctionne (Cycles en CPU, EEVEE sous Xvfb), mais 9,5 à 14 s par frame pour un simple cube sans GPU → 3 à 4,6 h pour 1200 frames. À réserver à une machine avec GPU. |
| **Motion Canvas** | MIT | Non retenu : le rendu passe par l'éditeur dans un navigateur, pas de rendu headless officiel. Revideo est son fork qui l'ajoute (même API). |

Polices et outils : JetBrains Mono (OFL-1.1), FFmpeg (LGPL/GPL, utilisé en ligne de commande).
