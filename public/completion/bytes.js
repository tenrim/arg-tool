import * as base91 from '../vendor/completion/base91/index.js';
import * as base65536 from '../vendor/completion/base65536/src/index.js';
export const BYTE_CODECS=Object.freeze(['base91','base100','base65536','crockford32','zbase32','uuencode','xxencode','bubblebabble','unary','unary7','excess3','gray','hamming74','manchester','differential-manchester']);
const B91='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';
const B32={crockford32:'0123456789ABCDEFGHJKMNPQRSTVWXYZ',zbase32:'ybndrfg8ejkmcpqxot1uwisza345h769'};
const bit=b=>b.toString(2).padStart(8,'0');
export function inputBytes(text,format='utf8'){
 if(format==='utf8')return new TextEncoder().encode(text);
 if(format==='hex'){const s=text.replace(/\s+/g,'');if(!/^(?:[0-9a-f]{2})*$/i.test(s))throw Error('十六进制必须是完整字节。');return Uint8Array.from(s.match(/../g)||[],s=>parseInt(s,16));}
 if(format==='base64'){if(!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(text))throw Error('Base64 格式不正确。');return Uint8Array.from(atob(text),c=>c.charCodeAt(0));}
 throw Error('未知字节来源。');
}
export const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join(' ');
export function displayBytes(bytes,format){if(format==='hex')return hex(bytes);if(format==='base64'){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);}try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{throw Error('结果不是有效 UTF-8，请选择十六进制显示；字节未被替换。');}}
function encode32(bytes,alphabet){let bits=0,value=0,out='';for(const b of bytes){value=(value<<8)|b;bits+=8;while(bits>=5){bits-=5;out+=alphabet[(value>>>bits)&31];}}if(bits)out+=alphabet[(value<<(5-bits))&31];return out;}
function decode32(text,alphabet){let bits=0,value=0,out=[];for(const c of text){const n=alphabet.indexOf(c);if(n<0)throw Error('Base32 字母表之外的字符。');value=value<<5|n;bits+=5;if(bits>=8){bits-=8;out.push(value>>>bits&255);}}if(bits>=5||(value&((1<<bits)-1)))throw Error('Base32 尾部补零无效。');const b=Uint8Array.from(out);if(encode32(b,alphabet)!==text)throw Error('Base32 长度无效。');return b;}
const uuchar=(n,xx)=>xx?'+-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'[n]:String.fromCharCode(n?n+32:96);
function uuencode(bytes,xx){const lines=[];for(let at=0;at<bytes.length;at+=45){const row=bytes.subarray(at,at+45);let s=uuchar(row.length,xx);for(let i=0;i<row.length;i+=3){const n=row[i]*65536+(row[i+1]||0)*256+(row[i+2]||0);for(const shift of [18,12,6,0])s+=uuchar(n>>>shift&63,xx);}lines.push(s);}return ['begin 644 data.bin',...lines,uuchar(0,xx),'end'].join('\n');}
function uudecode(text,xx){const lines=text.replace(/\r/g,'').split('\n');if(!/^begin [0-7]{3} .+/.test(lines.shift()||'')||lines.pop()!=='end')throw Error('需要完整 begin／end 包装。');const out=[];let ended=false;const val=c=>{let n=xx?'+-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c):c==='`'?0:c?.charCodeAt(0)-32;if(!Number.isInteger(n)||n<0||n>63)throw Error('无效编码字符。');return n;};for(const line of lines){if(ended)throw Error('零长度结束行之后还有数据。');const n=val(line[0]);if(n>45||line.length!==1+4*Math.ceil(n/3))throw Error('编码行长度不符。');if(!n){ended=true;continue;}const row=[];for(let i=1;i<line.length;i+=4){const v=val(line[i])*262144+val(line[i+1])*4096+val(line[i+2])*64+val(line[i+3]);row.push(v>>>16&255,v>>>8&255,v&255);}if(row.slice(n).some(Boolean))throw Error('尾字节填充非零。');out.push(...row.slice(0,n));}if(!ended)throw Error('缺少零长度结束行。');return Uint8Array.from(out);}
const vowels='aeiouy',consonants='bcdfghklmnprstvzx';
function bubble(bytes){let seed=1,out='x';for(let i=0;i<=Math.floor(bytes.length/2);i++){if(i<Math.floor(bytes.length/2)||bytes.length%2){const a=bytes[2*i];out+=vowels[((a>>>6)&3)+seed%6>=6?(((a>>>6)&3)+seed%6)%6:((a>>>6)&3)+seed%6]+consonants[(a>>>2)&15]+vowels[((a&3)+Math.floor(seed/6))%6];if(i<Math.floor(bytes.length/2)){const b=bytes[2*i+1];out+=consonants[b>>>4]+'-'+consonants[b&15];seed=(seed*5+a*7+b)%36;}}else out+=vowels[seed%6]+'x'+vowels[Math.floor(seed/6)];}return out+'x';}
function unbubble(text){if(text[0]!=='x'||text.at(-1)!=='x')throw Error('Bubble Babble 缺少边界 x。');let s=text.slice(1,-1),seed=1,out=[];while(s.length){if(s.length===3&&s[1]==='x'){if(s!==vowels[seed%6]+'x'+vowels[Math.floor(seed/6)])throw Error('校验音节不符。');s='';break;}const a=(vowels.indexOf(s[0])-seed%6+6)%6,b=consonants.indexOf(s[1]),c=(vowels.indexOf(s[2])-Math.floor(seed/6)+6)%6;if(a>3||b<0||b>15||c>3)throw Error('Bubble Babble 音节无效。');const first=a*64+b*4+c;out.push(first);if(s.length===3){s='';break;}const hi=consonants.indexOf(s[3]),lo=consonants.indexOf(s[5]);if(s[4]!=='-'||hi<0||hi>15||lo<0||lo>15)throw Error('Bubble Babble 音节无效。');const second=hi*16+lo;out.push(second);seed=(seed*5+first*7+second)%36;s=s.slice(6);}const result=Uint8Array.from(out);if(bubble(result)!==text)throw Error('编码校验失败。');return result;}
function hamming(n){const d=[n>>>3&1,n>>>2&1,n>>>1&1,n&1];return [d[0]^d[1]^d[3],d[0]^d[2]^d[3],d[0],d[1]^d[2]^d[3],d[1],d[2],d[3]].join('');}
export function encodeBytes(bytes,codec){
 if(!(bytes instanceof Uint8Array)||!BYTE_CODECS.includes(codec))throw Error('无效字节编码。');
 if(codec==='base91')return base91.encode(bytes);
 if(codec==='base100')return Array.from(bytes,b=>String.fromCodePoint(0x1f3f7+b)).join('');
 if(codec==='base65536')return base65536.encode(bytes);
 if(B32[codec])return encode32(bytes,B32[codec]);
 if(codec==='uuencode'||codec==='xxencode')return uuencode(bytes,codec==='xxencode');
 if(codec==='bubblebabble')return bubble(bytes);
 if(codec==='gray')return Array.from(bytes,b=>bit(b^(b>>>1))).join(' ');
 if(codec==='excess3')return Array.from(bytes,b=>String(b).padStart(3,'0').split('').map(c=>(+c+3).toString(2).padStart(4,'0')).join('')).join(' ');
 if(codec==='hamming74')return Array.from(bytes,b=>hamming(b>>>4)+hamming(b&15)).join(' ');
 if(codec==='unary7'&&bytes.some(b=>b>127))throw Error('Chuck Norris 使用 7 位 ASCII，不接受大于 127 的字节。');
 const bits=Array.from(bytes,b=>codec==='unary7'?b.toString(2).padStart(7,'0'):bit(b)).join('');
 if(codec==='unary'||codec==='unary7')return(bits.match(/0+|1+/g)||[]).map(run=>(run[0]==='1'?'0':'00')+' '+'0'.repeat(run.length)).join(' ');
 if(codec==='manchester')return [...bits].map(c=>c==='0'?'01':'10').join('');
 let level=0;return [...bits].map(c=>{if(c==='0')level^=1;const first=level;level^=1;return ''+first+level;}).join('');
}
export function decodeBytes(text,codec){
 if(!BYTE_CODECS.includes(codec))throw Error('无效字节编码。');
 if(codec==='base91'){if([...text].some(c=>!B91.includes(c)))throw Error('basE91 中含字母表以外的字符。');const bytes=base91.decode(text);if(base91.encode(bytes)!==text)throw Error('basE91 尾部或长度不规范。');return bytes;}
 if(codec==='base100'){return Uint8Array.from([...text],c=>{const n=c.codePointAt(0)-0x1f3f7;if(n<0||n>255)throw Error('Base100 中含映射范围外的字符。');return n;});}
 if(codec==='base65536')return base65536.decode(text);
 if(B32[codec])return decode32(codec==='crockford32'?text.toUpperCase().replaceAll('O','0').replace(/[IL]/g,'1').replaceAll('-',''):text,B32[codec]);
 if(codec==='uuencode'||codec==='xxencode')return uudecode(text,codec==='xxencode');
 if(codec==='bubblebabble')return unbubble(text);
 let bits=text.replace(/\s+/g,'');
 if(codec==='unary'||codec==='unary7'){const chunks=text.trim()?text.trim().split(/\s+/):[];if(chunks.length%2)throw Error('一元编码必须成对。');bits='';for(let i=0;i<chunks.length;i+=2){if(!['0','00'].includes(chunks[i])||!/^0+$/.test(chunks[i+1]))throw Error('一元编码分组无效。');bits+=(chunks[i]==='0'?'1':'0').repeat(chunks[i+1].length);}}
 if(!/^[01]*$/.test(bits))throw Error('只允许二进制位。');
 if(codec==='hamming74'){if(bits.length%14)throw Error('每字节需要两个 7 位码字。');let recovered='';for(let i=0;i<bits.length;i+=7){const b=[0,...bits.slice(i,i+7)].map(Number);let s=0;for(const p of [1,2,4]){let parity=0;for(let n=1;n<=7;n++)if(n&p)parity^=b[n];if(parity)s|=p;}if(s)b[s]^=1;recovered+=[3,5,6,7].map(n=>b[n]).join('');}bits=recovered;}
 if(codec==='manchester'||codec==='differential-manchester'){if(bits.length%2)throw Error('线路编码须为完整电平对。');let decoded='',previous=0;for(let i=0;i<bits.length;i+=2){const a=+bits[i],b=+bits[i+1];if(a===b)throw Error('缺少中间跳变。');decoded+=codec==='manchester'?String(a):a===previous?'1':'0';previous=b;}bits=decoded;}
 if(codec==='excess3'){if(bits.length%12)throw Error('每字节需三个十进制数字的余 3 码。');const out=[];for(let i=0;i<bits.length;i+=12){let digits='';for(let j=0;j<12;j+=4){const n=parseInt(bits.slice(i+j,i+j+4),2)-3;if(n<0||n>9)throw Error('无效余 3 码。');digits+=n;}if(+digits>255)throw Error('结果超出一个字节。');out.push(+digits);}return Uint8Array.from(out);}
 const width=codec==='unary7'?7:8;if(bits.length%width)throw Error(`结果不是完整 ${width} 位数据。`);return Uint8Array.from(bits.match(new RegExp('.{'+width+'}','g'))||[],s=>{let n=parseInt(s,2);if(codec==='gray')for(let shift=n>>>1;shift;shift>>>=1)n^=shift;return n;});
}
