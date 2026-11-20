/* סדר העבודה: עבודת הכהן הגדול ביום הכיפורים – מהפרשתו ועד צאתו לביתו (משנה יומא א–ז; רמב״ם הלכות עבודת יום הכיפורים א–ד; ויקרא טז)
   הטקסטים והמקורות נוצרו מ-tools/yoma-research.json (נקרא מספריא, 130 שלבים) ע"י tools/gen-yk.cjs; התנועה מוגדרת כאן. כל השעות הן הערכה (זריחה 6:00 בדגם). */
{const V=SVL,H=SVH,view=H.view,ZC_=ZC,YH_=YH,E=V.E,W=V.W,TOP=V.TOP,GX=V.goldAlt[0],DOOR=V.hekDoor[0];
 /*DATA*/
 /* ---- צמתי הליכה (אמות) ---- */
 const ND={nik:[10,ZC_],lots:[2,-63],ne:[-8,-62.5],nw:[-46,-62.5],bull:[-53,-47],kiy:V.kiyorStand,wc:[-47,-40],ws:[-47,5],rf:[W,5],sw:[-44,-26],sl:[-34,-63],
  ulam:[-52,ZC_],hall:[-66,ZC_],door:[-80,ZC_],mid:[-95,ZC_],hz:[-108,ZC_+3],galt:[-112,ZC_],
  c1:[-121,ZC_+6],c2:[-125.4,ZC_+9.4],c3:[-125.4,ZC_-9.4],c4:[-129,ZC_-9],c5:[-132,ZC_-5],stone:[-137,ZC_-1.5],kk:[-133,ZC_+2],
  n100:[-46,-100],parh:[-45,-106],w100:[-143,-100],parva:[-143,-105],avt:[-77,-1],ava:[-70,3],dsh:V.deshenStand,dw:[-14.2,5],yne:V.yesodNE,tor:[32,ZC_],far:[230,ZC_],top:[-24,-35,TOP],mp:[-52,ZC_+9],
  gate:[12,ZC_+4]};
 const EDG=[['nik','lots'],['lots','ne'],['ne','nw'],['ne','yne'],['nw','bull'],['nw','ulam'],['nw','n100'],['bull','kiy'],['bull','wc'],['kiy','wc'],['wc','ws'],['wc','sw'],['ws','rf'],['ws','ava'],['ava','avt'],['ws','dw'],['dw','dsh'],['nw','sl'],
  ['ulam','hall'],['hall','door'],['door','mid'],['mid','hz'],['hz','galt'],['hz','c1'],['c1','c2'],['c2','c3'],['c3','c4'],['c4','c5'],['c5','stone'],['c5','kk'],['kk','stone'],['n100','parh'],['n100','w100'],['w100','parva'],['nik','tor'],['tor','far'],['ulam','mp'],['nik','gate']];
 const ADJ={};EDG.forEach(([a,b])=>{(ADJ[a]=ADJ[a]||[]).push(b);(ADJ[b]=ADJ[b]||[]).push(a)});
 const path=(a,b)=>{if(a==b)return[];const prev={[a]:null},q=[a];while(q.length){const c=q.shift();if(c==b)break;(ADJ[c]||[]).forEach(n=>{if(!(n in prev)){prev[n]=c;q.push(n)}})}if(!(b in prev))return[b];const r=[];for(let c=b;c!=a;c=prev[c])r.unshift(c);return r};
 const INSIDE=new Set(['hall','door','mid','hz','galt','c1','c2','c3','c4','c5','stone','kk']);
 const ny=k=>INSIDE.has(k)?YH_:YA;
 const HP='hp',POS={},SHOWN=new Set(['hp']);
 /* שחקנים */
 const AZ=AZAZEL,BK=AZ.booths.map((b,i)=>'b'+(i+1));
 const ACTORS={hn:{kind:'o',color:0xefe9da},hg:'g',hy:'y',k1:'k',k2:'k',k3:'k',k4:'k',sg:'k',e1:{kind:'k',hair:0xcfcfcf},e2:{kind:'k',hair:0xbcbcbc},ai:{kind:'o',color:0x7a9a6a},ch:'k'};BK.forEach(b=>ACTORS[b]={kind:'o',color:0xa88a5a});
 const START={};Object.keys(ACTORS).forEach(a=>START[a]={at:ND.parva.slice(0,2),face:'s',hidden:1});
 BK.forEach((b,i)=>{START[b]={at:[AZ.booths[i].fx,AZ.booths[i].fz-1],face:'s'}});
 const show=(who,key,face)=>{const out=[];if(!SHOWN.has(who)){SHOWN.add(who);POS[who]=key;out.push({who,vis:true,at:ND[key].slice(0,2),face:face||'w'})}return out};
 const walkTo=(who,key,a1,b1)=>{let sp=null,face=null;[a1,b1].forEach(v=>{if(typeof v=='string')face=v;else if(typeof v=='number'){if(v>=3&&v<20)sp=v;else face=v}});   // מהירות: מספר 3–20; כיוון: מחרוזת או מספר אחר
  const out=show(who,POS[who]||key,face);let cur=POS[who]||key;
  const pts=[];
  if(cur=='top'&&key=='top')return out;
  if(cur=='top'&&key!='top'){out.push({who,walk:H.downPts(W),speed:sp||7});cur='rf'}
  if(key=='top'&&cur!='top'){path(cur,'rf').forEach(n=>pts.push(ND[n].slice(0,2)));if(pts.length)out.push({who,walk:pts.splice(0),speed:sp||7});out.push({who,walk:H.upPts(E).concat([[ND.top[0],ND.top[1],TOP]]),speed:sp||5,face:face});POS[who]='top';return out}
  path(cur,key).forEach(n=>pts.push(ND[n].slice(0,2)));if(pts.length)out.push({who,walk:pts,speed:sp||7,face:face});else if(face!=null)out.push({who,face});
  POS[who]=key;return out};
 const place=(who,key,face)=>{const out=show(who,key,face);POS[who]=key;return out};
 const wait=t=>({wait:t}),anim=(who,a,dur)=>({who,anim:a,dur:dur||1.2}),pose=(who,p)=>({who,pose:p});
 const cams={};const C=(key,az,d,h)=>{const p=ND[key];return view(p[0],p[1],ny(key)+1.5,d||14,h||7,az==null?90:az)};
 const heC=(key,dx,dz)=>({pos:[ND[key][0]+(dx==null?8:dx),YH_+5,ND[key][1]+(dz==null?7.5:dz)],tgt:[ND[key][0],YH_+2.3,ND[key][1]]});
 const spawn=(type,id,key,dx,dz,y,opts)=>({spawn:type,id,at:[ND[key][0]+(dx||0),ND[key][1]+(dz||0)].concat(y!=null?[y]:[]),opts:opts||{}});
 /* ---- ההגדרה לכל שלב (לפי מספר השלב במחקר) ---- */
 let cur_hp='hn';
 const seq=(...a)=>a.flat(9);
 const par=(...g)=>({__par:g.map(x=>{const l=[x].flat(9);return l.length>1?{seq:l}:l[0]})});
 const spr=n=>Array.from({length:n},()=>anim(HP,'sprinkle',.8));
 const wash=[];                  // אינדקסי שלבים שבהם זורמים מים מן הכיור (life.js)
 const tev=(who,key)=>seq({who,vis:false},wait(2),{who,vis:true,at:ND[key].slice(0,2),face:'s'});   // טבילה: נעלם מאחורי הסדין ושב
 const stand=(who,key,face)=>place(who,key,face);
 const SP={
  10:()=>({a:seq(walkTo(HP,'avt','s'),place('e1','ava','e'),place('e2','ava','e'),walkTo('e1','avt','w'),wait(.5)),c:C('avt',60,12,6)}),
  11:()=>({a:seq(pose('e1','up'),wait(1.5),pose('e1','idle')),c:C('avt',100,9,4)}),
  12:()=>({a:seq(anim(HP,'bow',2),wait(1)),c:C('avt',80,8,3)}),
  13:()=>({a:seq(wait(1)),c:C('avt',120,12,6)}),
  14:()=>({a:seq(wait(1)),c:C('avt',120,12,6)}),
  15:()=>({a:seq(place('k3','ava','e'),walkTo('k3','avt','w'),pose('k3','rh'),wait(1.5),pose('k3','idle')),c:C('avt',60,10,5)}),
  16:()=>({a:seq(walkTo(HP,'rf','n',180)),c:view(V.AX,V.AZ,YA+6,40,22,200)}),
  17:()=>({a:seq(place('k1','rf','n'),place('k2','rf','n'),place('k3','rf','n'),par(walkTo('k1','top',6),walkTo('k2','top',7),walkTo('k3','top',8.5))),c:view(V.AX,V.AZ+14,YA+4,26,12,200)}),
  18:()=>({a:[wait(1.5)],c:view(V.AX,V.AZ+14,YA+4,26,12,200)}),
  19:()=>({a:seq(pose('k3','rake'),wait(1.5)),c:view(V.AX,V.AZ,YA+9,22,10,170)}),
  20:()=>({a:[wait(1)],c:view(-25,-50,YA+3,90,50,90)}),
  21:()=>({a:seq(pose('k3','rake'),wait(3),pose('k3','idle')),c:view(V.AX,V.AZ,YA+9,20,9,160)}),
  22:()=>({a:[wait(1)],c:C('nw',90,40,20)}),
  23:()=>({a:seq(spawn('bull','pr','bull',0,0),spawn('goat','g1','lots',-4,2),spawn('goat','g2','lots',-4,-2),wait(1)),c:C('bull',270,16,7)}),
  24:()=>({a:[wait(1.5)],c:view(-25,-50,YA+3,110,70,90)}),
  25:()=>({a:seq(walkTo(HP,'parva','s'),place('k1','parva','s'),place('k2','parva','s'),spawn('cloth','sd','parva',0,2)),c:C('parva',20,14,6)}),
  26:()=>({a:seq(pose('k1','both'),pose('k2','both'),wait(1.5)),c:C('parva',20,12,5)}),
  27:()=>({a:seq(tev(HP,'parva')),c:C('parva',20,12,5)}),
  28:()=>({a:seq(wait(1.2),pose(HP,'both'),wait(1)),c:C('parva',20,12,5)}),
  29:()=>{wash.push(0);return{a:seq(walkTo(HP,'kiy','s',180),pose(HP,'both'),anim(HP,'press',1.5),pose(HP,'rh'),wait(2),pose(HP,'idle')),c:view(V.kiyor[0],V.kiyor[1],YA+2,12,5,160)}},
  30:()=>({a:seq(walkTo(HP,'sl','e',90),spawn('sheep','tm','sl',2,-1),wait(.6),anim(HP,'slaughter',1.6),{item:'tm',state:'lay',dur:.8}),c:view(-30,-63,YA+2,16,7,200)}),
  31:()=>({a:seq(spawn('bazach','bz','sl',1.5,0,YA+1.5),walkTo(HP,'yne','w',225),anim(HP,'zerika',1.2),walkTo(HP,'sw','e',45),anim(HP,'zerika',1.2)),c:view(V.AX,V.AZ,YA+4,52,26,40)}),
  32:()=>({a:seq(walkTo(HP,'galt',5.5,270),spawn('tani','tn','galt',1.5,2,YH_),spawn('coals','cl','galt',1.5,2,YH_+.4,{s:.3}),pose(HP,'rh'),anim(HP,'bow',1.2),wait(2)),c:heC('galt',9,5)}),
  33:()=>({a:seq(walkTo(HP,'mid','n',0),pose(HP,'high'),wait(1),anim(HP,'press',1.5),pose(HP,'idle')),c:view(-100,ZC_+3,YH_+2.2,12,6,100)}),
  34:()=>({a:seq(walkTo(HP,'hz','w',270),anim(HP,'bow',2.2)),c:heC('hz',8,5)}),
  35:()=>({a:seq(walkTo(HP,'top',5.5),pose(HP,'tray'),wait(2),spawn('meat','mt','top',3,0,TOP+.4)),c:view(V.AX,V.AZ,YA+9,22,10,150)}),
  36:()=>({a:seq(spawn('loaf','lf','top',-2,2,TOP+.5),pose(HP,'rh'),wait(2),pose(HP,'idle')),c:view(V.AX,V.AZ,YA+9,22,9,160)}),
  37:()=>({a:seq(spawn('flask','fl','top',-3,5,TOP+.5),pose(HP,'rh'),anim(HP,'sprinkle',1.6),wait(1)),c:view(V.AX,V.AZ,YA+9,24,10,20)}),
  38:()=>({a:[wait(1.5)],c:view(-25,-50,YA+6,70,36,90)}),
  39:()=>({a:seq(walkTo(HP,'parva','s'),place('k1','parva','s'),place('k2','parva','s'),spawn('cloth','sd2','parva',0,2)),c:C('parva',20,14,6)}),
  40:()=>({a:seq(pose(HP,'both'),anim(HP,'press',1.4),wait(1)),c:C('parva',20,12,5)}),
  41:()=>({a:seq(tev(HP,'parva')),c:C('parva',20,12,5)}),
  42:()=>({a:seq(wait(1.2),pose(HP,'both'),wait(1)),c:C('parva',20,12,5)}),
  43:()=>({a:seq(pose(HP,'both'),anim(HP,'press',1.4),wait(1)),c:C('parva',20,12,5)}),
  44:()=>({a:[wait(1.5)],c:C('parva',20,12,5)}),
  45:()=>({a:seq(walkTo(HP,'bull','w',270)),c:C('bull',90,16,7)}),
  46:()=>({a:seq(anim(HP,'press',2.2),wait(.5)),c:C('bull',60,11,4)}),
  47:()=>({a:seq(place('k3','bull','w'),pose(HP,'up'),wait(2)),c:C('bull',60,11,4)}),
  48:()=>({a:seq(place('k1','bull','w'),place('k2','bull','w'),par(anim('k1','bow',1.5),anim('k2','bow',1.5),anim('k3','bow',1.5))),c:C('bull',60,16,7)}),
  49:()=>({a:seq(par(anim(HP,'kneel',2),anim('k1','kneel',2),anim('k2','kneel',2),anim('k3','kneel',2)),par(anim(HP,'rise',1),anim('k1','rise',1),anim('k2','rise',1),anim('k3','rise',1))),c:C('bull',60,16,7)}),
  50:()=>({a:seq(walkTo(HP,'lots','w',270),place('sg','lots','e'),place('e1','lots','e')),c:C('lots',60,14,6)}),
  51:()=>({a:seq(spawn('jar','kal','lots',-2,0,YA+1.5),spawn('tray','lt','lots',-2,.6,YA+1.3),{move:'g1',to:[ND.lots[0]-1.5,ND.lots[1]+1.2],speed:2},{move:'g2',to:[ND.lots[0]-1.5,ND.lots[1]-1.2],speed:2},wait(1.5)),c:C('lots',60,10,5)}),
  52:()=>({a:seq(pose(HP,'rh'),anim(HP,'press',1.2),wait(1),pose(HP,'idle')),c:C('lots',60,9,4)}),
  53:()=>({a:seq(pose('sg','up'),wait(1.5),pose('sg','idle')),c:C('lots',60,10,5)}),
  54:()=>({a:seq(pose(HP,'rh'),anim(HP,'press',1.2),{move:'lt',to:[ND.lots[0]-1.4,ND.lots[1]+1.2,YA+2],speed:2},wait(1.5)),c:C('lots',60,9,4)}),
  55:()=>({a:seq(spawn('cloth','zh','lots',-1.6,-1.2,YA+2),pose(HP,'rh'),wait(1.8),pose(HP,'idle')),c:C('lots',60,9,4)}),
  56:()=>({a:seq(walkTo(HP,'bull','w',270)),c:C('bull',90,16,7)}),
  57:()=>({a:seq(place('k4','bull','w'),anim(HP,'press',2),pose(HP,'up'),wait(2)),c:C('bull',60,11,4)}),
  58:()=>({a:seq(anim(HP,'slaughter',1.6),{item:'pr',state:'lay',dur:.8},spawn('bazach','bz2','bull',1.2,.6,YA+1.2),spawn('blood','bl','bull',.6,1,YA+.05)),c:C('bull',60,10,4)}),
  59:()=>({a:seq({who:'k2',take:'bz2',hand:'R'},walkTo('k2','door','w',270),pose('k2','hold'),wait(1.5)),c:C('door',90,16,7)}),
  60:()=>({a:seq(walkTo(HP,'ws','n',90),spawn('machta','mh','ws',2,0,YA+1.3),{who:HP,take:'mh',hand:'R'},walkTo(HP,'top',5.5)),c:view(V.AX,V.AZ+14,YA+4,30,14,200)}),
  61:()=>({a:seq(pose(HP,'rh'),wait(2.2)),c:view(V.AX,V.AZ+8,YA+5,22,10,180)}),
  62:()=>({a:seq(spawn('coals','cl2','top',-3,-3,TOP+.4,{s:.3}),anim(HP,'press',1.6),wait(1)),c:view(V.AX,V.AZ,YA+9,20,9,30)}),
  63:()=>({a:seq(walkTo(HP,'ulam','w',270),{who:HP,drop:'mh',at:[ND.ulam[0]-3,ND.ulam[1]-1.2]},pose(HP,'idle')),c:C('ulam',90,14,6)}),
  64:()=>({a:seq(place('k1','ulam','w'),spawn('kaf','kf','ulam',-2,1.8,YA+1.2),{who:'k1',take:'kf',hand:'R'},{who:'k1',give:'kf',to:HP,hand:'L'},wait(1)),c:C('ulam',90,12,5)}),
  65:()=>({a:seq(pose(HP,'both'),anim(HP,'press',1.8),wait(1)),c:C('ulam',90,10,4)}),
  66:()=>({a:seq({who:HP,take:'mh',hand:'R'},pose(HP,'rh'),wait(1.5)),c:C('ulam',90,10,4)}),
  67:()=>({a:seq(walkTo(HP,'hz','w',270)),c:heC('hz',10,6)}),
  68:()=>({a:seq(walkTo(HP,'c3','n',0)),c:heC('c2',8,-2)}),
  69:()=>({a:seq(walkTo(HP,'stone','w',270)),c:{pos:[-130,YH_+6,ZC_+9],tgt:[-137,YH_+1.5,ZC_]}}),
  70:()=>({a:seq({who:HP,drop:'mh',at:[ND.stone[0]+1,ND.stone[1]+.8]},wait(1)),c:{pos:[-130,YH_+5,ZC_+8],tgt:[-137,YH_+1.5,ZC_]}}),
  71:()=>({a:seq(anim(HP,'zerika',1.6),spawn('fire','sm','stone',-.6,2.4,YH_+.9,{s:.3}),{who:HP,drop:'kf',at:[ND.stone[0]+1,ND.stone[1]-.8,YH_]},wait(1)),c:{pos:[-130,YH_+5,ZC_+8],tgt:[-137,YH_+1.5,ZC_]}}),
  72:()=>({a:seq(wait(3)),c:{pos:[-130,YH_+5,ZC_+8],tgt:[-137,YH_+2,ZC_]}}),
  73:()=>({a:seq(walkTo(HP,'hz',5.5,90)),c:heC('c1',8,6)}),
  74:()=>({a:seq(anim(HP,'bow',2.2),wait(.5)),c:heC('hz',8,6)}),
  75:()=>({a:[wait(1.5)],c:view(-60,ZC_,YA+4,60,30,90)}),
  76:()=>({a:seq(walkTo(HP,'door','w',270),{who:'k2',give:'bz2',to:HP,hand:'R'},walkTo(HP,'stone','w',270),pose(HP,'rh')),c:heC('c3',8,6)}),
  77:()=>({a:seq(spr(8)),c:{pos:[-130,YH_+4,ZC_+7],tgt:[-137,YH_+2,ZC_]}}),
  78:()=>({a:[wait(2)],c:{pos:[-130,YH_+4,ZC_+7],tgt:[-137,YH_+2,ZC_]}}),
  79:()=>({a:seq(walkTo(HP,'galt',5.5,270),{who:HP,drop:'bz2',at:[ND.galt[0]+3,ND.galt[1]-3,YH_]},pose(HP,'idle')),c:heC('galt',9,6)}),
  80:()=>({a:seq(walkTo(HP,'lots','w',270),anim(HP,'press',1.2),anim(HP,'slaughter',1.6),{item:'g1',state:'lay',dur:.8},spawn('bazach','bz3','lots',-2,3,YA+1.2)),c:C('lots',60,12,5)}),
  81:()=>({a:seq({who:HP,take:'bz3',hand:'R'},walkTo(HP,'stone','w',270),spr(8)),c:{pos:[-130,YH_+4,ZC_+7],tgt:[-137,YH_+2,ZC_]}}),
  82:()=>({a:seq(walkTo(HP,'galt',5.5,270),{who:HP,drop:'bz3',at:[ND.galt[0]+3,ND.galt[1]+3,YH_]},pose(HP,'idle')),c:heC('galt',9,6)}),
  83:()=>({a:seq(walkTo(HP,'c1','w',270),{who:HP,take:'bz2',hand:'R'},spr(8)),c:heC('c1',8,6)}),
  84:()=>({a:seq({who:HP,drop:'bz2',at:[ND.c1[0]+2,ND.c1[1]+1,YH_]},{who:HP,take:'bz3',hand:'R'},spr(8)),c:heC('c1',8,6)}),
  85:()=>({a:seq(pose(HP,'rh'),anim(HP,'press',1.5),wait(1)),c:heC('c1',8,6)}),
  86:()=>({a:seq(walkTo(HP,'galt',5.5,270)),c:heC('galt',9,6)}),
  87:()=>({a:seq(anim(HP,'sprinkle',1),anim(HP,'sprinkle',1),anim(HP,'sprinkle',1),anim(HP,'sprinkle',1)),c:heC('galt',9,6)}),
  88:()=>({a:seq(pose(HP,'rh'),anim(HP,'press',1.4),wait(.8)),c:heC('galt',9,6)}),
  89:()=>({a:seq(spr(7)),c:heC('galt',9,6)}),
  90:()=>({a:seq(walkTo(HP,'sw','e',45),anim(HP,'zerika',1.6),wait(.8)),c:view(V.AX-18,V.AZ+18,YA+2,16,7,300)}),
  91:()=>({a:[wait(2)],c:view(-70,ZC_,YH_+6,140,70,90)}),
  92:()=>({a:seq(walkTo(HP,'lots','w',270),anim(HP,'press',2),wait(.5)),c:C('lots',60,11,5)}),
  93:()=>({a:seq(pose(HP,'up'),wait(3),pose(HP,'idle')),c:C('lots',60,11,5)}),
  94:()=>({a:seq(place('k1','lots','w'),place('k2','lots','w'),par(anim('k1','kneel',2),anim('k2','kneel',2),anim(HP,'kneel',2)),par(anim('k1','rise',1),anim('k2','rise',1),anim(HP,'rise',1))),c:C('lots',60,16,7)}),
  95:()=>({a:seq(place('ai','lots','w'),{move:'g2',to:[ND.lots[0]+1.5,ND.lots[1]],speed:2},wait(1)),c:C('lots',60,11,5)}),
  96:()=>{const pts=[[10,ZC_],[250,ZC_]].concat(AZ.seg(250,AZ.booths[0].fx-8)),gp=pts.map(p=>({move:'g2',to:p,speed:34}));
   return{a:seq(place('e1','lots','e'),place('e2','lots','e'),place('sg','lots','e'),par({who:'ai',walk:pts,speed:34,face:90},gp,{who:'e1',walk:pts,speed:34,face:90},{who:'e2',walk:pts,speed:34,face:90},{who:'sg',walk:pts,speed:34,face:90}),wait(1)),c:view(AZ.booths[0].fx,AZ.booths[0].fz,terrH(AZ.booths[0].fx,AZ.booths[0].fz)+3,40,16,250)}},
  97:()=>{const acts=[];let x0=AZ.booths[0].fx-8;AZ.booths.forEach((b,i)=>{const pts=AZ.seg(x0,b.fx).concat([[b.fx,b.fz+2]]);x0=b.fx;acts.push(par({who:'ai',walk:pts,speed:34,face:90},pts.map(p=>({move:'g2',to:[p[0]+3,p[1]],speed:34}))),pose('b'+(i+1),'both'),wait(1.1),pose('b'+(i+1),'idle'))});
   return{a:seq(acts),c:view(AZ.booths[3].fx,AZ.booths[3].fz,terrH(AZ.booths[3].fx,AZ.booths[3].fz)+3,60,24,230)}},
  98:()=>{const b=AZ.booths[9],pts=AZ.seg(b.fx,2640),gp=pts.map(p=>({move:'g2',to:[p[0]+3,p[1]],speed:30}));
   return{a:seq({who:'b10',face:90},par({who:'ai',walk:pts,speed:30,face:90},gp),wait(2)),c:view(b.fx,b.fz,terrH(b.fx,b.fz)+4,90,40,200)}},
  99:()=>{const cz=AZ.cliff[1],pts=AZ.seg(2640,2680);
   const wave=[];for(let i=9;i>=0;i--)wave.push(pose('b'+(i+1),'wave'),wait(.7));
   return{a:seq(par({who:'ai',walk:pts,speed:12,face:90},pts.map(p=>({move:'g2',to:[p[0]+3,p[1]],speed:12}))),anim('ai','press',1.2),
     {move:'g2',to:[2706,cz,terrH(2706,cz)+8],speed:10,arc:12},{move:'g2',to:[2722,cz+6],speed:14,arc:5},{item:'g2',state:'lay',dur:.6},wait(1.2),{remove:['g2']},wave,BK.map(b=>pose(b,'idle'))),c:view(2684,cz,terrH(2684,cz)+4,55,28,230)}},
  100:()=>({a:seq(walkTo(HP,'bull','w',270),anim(HP,'press',2),anim(HP,'press',1.5)),c:C('bull',60,12,5)}),
  101:()=>({a:seq(walkTo(HP,'top',5.5),pose(HP,'tray'),spawn('meat','mt2','top',2,2,TOP+.4),wait(2),pose(HP,'idle')),c:view(V.AX,V.AZ,YA+9,22,10,150)}),
  102:()=>({a:seq(walkTo('k1','dsh',5),spawn('fire','fd','dsh',-1,0,YA,{s:.6})),c:view(V.deshen[0],V.deshen[1],YA+2,22,10,60)}),
  103:()=>({a:[wait(2)],c:view(-25,-30,YA+3,120,75,90)}),
  104:()=>({a:[wait(2)],c:heC('door',-4,6)}),
  105:()=>({a:seq(walkTo(HP,'tor','w',270),place('sg','tor','e'),place('e1','tor','e'),place('e2','tor','e'),spawn('cloth','ts','tor',0,.4,YA+1.5)),c:view(ND.tor[0],ND.tor[1],YA+2,16,7,70)}),
  106:()=>({a:[wait(2)],c:view(V.deshen[0],V.deshen[1],YA+2,22,10,60)}),
  107:()=>({a:seq({who:'sg',take:'ts',hand:'R'},{who:'sg',give:'ts',to:'e1',hand:'R'},{who:'e1',give:'ts',to:'e2',hand:'R'},{who:'e2',give:'ts',to:HP,hand:'R'}),c:view(ND.tor[0],ND.tor[1],YA+2,14,6,70)}),
  108:()=>({a:seq(pose(HP,'hold'),wait(3)),c:view(ND.tor[0],ND.tor[1],YA+2,14,6,70)}),
  109:()=>({a:seq(anim(HP,'upright',1),pose(HP,'hold'),wait(2.5)),c:view(ND.tor[0],ND.tor[1],YA+2,14,6,70)}),
  110:()=>({a:seq(pose(HP,'up'),wait(3),pose(HP,'idle')),c:view(ND.tor[0],ND.tor[1],YA+2,14,6,70)}),
  111:()=>({a:seq(walkTo(HP,'parva','s'),place('k1','parva','s'),place('k2','parva','s'),spawn('cloth','sd3','parva',0,2),pose(HP,'both'),anim(HP,'press',1.4)),c:C('parva',20,12,5)}),
  112:()=>({a:seq(tev(HP,'parva')),c:C('parva',20,12,5)}),
  113:()=>({a:seq(pose(HP,'both'),anim(HP,'press',1.4),wait(1)),c:C('parva',20,12,5)}),
  114:()=>({a:seq(walkTo(HP,'sl','e',90),spawn('goat','g3','sl',2,-1),anim(HP,'slaughter',1.6),{item:'g3',state:'lay',dur:.8}),c:view(-30,-63,YA+2,16,7,200)}),
  115:()=>({a:seq(spawn('ram','rm','sl',2,1),anim(HP,'press',1.5),anim(HP,'slaughter',1.6),{item:'rm',state:'lay',dur:.8}),c:view(-30,-63,YA+2,16,7,200)}),
  116:()=>({a:seq(walkTo(HP,'top',5.5),pose(HP,'tray'),wait(2),pose(HP,'idle')),c:view(V.AX,V.AZ,YA+9,22,10,150)}),
  117:()=>({a:seq(walkTo(HP,'sl','e',90),spawn('sheep','tm2','sl',2,0),anim(HP,'slaughter',1.6),{item:'tm2',state:'lay',dur:.8}),c:view(-30,-63,YA+2,16,7,200)}),
  118:()=>({a:seq(walkTo(HP,'parva','s'),place('k1','parva','s'),place('k2','parva','s'),spawn('cloth','sd4','parva',0,2),pose(HP,'both'),anim(HP,'press',1.4)),c:C('parva',20,12,5)}),
  119:()=>({a:seq(tev(HP,'parva')),c:C('parva',20,12,5)}),
  120:()=>({a:seq(pose(HP,'both'),anim(HP,'press',1.4),wait(1)),c:C('parva',20,12,5)}),
  121:()=>({a:seq(walkTo(HP,'stone','w',270),{who:HP,take:'mh',hand:'R'},{who:HP,take:'kf',hand:'L'},walkTo(HP,'hz',5.5,90)),c:heC('c1',8,6)}),
  122:()=>({a:seq(walkTo(HP,'parva','s'),place('k1','parva','s'),place('k2','parva','s'),spawn('cloth','sd5','parva',0,2),pose(HP,'both'),anim(HP,'press',1.4)),c:C('parva',20,12,5)}),
  123:()=>({a:seq(tev(HP,'parva')),c:C('parva',20,12,5)}),
  124:()=>({a:seq(pose(HP,'both'),anim(HP,'press',1.4),wait(1)),c:C('parva',20,12,5)}),
  125:()=>({a:seq(walkTo(HP,'galt',5.5,270),spawn('coals','cl3','galt',1.5,2,YH_+.4,{s:.3}),pose(HP,'rh'),anim(HP,'bow',1.2),wait(2)),c:heC('galt',9,5)}),
  126:()=>({a:seq(walkTo(HP,'mid','n',0),pose(HP,'high'),wait(1),anim(HP,'press',1.5),pose(HP,'idle')),c:view(-100,ZC_+3,YH_+2.2,12,6,100)}),
  127:()=>({a:seq(walkTo(HP,'parva','s'),place('k1','parva','s'),place('k2','parva','s'),spawn('cloth','sd6','parva',0,2),pose(HP,'both'),anim(HP,'press',1.4)),c:C('parva',20,12,5)}),
  128:()=>({a:seq(wait(2)),c:C('parva',20,12,5)}),
  129:()=>({a:seq(place('e1','parva','e'),place('e2','parva','e'),place('k3','parva','e'),par(walkTo(HP,'gate',4,90),walkTo('e1','gate',4,90),walkTo('e2','gate',4,90),walkTo('k3','gate',4,90))),c:view(-20,ZC_,YA+4,70,30,90)}),
  130:()=>({a:[wait(2)],c:view(-20,ZC_,YA+4,80,40,90)})
 };
 const FIXED=new Set([69,70,71,72,77,78,81]);
 const steps=[];const TIMES=[];
 const GA={gold:'hg',white:'hy'};
 const mk=(d)=>{const n=d[0],garb=d[6],want=garb=='gold'?'hg':garb=='white'?'hy':'hn';
  let a=[];
  /* החלפת בגדים: הדמות הקודמת נעלמת והחדשה מופיעה באותו מקום */
  if(cur_hp!=want){const key=POS[HP]||'parva';a.push({who:cur_hp,vis:false});a.push({who:want,vis:true,at:ND[key].slice(0,2),face:'s'});cur_hp=want;SHOWN.add(want)}
  const sp=SP[n]?SP[n]():{a:[wait(1.2)],c:null};
  /* HP: המפרט משתמש בשם 'hp' – ממפים לדמות הפעילה */
  const fix=x=>{if(Array.isArray(x))return x.map(fix);if(x&&typeof x=='object'){if(x.__par)return x.__par.map(fix);const o={};for(const k in x){let v=x[k];if((k=='who'||k=='to')&&v=='hp')v=cur_hp;o[k]=(v&&typeof v=='object')?fix(v):v}return o}return x};
  a=a.concat(fix(sp.a));
  const q=d[3]?' — "'+d[3]+'"':'';
  return{text:d[1]+': '+d[2]+q+(n==97?' (בדגם הדרך מכווצת – בפועל כ-12 מיל, כ-24,000 אמה; מיקום הסוכות והצוק משוער.)':''),src:d[4],cam:Object.assign({},sp.c||{},{follow:(n>=96&&n<=99)?'ai':cur_hp},FIXED.has(n)?{fixed:true}:{}),actions:a}};
 /* שלב פתיחה: שבעת הימים שלפני */
 steps.push({text:'שבעת ימים לפני יום הכיפורים מפרישים את הכהן הגדול מביתו ללשכת פרהדרין, ומכינים כהן גדול אחר תחתיו – שמא יארע בו פסול. מזים עליו אפר פרה בשלישי ובשביעי, מלמדים אותו את סדר העבודה וזקני בית דין מוסרים לו את עיקרי הדינים; בערב היום מעבירים לפניו את הקרבנות וסעודתו מצומצמת.',src:'משנה יומא א:א–ז; ב:א',cam:view(ND.parh[0],ND.parh[1],YA+2,24,10,170),actions:[{who:'hn',vis:true,at:ND.parh.slice(0,2),face:'s'},wait(2)]});
 SHOWN.add('hn');POS['hn']='parh';POS[HP]='parh';TIMES.push(18);
 YKD.forEach(d=>{const st=mk(d);steps.push(st);TIMES.push(d[5])});
 const wI=[];YKD.forEach((d,i)=>{if(d[0]==29)wI.push(i+1)});
 window.YK_WASH=wI;window.YK_TIMES=TIMES;
 SERVICES.push({id:'yom-kippur',name:'עבודת יום הכיפורים',cat:'קרבנות',src:'משנה יומא א–ז · רמב״ם הלכות עבודת יום הכיפורים א–ד · ויקרא טז',
  actors:ACTORS,main:'hn',start:START,items:[],steps})}
