import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';
import { _electron } from '../test-tools/node_modules/playwright/index.mjs';
import { SERVER_LANGUAGES } from '../public/coderunner/server-catalog.js';

const [executable, profile, mode] = process.argv.slice(2);
const quick = process.argv.includes('--quick');
if (!executable || !profile) throw Error('用法：node desktop/live.mjs 程序.exe 测试配置目录 [dev]');
const app = await _electron.launch({
  executablePath: resolve(executable),
  args: [...(mode === 'dev' ? [import.meta.dirname] : []), '--user-data-dir=' + resolve(profile)],
  timeout: 35000,
});
const report = { results: [], pages: [], rendererErrors: [], localAssetErrors: [] };
try {
  const page = await app.firstWindow();
  page.on('pageerror', (error) => report.rendererErrors.push(error.message));
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (
      url.hostname === 'mist-toolbox.invalid' &&
      !url.pathname.startsWith('/api/') &&
      response.status() >= 400
    ) {
      report.localAssetErrors.push({ path: url.pathname, status: response.status() });
    }
  });
  await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');

  async function check(name, run) {
    try {
      const detail = await run();
      report.results.push({ name, ok: true, detail });
      console.error('通过：' + name);
    } catch (error) {
      report.results.push({ name, ok: false, error: error.message });
      console.error('待核实：' + name + ' · ' + error.message);
      if (page.isClosed()) throw error;
    }
  }
  function post(path, body) {
    return page.evaluate(
      async ({ path, body }) => {
        const response = await fetch(path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        return {
          status: response.status,
          type: response.headers.get('Content-Type'),
          text: await response.text(),
        };
      },
      { path, body },
    );
  }
  const queries = [
    ['oeis', { query: 'A000045', start: 0 }],
    ['zdic', { mode: 'search', query: '雾' }],
    ['cnkgraph', { mode: 'detail', id: 26460 }],
    ['cod', { mode: 'detail', id: '1011097' }],
    ['pubchem', { mode: 'detail', cid: 702 }],
    ['placenames', { mode: 'divisions', code: '11', year: 2025, maxLevel: 1 }],
    ['pokewiki', { mode: 'search', query: '皮卡丘' }],
  ];
  for (const [id, input] of queries) {
    if (quick && !['oeis', 'cod'].includes(id)) continue;
    await check('在线资料 ' + id, async () => {
      const response = await post('/api/query/' + id, input);
      assert.equal(response.status, 200, response.text.slice(0, 200));
      const data = JSON.parse(response.text);
      assert.equal(data.provider, id);
      assert(data.records.length > 0, '查询未返回任何记录');
      return { records: data.records.length };
    });
  }

  await check('Desmos 图形计算器', async () => {
    await page.evaluate(() => (location.hash = 'function-plot'));
    const frame = page.frameLocator('#desmos-frame');
    const calculator = frame.locator('.dcg-expressionlist').first();
    try {
      await calculator.waitFor({ timeout: 28000 });
    } catch {
      await page.getByRole('button', { name: '重新加载 Desmos' }).click();
      await calculator.waitFor({ timeout: 35000 });
    }
    const html = frame.locator('html');
    assert.equal(await html.getAttribute('lang'), 'zh-CN');
    return '原站计算器控件已加载';
  });

  await check('Chromium 跨域限制', async () => {
    const blocked = await page.evaluate(() =>
      fetch('https://www.tool.mistarg.cn/site-version.js').then(
        () => false,
        () => true,
      ),
    );
    assert(blocked, '没有阻止缺少跨来源许可的请求');
    return '跨域请求按 Chromium 原生规则拒绝';
  });
  for (const [input, operation] of [
    [
      'example.com',
      { op: 'DNS over HTTPS', args: ['https://dns.google/resolve', 'A', false, false] },
    ],
    [
      '',
      {
        op: 'HTTP request',
        args: [
          'GET',
          'https://dns.google/resolve?name=example.com&type=A',
          '',
          'Cross-Origin Resource Sharing',
          false,
        ],
      },
    ],
  ]) {
    await check('CyberChef ' + operation.op, async () => {
      const data = await page.evaluate(
        async ({ input, operation }) => {
          const { CyberChefClient } = await import('/cyberchef-client.js');
          const client = new CyberChefClient();
          try {
            const result = await client.bake(input, [operation]);
            return JSON.parse(new TextDecoder().decode(result.bytes));
          } finally {
            client.close();
          }
        },
        { input, operation },
      );
      assert.equal(data.Status, 0);
      assert(data.Answer.length > 0);
      return { records: data.Answer.length };
    });
  }

  await check('服务器文件分析与综合分析流', async () => {
    const data = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 8;
      canvas.getContext('2d').fillRect(0, 0, 8, 8);
      return canvas.toDataURL('image/png').split(',')[1];
    });
    const fixture = { filename: 'synthetic.png', data, password: '' };
    const exif = await post('/api/forensics/run', { ...fixture, engine: 'exiftool', options: {} });
    assert.equal(exif.status, 200, exif.text.slice(0, 200));
    const metadata = JSON.parse(exif.text);
    assert.equal(metadata.result?.status, 'ok');
    const survey = await post('/api/forensics/run', {
      ...fixture,
      engine: 'image-survey',
      options: { depth: 'standard' },
    });
    assert.equal(survey.status, 200, survey.text.slice(0, 200));
    assert.match(survey.type, /application\/x-ndjson/);
    const events = survey.text
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    assert.equal(events[0].type, 'plan');
    assert.equal(events.at(-1).type, 'end');
    assert(events.at(-1).finished > 0);
    return { imageResults: events.at(-1).finished, successful: events.at(-1).successful };
  });

  for (const [language, entry] of Object.entries(SERVER_LANGUAGES)) {
    if (quick && language !== 'java') continue;
    await check('服务器语言 ' + entry.name, async () => {
      let response = await post('/api/code/run', {
        language,
        code: entry.example,
        input: 'MistTest\n',
      });
      if (response.status === 429) {
        await pause(2500);
        response = await post('/api/code/run', {
          language,
          code: entry.example,
          input: 'MistTest\n',
        });
      }
      assert.equal(response.status, 200, response.text.slice(0, 200));
      const result = JSON.parse(response.text);
      assert.equal(result.status, 'ok', JSON.stringify(result).slice(0, 250));
      assert.match(result.run.stdout, /MistTest/);
      return '真实标准输出含测试输入';
    });
    await pause(1100);
  }

  await check('反馈入口与空报告拦截', async () => {
    await page.locator('#report-problem').click();
    await page.locator('#report-send').waitFor();
    await page.keyboard.press('Escape');
    const invalid = await post('/api/feedback', {});
    assert([400, 422].includes(invalid.status), invalid.text.slice(0, 200));
    return '空报告被拒绝，未发送邮件';
  });

  const routes = quick
    ? []
    : await page.evaluate(async () => {
        const { analysisAccess } = await import('/capabilities/analysis-access.js');
        analysisAccess.submit('拨开迷雾');
        const { loadRegistry } = await import('/capabilities/registry.js');
        const { capabilityRoute } = await import('/capabilities/routes.js');
        const registry = await loadRegistry();
        const byPanel = new Map();
        for (const entry of registry.entries) {
          for (const item of [entry, ...(entry.variants || [])]) {
            const panel = item.open?.panel;
            if (!panel || byPanel.has(panel)) continue;
            byPanel.set(panel, {
              panel,
              title: item.title || entry.title,
              route: capabilityRoute({
                ...entry,
                preferredVariant: item === entry ? undefined : item.id,
              }),
            });
          }
        }
        return [...byPanel.values()];
      });
  for (const target of routes) {
    const { panel, route } = target;
    try {
      await page.evaluate((value) => (location.hash = value), route);
      await page.locator('#panel-' + panel).waitFor({ timeout: 8500 });
      report.pages.push({ ...target, ok: true });
    } catch (error) {
      report.pages.push({ ...target, ok: false, error: error.message.split('\n')[0] });
    }
    if (report.pages.length % 25 === 0)
      console.error('已检查工作区 ' + report.pages.length + '/' + routes.length);
  }
  if (
    report.results.some((result) => !result.ok) ||
    report.pages.some((result) => !result.ok) ||
    report.localAssetErrors.length ||
    report.rendererErrors.length
  )
    process.exitCode = 1;
} finally {
  console.log(JSON.stringify(report, null, 2));
  await app.close();
}
