import sys, numpy as np
from PIL import Image, ImageFilter
def key(src,dst,maxside=512,pad=2,webp=False):
    im=Image.open(src).convert('RGB'); a=np.asarray(im).astype(np.float32)
    r,g,b=a[...,0],a[...,1],a[...,2]
    d=g-np.maximum(r,b)               # green dominance
    al=np.clip(1-(d-25)/(110-25),0,1)  # 1 = subject, 0 = background
    # clean tiny holes/specks
    A=Image.fromarray((al*255).astype(np.uint8))
    A=A.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))   # erode 1px to drop fringe
    al=np.asarray(A).astype(np.float32)/255
    # despill
    lim=np.maximum(r,b); g2=np.minimum(g,lim+8); a[...,1]=g2
    rgba=np.dstack([a,al*255]).clip(0,255).astype(np.uint8)
    out=Image.fromarray(rgba,'RGBA')
    bb=out.getchannel('A').point(lambda v:255 if v>20 else 0).getbbox()
    bb=(max(bb[0]-pad,0),max(bb[1]-pad,0),min(bb[2]+pad,out.width),min(bb[3]+pad,out.height))
    out=out.crop(bb)
    s=maxside/max(out.size); out=out.resize((max(1,round(out.width*s)),max(1,round(out.height*s))),Image.LANCZOS)
    # premultiplied-resize fringe fix: set rgb of transparent px to neighbors is overkill; just save
    out.save(dst,'PNG',optimize=True); return out.size
if __name__=='__main__':
    print(key(sys.argv[1],sys.argv[2],int(sys.argv[3]) if len(sys.argv)>3 else 512))
