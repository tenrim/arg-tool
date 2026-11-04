import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createDevServer, closeDevServer } from './server.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const server = createDevServer({
  env: {},
  feedbackStarter: async () => ({ state: 'unconfigured', close: async () => {} }),
  onlineQueryFactory: () => ({
    handle() {
      return false;
    },
    close() {},
  }),
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  headless: true,
});
const errors = [],
  checks = [];
async function ready(page) {
  await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
}
async function go(page, route, panel) {
  await page.evaluate((route) => (location.hash = route), route);
  await page.waitForFunction((id) => {
    const n = document.getElementById('panel-' + id);
    return n && !n.hidden && !n.dataset.motionPending;
  }, panel);
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
}
try {
  if (process.env.SETTINGS_SCOPE !== 'integration') {
    const context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
        reducedMotion: 'reduce',
      }),
      page = await context.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base + '/#settings');
    await ready(page);
    await page.locator('#settings-storage dl').waitFor();
    for (const title of ['调整收藏顺序', '查看快捷键', '重置与清理'])
      assert.equal(
        await page.locator('#panel-settings summary').filter({ hasText: title }).count(),
        1,
      );
    await page.locator('#setting-editorSize').selectOption('20');
    await page.locator('#setting-inputWrap').selectOption('scroll');
    await page.locator('#setting-resultWrap').selectOption('scroll');
    await page.locator('#setting-rememberParameters').click();
    await page.locator('#setting-recentLimit').selectOption('12');
    await go(page, 'byte-codecs?task=native%3Abyte-codecs', 'byte-codecs');
    const input = page.locator('#byte-codecs-input');
    await input.fill('abc '.repeat(300));
    assert.equal(await input.evaluate((n) => getComputedStyle(n).fontSize), '20px');
    assert.equal(await input.evaluate((n) => getComputedStyle(n).whiteSpace), 'pre');
    assert(await input.evaluate((n) => n.scrollWidth > n.clientWidth));
    assert.equal((await input.inputValue()).length, 1200);
    await page.locator('#byte-codecs-codec').selectOption('crockford32');
    await input.fill('foobar');
    await input.press('Control+Enter');
    await page.waitForFunction(
      () => document.getElementById('byte-codecs-output').value.length > 0,
    );
    assert.equal(
      await page.locator('#byte-codecs-output').evaluate((n) => getComputedStyle(n).whiteSpace),
      'pre',
    );
    await page.locator('#byte-codecs-direction').selectOption('decode');
    await go(page, 'settings', 'settings');
    await page.locator('#setting-runShortcut').click();
    await go(page, 'byte-codecs?task=native%3Abyte-codecs', 'byte-codecs');
    await input.fill('test');
    await page.locator('#byte-codecs-run').evaluate((n) => {
      window.settingsRuns = 0;
      n.addEventListener('click', () => window.settingsRuns++);
    });
    await input.press('Control+Enter');
    assert.equal(
      await page.evaluate(() => window.settingsRuns),
      0,
      'disabled shortcut never dispatches execution',
    );
    await page.reload();
    await ready(page);
    assert.equal(
      await page.locator('#byte-codecs-codec').inputValue(),
      'crockford32',
      'safe native parameter restores after reload',
    );
    assert.equal(await input.inputValue(), '', 'tool input is never restored from preferences');
    // This native form owns its direction as a parameter (no registered dir link).
    await page.goto(base + '/#byte-codecs?task=native%3Abyte-codecs');
    await ready(page);
    assert.equal(await page.locator('#byte-codecs-direction').inputValue(), 'decode');
    await page.locator('#byte-codecs-direction').selectOption('encode');
    await go(page, 'settings', 'settings');
    await page.locator('#setting-runShortcut').click();
    await go(page, 'byte-codecs?task=native%3Abyte-codecs', 'byte-codecs');
    await input.fill('foobar');
    await input.dispatchEvent('keydown', { key: 'Enter', ctrlKey: true, isComposing: true });
    assert.equal(
      await page.locator('#byte-codecs-output').inputValue(),
      '',
      'IME composition does not execute',
    );
    await input.press('Control+Enter');
    await page.waitForFunction(
      () => document.getElementById('byte-codecs-output').value.length > 0,
    );
    await go(page, 'encoding/base?task=topic%3Abase-family&op=To+Base64', 'encoding');
    const arg = page.locator('#panel-encoding .chef-check input').first();
    if (await arg.count()) {
      await arg.check();
      const state = await arg.isChecked();
      await page.reload();
      await ready(page);
      assert.equal(
        await page.locator('#panel-encoding .chef-check input').first().isChecked(),
        state,
      );
    }
    await page.locator('#panel-encoding .ct-direction').selectOption('From Base64');
    await page.goto(base + '/#encoding/base?task=topic%3Abase-family');
    await ready(page);
    assert.equal(await page.locator('#panel-encoding .ct-direction').inputValue(), 'From Base64');
    await page.goto(base + '/#encoding/base?task=topic%3Abase-family&op=To+Base64');
    await ready(page);
    assert.equal(
      await page.locator('#panel-encoding .ct-direction').inputValue(),
      'To Base64',
      'explicit registered operation wins over remembered selection',
    );
    await go(page, 'crypto/symmetric?task=pair%3AAES%2520Encrypt&op=AES+Encrypt', 'crypto');
    const key = page.locator('#panel-crypto .ct-parameters [data-arg="0"] input').first();
    await key.fill('do-not-persist-secret');
    await key.dispatchEvent('change');
    const stored = await page.evaluate(() =>
      Object.entries(localStorage)
        .filter(([k]) => k.startsWith('arg.ui.'))
        .map(([, v]) => v)
        .join('\n'),
    );
    assert(!stored.includes('do-not-persist-secret'));
    assert(!stored.includes('foobar'));
    checks.push(
      'editor display, shortcut, native/Chef parameter persistence and input/secret exclusion',
    );
    await go(page, 'settings', 'settings');
    await page.evaluate(async () => {
      const p = await import('/preferences.js');
      p.setFavorites(['byte-codecs', 'keyboard-extra', 'nato']);
    });
    await page.locator('summary').filter({ hasText: '调整收藏顺序' }).click();
    const initial = await page.locator('.settings-favorite>span').allTextContents();
    await page.locator('.settings-favorite').nth(1).getByRole('button', { name: /上移/ }).click();
    assert.deepEqual(await page.locator('.settings-favorite>span').allTextContents(), [
      initial[1],
      initial[0],
      initial[2],
    ]);
    await page.locator('#setting-favoriteSort').selectOption('name');
    const names = await page.locator('.settings-favorite>span').allTextContents();
    assert.deepEqual(
      names,
      [...names].sort((a, b) => a.localeCompare(b, 'zh-CN')),
    );
    await page.evaluate(async () => {
      const p = await import('/preferences.js');
      for (const name of [
        'byte-codecs',
        'keyboard-extra',
        'nato',
        't9',
        'morse',
        'timezones',
        'score',
        'image',
        'audio',
        'file',
        'symbols',
        'substitution',
        'qalculate',
      ])
        p.recordTool(name);
    });
    assert.equal(
      await page.evaluate(async () => (await import('/preferences.js')).getRecentEntries().length),
      12,
    );
    await page.locator('#setting-recordRecent').click();
    assert.equal(
      await page.evaluate(async () => {
        const p = await import('/preferences.js');
        p.recordTool('byte-codecs');
        return p.getRecentEntries().length;
      }),
      0,
    );
    assert(await page.locator('#setting-recentLimit').isDisabled());
    checks.push('manual/name favorite ordering and configurable/disabled recent history');
    await page.locator('#setting-masterVolume').fill('40');
    assert(Math.abs((await page.locator('#audio-player').evaluate((n) => n.volume)) - 0.4) < 1e-8);
    await page.locator('#setting-audioMuted').click();
    assert(await page.locator('#audio-player').evaluate((n) => n.muted));
    await page.evaluate(async () => {
      const { element } = await import('/ui/index.js');
      const audio = element('audio', { id: 'settings-test-player' });
      document.body.append(audio);
    });
    assert(
      await page
        .locator('#settings-test-player')
        .evaluate((n) => n.muted && Math.abs(n.volume - 0.4) < 1e-8),
    );
    await page.locator('#setting-audioMuted').click();
    assert.equal(await page.locator('#audio-player').evaluate((n) => n.muted), false);
    await page.locator('#audio-player').evaluate(
      (n) =>
        new Promise((resolve) => {
          n.addEventListener('volumechange', resolve, { once: true });
          n.volume = 0.2;
        }),
    );
    await page.locator('#setting-masterVolume').fill('80');
    assert(
      Math.abs((await page.locator('#audio-player').evaluate((n) => n.volume)) - 0.4) < 1e-8,
      'per-player gain remains multiplicative',
    );
    await go(page, 'audio/play?task=native%3Aaudio-play', 'audio');
    await page.locator('#music-keyboard button').first().click();
    await page.waitForFunction(() => Boolean(window.Tone?.Destination));
    assert(
      Math.abs(
        (await page.evaluate(() => window.Tone.Destination.volume.value)) - 20 * Math.log10(0.8),
      ) < 0.01,
    );
    await go(page, 'settings', 'settings');
    await page.locator('#setting-audioMuted').click();
    assert(await page.evaluate(() => window.Tone.Destination.mute));
    checks.push('master playback volume and mute for existing/new media and Tone synth');
    await page.evaluate(async () => {
      const { createNotebookStore } = await import('/notebook/store.js');
      const { newNote } = await import('/notebook/model.js');
      const store = createNotebookStore();
      const note = newNote('设置页测试');
      note.markdown = 'test';
      await store.save(note);
      await store.close();
    });
    await page.locator('#settings-refresh-storage').click();
    await page.waitForFunction(() =>
      document.querySelector('#settings-storage').textContent.includes('1 篇'),
    );
    await page.locator('#settings-notebook-backup').click();
    await page.locator('#notebook-actions-dialog').waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    await go(page, 'settings', 'settings');
    await page.locator('#settings-notebook-trash').click();
    await page.locator('#notebook-trash').waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    await go(page, 'settings', 'settings');
    const data = await page.evaluate(async () =>
      (await import('/preferences.js')).exportPreferences(),
    );
    await page.locator('#settings-import').setInputFiles({
      name: 'settings.json',
      mimeType: 'application/json',
      buffer: Buffer.from(data),
    });
    await page.waitForFunction(() =>
      document.getElementById('settings-status').textContent.includes('已导入'),
    );
    await page.locator('summary').filter({ hasText: '重置与清理' }).click();
    await page.getByRole('button', { name: '清除已记住的工具参数' }).click();
    assert.equal(
      await page.evaluate(() => localStorage.getItem('arg.ui.tool-parameters.v1')),
      null,
    );
    checks.push(
      'real notebook usage/backup/trash entry points, preference backup and parameter cleanup',
    );
    await context.close();
    const mobile = await browser.newContext({
        viewport: { width: 390, height: 844 },
        reducedMotion: 'reduce',
      }),
      phone = await mobile.newPage();
    phone.on('pageerror', (e) => errors.push(e.message));
    await phone.goto(base + '/#settings');
    await ready(phone);
    assert(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await phone.locator('#setting-audioMuted').focus();
    await phone.keyboard.press('Space');
    assert.equal(await phone.locator('#setting-audioMuted').getAttribute('aria-checked'), 'true');
    await phone.locator('#setting-editorSize').selectOption('24');
    assert(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await mobile.close();
    assert.deepEqual(errors, []);
    checks.push('390px layout and keyboard switch operation');
    console.log(JSON.stringify({ checks, errors }, null, 2));
  }
  if (process.env.SETTINGS_SCOPE !== 'basic') {
    const context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
        reducedMotion: 'reduce',
      }),
      page = await context.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base + '/#settings');
    await ready(page);
    await page.evaluate(async () => {
      (await import('/preferences.js')).setPreferences({ rememberParameters: true });
    });
    await go(page, 'integer-codecs?task=native%3Ainteger-codecs', 'integer-codecs');
    await page.locator('#integer-codecs-codec').selectOption('hamming');
    await page.locator('#integer-codecs-extended').selectOption('yes');
    await page.locator('#integer-codecs-parityPosition').selectOption('last');
    await page.reload();
    await ready(page);
    assert.equal(await page.locator('#integer-codecs-codec').inputValue(), 'hamming');
    assert.equal(await page.locator('#integer-codecs-extended').inputValue(), 'yes');
    assert.equal(
      await page.locator('#integer-codecs-parityPosition').inputValue(),
      'last',
      'newly revealed parameters restore after their parent selection',
    );
    await go(page, 'encoding/base?task=topic%3Abase-family&op=To+Base64', 'encoding');
    await page.locator('#panel-encoding .ct-source').selectOption('hex');
    await page.reload();
    await ready(page);
    assert.equal(await page.locator('#panel-encoding .ct-source').inputValue(), 'hex');
    checks.push('dependent parameter restoration and stable source preference identity');
    await go(page, 'roman', 'roman');
    const roman = page.locator('#roman-input');
    await roman.fill('10');
    await roman.press('Control+Enter');
    await page.waitForFunction(() => document.getElementById('roman-output').value === 'X');
    await page.evaluate(async () => {
      (await import('/preferences.js')).setPreferences({ runShortcut: false });
    });
    await roman.fill('11');
    await roman.press('Control+Enter');
    assert.equal(await page.locator('#roman-output').inputValue(), '');
    assert.equal(await page.locator('#roman-run').isDisabled(), false);
    for (const [route, panel, inputId, runId] of [
      ['code', 'code', '#code-source', '#code-run'],
      ['cyberchef', 'cyberchef', '#chef-input', '#chef-run'],
      ['qalculate', 'qalculate', '#qalculate-expression', '#qalculate-run'],
      [
        'date-difference',
        'date-difference',
        '#panel-date-difference input',
        '#date-difference-run',
      ],
      ['timezones', 'timezones', '#timezones-datetime', '#timezones-run'],
    ]) {
      await go(page, route, panel);
      const input = page.locator(inputId).first(),
        button = page.locator(runId);
      await page.waitForFunction((id) => {
        const n = document.querySelector(id);
        return n && !n.disabled;
      }, runId);
      await button.evaluate((n) => {
        window.settingsShortcutClicks = 0;
        n.addEventListener(
          'click',
          (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            window.settingsShortcutClicks++;
          },
          true,
        );
      });
      await input.press('Control+Enter');
      assert.equal(
        await page.evaluate(() => window.settingsShortcutClicks),
        0,
        route + ' disabled',
      );
      await page.evaluate(async () => {
        (await import('/preferences.js')).setPreferences({ runShortcut: true });
      });
      await input.dispatchEvent('keydown', { key: 'Enter', ctrlKey: true, isComposing: true });
      assert.equal(await page.evaluate(() => window.settingsShortcutClicks), 0, route + ' IME');
      await input.press('Control+Enter');
      assert.equal(
        await page.evaluate(() => window.settingsShortcutClicks),
        1,
        route + ' one execution',
      );
      if (route === 'code') {
        await input.fill('abc');
        await input.press('End');
        await input.press('Tab');
        assert.equal(await input.inputValue(), 'abc\t');
      }
      await page.evaluate(async () => {
        (await import('/preferences.js')).setPreferences({ runShortcut: false });
      });
    }
    checks.push(
      'basic conversion output and disabled/enabled/IME shortcuts across code, recipes, calculator, dates and timezones',
    );
    await page.evaluate(async () => {
      const p = await import('/preferences.js');
      p.setPreferences({ recordRecent: true, recentLimit: 20, startPage: 'last' });
      for (const id of [
        'byte-codecs',
        'keyboard-extra',
        'nato',
        't9',
        'morse',
        'timezones',
        'score',
        'image',
        'audio',
        'file',
        'symbols',
        'substitution',
        'qalculate',
      ])
        p.recordTool(id);
    });
    const second = await context.newPage();
    await second.goto(base + '/#settings');
    await ready(second);
    await second.locator('#setting-recordRecent').click();
    await page.waitForFunction(
      () =>
        document.documentElement.dataset.uiRunShortcut === 'false' &&
        JSON.parse(localStorage.getItem('arg.ui.preferences.v1')).recordRecent === false,
    );
    await page.waitForFunction(
      async () => !(await import('/preferences.js')).getRecentEntries().length,
    );
    assert.equal(
      await page.evaluate(async () => (await import('/preferences.js')).initialRoute()),
      'home',
    );
    await second.close();
    await go(page, 'settings', 'settings');
    await mkdir('outputs', { recursive: true });
    await page.screenshot({ path: 'outputs/settings-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: 'outputs/settings-mobile.png', fullPage: true });
    checks.push('cross-tab history disable and settings visual checks');
    await context.close();
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ checks, errors }, null, 2));
  }
} finally {
  await browser.close();
  await closeDevServer(server);
}
