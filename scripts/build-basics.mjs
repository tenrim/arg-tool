// Offline ESM adapters. Original source files are preserved and hash checked.
import {readFile, writeFile, mkdir, copyFile, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {stripTypeScriptTypes} from 'node:module';
import {fileURLToPath} from 'node:url';
import {join, relative} from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = join(root, 'public/vendor/basics');
const imported = JSON.parse(await readFile(join(root, 'upstream/basics/imports.json'), 'utf8'));
const hash = value => createHash('sha256').update(value).digest('hex');
for (const file of imported.files) if (hash(await readFile(join(root, file.path))) !== file.sha256) throw Error('Basic source integrity mismatch: ' + file.path);
await mkdir(out, {recursive: true});
const source = (project, file) => readFile(join(root, 'upstream/basics/sources', project, file), 'utf8');
function replace(text, search, value) {if (!text.includes(search)) throw Error('Basic adapter anchor changed: ' + search);return text.replaceAll(search, value);}
for (const file of ['index', 'symbols', 'converter']) {
  let text = await source('romanice', 'src/' + file + '.js');
  text = text.replace(/from '(\.\/[^']+)'/g, "from '$1.js'");
  await writeFile(join(out, 'roman-' + file + '.js'), text.replaceAll('./symbols.js', './roman-symbols.js').replaceAll('./converter.js', './roman-converter.js'));
}
// Type erasure leaves whitespace-only placeholder lines; normalize only those
// lines, preserving all runtime text and the untouched TypeScript original.
await writeFile(join(out, 'baudot.js'), stripTypeScriptTypes(await source('baudot', 'src/baudot.ts')).replace(/^[ \t]+$/gm,''));
let hidden = await source('invisibles', 'core.js');
const begin = '})(typeof self !== \'undefined\' ? self : this, function () {';
if (!hidden.includes(begin) || !hidden.trimEnd().endsWith('});')) throw Error('Invisibles wrapper changed');
hidden = 'const Invisibles = (() => {' + hidden.slice(hidden.indexOf(begin) + begin.length).trimEnd().slice(0, -3) + '})();\nexport default Invisibles;\n';
await writeFile(join(out, 'invisibles.js'), hidden);
// Extract exactly the original three methods used by the selected encoders.
const array = await source('cryptii', 'src/ArrayUtil.js');
function method(name) {
  const start = array.indexOf('  static ' + name + ' ');if (start < 0) throw Error('Missing ArrayUtil ' + name);
  let pos = array.indexOf('{', start), depth = 1, end = pos + 1;
  for (; depth && end < array.length; end++) {if (array[end] === '{') depth++;else if (array[end] === '}') depth--;}
  if (depth) throw Error('Unclosed ArrayUtil method');return array.slice(start, end);
}
await writeFile(join(out, 'ArrayUtil.js'), 'export default class ArrayUtil {\n' + ['isEqual', 'indexOfSlice', 'replaceSlice'].map(method).join('\n') + '\n}\n');
await writeFile(join(out, 'Encoder.js'), `// Authored compatibility surface; no upstream UI/Chain framework is bundled.
export class Chain {
  constructor(value) {this.text = value instanceof Chain ? value.text : Array.isArray(value) ? value.map(cp => String.fromCodePoint(cp)).join('') : String(value);this.characters=Array.from(this.text);}
  getString() {return this.text;}
  getCodePoints() {return this.characters.map(c => c.codePointAt(0));}
  getLength() {return this.characters.length;}
  getCharAt(index) {return this.characters[index];}
  toLowerCase() {return new Chain(this.text.toLowerCase());}
}
export default class Encoder {
  constructor() {this.values = Object.create(null);}
  addSettings(settings) {for (const spec of settings) this.values[spec.name] = spec.value;}
  setSettingValues(values) {Object.assign(this.values, values);}
  getSettingValue(name) {const value = this.values[name];return typeof value === 'string' ? new Chain(value) : value;}
  async translate(value, encode) {let chain = new Chain(value);if (this.willTranslate) chain = new Chain(this.willTranslate(chain, encode));return new Chain(await this[encode ? 'performEncode' : 'performDecode'](chain));}
  encode(value) {return this.translate(value, true);}
  decode(value) {return this.translate(value, false);}
}
`);
for (const file of ['PolybiusSquare', 'TapCode']) {
  let text = await source('cryptii', 'src/Encoder/' + file + '.js');
  text = replace(text, '../ArrayUtil.js', './ArrayUtil.js');text = replace(text, '../Encoder.js', './Encoder.js');
  if (file === 'PolybiusSquare') text = replace(text, "import InvalidInputError from '../Error/InvalidInput.js'", 'const InvalidInputError = Error');
  // Upstream confuses previous offset 0 with the first mark; a one-tap first
  // group followed by a space was incorrectly merged with the next group.
  if (file === 'TapCode') text = replace(text, 'i === 0 || j === i + tapMarkLength', 'j === 0 || j === i + tapMarkLength');
  await writeFile(join(out, file + '.js'), text);
}
for (const [name, file] of [['cryptii', 'LICENSE.txt'], ['romanice', 'LICENSE'], ['invisibles', 'LICENSE'], ['baudot', 'LICENSE.md']]) await copyFile(join(root, 'upstream/basics/sources', name, file), join(out, name + '-LICENSE.txt'));
await writeFile(join(out, 'NOTICE.txt'), `Basic conversions integration\n\nAll four selected projects use MIT; full copyrights and licenses accompany this file.\n${Object.entries(imported.projects).map(([name,p]) => name + ': https://github.com/' + p.repo + ' @ ' + p.commit).join('\n')}\n\nromanice: import extensions only. Standard 1–3999/canonical validation is in the site adapter.\ncryptii: original TapCode and PolybiusSquare algorithms; three original ArrayUtil methods; authored minimal Encoder/Chain compatibility, no upstream UI. Both coordinate axes use the same numeric labels. TapCode decode explicitly fixes the upstream offset-zero/first-group ambiguity (j === 0); original one-tap first groups otherwise merge across a separator. Strict input checks, word separators and keyed alphabets are handled by the site adapter.\ninvisibles: UMD wrapper replaced by ESM; original scanner and category cleaning retained. Chinese labels, preservation options and bounded views are site features.\nbaudot.js: TypeScript types stripped by Node; original stateful encoder/decoder and all three alphabet tables retained. Strict supported-character/codeword checks are site features.\n\nImporter scripts/import-basics.mjs; offline generator scripts/build-basics.mjs. Original files, adaptations and runtime hashes: UPSTREAM.json.\n`);
const records = [...imported.files];
for (const path of ['scripts/import-basics.mjs', 'scripts/build-basics.mjs']) records.push({path, sha256: hash(await readFile(join(root, path)))});
for (const file of (await readdir(out)).sort()) if (file !== 'UPSTREAM.json') records.push({path: relative(root, join(out, file)).replaceAll('\\','/'), sha256: hash(await readFile(join(out, file)))});
await writeFile(join(out, 'UPSTREAM.json'), JSON.stringify({...imported, files: records}, null, 2) + '\n');
console.log('Generated basic adapters:', records.length, 'hashed files');
