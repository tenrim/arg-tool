// Explicit maintenance import. Normal build/dev never contacts Alpertron.
// Default mode re-extracts and verifies the pinned offline snapshots; --fetch
// downloads those same snapshots and rejects changed upstream bytes.
import {readFile, writeFile, mkdir, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = resolve(root, 'upstream/expansion/alpertron');
const vendor = resolve(root, 'public/vendor/expansion/alpertron');
const commit = '93c5c8189cb2f149c8dae898eb11997c5f2e7980';
const archiveUrl = `https://api.github.com/repos/alpertron/calculators/tarball/${commit}`;
const entries = [
  ['integer', 'ECM.HTM', 'ECM.deployed.htm'], ['gaussian', 'GAUSSIAN.HTM'],
  ['quadratic', 'QUAD.HTM'], ['discreteLog', 'DILOG.HTM'], ['quadraticMod', 'QUADMOD.HTM'],
  ['squares', 'FSQUARES.HTM'], ['cubes', 'FCUBES.HTM'], ['twoSquaresPower', 'TSQCUBES.HTM'],
  ['continuedFraction', 'CONTFRAC.HTM'], ['polynomial', 'POLFACT.HTM'],
];
const hash = value => createHash('sha256').update(value).digest('hex');
const lock = JSON.parse(await readFile(resolve(source, 'import-lock.json'), 'utf8'));
const getExpected = (name, type = 'sources') => {
  const entry = lock[type].find(item => item.path === name);
  if (!entry) throw new Error(`Missing pinned checksum for ${name}`);
  return entry;
};
const validate = (name, bytes, type = 'sources') => {
  const expected = getExpected(name, type);
  if (hash(bytes) !== expected.sha256 || bytes.length !== expected.bytes) throw new Error(`Upstream checksum changed: ${name}. Review a pinned upgrade explicitly.`);
};
const fetchPinned = async (url, filename) => {
  const response = await fetch(url, {signal: AbortSignal.timeout(60000)});
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  validate(filename, bytes);
  return bytes;
};
await mkdir(vendor, {recursive: true});
const fetched = new Map();
if (process.argv.includes('--fetch')) {
  // Validate all downloads before replacing a single source file.
  for (const [, page, stored = `${page}.deployed.htm`] of entries) fetched.set(stored, await fetchPinned(`https://www.alpertron.com.ar/${page}`, stored));
  fetched.set('source.tar.gz', await fetchPinned(archiveUrl, 'source.tar.gz'));
  for (const [name, bytes] of fetched) await writeFile(resolve(source, name), bytes);
}
const fileRecords = [];
const functionReference = {};
const decode = value => value.replace(/&#x([\da-f]+);|&#(\d+);|&(amp|lt|gt|quot|nbsp);/gi, (whole, hex, dec, entity) => hex ? String.fromCodePoint(parseInt(hex,16)) : dec ? String.fromCodePoint(Number(dec)) : ({amp:'&',lt:'<',gt:'>',quot:'"',nbsp:' '})[entity]);
const groupNames = {'Basic Math':'基本运算','Batch processing':'批处理','Comparisons':'比较','Logic':'二进制逻辑','Divisibility':'整除与素数','Recreational Math':'数字与数位','Number Theory':'数论函数','Other':'阶乘与数列','Hexadecimal input':'十六进制'};
const buttons = content => {
  const tokens = decode(content.replace(/<[^>]*>/g,'')).split(','), functions = [];
  for (let index = 0; index < tokens.length; index += 2) {
    const raw = tokens[index+1]; if (!raw) continue;
    const args = Number(raw.at(-1)), isFunction = args >= 1 && args <= 9;
    const label = isFunction ? raw.slice(0,-1)+'(' : raw;
    const insert = isFunction ? label+','.repeat(args-1)+')' : raw === '\u23ce' ? '\n' : raw;
    functions.push({label,insert,description:tokens[index].replace(/\\n/g,'\n')});
  }
  return functions;
};
const put = async (name, bytes) => {
  await writeFile(resolve(vendor, name), bytes);
  fileRecords.push({path: name, sha256: hash(bytes), bytes: bytes.length});
};
for (const [name, page, stored = `${page}.deployed.htm`] of entries) {
  const bytes = fetched.get(stored) || await readFile(resolve(source, stored));
  validate(stored, bytes);
  const match = bytes.toString('utf8').match(/<script[^>]*id="wasmb64"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error(`${page}: missing official embedded WASM`);
  const wasm = Buffer.from(match[1].replace(/\s+/g, '').replace(/!/g, '/'), 'base64');
  validate(`${name}.wasm`, wasm, 'files');
  if (!WebAssembly.validate(wasm)) throw new Error(`${page}: invalid WASM`);
  const imports = WebAssembly.Module.imports(new WebAssembly.Module(wasm));
  if (imports.some(item => item.module !== 'env' || !['databack', 'tenths', 'startSkipTest', 'endSkipTest', 'getCunn'].includes(item.name))) throw new Error(`${page}: unexpected engine imports`);
  await put(`${name}.wasm`, wasm);
  const html = bytes.toString('utf8'), groups = [];
  const names = [...(html.match(/<select id="funccat">([\s\S]*?)<\/select>/)?.[1] || '').matchAll(/<option value="\d+"[^>]*>([\s\S]*?)<\/option>/g)].map(match => decode(match[1].replace(/<[^>]*>/g,'')).trim());
  const parens = html.match(/<div id="parens">([\s\S]*?)<\/div>/)?.[1];
  if (parens) groups.push({name:'括号与变量',functions:buttons(parens)});
  for (const [,number,content] of html.matchAll(/<div id="btn(\d+)">([\s\S]*?)<\/div>/g)) {
    const functions = buttons(content), name = names[Number(number)-1];
    if (functions.length) groups.push({name:groupNames[name] || name || `函数组 ${number}`,functions});
  }
  functionReference[name] = {source:`https://www.alpertron.com.ar/${page}`,groups};
}
// Polynomial has no upstream button palette. Preserve its documented native
// grammar explicitly; the lower modulus field has the integer-expression grammar.
functionReference.polynomial.groups = [
  {name:'多项式表达式',target:'expression',functions:buttons('左括号,(,右括号,),变量,x,加,+,减,-,乘,*,除,/,余式,%,幂,^,最大公因式,GCD2,最小公倍式,LCM2,求导,Der1,随机多项式（最小次数、最大次数、最小系数、最大系数）,Random4')},
  ...functionReference.continuedFraction.groups.map(group => ({...group,name:'模数 · '+group.name,target:'modulus'})),
];
await put('functions.json', Buffer.from(JSON.stringify(functionReference,null,2)+'\n'));
const archive = await readFile(resolve(source, 'source.tar.gz'));
validate('source.tar.gz', archive);
await put('source.tar.gz', archive);
const extracted = (await readdir(source)).find(item => item.startsWith('alpertron-calculators-'));
if (!extracted) throw new Error('Extract the pinned source archive under upstream/expansion/alpertron before importing.');
const license = await readFile(resolve(source, extracted, 'LICENSE'));
await put('LICENSE.txt', license);
const musl = await readFile(resolve(source, 'musl-COPYRIGHT.txt'));
validate('musl-COPYRIGHT.txt', musl);
await put('musl-COPYRIGHT.txt', musl);
await put('NOTICE.txt', Buffer.from(`Alpertron Calculators\nCopyright Dario Alejandro Alpern\nLicense: GPL-3.0-or-later. Full license: LICENSE.txt.\nRepository: https://github.com/alpertron/calculators\nCorresponding source snapshot: ${commit}\nA complete unchanged source archive is bundled as source.tar.gz.\n\nThe ten WASM files are extracted without modification from the author's official deployed English calculator pages, release dated 2026-09-13, acquired 2026-10-16. Their independent SHA-256 pins identify the exact runtime bytes. This is not a claim that the deployed build has been independently reproduced from the Git snapshot.\n\nThe source includes from_musl.c: musl portions under MIT; the embedded Sun Microsystems 1993 mathematical-function notice is retained in that file and the bundled musl COPYRIGHT. Keep both notices.\n\nThe site supplies a native UI and a first-party Worker protocol adapter. The official calculator HTML, analytics, service worker, remote Cunningham lookup, feedback, and Blockly UI are not executed. The engine's math, expression grammar, batching and reports are unchanged. All computation is local.\n\nIntegrated: integer ECM/SIQS and related arithmetic reports, Gaussian integers, quadratic Diophantine equations, discrete logs, quadratic congruences, square/cube/odd-power sums, continued fractions, and polynomial calculations. Other upstream visualization/game pages are separately identified, not advertised as integrated.\n`));
const sourceRecords = [];
for (const [, page, stored = `${page}.deployed.htm`] of entries) sourceRecords.push({...getExpected(stored), url: `https://www.alpertron.com.ar/${page}`});
sourceRecords.push({...getExpected('source.tar.gz'), url: archiveUrl});
sourceRecords.push({...getExpected('musl-COPYRIGHT.txt'), url: 'https://github.com/emscripten-core/emscripten/blob/4.0.23/system/lib/libc/musl/COPYRIGHT'});
const manifest = {name: 'Alpertron Calculators', version: 'official deployment 2026-09-13', acquired: '2026-10-16', repository: 'https://github.com/alpertron/calculators', commit, license: 'GPL-3.0-or-later; musl MIT and embedded Sun Microsystems permissive notices', files: fileRecords, sources: sourceRecords, calculators: entries.map(([id, page]) => ({id, page, wasm: `${id}.wasm`}))};
await writeFile(resolve(vendor, 'UPSTREAM.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Alpertron: ${entries.length} unchanged local WASM engines, source archive, exact license notices and ${fileRecords.length} file hashes verified.`);
