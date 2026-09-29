# Prompts

- `SQUELETTE-video.md` — modèle à trous pour demander une vidéo complète. **Commencer par là.**
- `videos/` — prompts des vidéos complètes réellement utilisés (texte d'origine + précisions).
- `motion/` — un prompt par petit motion design du kit (`src/kit/`), réutilisable seul.
- `scenes-datacenter/` — un prompt par scène de la vidéo data center.

Le nom d'un fichier = l'identifiant de la composition Remotion (`Kit-Logo` → `motion/Logo.md`,
`DC-Carte` → `scenes-datacenter/Carte.md`). `npm run rendus` s'en sert pour ranger chaque MP4 avec son prompt
dans `rendus/`.

⚠️ Les prompts de `motion/` et `scenes-datacenter/` ont été écrits **après coup** pour pouvoir refaire chaque
brique seule : les briques ont été produites à partir du prompt général de la vidéo data center.
