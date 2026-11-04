// Real engine acceptance. Requires the isolated image and generated synthetic fixtures.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { runContainer } from '../services/forensics/process.mjs';
const { fixtures, payload } = JSON.parse(
  await fs.readFile('outputs/forensics-build/fixtures.json', 'utf8'),
);
const expected = Buffer.from(payload, 'base64');
const cases = [
  ['file', 'png'],
  ['exiftool', 'png'],
  ['identify', 'png'],
  ['strings', 'text'],
  ['pngcheck', 'png'],
  ['pcrt', 'pcrt'],
  ['binwalk', 'embedded'],
  ['foremost', 'embedded'],
  ['zsteg', 'zsteg'],
  ['zsteg', 'zsteg', { mode: 'extract', extract: 'b1,rgb,lsb,xy' }],
  ['steghide', 'steghide'],
  ['outguess', 'outguess'],
  ['jsteg', 'jsteg'],
  ['jpseek', 'jpseek'],
  ['openstego', 'openstego-AES128'],
  ['openstego', 'openstego-AES256'],
  ['pdfid', 'pdf'],
  ['pdfinfo', 'pdf'],
  ['spectrogram', 'spectrogram'],
  ['decomposer', 'png'],
  ['color_remapping', 'png'],
];
const selected = new Set(process.argv.slice(2));
const previous = selected.size
  ? JSON.parse(
      await fs.readFile('outputs/forensics-build/engine-report.json', 'utf8').catch(() => '[]'),
    )
  : [];
const report = previous.filter((r) => !selected.has(r.engine));
for (const [engine, fixture, options = {}] of cases) {
  if (selected.size && !selected.has(engine)) continue;
  const start = Date.now();
  try {
    const result = await runContainer({ engine, password: '', ...fixtures[fixture], options });
    assert.equal(result.complete, true, result.error);
    assert.equal(result.result.status, 'ok', JSON.stringify(result.result));
    const outputs = result.files
      .filter((f) => !f.name.startsWith('logs/'))
      .map((f) => ({ ...f, bytes: Buffer.from(f.data, 'base64') }));
    const text = JSON.stringify(result.result);
    if (['steghide', 'outguess', 'jsteg', 'jpseek', 'openstego'].includes(engine))
      assert.ok(
        outputs.some((f) => f.bytes.equals(expected)),
        'binary payload mismatch',
      );
    if (engine === 'zsteg' && options.mode === 'extract')
      assert.ok(
        outputs.some(
          (f) =>
            f.name === 'zsteg-extracted.bin' &&
            f.bytes
              .subarray(0, Buffer.byteLength('MIST_ZSTEG_PAYLOAD\0'))
              .equals(Buffer.from('MIST_ZSTEG_PAYLOAD\0')),
        ),
        'zsteg extraction mismatch',
      );
    if (engine === 'pcrt')
      assert.ok(
        outputs.some(
          (f) =>
            f.name.endsWith('.png') &&
            f.bytes.readUInt32BE(16) === 64 &&
            f.bytes.readUInt32BE(20) === 32,
        ),
        'PNG dimensions not recovered',
      );
    if (engine === 'binwalk')
      assert.ok(
        outputs.some((f) => f.name.endsWith('proof.txt') && f.bytes.equals(expected)),
        'ZIP payload not carved',
      );
    if (engine === 'foremost')
      assert.ok(
        outputs.some(
          (f) =>
            f.name.endsWith('.png') && f.bytes.equals(Buffer.from(fixtures.png.data, 'base64')),
        ),
        'PNG payload not carved',
      );
    if (engine === 'file') assert.match(text, /PNG/);
    if (engine === 'strings') assert.match(text, /mist-forensics-proof/);
    if (engine === 'pdfinfo') assert.match(text, /Pages/);
    if (engine === 'pdfid') assert.match(text, /PDFiD/);
    if (engine === 'spectrogram')
      assert.equal(outputs.filter((f) => f.name.endsWith('.png')).length, 3);
    if (engine === 'decomposer' || engine === 'color_remapping')
      assert.ok(outputs.some((f) => f.name.endsWith('.png')));
    report.push({
      engine,
      fixture,
      options,
      passed: true,
      files: outputs.map((f) => ({ name: f.name, size: f.bytes.length })),
      ms: Date.now() - start,
    });
    console.log('PASS', engine, fixture);
  } catch (error) {
    report.push({ engine, fixture, options, passed: false, error: error.message });
    console.error('FAIL', engine, fixture, error.message);
  }
  await fs.writeFile('outputs/forensics-build/engine-report.json', JSON.stringify(report, null, 2));
}
if (report.some((r) => !r.passed)) process.exitCode = 1;
