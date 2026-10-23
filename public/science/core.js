export function number(value,min,max,label='数值',integer=false){
 const n=Number(value);if(String(value).trim()===''||!Number.isFinite(n)||n<min||n>max||integer&&!Number.isInteger(n))throw Error(`${label}应为 ${min} 至 ${max} 的${integer?'整数':'数值'}。`);return n;
}
export function dateParts(value){
 const m=/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(value);if(!m)throw Error('请填写完整日期。');
 const [y,mo,d,h=0,mi=0]=m.slice(1).map((v,i)=>v===undefined?0:Number(v));number(y,1900,2100,'年份',true);
 const check=new Date(Date.UTC(y,mo-1,d,h,mi));if(check.getUTCFullYear()!==y||check.getUTCMonth()!==mo-1||check.getUTCDate()!==d||h>23||mi>59)throw Error('日期或时间无效。');return [y,mo,d,h,mi];
}
export function astronomy(p,A){
 const [y,m,d,h,mi]=dateParts(p.date),offset=number(p.offset,-12,14,'UTC 时差'),date=new Date(Date.UTC(y,m-1,d,h,mi)-offset*3600000);
 const obs=new A.Observer(number(p.lat,-90,90,'纬度'),number(p.lon,-180,180,'经度'),0);
 if(p.event==='local-eclipse'){
  const eclipse=A.SearchLocalSolarEclipse(date,obs),kinds={partial:'偏食',annular:'环食',total:'全食'};
  const event=e=>e?new Date(e.time.date.getTime()+offset*3600000).toISOString().slice(0,19).replace('T',' ')+' · 太阳高度 '+e.altitude.toFixed(2)+'°':'无此阶段';
  return {title:'当地下一次日食',rows:[['观测地点',obs.latitude+'°，'+obs.longitude+'°'],['结果时区','UTC'+(offset>=0?'+':'')+offset],['类型',kinds[eclipse.kind]||eclipse.kind],['初亏',event(eclipse.partial_begin)],['全食／环食开始',event(eclipse.total_begin)],['食甚',event(eclipse.peak)],['全食／环食结束',event(eclipse.total_end)],['复圆',event(eclipse.partial_end)]],note:'按指定地点计算；太阳高度为负的阶段在地平线以下。结果不计当地地形、云量等实际观测条件。'};
 }
 const names={Sun:'太阳',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星',Uranus:'天王星',Neptune:'海王星'};
 const stamp=t=>t?new Date(t.date.getTime()+offset*3600000).toISOString().slice(0,19).replace('T',' '):'未来 24 小时内没有升落事件';
 if(p.body==='Star1'){
  const object=p.catalogue;if(!object||typeof object.id!=='string'||typeof object.name!=='string'||object.id.length>100||object.name.length>200||object.ra===null||object.dec===null)throw Error('请先在深空天体目录中选择有坐标的天体。');
  const ra=number(object.ra,0,24,'星表赤经'),dec=number(object.dec,-90,90,'星表赤纬');
  // Catalogue directions are J2000. Let the actual engine transform them to
  // the observing date. A distant reference avoids inventing missing distances.
  A.DefineStar(A.Body.Star1,ra,dec,1000000);
  const equ=A.Equator(A.Body.Star1,date,obs,true,true),hor=A.Horizon(date,obs,equ.ra,equ.dec,'normal');
  return {title:'目录天体方位',rows:[['查询时刻（UTC）',date.toISOString()],['结果时区',`UTC${offset>=0?'+':''}${offset}`],['天体',object.name],['目录编号',object.id],['星表赤经 J2000',ra.toFixed(6)+' 小时'],['星表赤纬 J2000',dec.toFixed(6)+'°'],['方位角',hor.azimuth.toFixed(2)+'°（正北 0°，正东 90°）'],['高度角',hor.altitude.toFixed(2)+'°（负值为地平线以下）'],['观测日期赤经',equ.ra.toFixed(6)+' 小时'],['观测日期赤纬',equ.dec.toFixed(6)+'°'],['下一次升起',stamp(A.SearchRiseSet(A.Body.Star1,obs,1,date,1))],['下一次落下',stamp(A.SearchRiseSet(A.Body.Star1,obs,-1,date,1))]],visual:{azimuth:hor.azimuth,altitude:hor.altitude},note:'使用固定 J2000 方向，经天文引擎换算岁差和标准大气折射；不计恒星自行、真实距离视差、地形遮挡及深空天体的面状范围。'};
 }
 if(!names[p.body])throw Error('请选择支持的天体。');
 const phase=A.MoonPhase(date),lit=A.Illumination(A.Body.Moon,date).phase_fraction;
 const equ=A.Equator(p.body,date,obs,true,true),hor=A.Horizon(date,obs,equ.ra,equ.dec,'normal');
 const j2000=A.Equator(p.body,date,obs,false,true),constellation=A.Constellation(j2000.ra,j2000.dec);
 const rows=[['星座归属',constellation.name+' · '+constellation.symbol],['查询时刻（UTC）',date.toISOString()],['结果时区',`UTC${offset>=0?'+':''}${offset}`],['天体',names[p.body]],['方位角',hor.azimuth.toFixed(2)+'°（正北 0°，正东 90°）'],['高度角',hor.altitude.toFixed(2)+'°（负值为地平线以下）'],['赤经',equ.ra.toFixed(4)+' 小时'],['赤纬',equ.dec.toFixed(4)+'°'],['月相角',phase.toFixed(2)+'°'],['月面照亮比例',(lit*100).toFixed(2)+'%'],['下一次升起',stamp(A.SearchRiseSet(p.body,obs,1,date,1))],['下一次落下',stamp(A.SearchRiseSet(p.body,obs,-1,date,1))]];
 let q=A.SearchMoonQuarter(date);const labels=['新月','上弦月','满月','下弦月'];for(let i=0;i<4;i++){rows.push(['下一次'+labels[q.quarter],stamp(q.time)]);q=A.NextMoonQuarter(q);}
 const kinds={partial:'偏食',annular:'环食',total:'全食',penumbral:'半影食'};
 const solar=A.SearchGlobalSolarEclipse(date),lunar=A.SearchLunarEclipse(date);
 rows.push(['下一次全球日食',`${stamp(solar.peak)} · ${kinds[solar.kind]||solar.kind}`],['下一次月食',`${stamp(lunar.peak)} · ${kinds[lunar.kind]||lunar.kind}`]);
 return {title:'天文查询结果',rows,visual:{phase,lit,azimuth:hor.azimuth,altitude:hor.altitude},note:'日月食时刻为事件食甚；全球日食记录不代表查询地点可见，月食也需满足当地可见条件。示意图不表示月面在当地的实际倾角。'};
}
export function calendar(p,L){
 let solar,lunar;
 if(p.mode==='solar'){const [y,m,d]=dateParts(p.date);solar=L.Solar.fromYmdHms(y,m,d,12,0,0);lunar=solar.getLunar();}
 else {const y=number(p.year,1900,2100,'农历年份',true),m=number(p.month,1,12,'农历月份',true)*(p.leap?-1:1),day=number(p.day,1,30,'农历日期',true);const month=L.LunarMonth.fromYm(y,m);if(!month)throw Error('该年没有所选闰月。');if(day>month.getDayCount())throw Error(`该农历月只有 ${month.getDayCount()} 天。`);lunar=L.Lunar.fromYmdHms(y,m,day,12,0,0);solar=lunar.getSolar();}
 const rows=[['公历',solar.toYmd()],['星期','星期'+solar.getWeekInChinese()],['农历',`${lunar.getYear()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`],['农历月份编号',String(lunar.getMonth())+'（负数表示闰月）'],['年干支（春节换年）',lunar.getYearInGanZhi()],['生肖（春节换年）',lunar.getYearShengXiao()],['月干支（按节气）',lunar.getMonthInGanZhi()],['日干支',lunar.getDayInGanZhi()],['当日节气',lunar.getJieQi()||'无'],['传统节日',lunar.getFestivals().join('、')||'无']];
 const terms=Object.entries(L.Solar.fromYmd(solar.getYear(),7,1).getLunar().getJieQiTable()).map(([name,s])=>[name==='DONG_ZHI'?'冬至':name,s]).filter(([name,s])=>/^[\u4e00-\u9fff]+$/.test(name)&&s.getYear()===solar.getYear()).sort((a,b)=>a[1].toYmdHms().localeCompare(b[1].toYmdHms()));
 for(const [name,s]of terms)rows.push([name,s.toYmdHms()+'（北京时间）']);
 if(p.reference)rows.push(['佛历（文化参考）',lunar.getFoto().toString()],['道历（文化参考）',lunar.getTao().toString()]);
 return {title:'历法查询结果',rows};
}
export function splitElements(text,elements){
 const s=text.trim();if(!/^[a-zA-Z]{1,80}$/.test(s))throw Error('请输入 1–80 个英文字母，不含空格或标点。');
 const target=s.toLowerCase(),memo=new Map();
 function walk(i){if(i===target.length)return [[]];if(memo.has(i))return memo.get(i);const out=[];for(const el of elements){if(target.startsWith(el.symbol.toLowerCase(),i))for(const tail of walk(i+el.symbol.length)){out.push([el,...tail]);if(out.length>=101){memo.set(i,out);return out;}}}memo.set(i,out);return out;}
 const list=walk(0);return {title:'元素符号拆分',rows:list.slice(0,100).map((a,i)=>[String(i+1),`${a.map(e=>e.symbol).join(' · ')} → ${a.map(e=>e.number).join(' ')}（${a.map(e=>e.zh||e.name).join('、')}）`]),note:list.length>100?'候选超过 100 条，仅展示前 100 条；忽略输入大小写。':list.length?'拆分忽略大小写，可能存在多种解释。':'没有完整覆盖输入的元素符号组合。'};
}
export function formula(text,elements){
 const s=text.trim().replace(/[₀-₉]/g,c=>String(c.charCodeAt(0)-0x2080));
 if(!s||s.length>200||!/^[A-Za-z0-9()[\].·*]+$/.test(s))throw Error('请输入分子式，支持圆括号、方括号、下标数字和结晶水，例如 K4[Fe(CN)6]、CuSO4·5H2O；不支持电荷、同位素或小数下标。');
 const lookup=new Map(elements.map(e=>[e.symbol,e]));let pos=0;
 const count=()=>{const start=pos;while(pos<s.length&&/\d/.test(s[pos]))pos++;return pos>start?number(s.slice(start,pos),1,100000,'分子式系数',true):1;};
 const merge=(out,part,n)=>{for(const [k,c]of Object.entries(part)){out[k]=(out[k]||0)+c*n;if(out[k]>1e8)throw Error('原子数超出限制。');}};
 function group(depth,closing=''){
  if(depth>12)throw Error('括号嵌套过深。');const out={};let terms=0;
  while(pos<s.length&&s[pos]!==closing&&!['.', '·','*'].includes(s[pos])){
   let chunk;if(['(', '['].includes(s[pos])){const close=s[pos++]==='('?')':']';chunk=group(depth+1,close);if(s[pos]!==close)throw Error('分子式括号不匹配。');pos++;}
   else {const match=/^[A-Z][a-z]?/.exec(s.slice(pos));if(!match||!lookup.has(match[0]))throw Error('未知元素、括号不匹配或大小写错误，请核对规范元素符号。');pos+=match[0].length;chunk={[match[0]]:1};}
   merge(out,chunk,count());terms++;
  }
  if(!terms)throw Error('分子式含空括号或缺少元素。');return out;
 }
 const totals={};while(pos<s.length){const coefficient=count(),part=group(0);merge(totals,part,coefficient);if(pos<s.length){if(!['.','·','*'].includes(s[pos]))throw Error('分子式括号不匹配。');pos++;if(pos===s.length)throw Error('结晶水分隔符后缺少分子式。');}}
 const mass=Object.entries(totals).reduce((sum,[k,n])=>sum+lookup.get(k).atomic_mass*n,0),composition=Object.entries(totals).map(([symbol,count])=>{const e=lookup.get(symbol);return {symbol,name:e.zh||e.name,count,atomicMass:e.atomic_mass,subtotal:e.atomic_mass*count,percent:e.atomic_mass*count/mass*100};});
 return {title:'摩尔质量与分子式',mass,counts:totals,composition,rows:[['分子式',s],['摩尔质量（约）',mass.toFixed(4)+' g/mol'],['相对分子质量（约）',mass.toFixed(4)],['原子总数',Object.values(totals).reduce((a,b)=>a+b,0)],...composition.map(e=>[`${e.symbol} · ${e.name}`,`${e.count} 个 · 原子量 ${e.atomicMass} · 质量贡献 ${e.subtotal.toFixed(4)} g/mol · 质量占比 ${e.percent.toFixed(2)}%`])],note:'按随包 118 元素表的原子量近似求和，非精确同位素质量。相对式量没有单位；以 g/mol 表示的摩尔质量与其数值近似相同。对非分子物质应称相对式量。点号与 * 都按结晶水分隔处理，不作为小数或乘法表达式。'};
}
const amino='A:Ala:丙氨酸 R:Arg:精氨酸 N:Asn:天冬酰胺 D:Asp:天冬氨酸 C:Cys:半胱氨酸 Q:Gln:谷氨酰胺 E:Glu:谷氨酸 G:Gly:甘氨酸 H:His:组氨酸 I:Ile:异亮氨酸 L:Leu:亮氨酸 K:Lys:赖氨酸 M:Met:甲硫氨酸 F:Phe:苯丙氨酸 P:Pro:脯氨酸 S:Ser:丝氨酸 T:Thr:苏氨酸 W:Trp:色氨酸 Y:Tyr:酪氨酸 V:Val:缬氨酸 B:Asx:天冬氨酸或天冬酰胺 Z:Glx:谷氨酸或谷氨酰胺 J:Xle:亮氨酸或异亮氨酸 X:Xaa:未知氨基酸 U:Sec:硒代半胱氨酸 O:Pyl:吡咯赖氨酸 *:Ter:终止'.split(' ').map(s=>s.split(':'));
export const aminoAcids=amino;
export function sequence(p,S){
 if(p.input.length>220000)throw Error('输入过长，最多 100,000 个序列字符。');let lines=p.input.trim().split(/\r?\n/);if(lines.filter(s=>s.startsWith('>')).length>1)throw Error('请一次只输入一条 FASTA 序列。');if(lines.some((s,i)=>i>0&&s.startsWith('>')))throw Error('FASTA 标题必须在第一行。');if(lines[0]?.startsWith('>'))lines.shift();
 let seq=lines.join('').replace(/\s/g,'').toUpperCase();if(!seq)throw Error('请先输入序列。');
 if(p.type==='aa3'){const words=lines.join(' ').trim().split(/[\s,;\-]+/);const map=new Map(amino.map(([a,b])=>[b.toUpperCase(),a]));if(words.some(w=>!map.has(w.toUpperCase())))throw Error('三字母代码请以空格、逗号或短横线分隔，例如 Met Ala Gly。');seq=words.map(w=>map.get(w.toUpperCase())).join('');}
 if(seq.length>100000)throw Error('最多处理 100,000 个序列字符。');const protein=['aa','aa3'].includes(p.type);const allowed=protein?/^[ARNDCQEGHILKMFPSTWYVBZJXUO*]+$/:p.type==='rna'?/^[ACGURYSWKMBDHVNX]+$/:/^[ACGTRYSWKMBDHVNX]+$/;
 if(!allowed.test(seq))throw Error('序列含不支持的字符，请核对类型；数字、缺口和 DNA/RNA 字母混用不会被静默删除。');
 const rows=[['长度',String(seq.length)],['标准化序列',seq]];
 if(protein){rows.push(['三字母代码',seq.split('').map(c=>amino.find(a=>a[0]===c)[1]).join(' ')]);for(const [a,b,n]of amino){const amount=seq.split(a).length-1;if(amount)rows.push([`${a} / ${b} · ${n}`,`${amount}（${(amount/seq.length*100).toFixed(2)}%）`]);}}
 else {rows.push(['互补链（与原链对齐，3′→5′）',S.complement(seq,p.type).compSeq],['反向互补链（5′→3′）',S.reverseComplement(seq,p.type)],['GC 占全部字符比例',(((seq.match(/[GC]/g)||[]).length/seq.length)*100).toFixed(2)+'%'],[p.type==='dna'?'RNA 转写（编码链 T→U）':'DNA 对应（U→T）',p.type==='dna'?seq.replaceAll('T','U'):seq.replaceAll('U','T')]);for(const [direction,s]of [['+',seq],['−',S.reverseComplement(seq,p.type)]])for(let i=0;i<3;i++)rows.push([`阅读框 ${direction}${i+1}`,S.translate(s.slice(i),p.type)]);}
 return {title:protein?'蛋白质序列分析':'核酸序列与六阅读框',rows,note:protein?'只做序列与代码分析，不预测蛋白质三维结构。':'使用标准遗传密码表；* 表示终止，? 表示含模糊碱基的密码子。末尾不足三个碱基不翻译；不会自动选择起始密码子。'};
}
