"""Colourise black-and-white photos with Zhang et al.'s model (OpenCV DNN).

The model only predicts colour (the a/b channels of Lab) at 224x224; that colour is
upscaled and recombined with each photo's original full-resolution lightness, so
no detail is lost. PNG alpha is preserved.

Setup (one-off, all inside the git-ignored .cache/):
    python -m venv .cache/venv
    .cache/venv/Scripts/python -m pip install "opencv-python<5" numpy pillow
    # model files in .cache/colorization/: colorization_deploy_v2.prototxt,
    # colorization_release_v2.caffemodel, pts_in_hull.npy (richzhang/colorization)

Usage:
    .cache/venv/Scripts/python scripts/colorize.py <outdir> <strength 0-1> <image> [<image> ...]
"""
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

MODEL_DIR = Path(".cache/colorization")


def load_net() -> cv2.dnn.Net:
    net = cv2.dnn.readNetFromCaffe(
        str(MODEL_DIR / "colorization_deploy_v2.prototxt"),
        str(MODEL_DIR / "colorization_release_v2.caffemodel"),
    )
    # 313 cluster centres of the quantised ab colour space, as 1x1 conv kernels
    pts = np.load(MODEL_DIR / "pts_in_hull.npy", allow_pickle=False).transpose().reshape(2, 313, 1, 1)
    net.getLayer(net.getLayerId("class8_ab")).blobs = [pts.astype(np.float32)]
    net.getLayer(net.getLayerId("conv8_313_rh")).blobs = [np.full((1, 313), 2.606, dtype=np.float32)]
    return net


def colorize(net: cv2.dnn.Net, rgb: np.ndarray, strength: float = 1.0) -> np.ndarray:
    """rgb: HxWx3 uint8 -> colourised HxWx3 uint8. strength scales the predicted colour."""
    img = rgb.astype(np.float32) / 255.0
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2Lab)
    small_l = cv2.cvtColor(cv2.resize(img, (224, 224)), cv2.COLOR_RGB2Lab)[:, :, 0] - 50  # mean-centred
    net.setInput(cv2.dnn.blobFromImage(small_l))
    ab = net.forward()[0].transpose((1, 2, 0))  # 56x56x2
    ab = cv2.resize(ab, (rgb.shape[1], rgb.shape[0])) * strength
    out = np.concatenate([lab[:, :, :1], ab], axis=2)
    out = np.clip(cv2.cvtColor(out, cv2.COLOR_Lab2RGB), 0, 1)
    return (out * 255).round().astype(np.uint8)


def flatten(src: Image.Image) -> Image.Image:
    """Put transparent images on white, so hidden pixels under the alpha don't colour the edges."""
    if src.mode != "RGBA":
        return src.convert("RGB")
    bg = Image.new("RGB", src.size, "white")
    bg.paste(src, mask=src.getchannel("A"))
    return bg


def main(outdir: str, strength: float, paths: list[str]) -> None:
    out = Path(outdir)
    out.mkdir(parents=True, exist_ok=True)
    net = load_net()
    for p in map(Path, paths):
        src = Image.open(p)
        alpha = src.getchannel("A") if src.mode == "RGBA" else None
        coloured = Image.fromarray(colorize(net, np.asarray(flatten(src)), strength))
        if alpha is not None:
            coloured.putalpha(alpha)
            coloured.save(out / p.name, optimize=True)
        else:
            coloured.save(out / p.name, quality=85, optimize=True)
        print(f"{p.name} -> {out / p.name}")


if __name__ == "__main__":
    main(sys.argv[1], float(sys.argv[2]), sys.argv[3:])
