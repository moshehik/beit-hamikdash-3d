# אימות יישור: משווה את מסכת ים/יבשה/אגמים בתמונה ש-Gemini החזיר אל מסכות הייחוס המדויקות (tools/draw-base-map.py → masks.npz).
#   python -X utf8 tools/verify-basemap.py <gemini.jpg> [masks.npz]  [--out fixed.jpg]
# מדווח: IoU של הים, סטיית קו החוף (ממוצע/p95/מקס' בפיקסלים של הייחוס), IoU של האגמים. עובר אם IoU הים > 0.9.
# עם --out: "מקבע" את התמונה – פיקסלים שבהם הים/היבשה סוטים ממסכת הייחוס נצבעים מחדש (inpaint) ממחלקת הנתונים הנכונה, כך שקו החוף זהה לנתונים בדיוק.
import sys, os, numpy as np, cv2
a = [x for x in sys.argv[1:] if not x.startswith('--')]
out = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else None
if out and out in a: a.remove(out)
img = cv2.imread(a[0]); mk = np.load(a[1] if len(a) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'maps', 'ref', 'masks.npz'))
H, W = mk['land'].shape
print('result size', img.shape[1], 'x', img.shape[0], ' ref', W, 'x', H, ' aspect result %.4f ref %.4f' % (img.shape[1] / img.shape[0], W / H))
im = cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA)
b, g, r = [im[..., i].astype(np.int32) for i in range(3)]
water = (b - r > 8) & (b >= g - 12)
water = cv2.morphologyEx(water.astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))) > 0   # סגירת חורי גלי הים הבהירים
n, lab = cv2.connectedComponents(water.astype(np.uint8))
sea = np.zeros_like(water)
for i in range(1, n):
    c = lab == i
    if c[:, 0].any() or c[0, :].any(): sea |= c   # הים = רכיב מים שנוגע בשפת התמונה
ref_sea = mk['sea']; ref_lake = mk['lake']
iou = lambda x, y: (x & y).sum() / max(1, (x | y).sum())
print('sea IoU: %.4f' % iou(sea, ref_sea))
bd = lambda m: (cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8)) > 0)
d_ref = cv2.distanceTransform((~bd(ref_sea)).astype(np.uint8), cv2.DIST_L2, 3); d_res = cv2.distanceTransform((~bd(sea)).astype(np.uint8), cv2.DIST_L2, 3)
a1 = d_ref[bd(sea)]; a2 = d_res[bd(ref_sea)]; dd = np.concatenate([a1, a2])
print('coast displacement px (ref=%dx%d): mean %.1f  p95 %.1f  max %.1f  (%.2f%% of ref height... 1 deg lat = %.0f px)' % (W, H, dd.mean(), np.percentile(dd, 95), dd.max(), dd.mean() / H * 100, H / 3.4))
inland = water & ~sea
core = cv2.morphologyEx(inland.astype(np.uint8), cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17))) > 0   # מסיר נהרות דקים (גם כאלו ש-Gemini הוסיף), משאיר אגמים
nl, ll, st, ce = cv2.connectedComponentsWithStats(ref_lake.astype(np.uint8))
for i in range(1, nl):
    x, y, w, h, ar = st[i]; pad = 40
    win = np.zeros_like(ref_lake); win[max(0, y - pad):y + h + pad, max(0, x - pad):x + w + pad] = True
    print('lake #%d (area %d px, centre %.0f,%.0f): IoU %.3f' % (i, ar, ce[i][0], ce[i][1], iou(core & win, ll == i)))
ok = iou(sea, ref_sea) > 0.9
print('PASS (IoU>0.9)' if ok else 'FAIL')
if out:
    full = img.copy(); FH, FW = full.shape[:2]
    up = lambda m: cv2.resize(m.astype(np.uint8), (FW, FH), interpolation=cv2.INTER_NEAREST) > 0
    rs = cv2.resize(ref_sea.astype(np.uint8) * 255, (FW, FH), interpolation=cv2.INTER_LINEAR)
    rs = cv2.GaussianBlur(rs, (0, 0), 1.6).astype(np.float32) / 255.0
    gs = up(sea); rsb = rs > 0.5
    bad_sea = rsb & ~gs; bad_land = ~rsb & gs      # אמור להיות ים אך Gemini צייר יבשה / להיפך
    res = full.copy()
    for bad, good in ((bad_sea, gs & rsb), (bad_land, ~gs & ~rsb)):
        if bad.any():
            bad = cv2.dilate(bad.astype(np.uint8), np.ones((5, 5), np.uint8))
            src = full.copy(); src[~good] = 0
            # מילוי פשוט וחלק: ממוצע מטושטש של פיקסלים טובים סמוכים (normalized convolution)
            w = good.astype(np.float32); num = cv2.GaussianBlur(src.astype(np.float32), (0, 0), 25) ; den = cv2.GaussianBlur(w, (0, 0), 25)[..., None]
            fill = (num / np.maximum(den, 1e-3)).clip(0, 255).astype(np.uint8)
            m = (bad > 0)[..., None]; res = np.where(m, fill, res)
    cv2.imwrite(out, res, [cv2.IMWRITE_JPEG_QUALITY, 92]); print('wrote fixed', out, 'sea px fixed: %d, land px fixed: %d' % (bad_sea.sum(), bad_land.sum()))
sys.exit(0 if ok else 3)
