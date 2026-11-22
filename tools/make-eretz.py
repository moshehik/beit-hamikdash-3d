# python tools/land-dem.py && python tools/make-eretz.py  -> src/eretz_data.js (ERETZ_DATA: height PNG + colour WebP) + preview PNG in %TEMP%
# Height source: SRTM via AWS terrain tiles (tools/land-dem.py). Colours: procedural (rainfall model + landforms + period features); everything that is
# not measured data (Dead Sea / Kinneret level of the 1st century, Hula lake, marshes, roads, rivers' course, basalt fields, vegetation) is an ESTIMATE – see docs/land-israel.md
import os, io, base64, math, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
dem = np.load(os.path.join(HERE, '_cache', 'land-dem.npy')).astype(np.float32)
LON0, LON1, LAT0, LAT1, STEP = 33.8, 37.2, 29.3, 33.9, 0.0025
ny, nx = dem.shape
lons = LON0 + (np.arange(nx) + .5) * STEP; lats = LAT1 - (np.arange(ny) + .5) * STEP
LON, LAT = np.meshgrid(lons, lats)
def px(lon, lat): return ((lon - LON0) / STEP, (LAT1 - lat) / STEP)
def blur(a, r):
    r = int(r)
    if r < 1: return a
    k = 2 * r + 1
    def f(x, ax):
        c = np.cumsum(np.pad(x, [(r + 1, r) if i == ax else (0, 0) for i in range(2)], mode='edge'), axis=ax, dtype=np.float64)
        sl = lambda s: tuple(s if i == ax else slice(None) for i in range(2))
        return ((c[sl(slice(k, None))] - c[sl(slice(None, -k))]) / k).astype(np.float32)
    return f(f(a, 0), 1)
def mask_poly(polys, soft=6):
    im = Image.new('L', (nx, ny), 0); d = ImageDraw.Draw(im)
    for p in polys: d.polygon([px(*q) for q in p], fill=255)
    if soft: im = im.filter(ImageFilter.GaussianBlur(soft))
    return np.asarray(im, np.float32) / 255
def mask_box(lon0, lon1, lat0, lat1): return (LON >= lon0) & (LON <= lon1) & (LAT >= lat0) & (LAT <= lat1)
def flood(seed_mask, allow):
    cur = seed_mask & allow
    while True:
        n = cur.copy(); n[1:] |= cur[:-1]; n[:-1] |= cur[1:]; n[:, 1:] |= cur[:, :-1]; n[:, :-1] |= cur[:, 1:]; n &= allow
        if (n == cur).all(): return cur
        cur = n
rng = np.random.default_rng(11)
def noise(r, amp=1.0): return blur(rng.standard_normal((ny, nx)).astype(np.float32), r) * amp * math.sqrt(2 * r + 1)

# ---------------- water (sea = measured; lake levels of the period = estimate) ----------------
sea_allow = dem <= 1.0
seed = np.zeros_like(sea_allow); seed[np.argmin(abs(lats - 32.0)), np.argmin(abs(lons - 34.0))] = True; seed[np.argmin(abs(lats - 29.5)), np.argmin(abs(lons - 34.97))] = True
_sp = os.path.join(HERE, '_cache', 'sea.npy')
if os.path.exists(_sp): sea = np.load(_sp)
else:
    sea = flood(seed, sea_allow); np.save(_sp, sea)
DEAD_LVL, KIN_LVL = -395.0, -208.0   # 1st-century levels (estimate: ~35 m higher than today for the Dead Sea; Kinneret a few m higher)
dead = mask_box(35.2, 35.8, 30.95, 31.80) & (dem <= DEAD_LVL + 3)
kin = mask_box(35.5, 35.7, 32.68, 32.92) & (dem <= KIN_LVL + 2)
HULA = [(35.575, 33.075), (35.60, 33.115), (35.625, 33.09), (35.62, 33.04), (35.59, 33.035)]
hula = mask_poly([HULA], 0) > .5
marsh = mask_poly([
    [(35.55, 33.0), (35.58, 33.16), (35.66, 33.16), (35.66, 33.02)],                       # Hula marsh
    [(34.93, 32.30), (34.90, 32.50), (34.97, 32.52), (35.0, 32.30)],                        # Sharon swamps (Alexander / Hadera)
    [(35.02, 32.72), (35.15, 32.78), (35.22, 32.70), (35.08, 32.66)],                       # Kishon
    [(34.80, 32.05), (34.90, 32.12), (34.95, 32.08), (34.85, 32.0)],                        # Yarkon
    [(34.75, 31.40), (34.62, 31.52), (34.55, 31.48), (34.70, 31.35)],                       # coast near Gaza (wadi / marsh)
    [(35.42, 31.05), (35.50, 31.2), (35.55, 31.1), (35.45, 30.95)]], 5)                     # south of the Dead Sea (shallow lagoon)
elev = dem.copy()
elev[sea] = np.maximum(-40.0, dem[sea] * 0.08)
elev[dead] = DEAD_LVL; elev[kin] = KIN_LVL; elev[hula] = 63.0
lake = dead | kin | hula

# ---------------- hillshade (measured DEM) ----------------
dx = STEP * 111320 * math.cos(math.radians(32)); dy = STEP * 110574
ev = np.where(sea, 0.0, dem) * 1.0
gx = np.zeros_like(ev); gy = np.zeros_like(ev)
gx[:, 1:-1] = (ev[:, 2:] - ev[:, :-2]) / (2 * dx); gy[1:-1] = (ev[:-2] - ev[2:]) / (2 * dy)   # gy: + = rises to the north
VE = 3.0
slope = np.arctan(VE * np.hypot(gx, gy)); aspect = np.arctan2(-gx * VE, -gy * VE)
az = math.radians(315); zen = math.radians(42)
hs = math.cos(zen) * np.cos(slope) + math.sin(zen) * np.sin(slope) * np.cos(az - aspect)
hs = np.clip(hs / math.cos(zen), 0.35, 1.45)

# ---------------- climate: rainfall (mm/yr) estimate ----------------
es = blur(np.where(sea, 0, dem), 20)
lat_nodes = [29.0, 29.8, 30.5, 31.0, 31.5, 32.0, 32.5, 33.0, 33.5, 34.0]; mm_nodes = [10, 25, 60, 150, 360, 520, 590, 690, 800, 850]
base = np.interp(LAT, lat_nodes, mm_nodes).astype(np.float32)
# distance to the sea along each row (km, to the west)
cols = np.arange(nx)[None, :]
last_sea = np.maximum.accumulate(np.where(sea, cols, -1), axis=1)
dc = np.where(last_sea >= 0, (cols - last_sea) * dx / 1000, cols * dx / 1000 + 25.0)   # rows without sea in the box (Sinai side): distance from the west edge
R = base * np.exp(-np.minimum(dc, 400) / 230) * (1 + 0.00032 * np.maximum(0, es))
# rain shadow: highest ground within ~40 km to the west
up = es.copy()
for s in range(10, 180, 12):
    sh = np.empty_like(es); sh[:, s:] = es[:, :-s]; sh[:, :s] = es[:, :1]; up = np.maximum(up, sh)
R *= np.exp(-np.maximum(0, up - es - 200) / 520)
R = np.maximum(R, base * 0.18)
R = np.where(LON > 36.6, R * np.exp(-(LON - 36.6) * 1.2), R)    # Arabian steppe/desert far east
R = np.where(sea, 0, R)

# ---------------- colours ----------------
ramp = [(0, (226, 208, 166)), (60, (222, 203, 152)), (150, (214, 192, 128)), (250, (198, 184, 110)), (350, (170, 170, 94)), (450, (142, 158, 80)), (600, (108, 142, 68)), (800, (80, 120, 58)), (1100, (60, 102, 52))]
xs = [r[0] for r in ramp]
rgb = np.stack([np.interp(R, xs, [r[1][c] for r in ramp]) for c in range(3)], -1).astype(np.float32)
nz = noise(3) * 0.55 + noise(10) * 0.5
def tint(m, col, k=1.0): global rgb; rgb = rgb * (1 - np.clip(m * k, 0, 1)[..., None]) + np.array(col, np.float32) * np.clip(m * k, 0, 1)[..., None]
# Mediterranean woodland (oak/terebinth/pine) on the wetter hills
wood = np.clip((R - 430) / 250, 0, 1) * np.clip(0.55 + nz * 0.8, 0, 1) * np.clip((slope - 0.03) * 6, 0.35, 1)
tint(wood, (64, 98, 48), 0.55)
# farmland: flat, wet-enough ground (coastal plain, Jezreel, Jordan valley, valleys)
farm = np.clip((R - 280) / 200, 0, 1) * np.clip(1 - slope * 7, 0, 1) * np.clip(0.7 + nz * 0.6, 0, 1)
tint(farm, (184, 184, 98), 0.6)
# basalt fields (Golan, Bashan/Hauran, Lower Galilee patches) – ESTIMATED outlines
basalt = mask_poly([[(35.62, 33.05), (35.85, 33.22), (35.98, 33.0), (35.96, 32.74), (35.7, 32.7), (35.62, 32.85)],
                    [(35.34, 32.83), (35.6, 32.86), (35.6, 32.72), (35.45, 32.64), (35.3, 32.7)],
                    [(35.55, 32.6), (35.65, 32.62), (35.62, 32.5), (35.54, 32.52)]], 7)
hauran = mask_poly([[(36.1, 33.3), (36.7, 33.35), (37.1, 33.1), (37.0, 32.7), (36.7, 32.45), (36.35, 32.55), (36.15, 32.9)]], 30)
tint(basalt * np.clip(0.75 + nz * 0.3, 0, 1), (92, 82, 70), 0.62)
tint(hauran * np.clip(0.6 + nz * 0.5, 0, 1), (104, 92, 78), 0.4)
# coastal dunes / kurkar
coast = np.zeros_like(sea)
sd = (np.asarray(Image.fromarray((sea * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(15))) > 0) & (~sea)
tint(sd * (dem < 40) * (LAT < 32.85) * (LAT > 29.8) * np.clip(0.8 + nz * 0.3, 0, 1), (231, 213, 163), 0.8)
# Dead Sea marl, Arava / Judean-desert pallor, Negev loess
marl = mask_box(35.1, 35.75, 30.9, 31.85) & (dem < -300) & ~lake
tint(marl.astype(np.float32), (236, 228, 205), 0.8)
tint(mask_poly([[(35.2, 31.2), (35.3, 31.6), (35.45, 31.9), (35.35, 31.95), (35.15, 31.65), (35.05, 31.3)]], 8), (214, 196, 150), 0.35)   # Judean desert
# Jordan valley thicket (zor) – ESTIMATED course; palm groves
JORDAN = [(35.69, 33.25), (35.65, 33.13), (35.61, 33.05), (35.60, 32.98), (35.62, 32.90)]
JORDAN2 = [(35.57, 32.69), (35.56, 32.55), (35.55, 32.40), (35.54, 32.25), (35.55, 32.10), (35.52, 31.95), (35.54, 31.85), (35.545, 31.76)]
def polyline_mask(lines, width):
    im = Image.new('L', (nx, ny), 0); d = ImageDraw.Draw(im)
    for l in lines: d.line([px(*q) for q in l], fill=255, width=width, joint='curve')
    return im
zor = np.asarray(polyline_mask([JORDAN2], 9).filter(ImageFilter.GaussianBlur(3)), np.float32) / 255
tint(zor * np.clip(0.8 + nz * 0.3, 0, 1), (74, 112, 60), 0.7)
for (lo, la, rr) in [(35.44, 31.87, 28), (35.389, 31.462, 14), (35.50, 32.50, 16), (35.52, 32.28, 10), (35.45, 31.74, 8)]:   # Jericho, Ein Gedi, Beth Shean oasis...
    tint(np.clip(1 - np.hypot((LON - lo) / STEP, (LAT - la) / STEP) / rr, 0, 1), (78, 125, 58), 0.9)
# snow on Hermon
tint(np.clip((dem - 2150) / 400, 0, 1), (244, 246, 250), 0.9)
# marshes
tint(marsh * np.clip(0.7 + nz * 0.3, 0, 1), (112, 148, 108), 0.75)
# hillshade
rgb *= hs[..., None] * 0.95 + 0.05
rgb = np.clip(rgb, 0, 255)
# water
depth = np.clip(-dem / 450, 0, 1)
seaC = np.stack([np.interp(depth, [0, 1], [r, q]) for r, q in ((96, 38), (168, 92), (190, 128))], -1)
rgb[sea] = seaC[sea]
dm = np.clip(1 - np.hypot(0, 0), 0, 1)
rgb[dead] = (84, 150, 168); rgb[kin] = (92, 160, 196); rgb[hula] = (96, 158, 186)
# shore line
def shore(m, col, w=3):
    e = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(w * 2 + 1))) > 0
    return e & ~m
for m, col in ((sea, (248, 240, 214)), (dead, (240, 236, 220)), (kin, (225, 215, 170))):
    s = shore(m, col, 1); rgb[s] = rgb[s] * 0.4 + np.array(col, np.float32) * 0.6
img = Image.fromarray(rgb.astype(np.uint8))
dr = ImageDraw.Draw(img, 'RGBA')

# ---------------- rivers & wadis (ESTIMATED course) ----------------
RIV = {
 'jordan': [JORDAN, JORDAN2], 'yarmuk': [[(36.05, 32.72), (35.85, 32.68), (35.67, 32.68), (35.57, 32.69)]],
 'jabbok': [[(36.1, 32.09), (35.9, 32.17), (35.7, 32.18), (35.56, 32.18)]], 'arnon': [[(35.95, 31.45), (35.75, 31.47), (35.60, 31.47), (35.52, 31.47)]],
 'hasa': [[(35.9, 30.95), (35.62, 31.1), (35.52, 31.12)]], 'kidron': [[(35.235, 31.78), (35.30, 31.76), (35.36, 31.72), (35.42, 31.70)]],
 'soreq': [[(35.0, 31.77), (34.9, 31.83), (34.78, 31.88), (34.69, 31.93)]], 'yarkon': [[(34.95, 32.10), (34.85, 32.10), (34.78, 32.10)]],
 'alexander': [[(35.0, 32.38), (34.92, 32.40), (34.85, 32.41), (34.80, 32.40)]], 'kishon': [[(35.2, 32.62), (35.1, 32.7), (35.0, 32.75)]],
 'harod': [[(35.35, 32.55), (35.45, 32.52), (35.5, 32.51)]], 'besor': [[(34.9, 31.3), (34.6, 31.4), (34.4, 31.42)]], 'naaman': [[(35.1, 32.9), (35.08, 32.92)]],
 'qishon2': [[(35.3, 32.65), (35.2, 32.62)]], 'zin': [[(35.0, 30.9), (35.2, 30.95), (35.35, 30.98)]], 'hebron': [[(35.1, 31.53), (34.95, 31.45), (34.8, 31.35)]]}
for k, ls in RIV.items():
    w = 3 if k in ('jordan',) else 2
    for l in ls: dr.line([px(*q) for q in l], fill=(88, 150, 186, 255), width=w, joint='curve')
# Kinneret -> Jordan joins
dr.line([px(35.62, 32.90), px(35.62, 32.80), px(35.57, 32.69)], fill=(88, 150, 186, 255), width=2)
# ---------------- roads (ESTIMATED; main Roman/Herodian-era routes) ----------------
ROADS = [
 [(34.46, 31.52), (34.57, 31.67), (34.74, 31.87), (34.80, 31.92), (34.89, 31.95), (34.93, 32.10), (34.9, 32.3), (34.89, 32.50), (34.92, 32.61), (35.0, 32.65), (35.18, 32.58), (35.28, 32.62), (35.35, 32.68), (35.5, 32.78), (35.57, 33.02), (35.69, 33.25)],  # Via Maris
 [(35.2345, 31.7785), (35.30, 31.80), (35.38, 31.83), (35.44, 31.87)],                                                                            # Jerusalem-Jericho
 [(35.2345, 31.7785), (35.2, 31.70), (35.15, 31.62), (35.1, 31.53)],                                                                              # Jerusalem-Hebron
 [(35.2345, 31.7785), (35.12, 31.85), (35.08, 31.87), (34.98, 31.90), (34.89, 31.95)],                                                           # Jerusalem-Beth Horon-Lod
 [(35.2345, 31.7785), (35.1, 31.7), (34.99, 31.64), (34.89, 31.61), (34.74, 31.64), (34.57, 31.67)],                                              # Jerusalem-Eleutheropolis-Ashkelon
 [(34.89, 31.61), (34.7, 31.57), (34.46, 31.52)],
 [(35.2345, 31.7785), (35.22, 31.9), (35.22, 32.05), (35.25, 32.15), (35.28, 32.22), (35.27, 32.3), (35.3, 32.46), (35.4, 32.5), (35.50, 32.50)],   # ridge road to Beth Shean
 [(35.28, 32.22), (35.19, 32.28), (35.1, 32.36), (34.95, 32.4), (34.89, 32.50)],                                                                  # Shechem-Sebaste-Caesarea
 [(35.44, 31.87), (35.55, 31.83), (35.7, 31.8), (35.8, 31.8), (35.91, 31.95)],                                                                    # Jericho-Heshbon-Philadelphia
 [(35.50, 32.50), (35.52, 32.3), (35.5, 32.1), (35.46, 31.95), (35.44, 31.87)],                                                                   # Jordan valley road
 [(35.50, 32.50), (35.55, 32.65), (35.53, 32.79)],                                                                                                # Beth Shean-Tiberias
 [(35.53, 32.79), (35.4, 32.77), (35.28, 32.75), (35.17, 32.82), (35.07, 32.92)],                                                                 # Tiberias-Sepphoris-Akko
 [(35.28, 32.75), (35.18, 32.6), (35.0, 32.55), (34.89, 32.5)],                                                                                    # Sepphoris-Legio-Caesarea
 [(35.07, 32.92), (35.1, 33.05), (35.2, 33.27)], [(35.2, 33.27), (35.45, 33.25), (35.69, 33.25)],                                                 # coast to Tyre, Tyre-Banias
 [(35.53, 32.79), (35.575, 32.88), (35.57, 33.02)],                                                                                                # Tiberias-Capernaum-Hazor
 [(34.79, 31.25), (34.95, 31.4), (35.1, 31.53)], [(35.1, 31.53), (35.25, 31.46), (35.389, 31.46)], [(35.13, 31.28), (35.25, 31.3), (35.354, 31.316)],   # Beersheba-Hebron, Hebron-Ein Gedi, Arad-Masada
 [(34.46, 31.52), (34.6, 31.4), (34.79, 31.25), (34.77, 30.79), (35.1, 30.6), (35.44, 30.33)],                                                    # incense route Gaza-Beersheba-Avdat-Petra
 [(35.07, 31.03), (35.13, 31.28)]]
for l in ROADS:
    pts = [px(*q) for q in l]
    dr.line(pts, fill=(246, 236, 205, 150), width=4, joint='curve'); dr.line(pts, fill=(140, 96, 52, 255), width=2, joint='curve')
img = img.filter(ImageFilter.GaussianBlur(0.45))
tex = io.BytesIO(); img.save(tex, 'WEBP', quality=66, method=5); tex = tex.getvalue()
img.resize((nx // 3, ny // 3)).save(os.path.join(os.environ.get('TEMP', '.'), 'eretz-preview.png'))

# ---------------- mesh heights: 4x4 block average -> 16-bit in RGB PNG (R=hi, G=lo; elev = v/16 - 600) ----------------
B = 4; hh, hw = ny // B, nx // B
m = elev[:hh * B, :hw * B].reshape(hh, B, hw, B).mean(axis=(1, 3))
v = np.clip(np.round((m + 600) * 16), 0, 65535).astype(np.uint16)
png = np.zeros((hh, hw, 3), np.uint8); png[..., 0] = v >> 8; png[..., 1] = v & 255
pb = io.BytesIO(); Image.fromarray(png).save(pb, 'PNG', optimize=True); pb = pb.getvalue()
box = [LON0 + STEP * B / 2, LON1 - STEP * B / 2, LAT0 + STEP * B / 2, LAT1 - STEP * B / 2]
out = {'box': [round(x, 5) for x in box], 'tbox': [LON0, LON1, LAT0, LAT1], 'hw': hw, 'hh': hh, 'h': base64.b64encode(pb).decode(), 'tex': base64.b64encode(tex).decode()}
open(os.path.join(ROOT, 'src', 'eretz_data.js'), 'w', encoding='utf8').write(
    '/* נוצר ע"י tools/make-eretz.py (נתוני גובה SRTM + צבעוניות מוערכת) – אל תערוך ידנית. נטען עצלנית ע"י ERETZ.load(); base64 גולמי בלי data: (נטפרי). */\nwindow.ERETZ_DATA=' + json.dumps(out) + ';\n')
print('mesh', hw, 'x', hh, 'height png', len(pb) // 1024, 'KB; texture', nx, 'x', ny, len(tex) // 1024, 'KB')
