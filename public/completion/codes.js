// Rule-based encodings; no external requests, evaluation or truncated output.
export const DIGITS='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/';
export function radix(text,from,to){
 if(![from,to].every(n=>Number.isInteger(n)&&n>=2&&n<=64))throw Error('进制必须是 2–64。');
 return text.trim().split(/\s+/).map(token=>{let sign=1n;if(token[0]==='-'){sign=-1n;token=token.slice(1);}else if(from<=36&&token[0]==='+')token=token.slice(1);if(!token)throw Error('缺少整数。');let n=0n;for(let c of token){if(from<=36)c=c.toUpperCase();const d=DIGITS.indexOf(c);if(d<0||d>=from)throw Error(`字符 ${c} 不属于 ${from} 进制。`);n=n*BigInt(from)+BigInt(d);}let s='';do{s=DIGITS[Number(n%BigInt(to))]+s;n/=BigInt(to);}while(n);if(to<=36)s=s.toLowerCase();return sign<0n&&s!=='0'?'-'+s:s;}).join('\n');
}
const fib=[1n,2n];
function fibonacci(n){while(fib.at(-1)<=n)fib.push(fib.at(-1)+fib.at(-2));let i=fib.length-1;while(i&&fib[i]>n)i--;let s=Array(i+1).fill('0');for(;i>=0;i--)if(fib[i]<=n){s[i]='1';n-=fib[i];}return s.join('')+'1';}
export function integerCode(text,codec,direction){
 if(direction==='encode')return text.trim().split(/\s+/).map(t=>{if(!/^\d+$/.test(t))throw Error('需要正整数，以空白分隔。');const n=BigInt(t);if(n<1n)throw Error('通用整数编码从 1 开始。');const b=n.toString(2),l=b.length;if(codec==='fibonacci')return fibonacci(n);if(codec==='gamma')return '0'.repeat(l-1)+b;if(codec==='delta'){const lb=l.toString(2);return '0'.repeat(lb.length-1)+lb+b.slice(1);}throw Error('未知整数编码。');}).join(' ');
 const bits=text.replace(/\s/g,'');if(!/^[01]*$/.test(bits))throw Error('只允许二进制位。');let at=0,out=[];const take=n=>{if(at+n>bits.length)throw Error('末尾码字不完整。');const s=bits.slice(at,at+n);at+=n;return s;};
 while(at<bits.length){if(codec==='fibonacci'){let n=0n,i=0,prev='0';while(true){const c=take(1);if(c==='1'&&prev==='1')break;while(fib.length<=i)fib.push(fib.at(-1)+fib.at(-2));if(c==='1')n+=fib[i];prev=c;i++;}out.push(n.toString());continue;}let zeros=0;while(take(1)==='0')zeros++;if(zeros>100000)throw Error('码字过长。');let b='1'+take(zeros);if(codec==='delta'){const len=Number(BigInt('0b'+b));if(!Number.isSafeInteger(len)||len>bits.length-at+1)throw Error('Delta 长度超出输入。');b='1'+take(len-1);}else if(codec!=='gamma')throw Error('未知整数编码。');out.push(BigInt('0b'+b).toString());}return out.join(' ');
}
export const NATO=['Alfa','Bravo','Charlie','Delta','Echo','Foxtrot','Golf','Hotel','India','Juliett','Kilo','Lima','Mike','November','Oscar','Papa','Quebec','Romeo','Sierra','Tango','Uniform','Victor','Whiskey','X-ray','Yankee','Zulu'];
export function nato(text,direction){if(direction==='decode')return text.trim().split(/\s+/).map(t=>{if(t==='/')return ' ';const i=NATO.findIndex(v=>v.toLowerCase()===t.toLowerCase());if(i<0)throw Error('未知拼读词：'+t);return String.fromCharCode(65+i);}).join('');return [...text.toUpperCase()].map(c=>{if(c===' ')return '/';const i=c.charCodeAt(0)-65;if(i<0||i>25)throw Error('仅接受 A–Z 与空格。');return NATO[i];}).join(' ');}
const abc='abcdefghijklmnopqrstuvwxyz',rows=['qwertyuiop','asdfghjkl','zxcvbnm'],phone=['abc','def','ghi','jkl','mno','pqrs','tuv','wxyz'];
export const KEYBOARD_MODES=['coordinates','column-row','shift-left','shift-right','mirror','dvorak','multitap','t9'];
export function keyboardCode(text,mode,direction){
 let from=[...abc],to;
 if(mode==='coordinates'||mode==='column-row')to=from.map(c=>{const r=rows.findIndex(v=>v.includes(c)),col=rows[r].indexOf(c)+1;return mode==='coordinates'?`${r+1},${col}`:`${col},${r+1}`;});
 else if(mode==='dvorak'){from=[...'qwertyuiop[]asdfghjkl;\'zxcvbnm,./'];to=[..."',.pyfgcrl/=aoeuidhtns;qjkxbmwvz"];;}
 else if(mode==='multitap'||mode==='t9')to=from.map(c=>{const i=phone.findIndex(p=>p.includes(c));return String(i+2).repeat(mode==='multitap'?phone[i].indexOf(c)+1:1);});
 else if(['shift-left','shift-right','mirror'].includes(mode))to=from.map(c=>{const row=rows.find(v=>v.includes(c)),i=row.indexOf(c);return row[mode==='mirror'?row.length-1-i:(i+(mode==='shift-left'?-1:1)+row.length)%row.length];});
 else throw Error('未知键盘模式。');
 if(direction==='decode'&&mode==='t9')throw Error('T9 数字需使用词库查询，不能唯一还原字母。');
 const reverse=direction==='decode',map=new Map((reverse?to:from).map((c,i)=>[c,(reverse?from:to)[i]]));
 const grouped=['coordinates','column-row','multitap'].includes(mode);const words=text.toLowerCase().split(reverse&&grouped?/\s*\/\s*/:/\s+/);
 return words.map(word=>(reverse&&grouped?word.trim().split(/\s+/):[...word]).map(c=>{if(!map.has(c))throw Error('映射中没有：'+c);return map.get(c);}).join(!reverse&&grouped?' ':'')).join(!reverse&&grouped?' / ':' ');
}
export function t9Matches(rows,input){if(!/^[2-9]+$/.test(input))throw Error('T9 查询需为连续的 2–9。');return rows.filter(({word})=>/^[a-z]+$/i.test(word)&&word.length===input.length&&keyboardCode(word,'t9','encode')===input).map(r=>r.word);}
export const COLORS=['黑','棕','红','橙','黄','绿','蓝','紫','灰','白','金','银','无'];
const english=['black','brown','red','orange','yellow','green','blue','violet','gray','white','gold','silver','none'];
const tolerance={棕:1,红:2,绿:0.5,蓝:0.25,紫:0.1,灰:0.05,金:5,银:10,无:20};
const coeff={黑:250,棕:100,红:50,橙:15,黄:25,绿:20,蓝:10,紫:5,灰:1};
const colorTokens=text=>text.trim().split(/[\s,，]+/).map(c=>{const i=english.indexOf(c.toLowerCase());c=i>=0?COLORS[i]:c;if(!COLORS.includes(c))throw Error('未知颜色：'+c);return c;});
export function resistor(text){const c=colorTokens(text);if(c.length<3||c.length>6)throw Error('电阻色环需要 3–6 环。');const digits=c.length<5?2:3;const d=c.slice(0,digits).map(c=>COLORS.indexOf(c));if(d.some(v=>v>9)||d[0]===0)throw Error('有效数字环不能是金、银、无色或前导黑。');const m=c[digits]==='金'?-1:c[digits]==='银'?-2:COLORS.indexOf(c[digits]);if(m>9)throw Error('倍率环无效。');const tol=c.length===3?20:tolerance[c[digits+1]];if(tol===undefined)throw Error('容差环无效。');const value=Number(d.join(''))*10**m;if(c.length===6&&coeff[c[5]]===undefined)throw Error('温度系数环无效。');return {ohms:value,tolerancePercent:tol,minOhms:value*(1-tol/100),maxOhms:value*(1+tol/100),...(c.length===6?{temperaturePPM:coeff[c[5]]}:{})};}
export function capacitor(text,{series='polyester'}={}){
 const c=colorTokens(text);if(c.length<3||c.length>5)throw Error('电容色码需要 3–5 环。');
 const d=c.slice(0,2).map(v=>COLORS.indexOf(v)),exponent=c[2]==='金'?-1:c[2]==='银'?-2:COLORS.indexOf(c[2]);
 if(d.some(v=>v>9)||exponent>9)throw Error('有效数字或倍率颜色无效。');
 const pf=(d[0]*10+d[1])*10**exponent,result={pF:pf,nF:pf/1000,uF:pf/1e6};
 const toleranceMap=series==='polyester'?{黑:20,白:10,绿:5}:series==='precision'?{无:20,银:10,金:5,红:2,棕:1,绿:.5,蓝:.25,紫:.1,橙:.05,黄:.02,灰:.01}:null;
 if(!toleranceMap)throw Error('未知电容系列。');
 if(c.length>=4){const t=toleranceMap[c[3]];if(t===undefined)throw Error('所选系列不定义这一容差颜色。');Object.assign(result,{tolerancePercent:t,minPF:pf*(1-t/100),maxPF:pf*(1+t/100)});}
 if(c.length===5){if(series!=='polyester')throw Error('精密容差色码没有统一耐压环，不能从颜色猜测电压。');const voltage={红:250,黄:400}[c[4]];if(voltage===undefined)throw Error('聚酯五环模式的耐压环为红 250 V 或黄 400 V。');result.volts=voltage;}
 return result;
}
function valueColors(value,digits){
 const n=Number(value);if(!Number.isFinite(n)||n<=0)throw Error('数值须大于零。');
 for(let exponent=-2;exponent<=9;exponent++){const v=n/10**exponent,rounded=Math.round(v);if(rounded>=10**(digits-1)&&rounded<10**digits&&Math.abs(v-rounded)<1e-8)return [...String(rounded)].map(d=>COLORS[Number(d)]).concat(exponent===-2?'银':exponent===-1?'金':COLORS[exponent]);}
 throw Error('该数值无法用指定有效数字与色环精确表示，未自动取近似值。');
}
export function encodeComponent(text,{mode,bands='4',tolerancePercent='5',temperaturePPM='100',series='polyester',volts='250'}={}){
 const bandCount=Number(bands),digits=mode==='resistor'&&bandCount>=5?3:2,c=valueColors(text.trim(),digits);
 if(mode==='resistor'){
  if(![3,4,5,6].includes(bandCount))throw Error('电阻需要 3–6 环。');
  if(bandCount>3){const color=Object.keys(tolerance).find(k=>tolerance[k]===Number(tolerancePercent));if(!color||color==='无')throw Error('所选容差没有独立色环。');c.push(color);}
  if(bandCount===6){const color=Object.keys(coeff).find(k=>coeff[k]===Number(temperaturePPM));if(!color)throw Error('温度系数没有对应色环。');c.push(color);}
 }else{
  if(![3,4,5].includes(bandCount))throw Error('电容需要 3–5 环。');
  if(bandCount>3){const map=series==='polyester'?{黑:20,白:10,绿:5}:{无:20,银:10,金:5,红:2,棕:1,绿:.5,蓝:.25,紫:.1,橙:.05,黄:.02,灰:.01};const color=Object.keys(map).find(k=>map[k]===Number(tolerancePercent));if(!color||color==='无')throw Error('所选容差没有独立色环。');c.push(color);}
  if(bandCount===5){if(series!=='polyester')throw Error('此系列未定义耐压色环。');const color={250:'红',400:'黄'}[volts];if(!color)throw Error('此系列支持 250 V 或 400 V。');c.push(color);}
 }
 return c.join(' ');
}
export function cable(text,direction){const major=['白','红','黑','黄','紫'],minor=['蓝','橙','绿','棕','灰'];if(direction==='encode')return text.trim().split(/\s+/).map(s=>{const n=Number(s);if(!Number.isInteger(n)||n<1||n>25)throw Error('线对编号为 1–25。');return `${n}: ${major[Math.floor((n-1)/5)]} / ${minor[(n-1)%5]}`;}).join('\n');const c=colorTokens(text);if(c.length!==2||!major.includes(c[0])||!minor.includes(c[1]))throw Error('输入主色、辅色（如 白 蓝）。');return String(major.indexOf(c[0])*5+minor.indexOf(c[1])+1);}
export function permutation(text,alphabet,direction){const items=alphabet.trim().split(/\s+/);if(new Set(items).size!==items.length||items.length<1||items.length>200)throw Error('符号需互不重复，共 1–200 个，以空白分隔。');const factorial=[1n];for(let n=1;n<=items.length;n++)factorial[n]=factorial[n-1]*BigInt(n);const pool=[...items];if(direction==='decode'){if(!/^\d+$/.test(text.trim()))throw Error('排名须是从 0 开始的整数。');let rank=BigInt(text.trim());if(rank>=factorial[items.length])throw Error('排名超出排列总数 '+factorial[items.length]);const out=[];while(pool.length){const f=factorial[pool.length-1],i=Number(rank/f);rank%=f;out.push(pool.splice(i,1)[0]);}return out.join(' ');}const order=text.trim().split(/\s+/);if(order.length!==pool.length)throw Error('排列必须包含全部符号。');let rank=0n;for(const item of order){const i=pool.indexOf(item);if(i<0)throw Error('排列含重复或未知符号。');rank+=BigInt(i)*factorial[pool.length-1];pool.splice(i,1);}return rank.toString();}
