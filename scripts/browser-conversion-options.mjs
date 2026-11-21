import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseOperation, chooseNativeTask, go } from './browser-navigation.mjs';

// Each case owns an isolated browser context and the suite owns its loopback
// site. --case=desktop,presets reruns only selected behavior after a correction.
const caseNames = [
  'desktop',
  'preferences',
  'presets',
  'aes',
  'mobile-320',
  'mobile-390',
  'native-options',
  'responsive-text',
  'shared-inputs',
];
const args = process.argv.slice(2);
let selected = caseNames;
if (args.length) {
  const value = args[0]?.startsWith('--case=')
    ? args[0].slice('--case='.length)
    : args[0] === '--case'
      ? args[1]
      : null;
  if (!value || args.length !== (args[0] === '--case' ? 2 : 1))
    throw Error('用法：node scripts/browser-conversion-options.mjs [--case=desktop,presets]');
  selected = [...new Set(value.split(','))];
  if (selected.some((name) => !caseNames.includes(name)))
    throw Error('未知用例，可选：' + caseNames.join(', '));
}

const advancedSelector = '[data-optional-setting="advanced-parameters"]';
const presetsSelector = '[data-optional-setting="parameter-presets"]';
const checks = [];
const failures = [];
const site = await startBrowserTestSite();
let browser;

async function ready(page) {
  await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}
async function operation(page, name) {
  const entry = await chooseOperation(page, name);
  await ready(page);
  return page.locator('#panel-' + entry.panel + ' .ct-tool');
}
async function setOption(page, key, value) {
  await go(page, 'settings');
  const control = page.locator('#setting-' + key);
  if ((await control.getAttribute('aria-checked')) !== String(value)) await control.click();
  assert.equal(await control.getAttribute('aria-checked'), String(value));
}
async function aligned(input, output, label, { height = false } = {}) {
  const a = await input.boundingBox();
  const b = await output.boundingBox();
  assert(a && b, label + ': both editing surfaces are visible');
  assert(Math.abs(a.y - b.y) < 2, label + ': editor tops differ by ' + Math.abs(a.y - b.y));
  if (height)
    assert(
      Math.abs(a.height - b.height) < 4,
      `${label}: minimum editor heights should match (input ${a.height}, result ${b.height})`,
    );
  return { input: a, result: b };
}
async function runBase64(page, task) {
  await task.locator('.ct-run').click();
  await page.waitForFunction(
    () => document.querySelector('#ct-encoding .ct-output')?.value === 'Hello',
  );
  assert.equal(await task.locator('.ct-output').inputValue(), 'Hello');
}
async function assertFits(page, locator, label) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  assert(box && box.width > 0 && box.height > 0, label + ': visible and reachable');
  const width = page.viewportSize().width;
  assert(box.x >= -1 && box.x + box.width <= width + 1, label + ': fits the viewport');
}

const cases = {
  async desktop(page) {
    const task = await operation(page, 'From Base64');
    assert.equal(await task.locator(advancedSelector).count(), 1);
    assert.equal(await task.locator(advancedSelector).isVisible(), false);
    assert.equal(await page.locator(presetsSelector + ':visible').count(), 0);
    const support = task.locator('.ui-conversion-support');
    assert(await support.isVisible(), 'guidance remains visible without optional controls');
    assert.equal(await task.locator('.ui-conversion-input .ct-input-guidance').count(), 0);
    assert.equal(await task.locator('.ui-conversion-support .ct-input-guidance').count(), 1);
    const describedBy = await task.locator('.ct-input').getAttribute('aria-describedby');
    assert(describedBy, 'input keeps its guidance association');
    assert(
      await page.evaluate((id) => Boolean(document.getElementById(id)), describedBy),
      'associated guidance retains its real ID',
    );
    await aligned(
      task.locator('.ct-input'),
      task.locator('.ui-result-placeholder'),
      'Base64 empty',
      {
        height: true,
      },
    );
    await task.locator('.ct-input').fill('SGVsbG8=');
    await runBase64(page, task);
    await aligned(task.locator('.ct-input'), task.locator('.ct-output'), 'Base64 result', {
      height: true,
    });
    await chooseNativeTask(page, 'native:ascii');
    await ready(page);
    await aligned(page.locator('#basics-input'), page.locator('#basics-output'), 'ASCII empty', {
      height: true,
    });
    await page.locator('#basics-input').fill('Hello');
    await page.locator('#basics-run').click();
    await page.waitForFunction(
      () => document.querySelector('#basics-output').value === '72 101 108 108 111',
    );
    await aligned(page.locator('#basics-input'), page.locator('#basics-output'), 'ASCII result');
  },
  async preferences(page) {
    let task = await operation(page, 'From Base64');
    await task.locator('.ct-input').fill('SGVsbG8=');
    for (const key of ['showAdvancedParameters', 'showParameterPresets'])
      await setOption(page, key, true);
    task = await operation(page, 'From Base64');
    assert.equal(await task.locator('.ct-input').inputValue(), 'SGVsbG8=');
    const advanced = task.locator(advancedSelector);
    const presets = page.locator(presetsSelector + ':visible');
    assert(await advanced.isVisible());
    assert.equal(await presets.count(), 1);
    assert.equal(await task.locator('.ui-conversion-options ' + presetsSelector).count(), 1);
    assert.equal(await task.locator('.ui-conversion-controls ' + presetsSelector).count(), 0);
    await advanced.locator('summary').click();
    const removeNonAlphabet = task.locator('[data-arg="1"] input');
    await removeNonAlphabet.uncheck();
    for (const key of ['showAdvancedParameters', 'showParameterPresets'])
      await setOption(page, key, false);
    task = await operation(page, 'From Base64');
    assert.equal(await task.locator('.ct-input').inputValue(), 'SGVsbG8=');
    assert.equal(await task.locator(advancedSelector).isVisible(), false);
    assert.equal(await page.locator(presetsSelector + ':visible').count(), 0);
    assert.equal(await removeNonAlphabet.isChecked(), false, 'hiding keeps parameter values');
    await setOption(page, 'showAdvancedParameters', true);
    await setOption(page, 'showParameterPresets', true);
    task = await operation(page, 'From Base64');
    assert.equal(await task.locator('.ct-input').inputValue(), 'SGVsbG8=');
    assert.equal(await removeNonAlphabet.isChecked(), false);
    await page.reload();
    await ready(page);
    assert.equal(await page.locator('html').getAttribute('data-ui-advanced-parameters'), 'true');
    assert.equal(await page.locator('html').getAttribute('data-ui-parameter-presets'), 'true');
    assert(await task.locator(advancedSelector).isVisible());
    assert.equal(await page.locator(presetsSelector + ':visible').count(), 1);
    assert.equal(
      await task.locator('.ct-input').inputValue(),
      '',
      'display settings never persist input',
    );
    await setOption(page, 'showAdvancedParameters', false);
    await setOption(page, 'showParameterPresets', false);
    await page.reload();
    await ready(page);
    await operation(page, 'From Base64');
    assert.equal(await task.locator(advancedSelector).isVisible(), false);
    assert.equal(await page.locator(presetsSelector + ':visible').count(), 0);
  },
  async presets(page) {
    await setOption(page, 'showAdvancedParameters', true);
    await setOption(page, 'showParameterPresets', true);
    let task = await operation(page, 'From Base64');
    await task.locator('.ct-input').fill('SGVsbG8=');
    await task.locator(advancedSelector + ' summary').click();
    const removeNonAlphabet = task.locator('[data-arg="1"] input');
    await removeNonAlphabet.uncheck();
    let presets = task.locator(presetsSelector);
    await presets.locator('summary').click();
    await presets.getByLabel('预设名称', { exact: true }).fill('Base64 保留字符');
    await presets.getByRole('button', { name: '保存当前参数', exact: true }).click();
    await page.waitForFunction(() =>
      JSON.parse(localStorage.getItem('arg.ui.parameter-presets.v1') || '[]').some(
        (row) => row.name === 'Base64 保留字符',
      ),
    );
    await removeNonAlphabet.check();
    await setOption(page, 'showParameterPresets', false);
    task = await operation(page, 'From Base64');
    assert.equal(await task.locator('.ct-input').inputValue(), 'SGVsbG8=');
    assert.equal(await page.locator(presetsSelector + ':visible').count(), 0);
    assert.equal(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem('arg.ui.parameter-presets.v1')).length,
      ),
      1,
      'hiding presets does not remove saved values',
    );
    await setOption(page, 'showParameterPresets', true);
    task = await operation(page, 'From Base64');
    presets = task.locator(presetsSelector);
    if (!(await presets.evaluate((node) => node.open))) await presets.locator('summary').click();
    await presets
      .locator('select[aria-label="已保存的参数预设"]')
      .selectOption({ label: 'Base64 保留字符' });
    await presets.getByRole('button', { name: '应用', exact: true }).click();
    assert.equal(await removeNonAlphabet.isChecked(), false);
    assert.equal(await task.locator('.ct-input').inputValue(), 'SGVsbG8=');
    assert.equal(
      await task.locator('.ct-output').count(),
      0,
      'applying parameters does not execute',
    );
    await runBase64(page, task);
  },
  async aes(page) {
    let task = await operation(page, 'AES Encrypt');
    for (const index of [0, 1])
      assert(
        await task.locator('[data-arg="' + index + '"] input').isVisible(),
        'Key and IV remain visible',
      );
    const key = task.locator('[data-arg="0"] input');
    await key.fill('000102030405060708090a0b0c0d0e0f');
    assert.equal(await task.locator(advancedSelector).isVisible(), false);
    assert.equal(
      await task.locator('[data-arg="6"]').isVisible(),
      false,
      'optional IV output setting stays hidden',
    );
    await setOption(page, 'showAdvancedParameters', true);
    task = await operation(page, 'AES Encrypt');
    assert.equal(await key.inputValue(), '000102030405060708090a0b0c0d0e0f');
    const advanced = task.locator(advancedSelector);
    assert(await advanced.isVisible());
    if (!(await advanced.evaluate((node) => node.open))) await advanced.locator('summary').click();
    assert(await task.locator('[data-arg="6"]').isVisible());
    await setOption(page, 'showAdvancedParameters', false);
    await operation(page, 'AES Encrypt');
    assert.equal(await key.inputValue(), '000102030405060708090a0b0c0d0e0f');
    assert.equal(await task.locator(advancedSelector).isVisible(), false);
    assert(await task.locator('[data-arg="1"] input').isVisible());
  },
  async 'native-options'(page) {
    // These are explicit advanced areas owned by existing native controllers;
    // changing their fields verifies availability without invoking heavy jobs.
    const areas = [
      {
        route: 'barcode-generate',
        panel: '#panel-barcode-generate',
        field: '#barcode-generate-options',
        value: '{"scale":3}',
      },
      {
        route: 'qalculate',
        panel: '#panel-qalculate',
        field: '#qalculate-options',
        value: 'print.min_exp -3\nprint.show_ending_zeroes true',
        prepare: async () => {
          await page
            .locator('#panel-qalculate')
            .getByRole('tab', { name: '设置', exact: true })
            .click();
        },
      },
      {
        route: 'spectral-images',
        panel: '#panel-spectral-images',
        field: 'input[type="number"]',
        value: '9',
        prepareAdvanced: async (advanced) => {
          await advanced.locator('select').first().selectOption('advanced');
        },
      },
      {
        route: 'origami',
        panel: '#panel-origami',
        field: '#origami-fixed',
        value: '0 1',
      },
      {
        route: 'qrrepair',
        task: 'native:image-qr',
        panel: '#panel-image',
        advanced: '#qr-codeword-details',
        field: 'textarea[aria-label="完整数据码字"]',
        value: '1 2 3',
      },
    ];
    async function open(area) {
      await chooseNativeTask(page, area.task || 'native:' + area.route);
      await area.prepare?.();
      await ready(page);
      const panel = page.locator(area.panel);
      const advanced = panel.locator(area.advanced || advancedSelector);
      assert.equal(await advanced.count(), 1, area.route + ': registered optional area');
      return { panel, advanced };
    }
    for (const area of areas) {
      const { advanced } = await open(area);
      assert.equal(await advanced.isVisible(), false, area.route + ': hidden by default');
      assert.equal(await advanced.locator(area.field).first().isVisible(), false);
    }
    await setOption(page, 'showAdvancedParameters', true);
    for (const area of areas) {
      const { advanced } = await open(area);
      assert(await advanced.isVisible(), area.route + ': original advanced area is available');
      if (!(await advanced.evaluate((node) => node.open)))
        await advanced.locator('summary').click();
      await area.prepareAdvanced?.(advanced);
      const field = advanced.locator(area.field).first();
      assert(await field.isVisible(), area.route + ': original field is visible');
      assert(await field.isEditable(), area.route + ': original field is editable');
      await field.fill(area.value);
      assert.equal(await field.inputValue(), area.value);
    }
    await go(page, 'water-boiling');
    const calculator = page.locator('#panel-water-boiling');
    assert.equal(await calculator.locator('[data-parameter-scope]').count(), 1);
    assert.equal(await calculator.locator(presetsSelector).isVisible(), false);
    await setOption(page, 'showParameterPresets', true);
    await go(page, 'water-boiling');
    const presets = calculator.locator(presetsSelector);
    assert(await presets.isVisible(), 'parameter-scope forms share the same preset option');
    await presets.locator('summary').click();
    await calculator.locator('#water-boiling-pressure').fill('90');
    await presets.getByLabel('预设名称', { exact: true }).fill('当地气压');
    await presets.getByRole('button', { name: '保存当前参数', exact: true }).click();
    await page.waitForFunction(() =>
      JSON.parse(localStorage.getItem('arg.ui.parameter-presets.v1') || '[]').some(
        (row) => row.name === '当地气压',
      ),
    );
    await calculator.locator('#water-boiling-pressure').fill('101.325');
    await presets.getByRole('button', { name: '应用', exact: true }).click();
    assert.equal(await calculator.locator('#water-boiling-pressure').inputValue(), '90');
    assert(await calculator.locator('#water-boiling-result [data-ui="empty-state"]').isVisible());
    await setOption(page, 'showParameterPresets', false);
    await go(page, 'water-boiling');
    assert.equal(await presets.isVisible(), false);
    assert.equal(await calculator.locator('#water-boiling-pressure').inputValue(), '90');
  },
  async 'responsive-text'(page) {
    await page.setViewportSize({ width: 1024, height: 900 });
    let task = await operation(page, 'From Base64');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    const input = await task.locator('.ct-input').boundingBox();
    const empty = await task.locator('.ui-result-placeholder').boundingBox();
    assert(input && empty);
    if (Math.abs(input.y - empty.y) < 2) {
      assert(input.width >= 300 && empty.width >= 300, 'medium side-by-side panes remain usable');
    } else {
      assert(empty.y >= input.y + input.height, 'medium stacked panes retain a natural order');
      assert(input.width >= 500 && empty.width >= 500, 'medium stacked panes use available width');
    }
    await page.evaluate(async () => {
      (await import('/preferences.js')).setPreferences({ editorSize: 24, textSize: 'large' });
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await ready(page);
    await aligned(
      task.locator('.ct-input'),
      task.locator('.ui-result-placeholder'),
      'large text empty',
      {
        height: true,
      },
    );
    await task.locator('.ct-input').fill('SGVsbG8=');
    await runBase64(page, task);
    const large = await aligned(
      task.locator('.ct-input'),
      task.locator('.ct-output'),
      'large text result',
      {
        height: true,
      },
    );
    assert(
      large.input.height >= 190 && large.input.height <= 240,
      'large editor height reflects four text lines',
    );
    assert.equal(
      await task.locator('.ct-input').evaluate((node) => getComputedStyle(node).fontSize),
      '24px',
    );
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await mkdir(new URL('../outputs/conversion-options/', import.meta.url), { recursive: true });
    await page.screenshot({ path: 'outputs/conversion-options/base64-large-1440.png' });
    await page.setViewportSize({ width: 320, height: 844 });
    await ready(page);
    task = page.locator('#ct-encoding');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    for (const selector of ['.ct-input-guidance', '.ct-input', '.ct-run', '.ct-output'])
      await assertFits(page, task.locator(selector), '320px large text ' + selector);
    assert.equal(await task.locator('.ct-output').inputValue(), 'Hello');
    await task.locator('.ct-input-guidance').scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'outputs/conversion-options/base64-large-320.png' });
  },
  async 'shared-inputs'(page) {
    await chooseNativeTask(page, 'native:cipher-detect');
    const source = page.locator('#analysis-input');
    const sourceField = source.locator('xpath=ancestor::*[@data-ui="field"][1]');
    const caption = sourceField.locator(':scope > span').first();
    await source.fill('SGVsbG8=');
    assert.equal(await sourceField.getAttribute('data-label-visibility'), null);
    assert((await caption.boundingBox()).height > 5);
    const magic = await operation(page, 'Magic');
    await magic.locator('.ct-source').selectOption('shared');
    await ready(page);
    assert.equal(await source.inputValue(), 'SGVsbG8=');
    assert.equal(await sourceField.getAttribute('data-label-visibility'), 'screen-reader');
    assert(
      (await caption.boundingBox()).height <= 1,
      'shared caption is visually hidden and retained',
    );
    await aligned(source, magic.locator('.ui-result-placeholder'), 'Magic original shared source');
    await chooseNativeTask(page, 'native:cipher-detect');
    assert.equal(await source.inputValue(), 'SGVsbG8=');
    assert.equal(await sourceField.getAttribute('data-label-visibility'), null);
    assert((await caption.boundingBox()).height > 5);
    await chooseNativeTask(page, 'native:beast-codec');
    await ready(page);
    const beast = page.locator('#panel-beast-codec');
    const text = beast.locator('#beast-codec-input');
    assert.equal(await beast.locator('.ui-conversion-input input[type="file"]').count(), 0);
    assert.equal(await beast.locator('.ui-conversion-support input[type="file"]').count(), 1);
    await aligned(text, beast.locator('.ui-result-placeholder'), 'beast empty', { height: true });
    await text.fill('A');
    await beast.locator('#beast-codec-run').click();
    await page.waitForFunction(() => Boolean(document.getElementById('beast-codec-output')?.value));
    const encoded = await beast.locator('#beast-codec-output').inputValue();
    assert.match(encoded, /^[嗷呜啊~]+$/);
    await aligned(text, beast.locator('#beast-codec-output'), 'beast real output');
    await beast.locator('.ui-conversion-settings select').first().selectOption('decode');
    await text.fill(encoded);
    await beast.locator('#beast-codec-run').click();
    await page.waitForFunction(() => document.getElementById('beast-codec-output')?.value === 'A');
    await aligned(text, beast.locator('#beast-codec-output'), 'beast decoded output');
  },
};
for (const width of [320, 390])
  cases['mobile-' + width] = async (page) => {
    let task = await operation(page, 'From Base64');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await assertFits(page, task.locator('.ct-input-guidance'), 'mobile guidance');
    await assertFits(page, task.locator('.ct-input-guidance button'), 'mobile example');
    await assertFits(page, task.locator('.ct-input'), 'mobile input');
    await task.locator('.ct-input').fill('SGVsbG8=');
    await assertFits(page, task.locator('.ct-run'), 'mobile run');
    await runBase64(page, task);
    await assertFits(page, task.locator('.ct-output'), 'mobile output');
    await setOption(page, 'showAdvancedParameters', true);
    await setOption(page, 'showParameterPresets', true);
    task = await operation(page, 'From Base64');
    await task.locator(advancedSelector + ' summary').click();
    await task.locator(presetsSelector + ' summary').click();
    await assertFits(
      page,
      task.locator(presetsSelector).getByRole('button', { name: '保存当前参数', exact: true }),
      'mobile save preset',
    );
    await assertFits(
      page,
      task.locator(presetsSelector).getByLabel('预设名称', { exact: true }),
      'mobile preset name',
    );
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.equal(await task.locator('.ct-input').inputValue(), 'SGVsbG8=');
  };

try {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  for (const name of selected) {
    const width = name.startsWith('mobile-') ? Number(name.slice('mobile-'.length)) : 1440;
    const context = await browser.newContext({
      viewport: { width, height: width < 600 ? 844 : 1000 },
      reducedMotion: 'reduce',
    });
    try {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.setDefaultTimeout(30000);
      await page.goto(site.base + '/?layout=chronicle#home');
      await ready(page);
      await cases[name](page);
      assert.deepEqual(errors, [], 'no browser runtime errors');
      checks.push(name);
      console.log('PASS', name);
    } catch (error) {
      failures.push({ name, message: error.message, stack: error.stack });
      console.error('FAIL', name, error.message);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser?.close();
  await site.close();
}
await mkdir(new URL('../outputs/conversion-options/', import.meta.url), { recursive: true });
await writeFile(
  new URL('../outputs/conversion-options/acceptance.json', import.meta.url),
  JSON.stringify({ selected, checks, failures }, null, 2) + '\n',
);
if (failures.length) process.exitCode = 1;
