# usage: python -I tools/landing-icons.py <raw_dir_with_<key>.jpg> <out_dir>   (green-screen JPEG -> transparent 256x256 PNG)
import sys, os, glob, numpy as np
from PIL import Image, ImageFilter
SIZE=256; PAD=8
CROP_TOP={}   # optional fraction of height to cut per key
DIST={'kids'}  # keys that contain green objects: stricter green threshold (keeps a green flag)
def key(path,k):
    im=Image.open(path).convert('RGB')
    if k in CROP_TOP:
        t=int(im.height*CROP_TOP[k]); im=im.crop((0,t,im.width,im.height))
    a=np.asarray(im).astype(np.float32); r,g,b=a[...,0],a[...,1],a[...,2]
    if k in DIST:
        al=np.clip(1-(r*0+g-np.maximum(r,b)-95)/(150-95),0,1)   # bright background only (backgrounds have a vignette; the green flag is darker)
        x0,y0,x1,y1=1180,480,1520,730   # box around the green flag (2048px source): much stricter threshold so its highlights stay solid
        d=g-np.maximum(r,b); box=np.clip(1-(d-170)/(200-170),0,1)
        al[y0:y1,x0:x1]=box[y0:y1,x0:x1]
    else:
        d=g-np.maximum(r,b)
        al=np.clip(1-(d-30)/(120-30),0,1)
    A=Image.fromarray((al*255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    al=np.asarray(A).astype(np.float32)/255
    if k not in DIST: a[...,1]=np.minimum(g,np.maximum(r,b)+6)    # despill (skipped when green objects exist)
    out=Image.fromarray(np.dstack([a,al*255]).clip(0,255).astype(np.uint8),'RGBA')
    bb=out.getchannel('A').point(lambda v:255 if v>24 else 0).getbbox()
    out=out.crop(bb)
    s=(SIZE-2*PAD)/max(out.size)
    out=out.resize((max(1,round(out.width*s)),max(1,round(out.height*s))),Image.LANCZOS)
    cv=Image.new('RGBA',(SIZE,SIZE),(0,0,0,0)); cv.paste(out,((SIZE-out.width)//2,(SIZE-out.height)//2),out)
    return cv
def save(cv,dst):
    cv.save(dst,'PNG',optimize=True)
    if os.path.getsize(dst)>58000:
        q=cv.quantize(colors=192,method=Image.FASTOCTREE,dither=Image.FLOYDSTEINBERG); q.save(dst,'PNG',optimize=True)
if __name__=='__main__':
    src,dst=sys.argv[1],sys.argv[2]; os.makedirs(dst,exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src,'*.jpg'))):
        k=os.path.basename(f).split('_')[0]; o=os.path.join(dst,k+'.png'); save(key(f,k),o); print(k,os.path.getsize(o))
