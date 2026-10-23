import {readFile, writeFile, mkdir, copyFile} from 'node:fs/promises';
import {resolve, dirname, relative, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

// Offline regeneration from a fixed, original checkout. No npm packages / CDN.
const root = fileURLToPath(new URL('../', import.meta.url));
const flag = process.argv.indexOf('--source');
const source = flag >= 0 ? resolve(process.argv[flag + 1]) : resolve(root, 'upstream/expansion/hunt/cipher-machine');
const original = resolve(root, 'upstream/expansion/cipher-constraints');
const runtime = resolve(root, 'public/vendor/expansion/cipher-constraints');
const commit = '29fa4ee1c60873484688c250b37c87d93f54cae4';
const names = ['LICENSE', 'readme.md', 'src/index.html', 'src/sudoku/index.js', 'src/sudoku/solverParser.js', 'src/common/Trie.js', 'src/substitution/MappingTable.js', 'src/substitution/Token.js', 'src/substitution/token-list.js', 'src/substitution/substitution.js'];
const hashes = {}, generated = {};
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
for (const name of names) {
  const bytes = await readFile(resolve(source, name));
  hashes[name] = hash(bytes);
  await mkdir(dirname(resolve(original, name)), {recursive: true});
  await copyFile(resolve(source, name), resolve(original, name));
}
await mkdir(runtime, {recursive: true});
await copyFile(resolve(original, 'LICENSE'), resolve(runtime, 'LICENSE.txt'));
const read = async name => (await readFile(resolve(original, name), 'utf8')).replace(/\r\n/g, '\n');
const change = (sourceText, before, after, label) => {
  if (!sourceText.includes(before)) throw Error(`Pinned source does not match patch: ${label}`);
  return sourceText.replace(before, after);
};
let parser = await read('src/sudoku/solverParser.js');
parser = change(parser, '  handleHashi(globalRules) {', '  handleHashi(globalRules) {\n    const {n, m} = this;', 'Hashi scoped dimensions');
parser = change(parser, '  getOriginAreas(str, start) {', '  getOriginAreas(str, start) {\n    const {m} = this;', 'row scoped dimensions');
parser = change(parser, 'for (let col = 0; col < this.n; col++) {\n          ret.push([]);\n          for (let row = 0; row < this.m; row++) {', 'for (let col = 0; col < this.m; col++) {\n          ret.push([]);\n          for (let row = 0; row < this.n; row++) {', 'rectangular columns');
parser = parser.replace(/alert\(([^\n]+)\);/g, 'throw new Error($1);');
parser = change(parser, '    const rules = this.getRules(lineStr, restrictAreas.stopPos);', '    if(!restrictAreas || !restrictAreas.restrictArea) throw new Error(`无法识别规则区域: ${lineStr}`);\n    const rules = this.getRules(lineStr, restrictAreas.stopPos);', 'unknown area rejection');
parser = change(parser, 'rules.smallerThan || rules.largerThan', 'rules.smallerThan !== undefined || rules.largerThan !== undefined', 'zero-valued numeric bounds');
parser = change(parser, '    while (1) {\n      let numberToken = this.getNumber(str, index);', '    while (1) {\n      if(index >= str.length) throw new Error("规则列表缺少结束方括号。");\n      let numberToken = this.getNumber(str, index);', 'list bounds');
parser = change(parser, "        while(str[index] != ']' && str[index] != ',') {", "        while(index < str.length && str[index] != ']' && str[index] != ',') {", 'list token bounds');
parser = parser.replace('/^\\-*\\d+/', '/^\\-?\\d+/');
parser = change(parser, "    if (str[start] === '是') {", "    if(str.startsWith('大于等于', start)) return {largerThan: this.getNumber(str, start+4).value-1};\n    if(str.startsWith('小于等于', start)) return {smallerThan: this.getNumber(str, start+4).value+1};\n    if (str[start] === '是') {", 'inclusive bounds precedence');
parser = change(parser, '      const list = this.getNumberList(str, start + 9).set;', '      const list = this.getNumberList(str, start + 9).set.map(x => typeof x === "number" ? x+1 : x);', 'numeric permutation values');
parser = change(parser, '      const regexResult = lineStr.match(/^如果(?<ifCondition>(?<![,，]).*),那么(?<statement>.*)/).groups;', '      const match = lineStr.match(/^如果(?<ifCondition>.*?)[,，]那么(?<statement>.+)$/);\n      if(!match) throw new Error("如果规则需要使用：如果条件,那么结论。");\n      const regexResult = match.groups;', 'conditional parsing');

let solver = await read('src/sudoku/index.js');
solver = solver.replace("'./solverParser'", "'./solver-parser.js'").replace("'../common/Trie'", "'./trie.js'");
solver = change(solver, '    new SolverParser(rulesList, n, m, globalRules, globalFinalRules);', '    this.parser = new SolverParser(rulesList, n, m, globalRules, globalFinalRules);\n    this.validateParsed?.(globalRules, globalFinalRules);', 'parsed contract callback');
solver = change(solver, '    $(\'#sudokuAnswer\').html("");\n    if(ret != -1)await this.dfs();\n\n    $(\'#sudokuAnswer\').append("已找到所有解");', '    this.searchComplete = ret === -1 || (await this.dfs()) !== -1;\n    return this.searchComplete;', 'remove DOM final status');
const printStart = solver.indexOf('  print() {'), printEnd = solver.indexOf('  relax() {', printStart);
if (printStart < 0 || printEnd < 0) throw Error('Pinned print method not found');
solver = solver.slice(0, printStart) + '  print() { this.onSolution?.(this.possibleArray.map(set => set?.size === 1 ? [...set][0] : null)); }\n\n' + solver.slice(printEnd);
solver = change(solver, "      this.print();\n      await this.callback();\n      if (confirm('发现了一个解，是否继续寻找下一个解?(可能耗时很久)')) {", '      if(this.isValidSolution && !this.isValidSolution()) return 0;\n      this.print();\n      await this.callback();\n      if (this.shouldContinue?.() !== false) {', 'replace confirm and validate leaf');
solver = change(solver, '  async dfs() {', '  async dfs() {\n    this.checkCancelled?.();', 'cooperative cancellation');
solver = change(solver, '  isSatisfied(areas, rule) {', '  isSatisfied(areas, rule) {\n    if(this.evaluateRule) return this.evaluateRule(areas, rule);', 'all rule kinds in conditional evaluation');
solver = solver.replace('window.Trie', 'this.trie');
solver = change(solver, '    mp.forEach((val, key)=>{', '    if(mp.size === areas.length) mp.forEach((val, key)=>{', 'all-different hidden single soundness');
solver = change(solver, 'origin[unknowList] = new Set(possibleList);', 'origin[unknowList] = new Set(this.possibleArray[unknowList]);', 'sum rollback scope');
solver = change(solver, 'possibleList.length > 1 && possibleList.has(rule.item)', 'possibleList.size > 1 && possibleList.has(rule.item)', 'Set count size');
solver = change(solver, 'if(hasItemCount < u)', 'if(hasItemCount < u || cnt > u)', 'count overshoot contradiction');
solver = change(solver, '        this.possibleArray[area];', '        this.possibleArray[area].delete(item);', 'permutation pruning assignment');
solver = change(solver, 'if(!cur || this.possibleArray[cur].size != 1)return;', 'if(cur === undefined || cur === null || !this.possibleArray[cur] || this.possibleArray[cur].size != 1)return;', 'zero-index loop');
solver = change(solver, '      let count = 0;\n      while(1) {', '      let count = 0;\n      const visited = new Set();\n      while(1) {\n        if(visited.has(cur)) return;\n        visited.add(cur);', 'loop traversal cycle guard');
solver = change(solver, '      if(!neighbour)continue;', '      if(neighbour === undefined || neighbour === null)continue;', 'zero-index bridge neighbor');
solver = change(solver, 'this.possibleArray[area] = new Set(statement.rules.set);', 'this.possibleArray[area] = new Set(statement.rules.set.filter(value => this.possibleArray[area].has(value)));', 'conditional domain intersection');
solver = solver.replace(/if\s*\(((?:statement\.rules|rule\.rules|rule)\.(?:largerThan|smallerThan|sum))\)/g, 'if($1 !== undefined)');
solver = solver.replace(/(rule\.rules && rule\.rules\.(?:largerThan|smallerThan))\)/g, '$1 !== undefined)');
// Logging upstream candidate arrays can be both large and clue-sensitive.
solver = solver.replace(/^\s*console\.info\([^\n]*\);?\s*$/gm, '');

let mapping = await read('src/substitution/MappingTable.js');
mapping = "import {applyLocks} from './dictionary-context.js';\n" + mapping;
mapping = change(mapping, '\n\tinit() {', '\n\tinit() {', 'mapping source marker');
mapping = change(mapping, '\n\t}\n\n\tinit()', '\n\t\tapplyLocks(this);\n\t}\n\n\tinit()', 'initial locked mapping');
mapping = change(mapping, '\n\t\treturn true;\n\t}\n\n\tgetAllowedChars', '\n\t\treturn count === 1;\n\t}\n\n\tgetAllowedChars', 'empty mapping not unique');
mapping = mapping.replaceAll('String.fromCharCode(97 + j)] !== MappingTable.impossible', 'String.fromCharCode(97 + i)] !== MappingTable.impossible').replaceAll('ret.push(String.fromCharCode(97 + j))', 'ret.push(String.fromCharCode(97 + i))');
let token = (await read('src/substitution/Token.js')).replace("'./MappingTable'", "'./mapping-table.js'");
token = change(token, '\t\t\tfor(var j = 0; j < len; j++) {', '\t\t\tfor(var j = 0; j < len; j++) {\n                if(!/[a-z]/.test(this.word[j])) { if(this.word[j] !== possibleWord[j]) { deleteList[i] = 1; flag = true; break; } continue; }', 'apostrophe matching');
token = change(token, '\t\tfor(var i = 0; i < len; i++) {', '\t\tfor(var i = 0; i < len; i++) {\n            if(!/[a-z]/.test(this.word[i])) continue;', 'apostrophe mapping skip');
let tokenList = (await read('src/substitution/token-list.js')).replace("'./Token'", "'./token.js'");
tokenList = "import {dictionaryWords} from './dictionary-context.js';\n" + tokenList;
const buildStart = tokenList.indexOf('    build(rawTokens,'), buildEnd = tokenList.indexOf('    set list(val)', buildStart);
if(buildStart < 0 || buildEnd < 0) throw Error('Pinned token list build not found');
tokenList = tokenList.slice(0, buildStart) + `    build(rawTokens, knownWordsList, mappingTable, weight) {
        for(let i = 0; i < rawTokens.length; i++) {
            const possibleList = (dictionaryWords[this.pattern(rawTokens[i])] || []).slice();
            this.generateWeight(possibleList, weight);
            const token = new Token(rawTokens[i], possibleList, i);
            token.customize(mappingTable);
            if(token.possibleList.length === 1) knownWordsList.list[i] = token;
            else this._list.push(token);
        }
    }

` + tokenList.slice(buildEnd);
let substitution = (await read('src/substitution/substitution.js')).replace("'./MappingTable'", "'./mapping-table.js'");
substitution = change(substitution, "var rawTokens = text.split(/[^a-zA-Z\\']+/);", "var rawTokens = text.split(/[^a-zA-Z\\']+/).filter(Boolean);", 'dense token positions');
substitution = change(substitution, 'unknownWordsList.refreshByMappintTable(knownWordsList, mappingTable);', 'if(!unknownWordsList.refreshByMappintTable(knownWordsList, mappingTable)) return [];', 'empty domain rejection');
substitution = change(substitution, '\t\twhile(stack.length > 0 || stack2.length > 0) {', '\t\tthis.searchComplete = true;\n\t\twhile(stack.length > 0 || stack2.length > 0) {\n            this.checkCancelled?.();', 'substitution cancellation');
substitution = change(substitution, 'if(countOfAnswer > this.maxOutput)', 'if(countOfAnswer >= this.maxOutput)', 'exact result limit');
substitution = change(substitution, '\t\t\t\t\t\treturn;\n\t\t\t\t\t}', '\t\t\t\t\t\tthis.searchComplete = false;\n\t\t\t\t\t\treturn;\n\t\t\t\t\t}', 'enumeration status');
substitution = substitution.replace(/^\s*console\.info\([^\n]*\);?\s*$/gm, '');
const context = `export let dictionaryWords = Object.create(null);
let locked = Object.create(null);
export function configureDictionary(words, mappings) { dictionaryWords = words; locked = mappings; }
export function applyLocks(table) {
  for(const [cipher, plain] of Object.entries(locked)) {
    for(let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(97+i);
      table.matrix[cipher][letter] = letter === plain ? 1 : 0;
      if(letter !== cipher) table.matrix[letter][plain] = 0;
    }
    table.ensure[cipher] = plain;
  }
}
`;
const files = {'solver.js': solver, 'solver-parser.js': parser, 'trie.js': await read('src/common/Trie.js'), 'mapping-table.js': mapping, 'token.js': token, 'token-list.js': tokenList, 'substitution.js': substitution, 'dictionary-context.js': context};
for(const [name, text] of Object.entries(files)) {
  const output = '// Generated from philippica/cipher_machine; BSD-3-Clause. Original source and explicit corrections: scripts/import-cipher-constraints.mjs.\n' + text;
  await writeFile(resolve(runtime, name), output);
  generated[name] = hash(output);
}
const manifest = {project: 'cipher_machine constraint / substitution core', repository: 'https://github.com/philippica/cipher_machine', commit, license: 'BSD-3-Clause', license_path: 'LICENSE.txt', original_source_directory: relative(root, original).split(sep).join('/'), source_sha256: hashes, generated_sha256: generated, generator: 'scripts/import-cipher-constraints.mjs', adaptations: ['ES module import paths; instance-owned dictionary and dimensions', 'DOM printing / confirm replaced by structured callbacks, cancellation and bounded enumeration', 'Parser bounds / inclusive comparison / rectangular columns / numeric permutation corrections', 'Set count, sum rollback, all-different soundness, zero-index loop / bridge corrections', 'Locked substitution mappings, contractions, absent dictionary patterns and exact result-limit handling']};
await writeFile(resolve(runtime, 'UPSTREAM.json'), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(resolve(original, 'UPSTREAM.json'), JSON.stringify({...manifest, source_directory: 'upstream/expansion/hunt/cipher-machine'}, null, 2) + '\n');
console.log('Fixed cipher_machine constraint/substitution adapters regenerated from preserved original sources.');
