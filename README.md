# video_code_Ia — Showreel motion design en code

Vidéo de 15 s (1920×1080, 30 fps) générée avec [Remotion](https://www.remotion.dev) : chaque image est un rendu React.
Aucun keyframe, aucun asset : tout est procédural (springs, interpolations, SVG).

## Lancer

```bash
npm install
npm run dev      # Remotion Studio : prévisualisation + timeline dans le navigateur
npm run render   # → out/showreel.mp4
npm run still    # → out/frame.png (une image, pratique pour vérifier vite)
```

## Structure

- `src/Showreel.tsx` — enchaînement des scènes et transitions (durées en images)
- `src/scenes/` — une scène par fichier : Intro, Kinetic, GridWave, Orbit, Curves, Outro
- `src/components/` — habillage commun (Overlay : grain, timecode…), labels, texte chromatique
- `src/theme.ts` — couleurs, polices (Google Fonts via `@remotion/google-fonts`)
