// Exact dynamic programming over every provided element. Pagination changes the
// projection, never the set of decompositions or their exact BigInt count.
export function elementIndex(elements){
 if(!Array.isArray(elements)||elements.length!==118||new Set(elements.map(x=>x.symbol)).size!==118)throw Error('元素数据不完整，应包含118个不同元素。');
 return new Map(elements.map(e=>[e.symbol.toLowerCase(),e]));
}
export function elementDecompositions(input,elements,{offset='0',limit=50,caseSensitive=false}={}){
 const text=String(input).trim();if(!/^[A-Za-z]{1,160}$/.test(text))throw Error('请输入1–160个英文字母，不含空格或标点。');
 const index=elementIndex(elements),counts=Array(text.length+1).fill(0n),edges=Array.from({length:text.length},()=>[]);counts[text.length]=1n;
 for(let i=text.length-1;i>=0;i--)for(let len=1;len<=2&&i+len<=text.length;len++){
  const token=text.slice(i,i+len),element=index.get(token.toLowerCase());
  if(element&&(!caseSensitive||element.symbol===token)){edges[i].push(element);counts[i]+=counts[i+len];}
 }
 let start;try{start=BigInt(offset);}catch{throw Error('分页起点必须是非负整数。');}
 if(start<0n||!Number.isInteger(limit)||limit<1||limit>200)throw Error('分页范围无效。');
 const total=counts[0];if(start>=total&&total>0n)throw Error('分页起点超出候选总数。');
 const rows=[];
 for(let rank=start;rank<total&&rows.length<limit;rank++){
  let remaining=rank,i=0;const path=[];
  while(i<text.length){let chosen=false;for(const e of edges[i]){const c=counts[i+e.symbol.length];if(remaining>=c)remaining-=c;else{path.push(e);i+=e.symbol.length;chosen=true;break;}}if(!chosen)throw Error('元素分页索引不一致。');}
  rows.push({rank:(rank+1n).toString(),symbols:path.map(e=>e.symbol),numbers:path.map(e=>e.number),names:path.map(e=>e.zh||e.name)});
 }
 return {input:text,total:total.toString(),offset:start.toString(),limit,rows,hasNext:start+BigInt(rows.length)<total};
}
export function elementWords(records,elements,{min=1,max=40,caseSensitive=false}={}){
 elementIndex(elements);if(!Array.isArray(records)||records.length>1000000)throw Error('词库数据无效。');
 if(!Number.isInteger(min)||!Number.isInteger(max)||min<1||max<min||max>160)throw Error('单词长度范围需在1–160之间。');
 const words=new Set(),rows=[];
 for(const entry of records){const word=typeof entry==='string'?entry:entry.word;if(typeof word!=='string'||words.has(word)||word.length<min||word.length>max||!/^[A-Za-z]+$/.test(word))continue;words.add(word);const r=elementDecompositions(word,elements,{limit:1,caseSensitive});if(r.total!=='0')rows.push({word,count:r.total,first:r.rows[0]});}
 return {total:rows.length,rows};
}
