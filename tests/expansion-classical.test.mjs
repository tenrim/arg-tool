import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CLASSICAL_CIPHERS, CLASSICAL_INPUT_LIMIT, runClassical, playfair, adfgx, adfgvx, trifid, autokey, beaufort, columnar, nihilist} from '../public/expansion/classical-core.js';

test('Playfair reproduces ACA and Wheatstone examples; filler is explicit rather than silently removed', () => {
  // ACA: https://www.cryptogram.org/downloads/aca.info/ciphers/Playfair.pdf
  const options = {alphabet: ['LOGAR', 'ITHMB', 'CDEFK', 'NPQSU', 'VWXYZ'].join('')};
  assert.equal(playfair('COMEQUICKLYWENEEDHELP', options), 'DLHFSNCNCRZXCQQGFEEQON');
  assert.equal(playfair('DLHFSNCNCRZXCQQGFEEQON', {...options, direction: 'decrypt'}), 'COMEQUICKLYWENEXEDHELP');
  assert.equal(playfair('HIDETHEGOLDINTHETREESTUMP', {squareKey: 'PLAYFAIR EXAMPLE'}), 'BMODZBXDNABEKUDMUIXMMOUVIF');
  const repeated = runClassical('playfair', 'XX', {});
  assert.equal(repeated.details.preparedInput, 'XQXQ');
  assert.equal(repeated.details.insertedFillers, 2);
  assert.equal(playfair(repeated.text, {direction: 'decrypt'}), 'XQXQ');
  assert.ok(runClassical('playfair', 'JIG', {}).warnings.some(x => /合并到 I/.test(x)));
  assert.throws(() => playfair('ABC', {direction: 'decrypt'}), /偶数/);
  assert.throws(() => playfair('AA', {direction: 'decrypt'}), /相同字符/);
  assert.throws(() => playfair('A', {filler: 'X', alternateFiller: 'X'}), /必须不同/);
});

test('ADFGVX agrees with the original pycipher manual and handles ragged columns and digits', () => {
  // https://pycipher.readthedocs.io/en/master/#example-usage
  const options = {alphabet: 'PH0QG64MEA1YL2NOFDXKR3CVS5ZW7BJ9UTI8', key: 'GERMAN', unknown: 'remove'};
  assert.equal(adfgvx('Hello world!', options), 'FVFDAGXAFFFFGFAGADFG');
  assert.equal(adfgvx('FVFDAGXAFFFFGFAGADFG', {...options, direction: 'decrypt'}), 'HELLOWORLD');
  for (const key of ['LETTER', 'A', 'LONGERTHANTEXT']) {
    const cipher = adfgvx('TEST42', {key});
    assert.match(cipher, /^[ADFGVX]+$/);
    assert.equal(adfgvx(cipher, {key, direction: 'decrypt'}), 'TEST42');
  }
  assert.equal(adfgx(adfgx('JIGSAW', {key: 'BALLOON'}), {key: 'BALLOON', direction: 'decrypt'}), 'IIGSAW');
  assert.throws(() => adfgx('AAD', {key: 'KEY', direction: 'decrypt'}), /偶数/);
  assert.throws(() => adfgx('AB', {key: 'KEY', direction: 'decrypt'}), /字母表/);
});

test('Trifid reproduces the ACA 27-symbol keyed-alphabet vector and short last period', () => {
  // https://www.cryptogram.org/downloads/aca.info/ciphers/Trifid.pdf
  const options = {squareKey: 'EXTRAORDINARY', period: 10};
  const plain = 'TRIFIDSAREFRACTIONATEDCIPHERS', cipher = 'EYMXVUCRYYYYEAYVYOVVXITDPATHE';
  assert.equal(trifid(plain, options), cipher);
  assert.equal(trifid(cipher, {...options, direction: 'decrypt'}), plain);
  assert.equal(trifid('ABC#XYZ', {period: 1}), 'ABC#XYZ');
  for (const period of [2, 5, 11, 999]) assert.equal(trifid(trifid('ABC#XYZ', {period}), {period, direction: 'decrypt'}), 'ABC#XYZ');
  assert.throws(() => trifid('ABC', {period: 0}), /周期/);
  assert.throws(() => trifid('ABC', {period: 2.5}), /周期/);
  assert.throws(() => trifid('ABC', {alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'}), /27/);
});

test('Autokey uses recovered plaintext for feedback and implements both feedback conventions and three tableaux', () => {
  // ACA: https://www.cryptogram.org/downloads/aca.info/ciphers/Autokey.pdf
  const plain = 'THEAUTOKEYCANBEUSEDWITHVIGENEREVARIANTBEAUFORTORPORTA';
  const cipher = 'IYMMYKHRIYWTBLISUEQXMNZZLCMGLMMBEEMRROBVIUSHSXOLUCIMO';
  assert.equal(autokey(plain, {key: 'PRIMER'}), cipher);
  assert.equal(autokey(cipher, {key: 'PRIMER', direction: 'decrypt'}), plain);
  assert.equal(autokey('ATTACKATDAWN', {key: 'QUEENLY'}), 'QNXEPVYTWTWP');
  for (const stream of ['plaintext', 'ciphertext']) for (const variant of ['vigenere', 'beaufort', 'variant']) {
    const options = {key: 'KEY', stream, variant}, message = 'THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG';
    assert.equal(autokey(autokey(message, options), {...options, direction: 'decrypt'}), message);
  }
  assert.equal(autokey('att ack!', {key: 'QUEENLY', unknown: 'preserve', preserveCase: true}), 'qnx epv!');
  assert.equal(autokey('你好A🙂B', {alphabet: 'AB', key: 'B', unknown: 'preserve'}), '你好B🙂B');
  assert.throws(() => autokey('ABC', {key: 'A1'}), /字母表/);
  assert.throws(() => autokey('ABC', {key: ' '}), /至少需要/);
});

test('standard and variant Beaufort use distinct equations, including ACA published vectors', () => {
  assert.equal(beaufort('CEQUALSKMINUSP', {key: 'RECIPROCAL'}), 'PAMOPGWSODEKKT');
  assert.equal(beaufort('PAMOPGWSODEKKT', {key: 'RECIPROCAL', direction: 'decrypt'}), 'CEQUALSKMINUSP');
  // https://www.cryptogram.org/downloads/aca.info/ciphers/Variant.pdf
  const options = {key: 'APPLE', variant: 'variant'};
  assert.equal(beaufort('CEQUALSPMINUSK', options), 'CPBJWLDABENFDZ');
  assert.equal(beaufort('CPBJWLDABENFDZ', {...options, direction: 'decrypt'}), 'CEQUALSPMINUSK');
  assert.notEqual(beaufort('ABCDE', {key: 'APPLE'}), beaufort('ABCDE', options));
});

test('column transposition reproduces both ACA complete and incomplete vectors; repeated-key ranking and Unicode are reversible', () => {
  // ACA: IncompleteColTransposition.pdf / CompleteColTransposition.pdf
  const options = {key: '3 1 2', keyType: 'numeric'};
  assert.equal(columnar('UNFILLEDBLOCK', options), 'NLDOFLBCUIELK');
  assert.equal(columnar('NLDOFLBCUIELK', {...options, direction: 'decrypt'}), 'UNFILLEDBLOCK');
  assert.equal(columnar('FILLEDBLOCK', {...options, padding: 'fill'}), 'IELKLDOXFLBC');
  assert.equal(columnar('IELKLDOXFLBC', {...options, padding: 'fill', direction: 'decrypt'}), 'FILLEDBLOCKX');
  assert.equal(columnar('WEAREDISCOVEREDFLEEATONCE', {key: 'ZEBRAS'}), 'EVLNACDTESEAROFODEECWIREE');
  for (const key of ['BALLOON', 'LETTER', 'A', 'VERYLONGKEY']) for (const input of ['', 'X', 'AB', 'X🙂 你\n好!']) {
    assert.equal(columnar(columnar(input, {key}), {key, direction: 'decrypt'}), input);
  }
  assert.throws(() => columnar('X', {key: '1 1', keyType: 'numeric'}), /不能重复/);
  assert.throws(() => columnar('X', {key: '1 3', keyType: 'numeric'}), /完整排列/);
  assert.throws(() => columnar('ABC', {...options, key: '2 1', padding: 'fill', direction: 'decrypt'}), /整数倍/);
});

test('Nihilist supports ACA modulo-100 and full-sum forms and validates reconstructed square coordinates', () => {
  // https://www.cryptogram.org/downloads/aca.info/ciphers/NihilistSubstitution.pdf
  const options = {squareKey: 'SIMPLE', key: 'EASY'};
  const cipher = '65 55 32 75 43 65 26 08 44 34 54 79';
  assert.equal(nihilist('THEEARLYBIRD', options), cipher);
  assert.equal(nihilist(cipher, {...options, direction: 'decrypt'}), 'THEEARLYBIRD');
  assert.equal(nihilist('THEEARLYBIRD', {...options, modulo100: 'no'}), cipher.replace('08', '108'));
  assert.equal(nihilist(cipher.replace('08', '108'), {...options, modulo100: false, direction: 'decrypt'}), 'THEEARLYBIRD');
  assert.equal(nihilist('ZZ', {key: 'Z'}), '10 10');
  assert.equal(nihilist('10,10', {key: 'Z', direction: 'decrypt'}), 'ZZ');
  assert.throws(() => nihilist('6555', {...options, direction: 'decrypt'}), /逐项分隔/);
  assert.throws(() => nihilist('99', {key: 'A', direction: 'decrypt'}), /不是合法/);
  assert.throws(() => nihilist('11', {key: 'A', direction: 'decrypt'}), /范围/);
});

test('strict unknown handling and resource limits never silently turn invalid input into a successful cipher', () => {
  assert.throws(() => playfair('HELLO🙂'), /字母表之外/);
  assert.equal(runClassical('playfair', 'HELLO🙂', {unknown: 'remove'}).details.removedUnknown, 1);
  assert.throws(() => playfair('ABC!', {unknown: 'preserve'}), /无法原位保留/);
  assert.throws(() => beaufort('ABC', {key: 'KEY', alphabet: 'AABCDEFGHIJKLMNOPQRSTUVWXY'}), /重复/);
  assert.throws(() => runClassical('missing', ''), /未知/);
  assert.throws(() => runClassical('beaufort', 5, {key: 'KEY'}), /必须是文字/);
  assert.throws(() => runClassical('beaufort', 'A'.repeat(CLASSICAL_INPUT_LIMIT + 1), {key: 'KEY'}), /分批/);
  assert.throws(() => runClassical('beaufort', 'ABC', {key: 'KEY', direction: 'reverse'}), /明确/);
  assert.throws(() => runClassical('beaufort', 'ABC', null), /参数/);
  assert.equal(CLASSICAL_CIPHERS.length, 8);
  assert.ok(CLASSICAL_CIPHERS.every(cipher => Object.isFrozen(cipher) && cipher.directions.length === 2 && cipher.fields.every(field => Object.isFrozen(field))));
});
