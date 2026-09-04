#!/usr/bin/env python3
"""Draw the SE monogram and write the three icon files Next.js serves.

The favicon is *not* the portrait. At 16 pixels — the size a browser tab
actually renders — a photograph is mush, and the mark has to survive that
size before it has to look like anything else. So the tab gets a monogram
in the site's own register (void ground, signal amber, square corners) and
the portrait stays where it can be read: the header mark and the share cards.

Not part of the build. It is run by hand when the mark changes, and it
writes into `app/`:

    python3 scripts/build-mark.py

Needs Pillow. The typeface is the site's own display face, already vendored
for the share cards, so the mark and the headings are drawn with one voice.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "assets/fonts/SairaCondensed-Bold.ttf"

VOID = (8, 11, 14, 255)      # --color-void
SIGNAL = (255, 176, 32, 255)  # --color-signal

# Drawn once, big, then downsampled per target. 768 divides evenly by every
# size below (48, 32, 16 …), so no target lands on a half pixel.
MASTER = 768
PAD = 0.04  # edge to edge; at 16px every spare pixel is a stroke that reads


def draw(size: int) -> Image.Image:
    im = Image.new("RGBA", (size, size), VOID)
    d = ImageDraw.Draw(im)

    # Grow the type until it fills the box rather than guessing a point size:
    # the metrics of a condensed face are not worth predicting by hand.
    target = size * (1 - 2 * PAD)
    pt = 10
    while True:
        box = d.textbbox((0, 0), "SE", font=ImageFont.truetype(str(FONT), pt))
        if box[2] - box[0] >= target or box[3] - box[1] >= target * 0.95:
            break
        pt += 4

    font = ImageFont.truetype(str(FONT), pt)
    box = d.textbbox((0, 0), "SE", font=font)
    w, h = box[2] - box[0], box[3] - box[1]
    d.text((size / 2 - w / 2 - box[0], size / 2 - h / 2 - box[1]),
           "SE", font=font, fill=SIGNAL)
    return im


master = draw(MASTER)


def at(px: int) -> Image.Image:
    return master.resize((px, px), Image.LANCZOS)


# 192 and the .ico's 48 are multiples of 48, which is the size Google's
# favicon crawler asks for; 180 is Apple's fixed touch-icon size.
at(192).save(ROOT / "app/icon.png")
at(180).save(ROOT / "app/apple-icon.png")
at(48).save(ROOT / "app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

print("wrote app/icon.png, app/apple-icon.png, app/favicon.ico")
