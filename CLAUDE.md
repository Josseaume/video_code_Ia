# video_code_Ia

Projet Remotion (React + TypeScript) pour faire des vidéos en code.

- Prévisualiser : `npm run dev` ; rendu : `npm run render` ; vérifier les types : `npm run typecheck`
- Vérifier visuellement une image : `npx remotion still Showreel out/x.png --frame=N`
- Tout est animé via `useCurrentFrame()` + `spring` / `interpolate` — pas de CSS transitions ni de `Math.random()` (utiliser `random(seed)` de Remotion, sinon le rendu n'est pas déterministe).
- Durée totale calculée dans `src/Showreel.tsx` (somme des scènes − transitions) : garder 450 images = 15 s.
- `out/` et `node_modules/` sont ignorés par git.
- Kit réutilisable dans `src/kit/` (exporté par `src/kit/index.ts`) ; chaque brique a une démo dans `src/kit/demos.tsx`.
- Photos : uniquement des images libres (Wikimedia Commons) listées dans `CREDITS.md` ; toute nouvelle photo doit y être ajoutée avec auteur + licence.
- Ne pas reproduire de logo ou nom de marque réel : le style s'inspire des vidéos Safer mais l'identité (`ProjectLogo`) est propre au projet.
