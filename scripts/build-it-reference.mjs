// Deterministic offline derivation. Source hashes are checked before any output is written.
import {readFile,writeFile,mkdir,copyFile,readdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath,domainToASCII} from 'node:url';
import {resolve,join} from 'node:path';
import {portNotes,protocolNotes,httpNotes,headerNotes,formatNotes,charsetNotes} from '../upstream/it-reference/education.mjs';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const source=join(root,'upstream/it-reference/sources');
const output=join(root,'public/vendor/it-reference');
const imports=JSON.parse(await readFile(join(root,'upstream/it-reference/imports.json'),'utf8'));
const sha=data=>createHash('sha256').update(data).digest('hex');
for(const file of imports.files){if(sha(await readFile(join(root,file.path)))!==file.sha256)throw new Error('Pinned IT source differs: '+file.path);}
await mkdir(output,{recursive:true});
// Retired selected catalogues must not survive an offline rebuild from an older
// output directory or be included again by the runtime hash inventory below.
for(const name of ['rfc.json','instructions.json','RFC-NOTICE.txt'])await rm(join(output,name),{force:true});
const json=async path=>JSON.parse(await readFile(join(source,path),'utf8'));
const text=async path=>readFile(join(source,path),'utf8');
const decode=value=>value.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi,entity=>{
 const names={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"};
 if(entity in names)return names[entity];return String.fromCodePoint(entity[2].toLowerCase()==='x'?parseInt(entity.slice(3,-1),16):Number(entity.slice(2,-1)));
});
const clean=value=>decode(value.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
const tag=(xml,name)=>clean(xml.match(new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)</'+name+'>'))?.[1]||'');
const tags=(xml,name)=>[...xml.matchAll(new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)</'+name+'>','g'))].map(match=>clean(match[1]));
const refs=xml=>[...new Set([...xml.matchAll(/<xref\b[^>]*\btype="rfc"[^>]*\bdata="rfc(\d+)"/g)].map(match=>'RFC '+match[1]))];
const records=xml=>[...xml.matchAll(/<record\b[^>]*>([\s\S]*?)<\/record>/g)].map(match=>match[1]);
const field=(label,value)=>({label,value:String(value||'未登记')});
const example=(input,explanation,title='线索示例')=>({title,input,explanation});
const related=(label,route)=>({label,route});
const registrationLabels={Reserved:'保留',Unassigned:'未分配','Deprecated':'弃用'};
const numericRange=value=>{const match=String(value).match(/^(\d+)(?:-(\d+))?$/);return match?[Number(match[1]),Number(match[2]||match[1])]:null;};
const portBand=value=>{const range=numericRange(value);return !range?'只登记服务名':range[1]<=1023?'系统端口（0–1023）':range[0]>=1024&&range[1]<=49151?'用户端口（1024–49151）':range[0]>=49152?'动态/私有端口（49152–65535）':'跨多个端口范围';};
const base=(id,kind,group,title,aliases,summary,fields=[],examples=[],links=[])=>({id,kind,group,title,aliases:[...new Set(aliases.filter(Boolean))],summary,fields,examples,related:links});
const dates={};const raw={};
for(const name of ['service-names-port-numbers','protocol-numbers','http-status-codes','http-fields','character-sets']){raw[name]=await text('iana/'+name+'.xml');dates[name]=tag(raw[name],'updated');}
const portRows=records(raw['service-names-port-numbers']).map((xml,index)=>{
 const name=tag(xml,'name');const port=tag(xml,'number');const protocol=tag(xml,'protocol');const description=tag(xml,'description');const note=portNotes[name];
 const row=base('port:'+index,'ports','服务端口',(port?port+' / '+(protocol||'未指定传输协议').toUpperCase()+' · ':'')+(name||registrationLabels[description]||description),[name,port,protocol,description,registrationLabels[description],...note?[note[0]]:[]],note?note[1]:'IANA服务登记信息。端口号与传输协议一起识别登记项；实际流量可能使用不同服务。',[
  field('服务名',name),field('端口',port),field('传输协议',protocol.toUpperCase()),field('登记描述',description),field('参考规范',refs(xml).join('、')),field('端口范围',portBand(port)),
 ],note?[example(note[2],note[0])]:[],[related('网络数据处理','networklab')]);
 row.numericRange=numericRange(port);return row;
});
// Put familiar services first without dropping any record, including unassigned/ranged entries.
portRows.sort((a,b)=>Number(!a.aliases.some(name=>name in portNotes))-Number(!b.aliases.some(name=>name in portNotes)));
const protocolRows=records(raw['protocol-numbers']).map(xml=>{
 const value=tag(xml,'value'),name=tag(xml,'name'),description=tag(xml,'description'),note=protocolNotes[name];
 const row=base('protocol:'+value,'ports','IP协议号',value+' · '+(name||registrationLabels[description]||description),[value,name,description,registrationLabels[description],...note?[note[0]]:[]],note?note[1]:'IPv4的Protocol或IPv6的Next Header字段中的编号，不是TCP或UDP的应用服务端口。',[
  field('协议号（十进制）',value),field('关键词',name),field('登记描述',description),field('IPv6扩展头',tag(xml,'ipv6')==='Y'?'是':'未标为扩展头'),field('参考规范',refs(xml).join('、'))
 ],note?[example(note[2],note[0])]:[],[related('网络数据处理','networklab')]);
 row.numericRange=numericRange(value);return row;
});
const statusRows=records(raw['http-status-codes']).filter(xml=>/^\d{3}$/.test(tag(xml,'value'))).map(xml=>{
 const code=tag(xml,'value'),description=tag(xml,'description'),note=httpNotes[code];const family={'1':'信息响应','2':'成功','3':'重定向','4':'客户端错误','5':'服务端错误'}[code[0]];
 return base('http:'+code,'http','状态码',code+' · '+(note?.[0]||description),[code,description,note?.[0],family],note?.[1]||'HTTP登记状态码，含义与具体请求方法及响应字段有关。',[
  field('英文名称',description),field('类别',code[0]+'xx · '+family),field('登记性质',/TEMPORARY/.test(description)?'临时登记，到期日2026-11-13':/Unused/.test(description)?'未使用/保留':/OBSOLETED/.test(description)?'已废弃':'注册表记录'),field('参考规范',refs(xml).join('、'))
 ],[example('HTTP/1.1 '+code+' '+description.split(' (')[0],note?.[1]||family)], [related('HTTP字段资料','it-reference/http'),related('网络数据处理','networklab')]);
});
const statusLabels={permanent:'永久',provisional:'暂定',deprecated:'弃用',obsoleted:'废弃'};
const headerRows=records(raw['http-fields']).map(xml=>{
 const name=tag(xml,'value'),note=headerNotes[name.toLowerCase()],status=tag(xml,'status');
 return base('header:'+name.toLowerCase(),'http','HTTP字段',name+(note?' · '+note[0]:''),[name,'header','请求头','响应头',note?.[0]],note?.[1]||'已登记的HTTP字段名称。字段名不区分大小写；能出现于请求、响应或尾部字段取决于对应规范。',[
  field('字段名',name),field('登记状态',statusLabels[status]||status),field('结构化类型',tag(xml,'structured')),field('参考规范',refs(xml).join('、'))
 ],note?[example(note[2],note[1])]:[],[related('HTTP状态资料','it-reference/http')]);
});
headerRows.sort((a,b)=>Number(!(a.aliases[0].toLowerCase() in headerNotes))-Number(!(b.aliases[0].toLowerCase() in headerNotes)));
const mime=await json('mime-db/db.json');
const mimeRows=Object.entries(mime).map(([name,data])=>{
 const note=formatNotes[name];return base('mime:'+name,'formats','媒体类型',name+(note?' · '+note[0]:''),[name,...data.extensions||[],...data.extensions?.map(ext=>'.'+ext)||[],note?.[0]],note?.[1]||'媒体类型的名称，结构为“主类型/子类型”。扩展名与媒体类型可能多对多，不能仅凭名称确认文件内容。',[
  field('主类型',name.split('/')[0]),field('常见扩展名',data.extensions?.map(ext=>'.'+ext).join('、')),field('默认字符集',data.charset),field('可压缩性',data.compressible===true?'mime-db标为可压缩':data.compressible===false?'mime-db标为不可压缩':'未提供'),field('数据库来源标记',data.source)
 ],note?[example(note[2],note[1])]:[],[related('文件与十六进制分析','file'),related('字符与UTF-8字节','basics/characters')]);
});
mimeRows.sort((a,b)=>Number(!(a.aliases[0] in formatNotes))-Number(!(b.aliases[0] in formatNotes)));
const charsetRows=records(raw['character-sets']).map(xml=>{
 const name=tag(xml,'name'),preferred=tag(xml,'preferred_alias')||name,aliases=tags(xml,'alias');const note=charsetNotes[preferred]||charsetNotes[name]||aliases.map(alias=>charsetNotes[alias]).find(Boolean);
 return base('charset:'+tag(xml,'value'),'formats','字符集',preferred,[name,preferred,preferred.replace(/[-_]/g,''),tag(xml,'value'),...aliases],note?.[0]||'IANA字符集名称与别名。别名用于识别同一登记项，登记并不保证浏览器或当前转换引擎支持全部名称。',[
  field('登记名称',name),field('首选MIME名称',preferred),field('MIBenum',tag(xml,'value')),field('别名',aliases.join('、')),field('参考规范',refs(xml).join('、'))
 ],note?[example(note[1],note[0])]:[],[related('字符与UTF-8字节','basics/characters'),related('字符集转换','encoding/charset')]);
});
charsetRows.sort((a,b)=>Number(![a.title,...a.aliases].some(name=>name in charsetNotes))-Number(![b.title,...b.aliases].some(name=>name in charsetNotes)));
const psl=await text('psl/public_suffix_list.dat');let section='';const domainRows=[];
for(const line of psl.split(/\r?\n/)){
 if(line.includes('===BEGIN ICANN DOMAINS==='))section='icann';if(line.includes('===BEGIN PRIVATE DOMAINS==='))section='private';
 const rule=line.trim();if(!rule||rule.startsWith('//'))continue;
 if(!['icann','private'].includes(section))throw new Error('PSL section missing');
 const marker=rule.startsWith('!')?'!':rule.startsWith('*.')?'*.':'';const value=marker?rule.slice(marker.length):rule;const ascii=domainToASCII(value);if(!ascii)throw new Error('Invalid PSL rule: '+rule);
 const record=base('suffix:'+rule,'domains',section==='private'?'私有后缀':'ICANN后缀',rule,[rule,ascii,section==='private'?'私有后缀':'ICANN后缀'],marker==='!'?'这条例外规则使对应域名不成为公共后缀；匹配后移除最左侧的一段。':marker==='*.'?'通配规则：这个后缀下的一层名称也属于公共后缀。':section==='private'?'私有服务的公共后缀，用于区分同一平台下不同用户的站点；不是域名所有权或是否已注册的查询。':'ICANN区段的公共后缀规则；公共后缀可由一段或多段组成。',[
  field('规则形式',marker==='!'?'例外':marker==='*.'?'一层通配':'精确后缀'),field('ASCII形式',marker+ascii),field('列表区段',section==='private'?'PRIVATE':'ICANN')
 ],[],[related('Punycode与网页编码','encoding/webencoding')]);
 record.asciiRule=marker+ascii;record.isPrivate=section==='private';domainRows.push(record);
}
const metas={
 ports:{source:'IANA协议注册表',version:'服务端口 '+dates['service-names-port-numbers']+'；IP协议号 '+dates['protocol-numbers'],scope:'全部快照登记项；包含保留、取消、未分配范围及只有服务名的记录。登记不能证明实际流量用途。'},
 http:{source:'IANA HTTP注册表',version:'状态码 '+dates['http-status-codes']+'；字段 '+dates['http-fields'],scope:'单个三位状态码及全部HTTP字段登记项；临时、弃用和保留状态分别标注。'},
 formats:{source:'mime-db与IANA字符集注册表',version:'mime-db 1.54.0；字符集 '+dates['character-sets'],scope:'全部mime-db媒体类型与258项IANA字符集名称和别名；扩展名不等于内容识别结果。'},
 domains:{source:'Mozilla Public Suffix List',version:'3929462 · 2026-10-07',scope:'完整ICANN与PRIVATE区段规则，含通配和例外；仅离线分解，不查询DNS、注册人或网站内容。'}
};
const sets={ports:[...portRows,...protocolRows],http:[...statusRows,...headerRows],formats:[...mimeRows,...charsetRows],domains:domainRows};
for(const [kind,rows]of Object.entries(sets)){
 const ids=new Set();for(const row of rows){if(ids.has(row.id))throw new Error('Duplicate record: '+row.id);ids.add(row.id);}
 await writeFile(join(output,kind+'.json'),JSON.stringify({kind,records:rows,meta:{...metas[kind],recordCount:rows.length,groups:Object.fromEntries([...new Set(rows.map(row=>row.group))].map(group=>[group,rows.filter(row=>row.group===group).length]))}})+'\n');
}
await copyFile(join(source,'iana/CC0-1.0.txt'),join(output,'IANA-CC0-1.0.txt'));
await copyFile(join(source,'mime-db/LICENSE'),join(output,'mime-db-LICENSE.txt'));
await copyFile(join(source,'psl/LICENSE'),join(output,'PSL-LICENSE.txt'));
await copyFile(join(source,'psl/public_suffix_list.dat'),join(output,'public_suffix_list.dat'));
await writeFile(join(output,'IANA-NOTICE.txt'),'IANA Protocol Registries\nData: CC0 1.0 Universal, under the joint IANA/IETF statement of 10 November 2021.\nhttps://www.iana.org/help/licensing-terms\nhttps://creativecommons.org/publicdomain/zero/1.0/\nPrimary registries: service-names-port-numbers, protocol-numbers, http-status-codes, http-fields, character-sets.\nPinned unmodified XML mirror: https://github.com/larseggert/iana-assignments/tree/'+imports.pins['larseggert/iana-assignments']+'\nOnly the technical registry data is covered by this dedication. Referenced RFC documents are excluded and are not redistributed by this tool.\nDerived JSON drops contact/personal records and adds original Chinese educational notes. Original XML remains in upstream/it-reference/sources/iana. Source URLs and SHA-256 hashes are recorded in UPSTREAM.json.\n');
await writeFile(join(output,'PSL-NOTICE.txt'),'Public Suffix List\nCopyright: Mozilla Foundation and contributors. Data: Mozilla Public License 2.0 (MPL-2.0).\nhttps://publicsuffix.org/list/\nPinned source: https://github.com/publicsuffix/list/tree/'+imports.pins['publicsuffix/list']+'\nOriginal public_suffix_list.dat and full MPL-2.0 license are included unchanged. domains.json is a derived representation retaining ICANN/PRIVATE, wildcard, exception and IDN rules. Chinese explanations and the matching implementation are authored locally. No tldts code or embedded tldts suffix database is used.\n');
const files=[...imports.files];for(const name of (await readdir(output)).sort()){if(name==='UPSTREAM.json')continue;const path='public/vendor/it-reference/'+name;files.push({path,sha256:sha(await readFile(join(root,path)))});}
await writeFile(join(output,'UPSTREAM.json'),JSON.stringify({pins:imports.pins,packages:imports.packages,files},null,2)+'\n');
console.log('Built offline IT reference:',Object.entries(sets).map(([kind,rows])=>kind+'='+rows.length).join(', '));
