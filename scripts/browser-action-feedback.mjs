import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseOperation } from './browser-navigation.mjs';

const names = ['base-normal', 'base-reduce', 'fixture-normal', 'fixture-reduce'];
const argument = process.argv.slice(2);
let selected = names;
if (argument.length) {
  const value = argument[0]?.startsWith('--case=')
    ? argument[0].slice(7)
    : argument[0] === '--case'
      ? argument[1]
      : null;
  if (!value || argument.length !== (argument[0] === '--case' ? 2 : 1))
    throw Error(
      '用法：node scripts/browser-action-feedback.mjs [--case=base-normal,fixture-reduce]',
    );
  selected = [...new Set(value.split(','))];
  if (selected.some((name) => !names.includes(name))) throw Error('未知用例：' + value);
}
const output = new URL('../outputs/ui-feedback-20261109/', import.meta.url);
await mkdir(output, { recursive: true });
const checks = [],
  failures = [],
  evidence = [];
const site = await startBrowserTestSite();
let browser;

async function paintSnapshot(button) {
  return button.evaluate(async (node) => {
    const { hoverOwner } = await import('/ui/animate-ui.js');
    const rect = (element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    };
    const box = rect(node);
    const style = getComputedStyle(node);
    const owner = hoverOwner(node);
    const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    const surfaces = [...document.querySelectorAll('.ui-hover-group')].flatMap((owner) =>
      [...(owner.shadowRoot?.querySelectorAll('[data-slot=trigger-highlight]') || [])].map((p) => ({
        owner: owner.id || owner.className,
        ownerDisplay: getComputedStyle(owner).display,
        ownerBox: rect(owner),
        box: rect(p),
        color: getComputedStyle(p).backgroundColor,
        opacity: Number(getComputedStyle(p).opacity),
        leaving: p.hasAttribute('data-leaving'),
      })),
    );
    return {
      id: node.id,
      box,
      hit: hit?.closest('button') === node,
      background: style.backgroundColor,
      inlineBackground: node.style.getPropertyValue('background-color'),
      inlinePriority: node.style.getPropertyPriority('background-color'),
      focused: document.activeElement === node,
      focusVisible: node.matches(':focus-visible'),
      owner: owner
        ? {
            id: owner.id || owner.className,
            display: getComputedStyle(owner).display,
            box: rect(owner),
          }
        : null,
      parent: { id: node.parentElement.id, display: getComputedStyle(node.parentElement).display },
      surfaces,
    };
  });
}
function matchingPaint(snapshot) {
  return snapshot.surfaces.filter(
    ({ box, color, opacity, leaving }) =>
      !leaving &&
      opacity > 0.5 &&
      color !== 'transparent' &&
      !/rgba\([^)]*,\s*0\)$/.test(color) &&
      ['x', 'y', 'width', 'height'].every((key) => Math.abs(box[key] - snapshot.box[key]) < 2),
  );
}
function painted(snapshot) {
  return matchingPaint(snapshot).length > 0;
}
async function feedback(page, button, label, kind = 'hover') {
  await button.scrollIntoViewIfNeeded();
  await page.mouse.move(1, 1);
  await button.evaluate((node) => node.blur());
  const before = await button.boundingBox();
  if (kind === 'focus') {
    // A keyboard interaction selects the browser's real focus-visible modality.
    await page.keyboard.press('Tab');
    await button.focus();
  } else await button.hover();
  let snapshot;
  const deadline = Date.now() + 2200;
  do {
    await page.waitForTimeout(70);
    snapshot = await paintSnapshot(button);
    if (painted(snapshot)) break;
  } while (Date.now() < deadline);
  evidence.push({ label, kind, ...snapshot });
  assert(
    painted(snapshot),
    label + ': no matching upstream highlight surface: ' + JSON.stringify(snapshot),
  );
  assert.notEqual(
    snapshot.owner?.display,
    'contents',
    label + ': paint owner has a real layout box',
  );
  assert.equal(matchingPaint(snapshot).length, 1, label + ': exactly one active paint owner');
  assert(snapshot.hit, label + ': original button still owns its center hit area');
  for (const key of ['x', 'y', 'width', 'height'])
    assert(Math.abs(before[key] - snapshot.box[key]) < 0.75, label + ': feedback moved ' + key);
  if (kind === 'focus')
    assert(snapshot.focused && snapshot.focusVisible, label + ': keyboard focus remains visible');
}

async function base(page) {
  const entry = await chooseOperation(page, 'To Base64');
  const task = page.locator('#panel-' + entry.panel + ' .ct-tool');
  await task.locator('.ct-input').fill('Hello');
  await task.locator('.ct-run').click();
  await page.waitForFunction(
    () => document.querySelector('#ct-encoding .ct-output')?.value === 'SGVsbG8=',
  );
  const buttons = [
    task.locator('.ct-copy'),
    task.locator('.ct-download'),
    task.locator('[data-notebook-result]'),
    task.locator('[data-graphics-result]'),
  ];
  const problems = [];
  for (const button of buttons) {
    assert.equal(await button.isEnabled(), true, 'actual calculation enables result actions');
    for (const kind of ['hover', 'focus']) {
      try {
        await feedback(page, button, (await button.textContent()).trim(), kind);
      } catch (error) {
        problems.push(error.message);
      }
    }
  }
  assert.deepEqual(problems, []);
}

async function fixture(page) {
  await page.evaluate(async () => {
    const ui = await import('/ui/index.js');
    const { resultRecording } = await import('/result-recording.js');
    const copy = ui.Button({ id: 'feedback-copy', text: '复制', variant: 'quiet' });
    const download = ui.Button({ id: 'feedback-download', text: '下载文本', variant: 'quiet' });
    const outer = ui.Toolbar({ id: 'feedback-outer', children: [copy, download] });
    const anchor = ui.Button({ id: 'feedback-anchor', text: '结果锚点' });
    const card = ui.Card({
      id: 'feedback-fixture',
      attrs: {
        style:
          'position:fixed;left:310px;top:180px;z-index:3000;width:850px;background:var(--bg);padding:20px',
      },
      children: [anchor],
    });
    document.body.append(card);
    const recording = resultRecording({ id: 'feedback-record', anchor, panel: card });
    recording.toolbar.id = 'feedback-inner';
    recording.publish({ text: '真实租约内容' });
    const custom = ui.Button({
      id: 'feedback-custom',
      text: '黑键',
      variant: 'piano-key',
      appearance: 'custom',
      attrs: { 'data-key-tone': 'black' },
    });
    card.append(custom);
    window.feedbackFixture = { outer, card, recording, buttons: [...recording.buttons], custom };
  });
  const note = page.locator('#feedback-record-notebook');
  await feedback(page, note, 'standalone notebook');
  assert.equal((await paintSnapshot(note)).owner.id, 'feedback-inner');
  await page.evaluate(() => {
    const { outer, card, recording } = window.feedbackFixture;
    outer.append(recording.toolbar);
    card.prepend(outer);
  });
  assert.equal(
    await page.locator('#feedback-inner').evaluate((node) => getComputedStyle(node).display),
    'contents',
  );
  assert.equal((await paintSnapshot(note)).owner.id, 'feedback-outer');
  const problems = [];
  for (const id of [
    'feedback-copy',
    'feedback-download',
    'feedback-record-notebook',
    'feedback-record-graphics',
  ]) {
    try {
      await feedback(page, page.locator('#' + id), 'nested ' + id);
    } catch (error) {
      problems.push(error.message);
    }
  }
  await page.evaluate(() => window.feedbackFixture.recording.clear());
  assert.equal(await note.isDisabled(), true);
  await page.mouse.move(1, 1);
  await note.evaluate((node) => node.blur());
  await page.waitForTimeout(400);
  const disabled = await paintSnapshot(note);
  evidence.push({ label: 'disabled notebook', ...disabled });
  assert.equal(painted(disabled), false, 'disabled actions have no interactive highlight');
  await page.evaluate(() => window.feedbackFixture.recording.publish({ text: '更新后的有效结果' }));
  assert.equal(await note.isEnabled(), true);
  try {
    await feedback(page, note, 're-enabled notebook', 'focus');
  } catch (error) {
    problems.push(error.message);
  }
  assert.equal(
    await page.evaluate(() =>
      window.feedbackFixture.buttons.every(
        (node, index) =>
          node === window.feedbackFixture.recording.buttons[index] && node.isConnected,
      ),
    ),
    true,
  );
  const custom = page.locator('#feedback-custom');
  const customBefore = await custom.evaluate((node) => getComputedStyle(node).backgroundColor);
  await custom.hover();
  const customAfter = await paintSnapshot(custom);
  evidence.push({ label: 'custom piano hover', ...customAfter });
  assert.notEqual(customAfter.background, 'rgba(0, 0, 0, 0)');
  assert.equal(
    customAfter.inlinePriority,
    '',
    'custom surfaces are never transferred to normal hover paint',
  );
  await page.keyboard.press('Tab');
  await custom.focus();
  assert(await custom.evaluate((node) => node.matches(':focus-visible')));
  assert.notEqual(
    await custom.evaluate((node) => getComputedStyle(node).backgroundColor),
    'rgba(0, 0, 0, 0)',
  );
  assert.notEqual(customBefore, 'rgba(0, 0, 0, 0)');
  assert.deepEqual(problems, []);
}

try {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  for (const name of selected) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: name.endsWith('reduce') ? 'reduce' : 'no-preference',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    try {
      await page.goto(site.base + '/?layout=chronicle#home');
      await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
      if (name.startsWith('base-')) await base(page);
      else await fixture(page);
      assert.deepEqual(errors, [], 'no browser runtime errors');
      checks.push(name);
      console.log('PASS', name);
    } catch (error) {
      failures.push({ name, message: error.message, stack: error.stack, browserErrors: errors });
      await page.screenshot({
        path: fileURLToPath(new URL(name + '.png', output)),
        fullPage: true,
      });
      console.error('FAIL', name, error.message);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser?.close();
  await site.close();
}
await writeFile(
  new URL('acceptance.json', output),
  JSON.stringify({ selected, checks, failures, evidence }, null, 2) + '\n',
);
if (failures.length) process.exitCode = 1;
