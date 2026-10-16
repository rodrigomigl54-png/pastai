#!/usr/bin/env bash
# Encode raw clips into web renditions: AV1 (libsvtav1) + H.264 fallback
# (libx264, +faststart), no audio, plus an AVIF poster per clip.
#
#   Landscape: 2160p, 1440p, 1080p, 720p      -> <name>-<h>p.{av1.mp4,h264.mp4}
#   Portrait:  1080x1920, 720x1280 (phones)   -> <name>-p<h>.{av1.mp4,h264.mp4}
#
# Usage:  bash scripts/encode-video.sh media/raw/clip.mov [more clips…]
#         CROP_X=0.5 bash scripts/encode-video.sh clip.mov   # portrait crop centre (0…1, default 0.5)
# Output: public/video/   (large originals stay in media/raw/, which is git-ignored)
#
# Renditions are never upscaled: sizes above the source height are skipped.
set -euo pipefail
export SVT_LOG=1 # SVT-AV1: errors only

OUT="${OUT:-public/video}"
CROP_X="${CROP_X:-0.5}"
mkdir -p "$OUT"

command -v ffmpeg >/dev/null || { echo "ffmpeg not found" >&2; exit 1; }

encode() { # $1 src, $2 vf filter, $3 out-base
  local src="$1" vf="$2" base="$3"
  # AV1: CRF 30 @ preset 4 is visually transparent for food/interior footage at these sizes.
  ffmpeg -hide_banner -loglevel error -y -i "$src" -an -vf "$vf,format=yuv420p" \
    -c:v libsvtav1 -preset 4 -crf 30 -g 120 -svtav1-params tune=0:film-grain=4 \
    -movflags +faststart "$base.av1.mp4"
  # H.264 fallback: CRF 20, slow preset, High profile for broad hardware decode.
  ffmpeg -hide_banner -loglevel error -y -i "$src" -an -vf "$vf,format=yuv420p" \
    -c:v libx264 -preset slow -crf 20 -profile:v high -level 4.2 -g 120 \
    -movflags +faststart "$base.h264.mp4"
  echo "  ✓ $(basename "$base")  av1 $(du -h "$base.av1.mp4" | cut -f1)  h264 $(du -h "$base.h264.mp4" | cut -f1)"
}

for src in "$@"; do
  name="$(basename "${src%.*}")"
  IFS=, read -r W H <<<"$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$src")"
  dur="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$src")"
  echo "$name: ${W}x${H}, ${dur}s"

  for h in 2160 1440 1080 720; do
    if (( H >= h )); then encode "$src" "scale=-2:$h:flags=lanczos" "$OUT/$name-${h}p"; fi
  done

  # Portrait 9:16 crops for phones (horizontal position set by CROP_X).
  for ph in 1920 1280; do
    pw=$(( ph * 9 / 16 ))
    if (( H >= ph )) && (( W * 16 >= H * 9 )); then
      encode "$src" "crop=ih*9/16:ih:(iw-ih*9/16)*$CROP_X:0,scale=$pw:$ph:flags=lanczos" "$OUT/$name-p${ph}"
    fi
  done

  # Poster frame (AVIF) from 1 s in (or the first frame for very short clips).
  t=$(awk -v d="$dur" 'BEGIN{print (d > 2) ? 1 : 0}')
  ffmpeg -hide_banner -loglevel error -y -ss "$t" -i "$src" -frames:v 1 -vf "scale=-2:min(ih\,1080)" -c:v libaom-av1 -still-picture 1 -crf 28 "$OUT/$name-poster.avif"
  echo "  ✓ poster"
done
