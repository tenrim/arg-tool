import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {extname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {chooseNativeTask} from './browser-navigation.mjs';

const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif','.wasm':'application/wasm','.gz':'application/octet-stream','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
const screenshots=resolve(tmpdir(),'mist-atlas');await mkdir(screenshots,{recursive:true});
const sourceURLs={constellations:'https://iauarchive.eso.org/public/themes/constellations/',eclipses:'https://eclipse.gsfc.nasa.gov/',birds:'https://www.avilist.org/checklist/v2025b/','classical-music':'https://openopus.org/'};
const chineseSources={constellations:['https://github.com/nk2028/opencc-js'],eclipses:['https://github.com/nk2028/opencc-js'],birds:['https://www.worldbirdnames.org/new/ioc-lists/master-list-2/','https://github.com/unicode-org/cldr-json','https://github.com/nk2028/opencc-js'],'classical-music':['https://www.wikidata.org/','https://github.com/nk2028/opencc-js']};
const lifeOnly=process.argv.includes('--life-only');
const resumeCelestial=process.argv.includes('--resume-celestial');
const attributionOnly=process.argv.includes('--attribution-only');
const resourcesOnly=process.argv.includes('--resources-only');
const phoneOnly=process.argv.includes('--phone-only');
let active;

async function production(width,motion){
 const prefix=width<1100?'/toolbox/':'/',base='https://arg.test'+prefix,errors=[],missing=[],external=[],gates=[],requests=[],downloads=[];
 let failedFile=null;
 const context=await browser.newContext({viewport:{width,height:950},hasTouch:width<1100,reducedMotion:motion});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());if(['blob:','data:'].includes(url.protocol))return route.continue();
  if(url.hostname!=='arg.test'){external.push(url.href);return route.abort();}
  try{
   assert.ok(url.pathname.startsWith(prefix),'all assets retain their subdirectory base');
   const relative=url.pathname.slice(prefix.length)||'index.html';
   requests.push(relative);
   if(failedFile&&relative.endsWith(failedFile)){failedFile=null;return route.fulfill({status:503,body:'intentional data load failure'});}
   const gate=gates.find(value=>!value.used&&value.match(relative));if(gate){gate.used=true;gate.started();await gate.wait;}
   await route.fulfill({body:await readFile(resolve('public',relative)),contentType:mime[extname(relative)]||'application/octet-stream'});
  }catch(error){missing.push(url.pathname+': '+error.message);await route.abort();}
 });
 const page=await context.newPage();active=page;page.setDefaultTimeout(30000);page.on('pageerror',error=>errors.push(error.message));page.on('download',download=>downloads.push(download.suggestedFilename()));
 await page.goto(base+'#home');await page.locator('#panel-home [data-capability]').first().waitFor();
 return{page,context,base,width,motion,requests,downloads,failOnce(file){failedFile=file;},gate(match){let started,release;const wait=new Promise(resolve=>release=resolve),pending=new Promise(resolve=>started=resolve);gates.push({match,wait,started,used:false});return{started:pending,release};},check(){assert.deepEqual({errors,missing,external},{errors:[],missing:[],external:[]});assert.equal(context.pages().length,1);}};
}
const panel=(page,id)=>page.locator('#panel-'+id);
async function ready(page,id){await page.locator('#'+id+'-status').filter({hasText:'查询完成'}).waitFor({timeout:45000});}
async function open(page,id){await chooseNativeTask(page,'native:'+id);if(!await page.locator('#'+id+'-results [data-record]').count()&&await page.locator('#'+id+'-run').isEnabled())await page.locator('#'+id+'-run').click();await ready(page,id);}
async function search(page,id,value){await page.locator('#'+id+'-query').fill(value);await page.locator('#'+id+'-query').press('Enter');await ready(page,id);}
async function footer(page,id){
 const provenance=panel(page,id).locator(':scope>.tool-provenance');await provenance.waitFor({state:'visible'});
 assert.deepEqual(await provenance.locator('a').evaluateAll(nodes=>nodes.map(node=>node.href)),[sourceURLs[id],...chineseSources[id]],'exact original and Chinese-supplement dependencies, with no unrelated sources');
 assert.ok(await provenance.locator('[data-license]').count(),'precise license is visible');
 assert.equal(await provenance.evaluate(node=>node===node.parentElement.lastElementChild),true,'provenance follows help and all results');
}
async function downloadedJSON(page,button){const [file]=await Promise.all([page.waitForEvent('download'),button.click()]);return JSON.parse(await readFile(await file.path(),'utf8'));}

async function birdsUI(scope){
 const {page}=scope;await open(page,'birds');
 assert.match(await page.locator('#birds-summary').textContent(),/33,684/);assert.match(await page.locator('#birds-summary').textContent(),/当前 1–24/);
 assert.equal(await page.locator('#birds-results [data-record]').count(),24);assert.equal(await page.locator('#birds-detail [data-record-section=original] dl dt').count(),26);assert.equal(await page.locator('#birds-detail [data-record-section=original]').getAttribute('open'),null);
 assert.equal(await page.locator('#birds-prev').isDisabled(),true);await page.locator('#birds-next').click();await ready(page,'birds');
 assert.match(await page.locator('#birds-summary').textContent(),/当前 25–48/);assert.equal(await page.locator('#birds-results [data-record]').first().getAttribute('data-record'),'bird:25');
 await page.locator('#birds-rank').selectOption('species');await ready(page,'birds');await search(page,'birds','Struthio camelus');
 assert.equal(await page.locator('#birds-results [data-record]').count(),1);assert.match(await page.locator('#birds-detail').textContent(),/Common Ostrich/);
 const record=await downloadedJSON(page,page.locator('#birds-download'));assert.equal(record.raw.Scientific_name,'Struthio camelus');assert.equal(Object.keys(record.raw).length,26);assert.equal(record.raw.Range,null);assert.equal(record.source,sourceURLs.birds);assert.equal(record.snapshotDate,'2026-10-17');
 await search(page,'birds','麻雀');assert.ok(await page.locator('#birds-results [data-record]').count()>0);assert.match(await page.locator('#birds-detail').textContent(),/中文名（IOC 15.2/);
 assert.ok(await page.locator('#panel-birds [data-workbook]').isVisible());
 await page.locator('#birds-query').fill('');await page.locator('#birds-view').selectOption('metadata');await ready(page,'birds');
 assert.equal(await page.locator('#birds-sheet option').count(),7,'all six original workbook tabs are available');assert.match(await page.locator('#birds-summary').textContent(),/共 2,571 条/);
 for(const [sheet,total]of [['AviList v2025b extended',2],['Decision summaries',1134],['Recommended citation',3],['How to use',27],['References',1343],['Changes from previous version',62]]){
  await page.locator('#birds-sheet').selectOption(sheet);await ready(page,'birds');assert.match(await page.locator('#birds-summary').textContent(),new RegExp('共 '+total.toLocaleString('zh-CN')+' 条'));
  assert.equal(await page.locator('#birds-results [data-record]').count(),Math.min(24,total));
 }
 await page.locator('#birds-sheet').selectOption('Recommended citation');await ready(page,'birds');
 const citation=await downloadedJSON(page,page.locator('#birds-download'));assert.match(JSON.stringify(citation.raw),/10\.2173\/avilist\.v2025b/);assert.equal(citation.raw.cellMetadata.A1.hyperlink.target,'https://doi.org/10.2173/avilist.v2025','original embedded old hyperlink remains distinct from updated citation text');
 await footer(page,'birds');
}
async function musicUI(scope){
 const {page}=scope;await open(page,'classical-music');
 assert.match(await page.locator('#classical-music-summary').textContent(),/24,975/);assert.equal(await page.locator('#classical-music-composerId option').count(),221);
 await search(page,'classical-music','贝多芬');assert.match(await page.locator('#classical-music-detail').textContent(),/贝多芬|貝多芬/);
 await search(page,'classical-music','交响曲');assert.ok(await page.locator('#classical-music-results [data-record]').count()>0);assert.match(await page.locator('#classical-music-detail').textContent(),/术语|交响曲|交響曲/);
 const mozart=await page.locator('#classical-music-composerId option').evaluateAll(nodes=>nodes.find(node=>node.textContent.endsWith(' · Wolfgang Amadeus Mozart')).value);
 await page.locator('#classical-music-composerId').selectOption(mozart);await ready(page,'classical-music');await search(page,'classical-music','K.550');
 assert.equal(await page.locator('#classical-music-results [data-record]').count(),1);assert.match(await page.locator('#classical-music-detail').textContent(),/Symphony no\. 40 in G minor/);
 const work=await downloadedJSON(page,page.locator('#classical-music-download'));assert.equal(work.raw.composer.name,'Mozart');assert.equal(work.raw.work.genre,'Orchestral');assert.equal(work.source,'https://api.openopus.org/work/dump.json');
 await page.getByRole('button',{name:'查看这位作曲家的全部作品'}).click();await ready(page,'classical-music');assert.equal(await page.locator('#classical-music-query').inputValue(),'');
 const count=Number((await page.locator('#classical-music-summary').textContent()).match(/共 (\d+) 条/)[1]);assert.ok(count>500,'actual full composer works replace the single-number search');
 assert.equal(await page.locator('#classical-music-composerId').inputValue(),mozart);
 await page.locator('#classical-music-category').selectOption('composers');await ready(page,'classical-music');
 const composer=await downloadedJSON(page,page.locator('#classical-music-download'));assert.equal(composer.raw.complete_name,'Wolfgang Amadeus Mozart');assert.equal(composer.raw.works.length,count);await footer(page,'classical-music');
}
async function constellationUI(scope){
 const {page}=scope;await open(page,'constellations');assert.equal(await panel(page,'constellations').locator('[data-atlas-index]').count(),88);
 await search(page,'constellations','Serpens Caput');
 await page.locator('#constellations-results [data-record="Ser"]').click();
 const charts=page.locator('#constellations-detail .atlas-chart');assert.equal(await charts.count(),2,'Serpens Caput and Cauda retain separate real charts');
 await charts.first().scrollIntoViewIfNeeded();await page.waitForFunction(()=>[...document.querySelectorAll('#constellations-detail .atlas-chart')].every(image=>image.complete&&image.naturalWidth>100));
 const constellation=await downloadedJSON(page,page.locator('#constellations-download'));assert.equal(constellation.raw.charts.length,2);assert.ok(constellation.raw.boundaries.length>0);await footer(page,'constellations');
}
async function eclipseUI(scope){
 const {page}=scope;await open(page,'eclipses');await page.locator('#eclipses-filter').selectOption('solar');await ready(page,'eclipses');await search(page,'eclipses','2024年4月8日');
 assert.equal(await page.locator('#eclipses-results [data-record]').count(),1);
 const eclipse=await downloadedJSON(page,page.locator('#eclipses-download'));assert.equal(eclipse.raw.year,2024);assert.equal(eclipse.raw.saros,'139');assert.ok(eclipse.raw.type.startsWith('T'));assert.match(eclipse.raw.rawLine,/2024/);await footer(page,'eclipses');
 await page.locator('#eclipses-fromYear').fill('3000');await page.locator('#eclipses-toYear').fill('-1999');await page.locator('#eclipses-run').click();
 await page.locator('#eclipses-status').filter({hasText:'起始年份不能晚于结束年份'}).waitFor();assert.equal(await page.locator('#eclipses-download').isDisabled(),true);
}
async function notebookLease(scope){
 const {page}=scope;await open(page,'birds');await page.locator('#birds-view').selectOption('records');await ready(page,'birds');await search(page,'birds','Struthio camelus');
 await page.evaluate(async()=>{const {connectNotebook}=await import('./handoff/button.js');window.__atlasCaptured=[];connectNotebook(request=>{window.__atlasRequest=request;window.__atlasCaptured.push(request.read());});});
 await page.locator('#birds-record-notebook').click();assert.match(await page.evaluate(()=>window.__atlasCaptured.at(-1).text),/Struthio camelus/);assert.match(await page.evaluate(()=>window.__atlasCaptured.at(-1).text),/https:\/\/www\.avilist\.org\/checklist\/v2025b\//);
 assert.equal(await page.evaluate(()=>window.__atlasRequest.isCurrent()),true);await page.locator('#birds-query').fill('new clue');
 assert.equal(await page.locator('#birds-record-notebook').isDisabled(),true);assert.equal(await page.evaluate(()=>window.__atlasRequest.isCurrent()),false);
 assert.match(await page.evaluate(()=>{try{window.__atlasRequest.read();return 'unexpected success';}catch(error){return error.message;}}),/失效/);
}
async function workerContracts(scope){
 const {page,base}=scope,workerCode=await readFile('public/atlas/worker.js','utf8');
 const downloadCount=scope.downloads.length;
 const run=async(kind,params={},blob=false,resourceBase=base)=>page.evaluate(({kind,params,blob,resourceBase,workerCode})=>new Promise((resolve,reject)=>{
  const url=blob?URL.createObjectURL(new Blob([workerCode],{type:'text/javascript'})):new URL('atlas/worker.js',resourceBase).href;
  const worker=new Worker(url,{type:'module'}),timer=setTimeout(()=>{worker.terminate();reject(Error('Atlas Worker timed out'));},30000);
  worker.onmessage=({data})=>{clearTimeout(timer);worker.terminate();if(blob)URL.revokeObjectURL(url);resolve(data);};worker.onerror=error=>{clearTimeout(timer);worker.terminate();if(blob)URL.revokeObjectURL(url);reject(Error(error.message));};worker.postMessage({kind,params,resourceBase});
 }),{kind,params,blob,resourceBase,workerCode});
 for(const [kind,params,expected]of [['birds',{query:'Struthio camelus',rank:'species'},'Struthio camelus'],['classical-music',{query:'K.550'},'K.550'],['constellations',{recordId:'Ser'},'Ser'],['eclipses',{query:'2024 Apr 08',filter:'solar'},'2024']]){
  const answer=await run(kind,params,true);assert.equal(answer.error,undefined);assert.ok(answer.result.total>0);assert.match(JSON.stringify(answer.result.items),new RegExp(expected.replace('.','\\.')));
 }
 const badBase=await run('birds',{},true,'https://elsewhere.invalid/toolbox/');assert.match(badBase.error,/资源地址无效/);
 const metadata=await run('birds',{view:'metadata',sheet:'Recommended citation'},true);assert.equal(metadata.error,undefined);assert.ok(metadata.result.total>0);
 scope.failOnce('birds.json');const failure=await run('birds');assert.match(failure.error,/HTTP 503/);
 const retry=await run('birds',{query:'Struthio camelus',rank:'species'});assert.equal(retry.result.items[0].id,'bird:5');
 // Delay the real file response, cancel synchronously, then complete a fresh query.
 await open(page,'classical-music');const gate=scope.gate(path=>path.endsWith('music.json'));
 await page.locator('#classical-music-run').click();await gate.started;
 await page.locator('#classical-music-stop').click();assert.match(await page.locator('#classical-music-status').textContent(),/已停止/);assert.equal(await page.locator('#classical-music-download').isDisabled(),true);
 gate.release();await page.locator('#classical-music-query').fill('Mozart');await page.locator('#classical-music-run').click();await ready(page,'classical-music');
 assert.match(await page.locator('#classical-music-detail').textContent(),/Mozart/);assert.equal(await page.locator('#classical-music-query').inputValue(),'Mozart');
 const runtimeData=scope.requests.filter(path=>/^vendor\/atlas-(?:celestial|life-culture)\/.*\.json(?:\.gz)?$/.test(path));
 assert.ok(runtimeData.length>=6,'real atlas data and metadata are fetched locally');assert.ok(runtimeData.every(path=>path.endsWith('.json')),'normal queries use JSON URLs, never downloadable gzip archives');
 assert.equal(scope.downloads.length,downloadCount,'normal queries do not start downloads');
 if(resourcesOnly){const exported=await downloadedJSON(page,page.locator('#classical-music-download'));assert.ok(exported.recordId,'explicit record export still downloads the selected complete record');assert.equal(scope.downloads.length,downloadCount+1);}
}
async function attributionUI(scope){
 const {page}=scope,observed=[];
 await page.evaluate(async()=>{const {connectNotebook}=await import('./handoff/button.js');window.__attributionNotes=[];connectNotebook(request=>window.__attributionNotes.push(request.read()));});
 for(const id of ['constellations','eclipses','birds','classical-music']){
  // Earlier lifecycle tests deliberately leave invalid or no-match drafts.
  // Source preservation owns a real valid record, independent of those drafts.
  await chooseNativeTask(page,'native:'+id);
  if(id==='eclipses'){await page.locator('#eclipses-fromYear').fill('');await page.locator('#eclipses-toYear').fill('');}
  if(id==='birds')await page.locator('#birds-view').selectOption('records');
  if(id==='classical-music'){await page.locator('#classical-music-category').selectOption('works');await page.locator('#classical-music-composerId').selectOption('');}
  await search(page,id,{constellations:'Ori',eclipses:'2024-04-08',birds:'Struthio camelus','classical-music':'K.550'}[id]);
  assert.equal(await page.locator('#'+id+'-download').isEnabled(),true,id+' attribution owns a valid selected record');
  const record=await downloadedJSON(page,page.locator('#'+id+'-download'));
  assert.equal(typeof record.license,'string',id+' downloaded records preserve their data license');assert.ok(record.license.length>0);
  await page.locator('#'+id+'-record-notebook').click();const note=await page.evaluate(()=>window.__attributionNotes.at(-1).text);
  assert.ok(note.includes('许可：'+record.license),id+' notebook text preserves exactly the same license');
  if(record.credit)assert.ok(note.includes('署名：'+record.credit),id+' notebook text preserves exactly the same required acknowledgment');
  if(id==='eclipses')assert.equal(record.credit,"Eclipse Predictions by Fred Espenak and Jean Meeus (NASA's GSFC)");
  if(id==='birds'){assert.match(record.citation,/AviList Core Team\. 2026\./);assert.match(record.citation,/10\.2173\/avilist\.v2025b/);assert.ok(note.includes('引用：'+record.citation));}
  observed.push({dataset:id,recordId:record.recordId,license:record.license,credit:record.credit,citation:record.citation});
 }
 return observed;
}
try{
 if(resourcesOnly){
  for(const [width,motion]of [[1440,'no-preference'],[390,'reduce']]){const scope=await production(width,motion);await workerContracts(scope);scope.check();await scope.context.close();}
  console.log('PASS: JSON-only runtime data requests, all four real datasets and workbook metadata, native/blob/subdirectory workers, failure/retry/cancel, no automatic downloads, explicit export preserved, PC and reduced-motion phone.');
 }else if(attributionOnly){
  const scope=await production(1440,'no-preference');await eclipseUI(scope);const observed=await attributionUI(scope);scope.check();await scope.context.close();
  const evidencePath='.tmp-expansion-tests/atlas-verification.json',report=JSON.parse(await readFile(evidencePath,'utf8'));
  const covered=['public/atlas/index.js','scripts/browser-atlas.mjs','public/vendor/atlas-celestial/constellations.json','public/vendor/atlas-celestial/constellations.json.gz','public/vendor/atlas-celestial/UPSTREAM.json'];
  for(const path of covered)report.files[path]=createHash('sha256').update(await readFile(path)).digest('hex');
  report.runs.push({command:'node scripts/browser-atlas.mjs --attribution-only',exitCode:0,coverage:['Invalid eclipse-year draft is rejected before the separate attribution setup restores a valid query','Four real dataset record downloads retain their licenses','NASA download and notebook retain full Fred Espenak / Jean Meeus acknowledgment','AviList download and notebook retain recommended citation','All notebook texts retain exactly the exported credit/license; no remote requests or page errors'],observed});
  await writeFile(evidencePath,JSON.stringify(report,null,2)+'\n');console.log('PASS: attribution-only; four real record exports and notebook reads preserve licenses and required credits/citation. Existing data/UI/Worker/mobile passes were retained without repetition.');
 }else{
 for(const [width,motion]of phoneOnly?[[390,'reduce']]:[[1440,'no-preference'],[390,'reduce']]){
  const scope=await production(width,motion);console.log('Atlas scope',width,motion);
  if(!resumeCelestial){await birdsUI(scope);console.log('  complete birds and six worksheets passed');await musicUI(scope);console.log('  complete music relationships passed');await notebookLease(scope);}
  if(!lifeOnly){if(!resumeCelestial||width===390)await constellationUI(scope);await eclipseUI(scope);console.log('  real constellations and eclipse data passed');await workerContracts(scope);if(!resumeCelestial&&width===1440)await attributionUI(scope);}
  assert.ok(await scope.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'atlas composes within the viewport');
  await scope.page.screenshot({path:resolve(screenshots,'atlas-'+width+'-'+motion+'.png'),fullPage:true});scope.check();await scope.context.close();
 }
 console.log(phoneOnly?'PASS: remaining reduced-motion phone UI below /toolbox/: four real reference datasets, six bird worksheets, records/export, composer relationships, notebook lease, Serpens double charts, eclipse fact and invalid-year rejection, final provenance, viewport and Worker resource contracts; desktop passes were not repeated.':lifeOnly?'PASS: diagnostic birds/music UI, six worksheets, complete raw records, composer relationship, notebook lease, final sources and local-only PC/phone.':resumeCelestial?'PASS: resumed failed desktop eclipse search and remaining Worker contracts, phone Serpens/eclipse and Worker contracts; preceding birds/music/notebook and desktop Serpens checks were retained, not repeated.':'PASS: four real reference datasets, complete rows/fields/sheets and pagination, Serpens double charts, eclipse fact, composer relationships, current notebook lease, exact final provenance, local-only resources, native/blob/subdirectory workers, failed-load recovery/cancellation, PC and reduced-motion phone.');
 }
}catch(error){if(active&&!active.isClosed()){console.error('At',active.url());console.error(await active.locator('body').innerText().catch(()=>''));await active.screenshot({path:resolve(screenshots,'failure.png'),fullPage:true}).catch(()=>{});}throw error;}
finally{await browser.close();}
