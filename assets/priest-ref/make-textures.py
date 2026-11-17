from PIL import Image, ImageFilter
import numpy as np, base64, io, os, shutil
k=2752/2000
s=Image.open('sheet1.png').convert('L')
x0,y0=int(335*k),int(312*k)
c=s.crop((x0,y0,x0+210,y0+150))
a=np.array(c).astype(float); bl=np.array(c.filter(ImageFilter.GaussianBlur(14))).astype(float)
d=(a-bl)*1.7+240   # flat linen weave/crease detail around near-white (multiplies material color)
d=np.clip(d,205,255).astype(np.uint8)
lin=Image.fromarray(d).resize((192,192),Image.LANCZOS).convert('RGB')
belt=Image.open('belt_crop.png').convert('RGB').resize((512,123),Image.LANCZOS)
def b64(im,q): 
    b=io.BytesIO(); im.save(b,'JPEG',quality=q,optimize=True); return 'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
L=b64(lin,80);B=b64(belt,85)
print(len(L),len(B))
open('../../../../../../../../Music/placeholder','w') if False else None
proj=r'C:/Users/moshe/Music/מדפיס בוט/beit-hamikdash-3d'
open(proj+'/src/people_tex.js','w',encoding='utf8').write("/* טקסטורות הכהן – נגזרו מתמונות Gemini (assets/priest-ref/): אבנט רקום (חיתוך) ורקמת פשתן (מנורמל, מכפיל). data URI */\nconst PTEX={belt:'"+B+"',linen:'"+L+"'};\n")
ref=proj+'/assets/priest-ref'; os.makedirs(ref,exist_ok=True)
for f in ['sheet1.png','belt.png','turban.png']:
    im=Image.open(f).convert('RGB'); im.save(ref+'/'+f.replace('.png','.jpg'),quality=88)
lin.save(ref+'/linen-tile.png'); belt.save(ref+'/belt-tex.png')
