# אורז את איקוני ממשק הילדים (סרגל + מעגן + מקומות) ל-src/ui_icons.js:  const UI_ICONS={key:'data:image/png;base64,...'}
# מקורות: (1) assets/landing/*.png (האיקונים של דף הבית, משמשים שוב), (2) תיקיית PNG-ים שנוצרו ע"י tools/landing-icons.py (רקע ירוק הוסר, 256x256).
# שימוש:  python -I tools/pack-ui-icons.py <dir_of_keyed_256_pngs>
# כל איקון מוקטן ל-128x128 וכווץ (פלטה) כדי להישאר קטן. נטפרי: בצד הלקוח מוצגים דרך blob: URL (ראה kidui.js), לא data-URI.
import sys, os, io, base64, json
from PIL import Image
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
extra=sys.argv[1] if len(sys.argv)>1 else None
SIZE=128
LAND={'tours':'tours','walk':'walk','map':'map','kids':'kids','har':'model','kodesh':'ark'}   # מפתח ממשק <- קובץ בדף הבית
out={}; tot=0
def enc(path):
    im=Image.open(path).convert('RGBA').resize((SIZE,SIZE),Image.LANCZOS)
    q=im.quantize(colors=128,method=Image.FASTOCTREE,dither=Image.NONE)
    b=io.BytesIO(); q.save(b,'PNG',optimize=True); return b.getvalue()
for k,f in LAND.items():
    p=os.path.join(D,'assets','landing',f+'.png')
    if os.path.exists(p): out[k]=enc(p)
udir=os.path.join(D,'assets','ui'); os.makedirs(udir,exist_ok=True)
if extra:
    for f in sorted(os.listdir(extra)):
        if f.lower().endswith('.png'): out[f[:-4]]=enc(os.path.join(extra,f))
for k,b in out.items():
    open(os.path.join(udir,k+'.png'),'wb').write(b); tot+=len(b)
js='// נוצר ע"י tools/pack-ui-icons.py – אל תערוך ידנית\nconst UI_ICONS='+json.dumps({k:'data:image/png;base64,'+base64.b64encode(b).decode() for k,b in out.items()},ensure_ascii=False)+';\n'
open(os.path.join(D,'src','ui_icons.js'),'w',encoding='utf-8').write(js)
print('packed',len(out),'icons',tot//1024,'KB png;',sorted(out))
