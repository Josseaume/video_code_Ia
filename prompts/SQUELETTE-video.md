# Squelette de prompt — vidéo motion design (Remotion)

> Copie ce fichier, remplace tout ce qui est entre `[crochets]`, supprime les lignes inutiles.
> Tiré de la structure du prompt « LLM next token » (`videos/llm-next-token.md`), qui en est un exemple rempli.
> Écrire en anglais ou en français : les deux marchent. Garder les TITRES DE SECTION, ils structurent la réponse.

```
Create a Remotion project (TypeScript) and render a [DURÉE]-second, [1920x1080 | 1080x1920 | 1080x1080], [30|60]fps
motion graphics video [SUJET : explaining / presenting / teasing ...].
[AMBITION : Go all out — this should look like a premium [RÉFÉRENCE : AI-lab launch film / institutional film / product ad].]

ART DIRECTION
- Background: [couleur de fond + éventuel fond génératif].
- Palette: [couleur principale #HEX], [accent / highlight #HEX]. [Interdits : "No other colors."]
- Typography: [police(s)] via @remotion/google-fonts. [Graisses, casse : uppercase / lowercase].
- Texture: [grain, scanlines, bloom, aberration chromatique… ou "clean, no texture"].
- Generative background: [description précise : contour lines / grid / particles…],
  [opacité], [animé par du bruit Perlin/simplex], drawn procedurally (SVG or canvas), never images.
- Photos / assets: [aucun | dossier public/… | images libres à chercher (citer les auteurs)].
- Motion: every movement uses springs or expo easing, never linear. [Ton : calm / energetic / playful].
- Avoid: [anti-clichés : decorative corner frames, random corner labels, rainbow gradients, emojis…].

SHOT LIST
[0–Xs]   [Plan 1 : ce qu'on voit apparaître + comment ça bouge.]
[X–Ys]   [Plan 2 : texte exact entre guillemets, ex. "> ChatGPT,|" ; interaction entre éléments.]
[Y–Zs]   [Plan 3 : données chiffrées exactes si besoin (ex. token "T" 0.99…), élément qui "gagne".]
[Z–Ws]   [Plan 4 : mouvement de caméra (push-in, pan), transformation du décor.]
[W–FINs] [Plan final : end card, texte exact, casse, position ; fade to black ?]

TECH
- One <Composition> with separate <Sequence> per scene, all timing driven by
  useCurrentFrame() + spring()/interpolate() so it's deterministic.
- Put colors, fonts and timings in a single config file so I can tweak them.
- [Contraintes : pas de dépendance hors @remotion/* ; pas de Math.random() (utiliser random(seed)).]
- Render to [out/NOM.mp4] with `npx remotion render`, then show me the result
  (check a few stills of key frames before the full render).
- [Sound design hook: export a JSON of key moments ([liste : keystrokes, impacts…]) so I can sync SFX later.]

MONTAGE (editability — do not skip)
- Give every <Sequence> / <TransitionSeries.Sequence> an explicit, numbered `name`
  (e.g. name="01 · Intro", "02 · Prompt"…) so each scene shows up by name in the Studio timeline.
- One scene = one component. Scene order + durations in a single list in the config file.
- Also register each scene as its own <Composition> inside a <Folder> ("Scenes"), same duration as in the film,
  so any scene can be rendered alone and swapped in a video editor.
- All on-screen texts and numbers in one content file (never hard-coded inside scenes).
- [If the clips will be overlaid on footage: export with transparent background
  (--codec=prores --prores-profile=4444, no background color in the overlay compositions).]

DONE WHEN
- [Critères : durée exacte, lisible sur mobile, aucune couleur hors palette, rendu sans erreur,
  je comprends ce que fait chaque fichier.]
```

## Aide-mémoire par section

| Section | Question à se poser | Mauvais | Bon |
|---|---|---|---|
| En-tête | Format, durée, fps, sujet ? | « fais une vidéo sur l'IA » | « 20 s, 1920x1080, 60 fps, expliquer la prédiction du prochain token » |
| ART DIRECTION | Qu'est-ce qui est **interdit** ? | « joli, moderne » | « fond noir pur, un seul orange #FF6A1A, pas d'autres couleurs » |
| SHOT LIST | Que voit-on **à chaque seconde** ? | « une intro puis le contenu » | « 0–3 s : les lignes se tracent depuis le centre, un curseur orange clignote » |
| TECH | Comment je modifie / vérifie ? | — | « couleurs et timings dans un seul fichier de config » |
| MONTAGE | Est-ce que je retrouve et remplace **une** scène facilement ? | scènes sans nom : la timeline n'affiche que `<TS.Sequence>` | `name="03 · Carte"`, chaque scène rendable seule, textes dans un seul fichier |
| DONE WHEN | Comment je sais que c'est fini ? | — | « rendu sans erreur, 20,0 s pile, textes lisibles » |
