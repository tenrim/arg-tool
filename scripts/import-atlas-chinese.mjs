#!/usr/bin/env node
/** Maintenance-only Wikidata acquisition. Build/runtime never contact Wikidata. */
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync,gunzipSync} from 'node:zlib';
import {setTimeout as delay} from 'node:timers/promises';
import {fileURLToPath} from 'node:url';

const root = new URL('../',import.meta.url), dir = new URL('upstream/atlas-chinese/',root);
const args = process.argv.slice(2), refresh = args.includes('--refresh') || args.includes('--acquire'), offline = args.includes('--offline');
const date = args[args.indexOf('--snapshot-date')+1];
if ((!refresh && !offline) || !/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw Error('Explicit source maintenance requires --acquire or --offline, with --snapshot-date YYYY-MM-DD.');
await mkdir(dir,{recursive:true});
const composers = JSON.parse(await readFile(new URL('upstream/atlas-life-culture/openopus-dump.json',root),'utf8')).composers;
const fold = value => String(value).normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const cachePath = new URL('wikidata-responses.json.gz',dir);
let responses = {};
try { responses = JSON.parse(gunzipSync(await readFile(cachePath))); } catch(e) { if(e.code !== 'ENOENT')throw e; }
let last = 0;
async function api(params) {
 const query = new URLSearchParams({format:'json',maxlag:'5',...params});
 const url = 'https://www.wikidata.org/w/api.php?'+query;
 if (responses[url]) return responses[url].body;
 if (offline) throw Error('Offline projection lacks an archived exact API response: '+url);
 await delay(Math.max(0,1100-(Date.now()-last)));last=Date.now();
 const response = await fetch(url,{headers:{'User-Agent':'MistToolbox/0.9.2 (Chinese reference dataset maintenance; https://gitee.com/musicraft/arg-tool)'},signal:AbortSignal.timeout(60000)});
 if(!response.ok)throw Error(`Wikidata HTTP ${response.status}: ${url}`);
 const body=await response.json();if(body.error)throw Error(JSON.stringify(body.error));
 responses[url]={url,retrievedAt:new Date().toISOString(),body};
 await writeFile(cachePath,gzipSync(JSON.stringify(responses)+'\n',{level:9,mtime:0}));
 return body;
}
const candidateIds = new Set(), candidates = [];
for (const [i,composer] of composers.entries()) {
 const response=await api({action:'wbsearchentities',search:composer.complete_name,language:'en',uselang:'en',limit:'5',type:'item'});
 const ids=(response.search || []).filter(item=>[item.label,item.match?.text,...(item.aliases || [])].some(name=>fold(name || '')===fold(composer.complete_name))).map(item=>item.id);
 candidates.push(ids);for(const id of ids)candidateIds.add(id);
 console.log(`Composer identity search ${i+1}/${composers.length}: ${composer.complete_name}, ${ids.length} exact candidate(s)`);
}
const entities={};const ids=[...candidateIds];
for(let i=0;i<ids.length;i+=10){const response=await api({action:'wbgetentities',ids:ids.slice(i,i+10).join('|'),props:'labels|aliases|claims|info',languages:'en|zh|zh-cn|zh-tw|zh-hans|zh-hant'});Object.assign(entities,response.entities);console.log(`Entity batch ${i+1}–${Math.min(ids.length,i+10)} / ${ids.length}`);}
const records=[],unmatched=[];
const zhLanguages=['zh-hans','zh-cn','zh','zh-hant','zh-tw'];
const values=(entity,p)=> (entity.claims?.[p]||[]).filter(claim=>claim.rank!=='deprecated').map(claim=>claim.mainsnak?.datavalue?.value);
for(const [i,composer]of composers.entries()){
 const exact=candidates[i].map(id=>entities[id]).filter(entity=>entity&&!entity.missing&&values(entity,'P31').some(value=>value?.id==='Q5')&&values(entity,'P569').some(value=>Number(/^([+-]?\d+)/.exec(value?.time||'')?.[1])===Number(composer.birth.slice(0,4)))&&(!composer.death||values(entity,'P570').some(value=>Number(/^([+-]?\d+)/.exec(value?.time||'')?.[1])===Number(composer.death.slice(0,4)))));
 if(exact.length!==1){unmatched.push({completeName:composer.complete_name,birth:composer.birth,death:composer.death,reason:exact.length?'ambiguous-identity':'no-verified-identity',candidateIds:candidates[i]});continue;}
 const entity=exact[0], labels=Object.fromEntries(zhLanguages.filter(lang=>entity.labels?.[lang]&&/\p{Script=Han}/u.test(entity.labels[lang].value)).map(lang=>[lang,entity.labels[lang].value]));
 const aliases=Object.fromEntries(zhLanguages.filter(lang=>entity.aliases?.[lang]).map(lang=>[lang,entity.aliases[lang].map(value=>value.value).filter(value=>/\p{Script=Han}/u.test(value))]));
 const names=[...new Set([...Object.values(labels),...Object.values(aliases).flat()])];
 if(!names.length){unmatched.push({completeName:composer.complete_name,reason:'no-existing-chinese-name',wikidataId:entity.id});continue;}
 records.push({completeName:composer.complete_name,birth:composer.birth,death:composer.death,wikidataId:entity.id,revision:entity.lastrevid,sourceURL:'https://www.wikidata.org/wiki/'+entity.id,labels,aliases,names,match:'Unique normalized exact English label/alias in the archived official wbsearchentities result + human instance + exact source birth year and death year when supplied. No fuzzy name matching or authored translation.'});
}
const filePath='upstream/atlas-chinese/wikidata-composers.json';
const result={meta:{dataset:'Wikidata Chinese composer names',snapshotDate:date,license:'CC0-1.0',originalComposerCount:composers.length,chineseComposerCount:records.length,source:'https://www.wikidata.org/',languages:zhLanguages,scope:'Additive Chinese labels and aliases for exact-verified Open Opus composer identities only. No translated work titles, biographies, recordings or scores.'},records,unmatched};
await writeFile(new URL('wikidata-composers.json',dir),JSON.stringify(result,null,2)+'\n');
// These are English query terms, never an authored Chinese translation table.
// Only existing Wikidata musical-form/genre entities with an exact English
// label and a verified musical-type claim contribute their own Chinese names.
const formQueries=['Symphony','Concerto','Sonata','Prelude','Fugue','Mass','Requiem','Opera','Overture','Suite','Cantata','Oratorio','Ballet','Nocturne','Etude','Quartet','Quintet','Trio'];
const musicalTypes=new Set(['Q862597','Q188451','Q107487333']);
const types=await api({action:'wbgetentities',ids:[...musicalTypes].join('|'),props:'labels|info',languages:'en'});
if(!Object.values(types.entities).every(entity=>['musical form','music genre','type of musical work/composition'].includes(entity.labels?.en?.value)))throw Error('Reviewed musical-type source identities changed.');
const forms=[],unmatchedForms=[];
for(const term of formQueries){
 const found=await api({action:'wbsearchentities',search:term,language:'en',uselang:'en',limit:'5',type:'item'});
 const exact=(found.search||[]).filter(item=>fold(item.label||'')===fold(term)).map(item=>item.id);
 if(!exact.length){unmatchedForms.push({term,reason:'no-exact-English-label'});continue;}
 const data=await api({action:'wbgetentities',ids:exact.join('|'),props:'labels|aliases|claims|info',languages:'en|zh|zh-cn|zh-tw|zh-hans|zh-hant'});
 const matched=Object.values(data.entities).filter(entity=>fold(entity.labels?.en?.value||'')===fold(term)&&values(entity,'P31').some(value=>musicalTypes.has(value?.id)));
 if(matched.length!==1){unmatchedForms.push({term,reason:'no-unique-musical-form-identity'});continue;}
 const entity=matched[0],labels=Object.fromEntries(zhLanguages.filter(lang=>entity.labels?.[lang]&&/\p{Script=Han}/u.test(entity.labels[lang].value)).map(lang=>[lang,entity.labels[lang].value]));
 const aliases=Object.fromEntries(zhLanguages.filter(lang=>entity.aliases?.[lang]).map(lang=>[lang,entity.aliases[lang].map(value=>value.value).filter(value=>/\p{Script=Han}/u.test(value))]));
 const names=[...new Set([...Object.values(labels),...Object.values(aliases).flat()])];
 if(!names.length){unmatchedForms.push({term,reason:'no-existing-Chinese-label'});continue;}
 forms.push({english:entity.labels.en.value,wikidataId:entity.id,revision:entity.lastrevid,sourceURL:'https://www.wikidata.org/wiki/'+entity.id,labels,aliases,names});
 console.log('Musical-form term:',term,entity.id,names[0]);
}
const terminology={meta:{dataset:'Wikidata Chinese musical-form terms',snapshotDate:date,license:'CC0-1.0',source:'https://www.wikidata.org/',scope:'Existing Chinese form names used only as exact English title-term search aids. Not translated complete work titles or asserted work classifications.'},records:forms,unmatched:unmatchedForms};
await writeFile(new URL('wikidata-music-forms.json',dir),JSON.stringify(terminology,null,2)+'\n');
const files=[];
const sources=[['IOC-Multilingual-15.2.xlsx','https://www.worldbirdnames.org/Multiling%20IOC%2015.2.xlsx'],['IOC-master-list.html','https://www.worldbirdnames.org/new/ioc-lists/master-list-2/'],['IOC-CC-BY-3.0.txt','https://creativecommons.org/licenses/by/3.0/legalcode.txt'],['Wikidata-licensing.json','https://www.wikidata.org/w/api.php?action=query&prop=revisions&rvprop=content%7Cids&titles=Wikidata%3ALicensing&rvslots=main&format=json&maxlag=5'],['Wikidata-CC0-1.0.txt','https://creativecommons.org/publicdomain/zero/1.0/legalcode.txt'],['NOTICE.txt','https://www.worldbirdnames.org/new/ioc-lists/master-list-2/']];
for(const name of ['wikidata-responses.json.gz','wikidata-composers.json','wikidata-music-forms.json'])sources.push([name,name.endsWith('.gz')?'https://www.wikidata.org/w/api.php':'https://www.wikidata.org/wiki/Wikidata:Data_access']);
for(const [name,url]of sources){const bytes=await readFile(new URL(name,dir));files.push({path:'upstream/atlas-chinese/'+name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),url,role:name.endsWith('.gz')?'Complete unmodified successful API response bodies with exact URLs and acquisition timestamps, losslessly gzip-compressed.':name==='NOTICE.txt'?'Local attribution and transformation notice.':name.startsWith('wikidata-')?'Deterministic exact-identity Chinese-label projection of archived API responses.':'Unmodified official source or license.'});}
await writeFile(new URL('pins.json',dir),JSON.stringify({snapshotDate:date,files},null,2)+'\n');
console.log(JSON.stringify(result.meta));console.log('Unmatched or without Chinese labels:',unmatched.length);console.log('Musical forms:',forms.length);console.log(fileURLToPath(new URL(filePath,root)));
