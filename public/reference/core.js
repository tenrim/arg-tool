import {parsePortCoordinate,geologicalName,colorValues} from './visual-core.js';
import {tarotCardArt,tarotDeck} from './tarot-art.js';
const fold=s=>String(s??'').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase();
const matches=(q,values)=>q.split(/\s+/).every(t=>fold(values.join(' ')).includes(t));
const field=(...v)=>v.filter(([k,x])=>x!==''&&x!==undefined&&x!==null).map(([k,x])=>[k,Array.isArray(x)?x.join('、'):String(x)]);
const row=(id,title,fields,extra={})=>({id,title,fields,...extra});
const countryLabel=(code,countries)=>countries.find(c=>c.id===code)?.name||code;
const types={large_airport:'大型机场',medium_airport:'中型机场',small_airport:'小型机场',heliport:'直升机场',seaplane_base:'水上机场',closed:'已关闭',balloonport:'气球场'};
const unicodeIndexes=new WeakMap();
const category={Lu:'大写字母',Ll:'小写字母',Lt:'标题字母',Lm:'修饰字母',Lo:'其他字母',Mn:'非间距标记',Mc:'间距标记',Me:'包围标记',Nd:'十进制数字',Nl:'字母数字',No:'其他数字',Pc:'连接标点',Pd:'破折号',Ps:'起始标点',Pe:'结束标点',Pi:'起始引号',Pf:'结束引号',Po:'其他标点',Sm:'数学符号',Sc:'货币符号',Sk:'修饰符号',So:'其他符号',Zs:'空格分隔符',Zl:'行分隔符',Zp:'段分隔符',Cc:'控制字符',Cf:'格式字符',Cs:'代理码位',Co:'私用字符',Cn:'未指派'};
export function unicodePoint(cp,data){
 if(!unicodeIndexes.has(data))unicodeIndexes.set(data,new Map(data.rows.map(r=>[r[0],r])));const explicit=unicodeIndexes.get(data).get(cp);let r=explicit;
 if(!r){const range=data.ranges.find(r=>cp>=r[0]&&cp<=r[1]);r=[cp,range?range[2]:'未指派',range?.[3]||'Cn',range?.[4]||'','', '', '', ''];if(range?.[2].includes('Ideograph'))r[1]='CJK UNIFIED IDEOGRAPH-'+cp.toString(16).toUpperCase();if(cp>=0xAC00&&cp<=0xD7A3){const l=['G','GG','N','D','DD','R','M','B','BB','S','SS','','J','JJ','C','K','T','P','H'],v=['A','AE','YA','YAE','EO','E','YEO','YE','O','WA','WAE','OE','YO','U','WEO','WE','WI','YU','EU','YI','I'],t=['','G','GG','GS','N','NJ','NH','D','L','LG','LM','LB','LS','LT','LP','LH','M','B','BS','S','SS','NG','J','C','K','T','P','H'],n=cp-0xAC00;r[1]='HANGUL SYLLABLE '+l[Math.floor(n/588)]+v[Math.floor(n%588/28)]+t[n%28];}}
 const hex=cp.toString(16).toUpperCase().padStart(4,'0'),safe=!['Cc','Cf','Cs','Cn'].includes(r[2]),character=safe?String.fromCodePoint(cp):'（不可见或未指派）';
 const rangeName=(list)=>list.find(a=>cp>=a[0]&&cp<=a[1])?.[2]||'未指定';
 return row(hex,'U+'+hex+' · '+character,field(['名称（Unicode 原文）',r[1]],['类别',(category[r[2]]||r[2])+' · '+r[2]],['文字系统',rangeName(data.scripts)],['区块',rangeName(data.blocks)],['别名',(data.aliases[String(cp)]||[]).join('、')],['十进制码位',cp],['UTF-8',r[2]==='Cs'?'代理码位不能单独编码':Array.from(new TextEncoder().encode(String.fromCodePoint(cp)),n=>n.toString(16).padStart(2,'0')).join(' ')],['分解映射',r[4]],['数值',r[5]],['大写映射',r[6]&&'U+'+r[6]],['小写映射',r[7]&&'U+'+r[7]]));
}
export function colorLab(hex){const rgb=hex.replace('#','').match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);const [r,g,b]=rgb;const f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;const x=f((r*.4124564+g*.3575761+b*.1804375)/.95047),y=f(r*.2126729+g*.7151522+b*.072175),z=f((r*.0193339+g*.119192+b*.9503041)/1.08883);return[116*y-16,500*(x-y),200*(y-z)];}
export function sequenceMatches(input,sequences){
 if(!input.trim())throw Error('请输入至少 3 项整数，以空格或逗号分隔。');
 const terms=input.trim().split(/[\s,，;；]+/);if(terms.length<3||terms.length>100||terms.some(s=>!/^[-+]?\d{1,100}$/.test(s)))throw Error('请输入 3–100 个整数，每项最多 100 位；不接受小数或省略号。');
 const canonical=terms.map(s=>BigInt(s).toString()),out=[];
 for(const seq of sequences){for(let i=0;i<=seq.terms.length-canonical.length;i++){if(canonical.every((v,j)=>v===BigInt(seq.terms[i+j]).toString())){out.push(row(seq.id,seq.id,field(['原始序列说明',seq.name],['匹配起始索引',String(Number(seq.offset)+i)],['已收录后续项',seq.terms.slice(i+canonical.length,i+canonical.length+12).join(', ')||'本地前缀已用完'],['收录前缀',seq.terms.slice(0,36).join(', ')])));break;}}}
 // Finite observations cannot identify a unique rule: these are explicitly candidates.
 const values=canonical.map(BigInt),diff=values[1]-values[0];
 if(values.every((v,i)=>!i||v-values[i-1]===diff))out.unshift(row('arithmetic','等差规律候选',field(['公差',diff.toString()],['按此规律的后续项',Array.from({length:8},(_,i)=>(values.at(-1)+diff*BigInt(i+1)).toString()).join(', ')],['说明','有限项不能证明唯一规律。'])));
 if(values[0]!==0n&&values[1]%values[0]===0n){const ratio=values[1]/values[0];if(values.every((v,i)=>!i||v===values[i-1]*ratio))out.unshift(row('geometric','整数等比规律候选',field(['公比',ratio.toString()],['按此规律的后续项',Array.from({length:8},(_,i)=>(values.at(-1)*ratio**BigInt(i+1)).toString()).join(', ')],['说明','有限项不能证明唯一规律。'])));}
 return out;
}
export function queryRecords(kind,p,data,countries=[]){
 const q=fold(String(p.query||'').trim());if(q.length>10000)throw Error('查询内容过长。');let records=[];
 if(p.recordId&&Array.isArray(data)&&!['unicode','colors','integerseq','geology'].includes(kind))data=data.filter(r=>String(kind==='airports'?r[0]:kind==='ports'?r[0]+r[1]:r.id)===String(p.recordId));
 const page=Math.max(0,Math.floor(Number(p.page)||0)),size=24;const paginate=(items,convert=x=>x)=>({total:items.length,page,items:items.slice(page*size,(page+1)*size).map(convert),note:items.length?'':'本地收录范围内没有匹配项，请调整条件。'});
 if(kind==='countries')return paginate(data.filter(r=>(!p.region||r.continent===p.region)&&matches(q,[r.id,r.name,r.english,r.native,r.capital,...r.currency,...r.phone])),r=>row(r.id,r.name,field(['代码',r.id],['英文名',r.english],['当地名称',r.native],['所属洲',r.continent],['首都（来源原文）',r.capital||'未列出'],['国际电话区号',r.phone.map(x=>'+'+x)],['货币代码',r.currency],['语言代码',r.languages]),{flag:r.flag?r.id.toLowerCase():null,currencyCodes:r.currency}));
 else if(kind==='airports')return paginate(data.filter(r=>(!p.region||r[4]===p.region.toUpperCase())&&(!p.filter||r[5]===p.filter)&&matches(q,[r[0],r[1],r[2],r[3],r[4],countryLabel(r[4],countries)])).sort((a,b)=>(fold(b[0])===q||fold(b[1])===q?1:0)-(fold(a[0])===q||fold(a[1])===q?1:0)),r=>row(r[0],r[1]?r[1]+' · '+r[2]:r[0]+' · '+r[2],field(['ICAO／本地标识',r[0]],['IATA',r[1]||'未分配'],['城市（原文）',r[3]],['国家／地区',countryLabel(r[4],countries)+' · '+r[4]],['类型',types[r[5]]||r[5]],['纬度 / 经度',r[6]+' / '+r[7]],['海拔（英尺）',r[8]],['定期航班',r[9]==='yes'?'有':'无或未标注']),{country:r[4],point:r[6]!==''&&r[7]!==''?[Number(r[7]),Number(r[6])]:null}));
 else if(kind==='ports')return paginate(data.filter(r=>(!p.region||r[0]===p.region.toUpperCase())&&(!p.filter||r[5].includes(p.filter))&&matches(q,[r[0]+r[1],r[2],r[3],r[0],countryLabel(r[0],countries)])),r=>row(r[0]+r[1],r[0]+r[1]+' · '+r[2],field(['国家／地区',countryLabel(r[0],countries)+' · '+r[0]],['行政区代码',r[4]],['地点功能',r[5].split('').map(c=>({'1':'港口','2':'铁路','3':'公路','4':'机场','5':'邮政交换','6':'多式联运','7':'固定运输设施','B':'边境口岸'}[c])).filter(Boolean).join('、')||'未明确'],['状态代码',r[6]],['坐标（原记录）',r[7]||'未提供'],['IATA',r[8]],['记录年月（YYMM）',r[9]],['变更标记',r[10]],['原始备注',r[11]]),{country:r[0],point:parsePortCoordinate(r[7])}));
 else if(kind==='unicode'){
  if(p.mode==='name'){if(!q)throw Error('请输入英文名称或类别代码。');const cps=data.rows.filter(r=>matches(q,[r[1],r[2],category[r[2]],...(data.aliases[String(r[0])]||[])])).map(r=>r[0]);return paginate(cps,cp=>unicodePoint(cp,data));}
  else{const input=String(p.query||'');if(!input)throw Error('请输入字符或 U+XXXX 码位。');let cps;
   if(/^(?:(?:U\+|0x)[0-9a-f]+[\s,，]*)+$/i.test(input))cps=input.match(/(?:U\+|0x)([0-9a-f]+)/gi).map(t=>parseInt(t.replace(/^(U\+|0x)/i,''),16));else{if(/^(?:U\+|0x)/i.test(input.trim()))throw Error('码位格式无效，请使用 U+0041 等十六进制写法。');cps=Array.from(input,c=>c.codePointAt(0));}
   if(cps.length>100)throw Error('一次最多查询 100 个码位。');if(cps.some(c=>c<0||c>0x10FFFF))throw Error('Unicode 码位范围为 U+0000–U+10FFFF。');return paginate(cps,cp=>unicodePoint(cp,data));}
 }
 else if(kind==='iching'){
  const items=p.mode==='trigram'?data.trigrams:data.hexagrams;
  records=items.filter(r=>{if(p.recordId&&String(r.number)!==String(p.recordId))return false;const binary=r.lines.join('');return p.bits?binary===p.bits:matches(q,[r.number,r.chineseName,r.character,r.pinyinName,...r.names,binary]);}).map(r=>row(String(r.number),r.character+' '+r.chineseName,field(['编号',r.number],['读音',r.pinyinName],['阴阳爻（自下而上，阳1阴0）',r.lines.join('')],['上卦',r.topTrigram?data.trigrams.find(t=>t.number===r.topTrigram)?.chineseName:''],['下卦',r.bottomTrigram?data.trigrams.find(t=>t.number===r.bottomTrigram)?.chineseName:''],['象',r.chineseImage]),{lines:r.lines}));
 }
 else if(kind==='tarot'){
  const deck=tarotDeck(p.deck),number=r=>tarotCardArt(r,deck.id).number;
  const cards=data.filter(r=>(!p.filter||r.suit===p.filter)&&(/^\d+$/.test(q)?String(number(r))===String(Number(q)):matches(q,[r.name,r.english,number(r),r.suit,r.gloss,r.element]))).sort((a,b)=>a.suit==='大阿尔卡那'&&b.suit===a.suit?number(a)-number(b):0);
  return paginate(cards,r=>{const art=tarotCardArt(r,deck.id);return row(r.id,r.name,field(['英文牌名',r.english],['牌组／花色',r.suit],['牌面编号',art.number],['牌面版本',deck.label],['元素对应',r.element],['关键词（本站简述）',r.gloss]),{tarot:true,tarotImage:art.file,tarotDeck:deck.id});});
 }
 else if(kind==='colors'){
  let hex=String(p.query||'').trim();hex=({'红':'#ff0000','蓝':'#0000ff','绿':'#008000','黑':'#000000','白':'#ffffff','黄':'#ffff00','紫':'#800080','橙':'#ffa500'}[hex]||hex);
  if(/^#?[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(hex)){hex=hex.replace('#','');if(hex.length===3)hex=hex.split('').map(c=>c+c).join('');const lab=colorLab(hex);records=data.map(r=>({r,d:Math.hypot(...colorLab(r[1]).map((n,i)=>n-lab[i]))})).sort((a,b)=>a.d-b.d).slice(0,48).map(({r,d})=>row(r[0],r[0],field(['HEX',r[1]],['RGB',r[1].slice(1).match(/../g).map(n=>parseInt(n,16)).join(', ')],['HSL',colorValues(r[1]).hsl],['与输入色的 ΔE76',d.toFixed(3)]),{swatch:r[1]}));}
  else{if(hex.startsWith('#'))throw Error('色值须为 #RGB 或 #RRGGBB。');return paginate(data.filter(r=>matches(q,r)),r=>row(r[0],r[0],field(['HEX',r[1]],['RGB',r[1].slice(1).match(/../g).map(n=>parseInt(n,16)).join(', ')],['HSL',colorValues(r[1]).hsl]),{swatch:r[1]}));}
 }
 else if(kind==='geology'){
  let age=null;if(p.mode==='age'){if(!q||!/^\d+(?:\.\d+)?$/.test(q)||Number(q)>5000)throw Error('请输入 0–5000 的百万年数值（Ma）。');age=Number(q);}
  const era=geologicalName;
  return paginate(data.filter(r=>(!p.recordId||r.id===p.recordId)&&(!p.filter||r.rank===p.filter)&&(age===null?matches(q,[r.id,r.name,era(r),r.english,r.rank]):age>=r.end&&age<=r.start)),r=>row(r.id,era(r)+' · '+r.english,field(['原地层名称',r.name],['层级',r.rank==='Super-Eon'?'超宙':r.rank],['开始（百万年前）',r.start],['结束（百万年前）',r.end],['跨度（百万年）',+(r.start-r.end).toFixed(6)],['上级',data.find(x=>x.id===r.parent)?.name||'无']),{swatch:r.color}));
 }
 else if(kind==='integerseq')records=sequenceMatches(String(p.query||''),data);
 else if(kind==='crystals')return paginate(data.filter(r=>matches(q,[r.id,r.name,r.english,r.formula])),r=>row(r.id,r.name,field(['原始名称',r.english],['COD 编号',r.id],['化学组成',r.formula]),{crystalFile:r.file}));
 else throw Error('未知查询工具。');
 return paginate(records);
}
