import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRegistry,searchEntries} from '../public/capabilities/registry.js';
import {getArticle,ARTICLES} from '../public/knowledge/content.js';
import {projectLicense} from '../public/project-licenses.js';
import {TASK_PROJECT_SOURCES} from '../public/project-source-contracts.js';
import {guides} from '../public/tool-help.js';
const root=new URL('../',import.meta.url),read=path=>readFile(new URL(path,root));
const expected={simbad:['sky','https://simbad.cds.unistra.fr/simbad/'],vizier:['sky','https://vizier.cds.unistra.fr/'],cod:['matter','https://www.crystallography.net/cod/'],pubchem:['matter','https://pubchem.ncbi.nlm.nih.gov/'],placenames:['world','https://dmfw.mca.gov.cn/'],zdic:['language-reference','https://www.zdic.net/'],cnkgraph:['language-reference','https://cnkgraph.com/'],pokewiki:['culture-reference','https://wiki.52poke.com/']};
const registry=createRegistry(JSON.parse(await read('public/vendor/cyberchef/catalogue.json')));
test('each new online source has one precise capability, native route, lesson and complete help',()=>{
 for(const[id,[group]]of Object.entries(expected)){
  const entry=registry.byId.get('native:'+id);assert.ok(entry,id);assert.equal(entry.category,'reference');assert.equal(entry.group,group);assert.equal(entry.open.panel,id);assert.equal(entry.open.route,id);
  assert.deepEqual(entry.sourceOperationIds,[]);assert.equal(ARTICLES.filter(a=>a.capabilityIds.includes(entry.id)).length,1);
  const lesson=getArticle('function-'+entry.id);assert.equal(lesson.topicGroup,group);assert.ok(lesson.sections.length>=3);assert.ok(lesson.sections.some(s=>s.examples?.length));
  assert.ok(guides[id].steps.length>=3);assert.ok(guides[id].tip.length>50);assert.ok(searchEntries(registry,entry.title).some(e=>e.id===entry.id));
 }
 assert.equal(registry.coverage.operationCount,505);assert.equal(registry.coverage.coveredOperationCount,505);
 for(const retired of ['integerseq','crystals'])assert.equal(registry.byId.get('native:'+retired),undefined);
});
test('every new task owns its real online-data project and all bundled notices',async()=>{
 for(const[id,[,url]]of Object.entries(expected)){
  const spec=TASK_PROJECT_SOURCES['native:'+id];assert.equal(spec.panel,id);assert.deepEqual(spec.urls,[url]);
  const project=projectLicense(url);assert.ok(project,id);assert.ok(project.linkLabel);assert.ok(project.role.length>30);assert.ok(project.notices.length>=2);
  for(const path of project.notices)assert.ok((await read('public/'+path)).length>500,path);
 }
 assert.match(projectLicense(expected.zdic[1]).role,/非官方|公开/);
 assert.match(projectLicense(expected.cnkgraph[1]).license,/非商业/);
 assert.match(projectLicense(expected.pokewiki[1]).license,/CC-BY-NC-SA-3\.0/);
 assert.match(projectLicense(expected.placenames[1]).role,/CGCS2000/);
 assert.match(projectLicense(expected.vizier[1]).license,/rights_uri/);
});
test('all fixed official evidence and notices have exact bytes and SHA-256; inaccessible sources are explicit',async()=>{
 const manifest=JSON.parse(await read('upstream/online-services/UPSTREAM.json'));assert.deepEqual(manifest.providers,Object.keys(expected));
 for(const file of [...manifest.files,...manifest.publicNotices]){assert.ok(!file.path.includes('..'));assert.match(file.path,/^(upstream\/online-services\/|public\/licenses\/)/);const bytes=await read(file.path);assert.equal(bytes.length,file.bytes,file.path);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,file.path);}
 assert.ok(manifest.unavailableSources.some(s=>s.url.includes('crystallography.net')));
 const pinned=JSON.parse(await read('upstream-manifest.json')).components;for(const[,url]of Object.values(expected)){const component=pinned.find(c=>c.repository===url);assert.ok(component,url);assert.equal(component.file_manifest,'upstream/online-services/UPSTREAM.json');const bytes=await read(component.license_path);assert.equal(createHash('sha256').update(bytes).digest('hex'),component.license_sha256);}
 assert.match((await read('upstream/online-services/52poke-robots.txt')).toString(),/Crawl-delay:\s*500/i);
});
test('online lessons state real scope, units, licence differences and complete reproducible examples',()=>{
 const body=id=>JSON.stringify(getArticle('function-native:'+id).sections);
 for(const[id,terms]of Object.entries({simbad:['ICRS','36 角秒','250'],vizier:['I/239/hip_main','HIP','250','rights_uri'],cod:['分数坐标','2,0,0','CC0'],pubchem:['2244','C9H8O4','21','提供方'],placenames:['CGCS2000','maxLevel','同音','七'],zdic:['非官方 API','/hans/','CC0','不言而喻'],cnkgraph:['非商业','词谱','Formats','韵书','zh-hant'],pokewiki:['500 秒','CC BY-NC-SA 3.0','版本','模板']}))for(const term of terms)assert.ok(body(id).includes(term),id+':'+term);
});
