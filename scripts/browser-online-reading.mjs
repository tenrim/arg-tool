// Reading/presentation regression only. Provider protocol, cancellation and all
// query modes remain owned by browser-online-query(-expansion). No live calls.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {extname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {chooseNativeTask} from './browser-navigation.mjs';
import {QUERY_PAGES} from '../public/online-query/catalog.js';
import {QUERY_PROVIDERS} from '../services/online-query/provider-service.mjs';
import {queryParameters,recordSnapshot} from '../public/online-query/model.js';
import {externalSnapshot} from '../public/online-query/external-model.js';
import {TASK_PROJECT_SOURCES} from '../public/project-source-contracts.js';
import {projectLicense} from '../public/project-licenses.js';

const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const artifacts=resolve(tmpdir(),'mist-online-reading');await mkdir(artifacts,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.wasm':'application/wasm'};
const providers=new Map(QUERY_PROVIDERS.map(provider=>[provider.id,provider]));
const fixture=async name=>JSON.parse(await readFile(new URL('../tests/fixtures/online-reading/'+name+'.json',import.meta.url),'utf8'));
const clone=value=>JSON.parse(JSON.stringify(value));
const archiveCIF=await readFile(new URL('../upstream/reference/sources/crystals/9000305.cif',import.meta.url),'utf8');
const cases=[
 {id:'oeis',parameters:{query:'A001129',start:0},fixture:{record:await fixture('reference/oeis-A001129')},checks:['数列项','0, 1, 1, 2, 3, 5','数列信息','相关数列']},
 {id:'zdic',parameters:{mode:'search',query:'明'},fixture:await fixture('zdic-character'),checks:['读音与字形','拼音','míng','部首','基本解释']},
 {id:'cnkgraph',parameters:{mode:'detail',id:81185},fixture:await fixture('cnk-writing'),checks:['作品资料','司馬光','北宋','正文','古廟崩榱在']},
 {id:'simbad',parameters:{mode:'name',query:'M31',after:0},fixture:await fixture('science/simbad-name'),checks:['天体身份','M  31','位置与运动','赤经','10.684708333333333 deg','ICRS','J2000']},
 {id:'vizier',parameters:{mode:'records',table:'I/239/hip_main',conditions:[{column:'HIP',operator:'=',value:'1'}],offset:0},fixture:await fixture('science/vizier-records'),checks:['天体数据','赤经','RAICRS','000.00091185','deg']},
 {id:'vizier',parameters:{mode:'catalogs',query:'Hipparcos'},fixture:await fixture('science/vizier-catalogs'),checks:['可查询的资料','赤经']},
 // A complete real archived CIF tests parser/display fidelity. This is not
 // evidence that the currently timing-out COD website is reachable.
 {id:'cod',parameters:{mode:'cif',id:'9000305'},fixture:{record:{id:'9000305',title:'COD 9000305 · 原始 CIF',fields:{id:'9000305',format:'CIF',cif:archiveCIF},sourceURL:'https://www.crystallography.net/cod/9000305.cif'}},checks:['CIF 结构摘要','H6 Mn5 O20 P4','晶胞边长 a（Å）','17.594','96.67']},
 {id:'pubchem',parameters:{mode:'detail',cid:2244},fixture:await fixture('science/pubchem-detail'),checks:['物质身份','Aspirin','基本性质与说明','分子式','C9H8O4','提供方','资料出处']},
 {id:'placenames',parameters:{mode:'detail',id:'d60e3fe9d95e3926b088a3afe2673676'},fixture:{record:{id:'d60e3fe9d95e3926b088a3afe2673676',title:'故宫站',fields:await fixture('reference/places-detail'),sourceURL:'https://dmfw.mca.gov.cn/9095/stname/detailsPub'}},checks:['地名基本信息','Gùgōng Zhàn','地名含义','因位于故宫附近','CGCS2000','116.3900916','39.9218817']},
 {id:'pokewiki',parameters:{mode:'search',query:'皮卡丘',page:0},fixture:await fixture('pokewiki-pikachu'),checks:['基本资料','皮卡丘','Pikachu','属性','静电','身高（m）','0.4','体重（kg）','6','词条导语']}
];
assert.equal(cases.length,10);assert.equal(new Set(cases.map(item=>item.id)).size,9,'all nine services, including both VizieR catalogue and record presentations');

function response(item,submitted){
 const record=clone(item.fixture.record);
 if(item.id==='oeis'){
  const parameters=queryParameters(submitted.query,submitted.start),executedQuery=/^A\d{6}$/i.test(parameters.query)?'id:'+parameters.query.toUpperCase():parameters.query;
  // A clearly separated hostile field probes raw-text materialization without
  // changing any value of the actual captured sequence's fields.
  record.browserSecurityProbe={html:'<img src="https://unexpected.invalid/pixel" onerror="window.__readingInjected=true"><script>window.__readingInjected=true</script>',template:'{{Unsupported|[[File:DoNotLoad.png]]}}'};
  return {provider:'oeis',query:parameters.query,executedQuery,start:parameters.start,pageSize:10,records:[record],fetchedAt:'2026-10-17T12:00:00.000Z',sourceURL:'https://oeis.org/search?q='+encodeURIComponent(executedQuery)+'&start='+parameters.start+'&fmt=json',nextStart:null,total:1};
 }
 const spec=QUERY_PAGES.find(spec=>spec.id===item.id),parameters=providers.get(item.id).validate(submitted),source=projectLicense(TASK_PROJECT_SOURCES['native:'+item.id].urls[0]);
 record.sourceURL||=item.id==='pubchem'?'https://pubchem.ncbi.nlm.nih.gov/compound/'+record.id:spec.home;
 const attribution={name:source.name,credit:source.name,license:source.license};
 if(item.id==='pokewiki'){const revision=record.fields.revisions[0];Object.assign(attribution,{credit:'神奇宝贝百科及本词条贡献者',revisionURL:'https://wiki.52poke.com/index.php?oldid='+revision.revid,historyURL:'https://wiki.52poke.com/index.php?title='+encodeURIComponent(record.title)+'&action=history'});}
 return {...clone(item.fixture.result||{}),provider:item.id,query:String(parameters.query??parameters.stName??parameters.id??parameters.cid??parameters.table??''),submitted,parameters,records:[record],total:1,next:null,attribution,fetchedAt:'2026-10-17T12:00:00.000Z',sourceURL:record.sourceURL};
}

async function production(width,motion){
 const prefix=width<1100?'/toolbox/':'/',base='https://arg.test'+prefix,requests=[],external=[],errors=[],missing=[];
 const context=await browser.newContext({viewport:{width,height:950},hasTouch:width<1100,reducedMotion:motion});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());if(['blob:','data:'].includes(url.protocol))return route.continue();if(url.hostname!=='arg.test'){external.push(url.href);return route.abort();}
  try{
   assert.ok(url.pathname.startsWith(prefix),'static and query URLs retain the deployment prefix');const path=url.pathname.slice(prefix.length)||'index.html',match=/^api\/query\/([a-z]+)$/.exec(path);
   if(match){const submitted=route.request().postDataJSON(),item=cases.find(value=>value.id===match[1]&&(value.id==='oeis'||value.parameters.mode===submitted.mode));assert.ok(item,'query comes from a registered scenario');assert.equal(route.request().method(),'POST');const envelope=response(item,submitted);requests.push({id:item.id,submitted,envelope});return route.fulfill({contentType:'application/json',body:JSON.stringify(envelope),headers:{'Cache-Control':'no-store'}});}
   return route.fulfill({body:await readFile(resolve('public',path)),contentType:mime[extname(path)]||'application/octet-stream'});
  }catch(error){missing.push(url.pathname+': '+error.message);await route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({message:error.message})}).catch(()=>{});}
 });
 const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push(error.message));await page.goto(base+'#home');await page.locator('#panel-home [data-capability]').first().waitFor();
 await page.evaluate(async()=>{const {connectNotebook}=await import('./handoff/button.js');connectNotebook(request=>{window.__readingNote=request;window.__readingNoteValue=request.read();});});
 return{page,context,requests,check(){assert.deepEqual({external,errors,missing},{external:[],errors:[],missing:[]});assert.equal(context.pages().length,1,'no extra tabs or windows are opened');}};
}

async function fillForm(page,item){
 if(item.id==='oeis'){await page.locator('#oeis-query').fill(item.parameters.query);return;}
 const spec=QUERY_PAGES.find(spec=>spec.id===item.id),mode=spec.modes.find(mode=>mode.id===item.parameters.mode);await page.locator('#'+item.id+'-mode').selectOption(mode.id);
 for(const field of mode.fields){const prefix=item.id+'-'+mode.id+'-',value=item.parameters[field.name];
  if(field.type==='conditions'){for(const [name,part]of Object.entries(value?.[0]||{})){const node=page.locator('#'+prefix+'condition-0-'+name);if(name==='operator')await node.selectOption(String(part));else await node.fill(String(part));}}
  else if(field.type==='cone'){for(const key of ['ra','dec','radius'])await page.locator('#'+prefix+'cone-'+key).fill(value?String(value[key]):'');}
  else{const node=page.locator('#'+prefix+field.name);if(field.type==='choice'){if(value!==undefined)await node.selectOption(String(value));}else await node.fill(value===undefined?(field.value===undefined?'':String(field.value)):Array.isArray(value)?value.join(' '):String(value));}
 }
}

async function verifyRecord(scope,item,width){
 const {page,requests}=scope,before=requests.length;await chooseNativeTask(page,'native:'+item.id);assert.equal(requests.length,before,item.id+' entry never sends a request');
 await fillForm(page,item);assert.equal(requests.length,before,item.id+' typing and mode selection never query');
 const form=page.locator('#panel-'+item.id+' .online-query-form');assert.equal(await form.evaluate(node=>node.checkValidity()),true,item.id+' valid real form');
 await page.locator('#'+item.id+'-run').click();await page.locator('#'+item.id+'-status').filter({hasText:'查询完成'}).waitFor();assert.equal(requests.length,before+1,item.id+' sends only the explicit submission');
 const detail=page.locator('#'+item.id+'-detail'),reading=detail.locator('[data-query-reading]');await reading.waitFor({state:'visible'});const visible=await reading.innerText();
 for(const value of item.checks)assert.ok(visible.includes(value),item.id+' reading shows '+value);
 if(['zdic','pokewiki'].includes(item.id)){
  const folded=reading.locator('[data-reading-section]');assert.ok(await folded.count()>0,item.id+' secondary dictionary/form content is progressively disclosed');
  assert.equal(await folded.evaluateAll(nodes=>nodes.every(node=>!node.open)),true,item.id+' secondary sections start collapsed');
  const first=folded.first();assert.equal(await first.locator('section').isVisible(),false,'native disclosure hides its body without hiding primary data');await first.locator('summary').press('Enter');assert.notEqual(await first.getAttribute('open'),null,'keyboard synchronously updates native disclosure state');await first.locator('section').waitFor({state:'visible'});await first.locator('summary').press('Space');assert.equal(await first.getAttribute('open'),null);await first.locator('section').waitFor({state:'hidden'});
  if(item.id==='pokewiki'){const order=await reading.evaluate(node=>[...node.children].map(child=>child.querySelector('h4,summary')?.textContent||''));assert.ok(order.indexOf('基本资料')<order.indexOf('词条导语')&&order.indexOf('词条导语')<order.indexOf('换装皮卡丘'),'useful introduction precedes optional special forms');}
 }
 if(['pokewiki','pubchem','zdic','cnkgraph','vizier'].includes(item.id)){await page.evaluate(async()=>{await Promise.all(document.getAnimations().filter(animation=>animation.effect?.getComputedTiming().endTime!==Infinity).map(animation=>animation.finished.catch(()=>{})));scrollTo({top:0,behavior:'instant'});});await page.screenshot({path:resolve(artifacts,item.id+(item.id==='vizier'?'-'+item.parameters.mode:'')+'-'+width+'.png'),fullPage:true,animations:'disabled'});}
 const envelope=requests.at(-1).envelope,record=envelope.records[0],expected=item.id==='oeis'?recordSnapshot(envelope,record):externalSnapshot(envelope,record);
 assert.equal(await detail.locator('[data-query-original],pre').count(),0,item.id+' does not generate raw JSON');assert.doesNotMatch(await detail.innerText(),/查询与来源信息|完整原始记录|本次返回字段数/);
 const portal=QUERY_PAGES.find(spec=>spec.id===item.id)?.recordLink==='portal',link=detail.getByRole('link',{name:portal?'前往原站查阅完整资料':/^查看.*原文与完整资料$/});assert.equal(await link.count(),1,item.id+' has one main original-source link');assert.equal(await link.getAttribute('href'),item.id==='oeis'?'https://oeis.org/A001129':portal?'https://dmfw.mca.gov.cn/':record.sourceURL);assert.match(await link.getAttribute('rel'),/noopener/);
 await page.locator('#'+item.id+'-record-notebook').click();const note=await page.evaluate(()=>window.__readingNoteValue.text),saved=JSON.parse(note.slice(note.indexOf('\n{')+1));assert.deepEqual(saved,expected,item.id+' note contains complete original record, query, metadata and provenance with no raw JSON controls');
 const tables=reading.locator('.online-query-reading-table');for(let i=0;i<await tables.count();i++){
  const table=tables.nth(i),fold=table.locator('xpath=ancestor::details[1]');if(await fold.count()&&await fold.getAttribute('open')===null){await fold.locator('summary').press('Enter');await table.waitFor({state:'visible'});}assert.equal(await table.getAttribute('role'),'region');assert.equal(await table.getAttribute('tabindex'),'0');assert.ok(await table.getAttribute('aria-label'));await table.scrollIntoViewIfNeeded();await table.focus();assert.equal(await table.evaluate(node=>node===document.activeElement),true,item.id+' table is keyboard reachable');
  if(width<500&&await table.locator('th').count()>=3)assert.ok(await table.evaluate(node=>node.scrollWidth>node.clientWidth+2),item.id+' phone tables scroll sideways instead of crushing scientific fields into tiny columns');
  if(await table.evaluate(node=>node.scrollWidth>node.clientWidth+2)){await table.press('ArrowRight');await page.waitForFunction(node=>node.scrollLeft>0,await table.elementHandle());}
  assert.ok(await table.evaluate(node=>{const rect=node.getBoundingClientRect();return rect.left>=-1&&rect.right<=innerWidth+1;}),item.id+' table scroll container stays inside viewport');
 }
 assert.equal(await detail.locator('img,iframe,object,embed,script').count(),0,item.id+' source markup/templates/media never become DOM');assert.equal(await page.evaluate(()=>Boolean(window.__readingInjected)),false,'hostile raw fields do not execute');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),item.id+' does not overflow at '+width);
 const paneSize=await page.locator('#panel-'+item.id+' .online-query-panes').evaluate(node=>[...node.children].map(child=>{const r=child.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width};}));
 if(width>=1440){assert.ok(paneSize[1].w>paneSize[0].w*2,item.id+' desktop reserves most width for reading');assert.ok(Math.abs(paneSize[0].y-paneSize[1].y)<2);}else assert.ok(paneSize[1].y>paneSize[0].y,item.id+' narrow view stacks detail below list');
 if(item.id==='vizier'&&item.parameters.mode==='catalogs'){assert.match(await detail.locator('h3').innerText(),/Hipparcos/);assert.equal(await reading.locator('table').count(),0,'catalogues show a contents preview, not a wall of schema');assert.doesNotMatch(await reading.innerText(),/目录与范围|目录表标识|本次返回字段数|字段与单位/);}
 if(width>=1440&&item.id!=='oeis'){const alignment=await form.locator('.online-query-parameters').evaluate(node=>[...node.children].map(child=>child.getBoundingClientRect().top));assert.ok(Math.abs(alignment[0]-alignment[1])<2,'desktop query mode and criteria align in one row');}
 if(item.id==='cnkgraph'){const prose=await reading.locator('section').filter({has:page.getByRole('heading',{name:'正文',exact:true})}).locator('p').innerText();assert.match(prose,/古廟崩榱在，牆間雜樹荒。/);assert.equal(prose.split('\n').length,4);}
 const footer=page.locator('#panel-'+item.id+'>.tool-provenance');assert.equal(await footer.isVisible(),true);assert.equal(await footer.evaluate(node=>node.parentElement.lastElementChild===node),true,item.id+' real source footer follows the reading area');assert.equal(requests.length,before+1,item.id+' selection, tables and notes cause no extra requests');scope.check();
}

try{
 for(const [width,motion]of [[1440,'no-preference'],[390,'reduce'],[320,'no-preference']]){
  const scope=await production(width,motion);try{for(const item of cases)await verifyRecord(scope,item,width);scope.check();}catch(error){await scope.page.screenshot({path:resolve(artifacts,'failure-'+width+'.png'),fullPage:true}).catch(()=>{});throw error;}finally{await scope.context.close();}
 }
 console.log('PASS: all nine online reference services show useful readable fields and original links; complete notebook and export data remain intact; no automatic queries, template execution or media requests; keyboard disclosure/table scrolling and PC/phone/subdirectory normal/reduced-motion widths. COD uses an explicitly archived real CIF, not a claim of current upstream reachability.');
}finally{await browser.close();}
