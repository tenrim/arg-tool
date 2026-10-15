// Offline, deterministic adaptation from fixed upstream snapshots.
import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const dir='public/vendor/science/';await mkdir(dir,{recursive:true});
await copyFile('upstream/science/sources/astronomy-engine-2.1.19/astronomy.browser.min.js',dir+'astronomy.js');
await copyFile('upstream/science/sources/lunar-javascript-1.7.7/lunar.js',dir+'lunar.js');
for(const name of ['RDKit_minimal.js','RDKit_minimal.wasm'])await copyFile('upstream/science/sources/@rdkit-rdkit-2026.9.1/dist/'+name,dir+name);
// The only import is compile-time types. Export just the three algorithms used by our UI.
let seq=await readFile('upstream/science/sources/seqviz/src/sequence.ts','utf8');seq=seq.replace('import { NameRange, SeqType } from "./elements";','');
seq=stripTypeScriptTypes(seq,{mode:'transform'}).replace(/export /g,'');
await writeFile(dir+'sequence.js','/* SeqViz MIT; codon mapping adapted upstream from NtSeq MIT. See bundled notices. */\n(function(){\n'+seq+'\nself.SeqOps={complement,reverseComplement,translate};\n})();\n');
const zh=JSON.parse(await readFile('upstream/science/element-names-zh.json','utf8'));
const data=JSON.parse(await readFile('upstream/science/sources/periodic-table/PeriodicTableJSON.json','utf8'));
// No remote image links or Wikipedia summaries are loaded by this tool.
await writeFile(dir+'elements.json',JSON.stringify(data.elements.filter(e=>e.number<=118).map(({number,symbol,name,atomic_mass,category,period,group,xpos,ypos,electron_configuration})=>({number,symbol,name,zh:zh[number-1],atomic_mass,category,period,group,xpos,ypos,electron_configuration})))+'\n');
console.log('Science adapters built offline.');

for(const [source,target]of [['lunar-javascript-1.7.7/LICENSE','lunar'],['seqviz/LICENSE','seqviz'],['periodic-table/LICENSE.md','elements'],['rdkit-LICENSE.txt','rdkit'],['ntseq-LICENSE.txt','ntseq']])await copyFile('upstream/science/sources/'+source,dir+target+'-LICENSE.txt');
const astro=await readFile(dir+'astronomy.js','utf8');await writeFile(dir+'astronomy-LICENSE.txt',astro.slice(astro.indexOf('MIT License'),astro.indexOf('*/')));
