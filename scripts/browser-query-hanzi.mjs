import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseNativeTask, go } from './browser-navigation.mjs';

const names = [
  'explain',
  'words',
  'draw',
  'invalidation',
  'draw-invalidation',
  'network',
  'draw-readiness',
  'timeout',
];
const argument = process.argv.slice(2);
let selected = names;
if (argument.length) {
  if (argument.length !== 1 || !argument[0].startsWith('--case='))
    throw Error('用法：node scripts/browser-query-hanzi.mjs [--case=explain,draw]');
  selected = [...new Set(argument[0].slice('--case='.length).split(','))];
  if (selected.some((name) => !names.includes(name))) throw Error('未知的汉字查询用例。');
}
const site = await startBrowserTestSite();
const proof = { selected, checks: [], failures: [], observed: [] };
const explanation = await readFile(
  new URL('../public/vendor/hanzi-full/data/explanation/永.json', import.meta.url),
  'utf8',
);
const drawing = await readFile(
  new URL('../public/vendor/hanzi-full/data/draw/永.json', import.meta.url),
  'utf8',
);
assert(!Object.hasOwn(JSON.parse(explanation), '永永永永永永'));
let browser;

async function run(page, root, expectedState = 'success') {
  await root.getByRole('button', { name: '查看汉字', exact: true }).click();
  await page.waitForFunction(() => {
    const status = document.querySelector('#hanzi-full > [data-ui="status"]');
    return (
      status?.textContent &&
      !status.textContent.startsWith('正在') &&
      ['success', 'error', 'info'].includes(status.dataset.state)
    );
  });
  const status = root.locator(':scope > [data-ui="status"]');
  assert.equal(await status.getAttribute('data-state'), expectedState, await status.textContent());
  return status.textContent();
}
async function snapshot(root) {
  return root.evaluate((node) => ({
    status: node.querySelector(':scope > [data-ui="status"]').textContent,
    state: node.querySelector(':scope > [data-ui="status"]').dataset.state,
    output: node.querySelector('#hanzi-full-output').value,
    paths: node.querySelectorAll('.hanzi-native-drawing path').length,
  }));
}
async function empty(root, { status = '' } = {}) {
  assert.equal(await root.locator('#hanzi-full-output').inputValue(), '');
  assert.equal(await root.locator('.hanzi-native-drawing path').count(), 0);
  assert.equal(await root.locator(':scope > [data-ui="status"]').textContent(), status);
}

const cases = {
  async explain(page, context, root) {
    await root.locator('#hanzi-full-mode').selectOption('explain');
    await root.locator('#hanzi-full-input').fill('永远');
    const pattern = site.base + '/vendor/hanzi-full/data/explanation/**';
    let blocked = 0;
    const fail = (route) => {
      blocked++;
      return route.fulfill({ status: 503, body: 'synthetic unavailable' });
    };
    await context.route(pattern, fail);
    assert.match(await run(page, root, 'error'), /字词释义资料载入失败.*503/);
    assert(blocked > 0);
    assert.equal(await root.locator('#hanzi-full-output').inputValue(), '');
    proof.observed.push({ case: 'explain503', ...(await snapshot(root)) });
    await context.unroute(pattern, fail);
    await run(page, root);
    assert.match(JSON.parse(await root.locator('#hanzi-full-output').inputValue()).result, /长远/);
    await root.locator('#hanzi-full-input').fill('永永永永永永');
    await empty(root);
    assert.match(await run(page, root, 'info'), /未收录/);
    assert.equal(JSON.parse(await root.locator('#hanzi-full-output').inputValue()).result, '');
    await root.locator('#hanzi-full-input').fill('永远');
    const missingFile = (route) => route.fulfill({ status: 404, body: 'synthetic missing file' });
    await context.route(pattern, missingFile);
    assert.match(await run(page, root, 'error'), /资料载入失败.*404/);
    assert.doesNotMatch(await root.locator(':scope > [data-ui="status"]').textContent(), /未收录/);
    assert.equal(await root.locator('#hanzi-full-output').inputValue(), '');
    await context.unroute(pattern, missingFile);
    await run(page, root);
    assert.match(JSON.parse(await root.locator('#hanzi-full-output').inputValue()).result, /永久/);
    await root.locator('#hanzi-full-input').fill('永久');
    await empty(root);
  },
  async words(page, context, root) {
    let requests = 0;
    await context.route(site.base + '/vendor/hanzi-full/data/words/**', (route) => {
      requests++;
      return route.fulfill({ status: 503, body: 'unused resource' });
    });
    await root.locator('#hanzi-full-mode').selectOption('words');
    await root.locator('#hanzi-full-input').fill('永');
    await run(page, root);
    const words = JSON.parse(await root.locator('#hanzi-full-output').inputValue()).result;
    assert(words.includes('永远') && words.includes('永久'));
    assert.equal(requests, 0, 'the fixed cnchar-all embeds the complete original words dictionary');
    await root.locator('#hanzi-full-input').fill('永永永永永永');
    await empty(root);
    await run(page, root, 'info');
    assert.deepEqual(JSON.parse(await root.locator('#hanzi-full-output').inputValue()).result, []);
  },
  async draw(page, context, root) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await root.locator('#hanzi-full-mode').selectOption('draw');
    await root.locator('#hanzi-full-input').fill('永');
    const pattern = site.base + '/vendor/hanzi-full/data/draw/**';
    let blocked = 0;
    const fail = (route) => {
      blocked++;
      return route.fulfill({ status: 503, body: 'synthetic unavailable' });
    };
    await context.route(pattern, fail);
    assert.match(await run(page, root, 'error'), /笔顺资料载入失败.*503/);
    assert(blocked > 0);
    assert.equal(await root.locator('#hanzi-full-output').inputValue(), '');
    assert.equal(await root.locator('.hanzi-native-drawing svg').count(), 0);
    proof.observed.push({ case: 'draw503', ...(await snapshot(root)) });
    await context.unroute(pattern, fail);
    for (const mode of ['normal', 'animation', 'stroke']) {
      await root.locator('#hanzi-draw-mode').selectOption(mode);
      await run(page, root);
      assert(
        (await root.locator('.hanzi-native-drawing path').count()) > 0,
        mode + ' actual strokes',
      );
      assert.equal(JSON.parse(await root.locator('#hanzi-full-output').inputValue()).mode, mode);
      proof.observed.push({ case: 'draw ' + mode, ...(await snapshot(root)) });
    }
    await root.locator('#hanzi-full-input').fill('永久');
    await empty(root);
  },
  async invalidation(page, context, root) {
    await root.locator('#hanzi-full-mode').selectOption('words');
    await run(page, root);
    const pattern = site.base + '/vendor/hanzi-full/data/explanation/**';
    for (const action of ['input', 'mode', 'stop', 'leave']) {
      await chooseNativeTask(page, 'native:hanzi');
      await root.locator('#hanzi-full-mode').selectOption('explain');
      await root.locator('#hanzi-full-input').fill('永远');
      let release, requested;
      const gate = new Promise((resolve) => {
        release = resolve;
      });
      const started = new Promise((resolve) => {
        requested = resolve;
      });
      const delay = async (route) => {
        requested();
        await gate;
        try {
          await route.fulfill({ status: 200, body: explanation, contentType: 'application/json' });
        } catch {
          // The real AbortSignal may already have cancelled the request.
        }
      };
      await context.route(pattern, delay);
      await root.getByRole('button', { name: '查看汉字', exact: true }).click();
      await started;
      if (action === 'input') await root.locator('#hanzi-full-input').fill('永久');
      if (action === 'mode')
        await root.locator('#hanzi-full-mode').evaluate((node) => {
          node.value = 'words';
          node.dispatchEvent(new Event('change', { bubbles: true }));
        });
      if (action === 'stop') await root.getByRole('button', { name: '停止', exact: true }).click();
      if (action === 'leave') await go(page, 'home');
      release();
      await page.waitForTimeout(80);
      await empty(root, { status: action === 'stop' ? '已停止，输入保留。' : '' });
      await context.unroute(pattern, delay);
      proof.observed.push({ case: 'late explanation after ' + action, ...(await snapshot(root)) });
    }
  },
  async 'draw-invalidation'(page, context, root) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const action of ['stop', 'leave']) {
      await chooseNativeTask(page, 'native:hanzi');
      await root.locator('#hanzi-full-mode').selectOption('draw');
      await root.locator('#hanzi-draw-mode').selectOption('stroke');
      await root.locator('#hanzi-full-input').fill('永');
      let requests = 0,
        release,
        requested;
      const gate = new Promise((resolve) => {
        release = resolve;
      });
      const started = new Promise((resolve) => {
        requested = resolve;
      });
      const pattern = site.base + '/vendor/hanzi-full/data/draw/**';
      const delay = async (route) => {
        if (++requests > 1) {
          requested();
          await gate;
        }
        try {
          await route.fulfill({ status: 200, body: drawing, contentType: 'application/json' });
        } catch {
          // Cancellation of the owned preflight request is also valid.
        }
      };
      await context.route(pattern, delay);
      await root.getByRole('button', { name: '查看汉字', exact: true }).click();
      await started;
      assert.equal(await root.locator('#hanzi-full-output').inputValue(), '');
      if (action === 'stop') await root.getByRole('button', { name: '停止', exact: true }).click();
      else await go(page, 'home');
      release();
      await page.waitForTimeout(80);
      await empty(root, { status: action === 'stop' ? '已停止，输入保留。' : '' });
      assert.equal(await root.locator('.hanzi-native-drawing svg').count(), 0);
      await context.unroute(pattern, delay);
      proof.observed.push({
        case: 'late stroke rendering after ' + action,
        ...(await snapshot(root)),
      });
    }
  },
  async network(page, context, root) {
    await root.locator('#hanzi-full-mode').selectOption('explain');
    await root.locator('#hanzi-full-input').fill('永远');
    const pattern = site.base + '/vendor/hanzi-full/data/explanation/**';
    const fail = (route) => route.abort('internetdisconnected');
    await context.route(pattern, fail);
    assert.match(await run(page, root, 'error'), /字词释义资料载入失败，请检查连接后重试/);
    assert.equal(await root.locator('#hanzi-full-output').inputValue(), '');
    proof.observed.push({ case: 'network disconnected', ...(await snapshot(root)) });
    await context.unroute(pattern, fail);
    await run(page, root);
    assert.match(JSON.parse(await root.locator('#hanzi-full-output').inputValue()).result, /永久/);
  },
  async 'draw-readiness'(page, context, root) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await root.locator('#hanzi-full-mode').selectOption('draw');
    await root.locator('#hanzi-full-input').fill('永远');
    const second = await readFile(
      new URL('../public/vendor/hanzi-full/data/draw/远.json', import.meta.url),
      'utf8',
    );
    const firstStrokes = JSON.parse(drawing).strokes.length;
    const secondStrokes = JSON.parse(second).strokes.length;
    for (const mode of ['normal', 'animation']) {
      await root.locator('#hanzi-draw-mode').selectOption(mode);
      await run(page, root);
      assert.equal(await root.locator('.hanzi-native-drawing > svg').count(), 2);
      assert(
        (await root.locator('.hanzi-native-drawing path').count()) >= firstStrokes + secondStrokes,
      );
    }
    await root.locator('#hanzi-draw-mode').selectOption('stroke');
    let count = 0,
      release,
      requested;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    const started = new Promise((resolve) => {
      requested = resolve;
    });
    const pattern = site.base + '/vendor/hanzi-full/data/draw/**';
    const delay = async (route) => {
      const char = decodeURIComponent(
        new URL(route.request().url()).pathname.split('/').pop().slice(0, -5),
      );
      if (char === '远' && ++count === 2) {
        requested();
        await gate;
      }
      await route.fulfill({
        status: 200,
        body: char === '永' ? drawing : second,
        contentType: 'application/json',
      });
    };
    await context.route(pattern, delay);
    await root.getByRole('button', { name: '查看汉字', exact: true }).click();
    await started;
    await page.waitForFunction(
      (strokes) =>
        document.querySelectorAll('#hanzi-full .hanzi-native-drawing > div:first-child > svg')
          .length === strokes,
      firstStrokes,
    );
    assert.equal(
      await root.locator('#hanzi-full-output').inputValue(),
      '',
      'second character has not rendered yet',
    );
    assert.equal(
      await root.locator(':scope > [data-ui="status"]').getAttribute('data-state'),
      'info',
    );
    release();
    await page.waitForFunction(
      () => document.querySelector('#hanzi-full > [data-ui="status"]').dataset.state === 'success',
    );
    assert.equal(await root.locator('.hanzi-native-drawing > div').count(), 2);
    assert.equal(
      await root.locator('.hanzi-native-drawing > div:first-child > svg').count(),
      firstStrokes,
    );
    assert.equal(
      await root.locator('.hanzi-native-drawing > div:last-child > svg').count(),
      secondStrokes,
    );
    assert.equal(
      JSON.parse(await root.locator('#hanzi-full-output').inputValue()).characters,
      '永远',
    );
    proof.observed.push({ case: 'two-character stroke waits for all', ...(await snapshot(root)) });
    await context.unroute(pattern, delay);
  },
  async timeout(page, context, root) {
    await root.locator('#hanzi-full-mode').selectOption('explain');
    await root.locator('#hanzi-full-input').fill('永远');
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    const pattern = site.base + '/vendor/hanzi-full/data/explanation/**';
    const delayed = async (route) => {
      await gate;
      try {
        await route.fulfill({ status: 200, body: explanation, contentType: 'application/json' });
      } catch {}
    };
    await context.route(pattern, delayed);
    assert.match(await run(page, root, 'error'), /载入超时/);
    assert.equal(await root.locator('#hanzi-full-output').inputValue(), '');
    proof.observed.push({ case: 'actual 30 second timeout', ...(await snapshot(root)) });
    release();
    await context.unroute(pattern, delayed);
    await run(page, root);
    assert.match(JSON.parse(await root.locator('#hanzi-full-output').inputValue()).result, /永久/);
  },
};

try {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  for (const name of selected) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: 'reduce',
    });
    try {
      const errors = [];
      const page = await context.newPage();
      page.on('pageerror', (error) => errors.push(error.message));
      page.setDefaultTimeout(35000);
      await page.goto(site.base + '/?layout=chronicle#home');
      await chooseNativeTask(page, 'native:hanzi');
      await cases[name](page, context, page.locator('#hanzi-full'));
      assert.deepEqual(errors, []);
      proof.checks.push(name);
      console.log('PASS', name);
    } catch (error) {
      proof.failures.push({ name, message: error.message, stack: error.stack });
      console.error('FAIL', name, error.message);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser?.close();
  await site.close();
}
await mkdir(new URL('../outputs/query-audit-20261110/science-it/', import.meta.url), {
  recursive: true,
});
await writeFile(
  new URL('../outputs/query-audit-20261110/science-it/hanzi-fixed.json', import.meta.url),
  JSON.stringify(proof, null, 2) + '\n',
);
if (argument.length)
  await writeFile(
    new URL(
      '../outputs/query-audit-20261110/science-it/hanzi-fixed-' + selected.join('-') + '.json',
      import.meta.url,
    ),
    JSON.stringify(proof, null, 2) + '\n',
  );
if (proof.failures.length) process.exitCode = 1;
