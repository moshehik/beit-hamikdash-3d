# python -I tools/pack-people.py [--cell-h 288] [--q 74]
# Takes the green-screen sheets tools/people-work/<kind>-<view>-<x>.jpg (view = front|back), keys the green out, splits every person
# (connected components), normalises each to the same scale, and packs them into ONE atlas per kind+view:
#   assets/people/atlas-<kind>-<view>.webp  +  src/people_real.js  (LAZY chunk: window.REAL_PEOPLE = {cell:[w,h], kinds:{man:{front:{b64,n,cols,cells:[[x,y,w,h,hFrac]...]},back:{...}}}})
# base64 is raw (no data: prefix, Netfree rule in ICONS_RULE.md); decoded to Blobs at runtime.
import sys, os, json, glob, base64, re, io
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
work = os.path.join(here, 'people-work'); outdir = os.path.join(root, 'assets', 'people')
args = sys.argv[1:]
def opt(n, d): return type(d)(args[args.index(n) + 1]) if n in args else d
CELL_H = opt('--cell-h', 288)      # height of the tallest person in a kind (px); other people scale relative to it (keeps relative heights)
Q = opt('--q', 74)
os.makedirs(outdir, exist_ok=True)

def key_sheet(path):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = g - np.maximum(r, b)
    al = np.clip(1 - (d - 28) / (100 - 28), 0, 1)
    A = Image.fromarray((al * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    al = np.asarray(A).astype(np.float32) / 255
    a[..., 1] = np.minimum(g, np.maximum(r, b) + 6)          # despill
    return np.dstack([a, al * 255]).clip(0, 255).astype(np.uint8)

def bleed(im):
    """copy the colour of the nearest opaque pixel into the fully/partly transparent ones (no dark halo with mipmaps/linear filtering)"""
    a = np.asarray(im).copy(); al = a[..., 3]; solid = al > 200
    if solid.all() or not solid.any(): return im
    idx = ndi.distance_transform_edt(~solid, return_distances=False, return_indices=True)
    rgb = a[..., :3][idx[0], idx[1]]
    a[..., :3] = np.where((al > 200)[..., None], a[..., :3], rgb)
    return Image.fromarray(a, 'RGBA')

def people_of(path):
    """list of RGBA crops, one per person (connected blobs, small specks dropped, nearby blobs of the same person merged)"""
    rgba = key_sheet(path); mask = rgba[..., 3] > 70
    # merge a person's parts (stool legs, hands, mantle fringes) by a dilation before labelling
    grown = ndi.binary_dilation(mask, iterations=14)
    lab, n = ndi.label(grown)
    objs = ndi.find_objects(lab)
    H, W = mask.shape; out = []
    for i, sl in enumerate(objs):
        m = (lab[sl] == i + 1) & mask[sl]
        area = m.sum()
        h = sl[0].stop - sl[0].start
        if area < 0.0012 * H * W or h < 0.25 * H * 0.5: continue
        crop = rgba[sl].copy(); crop[..., 3] = np.where(ndi.binary_dilation(m, iterations=2), crop[..., 3], 0)
        img = Image.fromarray(crop, 'RGBA'); bb = img.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
        if not bb: continue
        touch = sl[0].start <= 2 or sl[1].start <= 2 or sl[0].stop >= H - 2 or sl[1].stop >= W - 2
        if touch: print('  skip (touches the frame):', os.path.basename(path), sl); continue
        out.append((sl[1].start, sl[0].start, img.crop(bb)))
    out.sort(key=lambda t: (round(t[1] / (H / 2.2)), t[0]))   # row-major
    return [t[2] for t in out]

meta = {'cellH': CELL_H, 'kinds': {}}
sheets = sorted(glob.glob(os.path.join(work, '*-*-*.jpg')))
groups = {}
for p in sheets:
    m = re.match(r'(\w+)-(front|back)-(\w+)\.jpg$', os.path.basename(p))
    if m: groups.setdefault((m.group(1), m.group(2)), []).append(p)
for (kind, view), paths in sorted(groups.items()):
    ppl = []
    for p in paths:
        got = people_of(p); print(kind, view, os.path.basename(p), len(got), 'people'); ppl += got
    if not ppl: continue
    hmax = max(i.height for i in ppl)
    cells = []
    for i in ppl:
        s = CELL_H / hmax; w = max(8, round(i.width * s)); h = max(8, round(i.height * s))
        cells.append(bleed(i.resize((w, h), Image.LANCZOS)))
    # shelf-pack into a 1024-wide atlas, padded by 2px (bleed-safe with premultiplied alpha)
    AW = 1024; x = y = rowh = 0; pos = []
    for c in cells:
        if x + c.width + 2 > AW: x = 0; y += rowh + 2; rowh = 0
        pos.append((x, y)); x += c.width + 2; rowh = max(rowh, c.height)
    AH = 1
    while AH < y + rowh + 2: AH *= 2
    atlas = Image.new('RGBA', (AW, AH), (0, 0, 0, 0))
    for c, (px, py) in zip(cells, pos): atlas.paste(c, (px, py))
    f = os.path.join(outdir, f'atlas-{kind}-{view}.webp'); atlas.save(f, 'WEBP', quality=Q, method=6, alpha_quality=80)
    sz = os.path.getsize(f)
    meta['kinds'].setdefault(kind, {})[view] = {'file': os.path.basename(f), 'w': AW, 'h': AH,
        'cells': [[px, py, c.width, c.height, round(c.height / CELL_H, 3)] for c, (px, py) in zip(cells, pos)], 'bytes': sz}
    print(f'  -> {os.path.basename(f)} {AW}x{AH}, {len(cells)} cells, {sz/1024:.0f} KB')

# one JSON (raw base64 WebP atlases, no data: prefix): fetched lazily by the live site (site/publish.mjs -> p/people.<hash>.json) or embedded with REAL=1 node build.js
out = {'cellH': CELL_H, 'kinds': {}}
for kind, views in meta['kinds'].items():
    for view, v in views.items():
        b64 = base64.b64encode(open(os.path.join(outdir, v['file']), 'rb').read()).decode()
        out['kinds'].setdefault(kind, {})[view] = {'w': v['w'], 'h': v['h'], 'cells': v['cells'], 'b64': b64}
fo = os.path.join(outdir, 'people.json'); json.dump(out, open(fo, 'w'), separators=(',', ':'))
tot = sum(v['bytes'] for k in meta['kinds'].values() for v in k.values())
print('assets/people/people.json', os.path.getsize(fo) // 1024, 'KB; webp total', tot // 1024, 'KB')
json.dump(meta, open(os.path.join(outdir, 'manifest.json'), 'w'), ensure_ascii=False)
