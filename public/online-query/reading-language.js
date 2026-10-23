// Read-only projections of fields already returned by the fixed language adapters.
// The Wiki subset is intentionally not a renderer: unsupported templates are omitted,
// no transclusion, HTML, URL or media is evaluated, and raw records are never changed.
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const text=value=>typeof value==='string'?value:typeof value==='number'?String(value):object(value)&&typeof value.Content==='string'?value.Content:'';
const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',ensp:' ',emsp:' ',thinsp:' ',mdash:'—',ndash:'–',hellip:'…',middot:'·'};
function decode(value){return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi,(all,key)=>{if(key[0]!=='#')return entities[key]??all;const hex=key[1].toLowerCase()==='x',cp=Number.parseInt(key.slice(hex?2:1),hex?16:10);return cp>0&&cp<=0x10ffff&&!(cp>=0xd800&&cp<=0xdfff)?String.fromCodePoint(cp):'�';});}
function plain(value){return decode(text(value).replace(/\r\n?/g,'\n').replace(/<!--[^]*?(?:-->|$)/g,'').replace(/<(script|style|iframe|svg|template)\b[^>]*>[^]*?<\/\1\s*>/gi,'').replace(/<ref\b[^>]*>[^]*?<\/ref\s*>/gi,'').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<\/?(?:p|div|li|tr|h[1-6])\b[^>]*>/gi,'\n').replace(/<[^>]*>/g,'')).replace(/[\t \u00a0]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim();}
const fields=items=>items.map(([label,value])=>[label,plain(value)]).filter(([,value])=>value!=='');
const list=value=>Array.isArray(value)?value.map(plain).filter(Boolean).join('、'):plain(value);
const section=(title,items=[],paragraphs=[])=>({title,...(items.length?{fields:items}:{}),...(paragraphs.length?{paragraphs}: {})});

function zdicReading(record){
 const data=record.fields??{},metadata=plain(data.metadata),lines=metadata.split(/\n+/).map(line=>line.trim()).filter(Boolean),items=[];
 // Labels are copied from the source card rather than inferred from Unicode.
 const labels=['拼音','注音','部首','部外笔画','部外','總筆畫','总笔画','笔顺','筆順','五笔','五筆','仓颉','倉頡','郑码','鄭碼','四角','字形结构','字形結構','字形分析','统一码','統一碼'];
 const labelPattern=new RegExp(labels.sort((a,b)=>b.length-a.length).join('|'),'g');
 for(const line of lines){const matches=[...line.matchAll(labelPattern)];for(let index=0;index<matches.length;index++){const match=matches[index],value=line.slice(match.index+match[0].length,matches[index+1]?.index??line.length).replace(/^\s*[:：]?\s*/,'').trim();if(value)items.push([match[0],value]);}}
 const variantIndex=lines.indexOf('异体');if(variantIndex>=0&&lines.length>variantIndex+1)items.push(['异体',lines.slice(variantIndex+1).join(' ')]);
 const sections=[section('读音与字形',items,items.length?[]:metadata?[metadata]:[])];
 let primaryMeaning=false;
 for(const entry of Array.isArray(data.sections)?data.sections:[]){let value=plain(entry.text),heading=plain(entry.title);const prefix=[data.headword,heading].map(text).filter(Boolean).join(' ');if(value.startsWith(prefix))value=value.slice(prefix.length).trim();value=value.replace(/(?:\n|^)反馈\s*$/,'').trim();if(value&&!/^内容登录会员可见\s*(?:维基词典)?$/.test(value)){const primary=!primaryMeaning&&/(?:基本|词语|詞語|简明|簡明|释义|釋義|成语|成語)/.test(heading);if(primary)primaryMeaning=true;sections.push({...section(heading||'字词解释',[],[value]),...(!primary?{collapsed:true}:{})});}}
 return {title:plain(data.headword)||record.title,summary:plain(data.description)||record.summary,sections:sections.filter(s=>s.fields?.length||s.paragraphs?.length)};
}

function clauseText(value,type=''){
 if(!Array.isArray(value))return plain(value);
 // Clauses are punctuation fragments, not display lines. Keep complete verse
 // sentences together; prose flows as paragraphs. Explicit stanza breaks win.
 const prose=/[赋賦文]|散文|骈|駢/.test(plain(type));
 let output='';
 for(const item of value){const content=plain(item);if(!content)continue;output+=content;
  if(item?.BreakAfter===true||item?.BreakAfter===1)output+='\n\n';
  else if(!prose&&/[。！？!?][”」』）)]?$/.test(content))output+='\n';
 }
 return output.trim();
}
function commentText(value){if(object(value))return commentText([value]);if(!Array.isArray(value))return plain(value);return value.map(item=>{if(typeof item==='string')return plain(item);if(!object(item))return '';const content=plain(item.Content);return [plain(item.FullPath||item.Book),content].filter(Boolean).join('：');}).filter(Boolean).join('\n\n');}
function clauseComments(clauses){return (Array.isArray(clauses)?clauses:[]).flatMap(clause=>(Array.isArray(clause.Comments)?clause.Comments:[]).map(comment=>{if(comment.Type==='WordDictInJson'){try{const word=JSON.parse(comment.Content);return [plain(word.Text),plain(word.Spells),...(Array.isArray(word.Explains)?word.Explains.map(plain):[])].filter(Boolean).join('\n');}catch{return '';}}return plain(comment.Content);})).filter(Boolean);}
function writingSections(row){
 const info=fields([['作者',row.Author||row.Name],['朝代',row.Dynasty],['作者生卒',row.Life],['体裁',row.Type],['写作时间',row.AuthorDate],['韵部',row.Rhyme],['副题',row.SubTitle],['出处',list(row.Froms)]]),out=[];
 if(info.length)out.push(section('作品资料',info));
 const preface=clauseText(row.Preface,'文');if(preface)out.push(section('序',[],[preface]));
 const clauses=clauseText(row.Clauses,row.Type);if(clauses)out.push(section('正文',[],[clauses]));
 const note=clauseText(row.Note,'文');if(note)out.push({...section('原注',[],[note]),collapsed:true});
 const comments=commentText(row.Comments);if(comments)out.push({...section('评注与出处',[],[comments]),collapsed:true});
 const annotations=clauseComments(row.Clauses);if(annotations.length)out.push({...section('句内注释',[],annotations),collapsed:true});
 // Search may return a dynasty/author group instead of an individual writing.
 if(Array.isArray(row.Authors)){const rows=row.Authors.map(author=>[plain(author.Name||author.Author),plain(author.Life),plain(author.WritingCount??author.Count)]);if(rows.length)out.push({title:'作者',table:{columns:['作者','生卒','作品数'],rows}});}
 if(Array.isArray(row.Writings)){for(const writing of row.Writings)out.push(section(plain(writing.Title)||'作品',fields([['作者',writing.Author],['朝代',writing.Dynasty]]),[clauseText(writing.Clauses,writing.Type)].filter(Boolean)));}
 return out;
}
function formatSections(format,index){
 if(!object(format))return [];
 const out=[],info=fields([['格律',format.Desc],['例词作者',format.SampleAuthor],['领字位置',Array.isArray(format.LeadingChars)?format.LeadingChars.join('、'):'']]);
 const paragraphs=[plain(format.Definition),plain(format.SampleContent)].filter(Boolean);out.push(section(`谱式 ${Number.isSafeInteger(format.FormatIndex)?format.FormatIndex+1:index+1}`,info,paragraphs));
 // FormatHtml carries the original word breaks; strip tags rather than render it.
 const arranged=plain(format.FormatHtml);if(arranged)out.push(section('例词与平仄对照',[],[arranged]));
 const comment=plain(format.Comment);if(comment)out.push(section('谱式说明',[],[comment]));return out;
}
function cnkReading(record,result){
 const row=record.fields??{},mode=result?.parameters?.mode||'search',sections=[];
 if(mode==='rhyme'){
  const rows=(Array.isArray(row.Chars)?row.Chars:[]).map(char=>[plain(char.Char),plain(char.Comment),plain(char.Sames)]);
  sections.push(section('韵目资料',fields([['韵书',result?.raw?.Book||result?.parameters?.book],['韵目',row.Name],['声调',row.Tone],['字数',rows.length]])));
  if(rows.length)sections.push({title:'韵目字表',table:{columns:['字','原注','另见韵目'],rows}});
 }else if(['tune-search','tune-detail','tune-pattern'].includes(mode)){
  const tune=mode==='tune-pattern'?row.Tune??{}:row;
  sections.push(section('词牌资料',fields([['别名',list(tune.Aliases)],['作品数',tune.WritingCount]]),[plain(tune.Desc)].filter(Boolean)));
  const formats=Array.isArray(tune.Formats)?tune.Formats:object(tune.Format)?[tune.Format]:[];formats.forEach((format,index)=>sections.push(...formatSections(format,index)));
 }else sections.push(...writingSections(row));
 return {title:plain(row.Title)||plain(row.Tune?.Name)||plain(row.Name)||record.title,summary:record.summary,sections:sections.filter(s=>s.fields?.length||s.paragraphs?.length||s.table?.rows.length)};
}

// Split only at template/link top level; a nested template may itself contain '|'.
function splitWiki(value,delimiter='|'){
 const parts=[];let braces=0,links=0,start=0;
 for(let i=0;i<value.length;i++){const pair=value.slice(i,i+2);if(pair==='{{'){braces++;i++;}else if(pair==='}}'&&braces){braces--;i++;}else if(pair==='[['){links++;i++;}else if(pair===']]'&&links){links--;i++;}else if(value[i]===delimiter&&!braces&&!links){parts.push(value.slice(start,i));start=i+1;}}
 parts.push(value.slice(start));return parts;
}
function templateEnd(source,start){let depth=1;for(let i=start+2;i<source.length-1;i++){const pair=source.slice(i,i+2);if(pair==='{{'){if(++depth>32)return -1;i++;}else if(pair==='}}'){if(!--depth)return i+2;i++;}}return -1;}
function templateParts(source){const parts=splitWiki(source),name=parts.shift().trim(),params={},positional=[];for(const part of parts){const equal=splitWiki(part,'=');if(equal.length>1){const key=equal.shift().trim();if(key.length<100&&key!=='__proto__'&&key!=='constructor'&&key!=='prototype')params[key]=equal.join('=').trim();}else positional.push(part.trim());}return {name,params,positional};}
function topTemplates(source){const out=[];for(let cursor=0;cursor<source.length&&out.length<2048;){const start=source.indexOf('{{',cursor);if(start<0)break;const end=templateEnd(source,start);if(end<0)break;out.push({start,end,...templateParts(source.slice(start+2,end-2))});cursor=end;}return out;}
function replaceTemplates(source,depth){let out='',cursor=0;for(const template of topTemplates(source)){out+=source.slice(cursor,template.start);const name=template.name.toLowerCase(),p=template.positional;let value='';if(['n','type','a','m','i','t','p','an','tc','rf','r','b','能力','特性','属性','屬性'].includes(name))value=p[0]||'';else if(name==='lang'||name==='langtt')value=p[1]||'';else if(['wp','w','tt'].includes(name))value=p.at(-1)||'';else if(name==='ruby')value=p[0]||'';if(value&&depth<8)out+=wikiPlain(value,depth+1);cursor=template.end;}return out+source.slice(cursor);}
function replaceLinks(source){let out='',cursor=0;while(cursor<source.length){const start=source.indexOf('[[',cursor);if(start<0){out+=source.slice(cursor);break;}out+=source.slice(cursor,start);let depth=1,end=start+2;for(;end<source.length-1;end++){const pair=source.slice(end,end+2);if(pair==='[['){depth++;end++;}else if(pair===']]'){if(!--depth)break;end++;}}if(depth){out+=source.slice(start);break;}const parts=splitWiki(source.slice(start+2,end)),target=parts[0].trim();if(!/^(?:file|image|category|文件|檔案|图像|圖像|分类|分類|[a-z]{2,3}):/i.test(target))out+=parts.at(-1).replace(/#.*/,'');cursor=end+2;}return out;}
function wikiPlain(value,depth=0){const source=text(value).replace(/<!--[^]*?(?:-->|$)/g,'').replace(/<ref\b[^>]*>[^]*?<\/ref\s*>/gi,'').replace(/\{\|[^]*?\|\}/g,'');return plain(replaceLinks(replaceTemplates(source,depth)).replace(/\[https?:\/\/[^\s\]]+(?:\s+([^\]]+))?\]/g,(_,label)=>label||'').replace(/'{2,5}/g,'').replace(/^={2,6}\s*(.*?)\s*={2,6}\s*$/gm,'$1'));}
function wikiFields(params,mapping){return mapping.map(([label,...keys])=>{const value=keys.map(key=>params[key]).find(value=>value!==undefined&&wikiPlain(value));return [label,wikiPlain(value)];}).filter(([,value])=>value);}
const baseWikiFields=[['中文名','name','中文名','名称','名稱'],['日文名','jname','namej','ja','日文名'],['英文名','enname','ename','namee','en','英文名'],['全国图鉴编号','ndex','全国图鉴编号','全國圖鑑編號'],['分类（原词条）','species','category','分类','分類'],['属性','type1','type','属性','屬性'],['第二属性','type2'],['特性','ability1','ability'],['第二特性','ability2'],['隐藏特性','abilityd','隐藏特性','隱藏特性'],['身高（m）','height','身高'],['体重（kg）','weight','体重','體重'],['蛋群','egggroup1'],['第二蛋群','egggroup2'],['身体颜色','color'],['捕获率','catchrate'],['地区','region','地区','地區'],['位置','location','位置'],['种类','pocket','kind','种类','種類'],['效果','effect','效果'],['首次登场','generation','debut','首次登场','首次登場']];
function wikiReading(record){
 const revision=record.fields?.revisions?.[0],slot=revision?.slots?.main,original=text(slot?.content);if(!original)return {title:record.title,summary:'原站未提供可摘读的正文；请查看原文。',sections:[]};
 // UI extraction is bounded independently of the complete raw record and note export.
 const source=original.slice(0,524288),templates=topTemplates(source),box=templates.find(t=>/(?:信息框|訊息框|infobox|基本资料|基本資料)/i.test(t.name)),sections=[],formSections=[];
 if(box){const info=wikiFields(box.params,baseWikiFields);if(info.length)sections.push(section('基本资料',info));
  const forms=Object.keys(box.params).filter(key=>/^form\d+$/.test(key)&&key!=='form1').map(key=>key.slice(4)).sort((a,b)=>Number(a)-Number(b));
  for(const form of forms){const mapping=[['属性',`type1-${form}`,`type1${form}`],['第二属性',`type2-${form}`,`type2${form}`],['特性',`ability1-${form}`,`ability1${form}`],['第二特性',`ability2-${form}`,`ability2${form}`],['隐藏特性',`abilityd${form}`,`abilityd-${form}`],['身高（m）',`height${form}`],['体重（kg）',`weight${form}`]];const info=wikiFields(box.params,mapping);if(info.length)formSections.push({...section(wikiPlain(box.params[`form${form}`])||`形态 ${form}`,info),collapsed:true});}
 }
 const firstHeading=source.search(/^==[^=]/m),leadSource=firstHeading<0?source:source.slice(0,firstHeading),lead=wikiPlain(leadSource).split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean).slice(0,3).join('\n\n'),intro=lead.slice(0,1800);
 if(intro)sections.push(section('词条导语',[],[intro]));
 // A recognized first overview/description paragraph is useful when the lead is short.
 const overview=/^==\s*(?:概述|介绍|介紹|说明|說明|效果|地理|概要)\s*==\s*\n([^]*?)(?=^==|$(?![^]))/m.exec(source);
 if(overview){const paragraph=wikiPlain(overview[1]).split(/\n\s*\n/).map(p=>p.trim()).find(Boolean);if(paragraph)sections.push(section('内容摘读',[],[paragraph.slice(0,1800)]));}
 sections.push(...formSections);
 if(!sections.length)sections.push(section('正文说明',[],['该词条未包含可可靠识别的基本资料或导语，请通过原文链接查看完整内容；原始返回仍完整保留。']));
 return {title:record.title,summary:intro||'从本次词条原文摘取基本资料；复杂模板与完整内容请查看原站。',sections};
}

export function languageReading(provider,record,result){
 if(provider==='zdic')return zdicReading(record);
 if(provider==='cnkgraph')return cnkReading(record,result);
 if(provider==='pokewiki')return wikiReading(record);
 return null;
}
