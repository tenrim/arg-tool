import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRegistry,searchEntries} from '../public/capabilities/registry.js';
import {getArticle,ARTICLES} from '../public/knowledge/content.js';
import {projectLicense} from '../public/project-licenses.js';
import {TASK_PROJECT_SOURCES} from '../public/project-source-contracts.js';

const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const catalogue=JSON.parse(await read('public/vendor/cyberchef/catalogue.json'));
const registry=createRegistry(catalogue);

test('online OEIS is one real reference capability with one precise lesson, never the retired sample library',()=>{
 const entry=registry.byId.get('native:oeis');
 assert.ok(entry);assert.equal(entry.category,'reference');assert.equal(entry.group,'sequences');
 assert.equal(entry.open.route,'oeis');assert.equal(entry.open.panel,'oeis');
 assert.equal(registry.entries.filter(item=>item.id==='native:oeis').length,1);
 assert.deepEqual(entry.sourceOperationIds,[],'OEIS queries do not claim a CyberChef operation');
 assert.deepEqual(entry.learningIds,['learn:function-native:oeis']);
 assert.equal(ARTICLES.filter(article=>article.capabilityIds.includes(entry.id)).length,1);
 const article=getArticle('function-native:oeis');assert.equal(article.topicGroup,'sequences');
 for(const query of ['OEIS','整数序列','A编号'])assert.ok(searchEntries(registry,query).some(item=>item.id===entry.id),query);
 assert.equal(registry.byId.get('native:integerseq'),undefined);
 assert.equal(getArticle('function-native:integerseq'),undefined);
 assert.equal(registry.coverage.operationCount,505);
 assert.equal(registry.coverage.coveredOperationCount,505);
});

test('OEIS source ownership registers actual online data use and complete bundled notices',async()=>{
 const spec=TASK_PROJECT_SOURCES['native:oeis'];
 assert.equal(spec.panel,'oeis');assert.deepEqual(spec.urls,['https://oeis.org/']);
 assert.match(spec.roles['https://oeis.org/'],/在线|联网/);
 const project=projectLicense('https://oeis.org/');
 assert.equal(project.linkLabel,'官方数据服务');assert.match(project.license,/CC-BY-SA-4\.0/);
 assert.match(project.role,/原创/);assert.match(project.role,/没有内置全量数据库/);
 assert.deepEqual(project.notices,['licenses/OEIS-CC-BY-SA-4.0.txt','licenses/OEIS-EULA.txt','licenses/OEIS-NOTICE.txt','licenses/ONLINE-READING-NOTICE.txt']);
 for(const path of project.notices)assert.ok((await read('public/'+path)).length>100);
 const text=(await read('public/licenses/OEIS-NOTICE.txt')).toString();
 assert.match(text,/The Online Encyclopedia of Integer Sequences/);
 assert.match(text,/The OEIS Foundation Inc/);
 assert.match(text,/contributors/);assert.match(text,/not.*official.*quota/is);
 assert.match((await read('public/licenses/OEIS-CC-BY-SA-4.0.txt')).toString(),/Attribution-ShareAlike 4\.0 International/);
});

test('every archived official evidence byte and public notice matches its pinned hash',async()=>{
 const manifest=JSON.parse(await read('upstream/online-query/UPSTREAM.json'));
 assert.equal(manifest.retrieved,'2026-10-17');assert.equal(manifest.files.length,8);
 assert.equal(new Set(manifest.files.map(file=>file.path)).size,manifest.files.length);
 for(const file of [...manifest.files,...manifest.publicNotices]){
  assert.ok(/^(?:upstream\/online-query\/|public\/licenses\/OEIS-)/.test(file.path)||file.path==='public/licenses/ONLINE-READING-NOTICE.txt');
  assert.ok(!file.path.includes('..'));
  assert.match(file.sha256,/^[a-f0-9]{64}$/);
  const bytes=await read(file.path);assert.equal(bytes.length,file.bytes,file.path);assert.equal(digest(bytes),file.sha256,file.path);
  if(file.url){const url=new URL(file.url);assert.equal(url.protocol,'https:');assert.ok(['oeis.org','creativecommons.org'].includes(url.hostname));}
 }
 assert.deepEqual(manifest.publicNotices.map(file=>file.path),projectLicense('https://oeis.org/').notices.map(path=>'public/'+path),'every bundled OEIS reading/source notice is pinned, not only the original three');
 const pinned=JSON.parse(await read('upstream-manifest.json')).components.find(component=>component.name==='OEIS online sequence data service');
 assert.ok(pinned);assert.equal(pinned.file_manifest,'upstream/online-query/UPSTREAM.json');
 assert.equal(pinned.license_sha256,digest(await read(pinned.license_path)));
 assert.deepEqual(await read('public/licenses/OEIS-EULA.txt'),await read('upstream/online-query/OEIS-EULA.html'));
 assert.deepEqual(await read('public/licenses/OEIS-CC-BY-SA-4.0.txt'),await read('upstream/online-query/OEIS-CC-BY-SA-4.0.txt'));
 const robots=(await read('upstream/online-query/OEIS-robots.txt')).toString();
 assert.match(robots,/Crawl-Delay:\s*10/);assert.match(robots,/Disallow:\s*\/search/);
});

test('OEIS lesson preserves actual matching, exact IDs, offset example, provenance and online boundary',()=>{
 const article=getArticle('function-native:oeis');
 const body=JSON.stringify(article.sections);
 for(const text of ['连续项','id:A000045','offset','0,4','第四','CC BY-SA 4.0','本站服务器','每 10 秒','不持久保存','完整记录'])assert.ok(body.includes(text),text);
 const sources=new Map(article.sources.map(source=>[source.id,source]));
 for(const section of article.sections)for(const id of section.sourceIds)assert.equal(new URL(sources.get(id).url).hostname,'oeis.org');
 const worked=article.sections.flatMap(section=>section.examples||[]).find(example=>example.output.includes('offset=0,4'));
 assert.ok(worked);assert.match(worked.output,/0,1,1,2,3,5,8/);
 assert.equal(article.capabilityIds.length,1);
});
