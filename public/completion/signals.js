import {SemaphoreEncoding} from '../vendor/puzzle-lib/Semaphore/SemaphoreEncoding.js';
import {prussianCode,prussianSVG} from './prussian.js';
const letters=Object.fromEntries(Object.entries(SemaphoreEncoding).filter(([k])=>k.startsWith('Letter')).map(([k,v])=>[k.slice(6),v]));
const numeral=2|4,rest=32,letter=letters.J;
function tokens(text){let numeric=false;const out=[];for(const c of text.toUpperCase()){if(c===' '){out.push(rest);continue;}if(/\d/.test(c)){if(!numeric)out.push(numeral);numeric=true;out.push(SemaphoreEncoding['Number'+c]);continue;}if(!letters[c])throw Error('旗语接受 A–Z、数字和空格。');if(numeric)out.push(letter);numeric=false;out.push(letters[c]);}return out;}
const angles=bits=>Array.from({length:8},(_,i)=>i).filter(i=>bits&(2<<i)).map(i=>i*45);
function textOf(bits){let numeric=false,out='';for(const b of bits){if(b===numeral){numeric=true;continue;}if(b===rest){out+=' ';continue;}if(b===letter&&numeric){numeric=false;continue;}const found=Object.entries(numeric?Object.fromEntries(Object.entries(SemaphoreEncoding).filter(([k])=>k.startsWith('Number')).map(([k,v])=>[k.slice(6),v])):letters).find(([,v])=>v===b);if(!found)throw Error('未登记的双臂组合。');out+=found[0];}return out;}
export function semaphore(text,{direction,representation='angle',style='flags',animation='static'}){
 let symbols;
 if(direction==='encode')symbols=tokens(text);else{symbols=text.trim().split(/[;；\n]+/).map(group=>{const values=group.trim().split(/[,，\s]+/).map(Number);if(values.length<1||values.length>2||values.some(v=>!Number.isFinite(v)))throw Error('每个符号使用两个角度，以逗号分隔；符号间分号。');const degrees=values.map(v=>representation==='clock'?(v%12)*30:v);if(degrees.some(v=>v<0||v>=360||v%45))throw Error('角度必须是 0–315 间的 45° 倍数；钟面以 1.5 小时为间隔。');return degrees.reduce((n,d)=>n|(2<<(d/45)),0);});}
 const output=direction==='encode'?symbols.map(b=>angles(b).map(a=>representation==='clock'?(a/30||12):a).join(',')).join('; '):textOf(symbols);
 const count=symbols.length,columns=animation==='animated'?1:Math.min(8,Math.max(count,1)),rows=animation==='animated'?1:Math.ceil(count/columns),width=columns*120,height=Math.max(rows,1)*140;
 if(count>10000)throw Error('一次图形输出最多 1 万个符号，请分段处理；未截取输入。');
 const drawings=symbols.map((bits,i)=>{const x=animation==='animated'?0:i%columns*120,y=animation==='animated'?0:Math.floor(i/columns)*140,arms=angles(bits).map(a=>{const t=a*Math.PI/180,ex=60+Math.sin(t)*43,ey=65-Math.cos(t)*43;return style==='trousers'?`<path d="M55 62 L${ex-4} ${ey} L${ex+4} ${ey} L65 62" fill="#e9ae00" stroke="#111"/>`:`<path d="M60 65 L${ex} ${ey}" stroke="#111" stroke-width="5"/>${style==='clock'?'':`<path d="M${ex} ${ey} l14 0 l0 14 z" fill="#edb000"/><path d="M${ex} ${ey} l0 14 l14 0 z" fill="#d44"/>`}`;}).join('');const clock=style==='clock'?'<circle cx="60" cy="65" r="48" fill="none" stroke="#555"/>':'<circle cx="60" cy="53" r="6" fill="#111"/>';
 return `<g transform="translate(${x},${y})"${animation==='animated'?' opacity="0"':''}>${clock}${arms}<text x="60" y="130" text-anchor="middle" font-size="12" fill="#111">${i+1}</text>${animation==='animated'?`<animate attributeName="opacity" values="${i===0?(count===1?'1;1':'1;0;1'):i===count-1?'0;1;0':'0;1;0;0'}" keyTimes="${i===0?(count===1?'0;1':`0;${1/count};1`):i===count-1?`0;${i/count};1`:`0;${i/count};${(i+1)/count};1`}" dur="${count}s" calcMode="discrete" repeatCount="indefinite"/>`:''}</g>`;}).join('');
 return {output,svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="white"/>${drawings}</svg>`};
}
export async function prussian(text,{direction}){
 const response=await fetch(new URL('../vendor/completion/gcwizard/prussian.json',import.meta.url));if(!response.ok)throw Error('完整电报码表载入失败。');const rows=await response.json();
 if(direction==='encode'){const query=text.trim().toUpperCase();return {output:JSON.stringify(rows.filter(row=>row.code===query||row.text.toUpperCase().includes(query)),null,2)};}
 const codes=text.trim().split(/\s+/).map(s=>direction==='visual'?prussianCode(s):s);
 const output=codes.map(code=>{let row=rows.find(r=>r.code===code);if(!row&&/^\d{2}(?:5\.[23]|4\.[123])$/.test(code)){const base=rows.find(r=>r.code==='00'+code.slice(2));if(base)row={code,text:base.text.replaceAll('##',code.slice(0,2))};}if(!row){if(direction==='visual')return code+': （合法姿态，原码本未定义）';throw Error('未登记的电报码：'+code);}return `${row.code}: ${row.text||'（原码表未定义）'}`;}).join('\n');
 return {output,svg:prussianSVG(codes)};
}
