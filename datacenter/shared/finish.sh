#!/usr/bin/env bash
# Shared "film finish" pass applied to every engine's raw render, so the three
# videos get the exact same texture: soft bloom, film grain, scanlines, vignette.
#   shared/finish.sh <raw.mp4> <final.mp4> [extra ffmpeg input args, e.g. -ss 13 -t 1]
set -euo pipefail
in="$1"; out="$2"; shift 2
ffmpeg -y -v error "$@" -i "$in" -filter_complex "
  [0:v]format=gbrp,split[base][glow];
  [glow]gblur=sigma=10,colorlevels=rimin=0.1:gimin=0.1:bimin=0.1[bl];
  [base][bl]blend=all_mode=screen:all_opacity=0.8,
  format=yuv444p,
  noise=c0s=6:c0f=t,
  drawgrid=w=iw:h=3:t=1:c=black@0.10,
  vignette=angle=PI/6,
  format=yuv420p[v]" \
  -map "[v]" -an -frames:v 1200 -c:v libx264 -preset medium -tune grain -crf 20 -r 60 -movflags +faststart "$out"
echo "finished → $out"
