// Maintenance-only import: pin commits and preserve upstream notices. Normal builds need no downloads.
import {cp, mkdir, readFile, writeFile, readdir, stat} from 'node:fs/promises';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {stripTypeScriptTypes} from 'node:module';
import {createHash} from 'node:crypto';
const src=process.argv[2]||'/tmp/arg-hunt-upstreams', npm='/tmp/arg-hunt-packages/node_modules';
const out='public/vendor/hunt'; await mkdir(out,{recursive:true});
const projects={
 'cipher-machine':['philippica/cipher_machine','BSD-3-Clause'], 'chinese-puzzle':['philippica/ChinesePuzzleTool','BSD-2-Clause'],
 stereogram:['piellardj/stereogram-solver','MIT'], sstv:['Equinoxis/sstv-decoder','MIT declaration in README; no standalone LICENSE upstream']
};
const entries=[];
async function copy(project,path,target=path){await mkdir(join(out,project,target,'..'),{recursive:true});await cp(join(src,project,path),join(out,project,target),{recursive:true});}
for(const [name,[repo,license]] of Object.entries(projects)){
 await mkdir(join(out,name),{recursive:true});
 const files=await readdir(join(src,name));for(const file of files.filter(f=>/^(LICENSE|COPYING|README|readme)/.test(f)))await copy(name,file);
 entries.push({name,repository:`https://github.com/${repo}`,commit:execFileSync('git',['-C',join(src,name),'rev-parse','HEAD'],{encoding:'utf8'}).trim(),license,local_directory:join(out,name)});
}
for(const p of ['common/Trie.js','one-word/one-word.js','word-search/wordSearch.js','dict.js']){await copy('cipher-machine','src/'+p,p);await mkdir(join('upstream/hunt/cipher-machine',p,'..'),{recursive:true});await cp(join(src,'cipher-machine/src',p),join('upstream/hunt/cipher-machine',p));}
for(const p of ['one-word/one-word.js','word-search/wordSearch.js']){
 let s=await readFile(join(out,'cipher-machine',p),'utf8');s=s.replace('"../common/Trie"','"../common/Trie.js"').replaceAll('eval(`/${str}/`)','new RegExp(str)').replaceAll('eval(`/${ww.whole}/`)','new RegExp(ww.whole)').replaceAll('console.info(word);','');await writeFile(join(out,'cipher-machine',p),s);
}
for(const p of ['out.js','factorHan.js','spell.js','index.html'])await copy('chinese-puzzle',p);
const chinese=await readFile(join(src,'chinese-puzzle/index.html'),'utf8');
let logic=chinese.split('    <script>')[1].split('    </script>')[0];
logic=logic.slice(0,logic.indexOf("        $('#chinese-btn')"));
logic=logic.replace('const search = () => {','export const search = (pattern) => {');
const start=logic.indexOf("            const pattern = $('#chinese-text')");
logic=logic.slice(0,start)+`            const regex = getRegex(pattern);\n return [...new Set(words.filter(w=>regex.test(w)))];\n};\n`;
logic=logic.replace('const end = pattern.indexOf(\'}\', i);',"const end = pattern.indexOf('}', i); if(end < 0) throw new Error('缺少右花括号');");
for(const expr of ['conponentRev[c]','ord[num]'])logic=logic.replaceAll(expr,`(${expr} || [])`);
let data='';for(const p of ['out.js','factorHan.js','spell.js'])data+=await readFile(join(src,'chinese-puzzle',p),'utf8')+'\n';
await writeFile(join(out,'chinese-puzzle/search.js'),data+'\n'+logic);
for(const file of ['processing','visualization']){await copy('stereogram',`src/ts/${file}.ts`,`${file}.ts`);await writeFile(join(out,'stereogram',file+'.js'),stripTypeScriptTypes(await readFile(join(src,'stereogram/src/ts',file+'.ts'),'utf8')));}
for(const path of ['sstv','worker','spec.js','utils.js','fft.js'])await copy('sstv','src/'+path,path);
for(const [name,pkg,paths]of [['ffmpeg','@ffmpeg/ffmpeg',['dist/esm']],['ffmpeg-core','@ffmpeg/core',['dist/esm']],['zxing','zxing-wasm',['dist/full/zxing_full.wasm']]]){
 await mkdir(join(out,name),{recursive:true});for(const path of paths)await cp(join(npm,pkg,path),join(out,name,path.split('/').at(-1)),{recursive:true});
 for(const file of (await readdir(join(npm,pkg))).filter(f=>/^(LICENSE|COPYING|README|package.json)/i.test(f)))await cp(join(npm,pkg,file),join(out,name,file));
 const info=JSON.parse(await readFile(join(npm,pkg,'package.json'),'utf8'));entries.push({name,package:pkg,version:info.version,license:info.license,repository:typeof info.repository==='object'?info.repository.url:info.repository,local_directory:join(out,name)});
}
execFileSync(join(npm,'.bin/esbuild'),[join(npm,'zxing-wasm/dist/es/full/index.js'),'--bundle','--format=esm','--minify',`--outfile=${out}/zxing/index.js`]);
const existing=JSON.parse(await readFile(join(out,'PROJECTS.json'),'utf8').catch(()=>'[]'));
for(const entry of existing)if(!entries.some(e=>e.name===entry.name))entries.push(entry);
await writeFile(join(out,'PROJECTS.json'),JSON.stringify(entries,null,2)+'\n');
const manifest=JSON.parse(await readFile('upstream-manifest.json','utf8'));manifest.components=manifest.components.filter(x=>!entries.some(y=>y.name===x.name));manifest.components.push(...entries);await writeFile('upstream-manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log('Imported '+entries.length+' browser projects.');
