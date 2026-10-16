#!/usr/bin/env python3
"""Upscale the low-resolution source photos 4x with a neural super-resolution
model (EDSR, OpenCV dnn_superres), followed by a gentle unsharp mask.

Sources: src/assets/raw/**/*.jpg  ->  src/assets/photos/<name>.jpg
Model:   EDSR_x4.pb (not committed, ~38 MB). Download once:
  curl -Lo scripts/models/EDSR_x4.pb \
    https://raw.githubusercontent.com/Saafke/EDSR_Tensorflow/master/models/EDSR_x4.pb
Usage:   pip install opencv-contrib-python-headless && python3 scripts/upscale_images.py

When real high-resolution originals arrive, drop them straight into
src/assets/photos/ (same file name) and skip this step entirely.
"""
import sys
from pathlib import Path
import cv2

ROOT = Path(__file__).resolve().parent.parent
MODEL = ROOT / "scripts" / "models" / "EDSR_x4.pb"
SRC = ROOT / "src" / "assets" / "raw"
OUT = ROOT / "src" / "assets" / "photos"
OUT.mkdir(parents=True, exist_ok=True)

if not MODEL.exists():
    sys.exit(f"Missing model: {MODEL} (see docstring)")

sr = cv2.dnn_superres.DnnSuperResImpl_create()
sr.readModel(str(MODEL))
sr.setModel("edsr", 4)

for src in sorted(SRC.rglob("*.jpg")):
    if src.name.startswith("logo"):
        continue  # the logo is vectorised instead
    dest = OUT / src.name
    if dest.exists() and dest.stat().st_mtime > src.stat().st_mtime:
        continue
    img = cv2.imread(str(src))
    up = sr.upsample(img)
    # Light unsharp mask restores micro-contrast lost by JPEG + SR smoothing.
    blur = cv2.GaussianBlur(up, (0, 0), 1.2)
    up = cv2.addWeighted(up, 1.35, blur, -0.35, 0)
    cv2.imwrite(str(dest), up, [cv2.IMWRITE_JPEG_QUALITY, 93])
    print(f"{src.name}: {img.shape[1]}x{img.shape[0]} -> {up.shape[1]}x{up.shape[0]}")
