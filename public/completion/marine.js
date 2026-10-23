// International Code of Signals, Pub.102 chapter 1 section 5.
export function flagGroups(text,{direction='encode',substitutes='yes'}={}){
 const groups=text.trim().split(/[\r\n/]+/).filter(Boolean);if(!groups.length)throw Error('请输入信号。');
 return groups.map(group=>{const incoming=direction==='decode'?group.toUpperCase().trim().split(/\s+/):[...group.toUpperCase().replace(/\s+/g,'')];const letters=[],numbers=[],used=new Set(),tokens=[],decoded=[];let current=null;
  for(const token of incoming){
   if(token==='.'||token==='CODE'){tokens.push('CODE');decoded.push('.');continue;}
   if(direction==='decode'&&/^R[123]$/.test(token)){const n=Number(token[1]);if(!current||current.length<n||used.has(token))throw Error('代用旗须指向此前同类旗，且同一组不能重复使用：'+token);const value=current[n-1];current.push(value);tokens.push(token);decoded.push(value);used.add(token);continue;}
   if(!/^[A-Z0-9]$/.test(token))throw Error('信号接受 A–Z、0–9、句点；解码代用旗写 R1／R2／R3，组间换行。');
   current=/\d/.test(token)?numbers:letters;
   if(direction==='encode'&&substitutes==='yes'&&current.includes(token)){
    const index=current.findIndex((value,i)=>value===token&&i<3&&!used.has('R'+(i+1)));if(index<0)throw Error('同一组的现有旗与三个代用旗不足，请明确分组后重试。');const repeat='R'+(index+1);tokens.push(repeat);used.add(repeat);
   }else tokens.push(token);
   current.push(token);decoded.push(token);
  }
  return {tokens,text:decoded.join('')};
 });
}
const repeats={
 R1:'<path d="M0 0L120 60L0 120Z" fill="#08006d"/><path d="M0 28L76 60L0 92Z" fill="#ffe600"/>',
 R2:'<path d="M0 0L120 60L0 120Z" fill="white" stroke="#08006d"/><path d="M0 0L40 20L40 100L0 120Z" fill="#08006d"/>',
 R3:'<path d="M0 0L120 60L0 120Z" fill="white" stroke="black"/><path d="M0 45L90 45L120 60L90 75L0 75Z" fill="black"/>',
 CODE:'<path d="M0 20L120 45L120 75L0 100Z" fill="#ed0034"/><path d="M24 25L48 30L48 90L24 95ZM72 35L96 40L96 80L72 85Z" fill="white"/>'
};
export async function marine(text,options){
 const groups=flagGroups(text,options),unique=[...new Set(groups.flatMap(g=>g.tokens))],art={...repeats};
 await Promise.all(unique.filter(t=>!art[t]).map(async t=>{const response=await fetch(new URL('../vendor/discovery/flags/'+t.toLowerCase()+'.svg',import.meta.url));if(!response.ok)throw Error('信号旗图形加载失败');const svg=await response.text();const width=Number(/<svg[^>]*\bwidth="([\d.]+)"/.exec(svg)?.[1]),height=Number(/<svg[^>]*\bheight="([\d.]+)"/.exec(svg)?.[1]);if(!(width>0&&height>0))throw Error('信号旗原图尺寸无效');const inner=svg.replace(/^[\s\S]*?<svg\b[^>]*>/,'').replace(/<\/svg>[\s\S]*$/,'');art[t]=`<svg width="120" height="120" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;}));
 const columns=Math.max(...groups.map(g=>g.tokens.length)),body=groups.map((g,row)=>g.tokens.map((t,col)=>`<g transform="translate(${col*140+10},${row*155+10})">${art[t]}<text x="60" y="140" text-anchor="middle" fill="black">${t}</text></g>`).join('')).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${columns*140}" height="${groups.length*155}" viewBox="0 0 ${columns*140} ${groups.length*155}"><rect width="100%" height="100%" fill="white"/>${body}</svg>`;
 return {output:groups.map(g=>options.direction==='decode'?g.text:g.tokens.join(' ')).join('\n'),svg};
}
