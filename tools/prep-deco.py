# usage: python -X utf8 tools/prep-deco.py <raw_dir_with_<key>.jpg (Gemini)> [out_dir=assets/maps/deco]
# איורי Gemini (דקורטיביים בלבד) -> JPEG 320x200 (חיתוך למרכז, ~15-25KB) לאריזה ב-src/map_images.js
import sys, os, glob
from PIL import Image
W,H=320,200
src=sys.argv[1]; dst=sys.argv[2] if len(sys.argv)>2 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','assets','maps','deco')
os.makedirs(dst,exist_ok=True)
for f in sorted(glob.glob(os.path.join(src,'*.jpg'))):
    k=os.path.basename(f)[:-4]
    im=Image.open(f).convert('RGB'); r=W/H
    w,h=im.size
    if w/h>r: nw=int(h*r); im=im.crop(((w-nw)//2,0,(w-nw)//2+nw,h))
    else: nh=int(w/r); im=im.crop((0,(h-nh)//2,w,(h-nh)//2+nh))
    im=im.resize((W,H),Image.LANCZOS)
    for q in (80,74,68,62,56,50):
        o=os.path.join(dst,k+'.jpg'); im.save(o,'JPEG',quality=q,optimize=True,progressive=True)
        if os.path.getsize(o)<=22000: break
    print(k,os.path.getsize(o),'q',q)
