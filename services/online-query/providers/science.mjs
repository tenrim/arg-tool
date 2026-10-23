// Read-only official science services. The service owner supplies bounded,
// cancellable requests and validates hosts; no adapter accepts a URL or ADQL.
const PAGE=25,WINDOW=250;
const plain=value=>value&&typeof value==='object'&&!Array.isArray(value);
const error=(status,code,message)=>Object.assign(new Error(message),{status,code});
const invalid=message=>error(400,'INVALID_QUERY',message);
const malformed=title=>error(502,'INVALID_UPSTREAM_RESPONSE',`${title} 返回的数据格式不正确，请稍后重试或到原站查询。`);
function keys(input,allowed){if(!plain(input)||Object.keys(input).some(key=>!allowed.includes(key)))throw invalid('查询字段不正确。');}
function text(value,max,label,{optional=false}={}){if(value===undefined&&optional)return '';if(typeof value!=='string'||value.length>max||/\p{Cc}/u.test(value)||(!optional&&!value.trim()))throw invalid(`${label}格式不正确。`);return value.trim();}
function integer(value,min,max,label,defaultValue){const number=value===undefined?defaultValue:value;if(!Number.isSafeInteger(number)||number<min||number>max)throw invalid(`${label}超出允许范围。`);return number;}
function coordinate(value,min,max,label,{exclusiveMin=false,exclusiveMax=false}={}){if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max||(exclusiveMin&&value===min)||(exclusiveMax&&value===max))throw invalid(`${label}超出允许范围。`);return value;}
function cone(input){keys(input,['ra','dec','radius']);return {ra:coordinate(input.ra,0,360,'赤经',{exclusiveMax:true}),dec:coordinate(input.dec,-90,90,'赤纬'),radius:coordinate(input.radius,0,1,'半径',{exclusiveMin:true})};}
function offset(value){const result=integer(value,0,WINDOW-PAGE,'分页起点',0);if(result%PAGE)throw invalid('分页起点须为 25 的倍数。');return result;}
function checkResponse(response,title){if(!response||!response.ok)throw error(response?.status===429?503:502,response?.status===429?'UPSTREAM_RATE_LIMITED':'UPSTREAM_UNAVAILABLE',`${title} 当前无法完成查询，请稍后重试或前往原站。`);}
async function json(ctx,url,title,options){const {response,text}=await ctx.request(url,options);checkResponse(response,title);let result;try{result=JSON.parse(text);}catch{throw malformed(title);}if(!result||typeof result!=='object')throw malformed(title);return result;}
function result(id,parameters,ctx,sourceURL,records,attribution,extra={}){ctx.signal?.throwIfAborted();return {provider:id,query:parameters.query||parameters.table||parameters.id||String(parameters.cid||parameters.oid||''),parameters,records,total:null,next:null,attribution,fetchedAt:new Date(ctx.now()).toISOString(),sourceURL,...extra};}
const sqlString=value=>`'${value.replaceAll("'","''")}'`;
const simbadAttribution={name:'SIMBAD',credit:'CDS, Strasbourg; SIMBAD contributors and the original references in each record',license:'CDS 使用条款；各测量与文献保留原来源条款',termsURL:'https://cds.unistra.fr/legals/'};
const vizierAttribution={name:'VizieR',credit:'CDS, Strasbourg and the authors/publishers of each catalogue',license:'按各目录 rights_uri 与原出版方条款；保留 CDS/VizieR 署名',termsURL:'https://cds.unistra.fr/vizier-org/licences_vizier.html'};
const codAttribution={name:'Crystallography Open Database (COD)',credit:'COD contributors and the original structure authors/publications',license:'CC0 1.0 (database/data); retain original scientific references',licenseURL:'https://creativecommons.org/publicdomain/zero/1.0/',termsURL:'https://www.crystallography.net/cod/new.html'};
const pubchemAttribution={name:'PubChem',credit:'PubChem, NCBI/NLM/NIH and the individual data providers identified in each record',license:'PubChem 公共服务；第三方资料按各提供方条款，非统一 CC0',termsURL:'https://pubchem.ncbi.nlm.nih.gov/docs/copyright-and-data-usage-policy'};

function tapURL(adql){const url=new URL('https://simbad.u-strasbg.fr/simbad/sim-tap/sync');for(const [key,value] of Object.entries({REQUEST:'doQuery',LANG:'ADQL',FORMAT:'json',MAXREC:'101',QUERY:adql}))url.searchParams.set(key,value);return url.href;}
function tapRows(data,title,maxRows=101){if(!plain(data)||!Array.isArray(data.metadata)||!Array.isArray(data.data)||data.metadata.length>512||data.data.length>maxRows||data.metadata.some(column=>!plain(column)||typeof column.name!=='string')||new Set(data.metadata.map(c=>c.name)).size!==data.metadata.length||data.data.some(row=>!Array.isArray(row)||row.length!==data.metadata.length))throw malformed(title);return data.data.map(row=>Object.fromEntries(data.metadata.map((column,index)=>[column.name,row[index]])));}
function simbadSource(oid){return `https://simbad.u-strasbg.fr/simbad/sim-id?Ident=%40${oid}`;}
const simbadSections=['basic','identifiers','photometry','bibliography'];
function simbadActions(oid){return simbadSections.map((section,index)=>({label:['完整基础资料','其他标识符','光度测量','相关文献'][index],parameters:{mode:'detail',oid,section,after:''}}));}
function validateSimbad(input){
  const mode=input?.mode||'name';
  if(mode==='name'){keys(input,['mode','query','after']);return {mode,query:text(input.query,200,'天体名称'),after:integer(input.after,0,Number.MAX_SAFE_INTEGER,'天体游标',0)};}
  if(mode==='cone'){keys(input,['mode','ra','dec','radius','after']);return {mode,...cone({ra:input.ra,dec:input.dec,radius:input.radius}),after:offset(input.after)};}
  if(mode==='detail'){keys(input,['mode','oid','section','after']);const section=input.section??'basic';if(!simbadSections.includes(section))throw invalid('SIMBAD 资料种类不正确。');const after=text(input.after,200,'资料游标',{optional:true});if(after&&['basic','photometry'].includes(section))throw invalid('此种资料不使用分页游标。');return {mode,oid:integer(input.oid,1,Number.MAX_SAFE_INTEGER,'天体编号'),section,after};}
  throw invalid('SIMBAD 查询模式不正确。');
}
async function executeSimbad(p,ctx){
  if(p.mode==='cone')return executeSimbadCone(p,ctx);
  let adql;
  if(p.mode==='name')adql=`SELECT TOP 26 basic.* FROM basic JOIN ident ON basic.oid=ident.oidref WHERE ident.id=${sqlString(p.query)} AND basic.oid>${p.after} ORDER BY oid`;
  else if(p.section==='basic')adql=`SELECT * FROM basic WHERE oid=${p.oid}`;
  else if(p.section==='identifiers')adql=`SELECT TOP 26 * FROM ident WHERE oidref=${p.oid}${p.after?` AND id>${sqlString(p.after)}`:''} ORDER BY id`;
  else if(p.section==='photometry')adql=`SELECT TOP 101 * FROM flux WHERE oidref=${p.oid} ORDER BY filter`;
  else adql=`SELECT TOP 26 ref.* FROM has_ref JOIN ref ON has_ref.oidbibref=ref.oidbib WHERE has_ref.oidref=${p.oid}${p.after?` AND bibcode>${sqlString(p.after)}`:''} ORDER BY bibcode`;
  const sourceURL=tapURL(adql),raw=await json(ctx,sourceURL,'SIMBAD'),rows=tapRows(raw,'SIMBAD');
  if(p.section==='photometry'&&rows.length>100)throw error(422,'QUERY_TOO_BROAD','此天体的光度测量超出单次读取限额，请前往 SIMBAD 原站。');
  const paginate=p.mode!=='detail'||['identifiers','bibliography'].includes(p.section),page=paginate?rows.slice(0,PAGE):rows;
  // A bibliography code identifies the source publication, not a photometry
  // row: several bands often cite the same paper. Keep each band measurement
  // selectable, including multiple source rows for a filter, without deduping.
  const records=page.map((fields,index)=>{const oid=p.oid||fields.oid; if(!Number.isSafeInteger(oid)||oid<1)throw malformed('SIMBAD');const identity=p.section==='photometry'?`${fields.filter||'unknown'}:${index}`:fields.id||fields.bibcode||index;return {id:p.mode==='detail'?`${oid}:${p.section}:${identity}`:String(oid),title:String(fields.main_id||fields.id||fields.title||(p.section==='photometry'&&fields.filter?`${fields.filter} 波段测光`:fields.bibcode)||`SIMBAD ${oid}`),fields,sourceURL:simbadSource(oid),actions:simbadActions(oid)};});
  const last=page.at(-1),next=paginate&&rows.length>PAGE?{...p,after:p.mode==='detail'?String(p.section==='identifiers'?last.id:last.bibcode):last.oid}:null;
  return result('simbad',p,ctx,sourceURL,records,simbadAttribution,{columns:raw.metadata,next,rawResponse:raw,query:p.mode==='cone'?`ICRS ${p.ra}°, ${p.dec}°；半径 ${p.radius}°`:p.query||`SIMBAD ${p.oid} / ${p.section}`});
}
async function executeSimbadCone(p,ctx){
  // SIMBAD's dedicated spatial index is substantially faster than sorting a
  // broad TAP spatial join. Resolve only this explicitly requested page back
  // to complete basic records, retaining the original ConeSearch data too.
  const url=new URL('https://simbad.u-strasbg.fr/cone/');for(const [key,value] of Object.entries({RA:p.ra,DEC:p.dec,SR:p.radius,ORDER_BY:'distance',MAXREC:p.after+PAGE+1,RESPONSEFORMAT:'json',VERB:3}))url.searchParams.set(key,String(value));
  const sourceURL=url.href,raw=await json(ctx,sourceURL,'SIMBAD');if(!plain(raw)||!Array.isArray(raw.columns)||!Array.isArray(raw.data)||raw.data.length>p.after+PAGE+1)throw malformed('SIMBAD');
  const coneRows=tapRows({metadata:raw.columns,data:raw.data},'SIMBAD',WINDOW+1),page=coneRows.slice(p.after,p.after+PAGE);if(page.some(row=>typeof row.main_id!=='string'||!row.main_id.trim())||new Set(page.map(row=>row.main_id)).size!==page.length)throw malformed('SIMBAD');
  if(!page.length)return result('simbad',p,ctx,sourceURL,[],simbadAttribution,{rawResponse:raw,columns:raw.columns,query:`ICRS ${p.ra}°, ${p.dec}°；半径 ${p.radius}°`});
  const detailURL=tapURL(`SELECT TOP ${PAGE} * FROM basic WHERE main_id IN (${page.map(row=>sqlString(row.main_id)).join(',')})`),detail=await json(ctx,detailURL,'SIMBAD'),rows=tapRows(detail,'SIMBAD'),byName=new Map(rows.map(row=>[row.main_id,row]));if(rows.length!==page.length||byName.size!==rows.length||page.some(row=>!byName.has(row.main_id)))throw malformed('SIMBAD');
  const records=page.map(coneFields=>{const basic=byName.get(coneFields.main_id),oid=basic.oid;if(!Number.isSafeInteger(oid)||oid<1)throw malformed('SIMBAD');return {id:String(oid),title:basic.main_id,summary:`距查询中心 ${coneFields.distance}°`,fields:{...basic,cone:coneFields},sourceURL:simbadSource(oid),actions:simbadActions(oid)};});
  return result('simbad',p,ctx,sourceURL,records,simbadAttribution,{columns:detail.metadata,coneColumns:raw.columns,rawResponse:{cone:raw,basic:detail,detailSourceURL:detailURL},next:coneRows.length>p.after+PAGE&&p.after+PAGE<WINDOW?{...p,after:p.after+PAGE}:null,limits:{window:WINDOW,moreBeyondWindow:coneRows.length>WINDOW},query:`ICRS ${p.ra}°, ${p.dec}°；半径 ${p.radius}°`});
}

// ASU is an official VizieR protocol, not a replacement mirror. Raw output is
// retained once so optional comments/metadata and precision survive exports.
function tableName(value){const name=text(value,160,'目录表名');if(!/^[A-Za-z0-9][A-Za-z0-9_./+()\-]*$/.test(name)||name.includes('..'))throw invalid('请输入真实的单个 VizieR 表名。');return name;}
function validateVizier(input){
  const mode=input?.mode||'catalogs';
  if(mode==='catalogs'){keys(input,['mode','query']);return {mode,query:text(input.query,120,'目录关键词')};}
  if(mode==='columns'){keys(input,['mode','table']);return {mode,table:tableName(input.table)};}
  if(mode!=='records')throw invalid('VizieR 查询模式不正确。');
  keys(input,['mode','table','conditions','cone','offset']);const conditions=input.conditions??[];
  if(!Array.isArray(conditions)||conditions.length>8)throw invalid('请提供最多 8 个字段条件。');
  const normalized=conditions.map(condition=>{keys(condition,['column','operator','value']);const column=text(condition.column,80,'字段名'),value=text(condition.value,200,'条件值');if(!/^[A-Za-z0-9_(][A-Za-z0-9_().+\-/:]*$/.test(column)||!['=','!=','<','<=','>','>='].includes(condition.operator)||/[|*?<>!=]/.test(value))throw invalid('VizieR 字段条件不正确。');return {column,operator:condition.operator,value};});
  if(new Set(normalized.map(c=>c.column)).size!==normalized.length)throw invalid('同一字段请只填写一个条件。');
  const sky=input.cone==null?null:cone(input.cone);if(!sky&&!normalized.length)throw invalid('请选择字段条件或不超过一度的天区，避免下载整张星表。');
  return {mode,table:tableName(input.table),conditions:normalized,cone:sky,offset:offset(input.offset)};
}
function vizierURL(parameters,path='asu-tsv'){const url=new URL(`https://vizier.cds.unistra.fr/viz-bin/${path}`);for(const [key,value] of Object.entries(parameters))url.searchParams.set(key,String(value));return url.href;}
function parseTSV(text){
  if(!text.includes('VizieR Astronomical Server')||/^\s*</.test(text)||/^#(?:ERROR|INFO\s+Error[=:])/im.test(text))throw malformed('VizieR');
  const tables=[];let table=null,resource={id:'',title:'',info:[]},stage=0;const global=[];
  for(const line of text.replaceAll('\r','').split('\n')){
    if(line.startsWith('#RESOURCE=')){resource={id:'',title:'',info:[line]};table=null;continue;}
    if(line.startsWith('#Table\t')){table={id:'',title:'',columns:[],rows:[],info:[],resource:structuredClone(resource),header:[],units:[]};tables.push(table);stage=0;if(tables.length>512)throw malformed('VizieR');continue;}
    if(line.startsWith('#Name: ')){(table||resource).id=line.slice(7);continue;}
    if(line.startsWith('#Title: ')){(table||resource).title=line.slice(8);continue;}
    if(line.startsWith('#Column\t')&&table){const [,,format,description,...notes]=line.split('\t');table.columns.push({name:line.split('\t')[1],format,description,notes,raw:line});continue;}
    if(line.startsWith('#')){(table?table.info:resource.id?resource.info:global).push(line);continue;}
    if(!line||!table)continue;
    const values=line.split('\t');
    if(stage===0){table.header=values;stage=1;}
    else if(stage===1){table.units=values;stage=2;}
    else if(stage===2){if(!values.every(v=>/^-+$/.test(v)))throw malformed('VizieR');stage=3;}
    else{if(values.length!==table.header.length||new Set(table.header).size!==table.header.length)throw malformed('VizieR');table.rows.push(Object.fromEntries(table.header.map((key,index)=>[key,values[index]])));if(table.rows.length>WINDOW+1)throw malformed('VizieR');}
  }
  for(const table of tables){if(!table.id)throw malformed('VizieR');table.columns=table.columns.map(c=>({...c,unit:table.units[table.header.indexOf(c.name)]??''}));}
  return {tables,global};
}
const xmlDecode=value=>value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi,(_all,entity)=>{if(entity[0]==='#'){const n=entity[1].toLowerCase()==='x'?parseInt(entity.slice(2),16):Number(entity.slice(1));return n>0&&n<=0x10ffff?String.fromCodePoint(n):'\uFFFD';}return {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"}[entity];});
function xmlAttributes(source){return Object.fromEntries([...source.matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m=>[m[1],xmlDecode(m[2]??m[3])]));}
function xmlSchema(text){
  if(!/<VOTABLE\b/i.test(text)||/<!DOCTYPE|<!ENTITY/i.test(text)||/<INFO\b[^>]*name="QUERY_STATUS"[^>]*value="ERROR"/i.test(text))throw malformed('VizieR');
  const tables=[];
  for(const match of text.matchAll(/<TABLE\b([^>]*)>([\s\S]*?)<\/TABLE>/g)){
    const attributes=xmlAttributes(match[1]),body=match[2],columns=[];
    for(const field of body.matchAll(/<FIELD\b([^>]*?)(?:\/>|>([\s\S]*?)<\/FIELD>)/g)){const attrs=xmlAttributes(field[1]),description=field[2]?.match(/<DESCRIPTION>([\s\S]*?)<\/DESCRIPTION>/)?.[1]||'';columns.push({...attrs,description:xmlDecode(description),raw:field[0]});}
    tables.push({id:attributes.name||attributes.ID,title:xmlDecode(body.match(/<DESCRIPTION>([\s\S]*?)<\/DESCRIPTION>/)?.[1]||''),attributes,columns});
  }
  if(tables.length>512)throw malformed('VizieR');return tables;
}
async function executeVizier(p,ctx){
  const source=p.mode==='catalogs'?p.query:p.table;
  if(p.mode==='columns'){
    const sourceURL=vizierURL({'-source':source,'-out.all':1,'-meta':'all','-out.max':0},'votable'),response=await ctx.request(sourceURL);checkResponse(response.response,'VizieR');const tables=xmlSchema(response.text);
    const records=tables.map(table=>({id:table.id,title:table.title||table.id,fields:table,sourceURL:`https://vizier.cds.unistra.fr/viz-bin/VizieR?-source=${encodeURIComponent(table.id)}`,actions:[]}));
    return result('vizier',p,ctx,sourceURL,records,vizierAttribution,{rawResponse:{format:'VOTable XML',text:response.text},total:records.length,query:source});
  }
  const params={'-source':source,'-out.all':1,'-out.max':p.mode==='catalogs'?0:p.offset+PAGE+1};
  if(p.mode==='catalogs'){params['-meta']='all';params['-meta.max']=25;}
  else{for(const c of p.conditions)params[c.column]=`${c.operator}${c.value}`;if(p.cone){params['-c']=`${p.cone.ra} ${p.cone.dec>=0?'+':''}${p.cone.dec}`;params['-c.eq']='J2000';params['-c.rd']=p.cone.radius;}}
  const sourceURL=vizierURL(params),response=await ctx.request(sourceURL);checkResponse(response.response,'VizieR');const parsed=parseTSV(response.text);
  if(p.mode==='catalogs'){
    const records=parsed.tables.map(table=>({id:table.id,title:table.title||table.id,summary:table.resource.title,fields:{...table,global:parsed.global},sourceURL:`https://vizier.cds.unistra.fr/viz-bin/VizieR?-source=${encodeURIComponent(table.id)}`,actions:[{label:'查看全部字段和单位',parameters:{mode:'columns',table:table.id}}]}));
    return result('vizier',p,ctx,sourceURL,records,vizierAttribution,{rawResponse:{format:'ASU TSV',text:response.text},query:p.query,limits:{catalogues:25,totalUnknown:true}});
  }
  if(parsed.tables.some(table=>table.id!==p.table))throw malformed('VizieR');const table=parsed.tables[0],all=table?.rows||[],page=all.slice(p.offset,p.offset+PAGE);
  const records=page.map((row,index)=>({id:`${p.table}:${p.offset+index+1}`,title:`${p.table} · ${p.offset+index+1}`,fields:row,sourceURL:`https://vizier.cds.unistra.fr/viz-bin/VizieR?-source=${encodeURIComponent(p.table)}`}));
  return result('vizier',p,ctx,sourceURL,records,vizierAttribution,{columns:table?.columns||[],rawResponse:{format:'ASU TSV',text:response.text},tableMetadata:table?{...table,rows:undefined,global:parsed.global}:null,next:all.length>p.offset+PAGE&&p.offset+PAGE<WINDOW?{...p,offset:p.offset+PAGE}:null,limits:{window:WINDOW,moreBeyondWindow:p.offset+PAGE===WINDOW&&all.length>WINDOW},query:p.table});
}

const ELEMENTS=new Set('H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' '));
function codID(value){if(typeof value!=='string'||!/^\d{7}$/.test(value))throw invalid('COD 编号须为七位数字。');return value;}
function elementList(value,max){if(value===undefined)return [];if(!Array.isArray(value)||value.length>max||value.some(e=>!ELEMENTS.has(e))||new Set(value).size!==value.length)throw invalid('化学元素条件不正确。');return [...value];}
function validateCOD(input){
  const mode=input?.mode||'search';
  if(['detail','cif'].includes(mode)){keys(input,['mode','id']);return {mode,id:codID(input.id)};}
  if(mode!=='search')throw invalid('COD 查询模式不正确。');keys(input,['mode','query','formula','elements','excludeElements','spacegroup','year','doi','start']);
  const p={mode,query:text(input.query,200,'晶体关键词',{optional:true}),formula:text(input.formula,120,'Hill 分子式',{optional:true}),elements:elementList(input.elements,8),excludeElements:elementList(input.excludeElements,4),spacegroup:text(input.spacegroup,60,'空间群',{optional:true}),year:input.year==null?null:integer(input.year,1000,2100,'论文年份'),doi:text(input.doi,200,'DOI',{optional:true}),start:offset(input.start)};
  if(!p.query&&!p.formula&&!p.elements.length&&!p.spacegroup&&!p.year&&!p.doi)throw invalid('请填写晶体检索条件，不能读取整个数据库。');if(p.elements.some(e=>p.excludeElements.includes(e)))throw invalid('同一元素不能同时要求包含和排除。');return p;
}
function codURL(p,format){const url=new URL('https://www.crystallography.net/cod/result');url.searchParams.set('format',format);if(p.mode==='detail')url.searchParams.set('id',p.id);else{for(const [key,value] of Object.entries({text:p.query,formula:p.formula,spacegroup:p.spacegroup,year:p.year,doi:p.doi}))if(value)url.searchParams.set(key,String(value));p.elements.forEach((e,i)=>url.searchParams.set(`el${i+1}`,e));p.excludeElements.forEach((e,i)=>url.searchParams.set(`nel${i+1}`,e));}return url.href;}
function codActions(id){return [{label:'完整晶体记录',parameters:{mode:'detail',id}},{label:'读取原始 CIF',parameters:{mode:'cif',id}}];}
async function executeCOD(p,ctx){
  if(p.mode==='cif'){
    const sourceURL=`https://www.crystallography.net/cod/${p.id}.cif`,response=await ctx.request(sourceURL);checkResponse(response.response,'COD');if(!/^data_\S+/m.test(response.text)||/^\s*</.test(response.text))throw malformed('COD');
    return result('cod',p,ctx,sourceURL,[{id:p.id,title:`COD ${p.id} · 原始 CIF`,fields:{id:p.id,format:'CIF',cif:response.text},sourceURL}],codAttribution,{total:1,query:p.id});
  }
  let total=null;if(p.mode==='search'){const countURL=codURL(p,'count'),count=await ctx.request(countURL);checkResponse(count.response,'COD');if(!/^\s*\d+\s*$/.test(count.text))throw malformed('COD');total=Number(count.text.trim());if(!Number.isSafeInteger(total))throw malformed('COD');if(total>WINDOW)throw error(422,'QUERY_TOO_BROAD',`COD 匹配到 ${total} 条记录，请增加条件缩小到 ${WINDOW} 条以内后查询。`);if(!total)return result('cod',p,ctx,countURL,[],codAttribution,{total:0});}
  const sourceURL=codURL(p,'json'),raw=await json(ctx,sourceURL,'COD');if(!Array.isArray(raw)||raw.length>WINDOW||raw.some(row=>!plain(row)||!/^\d{7}$/.test(String(row.file??row.id??''))))throw malformed('COD');
  if(p.mode==='detail'&&raw.some(row=>String(row.file??row.id)!==p.id))throw malformed('COD');
  const start=p.start||0,records=raw.slice(start,start+PAGE).map(fields=>{const id=String(fields.file??fields.id);return {id,title:String(fields.commonname||fields.chemname||fields.mineral||fields.formula||`COD ${id}`),summary:String(fields.formula||''),fields,sourceURL:`https://www.crystallography.net/cod/${id}.html`,actions:codActions(id)};});
  return result('cod',p,ctx,sourceURL,records,codAttribution,{total:total===null?raw.length:total,next:p.mode==='search'&&raw.length>start+PAGE?{...p,start:start+PAGE}:null,rawResponse:raw});
}

function cid(value){return integer(value,1,Number.MAX_SAFE_INTEGER,'PubChem CID');}
function validatePubChem(input){
  const mode=input?.mode||'search';
  if(mode==='search'){
    keys(input,['mode','kind','query','start']);const kind=input.kind??'name';if(!['name','cid','formula','smiles','inchi'].includes(kind))throw invalid('PubChem 标识类型不正确。');const query=text(input.query,kind==='name'?300:kind==='formula'?200:2000,'物质查询');if(kind==='cid'&&(!/^\d+$/.test(query)||!Number.isSafeInteger(Number(query))||Number(query)<1))throw invalid('CID 必须为正整数。');if(kind==='formula'&&!/^[A-Za-z0-9()[\]+.\-]+$/.test(query))throw invalid('分子式格式不正确。');return {mode,kind,query,start:offset(input.start)};
  }
  if(!['detail','synonyms','structure'].includes(mode))throw invalid('PubChem 查询模式不正确。');keys(input,mode==='structure'?['mode','cid','dimension']:['mode','cid']);const p={mode,cid:cid(input.cid)};if(mode==='structure'){p.dimension=input.dimension??'2d';if(!['2d','3d'].includes(p.dimension))throw invalid('请选择 2D 或 3D 结构。');}return p;
}
function pubchemActions(id){return [{label:'完整注释与资料来源',parameters:{mode:'detail',cid:id}},{label:'全部同义词',parameters:{mode:'synonyms',cid:id}},{label:'2D 原子/键/坐标',parameters:{mode:'structure',cid:id,dimension:'2d'}},{label:'3D 原子/键/坐标',parameters:{mode:'structure',cid:id,dimension:'3d'}}];}
function compoundRecord(raw){return plain(raw)&&Number.isSafeInteger(raw.id?.id?.cid)&&raw.id.id.cid>0;}
function compoundTitle(compound){return compound.props?.find(p=>p.urn?.label==='IUPAC Name'&&p.urn?.name==='Preferred')?.value?.sval||`PubChem CID ${compound.id.id.cid}`;}
async function pubchemJSON(ctx,url,options){const {response,text}=await ctx.request(url,options);if(response?.status===404){let raw;try{raw=JSON.parse(text);}catch{throw malformed('PubChem');}if(plain(raw?.Fault)&&raw.Fault.Code==='PUGREST.NotFound')return {empty:true,raw};}checkResponse(response,'PubChem');let raw;try{raw=JSON.parse(text);}catch{throw malformed('PubChem');}if(!plain(raw))throw malformed('PubChem');if(raw.Fault)throw malformed('PubChem');return {raw};}
async function executePubChem(p,ctx){
  const base='https://pubchem.ncbi.nlm.nih.gov/rest/pug',official=id=>`https://pubchem.ncbi.nlm.nih.gov/compound/${id}`;
  if(p.mode!=='search'){
    const sourceURL=p.mode==='detail'?`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${p.cid}/JSON`:p.mode==='synonyms'?`${base}/compound/cid/${p.cid}/synonyms/JSON`:`${base}/compound/cid/${p.cid}/record/JSON?record_type=${p.dimension}`;
    const value=await pubchemJSON(ctx,sourceURL);if(value.empty)return result('pubchem',p,ctx,sourceURL,[],pubchemAttribution,{total:0,rawResponse:value.raw});const raw=value.raw;
    if(p.mode==='detail'&&(!plain(raw.Record)||raw.Record.RecordNumber!==p.cid)||p.mode==='synonyms'&&(!Array.isArray(raw.InformationList?.Information)||raw.InformationList.Information.some(r=>r.CID!==p.cid))||p.mode==='structure'&&(!Array.isArray(raw.PC_Compounds)||raw.PC_Compounds.some(r=>!compoundRecord(r)||r.id.id.cid!==p.cid)))throw malformed('PubChem');
    const title=p.mode==='detail'?raw.Record.RecordTitle:`PubChem CID ${p.cid} · ${p.mode==='synonyms'?'同义词':p.dimension+' 结构'}`;
    return result('pubchem',p,ctx,sourceURL,[{id:String(p.cid),title:String(title||`PubChem CID ${p.cid}`),fields:raw,sourceURL:official(p.cid),actions:pubchemActions(p.cid)}],pubchemAttribution,{total:1,query:String(p.cid)});
  }
  let sourceURL,options;
  if(p.kind==='formula')sourceURL=`${base}/compound/fastformula/${encodeURIComponent(p.query)}/cids/JSON?MaxRecords=${WINDOW+1}`;
  else if(['smiles','inchi'].includes(p.kind)){sourceURL=`${base}/compound/${p.kind}/cids/JSON`;options={method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({[p.kind]:p.query}).toString()};}
  else sourceURL=`${base}/compound/${p.kind}/${encodeURIComponent(p.query)}/cids/JSON`;
  const value=await pubchemJSON(ctx,sourceURL,options);if(value.empty)return result('pubchem',p,ctx,sourceURL,[],pubchemAttribution,{total:0,rawResponse:value.raw});const ids=value.raw.IdentifierList?.CID;
  if(!Array.isArray(ids)||ids.some(id=>!Number.isSafeInteger(id)||id<1)||new Set(ids).size!==ids.length)throw malformed('PubChem');
  const selected=ids.slice(p.start,p.start+PAGE),next=p.start+PAGE<Math.min(ids.length,WINDOW)?{...p,start:p.start+PAGE}:null,total=p.kind==='formula'&&ids.length>=WINDOW+1?null:ids.length;
  if(!selected.length)return result('pubchem',p,ctx,sourceURL,[],pubchemAttribution,{total,next,rawResponse:value.raw});
  const recordURL=`${base}/compound/cid/${selected.join(',')}/record/JSON`,details=await pubchemJSON(ctx,recordURL);if(details.empty||!Array.isArray(details.raw.PC_Compounds)||details.raw.PC_Compounds.length!==selected.length||details.raw.PC_Compounds.some(row=>!compoundRecord(row)||!selected.includes(row.id.id.cid))||new Set(details.raw.PC_Compounds.map(row=>row.id.id.cid)).size!==selected.length)throw malformed('PubChem');
  const byID=new Map(details.raw.PC_Compounds.map(row=>[row.id.id.cid,row])),records=selected.map(id=>{const fields=byID.get(id);return {id:String(id),title:String(compoundTitle(fields)),fields,sourceURL:official(id),actions:pubchemActions(id)};});
  return result('pubchem',p,ctx,sourceURL,records,pubchemAttribution,{total,next,rawResponse:{identifiers:value.raw,recordSourceURL:recordURL},limits:{window:WINDOW,moreBeyondWindow:ids.length>WINDOW},query:p.query});
}

export const SCIENCE_PROVIDERS=Object.freeze([
  Object.freeze({id:'simbad',title:'SIMBAD 天体在线查询',allowedHosts:['simbad.u-strasbg.fr'],minimumIntervalMs:1000,timeoutMs:30000,validate:validateSimbad,execute:executeSimbad}),
  Object.freeze({id:'vizier',title:'VizieR 星表在线查询',allowedHosts:['vizier.cds.unistra.fr'],minimumIntervalMs:1000,timeoutMs:30000,validate:validateVizier,execute:executeVizier}),
  Object.freeze({id:'cod',title:'COD 晶体在线查询',allowedHosts:['www.crystallography.net'],minimumIntervalMs:1000,timeoutMs:30000,validate:validateCOD,execute:executeCOD}),
  Object.freeze({id:'pubchem',title:'PubChem 物质在线查询',allowedHosts:['pubchem.ncbi.nlm.nih.gov'],minimumIntervalMs:300,timeoutMs:30000,validate:validatePubChem,execute:executePubChem})
]);
