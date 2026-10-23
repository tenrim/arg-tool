import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {capabilityCategories, capabilityGroupDefinitions, toolGroups, toolPages} from '../public/navigation.js';
import {CHEF_OPERATION_PAIRS, createRegistry, searchEntries, loadRegistry, resolveCapability} from '../public/capabilities/registry.js';
import {classifyCatalogue} from '../public/chef-tools/catalog.js';
import {LANGUAGES} from '../public/coderunner/model.js';
import {TYPES} from '../public/round3/board-model.js';
import {matchesSearch} from '../public/tool-search.js';
import {CHAIN_ONLY_OPERATIONS} from '../public/capabilities/operation-policy.js';
import {INVERSES} from '../public/chef-tools/inverse.js';

const catalogue=JSON.parse(await readFile(new URL('../public/vendor/cyberchef/catalogue.json',import.meta.url),'utf8'));
const registry=createRegistry(catalogue);
const entry=id=>registry.byId.get(id);
const resolved=id=>resolveCapability(registry,id).entry;
const classified=classifyCatalogue(catalogue);

test('capabilities: retired selected reference databases have no discovery or learning entry',()=>{
  for(const route of ['integerseq','crystals','it-rfc','it-instructions',...['gaussian','quadratic','discreteLog','quadraticMod','squares','cubes','twoSquaresPower','continuedFraction','polynomial'].map(id=>'number-'+id)]){
    assert.equal(entry('native:'+route),undefined,route);
    assert.equal(entry('learn:function-native:'+route),undefined,route);
    assert.ok(!toolPages.some(page=>page.route===route),route);
    assert.ok(!searchEntries(registry,route).some(item=>item.id==='native:'+route),route);
    assert.ok(!registry.entries.some(item=>item.relatedIds?.includes('native:'+route)),route);
  }
  assert.equal(entry('native:sky').title,'深空天体目录');
  for(const operation of ['Disassemble x86','Disassemble ARM'])assert.ok(registry.byOperation.get(operation),operation);
  assert.ok(entry('native:model'));
});

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

test('capabilities: native hex editing and four IT information entries are directly discoverable',()=>{
  const hex=entry('native:hex-editor');assert.equal(hex.category,'media');assert.equal(hex.open.slice,'hex');assert.equal(hex.panel,'file');
  assert.ok(searchEntries(registry,'十六进制编辑器').some(item=>item.id===hex.id));
  for(const kind of ['ports','http','formats','domains']){
    const reference=entry('native:it-'+kind);assert.equal(reference.category,'reference');assert.equal(reference.group,'technical');
    assert.equal(reference.panel,'it-reference');assert.equal(reference.open.slice,kind);
    assert.ok(searchEntries(registry,reference.title).some(item=>item.id===reference.id));
  }
  assert.ok(entry('native:it-domains').relatedIds.includes(resolved('op:Parse%20URI').id));
  assert.equal(resolveCapability(registry,'op:Parse%20URI').op,'Parse URI');
});

test('capabilities: inverse pairs remain named tasks and retain exact engine operation IDs',()=>{
  const base64=entry('topic:base-family');
  assert.deepEqual(base64.sourceOperationIds.filter(op=>/^(To|From) Base64$/.test(op)),['To Base64','From Base64']);
  assert.deepEqual(base64.actions.filter(action=>/^(To|From) Base64$/.test(action.op)).map(direction=>[direction.operationId,direction.op]),[
    ['To Base64','To Base64'],['From Base64','From Base64']
  ]);
  assert.equal(base64.open.kind,'operation');
  assert.equal(base64.open.panel,'encoding');
  assert.equal(base64.open.group,'base');
  assert.equal(resolveCapability(registry,'pair:To%20Base64').entry.open.operation,'To Base64');
  assert.equal(base64.reversible,false,'a topic does not invent an inverse across different Base alphabets');
  assert.equal(base64.route,'encoding/base');
  assert.deepEqual(entry('native:a1z26').sourceOperationIds,['A1Z26 Cipher Encode','A1Z26 Cipher Decode']);
  assert.equal(entry('pair:A1Z26%20Cipher%20Encode'),undefined,'native and engine views cannot duplicate the task');
  assert.equal(resolved('op:RSA%20Sign').reversible,false);
  assert.equal(resolved('op:RSA%20Verify').reversible,false);
  assert.equal(resolved('op:MD5').reversible,false);
  assert.equal(resolved('native:hanzi-simplified').reversible,false,'many-to-one variants are not inverse transforms');
  assert.equal(INVERSES['RSA Sign'],undefined,'topic membership does not invent a signing inverse');
  assert.equal(INVERSES['RSA Verify'],undefined);
  for(const item of registry.entries.filter(item=>item.id.startsWith('pair:'))){
    assert.equal(item.sourceOperationIds.length,2);
    const classified=item.sourceOperationIds.map(id=>classifyCatalogue(catalogue).find(operation=>operation.op===id));
    assert.ok(classified.every(operation=>operation.mode==='task'));
    assert.equal(item.open.operation,classified[0].op,'the family opens its real first direction');
  }
});

test('capabilities: shared search selects an explicit direction without duplicating or mutating families',()=>{
  for(const [query,id,operation]of [
    ['From Base64','topic:base-family','From Base64'],
    ['Base64解码','topic:base-family','From Base64'],
    ['To Base64','topic:base-family','To Base64'],
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
  assert.equal(searchEntries(registry,'Base64').find(item=>item.id==='topic:base-family').preferredOperation,'To Base64');
  assert.equal(searchEntries(registry,'', 'codec').find(item=>item.id==='topic:base-family'),entry('topic:base-family'));
});

test('capabilities: exact names stay visible in bounded search without changing inventory or direction semantics',()=>{
  const inventory=registry.entries.map(item=>item.id);
  const coverage=structuredClone(registry.coverage);
  const visible=registry.entries.filter(item=>item.listed!==false);
  for(const query of ['ASCII','ＡＳＣＩＩ','  ascii  ']){
    const results=searchEntries(registry,query);
    assert.ok(results.length>1,'a concrete task remains ahead of its lesson and other metadata matches');
    assert.equal(results[0].id,'topic:character-codes','the named tool precedes its lesson and broad vocabulary');
    assert.equal(results[0].preferredVariant,'native:ascii','the shared topic retains the explicit ASCII mode');
    assert.ok(results.slice(0,60).some(item=>item.id==='topic:character-codes'),'the ASCII workspace remains directly visible through its topic');
    const originalMatches=visible.filter(item=>matchesSearch([item.title,...item.aliases,...item.sourceOperationIds,
      ...(item.actions||item.directions||[]).flatMap(action=>[action.op,action.label]),
      ...(item.variants||[]).flatMap(variant=>[variant.title,...variant.aliases]),
      ...(item.open.nativeDirections||[]).flatMap(direction=>[direction.label,...direction.aliases||[]])].join(' '),query));
    assert.deepEqual(new Set(results.map(item=>item.id)),new Set(originalMatches.map(item=>item.id)),
      'relevance changes order, never the matching set');
  }
  const ascii=searchEntries(registry,'ASCII');
  assert.deepEqual(searchEntries(registry,'ＡＳＣＩＩ').map(item=>item.id),ascii.map(item=>item.id));
  const fromBase64=searchEntries(registry,'From Base64');
  assert.equal(fromBase64[0].id,'topic:base-family','exact engine operation names outrank broad knowledge mentions');
  assert.equal(fromBase64[0].preferredOperation,'From Base64');
  assert.equal(entry('topic:base-family').preferredOperation,undefined,'ranking cannot mutate the family default');
  assert.ok(searchEntries(registry,'ASCII','knowledge').every(item=>item.category==='knowledge'));
  assert.equal(searchEntries(registry,'ASCII','knowledge')[0].id,'learn:function-topic:character-codes');
  for(const query of ['', '   ']){
    const results=searchEntries(registry,query);
    assert.deepEqual(results.map(item=>item.id),visible.map(item=>item.id),'empty search preserves navigation order');
    results.forEach((item,index)=>assert.equal(item,visible[index],'empty search preserves registry objects'));
  }
  const sameRank=ascii.filter(item=>!matchesSearch(item.title,'ASCII')&&!item.aliases.some(alias=>
    String(alias).normalize('NFKC').toLowerCase().replace(/\s+/g,'')==='ascii')&&
    !item.variants?.some(variant=>matchesSearch(variant.title,'ASCII')||variant.aliases.some(alias=>
      String(alias).normalize('NFKC').toLowerCase().replace(/\s+/g,'').startsWith('ascii')))&&
    !item.sourceOperationIds.some(op=>matchesSearch(op,'ASCII')));
  assert.deepEqual(sameRank.map(item=>item.id),visible.filter(item=>sameRank.some(result=>result.id===item.id)).map(item=>item.id),
    'broad-vocabulary ties retain deterministic inventory order');
  assert.deepEqual(registry.entries.map(item=>item.id),inventory);
  assert.deepEqual(registry.coverage,coverage);
});

test('capabilities: every declared two-direction family has one searchable owner',()=>{
  for(const [first,second] of CHEF_OPERATION_PAIRS){
    if(!catalogue.operations[first]||!catalogue.operations[second])continue;
    if([first,second].some(op=>classified.find(item=>item.op===op).mode!=='task'))continue;
    const owner=registry.byOperation.get(first);
    assert.equal(registry.byOperation.get(second),owner,first);
    assert.ok(owner.sourceOperationIds.includes(first));assert.ok(owner.sourceOperationIds.includes(second));
    if(CHAIN_ONLY_OPERATIONS.includes(first)){
      assert.ok(CHAIN_ONLY_OPERATIONS.includes(second));assert.equal(owner.listed,false);
      for(const op of [first,second]){
        const target=resolveCapability(registry,'op:'+encodeURIComponent(op));
        assert.equal(target.entry.id,'native:cyberchef');assert.equal(target.op,op,'hidden paired directions preserve their individual recipe intent');
        assert.equal(target.entry.open.operation,op);
      }
      continue;
    }
    assert.equal(searchEntries(registry,first).filter(item=>item.sourceOperationIds.includes(first)).length,1);
    assert.equal(searchEntries(registry,second).filter(item=>item.sourceOperationIds.includes(second)).length,1);
    const actions=owner.actions?.length?owner.actions:owner.directions||owner.variants?.flatMap(variant=>variant.directions||[])||[];
    assert.ok(actions.some(item=>item.op===first));assert.ok(actions.some(item=>item.op===second));
    assert.equal(INVERSES[first],second);assert.equal(INVERSES[second],first);
    const decode=resolveCapability(registry,'op:'+encodeURIComponent(second));
    assert.equal(decode.entry.id,owner.id);assert.equal(decode.op,second);
    if(['operation','mixed'].includes(owner.topicKind))assert.equal(decode.entry.open.operation,second);
    else if(decode.entry.open.kind==='native')assert.ok(decode.entry.open.operationControls.some(control=>control.op===second),'native direction still owns its original form controls');
  }
  assert.equal(registry.byOperation.size,505);
  assert.equal(entry('pair:PGP%20Encrypt%20and%20Sign'),undefined,'a topic member does not remain a duplicate entry');
  assert.equal(resolved('pair:PGP%20Encrypt%20and%20Sign').id,'topic:pgp');
  const caseRegex=resolveCapability(registry,'pair:To%20Case%20Insensitive%20Regex');
  assert.equal(caseRegex.entry.id,'native:cyberchef');assert.equal(caseRegex.op,'To Case Insensitive Regex');
  for(const op of ['RSA Sign','RSA Verify','SHA2','Bcrypt','Bcrypt compare']){
    assert.equal(INVERSES[op],undefined,'signing, hashes and checks are not guessed inverses');
    const owner=registry.byOperation.get(op);
    assert.ok(owner.actions.some(action=>action.op===op),'a consolidated topic still selects this exact real action');
    assert.equal(resolveCapability(registry,'op:'+encodeURIComponent(op)).op,op);
  }
});

test('capabilities: legacy operation IDs select the exact direction without duplicating inventory',()=>{
  for(const item of registry.entries){
    for(const op of item.sourceOperationIds){
      const resolved=resolveCapability(registry,'op:'+encodeURIComponent(op));
      if(['chain','recipe-only'].includes(item.mode))assert.equal(resolved.entry.id,'native:cyberchef',op+' belongs to the single recipe workspace');
      else {
        assert.equal(resolved.entry.id,item.id,op);
        if(item.topicKind==='operation')assert.deepEqual(resolved.entry.open,registry.operationTargets.get(op),'a topic opens the original operation form, not its default');
        else if(item.variants?.length){
          const variant=item.variants.find(variant=>variant.sourceOperationIds.includes(op));assert.ok(variant,op+' retains a real member');
          assert.equal(resolved.entry.variantId,variant.id);assert.deepEqual(resolved.entry.open,variant.open);
        }else assert.equal(resolved.entry,item,op);
      }
      assert.equal(resolved.op,op,'a decode deep link cannot silently open encode');
    }
  }
  const native=resolveCapability(registry,'pair:To%20HTML%20Entity');
  assert.equal(native.entry.id,'topic:text-escapes');assert.equal(native.entry.variantId,'native:escape-html');
  assert.equal(native.op,'To HTML Entity');
  const fallback=resolveCapability(registry,'pair:To%20Base64','RSA Decrypt','unregistered');
  assert.equal(fallback.op,'To Base64','an invalid operation retains the validated legacy alias default');
  assert.equal(fallback.direction,undefined);
  assert.deepEqual(resolveCapability(registry,'unregistered'),{entry:undefined,op:undefined,direction:undefined});
  assert.equal(registry.entries.some(item=>item.id==='op:From%20Base64'),false);
  assert.equal(registry.coverage.coveredOperationCount,505);
});

test('capabilities: internal flow requests resolve to the one recipe owner without changing inventory or ordinary entry',()=>{
  const owner=entry('native:cyberchef'),originalOpen=owner.open;
  for(const source of registry.entries.filter(item=>item.mode==='chain')){
    for(const resolved of [resolveCapability(registry,source.id),resolveCapability(registry,owner.id,source.op)]){
      assert.equal(resolved.entry.id,owner.id);assert.notEqual(resolved.entry,owner,'insertion intent is transient');
      assert.equal(resolved.entry.listed,owner.listed);assert.equal(resolved.entry.open.kind,'recipe');
      assert.equal(resolved.entry.open.operation,source.op);assert.equal(resolved.op,source.op);
      assert.equal(resolved.entry.open.panel,'cyberchef');assert.equal(resolved.entry.route,'cyberchef');
      assert.deepEqual(resolved.entry.sourceOperationIds,owner.sourceOperationIds);
    }
    assert.equal(registry.byOperation.get(source.op),source);assert.equal(source.listed,false);
  }
  const ordinary=resolveCapability(registry,owner.id);
  assert.equal(ordinary.entry,owner);assert.equal(ordinary.op,undefined);
  assert.equal(owner.open,originalOpen);assert.equal(owner.open.kind,'native');
  assert.equal(resolveCapability(registry,owner.id,'Optical Character Recognition').entry,owner);
  assert.equal(resolveCapability(registry,owner.id,'Optical Character Recognition').op,undefined);
  assert.equal(resolveCapability(registry,'op:Optical%20Character%20Recognition').entry.listed,false);
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
  assert.deepEqual(registry.coverage.sourceModes,{task:489,retained:5,chain:10,existing:1},'upstream inventory modes remain separate from the active discovery policy');
  const retained=registry.entries.filter(item=>item.mode==='retained');
  assert.equal(retained.length,5);
  for(const item of retained){
    assert.equal(item.listed,false);
    assert.equal(item.open.kind,'recipe');
    assert.equal(item.route,'cyberchef');
    assert.equal(item.execution,'complete-workspace-only');
    assert.ok(registry.groups.every(group=>!group.entryIds.includes(item.id)));
  }
  const recipeOnly=registry.entries.filter(item=>item.mode==='recipe-only');
  assert.equal(registry.coverage.visibleEntryCount,registry.entries.length-15-recipeOnly.length);
  assert.equal(registry.groups.reduce((total,group)=>total+group.count,0),registry.coverage.visibleEntryCount);
  assert.equal(searchEntries(registry,'Optical Character Recognition').length,0);
  const fork=entry('op:Fork');
  assert.equal(fork.open.kind,'recipe');
  assert.equal(fork.open.operation,'Fork');
  assert.equal(fork.mode,'chain');
  const flow=registry.entries.filter(item=>item.mode==='chain');assert.equal(flow.length,10);
  for(const item of flow){
    assert.equal(item.listed,false);assert.deepEqual(item.learningIds,[]);
    assert.ok(registry.groups.every(group=>!group.entryIds.includes(item.id)));
    assert.equal(entry('learn:function-'+item.id),undefined,'internal recipe controls are not independent lessons');
    assert.equal(registry.byOperation.get(item.op),item,'original operation identity remains owned');
  }
  assert.deepEqual(registry.groups.find(group=>group.id==='pipeline').entryIds,['native:cyberchef']);
  assert.ok(searchEntries(registry,'Fork').some(item=>item.id==='native:cyberchef'));
  assert.ok(!searchEntries(registry,'Fork').some(item=>item.id==='op:Fork'));
  assert.deepEqual(recipeOnly.flatMap(item=>item.sourceOperationIds).sort(),[...CHAIN_ONLY_OPERATIONS].sort());
  for(const item of recipeOnly){
    assert.equal(item.listed,false);assert.deepEqual(item.learningIds,[]);
    assert.ok(!registry.groups.some(group=>group.entryIds.includes(item.id)));
    assert.equal(entry('learn:function-'+item.id),undefined);
    for(const op of item.sourceOperationIds){
      assert.equal(registry.byOperation.get(op),item,'an internal original ID still owns its single source row');
      const selected=resolveCapability(registry,'op:'+encodeURIComponent(op));
      assert.equal(selected.entry.id,'native:cyberchef');assert.equal(selected.op,op);
      assert.equal(selected.entry.open.kind,'recipe');assert.equal(selected.entry.open.operation,op);
      assert.ok(!searchEntries(registry,op).some(candidate=>candidate.id===item.id));
    }
  }
  const unzip=entry('op:Unzip');
  assert.equal(unzip.mode,'existing');
  assert.equal(unzip.open.kind,'native');
  assert.equal(unzip.route,'file');
  assert.equal(unzip.open.anchor,'#archive-list');
  assert.equal(unzip.open.slice,'archive');
});

test('capabilities: default and secondary native operations activate actual controls and shared materials',()=>{
  assert.equal(resolved('native:ascii').route,'basics/ascii');
  assert.equal(resolved('native:utf8').route,'basics/characters');
  assert.deepEqual(resolved('native:utf8').open.controls,[{selector:'#basics-format',value:'hex',event:'change'}]);
  assert.equal(entry('native:a1z26').route,'basics/letters');
  for(const id of ['a1z26','escape-hex','escape-unicode','escape-html','escape-url']){
    const item=resolved('native:'+id),variant=item.variants?.find(variant=>variant.id==='native:'+id)||item;
    assert.deepEqual(item.open.operationControls,variant.sourceOperationIds.map((op,index)=>({op,
      controls:[{selector:'#basics-direction',value:index===0?'encode':'decode',event:'change'}]
    })));
  }
  assert.equal(resolved('native:codepoint').open.controls[0].value,'codepoint');
  for(const format of ['hex','unicode','html','url']){
    const item=resolved('native:escape-'+format);
    assert.equal(item.route,'basics/escapes');
    assert.equal(item.open.controls[0].value,format);
    assert.equal(item.variants.find(variant=>variant.id===item.variantId).sourceOperationIds.length,2);
  }
  assert.equal(entry('native:tapcode').open.controls[0].value,'tap');
  assert.equal(entry('native:polybius').open.controls[0].value,'polybius');
  for(const [id,value]of [['native:hanzi-cangjie','cangjie'],['native:hanzi-wubi','wubi']]){
    assert.equal(entry(id),undefined);assert.equal(resolved(id).taskId,id);
    assert.equal(resolved(id).open.controls[0].value,value);
  }
  assert.equal(resolved('native:word-grid').open.controls.at(-1).value,'straight');
  assert.equal(resolved('native:word-boggle').open.controls.at(-1).value,'boggle');
  assert.equal(entry('native:image-planes').open.engine,'aperi');
  assert.equal(entry('native:image-steg').open.engine,'steg');
  assert.deepEqual(entry('native:image-color').open.tab,{panel:'image',id:'compare'});
  assert.equal(entry('native:image-color').open.slice,'color');
  assert.equal(entry('native:image-stereo').open.anchor,'#stereo-shift');
  assert.deepEqual(entry('native:audio-play').open.tab,{panel:'audio',id:'play'});
  assert.equal(entry('native:audio-sstv').open.slice,'sstv');
  assert.equal(resolved('native:video-gif').open.controls[0].value,'gif');
  assert.equal(resolved('native:video-gif').open.controls[0].event,'input');
  for(const language of Object.keys(LANGUAGES)){
    const id=language==='brainfuck'?'native:code':'native:code-'+language,item=resolved(id);
    assert.equal(item.id,'topic:code-runner');assert.equal(item.taskId,id);
    assert.equal(item.open.controls[0].selector,'#code-language');
    assert.equal(item.open.controls[0].value,language);
  }
  for(const type of Object.keys(TYPES)){
    const id=type==='sudoku'?'native:paper':'native:paper-'+type,item=resolved(id);
    assert.equal(item.id,'topic:paper-puzzles');assert.equal(item.taskId,id);
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
  assert.equal(entry('native:sequence').category,'reference');
  assert.equal(entry('native:sequence-processing').category,'other');
  assert.ok(entry('native:sequence').relatedIds.includes('native:sequence-processing'));
  for(const item of registry.entries)for(const id of item.relatedIds||[])assert.ok(entry(id));
});

test('capabilities: Chinese, English, normalized aliases and nondefault operations remain discoverable',()=>{
  const cases=[['ASCII','native:ascii'],['A1Z26','native:a1z26'],['四角','native:hanzi-code'],
    ['仓颉','native:hanzi-cangjie'],['五笔','native:hanzi-wubi'],['歇后语','native:hanzi-xhy'],
    ['Boggle','native:word-boggle'],['SSTV','native:audio-sstv'],['图片取色','native:image-color'],
    ['ToBase64','pair:To%20Base64'],['ＭＤ５','op:MD5'],['CIF','native:model']];
  for(const [query,id] of cases){
    const canonical=resolved(id);assert.ok(canonical,id+' remains a real target');
    const match=searchEntries(registry,query).find(item=>item.id===canonical.id);
    assert.ok(match,query+' discovers the canonical topic');
    if(canonical.taskId&&canonical.taskId!==canonical.id&&['仓颉','五笔','歇后语','Boggle'].includes(query))assert.equal(match.preferredVariant,id);
  }
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
