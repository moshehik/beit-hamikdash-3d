# "מקבע" את תמונת הרקע ש-Gemini צייר (אחרי tools/verify-regionmap.py): רק סטיות גדולות מקו החוף שבנתונים מתוקנות – מפרצים/איים דקים ש-Gemini מילא או מחק
# (למשל ים מרמרה, מפרץ סואץ, האיים באגאי). סטיות קטנות (פחות מ-3 פיקסלים סביב קו החוף) נשארות – הקו הווקטורי המדויק בקוד מכסה אותן.
#   python -X utf8 tools/fix-regionmap.py <gemini.jpg> <region_masks.npz> <out.jpg> [quality=86]
# הפלט ברזולוציית הייחוס (1280x1024) – גם הרזולוציה הסופית של base_m.jpg.
import sys, numpy as np, cv2
src, mkp, out = sys.argv[1:4]; Q = int(sys.argv[4]) if len(sys.argv) > 4 else 86
mk = np.load(mkp); H, W = mk['land'].shape
img = cv2.imread(src); im = cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA); del img
b, g, r = [im[..., i].astype(np.int32) for i in range(3)]
water = (b - r > 8) & (b >= g - 12)
water = cv2.morphologyEx(water.astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))) > 0
water &= ~mk['river']
n, lab = cv2.connectedComponents(water.astype(np.uint8))
sea = np.zeros_like(water)
for i in range(1, n):
    c = lab == i
    if c[:, 0].any() or c[0, :].any() or c[-1, :].any() or c[:, -1].any(): sea |= c
rs = mk['sea']
mis = (sea ^ rs) & ~mk['river']
mis = cv2.morphologyEx(mis.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
nc, cl, st, _ = cv2.connectedComponentsWithStats(mis)
fix_sea = np.zeros((H, W), np.uint8); fix_land = np.zeros((H, W), np.uint8); ns = nl = 0
for i in range(1, nc):
    if st[i, 4] < 12: continue
    c = (cl == i).astype(np.uint8)
    dt = cv2.distanceTransform(c, cv2.DIST_L2, 3).max()
    if dt < 3.0: continue
    cd = cv2.dilate(c, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    if (rs & (c > 0)).sum() > (c > 0).sum() / 2: fix_sea |= cd; ns += 1      # צריך להיות ים
    else: fix_land |= cd; nl += 1                                              # צריכה להיות יבשה
def fill(mask, good):
    if not mask.any(): return None
    w = good.astype(np.float32); s = im.astype(np.float32) * w[..., None]
    mean = s.sum((0, 1)) / max(1.0, w.sum())
    out = np.zeros_like(s); have = np.zeros((H, W, 1), np.float32)
    for sg in (9, 24, 60):    # מקרוב לרחוק: אם אין פיקסלים טובים בסביבה הקרובה – מרחיבים את הדגימה
        num = cv2.GaussianBlur(s, (0, 0), sg); den = cv2.GaussianBlur(w, (0, 0), sg)[..., None]
        ok = (den > 0.02) & (have == 0)
        out = np.where(ok, num / np.maximum(den, 1e-3), out); have = np.where(ok, 1.0, have)
    return np.where(have > 0, out, mean).clip(0, 255)
res = im.astype(np.float32)
fs = fill(fix_sea, sea & rs & (cv2.dilate(fix_sea, np.ones((41, 41), np.uint8)) > 0))
fl = fill(fix_land, ~sea & ~rs & (cv2.dilate(fix_land, np.ones((41, 41), np.uint8)) > 0))
rng = np.random.default_rng(3); noise = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 2.5)[..., None] * 5.0
for m, f in ((fix_sea, fs), (fix_land, fl)):
    if f is None: continue
    a = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 1.2)[..., None]
    res = res * (1 - a) + (f + noise) * a
cv2.imwrite(out, res.clip(0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, Q])
print('fixed components: sea %d, land %d; px sea %d land %d -> %s' % (ns, nl, int((fix_sea > 0).sum()), int((fix_land > 0).sum()), out))
