/** Maintenance importer. --refresh fetches explicit fixed Wikidata queries;
 * default rebuilds the supplement offline from hash-checked captured responses.
 * Original reference datasets are never altered or reduced.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
const ROOT=fileURLToPath(new URL('../',import.meta.url));
const SOURCE=path.join(ROOT,'upstream/reference-chinese');
const endpoint='https://query.wikidata.org/sparql';
const languages='FILTER(LANG(?label) IN ("zh","zh-hans","zh-hant","zh-cn","zh-tw"))';
export const QUERIES=Object.freeze({
 airports:`SELECT ?item ?icao ?iata ?label ?coord WHERE { { ?item wdt:P239 ?icao } UNION { ?item wdt:P238 ?iata } ?item rdfs:label ?label. ${languages} OPTIONAL { ?item wdt:P625 ?coord } }`,
 ...Object.fromEntries([...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(prefix=>['ports-'+prefix,`SELECT ?item ?code ?label WHERE { ?item wdt:P1937 ?code. FILTER(STRSTARTS(?code,"${prefix}")) ?item rdfs:label ?label. FILTER(LANG(?label)="zh") }`])),
 capitals:`SELECT ?country ?iso ?item ?label ?english WHERE { ?country wdt:P297 ?iso; wdt:P36 ?item. ?item rdfs:label ?label; rdfs:label ?english. FILTER(LANG(?english)="en") ${languages} }`,
 sky:`SELECT ?item ?code ?label ?alias WHERE { VALUES ?catalog { wd:Q14534 wd:Q741672 wd:Q14530 } ?item p:P528 ?statement. ?statement pq:P972 ?catalog; ps:P528 ?code. ?item rdfs:label ?label. ${languages} OPTIONAL { ?item skos:altLabel ?alias. FILTER(LANG(?alias) IN ("zh","zh-hans","zh-hant","zh-cn","zh-tw")) } }`
});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async relative=>JSON.parse(await fs.readFile(path.join(ROOT,relative),'utf8'));
const hasHan=s=>/\p{Script=Han}/u.test(s||'');
const plain=s=>String(s||'').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const point=s=>{const p=/^Point\((-?[\d.]+) (-?[\d.]+)\)$/.exec(s||'');return p?[Number(p[1]),Number(p[2])]:null;};
const distance=(a,b)=>{const rad=Math.PI/180,lat=(a[1]+b[1])*rad/2;return Math.hypot((a[0]-b[0])*Math.cos(lat),a[1]-b[1])*111.195;};
const priority=['zh-hans','zh-cn','zh','zh-hant','zh-tw'];
export function catalogIdentifier(s){const match=/^(NGC|IC|M)\s*0*(\d+)$/i.exec(String(s||'').trim());return match?match[1].toUpperCase()+':'+Number(match[2]):null;}
export function aggregate(rows,codeKeys){
 const groups=new Map();
 for(const r of rows){if(!/^http:\/\/www\.wikidata\.org\/entity\/Q\d+$/.test(r.item?.value||'')||!(hasHan(r.label?.value)||hasHan(r.alias?.value)))continue;
  for(const key of codeKeys){const code=r[key]?.value;if(!code)continue;const k=key+':'+code;
   if(!groups.has(k))groups.set(k,new Map());const candidates=groups.get(k),id=r.item.value.split('/').at(-1);
   if(!candidates.has(id))candidates.set(id,{id,labels:[],aliases:[],coords:[],english:new Set()});const item=candidates.get(id);
   if(hasHan(r.label?.value))item.labels.push([r.label['xml:lang'],r.label.value]);if(hasHan(r.alias?.value))item.aliases.push(r.alias.value);if(point(r.coord?.value))item.coords.push(point(r.coord.value));if(r.english?.value)item.english.add(r.english.value);
  }
 }
 for(const candidates of groups.values())for(const item of candidates.values()){
  item.labels.sort((a,b)=>priority.indexOf(a[0])-priority.indexOf(b[0])||a[1].localeCompare(b[1]));
  item.names=[...new Set([...item.labels.map(r=>r[1]),...item.aliases.sort()])];item.name=item.names[0];
 }
 return groups;
}
const exported=item=>({name:item.name,names:item.names,source:'https://www.wikidata.org/wiki/'+item.id});
export function matchAirport(row,groups){
 const a=groups.get('icao:'+row[0]),b=row[1]?groups.get('iata:'+row[1]):null;
 // Code reassignment, duplicate Wikidata objects and conflicting ICAO/IATA ownership
 // are never resolved by fuzzy name matching or nearest-neighbour guessing.
 if(a?.size>1||b?.size>1)return null;
 const first=a?.values().next().value,second=b?.values().next().value;
 if(first&&second&&first.id!==second.id)return null;
 const item=first||second,coordinate=[Number(row[7]),Number(row[6])];
 if(!item||row[6]===''||row[7]===''||!coordinate.every(Number.isFinite)||!item.coords.some(p=>distance(p,coordinate)<=15))return null;
 return exported(item);
}
export function deriveGeologyNames(rows){
 const byId=new Map(rows.map(r=>[r.id,r])),out={};
 for(const r of rows){if(hasHan(r.name))continue;const m=/^(Lower|Middle|Upper)(.+)$/.exec(r.id),parent=byId.get(r.parent);
  if(!m||m[2]!==r.parent||!hasHan(parent?.name))continue;
  // Official ICS uses lower/middle/upper for chronostratigraphic units and
  // early/middle/late for corresponding time units. Reuse the source parent's
  // Chinese name, never transliterate an individual English geological name.
  const parentName=parent.name.replace(/\s/g,'').replace(/系$/,'统');
  out[r.id]={name:({Lower:'下',Middle:'中',Upper:'上'}[m[1]])+parentName,parent:r.parent,rule:'ICS lower/middle/upper + source Chinese parent'};
 }
 return out;
}
export async function buildReferenceChinese(){
 const manifest=JSON.parse(await fs.readFile(path.join(SOURCE,'imports.json'),'utf8')),snapshots={};
 for(const [key,query]of Object.entries(QUERIES)){
  const pin=manifest.files.find(r=>r.kind===key);if(!pin||pin.query!==query)throw Error('Chinese source query pin differs: '+key);
  const bytes=await fs.readFile(path.join(ROOT,pin.path));if(sha(bytes)!==pin.sha256)throw Error('Chinese source digest differs: '+key);
  const raw=gunzipSync(bytes);if(sha(raw)!==pin.contentSha256)throw Error('Chinese source original digest differs: '+key);
  const data=JSON.parse(raw);if(!Array.isArray(data.results?.bindings))throw Error('Incomplete Wikidata response: '+key);snapshots[key]=data.results.bindings;
 }
 const countries=await json('public/vendor/reference/countries.json'),airports=await json('public/vendor/reference/airports.json'),ports=await json('public/vendor/reference/ports.json'),sky=await json('public/vendor/discovery/sky-index.json'),geology=await json('public/vendor/reference/geology.json');
 const result={capitals:{},airports:{},ports:{},sky:{},geology:deriveGeologyNames(geology)};
 const airportGroups=aggregate(snapshots.airports,['icao','iata']);
 for(const row of airports){const item=matchAirport(row,airportGroups);if(item)result.airports[row[0]]=item;}
 const portGroups=aggregate(Object.entries(snapshots).filter(([key])=>key.startsWith('ports-')).flatMap(([,rows])=>rows),['code']);
 for(const row of ports){const candidates=portGroups.get('code:'+row[0]+row[1]);if(candidates?.size===1)result.ports[row[0]+row[1]]=exported(candidates.values().next().value);}
 const capitalGroups=aggregate(snapshots.capitals,['iso']);
 for(const row of countries){const candidates=capitalGroups.get('iso:'+row.id);if(!candidates)continue;
  const matches=[...candidates.values()].filter(item=>[...item.english].some(name=>plain(name)===plain(row.capital)));
  if(row.capital&&matches.length===1)result.capitals[row.id]=exported(matches[0]);
 }
 const skyGroups=aggregate(snapshots.sky,['code']),normalized=new Map();
 for(const [key,candidates]of skyGroups){const id=catalogIdentifier(key.slice(5));if(!id)continue;if(!normalized.has(id))normalized.set(id,new Map());for(const [itemId,item]of candidates)normalized.get(id).set(itemId,item);}
 for(const row of sky){const candidates=new Map();for(const key of [row.id,...row.aliases].map(catalogIdentifier).filter(Boolean))for(const [id,item]of normalized.get(key)||[])candidates.set(id,item);
  if(candidates.size===1)result.sky[row.id]=exported(candidates.values().next().value);
 }
 const coverage={capitals:{chinese:Object.keys(result.capitals).length,total:countries.filter(r=>r.capital).length},airports:{chinese:Object.keys(result.airports).length,total:airports.length},ports:{chinese:Object.keys(result.ports).length,total:ports.length},sky:{chinese:Object.keys(result.sky).length,total:sky.length},geology:{existing:geology.filter(r=>hasHan(r.name)).length,derived:Object.keys(result.geology).length,total:geology.length}};
 const outputRoot=path.join(ROOT,'public/vendor/reference-chinese');await fs.mkdir(outputRoot,{recursive:true});
 const banner='// Generated offline by scripts/import-reference-chinese.mjs. Do not edit names manually.\n';
 // Geographic names stay in the Worker path; visual helpers load only the tiny
 // geology sidecar and the sky UI loads only its own catalog names.
 for(const [kind,records]of Object.entries(result))await fs.writeFile(path.join(outputRoot,kind+'.js'),banner+'export const CHINESE_'+kind.toUpperCase()+'='+JSON.stringify(records)+';\n');
 const output=banner+Object.keys(result).map(kind=>'import {CHINESE_'+kind.toUpperCase()+"} from './"+kind+".js';").join('\n')+'\nexport const CHINESE_REFERENCE={'+Object.keys(result).map(kind=>kind+':CHINESE_'+kind.toUpperCase()).join(',')+'};\nexport const CHINESE_REFERENCE_COVERAGE='+JSON.stringify(coverage)+';\n';
 await fs.writeFile(path.join(outputRoot,'data.js'),output);
 await fs.writeFile(path.join(SOURCE,'coverage.json'),JSON.stringify({snapshot:manifest.retrievedAt,coverage,matching:'Exact source identifiers only; ambiguous identities rejected. Airports additionally require a source coordinate within 15 km. Capitals additionally require an exact normalized English source-capital match. No hand-written translations.'},null,2)+'\n');
 const notice=`Wikidata Chinese reference supplement — CC0-1.0\nhttps://www.wikidata.org/wiki/Wikidata:Licensing\nhttps://www.wikidata.org/wiki/Wikidata:Data_access\n\nStructured labels and Chinese aliases were acquired by explicit maintenance queries, then fixed locally. No runtime request is made to Wikidata. Snapshot acquired ${manifest.retrievedAt}. Exact queries, original gzip-compressed JSON responses, uncompressed SHA-256 and compressed SHA-256 are retained in upstream/reference-chinese/imports.json. The original reference databases remain unchanged.\n\n${JSON.stringify(coverage,null,2)}\n\nAirports: Chinese labels joined by ICAO (P239) / IATA (P238); multiple observed Chinese identities or conflicting ICAO/IATA identities are rejected. At least one source coordinate must be within 15 km of the original airport.\nCapitals: country ISO 3166-1 alpha-2 (P297) plus capital (P36), with an exact normalized English source capital name. This supplements names; it does not reclassify countries or assert geopolitical status.\nUN/LOCODE: all A–Z prefixes queried automatically, zh labels only. Exact P1937 codes match existing locations. Multiple observed Chinese item identities for a code are rejected. Codes refer to transportation locations, not only seaports.\nDeep sky: catalog-code statements P528 qualified by NGC (Q14534), IC (Q741672) or Messier (Q14530); Chinese labels and aliases. Exact normalized identifiers only; multiple observed Chinese identities are rejected. No translation or new astronomical object is invented.\n\nCoverage is partial: missing labels, ambiguous joins or failed coordinate/name validation retain the original names. Wikidata is a community-maintained structured-data source, not an official naming authority; labels can contain upstream errors. All original names, identifiers and raw factual fields remain available.\n\nThe 21 geological names with absent Chinese labels are generated using lower/middle/upper and the pinned ICS chart's existing Chinese parent name. This is an original deterministic naming transformation, not Wikidata content. Original ages, ranks and parent IDs remain unchanged. ICS chart is separately attributed under CC BY 4.0; see existing reference provenance.\nOpenCC-JS search normalization uses the existing pinned package, MIT code and Apache-2.0 dictionaries; see vendor/round1/opencc-js/LICENSE, THIRD_PARTY_LICENSES.md and LICENSES/Apache-2.0.txt. It normalizes search strings only, never source records.\n`;
 await fs.writeFile(path.join(ROOT,'public/licenses/REFERENCE-CHINESE-NOTICE.txt'),notice);
 const runtimeFiles=[];for(const filename of ['data.js',...Object.keys(result).map(kind=>kind+'.js')])runtimeFiles.push({path:'public/vendor/reference-chinese/'+filename,sha256:sha(await fs.readFile(path.join(outputRoot,filename)))});
 const license=await fs.readFile(path.join(ROOT,'public/licenses/REFERENCE-CHINESE-CC0-1.0.txt'));
 await fs.writeFile(path.join(outputRoot,'UPSTREAM.json'),JSON.stringify({source:'Wikidata structured labels and aliases; original deterministic ICS naming rules',license:'CC0-1.0 for Wikidata; ICS source CC-BY-4.0 retained separately',sourceManifest:'upstream/reference-chinese/imports.json',files:[...runtimeFiles,{path:'public/licenses/REFERENCE-CHINESE-NOTICE.txt',sha256:sha(Buffer.from(notice))},{path:'public/licenses/REFERENCE-CHINESE-CC0-1.0.txt',sha256:sha(license)}]},null,2)+'\n');
 return coverage;
}
export async function captureReferenceChinese(){
 await fs.mkdir(SOURCE,{recursive:true});const files=[];
 for(const [kind,query]of Object.entries(QUERIES)){
  const response=await fetch(endpoint+'?format=json&query='+encodeURIComponent(query),{headers:{Accept:'application/sparql-results+json','User-Agent':'MistToolbox/0.9.2 Chinese reference maintenance (https://gitee.com/musicraft/arg-tool)'},signal:AbortSignal.timeout(90000)});
  if(!response.ok)throw Error('Wikidata source failed '+kind+': '+response.status);const raw=Buffer.from(await response.arrayBuffer());
  // WDQS can append a timeout error after a 200 header: validate the ENTIRE body.
  if(!Array.isArray(JSON.parse(raw).results?.bindings))throw Error('Wikidata response incomplete: '+kind);
  const bytes=gzipSync(raw),relative='upstream/reference-chinese/'+kind+'.json.gz';await fs.writeFile(path.join(ROOT,relative),bytes);
  files.push({kind,path:relative,query,sha256:sha(bytes),contentSha256:sha(raw),bytes:raw.length});
  await new Promise(resolve=>setTimeout(resolve,1000));
 }
 await fs.writeFile(path.join(SOURCE,'imports.json'),JSON.stringify({source:endpoint,license:'CC0-1.0',retrievedAt:new Date().toISOString(),files},null,2)+'\n');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.includes('--refresh'))await captureReferenceChinese();
 console.log(JSON.stringify(await buildReferenceChinese()));
}
