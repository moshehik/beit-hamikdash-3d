# python tools/land-dem.py  -> tools/_cache/land-dem.npy  (float32 metres, equirectangular grid) for tools/make-land.py
# Source: AWS Open Data "Terrain Tiles" (terrarium PNG, z10) built from SRTM (+ other public DEMs). Free, no key.
import os, io, math, urllib.request, numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); CACHE = os.path.join(HERE, '_cache'); os.makedirs(CACHE, exist_ok=True)
LON0, LON1, LAT0, LAT1 = 33.8, 37.2, 29.3, 33.9   # Land of Israel + Transjordan edge (Perea/Moab/Edom edge) + Sinai edge + Hermon
Z = 10
def tx(lon): return (lon + 180) / 360 * 2 ** Z
def ty(lat):
    r = math.radians(lat); return (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2 ** Z
x0, x1 = int(tx(LON0)), int(tx(LON1)); y0, y1 = int(ty(LAT1)), int(ty(LAT0))
print('tiles', x1 - x0 + 1, 'x', y1 - y0 + 1)
W = (x1 - x0 + 1) * 256; H = (y1 - y0 + 1) * 256
mosaic = np.zeros((H, W), np.float32)
for x in range(x0, x1 + 1):
    for y in range(y0, y1 + 1):
        fp = os.path.join(CACHE, 't_%d_%d_%d.png' % (Z, x, y))
        if not os.path.exists(fp):
            u = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/%d/%d/%d.png' % (Z, x, y)
            for att in range(4):
                try: open(fp, 'wb').write(urllib.request.urlopen(u, timeout=30).read()); break
                except Exception as e:
                    if att == 3: raise
        a = np.asarray(Image.open(fp).convert('RGB'), np.float32)
        mosaic[(y - y0) * 256:(y - y0 + 1) * 256, (x - x0) * 256:(x - x0 + 1) * 256] = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
# resample the Web-Mercator mosaic to an equirectangular grid: 0.0025 deg/px (~ 270 m)
STEP = 0.0025
nx = int(round((LON1 - LON0) / STEP)); ny = int(round((LAT1 - LAT0) / STEP))
lons = LON0 + (np.arange(nx) + .5) * STEP; lats = LAT1 - (np.arange(ny) + .5) * STEP
px = (np.array([tx(l) for l in lons]) - x0) * 256
py = (np.array([ty(l) for l in lats]) - y0) * 256
# bilinear sample
ix = np.clip(np.floor(px).astype(int), 0, W - 2); fx = (px - ix)[None, :]
iy = np.clip(np.floor(py).astype(int), 0, H - 2); fy = (py - iy)[:, None]
a = mosaic[np.ix_(iy, ix)]; b = mosaic[np.ix_(iy, ix + 1)]; c = mosaic[np.ix_(iy + 1, ix)]; d = mosaic[np.ix_(iy + 1, ix + 1)]
dem = (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy
np.save(os.path.join(CACHE, 'land-dem.npy'), dem.astype(np.float32))
print('dem', dem.shape, 'min', dem.min(), 'max', dem.max(), 'box', LON0, LON1, LAT0, LAT1, 'step', STEP)
