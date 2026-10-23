import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {IT_CATEGORIES,searchITRecords,normalizeDomainInput,matchPublicSuffix} from '../public/it-reference/model.js';
const kinds=IT_CATEGORIES.map(item=>item.id);
const datasets=Object.fromEntries(await Promise.all(kinds.map(async kind=>[kind,JSON.parse(await readFile(new URL('../public/vendor/it-reference/'+kind+'.json',import.meta.url),'utf8'))])));
const field=(row,name)=>row.fields.find(item=>item.label===name)?.value;

test('IT fixed registries retain complete versioned records and distinguish related concepts',()=>{
 assert.deepEqual(datasets.ports.meta.groups,{'服务端口':14536,'IP协议号':152});
 assert.deepEqual(datasets.http.meta.groups,{'状态码':67,'HTTP字段':263});
 assert.deepEqual(datasets.formats.meta.groups,{'媒体类型':2522,'字符集':258});
 assert.deepEqual(datasets.domains.meta.groups,{'ICANN后缀':6949,'私有后缀':3387});
 for(const [kind,data]of Object.entries(datasets)){
  assert.equal(data.kind,kind);assert.equal(data.meta.recordCount,data.records.length);assert.equal(new Set(data.records.map(row=>row.id)).size,data.records.length);assert.ok(data.meta.scope&&data.meta.version);
 }
 const web=searchITRecords(datasets.ports.records,'80').records[0];assert.equal(field(web,'端口'),'80');assert.equal(field(web,'服务名'),'http');
 const reserved=searchITRecords(datasets.ports.records,'226').records.find(row=>field(row,'端口')==='225-241');assert.ok(reserved);assert.equal(field(reserved,'端口范围'),'系统端口（0–1023）');assert.match(reserved.title,/保留/);
 const tcp=datasets.ports.records.find(row=>row.id==='protocol:6');assert.equal(field(tcp,'关键词'),'TCP');assert.match(tcp.summary,/不是TCP服务端口6/);
 const ephemeral=datasets.http.records.find(row=>row.id==='http:104');assert.match(field(ephemeral,'登记性质'),/临时.*2026-11-13/);
 const missing=datasets.http.records.find(row=>row.id==='http:404');assert.match(missing.title,/未找到/);
 const contentType=searchITRecords(datasets.http.records,'content-type').records[0];assert.equal(contentType.id,'header:content-type');assert.match(contentType.examples[0].input,/charset=UTF-8/);
});

test('IT references support aliases, filename extensions and nonrepeating bounded pagination',()=>{
 assert.equal(searchITRecords(datasets.formats.records,'UTF8').records[0].id,'charset:106');
 assert.equal(searchITRecords(datasets.formats.records,'CSutf8').records[0].id,'charset:106');
 assert.equal(searchITRecords(datasets.formats.records,'.json').records[0].id,'mime:application/json');
 const first=searchITRecords(datasets.ports.records,'TCP',{offset:0,limit:20});const second=searchITRecords(datasets.ports.records,'TCP',{offset:20,limit:20});
 assert.equal(first.total,second.total);assert.equal(first.records.length,20);assert.equal(second.records.length,20);assert.ok(!second.records.some(row=>first.records.some(a=>a.id===row.id)));
 assert.throws(()=>searchITRecords([],null,{limit:201}),RangeError);assert.throws(()=>searchITRecords([],null,{offset:-1}),RangeError);
 assert.equal(searchITRecords(datasets.http.records,'this-record-does-not-exist').total,0);
});

test('PSL matcher uses full multi-label, private, wildcard and exception rules',()=>{
 const list=datasets.domains.records;
 assert.deepEqual(matchPublicSuffix('clue.example.co.uk',list),{publicSuffix:'co.uk',domain:'example.co.uk',subdomain:'clue',isPrivate:false,isIcann:true,rule:'co.uk',knownSuffix:true});
 const privateHost=matchPublicSuffix('clue.user.github.io',list);assert.equal(privateHost.publicSuffix,'github.io');assert.equal(privateHost.domain,'user.github.io');assert.equal(privateHost.subdomain,'clue');assert.equal(privateHost.isPrivate,true);
 assert.equal(matchPublicSuffix('clue.user.github.io',list,{includePrivate:false}).domain,'github.io');
 assert.equal(matchPublicSuffix('a.b.ck',list).publicSuffix,'b.ck');assert.equal(matchPublicSuffix('a.b.ck',list).rule,'*.ck');
 const ex=matchPublicSuffix('a.www.ck',list);assert.equal(ex.publicSuffix,'ck');assert.equal(ex.domain,'www.ck');assert.equal(ex.rule,'!www.ck');
 const jp=matchPublicSuffix('www.city.kawasaki.jp',list);assert.equal(jp.publicSuffix,'kawasaki.jp');assert.equal(jp.domain,'city.kawasaki.jp');assert.equal(jp.rule,'!city.kawasaki.jp');
 const idn=normalizeDomainInput('https://www.食狮.公司.cn/path');assert.equal(idn.hostname,'www.xn--85x722f.xn--55qx5d.cn');assert.equal(matchPublicSuffix(idn.hostname,list).publicSuffix,'xn--55qx5d.cn');
 assert.equal(matchPublicSuffix('example.no-such-suffix',list).knownSuffix,false);assert.equal(matchPublicSuffix('localhost',list).domain,null);
});

test('Domain normalization accepts local IDNA/IPv6 and rejects ambiguous credentials and invalid hosts',()=>{
 assert.equal(normalizeDomainInput('HTTPS://EXAMPLE.ORG./clue').hostname,'example.org');
 assert.equal(normalizeDomainInput('[::1]').isIp,true);assert.equal(normalizeDomainInput('127.0.0.1').isIp,true);
 for(const input of ['', 'https://name:secret@example.org/', 'javascript:alert(1)', 'https://bad host/', 'https://a..b/', '-bad.example','https://a_b.example','example.org\\evil'])assert.throws(()=>normalizeDomainInput(input));
});

test('Retired selected RFC and instruction references cannot be discovered or loaded',async()=>{
 assert.deepEqual(kinds,['ports','http','formats','domains']);
 const {loadITData}=await import('../public/it-reference/model.js');
 for(const kind of ['rfc','instructions'])await assert.rejects(loadITData(kind),/未知的IT资料分类/);
 const files=await readdir(new URL('../public/vendor/it-reference/',import.meta.url));
 for(const file of ['rfc.json','instructions.json','RFC-NOTICE.txt'])assert.ok(!files.includes(file),'retired runtime file: '+file);
 for(const data of Object.values(datasets))for(const row of data.records)for(const link of row.related)assert.doesNotMatch(link.route,/^it-reference\/(?:rfc|instructions)(?:[/?]|$)/,'retired related destination: '+row.id);
});

test('IT original sources and published derivations match the immutable SHA-256 ledger',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../public/vendor/it-reference/UPSTREAM.json',import.meta.url),'utf8'));
 const imports=JSON.parse(await readFile(new URL('../upstream/it-reference/imports.json',import.meta.url),'utf8'));
 const runtime=(await readdir(new URL('../public/vendor/it-reference/',import.meta.url))).filter(name=>name!=='UPSTREAM.json').map(name=>'public/vendor/it-reference/'+name);
 assert.deepEqual(manifest.files.map(file=>file.path).sort(),[...imports.files.map(file=>file.path),...runtime].sort(),'ledger covers every retained source and runtime file exactly once');
 for(const file of manifest.files){const data=await readFile(new URL('../'+file.path,import.meta.url));assert.equal(createHash('sha256').update(data).digest('hex'),file.sha256,file.path);}
 assert.equal(manifest.packages['mime-db'].version,'1.54.0');
 assert.match(await readFile(new URL('../public/vendor/it-reference/IANA-NOTICE.txt',import.meta.url),'utf8'),/RFC documents are excluded/);
 assert.match(await readFile(new URL('../public/vendor/it-reference/PSL-LICENSE.txt',import.meta.url),'utf8'),/Mozilla Public License/);
});

test('Offline reference loader retries failed requests and validates immutable dataset responses',()=>{
 // Isolate mocked fetch in a child process: the main test runner shares other engine imports.
 const script=`import assert from 'node:assert/strict';import {readFileSync}from'node:fs';const body=readFileSync('public/vendor/it-reference/http.json','utf8');let calls=0;globalThis.fetch=async url=>{assert.match(String(url),/vendor\\/it-reference\\/http\\.json$/);calls++;return calls===1?new Response('',{status:503}):new Response(body,{status:200});};const {loadITData}=await import('./public/it-reference/model.js');await assert.rejects(loadITData('http'),/503/);const data=await loadITData('http');assert.equal(data.meta.recordCount,330);assert.strictEqual(await loadITData('http'),data);assert.equal(calls,2);await assert.rejects(loadITData('unknown'),/未知/);console.log('loader-pass');`;
 assert.match(execFileSync(process.execPath,['--input-type=module','-'],{input:script,encoding:'utf8',cwd:new URL('..',import.meta.url)}),/loader-pass/);
});
