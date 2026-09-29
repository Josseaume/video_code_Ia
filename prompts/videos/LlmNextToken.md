# LLM — prédiction du prochain token — 20 s (pas encore réalisée)

Exemple **rempli** du squelette (`../SQUELETTE-video.md`).

```
Create a Remotion project (TypeScript) and render a 20-second, 1920x1080, 60fps
motion graphics video explaining how an LLM predicts the next token.
Go all out — this should look like a premium AI-lab launch film.

ART DIRECTION
- Pure black background, single accent color: hot orange #FF6A1A (with a
  brighter #FFB070 for highlights). No other colors.
- Monospace typography only (JetBrains Mono via @remotion/google-fonts).
- Texture: subtle film grain, faint scanlines, soft bloom on orange elements,
  very slight chromatic aberration on fast moves.
- Background: generative concentric contour lines (like a topographic map /
  sound ripple), thin white lines at ~15% opacity, distorted by animated
  Perlin/simplex noise, slowly breathing. Draw them procedurally (SVG paths or
  canvas), never with images.
- Motion: every movement uses springs or expo easing, never linear. Precise,
  engineered, calm — not chaotic. Avoid decorative corner frames and random
  corner labels (typical AI giveaways).

SHOT LIST
0–3s   Contour lines draw themselves from the center outward. A blinking
       orange cursor appears in the middle.
3–7s   A prompt types character by character: "> ChatGPT,|" with a glow and a
       glowing underline. Each keystroke sends a small ripple through the
       contour lines.
7–12s  A HUD panel slides in above-right, labeled "p( next | context )".
       It lists 4 candidate tokens with probability bars that fill up
       (e.g. "T" 0.99, "Claude" 0.61, "the" 0.12, "a" 0.003), numbers
       counting up in real time. The winning token pulses.
12–16s Camera pushes in; the winning token flies from the panel into the
       sentence, the ripple becomes a shockwave, lines reorganize into
       a clean grid of tokens streaming left to right.
16–20s Everything collapses into a single orange point, then a clean end card:
       "next token prediction" in lowercase, small, centered. Fade to black.

TECH
- One <Composition> with separate <Sequence> per scene, all timing driven by
  useCurrentFrame() + spring()/interpolate() so it's deterministic.
- Put colors, fonts and timings in a single config file so I can tweak them.
- Render to out/video.mp4 with `npx remotion render`, then show me the result.
- Add a sound design hook: export a JSON of key moments (keystrokes, shockwave)
  so I can sync SFX later.
```

Remarque : les probabilités de l'exemple ne somment pas à 1 (0.99 + 0.61 + …) — à corriger
si la vidéo doit être pédagogiquement juste (ex. "T" 0.62, "Claude" 0.27, "the" 0.08, "a" 0.03).
