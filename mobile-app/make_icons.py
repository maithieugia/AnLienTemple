"""App icon for Chùa Online An Liên: three burning incense sticks in a bronze censer on red lacquer with a gold ring.
Writes Android launcher icons (legacy + round + adaptive foreground) into android/app/src/main/res.
Run: python mobile-app/make_icons.py"""
import math, os
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.join(HERE, 'android', 'app', 'src', 'main', 'res')
S = 1024


def art(size, pad):
    """Censer + three sticks + smoke, drawn inside a square of `size` leaving `pad` px margin (transparent background)."""
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    w = size - 2 * pad; cx = size / 2; base = pad + w * .78
    # smoke
    sm = Image.new('RGBA', (size, size), (0, 0, 0, 0)); sd = ImageDraw.Draw(sm)
    for k, (ox, top) in enumerate([(-.14, .30), (0, .22), (.14, .30)]):
        x0 = cx + ox * w; y0 = pad + w * top
        for i in range(14):
            t = i / 13; x = x0 + math.sin(t * 5 + k) * w * .05; y = y0 - t * w * .18; r = w * (.018 + .03 * t)
            sd.ellipse([x - r, y - r, x + r, y + r], fill=(245, 240, 232, int(120 * (1 - t))))
    im.alpha_composite(sm.filter(ImageFilter.GaussianBlur(w * .012)))
    # sticks
    for ox, top in [(-.14, .30), (0, .22), (.14, .30)]:
        x_top = cx + ox * w; x_bot = cx + ox * w * .25; y_top = pad + w * top
        d.line([(x_bot, base - w * .05), (x_top, y_top)], fill=(48, 16, 8, 255), width=max(4, int(w * .036)))
        d.line([(x_bot, base - w * .05), (x_top, y_top)], fill=(214, 84, 46, 255), width=max(2, int(w * .012)))
        d.line([(x_bot + (x_top - x_bot) * .12, base - w * .05 - (base - w * .05 - y_top) * .12), (x_bot + (x_top - x_bot) * .17, base - w * .05 - (base - w * .05 - y_top) * .17)], fill=(232, 192, 106, 255), width=max(4, int(w * .045)))
        g = w * .045
        glow = Image.new('RGBA', (size, size), (0, 0, 0, 0)); gd = ImageDraw.Draw(glow)
        gd.ellipse([x_top - g * 2, y_top - g * 2, x_top + g * 2, y_top + g * 2], fill=(255, 140, 50, 150))
        im.alpha_composite(glow.filter(ImageFilter.GaussianBlur(g)))
        d.ellipse([x_top - g * .55, y_top - g * .55, x_top + g * .55, y_top + g * .55], fill=(255, 226, 150, 255))
    # censer: bowl, rim, handles, legs
    bw = w * .62; top = base - w * .12
    gold, dark = (214, 168, 84, 255), (120, 82, 34, 255)
    for sx in (-1, 1):
        d.arc([cx + sx * bw * .46 - w * .07, top - w * .02, cx + sx * bw * .46 + w * .07, top + w * .1], 0, 360, fill=gold, width=max(3, int(w * .02)))
    d.pieslice([cx - bw / 2, top - w * .17, cx + bw / 2, top + w * .2], 0, 180, fill=gold)
    d.rectangle([cx - bw / 2, top - w * .005, cx + bw / 2, top + w * .02], fill=gold)
    d.ellipse([cx - bw / 2, top - w * .03, cx + bw / 2, top + w * .03], fill=dark)
    d.ellipse([cx - bw * .43, top - w * .02, cx + bw * .43, top + w * .02], fill=(150, 140, 128, 255))
    for lx in (-.3, 0, .3):
        x = cx + lx * bw; d.polygon([(x - w * .035, top + w * .16), (x + w * .035, top + w * .16), (x + w * .022, top + w * .26), (x - w * .022, top + w * .26)], fill=gold)
    d.arc([cx - bw * .3, top + w * .04, cx, top + w * .1], 0, 180, fill=dark, width=max(2, int(w * .008)))
    d.arc([cx, top + w * .04, cx + bw * .3, top + w * .1], 0, 180, fill=dark, width=max(2, int(w * .008)))
    return im


def background(size):
    bg = Image.new('RGBA', (size, size)); px = bg.load()
    for y in range(size):
        for x in range(size):
            r = math.hypot(x - size / 2, y - size * .45) / (size * .72)
            t = min(1, r)
            px[x, y] = (int(150 - 95 * t), int(40 - 26 * t), int(22 - 14 * t), 255)
    d = ImageDraw.Draw(bg)
    d.ellipse([size * .06, size * .06, size * .94, size * .94], outline=(214, 168, 84, 255), width=int(size * .022))
    return bg


full = background(S); full.alpha_composite(art(S, int(S * .14)))
os.makedirs(os.path.join(HERE, 'store'), exist_ok=True); full.convert('RGB').save(os.path.join(HERE, 'store', 'icon-1024.png'))
mask = Image.new('L', (S, S), 0); ImageDraw.Draw(mask).ellipse([0, 0, S, S], fill=255)
roundi = full.copy(); roundi.putalpha(mask)
fg = art(S, int(S * .28))  # adaptive foreground keeps the art inside the 66% safe zone
for folder, px in {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}.items():
    out = os.path.join(RES, 'mipmap-' + folder)
    full.resize((px, px), Image.LANCZOS).save(os.path.join(out, 'ic_launcher.png'))
    roundi.resize((px, px), Image.LANCZOS).save(os.path.join(out, 'ic_launcher_round.png'))
    fgpx = int(px * 108 / 48)
    fg.resize((fgpx, fgpx), Image.LANCZOS).save(os.path.join(out, 'ic_launcher_foreground.png'))
with open(os.path.join(RES, 'values', 'ic_launcher_background.xml'), 'w', encoding='utf-8') as f:
    f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#6E1A10</color>\n</resources>\n')
print('icons written')
