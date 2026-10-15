export const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const english=[8.167,1.492,2.782,4.253,12.702,2.228,2.015,6.094,6.966,.153,.772,4.025,2.406,6.749,7.507,1.929,.095,5.987,6.327,9.056,2.758,.978,2.36,.15,1.974,.074];
export function letters(text){return text.toUpperCase().replace(/[^A-Z]/g,'');}
export function counts(text){const c=Array(26).fill(0);for(const ch of letters(text))c[ch.charCodeAt(0)-65]++;return c;}
export function ic(text){const c=counts(text),n=c.reduce((a,b)=>a+b,0);return n<2?0:c.reduce((s,k)=>s+k*(k-1),0)/(n*(n-1));}
export function caesar(text,shift){return text.replace(/[A-Za-z]/g,c=>String.fromCharCode((c.charCodeAt(0)-(c<='Z'?65:97)-shift+26)%26+(c<='Z'?65:97)));}
export function chi(text){const c=counts(text),n=c.reduce((a,b)=>a+b,0);return n?c.reduce((s,v,i)=>s+(v-n*english[i]/100)**2/(n*english[i]/100),0):Infinity;}
export function wordPattern(text){const seen=new Map();return [...letters(text)].map(c=>{if(!seen.has(c))seen.set(c,seen.size);return seen.get(c);}).join('.');}
export function partialDecode(text,key){return text.replace(/[A-Za-z]/g,c=>{const p=key[c.toUpperCase().charCodeAt(0)-65];return p?(c===c.toLowerCase()?p.toLowerCase():p):'·';});}
export function validateMap(key){const used=key.filter(Boolean);if(used.some(c=>!/^[A-Z]$/.test(c)))throw Error('每格只能填写一个英文字母。');if(new Set(used).size!==used.length)throw Error('替换表中同一个明文字母不能分配给多个密文字母。');}
export function analyze(text){
 const clean=letters(text),n=clean.length,c=counts(clean),hist=new Map();for(const ch of text)hist.set(ch,(hist.get(ch)||0)+1);const total=[...text].length;
 const entropy=total?[...hist.values()].reduce((s,k)=>s-k/total*Math.log2(k/total),0):0;
 const ngrams=size=>{const m=new Map();for(let i=0;i<=n-size;i++){const t=clean.slice(i,i+size);m.set(t,(m.get(t)||0)+1);}return [...m].filter(x=>x[1]>1).sort((a,b)=>b[1]-a[1]).slice(0,12);};
 const shifts=Array.from({length:26},(_,shift)=>({shift,text:caesar(text,shift),score:chi(caesar(clean,shift))})).sort((a,b)=>a.score-b.score);
 const periods=[];for(let len=1;len<=Math.min(16,Math.floor(n/5));len++){const cols=Array.from({length:len},()=>[]);for(let i=0;i<n;i++)cols[i%len].push(clean[i]);const avg=cols.reduce((s,col)=>s+ic(col.join('')),0)/len;const key=cols.map(col=>{const t=col.join('');return alphabet[Array.from({length:26},(_,k)=>k).sort((a,b)=>chi(caesar(t,a))-chi(caesar(t,b)))[0]];}).join('');periods.push({length:len,ic:avg,key});}
 const repeats=[];const seen=new Map();for(let i=0;i<=Math.min(n,4000)-3;i++){const s=clean.slice(i,i+3),prev=seen.get(s);if(prev!==undefined&&repeats.length<20)repeats.push({text:s,gap:i-prev});seen.set(s,i);}
 const hints=[];const compact=text.replace(/\s/g,'');
 if(/^[01]+$/.test(compact))hints.push('只包含 0/1：可尝试二进制分组、点阵或培根密码；分组长度需结合题面。');
 if(/^[0-9a-f]+$/i.test(compact)&&compact.length%2===0)hints.push('字符范围符合十六进制，可先尝试按字节解码。');
 if(/^[A-Za-z0-9+/]+={0,2}$/.test(compact)&&compact.length%4===0)hints.push('格式可能符合 Base64；这只是字符范围判断，不是确认。');
 if(/^[.\- /]+$/.test(text.trim()))hints.push('点划与分隔符符合摩斯表示，可在“编码转换 → 摩斯、盲文与符号编码”中解码。');
 if(n>=30){const index=ic(clean);hints.push(index>.055?'字母重合指数较高：可优先检查单表替换、移位或换位。':'字母重合指数较低：可检查多表替换、压缩/编码或较均匀的随机数据。');}
 if(n<150)hints.push('英文样本较短，字频、密钥长度和自动候选可能不稳定。');
 if(!hints.length)hints.push('暂不能仅凭统计判断类型。请结合分组、图形、语言和题目提示。');
 return{n,total,counts:c,entropy,ic:ic(clean),bigrams:ngrams(2),trigrams:ngrams(3),shifts,periods,repeats,hints};
}
export function vigenere(text,key){key=letters(key);if(!key)throw Error('请输入英文字母密钥。');let at=0;return text.replace(/[A-Za-z]/g,c=>caesar(c,key.charCodeAt(at++%key.length)-65));}
