// Maintenance-only network opt-in. Ordinary rebuilds validate fixed source bytes.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot=path.join(root,'upstream/cldr'),output=path.join(root,'public/vendor/cldr');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const pins=JSON.parse(await fs.readFile(path.join(sourceRoot,'PINS.json'),'utf8'));
const original=new Map();
for(const pin of pins.sources){
 const file=path.join(sourceRoot,pin.path);let bytes;
 if(process.argv.includes('--download')){
  const response=await fetch(pin.url,{headers:{'user-agent':'MistToolbox-ChineseData-Maintenance'},signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw Error(`CLDR download ${response.status}: ${pin.path}`);
  if(pin.gitBlob){const entry=await response.json();bytes=Buffer.from(entry.content||'','base64');if(entry.sha!==pin.gitBlob||bytes.length!==entry.size)throw Error('CLDR Git contents mismatch: '+pin.path);}
  else bytes=Buffer.from(await response.arrayBuffer());
 }else bytes=await fs.readFile(file);
 if(sha(bytes)!==pin.sha256)throw Error('Pinned Unicode source differs: '+pin.path);
 if(process.argv.includes('--download')){await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,bytes);}
 original.set(pin.path,bytes);
}
const json=file=>JSON.parse(original.get(file));
const localeData=(pkg,locale,name)=>json(`${pkg}/main/${locale}/${name}.json`).main[locale];
const unique=values=>[...new Set(values.filter(Boolean))];
const territories={},territoryEnglish={},currencies={},zones={},scripts={},annotations={};
const englishTerritories=localeData('cldr-localenames-full','en','territories').localeDisplayNames.territories;
for(const [code,name] of Object.entries(englishTerritories))if(/^[A-Z]{2}$/.test(code))territoryEnglish[code]=unique([name,...Object.entries(englishTerritories).filter(([key])=>key.startsWith(code+'-alt-')).map(([,v])=>v)]);
const bcp=json('cldr-bcp47/bcp47/timezone.json').keyword.u.tz;
const zoneAliases={};
for(const record of Object.values(bcp)){if(typeof record!=='object'||!record._alias)continue;const names=record._alias.split(' ');for(const name of names)zoneAliases[name]=names;}
function zoneEntries(tree,prefix=''){
 const out={};for(const [key,value] of Object.entries(tree)){if(key.startsWith('_')||!value||typeof value!=='object')continue;const id=prefix?prefix+'/'+key:key,names=unique(Object.values(value.long||{}));if(value.exemplarCity||names.length)out[id]={city:value.exemplarCity,names};Object.assign(out,zoneEntries(value,id));}return out;
}
const scriptCodes={};
for(const line of original.get('PropertyValueAliases-17.0.0.txt').toString('utf8').split(/\r?\n/)){
 const parts=line.split('#')[0].split(';').map(s=>s.trim());if(parts[0]==='sc')for(const alias of parts.slice(1)){scriptCodes[alias]=parts[1];scriptCodes[alias.replaceAll('_',' ')]=parts[1];}
}
for(const locale of ['zh','zh-Hant']){
 const territorySource=localeData('cldr-localenames-full',locale,'territories').localeDisplayNames.territories;
 for(const [code,name] of Object.entries(territorySource))if(/^[A-Z]{2}$/.test(code))territories[code]=unique([...(territories[code]||[]),name,...Object.entries(territorySource).filter(([key])=>key.startsWith(code+'-alt-')).map(([,v])=>v)]);
 for(const [code,record] of Object.entries(localeData('cldr-numbers-full',locale,'currencies').numbers.currencies)){
  const row=currencies[code]||={names:[],symbols:[]};row.names=unique([...row.names,...Object.entries(record).filter(([key])=>key==='displayName'||key.startsWith('displayName-count-')).map(([,v])=>v)]);row.symbols=unique([...row.symbols,...Object.entries(record).filter(([key])=>key.startsWith('symbol')).map(([,v])=>v)]);
 }
 const names=localeData('cldr-localenames-full',locale,'scripts').localeDisplayNames.scripts;
 for(const [name,code] of Object.entries(scriptCodes))if(names[code])scripts[name]=unique([...(scripts[name]||[]),names[code]]);
 const entries=zoneEntries(localeData('cldr-dates-full',locale,'timeZoneNames').dates.timeZoneNames.zone);
 for(const [id,record] of Object.entries(entries)){for(const alias of zoneAliases[id]||[id]){const row=zones[alias]||={cities:[],names:[]};row.cities=unique([...row.cities,record.city]);row.names=unique([...row.names,...record.names]);}}
 for(const [pkg,folder] of [['cldr-annotations-full','annotations'],['cldr-annotations-derived-full','annotationsDerived']]){
  for(const [character,entry] of Object.entries(json(`${pkg}/${folder}/${locale}/annotations.json`)[folder].annotations)){
   const row=annotations[character]||={names:[],keywords:[]};row.names=unique([...row.names,...(entry.tts||[])]);row.keywords=unique([...row.keywords,...(entry.default||[])]);
  }
 }
}
await fs.mkdir(output,{recursive:true});
const written=[];
async function save(name,content){const bytes=Buffer.from(content);await fs.writeFile(path.join(output,name),bytes);written.push({path:'public/vendor/cldr/'+name,sha256:sha(bytes),bytes:bytes.length});}
const module=(name,value)=>`// Generated by scripts/import-cldr.mjs from pinned Unicode sources; do not edit.\nexport const ${name}=Object.freeze(${JSON.stringify(value)});\n`;
await save('names.js',module('CLDR_NAMES',{version:pins.version,territories,territoryEnglish,currencies,zones,scripts}));
await save('annotations.js',module('CLDR_ANNOTATIONS',annotations));
await save('LICENSE.txt',original.get('LICENSE.txt'));
await save('NOTICE.txt',`Unicode CLDR ${pins.version}, Chinese (zh) and Traditional Chinese (zh-Hant) locale data.\nCopyright Unicode, Inc. and contributors. Unicode License v3 (Unicode-3.0); complete license: LICENSE.txt.\nhttps://github.com/unicode-org/cldr-json/tree/${pins.version}\nUnicode Character Database 17.0.0 PropertyValueAliases supplies the ISO 15924 script-name/code join only; original Unicode names and records remain unchanged.\nFixed source files and SHA-256: upstream/cldr/PINS.json. Generated local modules retain all names, keywords and sequence annotations in the selected locale files.\nChinese labels supplement exact currency codes, territory codes, IANA/CLDR timezone aliases and Unicode characters/sequences. They are not an official Chinese translation of every Unicode character, every historical currency or IANA source commentary.\nNo runtime lookup or automatic network requests. Rebuild: node scripts/import-cldr.mjs. Explicit redownload: node scripts/import-cldr.mjs --download (all checksums must match).\n`);
const counts={territories:Object.keys(territories).length,currencies:Object.keys(currencies).length,zones:Object.keys(zones).length,scripts:Object.keys(scripts).length,annotations:Object.keys(annotations).length,singleCodePointAnnotations:Object.keys(annotations).filter(s=>Array.from(s).length===1).length};
await fs.writeFile(path.join(output,'UPSTREAM.json'),JSON.stringify({version:pins.version,unicode:'17.0.0',license:'Unicode-3.0',sources:pins.sources,counts,files:written},null,2)+'\n');
console.log(JSON.stringify(counts));
