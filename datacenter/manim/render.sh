#!/usr/bin/env bash
# Manim Community (MIT) render → ../out/datacenter-manim.mp4
# Needs: python deps (requirements.txt), ffmpeg, cairo/pango, and the JetBrains Mono font installed system-wide.
set -euo pipefail
cd "$(dirname "$0")"
MANIM=${MANIM:-manim}
media=$(mktemp -d)
start=$(date +%s)
"$MANIM" -qh --fps 60 -r 1920,1080 --disable_caching --progress_bar none \
  --media_dir "$media" -o raw-manim datacenter.py DataCenter
mkdir -p ../out
mv "$media"/videos/datacenter/1080p60/raw-manim.mp4 ../out/raw-manim.mp4
rm -rf "$media"
echo "manim render: $(( $(date +%s) - start ))s → ../out/raw-manim.mp4"
../shared/finish.sh ../out/raw-manim.mp4 ../out/datacenter-manim.mp4
