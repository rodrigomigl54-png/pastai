#!/usr/bin/env python3
"""Generate the seamless "fresh egg-dough" texture used by the ribbon/thread.

Colour is sampled from the real pasta in src/assets/photos/spaghetti-viljuska.jpg
(median strand colour), lightened towards raw-dough cream. Surface detail is
periodic (FFT-filtered) noise, so the tile is seamless by construction:
  * low-frequency mottling (uneven rolling thickness)
  * fine grain (dough surface)
  * semolina specks (darker) and flour dust (lighter, sparse)
TODO: replace with a texture cut from a real photo of rolled dough once the
owner supplies one (see docs/faza-1-revizija.md, section 5).
"""
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src/assets/photos/spaghetti-viljuska.jpg"
OUT = ROOT / "src/assets/texture"
N = 512  # 2x of a 256 CSS-px tile
rng = np.random.default_rng(2016)

# --- colour from the real photo -------------------------------------------
img = cv2.imread(str(SRC))
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
mask = (hsv[..., 1] > 70) & (hsv[..., 2] > 150) & (hsv[..., 0] > 12) & (hsv[..., 0] < 35)
pasta = np.median(img[mask], axis=0)[::-1]            # RGB, cooked strand
cream = np.array([242, 226, 190])                       # raw dough highlight
base = pasta * 0.45 + cream * 0.55


def periodic_noise(n, lo, hi, power=1.0):
    """Band-limited noise that tiles perfectly (built in the frequency domain)."""
    f = np.fft.fftfreq(n)
    fx, fy = np.meshgrid(f, f)
    r = np.sqrt(fx**2 + fy**2) * n
    spec = (rng.normal(size=(n, n)) + 1j * rng.normal(size=(n, n)))
    band = ((r >= lo) & (r <= hi)) / np.maximum(r, 1) ** power
    out = np.real(np.fft.ifft2(spec * band))
    return (out - out.mean()) / (out.std() + 1e-9)


mottle = periodic_noise(N, 1, 6, 0.5)
grain = periodic_noise(N, 60, 220, 0.0)
mid = periodic_noise(N, 10, 40, 0.8)

lum = 1 + 0.018 * mottle + 0.01 * mid + 0.03 * grain
rgb = base[None, None, :] * lum[..., None]

# semolina specks: sparse, slightly larger, warm brown-gold
specks = periodic_noise(N, 90, 256, 0.0)
sm = np.clip((specks - 2.5) * 1.6, 0, 1)
rgb = rgb * (1 - 0.3 * sm[..., None]) + np.array([176, 128, 66]) * 0.3 * sm[..., None]

# flour dust: soft, low-frequency patches gated by fine noise
dust = np.clip(periodic_noise(N, 3, 12, 0.6) - 0.6, 0, None) * np.clip(periodic_noise(N, 100, 256, 0.0) - 1.2, 0, 1)
rgb = rgb + (255 - rgb) * np.clip(dust * 0.55, 0, 0.45)[..., None]

rgb = np.clip(rgb, 0, 255).astype(np.uint8)
bgr = rgb[..., ::-1]
OUT.mkdir(parents=True, exist_ok=True)
# PNG master not kept; WebP below is the shipped asset
print("base RGB", base.astype(int))
cv2.imwrite(str(OUT / "dough.webp"), bgr, [cv2.IMWRITE_WEBP_QUALITY, 62])
print("dough.webp", (OUT / "dough.webp").stat().st_size // 1024, "KB")
