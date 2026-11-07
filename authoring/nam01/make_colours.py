"""Plain áo lam colours for Nam 01 (anh Thanh 2026-11-04: "thêm 5 màu nữa, màu trơn ko hoa văn", men = Nam 01 only).
Recolours the cloth of Nam 01's base colour map (light grey-blue, bluer than skin, hair, beads and soles), keeping its folds.
In:  authoring/nam01/tex/img1.jpeg (base colour extracted from nam-01/model.glb)
Out: public/assets/chars/ready-made/nam-01/diffuse-<id>.jpg (+ authoring/nam01/tex/colours.jpg)
Run: python authoring/nam01/make_colours.py"""
import os
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
src = np.asarray(Image.open(os.path.join(HERE, 'tex', 'img1.jpeg')).convert('RGB')).astype(np.float32) / 255
r, g, b = src[..., 0], src[..., 1], src[..., 2]
lum = .299 * r + .587 * g + .114 * b
w = np.clip(((b - r) - .015) / .04, 0, 1) * np.clip((lum - .30) / .08, 0, 1)   # soft cloth mask
m = lum[w > .9].mean()
COLOURS = [('nau', (122, 94, 68)), ('xam', (128, 130, 133)), ('trang', (222, 214, 196)), ('reu', (98, 113, 80)), ('dam', (62, 78, 112))]
row = [Image.fromarray((src * 255).astype(np.uint8)).resize((256, 256))]
for cid, col in COLOURS:
    k = np.clip(lum / m, .45, 1.45)[..., None]
    c = np.array(col, np.float32) / 255
    out = src * (1 - w[..., None]) + np.clip(c * k, 0, 1) * w[..., None]
    img = Image.fromarray((out * 255).astype(np.uint8))
    img.save(os.path.join(ROOT, 'public', 'assets', 'chars', 'ready-made', 'nam-01', f'diffuse-{cid}.jpg'), quality=86)
    row.append(img.resize((256, 256)))
sheet = Image.new('RGB', (256 * len(row), 256))
for i, im in enumerate(row): sheet.paste(im, (256 * i, 0))
sheet.save(os.path.join(HERE, 'tex', 'colours.jpg'), quality=85)
print('cloth mean lum', round(float(m), 3), 'cloth px', int((w > .5).sum()))
