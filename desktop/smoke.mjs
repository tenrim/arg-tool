import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { _electron } from '../test-tools/node_modules/playwright/index.mjs';
import { chooseNativeTask } from '../scripts/browser-navigation.mjs';

const [executable, testProfile, mode] = process.argv.slice(2);
const blocked = process.argv.includes('--blocked');
if (!executable || !testProfile)
  throw Error('用法：node desktop/smoke.mjs 程序.exe 测试配置目录 [dev]');
const origin = 'https://mist-toolbox.invalid';
const results = [];
const profile = resolve(testProfile);
const fixture = new URL('../tests/fixtures/hunt-video.mp4', import.meta.url);
const title = '离线验收笔记 ' + new Date().toISOString();
function passed(message) {
  results.push(message);
  console.error('通过：' + message);
}

async function verifyInstalledAssets() {
  const source = fileURLToPath(new URL('../dist/', import.meta.url));
  const installed = join(dirname(resolve(executable)), 'resources', 'site');
  async function paths(root) {
    return (await readdir(root, { recursive: true, withFileTypes: true }))
      .filter((file) => file.isFile())
      .map((file) => relative(root, join(file.parentPath, file.name)))
      .sort();
  }
  const expected = await paths(source);
  assert.deepEqual(await paths(installed), expected);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      while (cursor < expected.length) {
        const path = expected[cursor++];
        const [shipped, generated] = await Promise.all([
          readFile(join(installed, path)),
          readFile(join(source, path)),
        ]);
        assert(shipped.equals(generated), '安装后的资源字节不同：' + path);
      }
    }),
  );
  return expected.length;
}

function launch() {
  return _electron.launch({
    executablePath: resolve(executable),
    args: [
      ...(mode === 'dev' ? [import.meta.dirname] : []),
      ...(blocked ? ['--no-proxy-server'] : []),
      '--user-data-dir=' + profile,
    ],
    timeout: 35000,
  });
}

let app = await launch();
try {
  const page = await app.firstWindow();
  const errors = [];
  const external = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    const requested = URL.parse(request.url());
    if (['http:', 'https:'].includes(requested?.protocol) && requested.origin !== origin) {
      external.push(requested.origin);
    }
  });
  await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
  assert.equal(await page.evaluate(() => location.origin), origin);
  assert.equal(await page.evaluate(() => typeof require), 'undefined');
  assert.equal(await app.evaluate(({ app }) => app.getPath('userData')), profile);
  assert.match(await page.locator('.main-footer').innerText(), /Windows 测试版/);
  if (mode !== 'dev') await page.screenshot({ path: join(dirname(profile), 'desktop-home.png') });
  passed('首启、导航、离线版标识和渲染进程隔离');

  async function route(hash, id = hash) {
    await page.evaluate((value) => (location.hash = value), hash);
    await page.locator('#panel-' + id).waitFor({ state: 'visible' });
  }

  const chef = await page.evaluate(async () => {
    const { CyberChefClient } = await import('/cyberchef-client.js');
    const client = new CyberChefClient();
    try {
      const input = new Uint8Array([0, 255, 128, 127]).buffer;
      const base64 = await client.bake(input, [{ op: 'To Base64', args: ['A-Za-z0-9+/='] }]);
      const encoded = new TextDecoder().decode(base64.bytes);
      const raw = await client.bake(encoded, [
        { op: 'From Base64', args: ['A-Za-z0-9+/=', true, false] },
      ]);
      return {
        encoded,
        decoded: [...raw.bytes],
      };
    } finally {
      client.close();
    }
  });
  assert.equal(chef.encoded, 'AP+Afw==');
  assert.deepEqual(chef.decoded, [0, 255, 128, 127]);
  passed('CyberChef 二进制 Base64 往返');

  await route('qalculate');
  await page.locator('#qalculate-expression').fill('10 km to m');
  await page.locator('#qalculate-run').click();
  await page.waitForFunction(
    () =>
      !document.querySelector('#qalculate-download').disabled ||
      document.querySelector('#qalculate-status').dataset.state === 'error',
  );
  assert(
    await page.locator('#qalculate-download').isEnabled(),
    await page.locator('#qalculate-status').textContent(),
  );
  assert.match(await page.locator('#qalculate-output').innerText(), /10\s?000/);
  passed('Qalculate WASM 单位计算');

  await route('code');
  assert.equal(await page.locator('#code-language option:enabled').count(), 27);
  for (const [language, code, input, output] of [
    ['python', 'print(6 * 7)', '', /42/],
    ['javascript', 'console.log(6 * 7)', '', /42/],
    ['lua', 'print(6 * 7)', '', /42/],
    ['sql', 'SELECT 6 * 7 AS answer;', '', /42/],
    ['brainfuck', ',+.', '@', /^A$/],
    ['ook', 'Ook. Ook! Ook. Ook. Ook! Ook.', '@', /^A$/],
    ['befunge', '&1+.@', '41', /^42 $/],
    ['deadfish', 'iiiso', '', /^9$/],
    [
      'whitespace',
      '   ' + (65).toString(2).replace(/1/g, '\t').replace(/0/g, ' ') + '\n\t\n  \n\n\n',
      '',
      /^A$/,
    ],
    ['malbolge', '(&%$_""7<5492V0TA3P', '', /^zb3$/],
  ]) {
    await chooseNativeTask(
      page,
      language === 'brainfuck' ? 'native:code' : 'native:code-' + language,
    );
    assert.equal(await page.locator('#code-language').inputValue(), language);
    await page.locator('#code-source').fill(code);
    if (language !== 'sql') await page.locator('#code-input').fill(input);
    await page.locator('#code-run').click();
    await page.waitForFunction(
      () =>
        /运行完成|执行失败|加载或执行失败|超时|已停止/.test(
          document.querySelector('#code-status').textContent,
        ),
      null,
      { timeout: 65000 },
    );
    assert.match(
      await page.locator('#code-status').textContent(),
      /运行完成/,
      language + ': ' + (await page.locator('#code-error').textContent()),
    );
    assert.match(await page.locator('#code-output').inputValue(), output, language);
  }
  passed('10 种本地代码语言及 17 种服务器语言入口');

  await route('timezones');
  await page.locator('#timezones-search').fill('Asia/Shanghai');
  await page.locator('#timezones-list [data-timezone="Asia/Shanghai"]').waitFor();
  const resources = await page.evaluate(async () => {
    const catalogue = await fetch('/vendor/cyberchef/catalogue.json');
    const words = await (await fetch('/vendor/expansion/hunt/english-standard.json')).text();
    const hash = await crypto.subtle.digest('SHA-256', new Uint8Array([0, 255, 128]));
    return {
      catalogue: catalogue.ok && !!(await catalogue.json()).operations,
      english: words.length > 100000 && words.includes('hello'),
      hash: [...new Uint8Array(hash)],
    };
  });
  assert(resources.catalogue && resources.english, JSON.stringify(resources));
  assert.deepEqual(resources.hash, [
    ...createHash('sha256')
      .update(Buffer.from([0, 255, 128]))
      .digest(),
  ]);
  passed('固定时区、完整英文词库、操作目录和 Web Crypto');

  const standalone = await page.evaluate(async () => {
    function runWorker(path, input) {
      const worker = new Worker(path);
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => complete(Error('Worker 计算超时')), 30000);
        function complete(error, output) {
          clearTimeout(timeout);
          worker.terminate();
          if (error) reject(error);
          else resolve(output);
        }
        worker.onerror = (event) => complete(Error(event.message));
        worker.onmessage = ({ data }) => {
          if (data.error || data.kind === 'error') complete(Error(data.error || data.message));
          else if ('result' in data) complete(null, data.result);
        };
        worker.postMessage({ ...input, resourceBase: location.origin + '/' });
      });
    }
    const packet = 'Mist Toolbox Windows';
    const image = await runWorker('/fun-tools/worker.js', { kind: 'qr', packet });
    const { AlpertronClient } = await import('/expansion/alpertron-client.js');
    const factoring = new AlpertronClient();
    try {
      const [qr, molecule, factor] = await Promise.all([
        runWorker('/fun-tools/worker.js', { kind: 'scan', image }),
        runWorker('/science/worker.js', {
          kind: 'chemistry',
          params: { mode: 'molecule', input: 'CCO' },
        }),
        factoring.run({ expression: '65' }),
      ]);
      return { qr, molecule: JSON.stringify(molecule).includes('svg'), factor: factor.text };
    } finally {
      factoring.cancel();
    }
  });
  assert.equal(standalone.qr, 'Mist Toolbox Windows');
  assert(standalone.molecule);
  assert.match(standalone.factor, /13/);
  passed('二维码生成和识别、RDKit 分子结构、Alpertron 因数分解');

  await chooseNativeTask(page, 'native:image-planes');
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 4;
    canvas.getContext('2d').fillRect(0, 0, 4, 4);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.locator('#image-input').setInputFiles({
    name: 'synthetic.png',
    mimeType: 'image/png',
    buffer: Buffer.from(png, 'base64'),
  });
  await page.locator('#image-overview').click();
  await page.waitForFunction(() => document.querySelector('#image-gallery').children.length === 40);
  assert.match(await page.locator('#image-status').innerText(), /已生成 40 个图层/);
  passed('读取 PNG 并运行本地 AperiSolve 位平面预览');

  await chooseNativeTask(page, 'native:video-audio');
  await page.locator('#video-file').setInputFiles({
    name: 'hunt-video.mp4',
    mimeType: 'video/mp4',
    buffer: await readFile(fixture),
  });
  await page.locator('#video-run').click();
  await page.waitForFunction(
    () => /完成|失败/.test(document.querySelector('#video-status').textContent),
    null,
    {
      timeout: 65000,
    },
  );
  assert.match(await page.locator('#video-status').innerText(), /完成/);
  const audio = page.locator('#video-results audio').first();
  await audio.waitFor({ state: 'attached' });
  const wav = await audio.evaluate(async ({ src }) => {
    const bytes = await (await fetch(src)).arrayBuffer();
    return { size: bytes.byteLength, header: new TextDecoder().decode(bytes.slice(0, 12)) };
  });
  assert(wav.size > 44);
  assert.match(wav.header, /^RIFF[\s\S]{4}WAVE$/);
  passed('选取视频并由本地 FFmpeg WASM 提取真实 WAV');

  await route('oeis');
  assert.equal(await page.locator('#panel-oeis form').count(), 1);
  await route('forensics-exiftool');
  assert.equal(await page.locator('#forensics-exiftool-run').count(), 1);
  if (blocked) {
    const proxy = await app.evaluate(({ session }) =>
      session.fromPartition('mist-toolbox-services').resolveProxy('https://www.tool.mistarg.cn/'),
    );
    assert.equal(proxy, 'DIRECT', '断网测试不能通过回环代理外联');
    const offlineService = await page.evaluate(async () => {
      const result = await fetch('/api/query/oeis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'A000045', start: 0 }),
      });
      return { status: result.status, ...(await result.json()) };
    });
    assert.equal(offlineService.status, 503);
    assert.match(offlineService.message, /检查网络/);
    passed('系统出站阻断下在线接口给出可重试的网络错误');
  }

  await route('notebook');
  await page.locator('#notebook-new').click();
  await page.locator('#notebook-title:enabled').fill(title);
  await page.waitForFunction(
    (value) => document.querySelector('#notebook-list').textContent.includes(value),
    title,
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  await app.close();
  app = await launch();
  const reopened = await app.firstWindow();
  await reopened.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
  await reopened.evaluate(() => (location.hash = 'notebook'));
  await reopened.getByText(title, { exact: true }).first().waitFor();
  passed('笔记新建、保存与关闭软件后重开恢复');
  const installedFiles = mode === 'dev' ? undefined : await verifyInstalledAssets();
  console.log(
    JSON.stringify(
      { results, installedFiles, rendererErrors: errors, externalRequests: external },
      null,
      2,
    ),
  );
} finally {
  await app.close();
}
