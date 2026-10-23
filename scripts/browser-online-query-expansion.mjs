import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {extname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {chooseNativeTask,go} from './browser-navigation.mjs';
import {QUERY_PAGES} from '../public/online-query/catalog.js';
import {QUERY_PROVIDERS} from '../services/online-query/provider-service.mjs';
import {TASK_PROJECT_SOURCES} from '../public/project-source-contracts.js';
import {projectLicense} from '../public/project-licenses.js';

const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.wasm':'application/wasm'};
const directory=resolve(tmpdir(),'mist-online-query-expansion');await mkdir(directory,{recursive:true});
const examples={
 'zdic:search':{query:'不言而喻'},
 'cnkgraph:search':{query:'床前明月光',author:'李白',dynasty:'唐朝',exact:true,page:0},'cnkgraph:detail':{id:26460},
 'cnkgraph:tune-search':{query:'水调歌头'},'cnkgraph:tune-detail':{id:90},'cnkgraph:tune-pattern':{query:'对潇潇暮雨洒江天'},'cnkgraph:rhyme':{book:'平水韵',query:'青'},
 'simbad:name':{query:'M31',after:0},'simbad:cone':{ra:10.68,dec:41.2,radius:0.01,after:0},'simbad:detail':{oid:123,section:'basic'},
 'vizier:catalogs':{query:'Hipparcos'},'vizier:columns':{table:'I/239/hip_main'},'vizier:records':{table:'I/239/hip_main',conditions:[{column:'HIP',operator:'=',value:'1'}],cone:{ra:10.68,dec:41.2,radius:0.01},offset:0},
 'cod:search':{query:'quartz',formula:'Si O2',elements:['Si','O'],excludeElements:['Au'],spacegroup:'P 1',year:2020,doi:'10.1000/example',start:0},'cod:detail':{id:'1000000'},'cod:cif':{id:'1000000'},
 'pubchem:search':{kind:'name',query:'aspirin',start:0},'pubchem:detail':{cid:2244},'pubchem:synonyms':{cid:2244},'pubchem:structure':{cid:2244,dimension:'2d'},
 'placenames:search':{stName:'北京',code:'11',placeTypeCode:'111',year:2025,searchType:'模糊',page:1,size:10},'placenames:detail':{id:'place_1'},'placenames:divisions':{code:'11',year:2025,maxLevel:1},
 'placenames:same-name-region':{name:'北京',distCode:'11'},'placenames:same-name-type':{name:'北京',distCode:'11'},'placenames:same-pinyin-region':{name:'Beijing',distCode:'11'},'placenames:same-pinyin-type':{name:'Beijing',distCode:'11'},
 'pokewiki:search':{query:'皮卡丘',page:0},'pokewiki:detail':{query:'皮卡丘'}
};
const providers=new Map(QUERY_PROVIDERS.map(provider=>[provider.id,provider]));
const longText='完整原始大字段。'.repeat(1600)+'END_OF_UNTRUNCATED_RECORD';
const fixtureFields={rawText:longText,html:'<img src="https://evil.test/pixel" onerror="window.__queryInjected=true"><script>window.__queryInjected=true</script>',unknown:{array:[1,null,'全量字段'],nested:{preserved:true}}};
function envelope(spec,submitted,parameters){
 const query=String(parameters.query??parameters.stName??parameters.cid??parameters.id??parameters.oid??parameters.table??parameters.name??'全国');
 const actions=spec.id==='simbad'&&submitted.mode==='name'?[{label:'查询完整对象记录',parameters:{mode:'detail',oid:123,section:'identifiers',after:''}}]:spec.id==='cnkgraph'&&submitted.mode==='tune-search'?[{label:'查询完整词谱',parameters:{mode:'tune-detail',id:90}}]:[];
 const records=[0,1].map(index=>({id:String(index+1),title:query+' · '+(index+1),summary:'完整测试记录',sourceURL:spec.home,fields:{...fixtureFields,position:index,...(spec.id==='cod'&&submitted.mode==='cif'?{cif:'data_complete\n_cell_length_a 5.43\n# ORIGINAL_CIF_END'}:{})},...(index===0&&actions.length?{actions}:{})}));
 const next=spec.id==='simbad'&&submitted.mode==='name'&&parameters.after===0?{...submitted,after:100}:null;
 return{provider:spec.id,query,submitted,parameters,records,total:null,next,raw:{upstreamComplete:true,additionalContext:['全部',query]},attribution:{name:spec.title,credit:spec.title+' 及原记录贡献者',license:spec.id==='pokewiki'?'文字 CC BY-NC-SA 3.0':spec.id==='zdic'?'CC0 1.0':'原站公开查询使用条款',termsURL:spec.home},fetchedAt:'2026-10-17T12:00:00.000Z',sourceURL:spec.home};
}
async function production(width,motion){
 const prefix=width<1100?'/toolbox/':'/',base='https://arg.test'+prefix,requests=[],external=[],errors=[],missing=[],gates=[];let failure=null;
 const context=await browser.newContext({viewport:{width,height:950},hasTouch:width<1100,reducedMotion:motion,permissions:['clipboard-read','clipboard-write']});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());if(['blob:','data:'].includes(url.protocol))return route.continue();if(url.hostname!=='arg.test'){external.push(url.href);return route.abort();}
  try{
   assert.ok(url.pathname.startsWith(prefix),'deployment resources preserve subdirectory');const path=url.pathname.slice(prefix.length)||'index.html',match=/^api\/query\/([a-z]+)$/.exec(path);
   if(match){
    const id=match[1],spec=QUERY_PAGES.find(page=>page.id===id),provider=providers.get(id);assert.ok(spec&&provider,'real registered provider');assert.equal(route.request().method(),'POST');const submitted=route.request().postDataJSON(),parameters=provider.validate(submitted);requests.push({id,submitted,parameters});
    if(failure){const current=failure;failure=null;return route.fulfill(current);}
    const gate=gates.find(item=>!item.used);if(gate){gate.used=true;gate.started();await gate.wait;}
    await route.fulfill({contentType:'application/json',body:JSON.stringify(envelope(spec,submitted,parameters)),headers:{'Cache-Control':'no-store'}});gate?.finished();return;
   }
   return route.fulfill({body:await readFile(resolve('public',path)),contentType:mime[extname(path)]||'application/octet-stream'});
  }catch(error){if(/closed|intercept|disposed|target/i.test(error.message)&&url.pathname.includes('/api/query/'))return;missing.push(url.pathname+': '+error.message);await route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({code:'TEST_SCHEMA_FAILURE',message:error.message})}).catch(()=>{});}
 });
 const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));await page.goto(base+'#home');await page.locator('#panel-home [data-capability]').first().waitFor();
 return{page,context,requests,base,gate(){let started,release,finished;const wait=new Promise(resolve=>release=resolve),pending=new Promise(resolve=>started=resolve),done=new Promise(resolve=>finished=resolve);gates.push({wait,started,finished,used:false});return{started:pending,release,done};},fail(value){failure=value;},check(){assert.deepEqual({external,errors,missing},{external:[],errors:[],missing:[]});assert.equal(context.pages().length,1);}};
}
async function modeForm(page,spec,id,values=examples[spec.id+':'+id]){
 assert.ok(values,'regression example exists for '+spec.id+':'+id);await page.locator('#'+spec.id+'-mode').selectOption(id);
 const mode=spec.modes.find(mode=>mode.id===id);
 for(const field of mode.fields){const prefix=spec.id+'-'+id+'-',value=values[field.name];
  if(field.type==='conditions'){
   const row=value?.[0];for(const [name,v]of Object.entries(row||{})){const node=page.locator('#'+prefix+'condition-0-'+name);if(name==='operator')await node.selectOption(String(v));else await node.fill(String(v));}
  }else if(field.type==='cone'){for(const key of ['ra','dec','radius'])await page.locator('#'+prefix+'cone-'+key).fill(value?String(value[key]):'');}
  else{const node=page.locator('#'+prefix+field.name);if(field.type==='choice'){if(value!==undefined)await node.selectOption(String(value));}
   else await node.fill(value===undefined?(field.value===undefined?'':String(field.value)):Array.isArray(value)?value.join(' '):String(value));}
 }
}
async function footer(page,spec){const node=page.locator('#panel-'+spec.id+'>.tool-provenance');await node.waitFor({state:'visible'});assert.ok((await node.textContent()).length>30,spec.id+' complete source footer');assert.equal(await node.evaluate(node=>node.parentElement.lastElementChild===node),true,spec.id+' sources follow all body, results and help');const disclosure=node.locator('details.project-notices');assert.equal(await disclosure.count(),1,spec.id+' exposes bundled original terms in its real task footer');await disclosure.locator('summary').click();const expected=projectLicense(TASK_PROJECT_SOURCES['native:'+spec.id].urls[0]).notices;await page.waitForFunction(({id,count})=>document.querySelectorAll('#panel-'+id+' .tool-provenance a[data-project-notice]').length===count,{id:spec.id,count:expected.length});assert.deepEqual(await disclosure.locator('a[data-project-notice]').evaluateAll(links=>links.map(link=>({path:link.dataset.projectNotice,origin:new URL(link.href).origin}))),expected.map(path=>({path,origin:new URL(page.url()).origin})));await disclosure.locator('a[data-project-notice]').first().click();await disclosure.locator('pre').first().waitFor();assert.equal(await disclosure.locator('pre').first().textContent(),await readFile(resolve('public',expected[0]),'utf8'),spec.id+' original terms are viewable in place without a forced download');await disclosure.locator('summary').click();}
async function ready(page,id){await page.locator('#'+id+'-status').filter({hasText:'查询完成'}).waitFor();}
async function query(page,spec){await page.locator('#'+spec.id+'-run').click();await ready(page,spec.id);}
async function exported(page,selector){const pending=page.waitForEvent('download');await page.locator(selector).click();return JSON.parse(await readFile(await(await pending).path(),'utf8'));}
async function allModes(scope){
 const {page,requests}=scope;let count=0;
 assert.equal(QUERY_PAGES.length,8);assert.equal(QUERY_PAGES.reduce((sum,spec)=>sum+spec.modes.length,0),Object.keys(examples).length,'every real UI mode has a behavior example');
 for(const spec of QUERY_PAGES){
  const before=requests.length;await chooseNativeTask(page,'native:'+spec.id);assert.equal(requests.length,before,'entering '+spec.id+' never queries');assert.match(await page.locator('#'+spec.id+'-online-notice').textContent(),/当次条件.*本站服务器.*需要联网.*不保存/);await footer(page,spec);
  for(const mode of spec.modes){
   const n=requests.length;await modeForm(page,spec,mode.id);assert.equal(requests.length,n,'typing/switching '+spec.id+':'+mode.id+' never queries');
   const form=page.locator('#panel-'+spec.id+' .online-query-form');assert.equal(await form.evaluate(form=>form.checkValidity()),true,spec.id+':'+mode.id+' native form validation');
   const input=form.locator('input:visible').first();if(await input.count())await input.press('Enter');else await page.locator('#'+spec.id+'-run').click();await ready(page,spec.id);assert.equal(requests.length,n+1);assert.equal(requests.at(-1).id,spec.id);assert.equal(requests.at(-1).submitted.mode,mode.id);
   assert.equal(await page.locator('#'+spec.id+'-detail img').count(),0);assert.equal(await page.evaluate(()=>Boolean(window.__queryInjected)),false);await footer(page,spec);count++;
  }
 }
 console.log('PASS: '+count+' real UI mode submissions match their actual backend validators; eight providers enter/type/switch without external requests.');
 return count;
}
async function conditionOwnership(scope){
 const {page,requests}=scope,spec=QUERY_PAGES.find(spec=>spec.id==='vizier');await chooseNativeTask(page,'native:vizier');await modeForm(page,spec,'records');const before=requests.length,rows=page.locator('#panel-vizier .online-query-conditions'),add=page.locator('#panel-vizier').getByRole('button',{name:'添加筛选条件',exact:true});
 await add.click();await add.click();assert.equal(await rows.getByRole('button',{name:'移除此条件',exact:true}).count(),3);await rows.getByRole('button',{name:'移除此条件',exact:true}).first().click();await add.click();
 const labels=await rows.evaluate(root=>({ids:[...root.querySelectorAll('[id]')].map(node=>node.id),labels:[...root.querySelectorAll('label[for]')].map(node=>({for:node.htmlFor,found:root.querySelectorAll('[id]').length&&[...root.querySelectorAll('[id]')].filter(control=>control.id===node.htmlFor).length}))}));assert.equal(new Set(labels.ids).size,labels.ids.length,'removing then adding a condition never reuses a control ID');assert.ok(labels.labels.every(label=>label.found===1),'every dynamic condition label owns exactly one control');
 while(await rows.getByRole('button',{name:'移除此条件',exact:true}).count()<8)await add.click();assert.equal(await add.isDisabled(),true);await page.locator('#vizier-mode').selectOption('columns');await page.locator('#vizier-mode').selectOption('records');assert.equal(await rows.getByRole('button',{name:'移除此条件',exact:true}).count(),8);assert.equal(await add.isDisabled(),true,'mode restoration preserves the eight-condition limit');assert.equal(requests.length,before,'editing conditions and modes never sends a query');scope.check();console.log('PASS: dynamic VizieR condition IDs/labels remain unique after removal and insertion, and mode restoration preserves the eight-row bound.');
}
async function behavior(scope,width,motion){
 const {page,requests}=scope,spec=QUERY_PAGES.find(spec=>spec.id==='simbad');await chooseNativeTask(page,'native:simbad');await modeForm(page,spec,'name');await query(page,spec);
 const full=await exported(page,'#simbad-download-page'),selected=await exported(page,'#simbad-download');assert.equal(full.records.length,2);assert.equal(selected.record.fields.rawText,longText);assert.deepEqual(selected.record.fields.unknown,fixtureFields.unknown);assert.deepEqual(full.raw,{upstreamComplete:true,additionalContext:['全部','M31']});assert.deepEqual(selected.submitted,requests.at(-1).submitted);assert.match(selected.record.fields.html,/<script>/);assert.equal(selected.attribution.credit,full.attribution.credit);assert.equal(selected.fetchedAt,full.fetchedAt);
 assert.equal(await page.locator('#simbad-detail [data-query-original],#simbad-detail pre').count(),0,'raw interface data is not generated in the reading area');
 assert.equal(await page.locator('#simbad-detail img,#simbad-detail script').count(),0,'reading data never creates upstream HTML');assert.equal(await page.evaluate(()=>Boolean(window.__queryInjected)),false);
 await page.locator('#simbad-copy').click();assert.deepEqual(JSON.parse(await page.evaluate(()=>navigator.clipboard.readText())),selected);
 await page.evaluate(async()=>{const {connectNotebook}=await import('./handoff/button.js'),{connectGraphics}=await import('./graphics/bridge.js');connectNotebook(request=>{window.__queryNote=request;window.__queryNoteValue=request.read();});connectGraphics(request=>{window.__queryGraphic=request;window.__queryGraphicValue=request.read();});});
 await page.locator('#simbad-record-notebook').click();assert.match(await page.evaluate(()=>window.__queryNoteValue.text),/END_OF_UNTRUNCATED_RECORD/);assert.match(await page.evaluate(()=>window.__queryNoteValue.text),/原记录贡献者/);
 await page.locator('#simbad-records [data-query-record="2"]').click();assert.equal(await page.evaluate(()=>window.__queryNote.isCurrent()),false,'record selection invalidates the note chooser');
 await page.locator('#simbad-record-graphics').click();assert.match(await page.evaluate(()=>window.__queryGraphicValue.text),/END_OF_UNTRUNCATED_RECORD/);await page.locator('#simbad-name-query').fill('changed');assert.equal(await page.evaluate(()=>window.__queryGraphic.isCurrent()),false);assert.equal(await page.locator('#simbad-download').isDisabled(),true);
 await modeForm(page,spec,'name');await query(page,spec);await page.locator('#simbad-next').click();await ready(page,'simbad');assert.equal(requests.at(-1).submitted.after,100);assert.equal(await page.locator('#simbad-name-after').inputValue(),'100','page parameters visibly update the form');await page.locator('#simbad-previous').click();await ready(page,'simbad');assert.equal(requests.at(-1).submitted.after,0);
 await page.locator('#simbad-detail [data-query-action]').click();await ready(page,'simbad');assert.equal(await page.locator('#simbad-mode').inputValue(),'detail');assert.equal(await page.locator('#simbad-detail-oid').inputValue(),'123');assert.equal(await page.locator('#simbad-detail-section').inputValue(),'identifiers');assert.deepEqual(requests.at(-1).submitted,{mode:'detail',oid:123,section:'identifiers',after:''});assert.equal(requests.at(-1).parameters.after,'');
 await page.locator('#simbad-record-notebook').click();const n=requests.length;await page.locator('#simbad-mode').selectOption('name');assert.equal(await page.evaluate(()=>window.__queryNote.isCurrent()),false);assert.equal(requests.length,n);assert.equal(await page.locator('#simbad-download').isDisabled(),true);assert.equal(await page.locator('#simbad-name-query').inputValue(),'M31','switching mode preserves its draft');
 // Ignore browser cancellation to prove stale replies are rejected by revision.
 await page.evaluate(()=>{window.__queryFetch=window.fetch;window.__queryArrivals=0;window.fetch=(url,options)=>String(url).includes('/api/query/')?window.__queryFetch(url,{...options,signal:undefined}).then(response=>{window.__queryArrivals++;return response;}):window.__queryFetch(url,options);});
 let gate=scope.gate();await page.locator('#simbad-run').click();await gate.started;await page.locator('#simbad-stop').click();assert.match(await page.locator('#simbad-status').textContent(),/已停止/);await page.locator('#simbad-name-query').fill('fresh after stop');await query(page,spec);let arrivals=await page.evaluate(()=>window.__queryArrivals);gate.release();await gate.done;await page.waitForFunction(count=>window.__queryArrivals>count,arrivals);assert.match(await page.locator('#simbad-detail').textContent(),/fresh after stop/);
 gate=scope.gate();await page.locator('#simbad-run').click();await gate.started;await page.locator('#simbad-name-query').fill('fresh after input');assert.equal(await page.locator('#simbad-stop').isDisabled(),true);await query(page,spec);arrivals=await page.evaluate(()=>window.__queryArrivals);gate.release();await gate.done;await page.waitForFunction(count=>window.__queryArrivals>count,arrivals);assert.match(await page.locator('#simbad-detail').textContent(),/fresh after input/);
 gate=scope.gate();await page.locator('#simbad-run').click();await gate.started;await page.locator('#simbad-mode').selectOption('detail');assert.equal(await page.locator('#simbad-download').isDisabled(),true);arrivals=await page.evaluate(()=>window.__queryArrivals);gate.release();await gate.done;await page.waitForFunction(count=>window.__queryArrivals>count,arrivals);assert.equal(await page.locator('#simbad-download').isDisabled(),true);
 await modeForm(page,spec,'name');await query(page,spec);await page.locator('#simbad-record-notebook').click();await go(page,'about');assert.equal(await page.evaluate(()=>window.__queryNote.isCurrent()),false);const navigationCount=requests.length;await chooseNativeTask(page,'native:simbad');assert.equal(requests.length,navigationCount,'returning never replays the query');assert.equal(await page.locator('#simbad-download').isDisabled(),true);
 gate=scope.gate();await page.locator('#simbad-run').click();await gate.started;await go(page,'about');arrivals=await page.evaluate(()=>window.__queryArrivals);gate.release();await gate.done;await page.waitForFunction(count=>window.__queryArrivals>count,arrivals);await chooseNativeTask(page,'native:simbad');assert.equal(await page.locator('#simbad-download').isDisabled(),true,'late navigation result stays invalid');
 scope.fail({status:429,contentType:'application/json',headers:{'Retry-After':'500'},body:JSON.stringify({message:'原站暂时限流。'})});await page.locator('#simbad-run').click();await page.locator('#simbad-status').filter({hasText:'500 秒'}).waitFor();assert.equal(await page.locator('#simbad-download').isDisabled(),true);assert.equal(await page.locator('#simbad-name-query').inputValue(),'M31');
 scope.fail({status:200,contentType:'text/html',body:'<html>静态托管</html>'});await page.locator('#simbad-run').click();await page.locator('#simbad-status').filter({hasText:'后端查询服务'}).waitFor();
 await page.evaluate(()=>{window.fetch=window.__queryFetch;});await query(page,spec);await footer(page,spec);
 await page.locator('#panel-simbad .tool-help-button').click();await page.locator('#tool-help-simbad').waitFor({state:'visible'});assert.match(await page.locator('#tool-help-simbad').textContent(),/联网|在线|服务器|查询/);await footer(page,spec);await page.locator('#panel-simbad .tool-help-button').click();
 await page.locator('#simbad-name-query').focus();assert.equal(await page.locator('#simbad-name-query').evaluate(node=>document.activeElement===node),true);await page.keyboard.press('Tab');assert.equal(await page.locator('#simbad-name-after').evaluate(node=>document.activeElement===node),true);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no document overflow at '+width);await page.screenshot({path:resolve(directory,'simbad-'+width+'-'+motion+'.png'),fullPage:true});
 if(width<1100){const viz=QUERY_PAGES.find(spec=>spec.id==='vizier');await chooseNativeTask(page,'native:vizier');await modeForm(page,viz,'records');await query(page,viz);await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'composite filters and coordinates fit 200% text at '+width);await page.evaluate(()=>document.documentElement.style.fontSize='');await page.screenshot({path:resolve(directory,'vizier-'+width+'-'+motion+'.png'),fullPage:true});await footer(page,viz);}
 scope.check();
}
try{
 const summary=[];
 const phase=process.env.QUERY_EXPANSION_PHASE,behaviorOnly=phase==='behavior',conditionsOnly=phase==='conditions';if(phase)console.log('FOCUSED: '+phase+'; prior unchanged scenarios are retained separately.');
 for(const[width,motion]of [[1440,'no-preference'],[390,'reduce'],[320,'no-preference']]){if(conditionsOnly&&width!==1440)continue;const scope=await production(width,motion);try{const modes=width===1440&&!behaviorOnly&&!conditionsOnly?await allModes(scope):0;if(!conditionsOnly)await behavior(scope,width,motion);if(width===1440)await conditionOwnership(scope);summary.push({width,motion,modes,requests:scope.requests.length,passed:true});}catch(error){await scope.page.screenshot({path:resolve(directory,'failure-'+width+'.png'),fullPage:true}).catch(()=>{});throw error;}finally{await scope.context.close();}}
 await writeFile(resolve(directory,phase?`report-${phase}.json`:'report.json'),JSON.stringify(summary,null,2));console.log(conditionsOnly?'PASS: focused dynamic condition identity/label/boundary regression.':'PASS: complete exports and inert source text, source footers after dynamic content, note/graphics leases, explicit actions/paging, stale-response rejection, keyboard/help, PC/mobile/subdirectory and normal/reduced-motion layout.');
}finally{await browser.close();}
