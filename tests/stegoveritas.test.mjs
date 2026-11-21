import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { validateJob } from '../services/forensics/index.mjs';
import { FORENSICS_TASKS, FORENSICS_OPTIONS } from '../public/forensics/catalog.js';
import { forensicSources } from '../public/forensics/sources.js';
import { createRegistry, searchEntries } from '../public/capabilities/registry.js';
import { capabilityRoute } from '../public/capabilities/routes.js';
const base = {
  engine: 'stegoveritas',
  filename: 'image.png',
  data: 'AQ==',
  password: '',
  options: {},
};

test('搜索具体 StegoVeritas 操作携带真实模式，不回到默认图像增强', async () => {
  const catalogue = JSON.parse(
    await readFile(new URL('../public/vendor/cyberchef/catalogue.json', import.meta.url), 'utf8'),
  );
  const registry = createRegistry(catalogue);
  for (const [mode, label] of FORENSICS_OPTIONS.stegoveritas[0].choices) {
    const result = searchEntries(registry, label).find(
      (e) => e.id === 'native:forensics-stegoveritas',
    );
    assert.ok(result, label);
    assert.equal(result.preferredDirection, mode, label);
    assert.ok(capabilityRoute(result).includes('dir=' + mode), label);
  }
});

test('StegoVeritas 固定发行包完整字节不变，真实来源独立于 AperiSolve', async () => {
  const root = new URL('../upstream/stegoveritas/', import.meta.url);
  const source = JSON.parse(await readFile(new URL('SOURCE.json', root), 'utf8'));
  assert.equal(source.version, '1.11');
  assert.equal(source.sha256, 'a5836a0350b116342bef13edec020806c1c9ea33c95cad2ac52db6c7b59c9ac5');
  for (const file of source.files)
    assert.equal(
      createHash('sha256')
        .update(await readFile(new URL(file.path, root)))
        .digest('hex'),
      file.sha256,
      file.path,
    );
  const task = FORENSICS_TASKS.find((t) => t.engine === 'stegoveritas');
  assert.ok(forensicSources(task).includes('https://github.com/bannsec/stegoVeritas'));
  assert.ok(!forensicSources(task).includes('https://github.com/Zeecka/AperiSolve'));
});

test('新操作参数与二进制载荷严格白名单，文件合计限额，旧工具不接受附件', () => {
  for (const [mode] of FORENSICS_OPTIONS.stegoveritas[0].choices)
    assert.equal(validateJob({ ...base, options: { mode } }).options.mode, mode);
  const attachment = { filename: 'payload.bin', data: '/wA=' };
  assert.deepEqual(
    validateJob({ ...base, options: { mode: 'hide', text: '迷雾' }, attachment }).attachment,
    attachment,
  );
  assert.ok(validateJob({ ...base, engine: 'steghide', attachment }));
  for (const change of [
    { options: { mode: 'shell' } },
    { options: { red: '1;ls' } },
    { options: { text: 'x'.repeat(8193) } },
    { options: { path: '/etc/passwd' } },
    { options: { mode: 'extract' }, attachment },
    { engine: 'binwalk', attachment },
    { options: { mode: 'hide' }, attachment: { filename: 'x', data: 'AB==' } },
    {
      options: { mode: 'hide' },
      attachment: { filename: 'x', data: Buffer.alloc(20 * 1024 * 1024).toString('base64') },
    },
  ])
    assert.throws(() => validateJob({ ...base, ...change }));
});
