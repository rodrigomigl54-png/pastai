#!/usr/bin/env python3
"""Build lean, self-hosted WOFF2 font subsets for the Pastai site.

Sources come from the Fontsource npm packages (installed as devDependencies).
Each family is split in two files, wired together with `unicode-range`:
  * "core" - Basic Latin + the Latin-1 punctuation/symbols we actually use
  * "sr"   - only the Serbian Latin diacritics (č ć đ š ž + capitals) and
             a couple of typographic extras from Latin Extended

Usage: pip install fonttools brotli && python3 scripts/build_fonts.py
"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
NM = ROOT / "node_modules"
OUT = ROOT / "src" / "assets" / "fonts"
OUT.mkdir(parents=True, exist_ok=True)

CORE = "U+0020-007E,U+00A0,U+00A9,U+00AB,U+00B7,U+00BB,U+00D7,U+2013,U+2014,U+2018,U+2019,U+201A,U+201C,U+201D,U+201E,U+2022,U+2026,U+20AC,U+2122,U+2212"
SR = "U+010C,U+010D,U+0106,U+0107,U+0110,U+0111,U+0160,U+0161,U+017D,U+017E"

# Headings: Fraunces, pinned to static instances (the full variable file is
# ~35 KB per subset; a static cut is ~15 KB). SOFT 50 gives gently rounded,
# "dough-like" serifs; opsz 32 is tuned for our moderate heading sizes.
# Fraunces was chosen over Cormorant Garamond because Cormorant's tall,
# detached carons look broken on Serbian č/š/ž in headings.
FRAUNCES = "@fontsource-variable/fraunces/files/fraunces-{subset}-full-{style}.woff2"
FR_AXES = {"opsz": 32, "SOFT": 50, "WONK": 0}

SOURCES = {
    # name: (latin file, latin-ext file, axis pins or None to keep variable)
    "fraunces-500": (FRAUNCES.format(subset="latin", style="normal"),
                     FRAUNCES.format(subset="latin-ext", style="normal"), {**FR_AXES, "wght": 500}),
    "fraunces-600": (FRAUNCES.format(subset="latin", style="normal"),
                     FRAUNCES.format(subset="latin-ext", style="normal"), {**FR_AXES, "wght": 600}),
    "fraunces-500i": (FRAUNCES.format(subset="latin", style="italic"),
                      FRAUNCES.format(subset="latin-ext", style="italic"), {**FR_AXES, "wght": 500}),
    # Body: Manrope stays variable (one file covers every weight we use).
    "manrope-var": ("@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
                    "@fontsource-variable/manrope/files/manrope-latin-ext-wght-normal.woff2", None),
}


def parse_ranges(spec: str) -> list[int]:
    cps: list[int] = []
    for part in spec.split(","):
        part = part.strip().removeprefix("U+")
        if "-" in part:
            a, b = part.split("-")
            cps.extend(range(int(a, 16), int(b, 16) + 1))
        else:
            cps.append(int(part, 16))
    return cps


def build(src: Path, dest: Path, unicodes: list[int], axes: dict | None) -> None:
    opts = subset.Options()
    opts.flavor = "woff2"
    # Keep every OpenType feature: ccmp/mark/mkmk position the carons on č š ž.
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    opts.hinting = False
    opts.desubroutinize = True
    font = TTFont(src)
    if axes:
        font = instancer.instantiateVariableFont(font, axes)
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=unicodes)
    sub.subset(font)
    font.flavor = "woff2"
    font.save(dest)
    print(f"{dest.relative_to(ROOT)}  {dest.stat().st_size / 1024:.1f} KB")


for name, (latin, ext, axes) in SOURCES.items():
    build(NM / latin, OUT / f"{name}-core.woff2", parse_ranges(CORE), axes)
    build(NM / ext, OUT / f"{name}-sr.woff2", parse_ranges(SR), axes)
