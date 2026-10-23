// Position mapping uses the same complete upstream layouts as the input keyboard.
export async function keyboardLayouts(){const {default:Layouts}=await import('../vendor/completion/simple-keyboard-layouts/build/index.esm.js');return new Layouts().get();}
export function layoutCode(text,options,layouts){
 let {fromLayout='english',toLayout='french',fromLayer='default',toLayer='default',direction='encode',mode,rowOrigin='1',columnOrigin='1'}=options;
 if(mode==='layout-change'&&direction==='decode'){[fromLayout,toLayout]=[toLayout,fromLayout];[fromLayer,toLayer]=[toLayer,fromLayer];}
 const source=layouts[fromLayout]?.layout[fromLayer],target=layouts[toLayout]?.layout[toLayer];if(!source||mode==='layout-change'&&!target)throw Error('布局或按键层不存在。');
 const rows=source.map(row=>row.split(' ')),other=target?.map(row=>row.split(' ')),r0=Number(rowOrigin),c0=Number(columnOrigin);
 if(![r0,c0].every(n=>Number.isInteger(n)&&Math.abs(n)<1000))throw Error('坐标起点须为 -999 至 999 的整数。');
 const values=[];rows.forEach((row,r)=>row.forEach((key,c)=>{if(key&&!/^\{.*\}$/.test(key))values.push({key,r,c});}));
 if(mode==='layout-positions'&&direction==='decode')return text.trim().split(/\s*\/\s*/).map(word=>word.split(/\s+/).map(token=>{const parts=token.split(',').map(Number);if(parts.length!==2||parts.some(v=>!Number.isInteger(v)))throw Error('坐标以 行,列 表示。');const key=rows[parts[0]-r0]?.[parts[1]-c0];if(!key||/^\{.*\}$/.test(key))throw Error('坐标不是所选布局的文字键：'+token);return key;}).join('')).join(' ');
 let out='',at=0;const keys=[...new Set(values.map(v=>v.key))].sort((a,b)=>b.length-a.length);
 while(at<text.length){if(/\s/.test(text[at])){out+=mode==='layout-positions'?' / ':text[at];at++;continue;}const key=keys.find(k=>text.startsWith(k,at));if(!key)throw Error('所选按键层中没有：'+text[at]);const candidates=values.filter(v=>v.key===key).map(({r,c})=>mode==='layout-positions'?`${r+r0},${c+c0}`:other[r]?.[c]);if(candidates.some(v=>!v||/^\{.*\}$/.test(v)))throw Error('目标布局的对应位置不是文字键，不能猜测映射：'+key);if(new Set(candidates).size!==1)throw Error('同一字符有多个不同键位，请选择更明确的按键层：'+key);out+=(mode==='layout-positions'&&out&&!out.endsWith(' ')?' ':'')+candidates[0];at+=key.length;}
 return out;
}
