// Offline packaging of complete, pinned upstream distributions.
import {readFile,writeFile,mkdir,cp,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
const source='upstream/completion-20261017',out='public/vendor/completion';
for(const fixed of JSON.parse(await readFile(join(source,'SOURCE_FILES.json'),'utf8'))){if(createHash('sha256').update(await readFile(join(source,fixed.path))).digest('hex')!==fixed.sha256)throw Error('Extracted original changed: '+fixed.path);}
for(const fixed of JSON.parse(await readFile(join(source,'SOURCES.json'),'utf8'))){if(createHash('sha256').update(await readFile(fixed.local_path)).digest('hex')!==fixed.sha256)throw Error('Pinned source changed: '+fixed.local_path);}
await mkdir(out,{recursive:true});
await mkdir(join(out,'gs8'),{recursive:true});await cp(join(source,'gs8/symbols.json'),join(out,'gs8/symbols.json'));
await cp(join(source,'marine'),join(out,'marine'),{recursive:true});
await import('./build-origami-adapter.mjs');
const copy=async(a,b)=>{await mkdir(join(out,b,'..'),{recursive:true});await cp(join(source,a),join(out,b),{recursive:true});};
for(const name of ['simple-keyboard','simple-keyboard-layouts']){
 await copy(name+'/build',name+'/build');await copy(name+'/LICENSE',name+'/LICENSE');await copy(name+'/package.json',name+'/package.json');
}
await copy('base65536','base65536');
await copy('bwip-js/dist','bwip-js');
const {symbolList}=await import('../upstream/completion-20261017/bwip-js/dist/bwip-js.mjs');
await writeFile('public/completion/barcode-catalog.js','// Generated public names from the pinned full BWIPP inventory. No engine import at discovery time.\nexport const BARCODE_NAMES=Object.freeze('+JSON.stringify(symbolList.flatMap(s=>[s.bcid,s.desc]))+');\n');
await copy('bwip-js/LICENSE','bwip-js/LICENSE');await copy('bwip-js/README.md','bwip-js/README.md');
for(const file of await readdir(join(source,'bwip-js')))if(/LICENSE|NOTICE/i.test(file)&&file!=='LICENSE')await copy('bwip-js/'+file,'bwip-js/'+file);
await copy('fold/dist/fold.js','fold/fold.js');await copy('fold/LICENSE','fold/LICENSE');
for(const file of ['table.js','sqrd.js','reedsolomon.js'])await copy('qrazybox/js/'+file,'qrazybox/'+file);
await copy('qrazybox/LICENSE','qrazybox/LICENSE');await copy('qrazybox/help','qrazybox/help');
await copy('liblouis-build/build-no-tables-utf32.js','liblouis/build-no-tables-utf32.js');
await copy('liblouis-build/tables','liblouis/tables');await copy('liblouis-js/easy-api.js','liblouis/easy-api.js');await copy('liblouis-js/LICENSE','liblouis/JS-LICENSE');
await copy('liblouis-source/COPYING','liblouis/COPYING');await copy('liblouis-source/COPYING.LESSER','liblouis/COPYING.LESSER');
await copy('liblouis-source.tar.gz','liblouis/corresponding-source.tar.gz');await copy('liblouis-js.tar.gz','liblouis/api-source.tar.gz');await copy('liblouis-NOTICE.txt','liblouis/NOTICE.txt');
await copy('dependency-notices','origami/dependency-notices');await copy('origami-NOTICE.txt','origami/NOTICE.txt');await copy('origami.tar.gz','origami/source.tar.gz');
const aa=await readFile(join(source,'aaencode-cli/index.js'),'utf8'),jj=await readFile(join(source,'grunt-jjencode/tasks/jjencode.js'),'utf8');
await mkdir(join(out,'obfuscation'),{recursive:true});
await writeFile(join(out,'obfuscation/encoders.js'),aa.slice(aa.indexOf('const aaencode ='),aa.indexOf('\nprogram')).replace('const aaencode =','export const aaencode =')+'\n'+jj.slice(jj.indexOf('    function jjencode'),jj.indexOf('    // Please see')).replace('    function jjencode','export function jjencode'));
await copy('aaencode-cli/LICENSE','obfuscation/aaencode-LICENSE');await copy('grunt-jjencode/tasks/jjencode.js','obfuscation/jjencode-original.js');
const prussian=(await readFile(join(source,'gcwizard/prussian_telegraph.dart'),'utf8')).split('const _CODEBOOK_PRUSSIA = {')[1].split('\n};')[0];
const codebook=[...prussian.matchAll(/^\s*'([^']+)':\s*'((?:\\.|[^'\\])*)',?\s*$/gm)].map(([,code,text])=>({code,text:text.replace(/\\'/g,"'").replace(/\\\\/g,'\\')}));
if(codebook.length!==prussian.split('\n').filter(line=>/^\s*'/.test(line)).length)throw Error('Prussian codebook parsing lost rows');
await mkdir(join(out,'gcwizard'),{recursive:true});await writeFile(join(out,'gcwizard/prussian.json'),JSON.stringify(codebook));await copy('gcwizard/LICENSE','gcwizard/LICENSE');await copy('gcwizard/prussian_telegraph.dart','gcwizard/prussian-original.dart');
await copy('gcwizard/NOTICE.txt','gcwizard/NOTICE.txt');
await copy('gcwizard/prussian-display.dart','gcwizard/prussian-display.dart');
const tables=[];for(const file of await readdir(join(source,'liblouis-build/tables'))){
 if(!/\.(ctb|utb)$/i.test(file))continue;
 const text=await readFile(join(source,'liblouis-build/tables',file),'utf8');
 // All translation tables are available, including unindexed upstream tables.
 tables.push({file,name:/^#-display-name:\s*(.+)$/m.exec(text)?.[1]||/^#-name:\s*(.+)$/m.exec(text)?.[1]||file,language:/^#\+language:\s*(.+)$/m.exec(text)?.[1]||'',grade:/^#\+grade:\s*(.+)$/m.exec(text)?.[1]||''});
}
await writeFile(join(out,'liblouis/tables.json'),JSON.stringify(tables));
let base=await readFile(join(source,'base91/index.js'),'utf8');
const table=/const table = (.*);/.exec(base)[0];
const encode=base.slice(base.indexOf('exports.encode ='),base.indexOf('exports.EncodeStream =')).split('/**')[0].trim().replace('exports.encode =','export const encode =').replace(/const raw = Buffer\.isBuffer[\s\S]*?Buffer\.from\(data, encoding\);/,'const raw = data;');
const decode=base.slice(base.indexOf('exports.decode ='),base.indexOf('exports.DecodeStream =')).split('/**')[0].trim().replace('exports.decode =','export const decode =').replace(/return encoding[^;]+;/,'return Uint8Array.from(ret);');
await mkdir(join(out,'base91'),{recursive:true});await writeFile(join(out,'base91/index.js'),'// Adapted from Equim-chan/base91, BSD-3-Clause. Byte-array transport only.\n'+table+'\n'+encode+'\n'+decode+'\n');await copy('base91/LICENSE','base91/LICENSE');
const files=[];async function walk(dir,prefix=''){for(const f of await readdir(dir,{withFileTypes:true})){const p=join(dir,f.name),rel=(prefix+f.name).replaceAll('\\','/');if(f.isDirectory())await walk(p,rel+'/');else if(rel!=='UPSTREAM.json')files.push({path:rel,sha256:createHash('sha256').update(await readFile(p)).digest('hex')});}}
await walk(out);await writeFile(join(out,'UPSTREAM.json'),JSON.stringify({source:'upstream/completion-20261017',files},null,2));
console.log(`Packaged ${files.length} complete runtime files; ${tables.length} Liblouis translation tables.`);
