#!/usr/bin/env bash
# Rend chaque composition Remotion en MP4 et la range avec son prompt :
#   rendus/<categorie>/<Nom>/<Nom>.mp4 + prompt.md
# Usage : npm run rendus            (tout)
#         npm run rendus -- Kit-    (seulement les compositions dont l'id commence par "Kit-")
set -euo pipefail
cd "$(dirname "$0")/.."

FILTRE="${1:-}"

# Construit le projet une seule fois (plus rapide que de rebundler à chaque rendu).
npx remotion bundle --log=error --out-dir=build >/dev/null

for id in $(npx remotion compositions build --quiet); do
  [[ -n "$FILTRE" && "$id" != "$FILTRE"* ]] && continue

  # Convention de nommage : Kit-X → kit/X, DC-X → scenes-datacenter/X, sinon videos/X.
  case "$id" in
    Kit-*) categorie="kit";               nom="${id#Kit-}"; prompt="prompts/motion/$nom.md" ;;
    DC-*)  categorie="scenes-datacenter"; nom="${id#DC-}";  prompt="prompts/scenes-datacenter/$nom.md" ;;
    *)     categorie="videos";            nom="$id";        prompt="prompts/videos/$nom.md" ;;
  esac

  dossier="rendus/$categorie/$nom"
  mkdir -p "$dossier"
  echo "▶ $id → $dossier"
  npx remotion render build "$id" "$dossier/$nom.mp4" --log=error
  if [[ -f "$prompt" ]]; then cp "$prompt" "$dossier/prompt.md"; else echo "  ⚠️  pas de prompt ($prompt)"; fi
done

echo "✅ Rendus dans rendus/"
