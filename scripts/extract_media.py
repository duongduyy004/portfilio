"""Extract the portfolio's photos from the source .pptx.

Usage: python scripts/extract_media.py <deck.pptx> <outdir>
"""
import io
import sys
import zipfile
from pathlib import Path

from PIL import Image

MAX_SIDE = 2000

# output name -> media file inside ppt/media/
MEDIA = {
    "portrait.png": "image7.png",
    "mor-fb-insights.jpg": "image18.png",
    "mor-content-library.jpg": "image19.png",
    "mor-trip-group.jpg": "image20.jpeg",
    "mor-trip-street.jpg": "image21.jpeg",
    "mor-birthday.jpg": "image23.png",
    "mor-sports-mc.jpg": "image24.JPG",
    "mor-pickleball.jpg": "image25.JPG",
    "fm-trend-sheet.jpg": "image29.png",
    "fm-yt-stats.jpg": "image30.png",
    "fm-tiktok-1.jpg": "image31.png",
    "fm-tiktok-2.jpg": "image32.png",
    "fm-tiktok-3.jpg": "image36.png",
    "fm-boysday-1.jpg": "image37.png",
    "fm-boysday-2.jpg": "image38.png",
    "meraces-yt-stats.jpg": "image28.png",
    "meraces-shorts.jpg": "image27.jpeg",
    "meraces-jobad.jpg": "image33.png",
    "meraces-threads.jpg": "image34.png",
    "buddy-1.jpg": "image43.jpeg",
    "buddy-2.jpg": "image45.jpeg",
    "ndc-club.jpg": "image47.jpeg",
    "hallym.jpg": "image10.jpeg",
    "insta-vocab.jpg": "image57.jpeg",
    "photo-1.jpg": "image50.png",
    "photo-2.jpg": "image52.png",
}


def flatten(im: Image.Image) -> Image.Image:
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, "white")
        bg.paste(im, mask=im.split()[3])
        return bg
    return im.convert("RGB")


def main(deck: str, outdir: str) -> None:
    out = Path(outdir)
    out.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(deck) as z:
        for name, src in MEDIA.items():
            im = Image.open(io.BytesIO(z.read(f"ppt/media/{src}")))
            if name.endswith(".png"):
                im = im.convert("RGBA")
                im.thumbnail((800, 800))
                im.save(out / name, optimize=True)
            else:
                im = flatten(im)
                im.thumbnail((MAX_SIDE, MAX_SIDE))
                im.save(out / name, quality=85, optimize=True)
            print(f"{src} -> {name} {im.size}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
