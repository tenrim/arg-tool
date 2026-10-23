// Exact integer and digit encodings: no floating point conversion or clipping.
const alphabet32='0123456789ABCDEFGHJKMNPQRSTVWXYZ',check37=alphabet32+'*~$=U';
const requireInteger=s=>{if(!/^-?\d+$/.test(s))throw Error('请输入十进制整数。');return BigInt(s);};
function positional(n,alphabet){if(n<0n)throw Error('此编码不接受负数。');const chars=[...alphabet],base=BigInt(chars.length);let out='';do{out=chars[Number(n%base)]+out;n/=base;}while(n);return out;}
function parse(text,alphabet){const chars=[...alphabet],base=BigInt(chars.length);if(!text)throw Error('缺少编码。');let n=0n;for(const c of text){const index=chars.indexOf(c);if(index<0)throw Error('字母表之外的字符：'+c);n=n*base+BigInt(index);}return n;}
export function negaFibonacci(n){
 if(!n)throw Error('NegaFibonacci 编码不表示 0。');
 const weights=[1n,-1n],ranges=[{min:0n,max:0n}];
 let k=0;
 while(k===0||n<ranges[k].min||n>ranges[k].max){
  if(k>=weights.length)weights.push(weights[k-2]-weights[k-1]);
  const no=ranges[k],yes=ranges[Math.max(0,k-1)],a=weights[k]+yes.min,b=weights[k]+yes.max;
  ranges.push({min:a<no.min?a:no.min,max:b>no.max?b:no.max});k++;
 }
 const bits=Array(k).fill('0');
 for(let i=k-1;i>=0;i--){if(n>=ranges[i].min&&n<=ranges[i].max)continue;bits[i]='1';n-=weights[i];i--;}
 if(n!==0n)throw Error('整数表示失败。');return bits.join('')+'1';
}
export function decodeNega(text){const bits=text.replace(/\s/g,'');if(!/^[01]*$/.test(bits))throw Error('只允许二进制位。');const out=[];let at=0;while(at<bits.length){let n=0n,i=0,prev=0,a=1n,b=-1n;for(;;){if(at>=bits.length)throw Error('末尾码字缺少 11 结束标记。');const c=Number(bits[at++]);if(c&&prev)break;const w=i===0?1n:i===1?-1n:a-b;if(i>=2){a=b;b=w;}if(c)n+=w;prev=c;i++;}if(!n)throw Error('无效的零码字。');out.push(String(n));}return out.join(' ');}
export const BASE37_ALPHABETS=['0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ ','ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ',' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',' 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ','ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789','0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
export function extendedInteger(text,codec,direction,options={}){
 if(codec==='gray-integer')return text.trim().split(/\s+/).map(s=>{const base=Number(options.numberBase||2);if(![2,10,16].includes(base)||!(base===2?/^[01]+$/:base===16?/^[\da-f]+$/i:/^\d+$/).test(s))throw Error('输入不符合选定的数字进制。');const n=BigInt((base===2?'0b':base===16?'0x':'')+s);let value;if(direction==='encode')value=n^(n>>1n);else{value=n;for(let shift=n>>1n;shift;shift>>=1n)value^=shift;}return value.toString(base).padStart(base===2?s.length:1,'0');}).join(' ');
 if(codec==='base26-zero')return text.trim().split(/\s+/).map(s=>direction==='encode'?positional(requireInteger(s),'ABCDEFGHIJKLMNOPQRSTUVWXYZ'):parse(s.toUpperCase(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ').toString()).map(s=>options.reverseLetters==='yes'&&direction==='encode'?[...s].reverse().join(''):s).join(' ');
 if(codec==='negafibonacci')return direction==='decode'?decodeNega(text):text.trim().split(/\s+/).map(s=>negaFibonacci(requireInteger(s))).join(' ');
 if(codec==='excess3-digits'){
  if(direction==='encode'){if(!/^\d*$/.test(text))throw Error('余 3 码输入为十进制数字串，保留前导零。');return [...text].map(c=>(Number(c)+3).toString(2).padStart(4,'0')).join(' ');}
  const bits=text.replace(/\s/g,'');if(!/^(?:[01]{4})*$/.test(bits))throw Error('每个数字需要完整 4 位。');return (bits.match(/.{4}/g)||[]).map(s=>{const d=parseInt(s,2)-3;if(d<0||d>9)throw Error('无效余 3 码。');return d;}).join('');
 }
 if(codec==='shadoks'){const chars=['Ga','Bu','Zo','Meu'];return text.trim().split(/\n+/).map(row=>direction==='encode'?[...positional(requireInteger(row.trim()),'0123')].map(c=>chars[Number(c)]).join(' '):parse(row.trim().split(/\s+/).map(s=>{const n=chars.findIndex(c=>c.toLowerCase()===s.toLowerCase());if(n<0)throw Error('仅接受 Ga、Bu、Zo、Meu。');return n;}).join(''),'0123').toString()).join('\n');}
 if(codec==='base26'){return text.trim().split(/\s+/).map(s=>{if(direction==='decode'){let n=0n;for(const c of s.toUpperCase()){const i=c.charCodeAt(0)-64;if(i<1||i>26)throw Error('Base26 双射编码只接受 A–Z。');n=n*26n+BigInt(i);}return n.toString();}let n=requireInteger(s),out='';if(n<1n)throw Error('双射 Base26 从 1 开始。');while(n){n--;out=String.fromCharCode(65+Number(n%26n))+out;n/=26n;}return out;}).join(' ');}
 if(codec==='base37'){const alphabet=BASE37_ALPHABETS[Number(options.base37Alphabet||0)];if(!alphabet)throw Error('未知 Base37 字母表。');return direction==='encode'?parse(text.toUpperCase().replaceAll('_',' '),alphabet).toString():positional(requireInteger(text.trim()),alphabet).replaceAll(' ',options.separator==='underscore'?'_':' ');}
 if(codec==='crockford-integer'||codec==='crockford-check')return text.trim().split(/\s+/).map(s=>{
  if(direction==='encode'){const n=requireInteger(s);return positional(n,alphabet32)+(codec==='crockford-check'?check37[Number(n%37n)]:'');}
  s=s.toUpperCase().replaceAll('-','').replaceAll('O','0').replace(/[IL]/g,'1');const checksum=codec==='crockford-check'?s.at(-1):null,n=parse(checksum?s.slice(0,-1):s,alphabet32);if(checksum&&checksum!==check37[Number(n%37n)])throw Error('Crockford 校验符不符。');return n.toString();
 }).join(' ');
 throw Error('未知整数编码。');
}
