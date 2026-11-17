# ציור תמונת ייחוס נקייה של מפת ארץ ישראל – מהנתונים בלבד (קו החוף מ-geodata, הירדן/הכנרת/ים המלח/רכסים מ-KGEOM ב-src/kids.js).
# אותה הקרנה ואותם גבולות תצוגה כמו בדף השבטים (x=(lon-lon0)*COSL, y=lat; מלבן 2:3). צבעים שטוחים, בלי כיתוב.
#   node tools/kgeo-export.cjs <kgeo.json>
#   python -X utf8 tools/draw-base-map.py <kgeo.json> [outdir=assets/maps/ref] [height=1152]
# פלט: base_ref.png (הייחוס ל-Gemini), masks.npz (sea/land/lake מדויקים בגודל הייחוס, לאימות יישור ב-verify-basemap.py)
import sys, os, json
import numpy as np, cv2
src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'maps', 'ref')
NH = int(sys.argv[3]) if len(sys.argv) > 3 else 1152
os.makedirs(out, exist_ok=True)
G = json.load(open(src, encoding='utf-8'))
B = G['B']; COSL = 0.82; SS = 2; NW = int(round(NH * B['ar'])); MH = NH * SS; MW = NW * SS
lon0, lat0, lat1 = B['lon0'], B['lat0'], B['lat1']
pxdeg = MH / (lat1 - lat0)
def tr(flat):
    a = np.array(flat, dtype=np.float64).reshape(-1, 2)
    return np.stack([(a[:, 0] - lon0) * COSL * pxdeg, (lat1 - a[:, 1]) * pxdeg], 1)
def poly(img, flat, col):
    cv2.fillPoly(img, [np.round(tr(flat) * 16).astype(np.int32)], col, lineType=cv2.LINE_AA, shift=4)
def line(img, flat, col, w):
    cv2.polylines(img, [np.round(tr(flat) * 16).astype(np.int32)], False, col, max(1, int(round(w * SS))), lineType=cv2.LINE_AA, shift=4)
def blob_line(mask, flat, wdeg):
    p = tr(flat); r = wdeg * pxdeg / 2
    for i in range(len(p) - 1):
        d = np.linalg.norm(p[i + 1] - p[i]); n = max(1, int(d / (r * 0.4)))
        for s in range(n + 1):
            q = p[i] + (p[i + 1] - p[i]) * (s / n)
            cv2.circle(mask, (int(round(q[0] * 16)), int(round(q[1] * 16))), int(round(r * 16)), 255, -1, lineType=cv2.LINE_AA, shift=4)
SEA = (0xee, 0xc6, 0x7c)   # BGR של #7cc6ee
SAND = (0xaa, 0xdf, 0xf0)  # #f0dfaa
HILL = (0x68, 0xb8, 0x8a)  # #8ab868
MTN = (0x5a, 0x96, 0x60)   # #60965a
WATER = (0xdc, 0xa0, 0x42) # #42a0dc
img = np.zeros((MH, MW, 3), np.uint8); img[:] = SEA
land = np.zeros((MH, MW), np.uint8); poly(land, G['land'], 255)
lake = np.zeros((MH, MW), np.uint8)
for k in G['lakes']: poly(lake, G['lakes'][k], 255)
img[land > 127] = SAND
hill = np.zeros((MH, MW), np.uint8); mtn = np.zeros((MH, MW), np.uint8)
for r in G['ridges']: blob_line(mtn if r['k'] == 'm' else hill, r['p'], r['w'])
rng = np.random.default_rng(7)
def organic(m):   # קצוות לא־סדירים (רעש בתדר נמוך) כדי שהרכסים ייראו כגבעות ולא כנקניקים
    f = cv2.GaussianBlur(m, (0, 0), 6 * SS).astype(np.float32) / 255.0
    n = cv2.resize(rng.random((MH // 40, MW // 40)).astype(np.float32), (MW, MH), interpolation=cv2.INTER_CUBIC)
    n2 = cv2.resize(rng.random((MH // 14, MW // 14)).astype(np.float32), (MW, MH), interpolation=cv2.INTER_CUBIC)
    v = f + 0.5 * (n - 0.5) + 0.25 * (n2 - 0.5) * (f > 0.05)
    v = np.clip((v - 0.42) * 6.0, 0, 1)
    return (cv2.GaussianBlur(v, (0, 0), 1.5 * SS) * 255).astype(np.uint8)
hill = organic(hill); mtn = organic(mtn)
for m, c in ((hill, HILL), (mtn, MTN)):
    a = (m.astype(np.float32) / 255.0 * (land.astype(np.float32) / 255.0))[..., None]
    img = (img * (1 - a) + np.array(c, np.float32) * a).astype(np.uint8)
for k in G['lakes']: poly(img, G['lakes'][k], WATER)
for r in G['rivers']: line(img, r['p'], WATER, 6 if r['n'] == 'jordan' else 4)
ref = cv2.resize(img, (NW, NH), interpolation=cv2.INTER_AREA)
cv2.imwrite(os.path.join(out, 'base_ref.png'), ref)
l = cv2.resize(land, (NW, NH), interpolation=cv2.INTER_AREA) > 127
k_ = cv2.resize(lake, (NW, NH), interpolation=cv2.INTER_AREA) > 127
np.savez_compressed(os.path.join(out, 'masks.npz'), land=l, lake=k_, sea=~l)
print('ok', NW, 'x', NH, 'px; land %.1f%%, lakes %.2f%%' % (l.mean() * 100, k_.mean() * 100))
