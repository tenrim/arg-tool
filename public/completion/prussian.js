// Adapted from GC Wizard's Prussian segment conventions, GPL-3.0-or-later.
// Exact fixed Dart source and license: vendor/completion/gcwizard/.
export function prussianSegments(code){
 if(!/^[0-9.]+$/.test(code))throw Error('光学报码只接受数字和点号。');
 let rest=code,level=0;const result=[];
 while(rest){if((level===1||level===3)&&rest[0]!=='.')level++;if((level===1||level===3)&&rest[0]==='.'&&rest.length>1)rest=rest.slice(1);const digit=Number(rest[0]),prefix='abc'[Math.min(2,Math.floor(level/2))];if(/[1-6]/.test(rest[0]))result.push(prefix+digit);if(digit>=7)result.push(prefix+(digit-6),prefix+6);rest=rest.slice(1);level=Math.min(5,level+1);}
 return result;
}
export function prussianCode(text){
 const segments=text.toLowerCase().match(/[abc][1-6]/g)||[];
 if(segments.join('')!==text.toLowerCase()||new Set(segments).size!==segments.length)throw Error('姿态写为 a1a6b2c3；a 下层、b 中层、c 上层，不重复。');
 return [...'abc'].map(prefix=>{const positions=segments.filter(s=>s[0]===prefix).map(s=>+s[1]).sort();if(positions.filter(n=>n<=3).length>1||positions.filter(n=>n>=4).length>1)throw Error('同一侧的活动臂只能选一个方向。');if(positions.length===2&&positions[1]===6)return String(positions[0]+6);return positions.reverse().join('.')||'0';}).join('');
}
export function prussianSVG(codes){
 const drawings=codes.map((code,i)=>{const segments=prussianSegments(code),arms=segments.map(s=>{const row='abc'.indexOf(s[0]),angle=({1:45,2:90,3:135,4:225,5:270,6:315})[s[1]]*Math.PI/180,y=205-row*75;return `<path d="M60 ${y} L${60+45*Math.sin(angle)} ${y-45*Math.cos(angle)}" stroke="#111" stroke-width="9"/>`;}).join('');return `<g transform="translate(${i%8*140},${Math.floor(i/8)*300})"><path d="M60 20V255" stroke="#111" stroke-width="6"/>${arms}<text x="60" y="280" text-anchor="middle" fill="#111">${code}</text></g>`;}).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.min(8,codes.length)*140}" height="${Math.ceil(codes.length/8)*300}"><rect width="100%" height="100%" fill="white"/>${drawings}</svg>`;
}
