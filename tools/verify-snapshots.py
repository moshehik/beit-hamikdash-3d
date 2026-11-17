# usage: python -X utf8 tools/verify-snapshots.py      (אימות תמונות המפות; מדפיס דוח, יוצא 1 אם נכשל משהו קריטי)
# בודק מחדש מהקבצים עצמם (לא מהמטא־נתונים בלבד):
#  1. כל תמונה ב-manifest קיימת, ה-sha256 תואם, אינה ריקה/שחורה (שונות פיקסלים, בהירות ממוצעת, צבע דומיננטי)
#  2. ייחודיות: תמונות של תקופות שונות שונות זו מזו (מדווח זוגות זהים – למשל תקופות שבהן הדגם באמת לא משתנה)
#  3. בדיקות נקודות הציון/נתונים שנרשמו בדפדפן (manifest.checks)
#  4. src/map_images.js: כל מפתח מפוענח ל-JPEG תקין, וזהה לקובץ ב-assets/maps
import json, os, sys, re, base64, hashlib, io
import numpy as np
from PIL import Image
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
md = os.path.join(root, 'assets', 'maps')
man = json.load(open(os.path.join(md, 'manifest.json'), encoding='utf8'))
fail = []; warn = []
print('manifest', man['generated'], '-', len(man['images']), 'תמונות,', len(man['checks']), 'בדיקות נתונים')
arr = {}
for e in man['images']:
    f = os.path.join(md, e['key'] + '.jpg')
    if not os.path.exists(f): fail.append(e['key'] + ': קובץ חסר'); continue
    b = open(f, 'rb').read()
    if hashlib.sha256(b).hexdigest() != e.get('sha256'): fail.append(e['key'] + ': sha256 לא תואם ל-manifest')
    im = Image.open(f).convert('RGB'); a = np.asarray(im).astype(np.float32); arr[e['key']] = a
    lum = .2126 * a[..., 0] + .7152 * a[..., 1] + .0722 * a[..., 2]
    q = ((a[..., 0] // 8) * 1024 + (a[..., 1] // 8) * 32 + a[..., 2] // 8).astype(np.int64).ravel()
    flat = np.bincount(q).max() / q.size
    mean, std = float(lum.mean()), float(lum.std())
    bad = []
    if std < 12: bad.append('שונות נמוכה')
    if mean < 40: bad.append('כהה מדי')
    if mean > 235: bad.append('בהיר מדי')
    if flat > .9: bad.append('כמעט צבע אחד')
    weak = flat > .4 or std < 18
    if abs(mean - e['stats']['mean']) > 4: warn.append(e['key'] + ': ממוצע בהירות בקובץ (%.1f) שונה מזה שנמדד בדפדפן (%.1f)' % (mean, e['stats']['mean']))
    if bad: fail.append(e['key'] + ': ' + ', '.join(bad))
    elif weak: warn.append(e['key'] + ' (%s): חלשה (flat=%.2f std=%.1f) – לא נארזת' % (e['meta'].get('name', ''), flat, std))
    if e['meta'].get('kind') in ('jerusalem', 'jerusalem-oblique') and e.get('periodName') != e['meta'].get('periodName'): fail.append(e['key'] + ': שם התקופה לא תואם')
    if e['meta'].get('expectPeriod') is not None and e['period'] != e['meta']['expectPeriod']: fail.append(e['key'] + ': התקופה שנרשמה (%s) שונה מהמצופה (%s)' % (e['period'], e['meta']['expectPeriod']))
print('1. תמונות: %d נבדקו' % len(arr))
# ייחודיות בין תקופות
for kind in ('r_jer', 'r_jo'):
    keys = [kind + str(i) for i in range(7) if kind + str(i) in arr]
    same = []
    for i in range(len(keys)):
        for j in range(i + 1, len(keys)):
            d = float(np.abs(arr[keys[i]] - arr[keys[j]]).mean())
            if d < 0.6: same.append((keys[i], keys[j], round(d, 2)))
    print('2. %s: זוגות זהים (הפרש ממוצע<0.6): %s' % (kind, same or 'אין'))
    if same: warn.append(kind + ': תקופות שבהן הרינדור זהה: ' + str(same) + ' (בדגם התלת־ממדי אין הבדל ביניהן – לא תקלה בתמונה)')
# בדיקות נתונים
nf = [c for c in man['checks'] if not c['pass']]
print('3. בדיקות נתונים/נקודות ציון: %d/%d עברו' % (len(man['checks']) - len(nf), len(man['checks'])))
for c in man['checks']:
    if not c['id'].startswith(('period-state', 'geo-period', 'geo-emp')): print('   ', 'OK  ' if c['pass'] else 'FAIL', c['id'], '| מצופה', c['expected'], '| בפועל', c['actual'])
for c in nf: fail.append('check ' + c['id'])
# src/map_images.js
sp = os.path.join(root, 'src', 'map_images.js')
if os.path.exists(sp):
    src = open(sp, encoding='utf8').read()
    items = re.findall(r'"([\w-]+)":"([A-Za-z0-9+/=]+)"', src)
    n = 0
    for k, b64 in items:
        raw = base64.b64decode(b64)
        try: Image.open(io.BytesIO(raw)).verify()
        except Exception as ex: fail.append('map_images.js ' + k + ': JPEG פגום'); continue
        f = os.path.join(md, (k[2:] if k.startswith('d_') else k) + '.jpg') if not k.startswith('d_') else os.path.join(md, 'deco', k[2:] + '.jpg')
        if not os.path.exists(f) or open(f, 'rb').read() != raw: fail.append('map_images.js ' + k + ': שונה מהקובץ שבדיסק – להריץ pack')
        n += 1
    print('4. src/map_images.js: %d תמונות מפוענחות ותואמות לקבצים, %dKB' % (n, os.path.getsize(sp) // 1024))
else: warn.append('אין src/map_images.js – להריץ pack')
print('\nאזהרות:'); [print('  -', w) for w in warn]
print('כשלים:'); [print('  -', f) for f in fail] if fail else print('  אין')
sys.exit(1 if fail else 0)
