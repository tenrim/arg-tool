// Read-only projections of the current response. Original records stay in their
// result owner; these bounded views neither translate prose nor fetch details.
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const LIMIT=Object.freeze({text:2400,paragraphs:8,terms:80,rows:80,depth:12});
const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
function plain(value,max=LIMIT.text){
 if(!['string','number','boolean'].includes(typeof value)||typeof value==='number'&&!Number.isFinite(value))return '';
 let text=String(value).replace(/<\s*(script|style)\b[^>]*>[\s\S]*?<\/\s*\1\s*>/gi,'').replace(/<\/?(?:a|br|p|span|div|strong|b|em|i|u|sub|sup|code|pre|table|tr|td|th|ul|ol|li|img|script|style)\b[^>]*>/gi,'').replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(_,entity)=>{
  if(entity[0]!=='#')return entities[entity.toLowerCase()]??_;
  const n=entity[1]?.toLowerCase()==='x'?Number.parseInt(entity.slice(2),16):Number.parseInt(entity.slice(1),10);
  return n>0&&n<=0x10ffff&&!(n>=0xd800&&n<=0xdfff)?String.fromCodePoint(n):'�';
 }).replace(/\r\n?/g,'\n').trim();
 return text.length>max?text.slice(0,max)+'…（节选；完整内容保留在下载文件中）':text;
}
function field(list,label,value){const text=plain(value);if(text!=='')list.push([label,text]);}
function paragraphs(value,max=LIMIT.paragraphs){
 const input=Array.isArray(value)?value:[value],out=[];
 for(const item of input){const text=plain(item);if(text)out.push(text);if(out.length===max)break;}
 if(input.length>max)out.push(`此处展示前 ${max} 条；其余内容可在原文或下载文件查看。`);
 return out;
}
function addText(sections,title,value,max){const lines=paragraphs(value,max);if(lines.length)sections.push({title,paragraphs:lines});}

// OEIS's keyword meanings are defined at https://oeis.org/wiki/Keywords.
// Unknown keywords remain visible, rather than being guessed or discarded.
const keywords=Object.freeze({base:'与所用进制有关',bref:'目前项数很少',cofr:'连分数展开',cons:'常数的数字展开',core:'基础数列',dead:'原站标记为错误或重复',easy:'各项较易生成',eigen:'某种变换的不动数列',fini:'已确认有限',frac:'有理数序列的分子或分母',full:'已列出完整有限序列',hard:'下一项尚未知',more:'需要更多项',mult:'积性数列',nonn:'当前展示项均非负',sign:'含负数',tabf:'不规则数组逐行展开',tabl:'规则数组逐行展开',unkn:'定义或背景未知',walk:'路径计数',word:'与某种语言的词语有关'});
function oeis(record){
 const sections=[],number=Number.isSafeInteger(record.number)&&record.number>0?'A'+String(record.number).padStart(6,'0'):'';
 const name=plain(record.name),terms=typeof record.data==='string'?record.data.split(',').map(x=>x.trim()).filter(Boolean):[];
 if(terms.length){const shown=terms.slice(0,LIMIT.terms);sections.push({title:'数列项',paragraphs:[plain(shown.join(', '),6000),...(terms.length>shown.length?[`当前记录返回 ${terms.length} 项，此处展示前 ${shown.length} 项；完整项值保留在下载文件中。`]:[])]});}
 const fields=[];field(fields,'起始索引与辅助偏移（OEIS 原值）',record.offset);
 if(typeof record.keyword==='string'){const words=record.keyword.split(',').map(value=>value.trim()).filter(Boolean).slice(0,40);field(fields,'原站标签',words.map(value=>Object.hasOwn(keywords,value)?`${value} · ${keywords[value]}`:value).join('；'));}
 if(fields.length)sections.push({title:'数列信息',fields});
 addText(sections,'公式／递推关系（原文）',record.formula,6);
 addText(sections,'计算示例（原文）',record.example,12);
 addText(sections,'说明与数学含义（原文）',record.comment,6);
 addText(sections,'相关数列（原文）',record.xref,6);
 // Keep consecutive source lines together: a program's first line is often only
 // its language name. This is a literal excerpt, never executable UI markup.
 for(const [key,label]of [['program','程序示例（原文）'],['maple','Maple 示例（原文）'],['mathematica','Mathematica 示例（原文）']]){
  const values=Array.isArray(record[key])?record[key]:[record[key]],lines=values.slice(0,18).map(value=>plain(value)).filter(Boolean);
  if(lines.length)sections.push({title:label,paragraphs:[plain(lines.join('\n'),6000),...(values.length>18?['此处展示程序前 18 行；完整示例见原文或下载文件。']:[])]});
 }
 addText(sections,'参考文献（原文）',record.reference,4);
 addText(sections,'参考链接说明（原文）',record.link,4);
 const credits=[];field(credits,'贡献者（原文）',Array.isArray(record.author)?record.author.join('；'):record.author??(Array.isArray(record.authors)?record.authors.join('；'):record.authors));
 if(credits.length)sections.push({title:'记录信息',fields:credits});
 for(const entry of sections)if(/程序|Maple|Mathematica|参考|记录信息/.test(entry.title))entry.collapsed=true;
 return {title:[number,name].filter(Boolean).join(' · '),summary:name,sections};
}

const placeFields=Object.freeze([
 ['standard_name','标准名称'],['roman_alphabet_spelling','罗马字母拼写'],['old_name','历史地名'],['ethnic_minorities_writing','少数民族语书写'],['place_type','地名类别'],['place_type_code','地名类别代码'],['place_code','地名代码'],['province_name','省级政区名称'],['city_name','市级政区名称'],['area_name','区县级政区名称'],['province','省级行政代码'],['city','市级行政代码'],['area','区县级行政代码'],['year','资料年版']
]);
const historyFields=Object.freeze([['place_meaning','地名含义'],['place_origin','地名来历'],['place_history','地名历史沿革'],['government_history','政区历史沿革']]);
function geometrySection(geometry){
 if(!object(geometry)||!Array.isArray(geometry.coordinates))return null;
 const rows=[],seen=new Set(),stack=[{value:geometry.coordinates,path:'1',depth:0}];let limited=false;
 while(stack.length&&rows.length<32){const {value,path,depth}=stack.pop();if(!Array.isArray(value)||seen.has(value))continue;seen.add(value);
  if(value.length>=2&&typeof value[0]==='number'&&Number.isFinite(value[0])&&typeof value[1]==='number'&&Number.isFinite(value[1]))rows.push([path,String(value[0]),String(value[1])]);
  else if(depth<LIMIT.depth){if(value.length>80)limited=true;for(let i=Math.min(value.length,80)-1;i>=0;i--)stack.push({value:value[i],path:path+'.'+(i+1),depth:depth+1});}
  else limited=true;
 }
 limited||=stack.length>0;
 if(!rows.length)return null;
 return {title:'空间位置（CGCS2000）',fields:[['几何类型',plain(geometry.type)||'原站未标明']],table:{columns:['坐标节点','经度（度）','纬度（度）'],rows},paragraphs:[...(limited?['坐标较多，此处只展示前 32 个节点；完整几何保留在下载文件中。']:[])]};
}
function divisionSection(row){
 const rows=[],seen=new Set(),stack=[{value:row,path:[],depth:0}];let limited=false;
 while(stack.length&&rows.length<LIMIT.rows){const {value,path,depth}=stack.pop();if(!object(value)||seen.has(value))continue;seen.add(value);
  const name=plain(value.name)||'未命名区划',next=[...path,name];rows.push([next.join(' → '),plain(value.code),plain(value.type),plain(value.level)]);
  const children=Array.isArray(value.children)?value.children:[];
  if(depth<LIMIT.depth)for(let i=Math.min(children.length,LIMIT.rows)-1;i>=0;i--)stack.push({value:children[i],path:next,depth:depth+1});
  else if(children.length)limited=true;
  if(children.length>LIMIT.rows)limited=true;
 }
 limited||=stack.length>0;
 return {title:'行政区划层级',table:{columns:['区划路径','行政区划代码','区划单位','原站级别'],rows},paragraphs:[...(limited?[`此处最多展示 ${LIMIT.rows} 个区划节点；完整返回层级保留在下载文件中。`]:[])]};
}
function places(record,result){
 const row=object(record.fields)?record.fields:record,mode=object(result?.parameters)?result.parameters.mode:'search',sections=[];
 if(mode==='divisions'){
  sections.push(divisionSection(row));return {title:plain(row.name)||plain(record.title),sections};
 }
 if(['same-name-region','same-name-type','same-pinyin-region','same-pinyin-type'].includes(mode)){
  const byType=mode.endsWith('-type'),label=byType?'地名类别':'行政区划',name=plain(byType?row.type:row.name),code=plain(byType?row.typeCode:row.code);
  const count=plain(row.count),fields=[];field(fields,mode.includes('pinyin')?'检索拼写':'检索地名',result?.parameters?.name);field(fields,'统计范围行政区划代码',result?.parameters?.distCode);
  if(fields.length)sections.push({title:'统计条件',fields});
  sections.push({title:mode.includes('pinyin')?'同音地名分布':'同名地名分布',table:{columns:[label,label+'代码','地名数量'],rows:[[name||'原站未标明',code,count||'原站未提供']]}});
  return {title:name||plain(record.title),summary:count!==''?`地名数量：${count}`:'',sections};
 }
 const fields=[];for(const [key,label]of placeFields)field(fields,label,row[key]);
 if(fields.length)sections.push({title:'地名基本信息',fields});
 for(const [key,title]of historyFields)addText(sections,title,row[key],4);
 const geometry=geometrySection(row.gdm);if(geometry)sections.push(geometry);
 return {title:plain(row.standard_name)||plain(record.title),summary:[row.province_name,row.city_name,row.area_name,row.place_type].map(value=>plain(value)).filter(Boolean).join(' · '),sections};
}

/** Selected readable data only. No source fields or response objects are mutated. */
export function referenceReading(provider,record,result){
 if(provider!=='oeis'&&provider!=='placenames')return null;
 if(!object(record))return {sections:[]};
 return provider==='oeis'?oeis(record):places(record,result);
}
