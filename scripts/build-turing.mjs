// Deterministic offline CommonJS -> ESM adapter; originals are never edited.
import {readFile, writeFile, mkdir, readdir, copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join, relative} from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const upstream = join(root, 'upstream/turing');
const out = join(root, 'public/vendor/turing');
const imported = JSON.parse(await readFile(join(upstream, 'imports.json'), 'utf8'));
const sha = value => createHash('sha256').update(value).digest('hex');
for (const file of imported.files) if (sha(await readFile(join(root, file.path))) !== file.sha256) throw Error('Turing source integrity mismatch: ' + file.path);
await mkdir(out, {recursive: true});
const source = name => readFile(join(upstream, 'sources/turing-machine-viz', name), 'utf8');
function replace(text, search, value) {if (!text.includes(search)) throw Error('Turing adapter source anchor changed: ' + search); return text.replaceAll(search, value);}

let machine = await source('src/TuringMachine.js');
machine = replace(machine, "case MoveHead.left:  tape.headLeft();  break;", "case MoveHead.left:  tape.headLeft();  break;\n    case MoveHead.stay: break;");
machine = replace(machine, "var MoveHead = Object.freeze({", "var MoveHead = Object.freeze({\n  stay:  {toString: function () { return 'S'; } },");
machine = machine.slice(0, machine.indexOf('exports.MoveHead')) + 'export {MoveHead, MoveTape, TuringMachine};\n';
await writeFile(join(out, 'machine.js'), '// Generated from turing-machine-viz; adapter adds S (stay). See NOTICE.txt.\n' + machine);

let tape = await source('src/tape/Tape.js');
tape = replace(tape, "var _ = require('lodash/fp');", "import _ from './helpers.js';");
tape = replace(tape, 'module.exports = Tape;', 'export default Tape;');
await writeFile(join(out, 'tape.js'), '// Generated from upstream Tape; native helper subset only. See NOTICE.txt.\n' + tape);

let parser = await source('src/parser.js');
parser = replace(parser, "var TM = require('./TuringMachine'),\n    jsyaml = require('js-yaml'),\n    _ = require('lodash');", "import * as TM from './machine.js';\nimport * as jsyaml from './yaml-adapter.js';\nimport _ from './helpers.js';");
parser = replace(parser, "obj.blank.length !== 1", "Array.from(obj.blank).length !== 1");
parser = replace(parser, "writeStr.length === 1", "Array.from(writeStr).length === 1");
parser = replace(parser, 'obj.startState in obj.table', 'Object.hasOwn(obj.table, obj.startState)');
parser = replace(parser, 'instruct.state in table', 'Object.hasOwn(table, instruct.state)');
parser = replace(parser, 'if (synonyms && synonyms[val])', 'if (synonyms && Object.hasOwn(synonyms, val))');
parser = replace(parser, "var moveRight = Object.freeze({move: TM.MoveHead.right});", "var moveRight = Object.freeze({move: TM.MoveHead.right});\nvar moveStay = Object.freeze({move: TM.MoveHead.stay});");
parser = replace(parser, "if (val === 'L') {", "if (val === 'S') { return moveStay; }\n  if (val === 'L') {");
parser = replace(parser, "key === 'L' || key === 'R' || key === 'write'", "key === 'L' || key === 'R' || key === 'S' || key === 'write'");
parser = replace(parser, "if ('L' in val && 'R' in val)", "if (['L', 'R', 'S'].filter(key => Object.hasOwn(val, key)).length > 1)");
parser = replace(parser, "if ('L' in val) {", "if (Object.hasOwn(val, 'S')) {\n    move = TM.MoveHead.stay;\n    state = val.S;\n  } else if (Object.hasOwn(val, 'L')) {");
parser = replace(parser, "'R' in val", "Object.hasOwn(val, 'R')");
parser = replace(parser, "'write' in val", "Object.hasOwn(val, 'write')");
parser = replace(parser, 'exports.TMSpecError = TMSpecError;\nexports.parseSpec = parseSpec;\n// re-exports\nexports.YAMLException = jsyaml.YAMLException;', 'export {TMSpecError, parseSpec};\nexport const YAMLException = jsyaml.YAMLException;');
await writeFile(join(out, 'parser.js'), '// Generated upstream parser: js-yaml 4, Unicode scalar/S extensions, safe own-key checks. See NOTICE.txt.\n' + parser);

// Original lodash utility algorithms are not bundled. This small, authored
// subset has deliberately null-prototype output for untrusted YAML state names.
await writeFile(join(out, 'helpers.js'), `// Native utility subset for the upstream adapter; no lodash code is copied.\nexport default {\n  identity: value => value,\n  last: array => array[array.length - 1],\n  isEmpty: value => value.length === 0,\n  range: (start, end) => Array.from({length: Math.max(0, end - start)}, (_, index) => start + index),\n  mapValues: (object, visit) => Object.assign(Object.create(null), Object.fromEntries(Object.keys(object).map(key => [key, visit(object[key], key)]))),\n  omitBy: (object, predicate) => Object.assign(Object.create(null), Object.fromEntries(Object.entries(object).filter(([, value]) => !predicate(value)))),\n};\n`);
await copyFile(join(upstream, 'sources/js-yaml/dist/js-yaml.mjs'), join(out, 'js-yaml.mjs'));
await copyFile(join(upstream, 'sources/js-yaml/LICENSE'), join(out, 'js-yaml-LICENSE.txt'));
await copyFile(join(upstream, 'sources/turing-machine-viz/LICENSE'), join(out, 'LICENSE.txt'));
await writeFile(join(out, 'yaml-adapter.js'), `// Safe bounded YAML bridge for the preserved upstream parseSpec API.\nimport {load, JSON_SCHEMA, YAMLException} from './js-yaml.mjs';\nexport {YAMLException};\nfunction boundedLoad(text) {\n  let depth = 0, nodes = 0;\n  return load(text, {schema: JSON_SCHEMA, listener(event) {\n    if (event === 'open' && (++depth > 16 || ++nodes > 16384)) throw Error('YAML 层级或节点超过限制。');\n    if (event === 'close') depth--;\n  }});\n}\nexport function safeLoad(text) {\n  let object = boundedLoad(text);\n  if (object && typeof object === 'object' && Object.hasOwn(object, 'source code') && typeof object['source code'] === 'string') object = boundedLoad(object['source code']);\n  // Reject recursion and excessive alias sharing before the upstream parser.\n  const seen = new Set();\n  let visits = 0;\n  const visit = (value, level = 0) => {\n    if (++visits > 16384 || level > 16) throw Error('YAML 层级或节点超过限制。');\n    if (!value || typeof value !== 'object') return;\n    if (seen.has(value)) throw Error('不支持循环或重复 YAML 引用，请展开规则后导入。');\n    seen.add(value);\n    for (const item of Object.values(value)) visit(item, level + 1);\n  };\n  visit(object);\n  if (!object || typeof object !== 'object' || Array.isArray(object)) throw Error('机器定义必须是 YAML 映射。');\n  for (const key of ['blank', 'start state', 'table']) if (!Object.hasOwn(object, key)) throw Error('机器定义缺少 ' + key + '。');\n  if (typeof object.blank === 'object' || typeof object['start state'] === 'object') throw Error('空白符与初始状态必须是文字。');\n  for (const key of ['table', 'synonyms']) if (object[key] != null && (typeof object[key] !== 'object' || Array.isArray(object[key]))) throw Error(key + ' 必须是映射。');\n  const checkInstruction = value => {\n    if (!value || typeof value !== 'object') return;\n    for (const key of ['write', 'L', 'R', 'S']) if (Object.hasOwn(value, key) && value[key] != null && !['string', 'number'].includes(typeof value[key])) throw Error('写入符号与目标状态必须是文字或数字。');\n  };\n  for (const value of Object.values(object.synonyms || {})) checkInstruction(value);\n  for (const value of Object.values(object.table || {})) {\n    if (Array.isArray(value)) throw Error('状态的转换规则必须是映射。');\n    if (value && typeof value === 'object') for (const instruction of Object.values(value)) checkInstruction(instruction);\n  }\n  return object;\n}\n`);
await writeFile(join(out, 'NOTICE.txt'), `Turing machine integration\n\nTuring Machine Viz / turingmachine.io by Andy Li, copyright 2015–2021.\nhttps://github.com/aepsilon/turing-machine-viz\nBSD-3-Clause. Pinned commit: ${imported.pins['turing-machine-viz']}.\nOriginal source, examples and license retained in upstream/turing/sources/turing-machine-viz.\nRuntime parser, transition machine and zipper tape are generated ESM adapters.\nExplicit adaptations: CommonJS imports/exports; native safe helper subset replacing\nthe few lodash calls (no lodash code copied); own-property checks; Unicode scalar\nsymbol validation; S/stay movement extension. Sparse output/history/limits and\nChinese diagnostics belong to the site's core adapter. Group-symbol syntax follows\nthe original StateGraph normalization. Original D3, Ace, Bootstrap, storage,\nsharing and remote document UI are excluded.\n\njs-yaml ${imported.packages['js-yaml'].version}, copyright Vitaly Puzrin, MIT.\nhttps://github.com/nodeca/js-yaml\njs-yaml.mjs is the exact original npm distribution, verified against SHA-512.\nThe wrapper uses JSON_SCHEMA (no executable tags), bounded nesting/nodes, rejects\nrecursive/repeated aliases and duplicate mapping keys, and supports an upstream\nexported document's 'source code' property. Standard machine YAML is unchanged.\n\nGenerator: scripts/build-turing.mjs (offline).\nImporter: scripts/import-turing.mjs (maintenance-only network).\nAll imported sources and runtime files have SHA-256 records in UPSTREAM.json.\n`);
const records = [...imported.files];
for (const path of ['scripts/import-turing.mjs', 'scripts/build-turing.mjs']) records.push({path, sha256: sha(await readFile(join(root, path)))});
for (const name of (await readdir(out)).sort()) if (name !== 'UPSTREAM.json') records.push({path: relative(root, join(out, name)).replaceAll('\\','/'), sha256: sha(await readFile(join(out, name)))});
await writeFile(join(out, 'UPSTREAM.json'), JSON.stringify({...imported, files: records}, null, 2) + '\n');
console.log('Generated pinned Turing engine adapter:', records.length, 'hashed files');
