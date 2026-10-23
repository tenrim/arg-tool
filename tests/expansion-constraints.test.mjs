import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateConstraintPuzzle, solveConstraints, solveDictionarySubstitution, CONSTRAINT_PRESETS} from '../public/expansion/hunt-constraints.js';

test('real imported parser retains each named DSL rule and rejects invalid input clearly', () => {
  for (const preset of CONSTRAINT_PRESETS) assert.ok(validateConstraintPuzzle(preset).parsedRuleCount > 0, preset.id);
  assert.throws(() => validateConstraintPuzzle({rows: 2, columns: 2, rules: '第[1,2格是1'}), /方括号/);
  assert.throws(() => validateConstraintPuzzle({rows: 2, columns: 2, rules: '第7格是1'}), /题面之外/);
  assert.throws(() => validateConstraintPuzzle({rows: 2, columns: 2, rules: '每一格是从1到999999999的数字'}), /4,096/);
  assert.throws(() => validateConstraintPuzzle({rows: 2, columns: 2, rules: '这里不是规则'}), /规则解析失败/);
});

test('all five upstream presets actually solve at their original dimensions with the complete local dictionary', async () => {
  const words = JSON.parse(await readFile(new URL('../public/vendor/expansion/hunt/english-standard.json', import.meta.url), 'utf8')).map(row => row.word);
  assert.equal(words.length, 214093, 'use the complete pinned dictionary, not a demonstration subset');
  for (const preset of CONSTRAINT_PRESETS.filter(item => item.id !== 'custom')) {
    const result = await solveConstraints({...preset, maxSolutions: 2}, {words});
    assert.ok(result.solutionCount > 0, preset.id + ' must execute its real core');
    assert.equal(result.first.cells.length, preset.rows * preset.columns, preset.id);
    if (preset.id === 'mine' || preset.id === 'nonogram') {
      assert.equal(result.status, 'unique');
      assert.ok(result.first.cells.every(value => value === 'white'));
    }
    if (preset.id === 'magicSquare') {
      const cells = result.first.cells;
      assert.equal(new Set(cells).size, 16);
      assert.equal([0,5,10,15].reduce((sum, index) => sum + cells[index], 0), 34);
      assert.equal([3,6,9,12].reduce((sum, index) => sum + cells[index], 0), 34);
    }
    if (preset.id === 'drop') {
      assert.equal(result.first.cells.filter(value => value === 'black').length, 9);
      const lengths = new Set([2,3,4,5,7]);
      assert.equal(result.dictionaryEntries, words.filter(word => lengths.has(word.length) && /^[a-z]+$/.test(word.toLowerCase())).length, 'retain every source word of a relevant length');
    }
  }
});

test('real SudokuSolver finds known 4×4 Latin-square solution with numeric sum, bounds and if/linear rules', async () => {
  const rules = '每一格是从1到4的数字\n每一行互不相同\n每一列互不相同\n第[1,2,5,6]格互不相同\n第[3,4,7,8]格互不相同\n第[9,10,13,14]格互不相同\n第[11,12,15,16]格互不相同\n第1格是1\n第2格是2\n第3格是3\n第[1,2]格的和是3\n第1格大于等于1\n第1格小于等于1\n如果第1格是1,那么第4格是4\n第[1,2]格的系数是[2,3],线性组合是8\n第5格是3\n第6格是4\n第9格是2\n第10格是1\n第13格是4';
  const result = await solveConstraints({rows: 4, columns: 4, rules: rules + '\n第11格是4\n第7格是1'});
  assert.equal(result.status, 'unique');
  assert.deepEqual(result.first.cells, [1,2,3,4,3,4,1,2,2,1,4,3,4,3,2,1]);
  assert.equal(result.complete, true);
});

test('all-different does not invent hidden singles when domain union is larger than the region', async () => {
  const result = await solveConstraints({rows: 1, columns: 2, maxSolutions: 10, rules: '第1格是1或2\n第2格是2或3\n每一行互不相同'});
  assert.equal(result.complete, true);
  assert.equal(result.solutionCount, 3);
  assert.deepEqual(result.solutions.map(x => x.cells.join('')).sort(), ['12','13','23']);
});

test('sum backtracking, zero-valued sum, and counts including zero are real constraints', async () => {
  const sum = await solveConstraints({rows: 1, columns: 2, maxSolutions: 10, rules: '每一格是从0到2的数字\n每一行的和是2'});
  assert.deepEqual(sum.solutions.map(x => x.cells.join('')).sort(), ['02','11','20']);
  const zero = await solveConstraints({rows: 1, columns: 2, rules: '每一格是从0到2的数字\n每一行的和是0'});
  assert.deepEqual(zero.first.cells, [0,0]);
  const count = await solveConstraints({rows: 2, columns: 3, rules: '每一格是黑格或白格\n第1格是黑格\n每一列的黑格的数量是1\n第2行的黑格的数量是2\n第2格是白格\n第3格是白格'});
  assert.equal(count.status, 'unique');
  assert.deepEqual(count.first.cells, ['black','white','white','white','black','black']);
  const none = await solveConstraints({rows: 1, columns: 2, rules: '每一格是黑格或白格\n第1格是黑格\n每一行的黑格的数量是0'});
  assert.equal(none.status, 'none');
  const conditional = await solveConstraints({rows: 1, columns: 2, rules: '每一格是1或2\n第1格是1\n如果第1格是1,那么第2格是3'});
  assert.equal(conditional.status, 'none', 'a conditional must intersect domains, never resurrect a forbidden value');
});

test('nonogram uses real bars DP on a rectangular grid, including zero-length clues', async () => {
  const rules = '每一格是黑格或白格\n第1行从左到右连续的黑格长度是[3]\n第2行从左到右连续的黑格长度是[0]\n第1列从上到下连续的黑格长度是[1]\n第2列从上到下连续的黑格长度是[1]\n第3列从上到下连续的黑格长度是[1]';
  const result = await solveConstraints({rows: 2, columns: 3, rules});
  assert.equal(result.status, 'unique');
  assert.deepEqual(result.first.cells, ['black','black','black','white','white','white']);
});

test('Drop Quote word and repeated-letter permutation constraints use supplied dictionary rather than a placeholder', async () => {
  const rules = '每一格是从a到z的字母\n第4格强制是黑格\n第1行除了黑格外的格子是[a,a,b]的一个排列\n第[1,2,3]格按顺序组成单词';
  const result = await solveConstraints({rows: 1, columns: 4, maxSolutions: 10, rules}, {words: ['aba','aab','baa','abb','cat']});
  assert.equal(result.complete, true);
  assert.deepEqual(result.solutions.map(x => x.cells.slice(0,3).join('')).sort(), ['aab','aba','baa']);
  const numeric = await solveConstraints({rows: 1, columns: 2, maxSolutions: 10, rules: '每一格是从0到2的数字\n每一行除了黑格外的格子是[1,2]的一个排列'});
  assert.deepEqual(numeric.solutions.map(x => x.cells.join('')).sort(), ['12','21']);
  await assert.rejects(() => solveConstraints({rows: 1, columns: 4, rules}), /本地英文词库/);
});

test('loop and Hashi keep original rule cores and validate complete, connected outputs', async () => {
  const loop = await solveConstraints({rows: 2, columns: 2, rules: '每一格空白的格子可以形成1条回路'});
  assert.equal(loop.status, 'unique');
  assert.deepEqual(loop.first.cells, ['RB','BL','UR','UL']);
  const bridges = await solveConstraints({rows: 1, columns: 3, rules: '第1格连出的线段总数为1,上下左右线段数量不超过[2,2,2,2]\n第3格连出的线段总数为1,上下左右线段数量不超过[2,2,2,2]\n线段之间互不相交'});
  assert.equal(bridges.status, 'unique');
  assert.equal(bridges.first.cells[0].hashi.r, 1);
  assert.equal(bridges.first.cells[2].hashi.l, 1);
});

test('limited enumeration reports multiple/partial honestly; explicit cancellation rejects', async () => {
  const result = await solveConstraints({rows: 1, columns: 3, maxSolutions: 2, rules: '每一格是从1到3的数字'});
  assert.equal(result.status, 'multiple'); assert.equal(result.complete, false); assert.equal(result.solutionCount, 2);
  assert.ok(result.warnings.some(x => /不能当作全局/.test(x)));
  const abort = new AbortController(); abort.abort();
  await assert.rejects(() => solveConstraints({rows: 1, columns: 1, rules: '每一格是1'}, {signal: abort.signal}), {name: 'AbortError'});
});

test('real dictionary SubstitutionSolver preserves locks, spacing, case and contractions', async () => {
  const result = await solveDictionarySubstitution({text: 'XYY ZYX!', locked: {X:'A'}, maxSolutions: 20}, {words: ['abb','bba','baa','aba','cdd','bdc','cba']});
  assert.ok(result.candidateCount > 0);
  for (const candidate of result.candidates) { assert.equal(candidate.mapping.x, 'a'); assert.equal(candidate.text[0], 'A'); assert.match(candidate.text, /^[A-Z]{3} [A-Z]{3}!$/); }
  const contraction = await solveDictionarySubstitution({text: "abc'd", maxSolutions: 20}, {words: ["don't", "can't", "did'd", "abb'b"]});
  assert.ok(contraction.candidateCount > 0);
  assert.ok(contraction.candidates.every(candidate => candidate.text.includes("'")));
  await assert.rejects(() => solveDictionarySubstitution({text: 'ab', locked: {A:'T', B:'T'}}, {words: ['to']}), /一一对应/);
  await assert.rejects(() => solveDictionarySubstitution({text: 'abc'}), /本地英文词库/);
});

test('generated adapters retain original source hashes and contain no DOM/remote-service wrapper', async () => {
  const base = new URL('../public/vendor/expansion/cipher-constraints/', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('UPSTREAM.json', base), 'utf8'));
  assert.equal(manifest.commit, '29fa4ee1c60873484688c250b37c87d93f54cae4');
  for (const [file, expected] of Object.entries(manifest.generated_sha256)) {
    const bytes = await readFile(new URL(file, base));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, file);
    assert.doesNotMatch(bytes.toString('utf8'), /\bwindow\.|\bdocument\.|\bconfirm\(|\$\(/u, file);
  }
});
