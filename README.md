# video_code_Ia — Motion design en code (Remotion)

Vidéo de 15 s (1920×1080, 30 fps) générée avec [Remotion](https://www.remotion.dev) : chaque image est un rendu React.
Aucun keyframe, aucun asset : tout est procédural (springs, interpolations, SVG).

## Lancer

```bash
npm install
npm run dev      # Remotion Studio : prévisualisation + timeline dans le navigateur
npm run render   # → out/showreel.mp4
npm run still    # → out/frame.png (une image, pratique pour vérifier vite)
npm run rendus   # → rendus/<categorie>/<Nom>/<Nom>.mp4 + prompt.md, pour chaque composition
```

## Prompts (`prompts/`)

- `prompts/SQUELETTE-video.md` : modèle à trous pour demander une nouvelle vidéo.
- `prompts/videos/`, `prompts/motion/`, `prompts/scenes-datacenter/` : un prompt par composition
  (même nom que la composition), recopié à côté du MP4 par `npm run rendus`.

## Structure

- `src/Showreel.tsx` — enchaînement des scènes et transitions (durées en images)
- `src/scenes/` — une scène par fichier : Intro, Kinetic, GridWave, Orbit, Curves, Outro
- `src/components/` — habillage commun (Overlay : grain, timecode…), labels, texte chromatique
- `src/theme.ts` — couleurs, polices (Google Fonts via `@remotion/google-fonts`)

## Kit "institutionnel" (`src/kit/`)

Briques de motion design dans l'esprit des vidéos institutionnelles rurales (fond blanc, confettis de carrés,
ligne qui serpente, mosaïques photo, titres deux tons, chiffres clés). Chaque brique a sa démo dans le dossier
**Kit** du Studio : `Confettis`, `Logo`, `Lignes`, `TitresDeuxTons`, `Mosaique`, `OuverturePhoto`, `ChiffreCle`,
`MotsClesPhoto`, `TexteImage`, `Carte`, `Frise`, `Compteurs`, `Transitions`, `Question`.

## Vidéo "Data center dans l'Oise" (`src/datacenter/`)

- Rendu : `npx remotion render DatacenterOise out/datacenter-oise.mp4` (≈ 79 s, ~2 min de rendu sur M2)
- Textes et chiffres (fictifs) : `src/datacenter/content.ts`
- Ordre et durée des scènes : `DC_SCENES` dans `src/datacenter/DatacenterOise.tsx` ; chaque scène est aussi
  visible seule dans le dossier **Scenes-DataCenter** du Studio.
- Photos : `public/photos/` (Wikimedia Commons) — auteurs et licences dans `CREDITS.md`.
