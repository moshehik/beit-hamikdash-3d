// one-off, idempotent: lets MAP_IMG (src/map_images.js) arrive after the app starts (published site loads it in the background).
// onMapImgs(f) runs f now if MAP_IMG exists, otherwise when the late chunk calls window.__mapImgsLoaded().
const fs = require('fs');
const rd = (f) => fs.readFileSync(__dirname + '/../src/' + f, 'utf8');
const wr = (f, s) => fs.writeFileSync(__dirname + '/../src/' + f, s, 'utf8');
function rep(s, a, b, what) { if (s.includes(b)) return s; if (!s.includes(a)) throw new Error('not found: ' + what); return s.replace(a, () => b); }

let m = rd('map.js');
m = rep(m, 'const MPU={};',
  "const MPU={};const _mapImgCbs=[];function onMapImgs(f){if(typeof MAP_IMG!='undefined')f();else _mapImgCbs.push(f)}window.__mapImgsLoaded=()=>{_mapImgCbs.splice(0).forEach(f=>{try{f()}catch(e){}})};",
  'MPU');
m = rep(m, 'function mapPic(k){if(k in MPU)return MPU[k];let r=null;',
  "function mapPic(k){if(k in MPU)return MPU[k];if(typeof MAP_IMG=='undefined')return null;let r=null;", 'mapPic');
m = rep(m, "d.appendChild(im);im.src=u}else d.textContent=emo||'';return d}",
  "d.appendChild(im);im.src=u}else{d.textContent=emo||'';if(k)onMapImgs(()=>{const u2=mapPic(k);if(u2){const im=new Image();im.alt='';im.draggable=false;im.onerror=()=>{im.remove();d.textContent=emo||''};d.textContent='';d.appendChild(im);im.src=u2}})}return d}", 'mapImg');
m = rep(m, "(function(){const u=mapPic('base_m');", "onMapImgs(function(){const u=mapPic('base_m');", 'base_m head');
m = rep(m, 'rgBaseC=null};im.src=u})();', 'rgBaseC=null};im.src=u});', 'base_m tail');
wr('map.js', m);

let k = rd('kids.js');
k = rep(k, "(function(){const u=mapPic('base_k');", "onMapImgs(function(){const u=mapPic('base_k');", 'base_k head');
k = rep(k, 'kBaseC=null};im.src=u})();', 'kBaseC=null};im.src=u});', 'base_k tail');
wr('kids.js', k);
console.log('patched');
