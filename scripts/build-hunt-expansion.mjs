// Offline generator. Only pinned upstream literals execute here, never player code.
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
const root='upstream/expansion/hunt',out='public/vendor/expansion/hunt';
await mkdir(out,{recursive:true});
const read=(project,file)=>readFile(`${root}/${project}/${file}`,'utf8');
const evaluate=(text,expression)=>runInNewContext(text+';'+expression,{windows:{},window:{}},{timeout:20000});
const english={};
const base=evaluate(await read('cipher-machine','src/dict.js'),'words');
const pos=evaluate(await read('cipher-machine','src/common/out.js'),'c');
english.standard=Object.entries(base).flatMap(([pattern,words])=>Array.isArray(words)?words.map((word,i)=>({word,flags:pos[pattern]?.[i]??16})):[]);
english.large=(await read('cipher-machine','dict_large.txt')).split(/\s+/u).filter(Boolean).map(word=>({word,flags:16}));
english.raw=(await read('cipher-machine','dict.txt')).split(/\s+/u).filter(Boolean).map(word=>({word,flags:16}));
const alternate=evaluate(await read('cipher-machine','others/out.js'),'words');
english.alternate=Object.values(alternate).flatMap(x=>Array.isArray(x)?x:[]).filter(Boolean).map(word=>({word,flags:16}));
english.twl06=evaluate(await read('cipher-machine','others/twl06.js'),'words').filter(Boolean).map(word=>({word,flags:16}));
english.idioms=(await read('cipher-machine','others/english-idioms.txt')).split(/\r?\n/u).filter(Boolean).map(word=>({word,flags:16}));
const counts={};
for(const [key,rows]of Object.entries(english)){
  await writeFile(`${out}/english-${key}.json`,JSON.stringify(rows));counts[key]={records:rows.length,unique:new Set(rows.map(x=>x.word)).size};
}
const idioms=evaluate((await read('chinese-puzzle','chinese.js')).split("$('#chinese-btn')")[0],'idioms');
await writeFile(`${out}/chinese-idioms.json`,JSON.stringify(idioms));
const chineseHtml=await read('chinese-puzzle','index.html');
let oneWord=await read('cipher-machine','src/one-word/one-word.js');
oneWord=oneWord.replace(/from\s+["']\.\.\/common\/Trie(?:\.js)?["']/,'from "../../hunt/cipher-machine/common/Trie.js"');
if(!oneWord.includes('from "../../hunt/cipher-machine/common/Trie.js"'))throw Error('Pinned Trie import correction no longer matches');
oneWord=oneWord.replace('eval(`/${str}/`)','new RegExp(str)').replace('eval(`/${ww.whole}/`)','new RegExp(ww.whole)');
if(/\beval\(/.test(oneWord.slice(0,oneWord.indexOf('    async findByCode('))))throw Error('Uncorrected upstream dynamic regex execution');
const capStart=oneWord.indexOf('                        if(count > 20000)'),capEnd=oneWord.indexOf('                        await callback(word.length-1',capStart);
if(capStart<0||capEnd<0)throw Error('Pinned two-word cap correction no longer matches');
oneWord=oneWord.slice(0,capStart)+oneWord.slice(capEnd);
const codeStart=oneWord.indexOf('    async findByCode(');if(codeStart<0)throw Error('Pinned code boundary no longer matches');
oneWord=oneWord.slice(0,codeStart)+'    // Code predicates are owned by expansion/word-code.js in an isolated QuickJS VM.\n}\n';
await writeFile(`${out}/one-word.js`,oneWord);
let logic=chineseHtml.split('    <script>')[1].split('    </script>')[0];
logic=logic.slice(0,logic.indexOf("        $('#chinese-btn')"));
logic=logic.replace('const search = () => {','export const searchChinese = (pattern,corpus) => {');
const queryStart=logic.indexOf("            const pattern = $('#chinese-text')");
logic=logic.slice(0,queryStart)+`            const regex=getRegex(pattern);\nreturn [...new Set((corpus||words).filter(w=>regex.test(w)))];\n};\nexport const CHINESE_WORD_COUNT=words.length;\n`;
logic=logic.replace("const end = pattern.indexOf('}', i);","const end = pattern.indexOf('}', i);if(end<0)throw Error('缺少右花括号');");
// Upstream dereferences absent property sets. Preserve an empty set as a real
// no-match instead of throwing halfway through a valid conjunction.
for(const expression of ['conponentRev[c]','ord[num]'])logic=logic.replaceAll(expression,`(${expression}||[])`);
const originalData=await Promise.all(['out.js','factorHan.js','spell.js'].map(f=>read('chinese-puzzle',f)));
await writeFile(`${out}/chinese-search.js`,originalData.join('\n')+'\n'+logic);
const facets=evaluate(await read('chinese-puzzle','subs/output.js'),'hanzi');
await writeFile(`${out}/stroke-endpoints.json`,JSON.stringify(facets));
const html=await read('chinese-puzzle','subs/焖肉面分面.html'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const km=script.slice(script.indexOf('const km='),script.indexOf(',canvas=document'))+';';
const compare=script.slice(script.indexOf('const compare='),script.indexOf(';function handle'))+';';
await writeFile(`${out}/stroke-matching.js`,'// Adapted from the pinned ChinesePuzzleTool endpoint matcher. BSD-2-Clause.\n'+km+'\n'+compare+'\nexport {compare};\n');
for(const name of ['chinese-puzzle','cipher-machine'])await writeFile(`${out}/${name}-LICENSE.txt`,await read(name,'LICENSE'));
await writeFile(`${out}/NOTICE.txt`,'ChinesePuzzleTool (BSD-2-Clause) and cipher_machine (BSD-3-Clause), philippica and contributors.\nAll pinned source files retained under upstream/expansion/hunt. Dictionaries preserve every supplied record; alternate lists are separately selectable and are not silently merged or shortened. Sources collected from the internet are not authoritative; upstream dataset attribution/conditions remain applicable.\nRuntime matcher is generated from the pinned original; DOM drawing is replaced by the host UI. No player JavaScript runs in the host: custom predicates use isolated QuickJS.\n');
const chineseCounts=evaluate(originalData.join('\n'), '({words:ws.split("\\n").length,characters:hanzi.split("\\n").length,pinyinKeys:Object.keys(spell).length})');
await writeFile(`${out}/DATASETS.json`,JSON.stringify({english:counts,chinese:chineseCounts,chineseIdioms:idioms.length,strokeCharacters:Object.keys(facets).length,strokeDataEntries:Object.values(facets).reduce((n,a)=>n+a.length,0)},null,2)+'\n');
const files=[];for(const file of await readdir(out)){if(file==='UPSTREAM.json')continue;const b=await readFile(out+'/'+file);files.push({path:file,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')});}
await writeFile(`${out}/UPSTREAM.json`,JSON.stringify({sources:['chinese-puzzle','cipher-machine'].map(name=>({name,path:`${root}/${name}/UPSTREAM.json`})),generator:'scripts/build-hunt-expansion.mjs',files},null,2)+'\n');
console.log(JSON.stringify({english:counts,chineseIdioms:idioms.length,strokeCharacters:Object.keys(facets).length}));
