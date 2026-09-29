# Data center dans l'Oise — 79 s (composition `DatacenterOise`)

## Prompt d'origine (tel quel)

> es que tu peux faire plein de motion designes dans le style de la fnsafer https://www.youtube.com/@GroupeSafer
> regarde toute les video les plus trvaillier comme celle ci https://www.youtube.com/watch?v=0OCZ0AgV3yM&list=PLdcswgVAlJ6yXvAFpHWoCJd5cSGFt54cN
> et je veux plein de motion desgnigs ensuite une fois que tu les aconstruit tu fais une video profesionlle pour
> presenter un projet de data center dans l'oise l'important est la video pas le fond

## Version structurée (selon le squelette) — pour la refaire proprement

```
Create a Remotion project (TypeScript) and render a ~80-second, 1920x1080, 30fps institutional motion design
video presenting a (fictional) low-carbon data center project in the Oise department (France).
Style reference: Groupe Safer institutional videos (study their YouTube storyboards first).

ART DIRECTION
- White background. Palette: lime #9CC31C, green #1F9A43, orange #E3900F, teal #3BA5BF, burgundy #852245.
- Typography: Montserrat only (300 light / 800 extra-bold), uppercase.
- Recurring elements: bursts of small squares/triangles settling into clusters; a thin wavy line with loops
  crossing the frame; photo tiles popping from their center; two-tone titles (burgundy bold + light);
  big numbers on photo cards with an orange corner square; lime colour wash transitions; words filled with a photo.
- Photos: free images from Wikimedia Commons only, credited (CREDITS.md + end card).
- Do NOT reuse the Safer logo or name: create a project identity ("oise datapark", 4-square mark).

SHOT LIST (14 scenes, 15-frame transitions: slide / wipe / fade)
Opening logo · territory photo + word list · question + mosaic + "nous avons un projet" · presentation mosaic
· site (12 ha, high voltage) · animated map of Oise (cities, pin, 50 km to Paris) · 40 MW stat card
· heat reuse collage · keywords over full photo · timeline 2026→2029 · counters · message on aerial photo
· words filled with photo · "ET SI ON EN PARLAIT ?" + triangle + end logo.

TECH
- Name every TransitionSeries.Sequence ("01 · Ouverture"…) so scenes are identifiable in the Studio timeline.
- Build every visual element as a reusable component in src/kit/ with its own demo composition.
- All texts & numbers in src/datacenter/content.ts. Deterministic timing (useCurrentFrame + spring/interpolate).
- Render to out/datacenter-oise.mp4; check stills of every scene before the full render.

DONE WHEN
- Looks like a professional institutional film; no text overlaps; all photo authors credited.
```
