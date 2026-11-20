# usage: python -I tools/pack-icons.py   -> src/ui_icons2.js  (ICON2 = {key: base64-PNG גולמי בלי קידומת data: (נטפרי), 128px מכווץ בפלטה}, EMOJI_ICONS, ICON_ALIAS)
import os, json, base64, io, sys
from PIL import Image
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
d = os.path.join(root, 'assets', 'icons')
m = json.load(open(os.path.join(d, '_map.json'), encoding='utf8'))
SIZE = int(sys.argv[1]) if len(sys.argv) > 1 else 128
icons, missing = {}, []
for k in m['keys']:
    fp = os.path.join(d, k + '.png')
    if not os.path.exists(fp):
        missing.append(k); continue
    im = Image.open(fp).convert('RGBA').resize((SIZE, SIZE), Image.LANCZOS)
    q = im.quantize(colors=200, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    b = io.BytesIO(); q.save(b, 'PNG', optimize=True)
    icons[k] = base64.b64encode(b.getvalue()).decode()
alias = {a: b for a, b in m['alias'].items() if b in icons or b in m['keys']}
emoji = {e: k for e, k in m['emoji'].items() if k in icons or k in alias or not k.startswith(('e_', 'tag_', 'svc_'))}
out = '/* נוצר אוטומטית ע"י tools/pack-icons.py מ-assets/icons (גיליונות גמיני, tools/icons-catalog.cjs). אל תערוך ידנית. base64 גולמי בלי data: (נטפרי) */\n'
out += 'const ICON2=' + json.dumps(icons, separators=(',', ':')) + ';\n'
out += 'const EMOJI_ICONS=' + json.dumps(emoji, ensure_ascii=False, separators=(',', ':')) + ';\n'
out += 'const ICON_ALIAS=' + json.dumps(alias, separators=(',', ':')) + ';\n'
open(os.path.join(root, 'src', 'ui_icons2.js'), 'w', encoding='utf8').write(out)
print('packed', len(icons), 'icons;', 'missing:', ' '.join(missing) or '-', '; bytes', len(out))
