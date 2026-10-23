import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {ALPERTRON_CALCULATORS} from '../public/expansion/alpertron-catalog.js';
import {encodeAlpertronRequest, alpertronText, alpertronError} from '../public/expansion/alpertron-protocol.js';

async function engine(calculator) {
  let exports; const messages = [];
  const read = pointer => {const memory = new Uint8Array(exports.memory.buffer); let end = pointer; while (memory[end]) end++; return new TextDecoder().decode(memory.subarray(pointer, end));};
  const result = await WebAssembly.instantiate(await readFile(new URL(`../public/vendor/expansion/alpertron/${calculator}.wasm`, import.meta.url)), {env: {
    databack: pointer => messages.push(read(pointer)), tenths: () => Math.floor(Date.now() / 100), startSkipTest() {}, endSkipTest() {}, getCunn() {throw Error('Network must never be used');},
  }});
  exports = result.instance.exports;
  const run = parameter => {messages.length = 0; const memory = new Uint8Array(exports.memory.buffer), bytes = new TextEncoder().encode(parameter); memory.set(bytes, exports.getInputStringPtr()); memory[exports.getInputStringPtr()+bytes.length] = 0; exports.doWork(); return messages.map(message => ({code: message[0], text: alpertronText(message.slice(1)), html: message.slice(1)}));};
  return {run: options => run(encodeAlpertronRequest({calculator, ...options}).parameter), command: command => run(command)};
}
const final = messages => messages.findLast(message => ['2', '6', 'D', 'E', 'S', 'T'].includes(message.code));

test('archived official WASM bytes match pins while only integer factorization is enabled', async () => {
  const path = new URL('../public/vendor/expansion/alpertron/UPSTREAM.json', import.meta.url);
  const manifest = JSON.parse(await readFile(path, 'utf8'));
  assert.equal(manifest.calculators.length, 10);
  assert.deepEqual(ALPERTRON_CALCULATORS.map(item => item.id), ['integer']);
  assert.ok(manifest.calculators.some(item => item.id === 'integer'));
  for (const item of manifest.files) {
    const bytes = await readFile(new URL(item.path, path));
    assert.equal(bytes.length, item.bytes, item.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256, item.path);
  }
  assert.ok(manifest.files.some(item => item.path === 'source.tar.gz'));
  assert.match(await readFile(new URL('LICENSE.txt', path), 'utf8'), /GNU GENERAL PUBLIC LICENSE/);
  assert.match(await readFile(new URL('NOTICE.txt', path), 'utf8'), /Sun Microsystems/);
});

test('real official ECM and SIQS factor two independent semiprimes and retain full arithmetic reports', async () => {
  const ecm = await engine('integer');
  const first = final(ecm.run({expression: '982451659877161571'}));
  assert.match(first.text, /982451653.*1000000007.*ECM/s);
  assert.match(first.text, /Euler's totient: 982451657894709912/);
  assert.match(first.text, /Number of divisors: 4/);
  const divisors = final(ecm.command('D'));
  assert.match(divisors.text, /982451653/); assert.match(divisors.text, /982451659877161571/);
  const siqs = final(ecm.run({expression: '155138089136278053654321569148671', algorithm: 'siqs'}));
  assert.match(siqs.text, /67280421310721.*2305843009213693951.*SIQS/s);
  assert.match(siqs.text, /congruences|polynomials sieved/);
  const report = final(ecm.run({expression: '65'}));
  assert.match(report.text, /65 = 5.*13/);
});

test('integer expression functions, genuine prime test, multi-line/loop batch and parser diagnostics', async () => {
  const ecm = await engine('integer');
  assert.match(final(ecm.run({action: 'evaluate', expression: 'ModPow(3,4,7)\nGCD(84,30)\nF(20)\n20!'})).text, /4[\s\S]*6[\s\S]*6765[\s\S]*2432902008176640000/);
  assert.match(final(ecm.run({action: 'prime', expression: '170141183460469231731687303715884105727'})).text, /is prime/);
  assert.match(final(ecm.run({action: 'evaluate', expression: 'x=1;x=x+1;x<=5;x^2'})).text, /1[\s\S]*4[\s\S]*9[\s\S]*16[\s\S]*25/);
  const paused = final(ecm.run({action: 'evaluate', expression: 'x=1;x=x+1;x<=1002;x'}));
  assert.equal(paused.code, '6'); assert.match(paused.text, /1000/);
  assert.match(final(ecm.command('C')).text, /1001[\s\S]*1002/);
  for (const expression of ['1/0', '3+(', 'not_a_function(2)']) assert.ok(alpertronError(final(ecm.run({expression})).text), expression);
});

test('retired advanced mathematics has no request protocol despite preserved upstream archives', () => {
  for (const calculator of ['gaussian','quadratic','discreteLog','quadraticMod','squares','cubes','twoSquaresPower','continuedFraction','polynomial'])
    assert.throws(() => encodeAlpertronRequest({calculator,expression:'1234'}), /不支持的数论计算器/, calculator);
});

test('text serialization retains nested fractions, radicals, parentheses, exponents and escaped user text', () => {
  assert.equal(alpertronText('<f-f><f-n>1</f-n><f-d><r-2><r-a>2</r-a></r-2></f-d></f-f>'), '(1)/(√(2))');
  assert.equal(alpertronText('<r-t><span class="befrad">3</span><span class="radicand3"><o-p><p-p>x+1</p-p></o-p></span></r-t>'), 'root(3;(x+1))');
  assert.equal(alpertronText('<p>&lt;img src=x&gt;</p><script>alert(1)</script><button>Danger</button>'), '<img src=x>');
  assert.throws(() => encodeAlpertronRequest({expression:'2\0,evil'}), /控制字符/);
  assert.throws(() => encodeAlpertronRequest({expression:'2\x01evil'}), /控制字符/);
  assert.throws(() => encodeAlpertronRequest({expression:'2',algorithm:'remote'}), /算法/);
  assert.throws(() => encodeAlpertronRequest({expression:'1'.repeat(900001)}), /限制/);
});
