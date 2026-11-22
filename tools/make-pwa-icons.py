# python tools/make-pwa-icons.py  -> site/pwa/icon-192.png, icon-512.png, icon-maskable-512.png (from assets/landing/model.png)
from PIL import Image, ImageDraw
import os
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
src = Image.open(os.path.join(root, 'assets', 'landing', 'model.png')).convert('RGBA')
def bg(n):
    im = Image.new('RGBA', (n, n)); px = im.load()
    for y in range(n):
        t = y / (n - 1)
        c = (int(58 - 40 * t), int(52 - 38 * t), int(102 - 62 * t), 255)   # #3a3466 -> #120f2a (landing sky)
        for x in range(n): px[x, y] = c
    d = ImageDraw.Draw(im); r = n * .36
    d.ellipse((n / 2 - r, n * .52 - r, n / 2 + r, n * .52 + r), fill=(201, 143, 42, 60))   # soft gold glow
    return im
def make(n, scale):
    im = bg(n); s = int(n * scale); ic = src.resize((s, s), Image.LANCZOS)
    im.alpha_composite(ic, ((n - s) // 2, (n - s) // 2 + int(n * .02))); return im.convert('RGB')
out = os.path.join(root, 'site', 'pwa'); os.makedirs(out, exist_ok=True)
make(512, .86).save(os.path.join(out, 'icon-512.png'), optimize=True)
make(192, .86).save(os.path.join(out, 'icon-192.png'), optimize=True)
make(512, .62).save(os.path.join(out, 'icon-maskable-512.png'), optimize=True)   # maskable: art inside the 80% safe zone
print('ok')
