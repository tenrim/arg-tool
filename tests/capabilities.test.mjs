import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {capabilityCategories, capabilityGroupDefinitions, toolGroups, toolPages} from '../public/navigation.js';
import {CHEF_OPERATION_PAIRS, createRegistry, searchEntries, loadRegistry, resolveCapability} from '../public/capabilities/registry.js';
import {classifyCatalogue} from '../public/chef-tools/catalog.js';
import {LANGUAGES} from '../public/coderunner/model.js';
import {TYPES} from '../public/round3/board-model.js';
import {matchesSearch} from '../public/tool-search.js';

const catalogue=JSON.parse(await readFile(new URL('../public/vendor/cyberchef/catalogue.json',import.meta.url),'utf8'));
const registry=createRegistry(catalogue);
const entry=id=>registry.byId.get(id);

test('capabilities: one taxonomy covers every original root tool and upstream operation',()=>{
  assert.deepEqual(capabilityCategories.map(category=>category.id),['codec','reference','media','other','knowledge']);
  assert.deepEqual(toolGroups.map(group=>group.id),capabilityCategories.map(category=>category.id));
  assert.equal(new Set(toolPages.map(tool=>tool.route)).size,toolPages.length);
  assert.equal(registry.groups.length,capabilityGroupDefinitions.length);
  assert.equal(registry.coverage.toolCount,toolPages.length);
  assert.equal(registry.coverage.coveredToolCount,toolPages.length);
  assert.equal(registry.coverage.operationCount,505);
  assert.equal(registry.coverage.coveredOperationCount,505);
  assert.deepEqual(registry.coverage.missingToolIds,[]);
  assert.deepEqual(registry.coverage.missingOperationIds,[]);
  const operationIds=registry.entries.flatMap(item=>item.sourceOperationIds);
  assert.equal(operationIds.length,505);
  assert.equal(new Set(operationIds).size,505,'a capability must have one canonical owner');
  for(const group of registry.groups){
    const definition=capabilityGroupDefinitions.find(item=>item.id===group.id);
    assert.ok(definition);
    for(const field of ['title','category','icon','hint'])assert.equal(group[field],definition[field]);
    assert.equal(group.count,group.entries.length);
    assert.deepEqual(group.entryIds,group.entries.map(item=>item.id));
    assert.ok(group.representatives.length>0);
    for(const id of group.representatives)assert.equal(entry(id).group,group.id);
    for(const item of group.entries)assert.equal(item.category,group.category);
  }
  const reordered=structuredClone(catalogue);
  reordered.operations=Object.fromEntries(Object.entries(reordered.operations).reverse());
  assert.deepEqual(createRegistry(reordered).entries.map(item=>item.id),registry.entries.map(item=>item.id),
    'display order must not depend on upstream catalogue object order');
});

test('capabilities: native hex editing and six IT information entries are directly discoverable',()=>{
  const hex=entry('native:hex-editor');assert.equal(hex.category,'media');assert.equal(hex.open.slice,'hex');assert.equal(hex.panel,'file');
  assert.ok(searchEntries(registry,'十六进制编辑器').some(item=>item.id===hex.id));
  for(const kind of ['ports','http','formats','domains','rfc','instructions']){
    const reference=entry('native:it-'+kind);assert.equal(reference.category,'reference');assert.equal(reference.group,'technical');
    assert.equal(reference.panel,'it-reference');assert.equal(reference.open.slice,kind);
    assert.ok(searchEntries(registry,reference.title).some(item=>item.id===reference.id));
  }
  assert.ok(entry('native:it-domains').relatedIds.includes('op:Parse%20URI'));
});

test('capabilities: inverse pairs remain named tasks and retain exact engine operation IDs',()=>{
  const base64=entry('pair:To%20Base64');
  assert.deepEqual(base64.sourceOperationIds,['To Base64','From Base64']);
  assert.deepEqual(base64.directions.map(direction=>[direction.operationId,direction.op]),[
    ['To Base64','To Base64'],['From Base64','From Base64']
  ]);
  assert.equal(base64.open.kind,'operation');
  assert.equal(base64.open.panel,'encoding');
  assert.equal(base64.open.group,'base');
  assert.equal(base64.open.operation,'To Base64');
  assert.equal(base64.route,'encoding/base');
  assert.deepEqual(entry('native:a1z26').sourceOperationIds,['A1Z26 Cipher Encode','A1Z26 Cipher Decode']);
  assert.equal(entry('pair:A1Z26%20Cipher%20Encode'),undefined,'native and engine views cannot duplicate the task');
  assert.equal(entry('op:RSA%20Sign').reversible,false);
  assert.equal(entry('op:RSA%20Verify').reversible,false);
  assert.equal(entry('op:MD5').reversible,false);
  assert.equal(entry('native:hanzi-simplified').reversible,false,'many-to-one variants are not inverse transforms');
  for(const item of registry.entries.filter(item=>item.id.startsWith('pair:'))){
    assert.equal(item.sourceOperationIds.length,2);
    const classified=item.sourceOperationIds.map(id=>classifyCatalogue(catalogue).find(operation=>operation.op===id));
    assert.ok(classified.every(operation=>operation.mode==='task'));
    assert.equal(item.open.operation,classified[0].op,'the family opens its real first direction');
  }
});

test('capabilities: shared search selects an explicit direction without duplicating or mutating families',()=>{
  for(const [query,id,operation]of [
    ['From Base64','pair:To%20Base64','From Base64'],
    ['Base64解码','pair:To%20Base64','From Base64'],
    ['To Base64','pair:To%20Base64','To Base64'],
    ['AES解密','pair:AES%20Encrypt','AES Decrypt'],
    ['数字转字母','native:a1z26','A1Z26 Cipher Decode']
  ]){
    const matches=searchEntries(registry,query).filter(item=>item.id===id);
    assert.equal(matches.length,1,query+' keeps one family');
    assert.equal(matches[0].preferredOperation,operation,query+' opens requested direction');
    assert.equal(entry(id).preferredOperation,undefined,'search metadata is not registry state');
  }
  for(const [query,direction]of [['汉字转电报码','encode'],['电报码反查','decode'],['电报码解码','decode']]){
    assert.equal(searchEntries(registry,query).find(item=>item.id==='native:hanzi-telegraph').preferredDirection,direction);
  }
  assert.equal(searchEntries(registry,'Base64').find(item=>item.id==='pair:To%20Base64').preferredOperation,undefined);
  assert.equal(searchEntries(registry,'', 'codec').find(item=>item.id==='pair:To%20Base64'),entry('pair:To%20Base64'));
});

test('capabilities: exact names stay visible in bounded search without changing inventory or direction semantics',()=>{
  const inventory=registry.entries.map(item=>item.id);
  const coverage=structuredClone(registry.coverage);
  const visible=registry.entries.filter(item=>item.listed!==false);
  for(const query of ['ASCII','ＡＳＣＩＩ','  ascii  ']){
    const results=searchEntries(registry,query);
    assert.ok(results.length>60,'the complete real catalogue exercises the command-search limit');
    assert.equal(results[0].id,'learn:function-native:ascii','an exact lesson title precedes broad vocabulary');
    assert.ok(results.slice(0,60).some(item=>item.id==='native:ascii'),'the original ASCII tool remains directly visible');
    const originalMatches=visible.filter(item=>matchesSearch(item.aliases.join(' '),query));
    assert.deepEqual(new Set(results.map(item=>item.id)),new Set(originalMatches.map(item=>item.id)),
      'relevance changes order, never the matching set');
  }
  const ascii=searchEntries(registry,'ASCII');
  assert.deepEqual(searchEntries(registry,'ＡＳＣＩＩ').map(item=>item.id),ascii.map(item=>item.id));
  const fromBase64=searchEntries(registry,'From Base64');
  assert.equal(fromBase64[0].id,'pair:To%20Base64','exact engine operation names outrank broad knowledge mentions');
  assert.equal(fromBase64[0].preferredOperation,'From Base64');
  assert.equal(entry('pair:To%20Base64').preferredOperation,undefined,'ranking cannot mutate the family default');
  assert.ok(searchEntries(registry,'ASCII','knowledge').every(item=>item.category==='knowledge'));
  assert.equal(searchEntries(registry,'ASCII','knowledge')[0].id,'learn:function-native:ascii');
  for(const query of ['', '   ']){
    const results=searchEntries(registry,query);
    assert.deepEqual(results.map(item=>item.id),visible.map(item=>item.id),'empty search preserves navigation order');
    results.forEach((item,index)=>assert.equal(item,visible[index],'empty search preserves registry objects'));
  }
  const sameRank=ascii.filter(item=>!matchesSearch(item.title,'ASCII')&&!item.aliases.some(alias=>
    String(alias).normalize('NFKC').toLowerCase().replace(/\s+/g,'')==='ascii')&&
    !item.sourceOperationIds.some(op=>matchesSearch(op,'ASCII')));
  assert.deepEqual(sameRank.map(item=>item.id),visible.filter(item=>sameRank.some(result=>result.id===item.id)).map(item=>item.id),
    'broad-vocabulary ties retain deterministic inventory order');
  assert.deepEqual(registry.entries.map(item=>item.id),inventory);
  assert.deepEqual(registry.coverage,coverage);
});

test('capabilities: every declared two-direction family has one searchable owner',()=>{
  const classified=classifyCatalogue(catalogue);
  for(const [first,second] of CHEF_OPERATION_PAIRS){
    if(!catalogue.operations[first]||!catalogue.operations[second])continue;
    if([first,second].some(op=>classified.find(item=>item.op===op).mode!=='task'))continue;
    const owner=registry.byOperation.get(first);
    assert.equal(registry.byOperation.get(second),owner,first);
    assert.deepEqual(owner.sourceOperationIds,[first,second]);
    assert.equal(searchEntries(registry,first).filter(item=>item.sourceOperationIds.includes(first)).length,1);
    assert.equal(searchEntries(registry,second).filter(item=>item.sourceOperationIds.includes(second)).length,1);
    assert.deepEqual(owner.directions.map(item=>item.op),[first,second]);
  }
  assert.equal(registry.byOperation.size,505);
  assert.equal(entry('pair:PGP%20Encrypt%20and%20Sign').title,'PGP 加密签名与解密验签');
  assert.equal(entry('pair:To%20Case%20Insensitive%20Regex').title,'大小写不敏感正则转换');
  assert.match(entry('pair:To%20Case%20Insensitive%20Regex').tip,/不保留.*大小写/);
  for(const op of ['RSA Sign','RSA Verify','SHA2','Bcrypt','Bcrypt compare']){
    assert.equal(registry.byOperation.get(op).sourceOperationIds.length,1,'signing, hashes and checks are not guessed inverses');
  }
});

test('capabilities: legacy operation IDs select the exact direction without duplicating inventory',()=>{
  for(const item of registry.entries){
    for(const op of item.sourceOperationIds){
      const resolved=resolveCapability(registry,'op:'+encodeURIComponent(op));
      assert.equal(resolved.entry,item,op);
      assert.equal(resolved.op,op,'a decode deep link cannot silently open encode');
    }
  }
  const native=resolveCapability(registry,'pair:To%20HTML%20Entity');
  assert.equal(native.entry,entry('native:escape-html'));
  assert.equal(native.op,'To HTML Entity');
  const fallback=resolveCapability(registry,'pair:To%20Base64','RSA Decrypt','unregistered');
  assert.equal(fallback.op,'To Base64');
  assert.equal(fallback.direction,undefined);
  assert.deepEqual(resolveCapability(registry,'unregistered'),{entry:undefined,op:undefined,direction:undefined});
  assert.equal(registry.entries.some(item=>item.id==='op:From%20Base64'),false);
  assert.equal(registry.coverage.coveredOperationCount,505);
});

test('capabilities: native telegraph directions share a task and preserve their old decode link',()=>{
  const telegraph=entry('native:hanzi-telegraph');
  assert.equal(entry('native:hanzi-telegraph-decode'),undefined);
  assert.deepEqual(telegraph.sourceOperationIds,[],'native controls are not invented CyberChef operations');
  assert.deepEqual(telegraph.open.nativeDirections,[
    {id:'encode',label:'汉字 → 电报码',aliases:['汉字转电报码','电报码编码'],controls:[{selector:'#hanzi-mode',value:'tele-encode',event:'input'}]},
    {id:'decode',label:'电报码 → 汉字',aliases:['电报码反查汉字','四位数字查汉字','电报码解码'],controls:[{selector:'#hanzi-mode',value:'tele-decode',event:'input'}]}
  ]);
  assert.equal(resolveCapability(registry,telegraph.id).direction,'encode');
  assert.equal(resolveCapability(registry,telegraph.id,undefined,'decode').direction,'decode');
  const old=resolveCapability(registry,'native:hanzi-telegraph-decode');
  assert.equal(old.entry,telegraph);
  assert.equal(old.direction,'decode');
  assert.equal(old.op,undefined);
  assert.ok(searchEntries(registry,'电报码反查汉字').some(item=>item.id===telegraph.id));
});

test('capabilities: retained, chain and existing ZIP use explicit destinations without fake standalone engines',()=>{
  assert.deepEqual(registry.coverage.sourceModes,{task:489,retained:5,chain:10,existing:1});
  const retained=registry.entries.filter(item=>item.mode==='retained');
  assert.equal(retained.length,5);
  for(const item of retained){
    assert.equal(item.listed,false);
    assert.equal(item.open.kind,'recipe');
    assert.equal(item.route,'cyberchef');
    assert.equal(item.execution,'complete-workspace-only');
    assert.ok(registry.groups.every(group=>!group.entryIds.includes(item.id)));
  }
  assert.equal(registry.coverage.visibleEntryCount,registry.entries.length-5);
  assert.equal(registry.groups.reduce((total,group)=>total+group.count,0),registry.coverage.visibleEntryCount);
  assert.equal(searchEntries(registry,'Optical Character Recognition').length,0);
  const fork=entry('op:Fork');
  assert.equal(fork.open.kind,'recipe');
  assert.equal(fork.open.operation,'Fork');
  assert.equal(fork.mode,'chain');
  const unzip=entry('op:Unzip');
  assert.equal(unzip.mode,'existing');
  assert.equal(unzip.open.kind,'native');
  assert.equal(unzip.route,'file');
  assert.equal(unzip.open.anchor,'#archive-list');
  assert.equal(unzip.open.slice,'archive');
});

test('capabilities: default and secondary native operations activate actual controls and shared materials',()=>{
  assert.equal(entry('native:ascii').route,'basics/ascii');
  assert.equal(entry('native:utf8').route,'basics/characters');
  assert.deepEqual(entry('native:utf8').open.controls,[{selector:'#basics-format',value:'hex',event:'change'}]);
  assert.equal(entry('native:a1z26').route,'basics/letters');
  for(const id of ['a1z26','escape-hex','escape-unicode','escape-html','escape-url']){
    const item=entry('native:'+id);
    assert.deepEqual(item.open.operationControls,item.sourceOperationIds.map((op,index)=>({op,
      controls:[{selector:'#basics-direction',value:index===0?'encode':'decode',event:'change'}]
    })));
  }
  assert.equal(entry('native:codepoint').open.controls[0].value,'codepoint');
  for(const format of ['hex','unicode','html','url']){
    const item=entry('native:escape-'+format);
    assert.equal(item.route,'basics/escapes');
    assert.equal(item.open.controls[0].value,format);
    assert.equal(item.sourceOperationIds.length,2);
  }
  assert.equal(entry('native:tapcode').open.controls[0].value,'tap');
  assert.equal(entry('native:polybius').open.controls[0].value,'polybius');
  assert.equal(entry('native:hanzi-cangjie').open.controls[0].value,'cangjie');
  assert.equal(entry('native:hanzi-wubi').open.controls[0].value,'wubi');
  assert.equal(entry('native:word-grid').open.controls.at(-1).value,'straight');
  assert.equal(entry('native:word-boggle').open.controls.at(-1).value,'boggle');
  assert.equal(entry('native:image-planes').open.engine,'aperi');
  assert.equal(entry('native:image-steg').open.engine,'steg');
  assert.deepEqual(entry('native:image-color').open.tab,{panel:'image',id:'compare'});
  assert.equal(entry('native:image-color').open.slice,'color');
  assert.equal(entry('native:image-stereo').open.anchor,'#stereo-shift');
  assert.deepEqual(entry('native:audio-play').open.tab,{panel:'audio',id:'play'});
  assert.equal(entry('native:audio-sstv').open.slice,'sstv');
  assert.equal(entry('native:video-gif').open.controls[0].value,'gif');
  assert.equal(entry('native:video-gif').open.controls[0].event,'input');
  for(const language of Object.keys(LANGUAGES)){
    const item=entry(language==='brainfuck'?'native:code':'native:code-'+language);
    assert.equal(item.open.controls[0].selector,'#code-language');
    assert.equal(item.open.controls[0].value,language);
  }
  for(const type of Object.keys(TYPES)){
    const item=entry(type==='sudoku'?'native:paper':'native:paper-'+type);
    assert.equal(item.open.controls[0].selector,'#paper-type');
    assert.equal(item.open.controls[0].value,type);
  }
  for(const item of registry.entries){
    assert.ok(toolPages.some(tool=>tool.route===item.open.panel),item.id);
    assert.equal(item.route,item.open.route);
    assert.equal(Object.hasOwn(item,'sample'),false,'the production registry must not route to prototype samples');
  }
});

test('capabilities: lookup views and transformations link canonically across the broad categories',()=>{
  for(const route of ['countries','currencies','airports','ports']){
    const item=entry('native:'+route);
    assert.equal(item.category,'reference');
    assert.equal(item.workspace,'world');
    assert.equal(item.route,route);
    assert.equal(item.relatedIds.length,3);
  }
  assert.ok(entry('native:sky').relatedIds.includes('native:astronomy'));
  assert.ok(entry('native:crystals').relatedIds.includes('native:model'));
  assert.equal(entry('native:sequence').category,'reference');
  assert.equal(entry('native:sequence-processing').category,'other');
  assert.ok(entry('native:sequence').relatedIds.includes('native:sequence-processing'));
  for(const item of registry.entries)for(const id of item.relatedIds||[])assert.ok(entry(id));
});

test('capabilities: Chinese, English, normalized aliases and nondefault operations remain discoverable',()=>{
  const cases=[['ASCII','native:ascii'],['A1Z26','native:a1z26'],['四角','native:hanzi-code'],
    ['仓颉','native:hanzi-cangjie'],['五笔','native:hanzi-wubi'],['歇后语','native:hanzi-xhy'],
    ['Boggle','native:word-boggle'],['SSTV','native:audio-sstv'],['图片取色','native:image-color'],
    ['ToBase64','pair:To%20Base64'],['ＭＤ５','op:MD5'],['找规律','native:integerseq']];
  for(const [query,id] of cases)assert.ok(searchEntries(registry,query).some(item=>item.id===id),query);
  assert.ok(searchEntries(registry,'不知道是什么密码').some(item=>item.id==='native:cipher-detect'));
  assert.ok(searchEntries(registry,'','media').every(item=>item.category==='media'));
  assert.equal(searchEntries(registry,'','unregistered').length,0);
  const unknown=structuredClone(catalogue);unknown.operations['Unclassified future operation']={args:[]};
  assert.throws(()=>createRegistry(unknown),/尚未分类/);
  assert.throws(()=>createRegistry({operations:[]}),/real CyberChef/);
});

test('capabilities: loader retries a rejected resource and caches only a complete registry',async()=>{
  const original=globalThis.fetch;
  let requests=0;
  try{
    globalThis.fetch=async url=>{
      requests++;
      assert.match(String(url),/vendor\/cyberchef\/catalogue\.json$/);
      if(requests===1)return {ok:false};
      return {ok:true,json:async()=>catalogue};
    };
    await assert.rejects(loadRegistry(),/功能目录加载失败/);
    const [first,second]=await Promise.all([loadRegistry(),loadRegistry()]);
    assert.equal(first,second);
    assert.equal(first.coverage.coveredOperationCount,505);
    assert.equal(requests,2);
    assert.equal(await loadRegistry(),first);
    assert.equal(requests,2);
  }finally{
    globalThis.fetch=original;
  }
});
