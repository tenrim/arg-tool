// Original presentation helpers; factual records stay in the pinned datasets.
export const BAGUA_ORDERS={
 early:[1,6,4,5,2,3,7,8],
 later:[7,2,8,1,4,5,3,6]
};
export const BAGUA_DIRECTIONS=['南','西南','西','西北','北','东北','东','东南'];
export function projectPoint(longitude,latitude){
 const lon=Number(longitude),lat=Number(latitude);
 if(!Number.isFinite(lon)||!Number.isFinite(lat)||Math.abs(lon)>180||Math.abs(lat)>90)return null;
 return [(lon+180)*1000/360,(90-lat)*500/180];
}
export function parsePortCoordinate(value){
 const m=String(value||'').trim().match(/^(\d{2})(\d{2})([NS])\s+(\d{3})(\d{2})([EW])$/);
 if(!m||Number(m[2])>=60||Number(m[5])>=60)return null;
 const lat=(Number(m[1])+Number(m[2])/60)*(m[3]==='S'?-1:1);
 const lon=(Number(m[4])+Number(m[5])/60)*(m[6]==='W'?-1:1);
 return projectPoint(lon,lat)?[lon,lat]:null;
}
export function sequencePlot(input,differences=false){
 const parts=String(input).trim().split(/[\s,，;；]+/);
 if(parts.length<3||parts.length>100||parts.some(s=>!/^[-+]?\d{1,100}$/.test(s)))throw Error('输入 3–100 个整数即可预览曲线。');
 const values=parts.map(BigInt),items=differences?values.slice(1).map((v,i)=>v-values[i]):values;
 const min=items.reduce((a,b)=>a<b?a:b),max=items.reduce((a,b)=>a>b?a:b),span=max-min;
 return {min:min.toString(),max:max.toString(),items:items.map((v,i)=>({value:v.toString(),x:48+i*704/Math.max(1,items.length-1),y:span?240-Number((v-min)*200000n/span)/1000:140,index:i+(differences?2:1)}))};
}
export function geologicalName(r){
 if(r.id==='Precambrian')return '前寒武时期';
 return r.name.replace(/系$/,'纪').replace(/统$/,'世').replace(/阶$/,'期').replace(/界$/,'代').replace(/宇$/,'宙').replace(/^上/,'晚').replace(/^下/,'早');
}
export function normalizeColorHex(value){
 const raw=String(value).trim().replace(/^#/,'');
 if(!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw))throw Error('请输入 #RGB 或 #RRGGBB 格式的颜色。');
 return '#'+(raw.length===3?[...raw].map(c=>c+c).join(''):raw).toUpperCase();
}
export function hsvToRGB(h,s,v){
 if(![h,s,v].every(Number.isFinite)||s<0||s>1||v<0||v>1)throw Error('无效 HSV 颜色。');
 h=((h%360)+360)%360/60;const c=v*s,x=c*(1-Math.abs(h%2-1)),m=v-c;
 const rgb=h<1?[c,x,0]:h<2?[x,c,0]:h<3?[0,c,x]:h<4?[0,x,c]:h<5?[x,0,c]:[c,0,x];
 return rgb.map(n=>Math.round((n+m)*255));
}
export function hsvToHex(h,s,v){return '#'+hsvToRGB(h,s,v).map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase();}
export function hexToHsv(hex){
 const [r,g,b]=normalizeColorHex(hex).slice(1).match(/../g).map(x=>parseInt(x,16)/255),v=Math.max(r,g,b),min=Math.min(r,g,b),d=v-min;
 return {h:d?((v===r?(g-b)/d+(g<b?6:0):v===g?(b-r)/d+2:(r-g)/d+4)*60):0,s:v?d/v:0,v};
}
// Normalized wheel coordinates: red at the right, hue clockwise, white at centre.
export function colorWheelPoint(x,y){
 if(![x,y].every(Number.isFinite))throw Error('无效色盘坐标。');
 return {h:(Math.atan2(y,x)*180/Math.PI+360)%360,s:Math.min(1,Math.hypot(x,y))};
}
export function colorValues(hex){
 const raw=normalizeColorHex(hex).slice(1),rgb=raw.match(/../g).map(x=>parseInt(x,16));
 const [r,g,b]=rgb.map(x=>x/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;
 const h=d?((max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4)*60):0,s=d?d/(1-Math.abs(2*l-1)):0;
 return {hex:'#'+raw.toUpperCase(),rgb:rgb.join(', '),hsl:`${Math.round(h)}°, ${Math.round(s*100)}%, ${Math.round(l*100)}%`};
}
