import {proj4,mgrs,geohash} from '../vendor/round2/geo.js';
export function coordinate(value,latitude){
 const max=latitude?90:180,s=String(value).trim().toUpperCase();
 if(!s)throw Error('请填写经纬度。');
 // Read the hemisphere before the DMS grammar: a trailing S is south, not
 // an optional seconds marker that can silently turn south into north.
 const hemisphere=s.match(/[NSEW]$/)?.[0],body=hemisphere?s.slice(0,-1).trim():s;
 if(hemisphere&&!(latitude?'NS':'EW').includes(hemisphere))throw Error('纬度用 N / S，经度用 E / W。');
 const decimal=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(body);
 const parts=decimal?[body,body]:body.match(/^([+-]?\d+(?:\.\d+)?)\s*(?:°|D|\s)\s*(\d+(?:\.\d+)?)?\s*(?:['′M]|\s)?\s*(\d+(?:\.\d+)?)?\s*(?:["″S])?$/);
 if(!parts)throw Error('坐标写法如 39.9 或 39°54′0″N。');
 const negative=parts[1].startsWith('-'),degrees=Number(parts[1]),minutes=Number(parts[2]||0),seconds=Number(parts[3]||0);
 if(minutes>=60||seconds>=60)throw Error('分和秒需在 0–60 之间。');
 if(hemisphere&&negative)throw Error('请使用方向字母或负号之一，避免歧义。');
 const sign=hemisphere?('SW'.includes(hemisphere)?-1:1):negative?-1:1;
 const number=(Math.abs(degrees)+minutes/60+seconds/3600)*sign;
 if(!Number.isFinite(number)||Math.abs(number)>max)throw Error(latitude?'纬度范围为 -90–90。':'经度范围为 -180–180。');
 return number;
}
export function dms(value,latitude){const ticks=Math.round(Math.abs(value)*3600*1000),d=Math.floor(ticks/3600000),m=Math.floor(ticks%3600000/60000),s=(ticks%60000)/1000;return `${d}°${m}′${s.toFixed(3)}″${latitude?(value<0?'S':'N'):(value<0?'W':'E')}`;}
function projection(zone,south){if(!Number.isInteger(zone)||zone<1||zone>60)throw Error('UTM 带号需为 1–60。');return `+proj=utm +zone=${zone} ${south?'+south ':''}+datum=WGS84 +units=m +no_defs`;}
export function convertPoint(lat,lon){if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw Error('坐标超出有效范围。');let zone=Math.min(60,Math.floor((lon+180)/6)+1);if(lat>=56&&lat<64&&lon>=3&&lon<12)zone=32;if(lat>=72&&lat<84&&lon>=0&&lon<42)zone=lon<9?31:lon<21?33:lon<33?35:37;const utm=lat>=-80&&lat<=84?proj4('EPSG:4326',projection(zone,lat<0),[lon,lat]):null;const grid=utm?mgrs.forward([lon,lat],5):null;return{lat,lon,zone,hemisphere:lat<0?'S':'N',utm,mgrs:grid,geohash:geohash.encode(lat,lon,10)};}
export function reversePoint(format,text){if(format==='mgrs'){const normalized=text.toUpperCase().replace(/\s/g,'');if(!/^\d{1,2}[C-HJ-NP-X][A-HJ-NP-Z]{2}(?:\d{2}){0,5}$/.test(normalized))throw Error('MGRS 写法如 50SMK1234567890，数字需成对。');const [lon,lat]=mgrs.toPoint(normalized);return convertPoint(lat,lon);}if(format==='geohash'){if(!/^[0-9bcdefghjkmnpqrstuvwxyz]{1,12}$/i.test(text))throw Error('Geohash 需为 1–12 位有效字符。');const result=geohash.decode(text.toLowerCase());return convertPoint(result.latitude,result.longitude);}const m=text.trim().toUpperCase().match(/^(\d{1,2})\s*([NS])\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/);if(!m)throw Error('UTM 写法为：带号 半球 东距 北距，例如 50 N 448000 4417000。');const e=+m[3],n=+m[4];if(e<100000||e>900000||n<0||n>10000000)throw Error('UTM 东距或北距超出通常范围。');const [lon,lat]=proj4(projection(+m[1],m[2]==='S'),'EPSG:4326',[e,n]);if(lat< -80||lat>84)throw Error('此坐标超出 UTM 适用纬度。');return convertPoint(lat,lon);}
export function distanceBearing(lat1,lon1,lat2,lon2){
 for(const [lat,lon]of [[lat1,lon1],[lat2,lon2]])if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw Error('经纬度超出范围。');
 const rad=Math.PI/180,a=lat1*rad,b=lat2*rad,dlat=(lat2-lat1)*rad,dlon=(lon2-lon1)*rad;
 const h=Math.min(1,Math.max(0,Math.sin(dlat/2)**2+Math.cos(a)*Math.cos(b)*Math.sin(dlon/2)**2)),distance=6371.0088*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
 const undefinedDirection=distance<1e-8||Math.abs(h-1)<1e-14||Math.abs(lat1)===90||Math.abs(lat2)===90;
 const bearing=(Math.atan2(Math.sin(dlon)*Math.cos(b),Math.cos(a)*Math.sin(b)-Math.sin(a)*Math.cos(b)*Math.cos(dlon))/rad+360)%360;
 const reverseBearing=(Math.atan2(-Math.sin(dlon)*Math.cos(a),Math.cos(b)*Math.sin(a)-Math.sin(b)*Math.cos(a)*Math.cos(dlon))/rad+360)%360;
 return {distance,bearing:undefinedDirection?null:bearing,reverseBearing:undefinedDirection?null:reverseBearing,finalBearing:undefinedDirection?null:(reverseBearing+180)%360};
}
export function timeValue(kind,text){text=text.trim();if(!text)throw Error('请填写时间。');let ms;if(kind==='iso'){if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/i.test(text))throw Error('ISO 时间必须带时区，例如 2026-10-08T12:00:00+08:00。');const [year,month,day]=text.slice(0,10).split('-').map(Number),date=new Date(0);date.setUTCFullYear(year,month,0);if(month<1||month>12||day<1||day>date.getUTCDate()||+text.slice(11,13)>23||+text.slice(14,16)>59||Number(text.slice(17,19)||0)>59)throw Error('日期或时间不存在。');ms=Date.parse(text);}else{if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text))throw Error('请输入有效数字。');const n=Number(text);ms=kind==='seconds'?n*1000:kind==='milliseconds'?n:kind==='jd'?(n-2440587.5)*86400000:kind==='mjd'?(n-40587)*86400000:NaN;}if(!Number.isFinite(ms)||Math.abs(ms)>8640000000000000)throw Error('时间超出浏览器支持范围。');return Math.round(ms);}
export function formatTime(ms,timezone){const d=new Date(ms),local=new Intl.DateTimeFormat('zh-CN',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',fractionalSecondDigits:3,hourCycle:'h23',timeZoneName:'longOffset'}).format(d);return{iso:d.toISOString(),seconds:ms/1000,milliseconds:ms,jd:ms/86400000+2440587.5,mjd:ms/86400000+40587,local};}
