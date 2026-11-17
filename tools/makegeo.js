// node tools/makegeo.js -> src/geodata.js : חופי הים התיכון (Natural Earth 110m, נחתך לחלון המפה)
const fs=require('fs');const t=JSON.parse(fs.readFileSync(__dirname+'/../lib/land-110m.json','utf8'));
const {scale,translate}=t.transform;
const arcs=t.arcs.map(a=>{let x=0,y=0;return a.map(([dx,dy])=>{x+=dx;y+=dy;return[x*scale[0]+translate[0],y*scale[1]+translate[1]]})});
const ring=ids=>{let p=[];for(const i of ids){const a=i<0?arcs[~i].slice().reverse():arcs[i];p=p.concat(p.length?a.slice(1):a)}return p};
const B=[2,16,60,50]; // lon0,lat0,lon1,lat1
function clip(pts,inside,inter){const out=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],ia=inside(a),ib=inside(b);if(ia)out.push(a);if(ia!==ib)out.push(inter(a,b))}return out}
function clipBox(p){const f=[[a=>a[0]>=B[0],(a,b)=>{const k=(B[0]-a[0])/(b[0]-a[0]);return[B[0],a[1]+k*(b[1]-a[1])]}],[a=>a[0]<=B[2],(a,b)=>{const k=(B[2]-a[0])/(b[0]-a[0]);return[B[2],a[1]+k*(b[1]-a[1])]}],
 [a=>a[1]>=B[1],(a,b)=>{const k=(B[1]-a[1])/(b[1]-a[1]);return[a[0]+k*(b[0]-a[0]),B[1]]}],[a=>a[1]<=B[3],(a,b)=>{const k=(B[3]-a[1])/(b[1]-a[1]);return[a[0]+k*(b[0]-a[0]),B[3]]}]];
 for(const [i,x] of f){if(!p.length)break;p=clip(p,i,x)}return p}
const out=[];
for(const g of t.objects.land.geometries){const polys=g.type=='Polygon'?[g.arcs]:g.arcs;for(const poly of polys){const r=clipBox(ring(poly[0]));if(r.length>2)out.push(r.flatMap(p=>[+p[0].toFixed(2),+p[1].toFixed(2)]))}}
fs.writeFileSync(__dirname+'/../src/geodata.js','const LAND='+JSON.stringify(out)+';\n');console.log(out.length,'polys',JSON.stringify(out).length,'bytes');
