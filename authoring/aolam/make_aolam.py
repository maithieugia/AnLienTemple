"""Áo lam (đồ lam đi chùa) for the male online pilgrim (Rocketbox Male_Adult_08, MIT):
recolours the shirt to temple grey-blue and the jeans to a deeper lam, keeping the cloth folds (luminance), skin, buttons and shoes.
In:  authoring/aolam/src-1-m014_body_color.jpg (extracted from the GLB)
Out: public/assets/chars/ready-made/rocketbox/m014_body_aolam.jpg + authoring/aolam/preview.jpg
Run: python authoring/aolam/make_aolam.py"""
import os
from PIL import Image
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
src = np.asarray(Image.open(os.path.join(HERE, 'src-1-m014_body_color.jpg')).convert('RGB')).astype(np.float32) / 255
r, g, b = src[..., 0], src[..., 1], src[..., 2]
lum = .299 * r + .587 * g + .114 * b
blue = b - r                      # shirt and jeans are clearly bluer than skin, shoes and background
cloth = blue > .045
shirt = cloth & (lum > .42)
# the two jeans panels sit in the top corners of the UV layout (Rocketbox m014): take the whole panel, not only its bluer pixels
H, W = lum.shape
yy, xx = np.mgrid[0:H, 0:W]
panel = (yy < H * .43) & ((xx < W * .275) | (xx > W * .725))
jeans = panel & (lum > .045)
shirt = shirt & ~panel

def tone(mask, colour, mean_target):
    out = np.zeros_like(src)
    m = lum[mask].mean()
    k = np.clip(lum / m, .35, 1.6)[..., None]          # keep folds and seams
    c = np.array(colour, np.float32) / 255
    out[...] = np.clip(c * k * mean_target, 0, 1)
    return out

# id suffix, shirt colour, trousers colour (plain cloth, anh Thanh 2026-11-04: "thêm 5 màu nữa, màu trơn ko hoa văn")
COLOURS = [('', (88, 104, 122), (62, 75, 90))]           # áo lam (grey-blue); men now wear Nam 01 (authoring/nam01/make_colours.py)
_UNUSED = [
           ('-nau', (112, 86, 62), (82, 63, 46)),         # nâu sồng
           ('-xam', (122, 124, 126), (86, 88, 92)),       # xám tro
           ('-trang', (214, 207, 190), (176, 168, 150)),  # trắng ngà
           ('-reu', (92, 106, 76), (66, 78, 56)),         # xanh rêu
           ('-dam', (58, 72, 104), (42, 52, 76))]         # lam đậm
for suffix, shirt_c, pants_c in COLOURS:
    res = src.copy()
    res[shirt] = tone(shirt, shirt_c, 1.0)[shirt]
    res[jeans] = tone(jeans, pants_c, 1.0)[jeans]
    # soften the jeans' worn highlights so they read as plain cloth
    res[jeans] = res[jeans] * .8 + res[jeans].mean(axis=0) * .2
    img = Image.fromarray((res * 255).astype(np.uint8))
    out = os.path.join(ROOT, 'public', 'assets', 'chars', 'ready-made', 'rocketbox', f'm014_body_aolam{suffix}.jpg')
    img.save(out, quality=90)
    img.resize((256, 256)).save(os.path.join(HERE, f'preview{suffix}.jpg'), quality=85)
    print('wrote', out)
print('shirt px', int(shirt.sum()), 'jeans px', int(jeans.sum()))
