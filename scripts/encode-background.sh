#!/usr/bin/env bash
# Prepara un video de fondo para una sección (ADR 0004).
#
# Uso:
#   bash scripts/encode-background.sh <video-original> <nombre> [segundos]
#   bash scripts/encode-background.sh ~/Videos/estudio.mov beats 15
#
# Genera en ./bg-out/:
#   <nombre>-720.mp4   compu    (H.264, sin audio, ~2-4 MB para 15 s)
#   <nombre>-480.mp4   celular  (más liviano)
#   <nombre>-poster.webp  imagen de espera (primer cuadro visible)
#
# Después: subí los tres a B2 (carpeta videos/ e images/) y pegá las URLs en
# src/content/backgrounds.js.
#
# ffmpeg: usa el del PATH o, si no hay, el que ya trae el backend (ffmpeg-static):
#   export FFMPEG="$(cd ../../backend/api-niv0web && node -e "process.stdout.write(require('ffmpeg-static'))")"
set -euo pipefail

INPUT="${1:?Falta el video original}"
NAME="${2:?Falta el nombre de la sección (ej. beats)}"
SECONDS_LIMIT="${3:-15}"
FFMPEG="${FFMPEG:-ffmpeg}"
OUT="bg-out"
mkdir -p "$OUT"

encode() {
  local height="$1" crf="$2" maxrate="$3" out="$4"
  # -an: sin audio (el navegador solo reproduce solo un video mudo)
  # +faststart: el video empieza a verse antes de terminar de bajar
  "$FFMPEG" -y -hide_banner -loglevel error -i "$INPUT" -t "$SECONDS_LIMIT" \
    -vf "scale=-2:${height},fps=30" -an \
    -c:v libx264 -preset slow -crf "$crf" -maxrate "$maxrate" -bufsize "$((${maxrate%M} * 2))M" \
    -pix_fmt yuv420p -movflags +faststart "$out"
}

encode 720 28 2M "$OUT/${NAME}-720.mp4"
encode 480 30 1M "$OUT/${NAME}-480.mp4"
"$FFMPEG" -y -hide_banner -loglevel error -ss 1 -i "$INPUT" -frames:v 1 -vf "scale=-2:720" -quality 80 "$OUT/${NAME}-poster.webp"

ls -lh "$OUT"/"${NAME}"-*
echo "Listo. Si algún mp4 pasa de ~4 MB, probá con menos segundos."
