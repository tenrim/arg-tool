// Focused real-engine coverage for the parameters added to upstream analyzers.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { runContainer } from '../services/forensics/process.mjs';
import { zipSync } from '../public/vendor/round2/fflate.js';
const { fixtures } = JSON.parse(await fs.readFile('outputs/forensics-build/fixtures.json', 'utf8'));
const special = Buffer.from('MIST_FULL_EXPORT');
const embedded = Buffer.concat([
  Buffer.from(fixtures.png.data, 'base64'),
  zipSync({ 'proof.tmp': special, 'proof.lock': special }),
]);
const cases = [
  ...['s', 'S', 'l', 'b', 'L', 'B'].map((encoding) => {
    const width = ['l', 'b'].includes(encoding) ? 2 : ['L', 'B'].includes(encoding) ? 4 : 1;
    const data = Buffer.alloc(4 + width * 11);
    [...'MISTPROOF42'].forEach((char, i) => {
      data[4 + width * i + (['b', 'B'].includes(encoding) ? width - 1 : 0)] = char.charCodeAt(0);
    });
    return {
      engine: 'strings',
      fixture: { filename: 'encoded.bin', data: data.toString('base64') },
      options: { encoding, minimum: 8, radix: 'x' },
      expect: /4 MISTPROOF42/,
    };
  }),
  { engine: 'exiftool', fixture: fixtures.png, options: { mode: 'json' }, expect: /ImageWidth/ },
  {
    engine: 'binwalk',
    fixture: fixtures.embedded,
    options: { mode: 'scan', depth: 8 },
    expect: /Zip archive/,
  },
  ...['box', 'meta', 'url'].map((mode) => ({
    engine: 'pdfinfo',
    fixture: fixtures.pdf,
    options: { mode },
    expect: mode === 'box' ? /MediaBox/ : null,
  })),
  {
    engine: 'binwalk',
    fixture: { filename: 'embedded.bin', data: embedded.toString('base64') },
    options: { mode: 'extract', depth: 2 },
    special: true,
  },
];
const report = [];
for (const { engine, fixture, options, expect, special: checkSpecial } of cases) {
  const result = await runContainer({ engine, password: '', ...fixture, options });
  assert.equal(result.complete, true, result.error);
  assert.equal(result.result.status, 'ok', JSON.stringify(result.result));
  const stdout = Buffer.from(
    result.files.find((f) => f.name === 'logs/01-stdout.bin').data,
    'base64',
  ).toString('utf8');
  if (expect) assert.match(stdout, expect);
  if (engine === 'exiftool') {
    assert.ok(Array.isArray(JSON.parse(stdout)));
    assert.match(stdout, /"ImageWidth":\s*64/);
  }
  if (engine === 'binwalk' && options.mode === 'scan')
    assert.ok(!result.files.some((f) => f.name.endsWith('.zip')));
  if (checkSpecial)
    for (const suffix of ['proof.tmp', 'proof.lock']) {
      assert.ok(
        result.files.some(
          (f) => f.name.endsWith('/' + suffix) && Buffer.from(f.data, 'base64').equals(special),
        ),
        suffix + ' must remain downloadable',
      );
    }
  report.push({ engine, options, passed: true });
  console.log('PASS', engine, options);
}
await fs.writeFile('outputs/forensics-build/options-report.json', JSON.stringify(report, null, 2));
