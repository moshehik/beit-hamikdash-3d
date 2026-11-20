# usage: python -I tools/split-sheet.py <sheet.jpg> <sheet.json> <out_dir> [size=192]
# מפצל גיליון איקונים (רשת על רקע ירוק #00FF00) לקבצי PNG שקופים, אחד לכל מפתח: מסיר רקע ירוק, מוצא את האיקונים לפי רווחים ירוקים (הקרנות שורות ועמודות) וממרכז כל אחד בריבוע.
import sys, os, json, numpy as np
from PIL import Image, ImageFilter

src, meta_f, out = sys.argv[1], sys.argv[2], sys.argv[3]
SIZE = int(sys.argv[4]) if len(sys.argv) > 4 else 192
meta = json.load(open(meta_f, encoding='utf8'))
cols, rows, keys = meta['cols'], meta['rows'], meta['keys']
im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(np.float32); r, g, b = a[..., 0], a[..., 1], a[..., 2]
d = g - np.maximum(r, b)
al = np.clip(1 - (d - 30) / (120 - 30), 0, 1)
A = Image.fromarray((al * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
al = np.asarray(A).astype(np.float32) / 255
a[..., 1] = np.minimum(g, np.maximum(r, b) + 6)   # despill
rgba = np.dstack([a, al * 255]).clip(0, 255).astype(np.uint8)
mask = al > 0.28

def runs(profile, min_gap):
    """segments of non-empty (profile>thr) separated by gaps >= min_gap"""
    thr = max(2, int(profile.max() * 0.012))
    on = profile > thr
    segs, start, gap = [], None, 0
    for i, v in enumerate(on):
        if v:
            if start is None: start = i
            gap = 0; last = i
        else:
            if start is not None:
                gap += 1
                if gap >= min_gap:
                    segs.append((start, last)); start = None; gap = 0
    if start is not None: segs.append((start, last))
    return segs

H, W = mask.shape
row_segs = runs(mask.sum(axis=1), max(6, H // (rows * 14)))
# merge/split to exactly `rows` bands: if count differs, fall back to even bands
if len(row_segs) != rows:
    row_segs = [(int(i * H / rows), int((i + 1) * H / rows) - 1) for i in range(rows)]
cells = []
for (y0, y1) in row_segs:
    band = mask[y0:y1 + 1]
    cs = runs(band.sum(axis=0), max(6, W // (cols * 14)))
    if len(cs) != cols:
        cs = [(int(i * W / cols), int((i + 1) * W / cols) - 1) for i in range(cols)]
    for (x0, x1) in cs:
        cells.append((x0, y0, x1, y1))
os.makedirs(out, exist_ok=True)
report = []
for k, (x0, y0, x1, y1) in zip(keys, cells):
    sub = rgba[y0:y1 + 1, x0:x1 + 1]
    img = Image.fromarray(sub, 'RGBA')
    bb = img.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    if not bb:
        report.append((k, 'EMPTY')); continue
    img = img.crop(bb)
    s = max(img.size); pad = int(s * 0.06)
    canvas = Image.new('RGBA', (s + 2 * pad, s + 2 * pad), (0, 0, 0, 0))
    canvas.paste(img, ((s + 2 * pad - img.width) // 2, (s + 2 * pad - img.height) // 2), img)
    canvas = canvas.resize((SIZE, SIZE), Image.LANCZOS)
    canvas.save(os.path.join(out, k + '.png'), optimize=True)
    report.append((k, '%dx%d' % (bb[2] - bb[0], bb[3] - bb[1])))
print(len(cells), 'cells for', len(keys), 'keys;', ' '.join('%s:%s' % r for r in report))
# contact sheet for quick visual review
cs = Image.new('RGB', (cols * 160, rows * 190), (40, 38, 80))
from PIL import ImageDraw
dr = ImageDraw.Draw(cs)
for idx, k in enumerate(keys):
    fp = os.path.join(out, k + '.png')
    if os.path.exists(fp):
        t = Image.open(fp).resize((150, 150)); cs.paste(t, ((idx % cols) * 160 + 5, (idx // cols) * 190 + 5), t)
    dr.text(((idx % cols) * 160 + 5, (idx // cols) * 190 + 160), k[-24:], fill=(255, 233, 160))
cs.save(os.path.join(out, '_contact.png'))
