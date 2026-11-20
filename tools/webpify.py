# python tools/webpify.py  -> converts the base64 PNG/JPEG tables in src/{landing_icons,map_images,ui_icons,ui_icons2}.js to WebP (in place, idempotent).
# Same raw-base64-without-data: format (Netfree: images only via blob:). Consumers create the blob with type image/webp.
import re, base64, io, sys, os
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'src')
# per-file: (quality, max side in px or None)
CONF = {'landing_icons.js': (82, 224), 'map_images.js': (76, None), 'ui_icons.js': (84, None), 'ui_icons2.js': (84, None)}
tot_in = tot_out = 0
for fn, (q, mx) in CONF.items():
    p = os.path.join(SRC, fn)
    s = open(p, encoding='utf8').read()
    # keep the exact separator between key and value
    pat = re.compile(r'"([A-Za-z0-9_\-\.]+)"(\s*:\s*)"([A-Za-z0-9+/=]{2000,})"')
    def conv2(m):
        k, sep, v = m.group(1), m.group(2), m.group(3)
        r = conv_inner(k, v)
        return '"%s"%s"%s"' % (k, sep, r)
    def conv_inner(k, v):
        global tot_in, tot_out
        b = base64.b64decode(v); tot_in += len(b)
        if b[:4] == b'RIFF' and b[8:12] == b'WEBP': tot_out += len(b); return v
        im = Image.open(io.BytesIO(b)); im.load()
        if mx and max(im.size) > mx:
            r = mx / max(im.size); im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
        if im.mode == 'P': im = im.convert('RGBA')
        elif im.mode not in ('RGB', 'RGBA'): im = im.convert('RGBA' if 'A' in im.mode else 'RGB')
        out = io.BytesIO(); im.save(out, 'WEBP', quality=q, method=6, alpha_quality=90)
        w = out.getvalue()
        if len(w) >= len(b): w = b
        tot_out += len(w)
        return base64.b64encode(w).decode()
    n = pat.subn(conv2, s)
    open(p, 'w', encoding='utf8', newline='').write(n[0])
    print(fn, n[1], 'images')
print('total KB: %d -> %d' % (tot_in // 1024, tot_out // 1024))
