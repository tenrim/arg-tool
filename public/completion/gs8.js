// Complete published symbol table. Ambiguous published assignments are preserved.
const ascii=['"','#','$','%','&','*','+','/','<','=','>','@','\\','^','_','`','{','}','~'];
const overlap=['(',')','[',']','‘','’','?'];
const greek={alpha:'α',beta:'β',chi:'χ',delta:'δ',epsilon:'ε',eta:'η',gamma:'γ',iota:'ι',kappa:'κ',lambda:'λ',mu:'μ',nu:'ν',omega:'ω',omichron:'ο',phi:'φ',pi:'π',psi:'ψ',rho:'ρ',sigma:'σ',tau:'τ',theta:'θ',upsilon:'υ',xi:'ξ',zeta:'ζ'};
const misc=['•','©','†','‡','£','×','·','÷','∼','≈','≡','∝','⟨','⟩','|','∞','∫','∮','∯','∇','∂','…','→','←','○','ℵ','∈','⇌'];
export function gs8Symbols(data){
 const indices={};return data.symbols.map(r=>{const n=indices[r.source]||0;indices[r.source]=n+1;let character=r.character;
  if(character===undefined){if(r.source==='numbers')character=r.name;if(r.source==='ascii')character=ascii[n];if(r.source==='overlap')character=overlap[n];if(r.source==='greek')character=r.name.startsWith('cap-')?greek[r.name.slice(4)]?.toUpperCase():greek[r.name];if(r.source==='miscellaneous')character=misc[n];}
  const braille=r.dots.map(d=>String.fromCodePoint(0x2800+[...new Set(d)].reduce((sum,v)=>sum+(v==='0'?0:2**(Number(v)-1)),0))).join('');return {...r,character,braille};
 });
}
export function gs8(text,{direction='encode',syntax='text'}={},data){
 const rows=gs8Symbols(data);
 if(direction==='table')return rows.filter(r=>!text.trim()||[r.name,r.id,r.character,r.dots.join(','),r.braille].some(v=>String(v||'').toLowerCase().includes(text.trim().toLowerCase()))).map(r=>`${r.id}\t${r.character||r.name}\t${r.braille}\t${r.publishedDots||r.dots.join(',')}`).join('\n');
 if(direction==='encode'){
  const byId=new Map(rows.map(r=>[r.id,r])),byChar=new Map();for(const r of rows)if(r.character!==undefined&&!byChar.has(r.character))byChar.set(r.character,r);
  const tokens=syntax==='tokens'?text.match(/\{[a-zA-Z0-9-]+\}|[\s\S]/gu)||[]:[...text];
  return tokens.map(t=>{if(t==='\n'||t==='\r'||t==='\t')return t;const r=t.length>1&&t.startsWith('{')?byId.get(t.slice(1,-1)):byChar.get(t);if(!r)throw Error('GS8 原表中没有此字符或标记：'+t);return r.braille;}).join('');
 }
 const patterns=[...new Set(rows.map(r=>r.braille))].sort((a,b)=>b.length-a.length);let out='',at=0;
 while(at<text.length){if(/[\r\n\t ]/.test(text[at])){out+=text[at++];continue;}const pattern=patterns.find(p=>text.startsWith(p,at));if(!pattern)throw Error('GS8 原表未定义该点位：'+text[at]);const matches=rows.filter(r=>r.braille===pattern);const chars=[...new Set(matches.map(r=>r.character).filter(v=>v!==undefined))];out+=chars.length===1?chars[0]:matches.length===1?'{'+matches[0].id+'}':'{'+matches.map(r=>r.id).join('|')+'}';at+=pattern.length;}
 return out;
}
