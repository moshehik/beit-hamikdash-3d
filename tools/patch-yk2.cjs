const fs=require('fs');let s=fs.readFileSync('tools/yk-template.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing '+a.slice(0,70));s=s.replace(a,()=>b)};
/* שומרי הסוכות */
rep("const ACTORS={","const AZ=AZAZEL,BK=AZ.booths.map((b,i)=>'b'+(i+1));\n const ACTORS={");
rep("ch:'k'};","ch:'k'};BK.forEach(b=>ACTORS[b]={kind:'o',color:0xa88a5a});");
rep("const show=(who,key,face)=>","BK.forEach((b,i)=>{START[b]={at:[AZ.booths[i].fx,AZ.booths[i].fz-1],face:'s'}});\n const show=(who,key,face)=>");
/* שלבים 96–99 */
const i0=s.indexOf("  96:()=>"),i1=s.indexOf("  100:()=>");
if(i0<0||i1<0)throw new Error('96/100');
const NEW=`  96:()=>{const pts=[[10,ZC_],[250,ZC_]].concat(AZ.seg(250,AZ.booths[0].fx-8)),gp=pts.map(p=>({move:'g2',to:p,speed:34}));
   return{a:seq(place('e1','lots','e'),place('e2','lots','e'),place('sg','lots','e'),par({who:'ai',walk:pts,speed:34,face:90},gp,{who:'e1',walk:pts,speed:34,face:90},{who:'e2',walk:pts,speed:34,face:90},{who:'sg',walk:pts,speed:34,face:90}),wait(1)),c:view(AZ.booths[0].fx,AZ.booths[0].fz,terrH(AZ.booths[0].fx,AZ.booths[0].fz)+3,40,16,250)}},
  97:()=>{const acts=[];let x0=AZ.booths[0].fx-8;AZ.booths.forEach((b,i)=>{const pts=AZ.seg(x0,b.fx).concat([[b.fx,b.fz+2]]);x0=b.fx;acts.push(par({who:'ai',walk:pts,speed:34,face:90},pts.map(p=>({move:'g2',to:[p[0]+3,p[1]],speed:34}))),pose('b'+(i+1),'both'),wait(1.1),pose('b'+(i+1),'idle'))});
   return{a:seq(acts),c:view(AZ.booths[3].fx,AZ.booths[3].fz,terrH(AZ.booths[3].fx,AZ.booths[3].fz)+3,60,24,230)}},
  98:()=>{const b=AZ.booths[9],pts=AZ.seg(b.fx,2640),gp=pts.map(p=>({move:'g2',to:[p[0]+3,p[1]],speed:30}));
   return{a:seq({who:'b10',face:90},par({who:'ai',walk:pts,speed:30,face:90},gp),wait(2)),c:view(b.fx,b.fz,terrH(b.fx,b.fz)+4,90,40,200)}},
  99:()=>{const cz=AZ.cliff[1],pts=AZ.seg(2640,2680);
   const wave=[];for(let i=9;i>=0;i--)wave.push(pose('b'+(i+1),'wave'),wait(.7));
   return{a:seq(par({who:'ai',walk:pts,speed:12,face:90},pts.map(p=>({move:'g2',to:[p[0]+3,p[1]],speed:12}))),anim('ai','press',1.2),
     {move:'g2',to:[2706,cz,terrH(2706,cz)+8],speed:10,arc:12},{move:'g2',to:[2722,cz+6],speed:14,arc:5},{item:'g2',state:'lay',dur:.6},wait(1.2),{remove:['g2']},wave,BK.map(b=>pose(b,'idle'))),c:view(2684,cz,terrH(2684,cz)+4,55,28,230)}},
`;
s=s.slice(0,i0)+NEW+s.slice(i1);
fs.writeFileSync('tools/yk-template.js',s);console.log('ok');
