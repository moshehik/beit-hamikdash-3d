# python tools/make-world-map.py -> src/world_img.js : stylized map (Mediterranean -> India) used by the Yom Kippur "zoom out" cinematic.
# Source: lib/land-110m.json (Natural Earth land, topojson). Output: raw base64 WebP (no data: prefix, Netfree rule) appended to MAP_IMG as MAP_IMG.world.
# Region: lon LON0..LON1, lat LAT0..LAT1, equirectangular; src/world3d.js uses the same constants.
import json, os, io, base64, math, random
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
LON0, LON1, LAT0, LAT1 = 10.0, 90.0, -5.0, 52.0
PPD = 24                                  # pixels per degree
W, H = int((LON1 - LON0) * PPD), int((LAT1 - LAT0) * PPD)
j = json.load(open(os.path.join(ROOT, 'lib', 'land-110m.json'), encoding='utf8'))
sx, sy = j['transform']['scale']; tx, ty = j['transform']['translate']
arcs = []
for a in j['arcs']:
    x = y = 0; pts = []
    for dx, dy in a:
        x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
    arcs.append(pts)
def ring(idx):
    out = []
    for i in idx:
        pts = arcs[i] if i >= 0 else arcs[~i][::-1]
        out.extend(pts if not out else pts[1:])
    return out
def px(lon, lat): return ((lon - LON0) * PPD, (LAT1 - lat) * PPD)
land = Image.new('L', (W, H), 0); d = ImageDraw.Draw(land)
for poly in j['objects']['land']['geometries'][0]['arcs']:
    for k, r in enumerate(poly):
        pts = [px(*p) for p in ring(r)]
        if len(pts) > 2: d.polygon(pts, fill=255 if k == 0 else 0)
# sea
sea = Image.new('RGB', (W, H)); sd = ImageDraw.Draw(sea)
for yy in range(H):
    t = yy / H; sd.line([(0, yy), (W, yy)], fill=(int(143 - 22 * t), int(193 - 20 * t), int(217 - 14 * t)))
# land colour with a little paper noise
rnd = random.Random(7); noise = Image.effect_noise((W, H), 18).convert('L')
landc = Image.new('RGB', (W, H), (233, 214, 163)); landc = Image.blend(landc, Image.merge('RGB', (noise, noise, noise)), .07)
shore = land.filter(ImageFilter.GaussianBlur(5))
img = sea.copy()
# soft shadow under the land, then land, then coast outline
sh = land.filter(ImageFilter.GaussianBlur(7)).point(lambda v: int(v * .35)); img.paste((60, 70, 80), (6, 7), sh)
img.paste(landc, (0, 0), land)
edge = land.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.MaxFilter(3)); img.paste((138, 106, 54), (0, 0), edge.point(lambda v: 200 if v > 30 else 0))
dr = ImageDraw.Draw(img, 'RGBA')
for lon in range(int(LON0), int(LON1) + 1, 10):
    x, _ = px(lon, 0); dr.line([(x, 0), (x, H)], fill=(255, 255, 255, 38), width=2)
for lat in range(int(LAT0) // 10 * 10, int(LAT1) + 1, 10):
    _, y = px(0, lat)
    if 0 <= y <= H: dr.line([(0, y), (W, y)], fill=(255, 255, 255, 38), width=2)
RIV = {'nile': [(31.0, 31.5), (31.2, 30.0), (30.8, 27.5), (32.6, 25.7), (32.9, 24.1), (32.7, 21.8), (31.5, 19), (33.5, 16), (32.5, 15.6), (32.5, 9.5)],
       'euph': [(36.0, 37.0), (38.2, 35.9), (40.2, 34.5), (42.4, 33.2), (44.0, 31.5), (47.5, 30.5)],
       'tigr': [(38.8, 38), (41, 37.3), (43, 36.2), (44.4, 33.3), (46, 32), (47.5, 30.5)],
       'indus': [(74.5, 34.5), (72.5, 31), (70.5, 28), (68, 25.5), (67.5, 24.5)],
       'ganga': [(78.5, 30.5), (80.5, 27), (84, 25.6), (88, 24), (89.5, 22.5)]}
for k, pts in RIV.items(): dr.line([px(*p) for p in pts], fill=(111, 168, 196, 255), width=5, joint='curve')
img = img.filter(ImageFilter.GaussianBlur(.6))
b = io.BytesIO(); img.save(b, 'WEBP', quality=70, method=6); w = b.getvalue()
img.resize((W // 4, H // 4)).save(os.path.join(os.environ.get('TEMP', '.'), 'world-preview.png'))
open(os.path.join(ROOT, 'src', 'world_img.js'), 'w', encoding='utf8').write(
    '/* נוצר ע"י tools/make-world-map.py – אל תערוך ידנית. מפת אזור מסוגננת (לים התיכון עד הודו) לזום־אאוט ביום הכיפורים. base64 גולמי בלי data: (נטפרי). טווח: lon %g..%g, lat %g..%g. */\n'
    'if(typeof MAP_IMG!="undefined")MAP_IMG.world="%s";\nconst WORLD_MAP_BOX=[%g,%g,%g,%g,%d,%d];\n' % (LON0, LON1, LAT0, LAT1, base64.b64encode(w).decode(), LON0, LON1, LAT0, LAT1, W, H))
print('world map', W, 'x', H, len(w) // 1024, 'KB webp')
