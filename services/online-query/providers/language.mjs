// Fixed public read-only sources. HTML is converted to text, never executed;
// no image, audio, login, private search or robots-disallowed API is requested.
const fail=(status,code,message)=>Object.assign(new Error(message),{status,code});
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
const safeKeys=(input,keys)=>{if(!object(input)||Object.keys(input).some(key=>!keys.includes(key)))throw fail(400,'INVALID_QUERY','查询包含不支持的条件。');};
function string(value,name,max=200,{optional=false}={}){if(optional&&(value===undefined||value===''))return undefined;if(typeof value!=='string'||!value.trim()||value.length>max||/\p{Cc}/u.test(value))throw fail(400,'INVALID_QUERY',`${name}不能为空、过长或包含控制字符。`);return value.trim();}
function integer(value,name,min,max,fallback){const v=value===undefined||value===''?fallback:value;if(!Number.isSafeInteger(v)||v<min||v>max)throw fail(400,'INVALID_QUERY',`${name}须为 ${min}–${max} 的整数。`);return v;}
const boolean=(v,name)=>{if(v!==undefined&&typeof v!=='boolean')throw fail(400,'INVALID_QUERY',`${name}须为布尔值。`);return v??false;};
function modeOf(input){const mode=input.mode??'search';if(!['search','detail'].includes(mode))throw fail(400,'INVALID_MODE','请选择已登记的查询方式。');return mode;}
const time=ctx=>new Date(ctx.now()).toISOString();
const validType=(response,type)=>type.test(response.headers.get('content-type')||'');
function jsonResponse(response,text,name,allowArray=false){if(response.status!==200)throw fail(502,'UPSTREAM_UNAVAILABLE',`${name}暂时无法查询，请稍后重试或前往原站。`);if(!validType(response,/application\/(?:[\w.-]+\+)?json(?:;|$)/i))throw fail(502,'INVALID_UPSTREAM_RESPONSE',`${name}未返回 JSON 数据。`);let data;try{data=JSON.parse(text);}catch{throw fail(502,'INVALID_UPSTREAM_RESPONSE',`${name}返回格式已变更。`);}if(!object(data)&&!(allowArray&&Array.isArray(data)))throw fail(502,'INVALID_UPSTREAM_RESPONSE',`${name}返回格式已变更。`);return data;}

const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',ensp:' ',emsp:' ',thinsp:' ',ndash:'–',mdash:'—',lsquo:'‘',rsquo:'’',ldquo:'“',rdquo:'”',hellip:'…',middot:'·',times:'×',copy:'©'};
function decode(value){return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi,(original,key)=>{if(key[0]!=='#')return Object.hasOwn(entities,key)?entities[key]:original;const cp=Number.parseInt(key.slice(key[1].toLowerCase()==='x'?2:1),key[1].toLowerCase()==='x'?16:10);return cp>0&&cp<=0x10ffff&&!(cp>=0xd800&&cp<=0xdfff)?String.fromCodePoint(cp):'�';});}
// This deliberately small tokenizer supports only extraction, not HTML rendering.
// Quoted '>' is handled, active/irrelevant subtrees are discarded, unknown tags
// keep their text. Bounded source bytes are owned by the service transport.
function textTree(source){
 const html=source.replace(/<!--[\s\S]*?(?:-->|$)/g,'').replace(/<(script|style|noscript|template|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
 const root={tag:'root',attrs:{},children:[]},stack=[root];let previous=0,nodes=0;
 for(const token of html.matchAll(/<\/?[a-zA-Z][a-zA-Z\d:-]*(?:\s+(?:"[^"]*"|'[^']*'|[^'">])*)?\s*\/?>/g)){
  const between=html.slice(previous,token.index);if(between)stack.at(-1).children.push(decode(between));previous=token.index+token[0].length;
  const tag=/^<\/?([\w:-]+)/.exec(token[0])[1].toLowerCase();
  if(token[0][1]==='/'){let i=stack.length-1;while(i>0&&stack[i].tag!==tag)i--;if(i>0)stack.length=i;continue;}
  if(++nodes>100000||stack.length>256)throw fail(502,'INVALID_UPSTREAM_RESPONSE','汉典页面结构过于复杂，请前往原站。');
  const attrs={};for(const a of token[0].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g))attrs[a[1].toLowerCase()]=decode(a[2]??a[3]??a[4]);
  const node={tag,attrs,children:[]};stack.at(-1).children.push(node);if(!['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'].includes(tag)&&!token[0].endsWith('/>'))stack.push(node);
 }
 if(previous<html.length)stack.at(-1).children.push(decode(html.slice(previous)));return root;
}
const hasClass=(node,name)=>(node.attrs?.class||'').split(/\s+/).includes(name);
function findNodes(node,predicate,out=[]){if(typeof node==='string')return out;if(predicate(node))out.push(node);for(const child of node.children)findNodes(child,predicate,out);return out;}
function plain(node){
 if(typeof node==='string')return node;
 if(['script','style','noscript','svg','template','nav','form','button','aside','iframe'].includes(node.tag)||hasClass(node,'adsbygoogle')||hasClass(node,'ad-wrapper'))return '';
 if(node.tag==='img')return node.attrs.alt?`[${node.attrs.alt}]`:'';
 const line=['br','p','div','section','article','header','footer','li','tr','h1','h2','h3','h4','blockquote','pre','figure'].includes(node.tag)?'\n':'';
 return line+node.children.map(plain).join('')+line;
}
const clean=node=>plain(node).replace(/[\t \u00a0]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim();
export function parseZdicEntry(html,query){
 const root=textTree(html),main=findNodes(root,n=>n.tag==='main'&&n.attrs.id==='main-content');
 if(main.length!==1)throw fail(502,'INVALID_UPSTREAM_RESPONSE','汉典未返回可读取的公开词条，可能正在验证访问或页面结构已变更。');
 const cards=findNodes(main[0],n=>n.tag==='article'&&hasClass(n,'char-card')),sections=findNodes(main[0],n=>n.tag==='section'&&hasClass(n,'dict-section'));
 if(cards.length!==1||!sections.length)throw fail(502,'INVALID_UPSTREAM_RESPONSE','汉典未返回完整公开词条；动态搜索、登录与验证页面不作为词条结果。');
 const titleNode=findNodes(root,n=>n.tag==='title')[0],title=titleNode?clean(titleNode).replace(/\s*-\s*汉典\s*$/,''):query;
 const cardText=clean(cards[0]),entries=sections.map(section=>({id:section.attrs.id||'',title:section.attrs['data-section']||clean(findNodes(section,n=>n.tag==='h2')[0]||section),text:clean(section)}));
 if(!cardText.includes(query)||!entries.some(section=>section.text.length>section.title.length+query.length))throw fail(502,'INVALID_UPSTREAM_RESPONSE','汉典返回的公开词条与输入不符或没有正文。');
 const meta=findNodes(root,n=>n.tag==='meta'&&n.attrs.name==='description')[0];
 return {title,description:meta?.attrs.content||'',headword:query,metadata:cardText,sections:entries,scope:'汉典公开词条文字（非官方 API）；不含动态检索、会员内容和图片音频。'};
}
const zdicAttribution={name:'汉典',credit:'汉典及词条所列原始字书、词书来源',license:'CC0 1.0；仅公开字词文字，原书出处随分节保留。',licenseURL:'https://creativecommons.org/publicdomain/zero/1.0/',termsURL:'https://zdic.net/terms/'};
function validateZdic(input){safeKeys(input,['mode','query']);const mode=modeOf(input),query=string(input.query,'字词',80);if(!/^[\p{L}\p{M}\p{N}·・〇]+$/u.test(query))throw fail(400,'INVALID_QUERY','请输入具体汉字、词语或成语；这里读取公开词条，不是全站关键词搜索。');return {mode,query};}
async function executeZdic(parameters,ctx){
 const p=validateZdic(parameters),url=new URL('https://zdic.net/hans/'+encodeURIComponent(p.query)),{response,text}=await ctx.request(url,{headers:{Accept:'text/html'}});
 if(response.status===404)return {provider:'zdic',query:p.query,parameters:p,records:[],total:0,next:null,attribution:zdicAttribution,fetchedAt:time(ctx),sourceURL:url.href};
 if(response.status!==200||!validType(response,/text\/html(?:;|$)/i))throw fail(502,'UPSTREAM_UNAVAILABLE','汉典公开词条暂时无法读取，请前往原站查询。');
 const fields=parseZdicEntry(text,p.query);return {provider:'zdic',query:p.query,parameters:p,records:[{id:p.query,title:fields.title,summary:fields.description,fields,sourceURL:url.href}],total:1,next:null,attribution:zdicAttribution,fetchedAt:time(ctx),sourceURL:url.href};
}

const dynasties=['先秦','秦朝','汉朝','魏晋','南北朝','隋朝','唐朝','宋朝','金朝','辽朝','元朝','明朝','清朝','近现代','当代'];
const cnkAttribution={name:'搜韵 / CNKGraph 古典文献知识图谱',credit:'苏州图谱信息技术有限公司、作品作者及数据所列原始文献来源',license:'官方开放 Web API，仅限非商业研究、学习；未声明全部内容为统一开放版权许可。',termsURL:'https://cnkgraph.com/Home/OpenResources'};
function validateCnk(input){
 safeKeys(input,['mode','query','id','page','author','dynasty','exact','book']);const mode=input.mode??'search';if(!['search','detail','tune-search','tune-detail','tune-pattern','rhyme'].includes(mode))throw fail(400,'INVALID_MODE','请选择已登记的搜韵查询方式。');
 if(mode==='detail'||mode==='tune-detail'){if(Object.keys(input).some(key=>!['mode','query','id'].includes(key))||input.id!==undefined&&input.query!==undefined)throw fail(400,'INVALID_QUERY','详情只接受一个编号。');const raw=input.id??input.query,id=typeof raw==='string'&&/^\d{1,12}$/.test(raw)?Number(raw):raw;return {mode,id:integer(id,'编号',1,999999999999)};}
 if(mode==='tune-search'||mode==='tune-pattern'){safeKeys(input,['mode','query']);return {mode,query:string(input.query,mode==='tune-search'?'词牌关键词':'词句或平仄模式',mode==='tune-search'?80:200)};}
 if(mode==='rhyme'){safeKeys(input,['mode','query','book']);const query=string(input.query,'韵目',30),book=string(input.book??'平水韵','韵书',30);if(!/^[\p{L}\p{N}]+$/u.test(query)||!/^[\p{L}\p{N}]+$/u.test(book))throw fail(400,'INVALID_QUERY','请输入具体韵书和韵目名称，不能包含路径或标点。');return {mode,query,book};}
 if(input.book!==undefined)throw fail(400,'INVALID_QUERY','诗文搜索不接受韵书条件。');
 if(input.id!==undefined)throw fail(400,'INVALID_QUERY','搜索不接受作品编号；请切换作品详情。');
 const query=string(input.query,'关键词',200,{optional:true}),author=string(input.author,'作者',80,{optional:true}),page=integer(input.page,'页码',0,500,0),exact=boolean(input.exact,'精确匹配');
 const dynasty=string(input.dynasty,'朝代',10,{optional:true});if(dynasty&&!dynasties.includes(dynasty))throw fail(400,'INVALID_QUERY','请选择官方支持的朝代。');
 if(!query&&!author)throw fail(400,'INVALID_QUERY','请填写诗文关键词或作者。');return {mode,...(query?{query}:{}),...(author?{author}:{}),...(dynasty?{dynasty}:{}),page,exact};
}
const contentTitle=value=>typeof value==='string'?value:object(value)&&typeof value.Content==='string'?value.Content:'';
async function executeCnk(parameters,ctx){
 const p=validateCnk(parameters);if(['tune-search','tune-detail','tune-pattern','rhyme'].includes(p.mode))return executeCnkTune(p,ctx);
 const url=new URL(p.mode==='detail'?`https://open.cnkgraph.com/api/Writing/${p.id}`:'https://open.cnkgraph.com/api/Writing/Find');
 const options={headers:{Accept:'application/json','Accept-Language':'zh-hant'}};
 if(p.mode==='search'){options.method='POST';options.headers['Content-Type']='application/json';options.body=JSON.stringify({key:p.query||'',author:p.author||'',...(p.dynasty?{dynasty:p.dynasty}:{}),exactlyMatch:p.exact,showMatchedClauseOnly:false,pageNo:p.page});}
 const {response,text}=await ctx.request(url,options),body=jsonResponse(response,text,'搜韵 / CNKGraph');
 let rows=[],total=null,pageSize=20,pageNo=p.page||0;
 if(p.mode==='detail'){if(body.Writing===null||Object.keys(body).length===0)rows=[];else if(object(body.Writing))rows=[body.Writing];else throw fail(502,'INVALID_UPSTREAM_RESPONSE','搜韵作品详情格式已变更。');total=rows.length;}
 else if(Array.isArray(body.Writings)){rows=body.Writings;total=body.WritingCount??body.WrtingCount??null;pageSize=body.PageSize??20;pageNo=body.PageNo??p.page;}
 else if(object(body.AuthorWritings)&&Array.isArray(body.AuthorWritings.Writings)){rows=body.AuthorWritings.Writings;total=body.AuthorWritings.WritingCount??null;pageSize=body.AuthorWritings.PageSize??20;pageNo=body.AuthorWritings.PageNo??p.page;}
 else if(Array.isArray(body.Dynasties)){rows=body.Dynasties;}
 else if(body.Writings===null||body.AuthorWritings===null&&body.Dynasties===null){rows=[];total=0;}
 else throw fail(502,'INVALID_UPSTREAM_RESPONSE','搜韵搜索结果格式已变更。');
 if(rows.length>1000||rows.some(row=>!object(row))||total!==null&&(!Number.isSafeInteger(total)||total<0)||!Number.isSafeInteger(pageSize)||pageSize<1||!Number.isSafeInteger(pageNo)||pageNo<0)throw fail(502,'INVALID_UPSTREAM_RESPONSE','搜韵搜索分页格式已变更。');
 const records=rows.map((row,index)=>{const id=Number.isSafeInteger(row.Id)&&row.Id>0?row.Id:null;return {id:String(id??`author-group-${index}`),title:contentTitle(row.Title)||row.Name||'作者分组',summary:[row.Dynasty,row.Author,row.Type].filter(Boolean).join(' · '),fields:row,sourceURL:id?`https://cnkgraph.com/Writing/${id}`:url.href,...(id&&p.mode==='search'?{actions:[{label:'查询完整作品',parameters:{mode:'detail',id}}]}:{})};});
 return {provider:'cnkgraph',query:p.mode==='detail'?`作品 ${p.id}`:[p.query,p.author,p.dynasty].filter(Boolean).join(' · '),parameters:p,records,total,next:p.mode==='search'&&total!==null&&(pageNo+1)*pageSize<total&&pageNo<500?{...p,page:pageNo+1}:null,raw:body,attribution:cnkAttribution,fetchedAt:time(ctx),sourceURL:url.href};
}
async function executeCnkTune(p,ctx){
 const path=p.mode==='tune-search'?'ciTune/find':p.mode==='tune-detail'?`ciTune/${p.id}`:p.mode==='tune-pattern'?'ciTune/pattern':`rhyme/${encodeURIComponent(p.book)}/${encodeURIComponent(p.query)}`;
 const url=new URL('https://open.cnkgraph.com/api/'+path),options={headers:{Accept:'application/json','Accept-Language':'zh-hant'}};
 if(p.mode==='tune-search'||p.mode==='tune-pattern'){options.method='POST';options.headers['Content-Type']='application/json';options.body=JSON.stringify(p.mode==='tune-search'?{key:p.query}:{pattern:p.query});}
 const {response,text}=await ctx.request(url,options),body=jsonResponse(response,text,'搜韵 / CNKGraph',p.mode==='tune-search');let rows;
 if(p.mode==='tune-search'){if(!Array.isArray(body))throw fail(502,'INVALID_UPSTREAM_RESPONSE','搜韵词牌检索格式已变更。');rows=body;}
 else if(p.mode==='tune-detail'){if(!object(body)||!Number.isSafeInteger(body.Id)||!Array.isArray(body.Formats))throw fail(502,'INVALID_UPSTREAM_RESPONSE','搜韵词谱详情格式已变更。');rows=[body];}
 else if(p.mode==='tune-pattern'){if(!Array.isArray(body.MatchedTuneFormats)||typeof body.Pattern!=='string')throw fail(502,'INVALID_UPSTREAM_RESPONSE','搜韵谱式匹配格式已变更。');rows=body.MatchedTuneFormats;}
 else{if(typeof body.Book!=='string'||!Array.isArray(body.Categories))throw fail(502,'INVALID_UPSTREAM_RESPONSE','搜韵韵目字表格式已变更。');rows=body.Categories;}
 if(rows.length>2000||rows.some(row=>!object(row)))throw fail(502,'INVALID_UPSTREAM_RESPONSE','搜韵词谱或韵目记录格式已变更。');
 const records=rows.map((row,index)=>{const tune=p.mode==='tune-pattern'?row.Tune:row,id=Number.isSafeInteger(tune?.Id)&&tune.Id>0?tune.Id:null;return {id:p.mode==='tune-pattern'?`${id??'match'}-${index}`:String(id??row.Id??index),title:p.mode==='rhyme'?`${body.Book} · ${row.Name||row.Id||p.query}`:tune?.Name||`谱式 ${index+1}`,summary:p.mode==='tune-pattern'?`匹配位置：${row.MatchedIndex}`:p.mode==='rhyme'?`${row.Tone||''}声 · ${Array.isArray(row.Chars)?row.Chars.length:'未提供'} 个字`:row.Desc||'',fields:row,sourceURL:id?`https://cnkgraph.com/CiTune/${id}`:url.href,...(id&&p.mode!=='tune-detail'?{actions:[{label:'查询完整词谱',parameters:{mode:'tune-detail',id}}]}:{})};});
 return {provider:'cnkgraph',query:p.mode==='tune-detail'?`词谱 ${p.id}`:p.mode==='rhyme'?`${p.book} · ${p.query}`:p.query,parameters:p,records,total:records.length,next:null,raw:body,attribution:cnkAttribution,fetchedAt:time(ctx),sourceURL:url.href};
}

const wikiAttribution={name:'神奇宝贝百科 52poke',credit:'神奇宝贝百科各条目贡献者；作者与版本、条目历史随记录保留。',license:'文字 CC BY-NC-SA 3.0；不包含游戏图片、角色图像等媒体授权。',licenseURL:'https://creativecommons.org/licenses/by-nc-sa/3.0/',termsURL:'https://wiki.52poke.com/wiki/神奇宝贝百科:版权声明'};
function validateWiki(input){safeKeys(input,['mode','query','page']);const mode=modeOf(input),query=string(input.query,'条目或关键词',200);if(mode==='detail'&&/[\/:#|{}<>\[\]]|^\./u.test(query))throw fail(400,'INVALID_QUERY','只读取百科正文命名空间的具体条目，不读取用户、文件、讨论或特殊页面。');if(mode==='detail'&&input.page!==undefined)throw fail(400,'INVALID_QUERY','条目详情不接受搜索偏移。');return {mode,query,...(mode==='search'?{page:integer(input.page,'搜索偏移',0,10000,0)}:{})};}
async function executeWiki(parameters,ctx){
 const p=validateWiki(parameters),url=new URL('https://wiki.52poke.com/api.php'),params={action:'query',prop:'info|revisions',inprop:'url',rvprop:'ids|timestamp|content|user',rvslots:'main',format:'json',formatversion:'2',maxlag:'5'};
 if(p.mode==='search')Object.assign(params,{generator:'search',gsrsearch:p.query,gsrlimit:'3',gsrnamespace:'0',gsroffset:String(p.page)});else Object.assign(params,{titles:p.query,redirects:'1'});
 for(const[key,value]of Object.entries(params))url.searchParams.set(key,value);
 const {response,text}=await ctx.request(url),body=jsonResponse(response,text,'神奇宝贝百科');
 if(body.error)throw fail(body.error.code==='maxlag'?503:502,'UPSTREAM_REJECTED','神奇宝贝百科拒绝或暂缓了查询，请前往原站或稍后再试。');
 const pages=body.query?.pages??(body.batchcomplete!==undefined?[]:null);
 if(!Array.isArray(pages)||pages.length>3||pages.some(page=>!object(page)||page.ns!==0||!page.missing&&(!Number.isSafeInteger(page.pageid)||page.pageid<1||typeof page.title!=='string'||!Array.isArray(page.revisions)||!page.revisions.length)))throw fail(502,'INVALID_UPSTREAM_RESPONSE','神奇宝贝百科正文或版本格式已变更。');
 const records=pages.filter(page=>!page.missing).map(page=>{
  const revision=page.revisions[0],slot=revision.slots?.main;if(!object(slot)||typeof slot.content!=='string'||!Number.isSafeInteger(revision.revid)||revision.revid<1)throw fail(502,'INVALID_UPSTREAM_RESPONSE','神奇宝贝百科没有返回完整正文原文。');
  const sourceURL=`https://wiki.52poke.com/wiki/${encodeURIComponent(page.title)}`;
  return {id:String(page.pageid),title:page.title,summary:`完整 Wiki 原文 · 版本 ${revision.revid} · ${revision.timestamp||'时间未提供'}`,fields:page,sourceURL,attribution:{...wikiAttribution,revisionURL:`${sourceURL}?oldid=${revision.revid}`,historyURL:`${sourceURL}?action=history`}};
 });
 const offset=body.continue?.gsroffset;return {provider:'pokewiki',query:p.query,parameters:p,records,total:p.mode==='detail'?records.length:null,next:p.mode==='search'&&Number.isSafeInteger(offset)&&offset>p.page&&offset<=10000?{...p,page:offset}:null,raw:body,attribution:wikiAttribution,fetchedAt:time(ctx),sourceURL:url.href};
}

export const LANGUAGE_PROVIDERS=Object.freeze([
 {id:'zdic',title:'汉典公开词条读取（非官方 API）',allowedHosts:['zdic.net'],minimumIntervalMs:10000,validate:validateZdic,execute:executeZdic},
 {id:'cnkgraph',title:'搜韵 / CNKGraph 诗文与词谱在线查询',allowedHosts:['open.cnkgraph.com'],minimumIntervalMs:10000,validate:validateCnk,execute:executeCnk},
 {id:'pokewiki',title:'神奇宝贝百科文字在线查询',allowedHosts:['wiki.52poke.com'],minimumIntervalMs:500000,validate:validateWiki,execute:executeWiki}
]);
