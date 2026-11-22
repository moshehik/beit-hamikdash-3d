const L=document.getElementById('landing'); if(L)L.style.display='none';
const d=document.getElementById('dayType'); d.value='erev-pesach'; d.dispatchEvent(new Event('change'));
document.getElementById('crowdQ').value='1'; document.getElementById('crowdQ').dispatchEvent(new Event('change')); setTime(11);
for(let i=0;i<80&&CROWD.count<1500;i++) await new Promise(r=>setTimeout(r,3000));
return CROWD.count;
