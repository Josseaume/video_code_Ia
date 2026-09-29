# next token prediction — Remotion film

20 s · 1920×1080 · 60 fps motion-graphics film explaining how an LLM predicts the next token.

```
npm install
npm run studio      # preview / scrub in Remotion Studio
npm run render      # → out/video.mp4
npm run sfx         # → sfx/sfx-cues.json (+ out/sfx-cues.json)
```

Offline or sandboxed machine (headless Chrome can't reach fonts.gstatic.com)?
`REMOTION_LOCAL_FONTS=1 npm run render` uses the vendored copy of the same
Google Fonts file in `public/fonts/`.

## Tweak everything in `src/config.ts`

| block      | what                                                                  |
|------------|-----------------------------------------------------------------------|
| `COLORS`   | `#000` bg, `#FF6A1A` accent, `#FFB070` highlight, white for contours  |
| `FONT`     | JetBrains Mono, sizes per element                                     |
| `TEXTURE`  | grain, scanlines, vignette, max chromatic aberration                  |
| `CONTOURS` | ring count, spacing, noise, breathing, grid-row spacing               |
| `SCENES`   | scene boundaries (s)                                                  |
| `T`        | every beat in absolute seconds (keystrokes, impact, collapse, …)      |
| `COPY`     | prompt, HUD label, candidates + probabilities, winner, grid vocab     |

## Structure

```
src/
  config.ts            single source of truth (pure TS, also used by the SFX script)
  Film.tsx             layer stack + one named <Sequence> per scene
  lib/timeline.ts      deterministic global signals: camera, ripples, grid morph, collapse
  lib/scene.tsx        <Scene> = <Sequence> that still exposes the absolute frame
  components/
    Contours.tsx       canvas: simplex-noise contour rings → shockwave → token grid lanes
    PromptLine.tsx     typed prompt, re-centering, underline, caret
    Panel.tsx          HUD "p( next | context )" + leader line
    Token.tsx          ember, flying token (trail + aberration), impact flash
    EndCard.tsx        point → end card
    Texture.tsx        seeded film grain, scanlines, vignette
    GlowText.tsx       bloom + palette-safe chromatic aberration
scripts/export-sfx.ts  sound-design cue export
```

Everything is a pure function of `useCurrentFrame()` (springs, expo easing,
seeded noise/PRNG), so every render is identical.

## Sound design hook

`sfx/sfx-cues.json` lists each cue with `frame`, `time` (s), `type`,
`label` and a suggested `intensity` 0–1: `contour_draw`, `cursor_appear`,
10 × `keystroke`, `panel_in`, 4 × `bar_fill`, `winner_pulse`, `camera_push`,
`token_lift`, `token_whoosh`, `impact_shockwave`, `grid_stream`, `collapse`,
`point`, `end_card`, `fade_out`. It's generated from `config.ts`, so run
`npm run sfx` again after you change timings.
