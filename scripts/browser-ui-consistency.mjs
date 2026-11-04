import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  headless: true,
});
const output = process.env.UI_CONSISTENCY_ARTIFACTS || join(tmpdir(), 'arg-ui-consistency');
await mkdir(output, { recursive: true });
const checks = [],
  errors = [];
async function settle(page) {
  await page.waitForFunction(() =>
    [
      ...document.querySelectorAll(
        '.panel:not([hidden]) [data-animate-ui=effect],.panel:not([hidden])[data-animate-ui=effect]',
      ),
    ].every((n) => !n.style.willChange),
  );
}
async function go(page, route, panel) {
  await page.evaluate((route) => {
    location.hash = route;
  }, route);
  await page.waitForFunction((panel) => {
    const n = document.getElementById('panel-' + panel);
    return n && !n.hidden && !n.dataset.motionPending;
  }, panel);
  await settle(page);
}
async function aligned(page, a, b) {
  const delta = await page.evaluate(
    ([a, b]) =>
      document.querySelector(a).getBoundingClientRect().bottom -
      document.querySelector(b).getBoundingClientRect().bottom,
    [a, b],
  );
  assert(Math.abs(delta) < 2, `${a} / ${b}: ${delta}px`);
}
async function checkConversionSource(page, width) {
  await go(
    page,
    'encoding/binaryencoding?task=op%3ACaret%252FM-decode&op=Caret%2FM-decode',
    'encoding',
  );
  const panel = page.locator('#panel-encoding'),
    source = panel.locator('.ct-source'),
    input = panel.locator('.ct-input');
  assert(
    await source.evaluate((n) => Boolean(n.closest('.ui-conversion-controls'))),
    'source format belongs to the common control band',
  );
  assert.equal(
    await panel.locator('.ct-input-area .ct-source').count(),
    0,
    'source selector must not offset the input editor',
  );
  if (width === 1920) {
    const tops = await panel
      .locator('.ct-input,.ct-result')
      .evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().top));
    assert(Math.abs(tops[0] - tops[1]) < 2, 'input and result contents begin on the same row');
    await aligned(
      page,
      '#panel-encoding .ct-source-field .ui-select-trigger',
      '#panel-encoding .ct-run',
    );
  }
  await input.fill('A^IB');
  await panel.locator('.ct-run').click();
  await page.waitForFunction(() =>
    document.querySelector('#panel-encoding .ct-status').textContent.startsWith('处理完成'),
  );
  assert.equal(await panel.locator('.ct-result textarea').inputValue(), 'A\tB');
  await source.selectOption('file');
  assert(await panel.locator('.ct-copy').isDisabled(), 'source changes invalidate the real result');
  await panel
    .locator('.ct-file-input')
    .setInputFiles({ name: 'caret.txt', mimeType: 'text/plain', buffer: Buffer.from('C^ID') });
  await panel.locator('.ct-run').click();
  await page.waitForFunction(() =>
    document.querySelector('#panel-encoding .ct-status').textContent.startsWith('处理完成'),
  );
  assert.equal(await panel.locator('.ct-result textarea').inputValue(), 'C\tD');
  await panel.locator('.ct-use').click();
  assert.equal(await source.inputValue(), 'result');
  assert(await panel.locator('.ct-source-preview').isVisible());
  await source.selectOption('text');
  assert.equal(await input.inputValue(), 'A^IB', 'moving source controls preserves the text draft');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await go(page, 'audio/audio?task=topic%3Aaudio-metadata&op=Extract+Audio+Metadata', 'audio');
  const audio = page.locator('#ct-audio');
  assert(
    await audio
      .locator('.ct-source')
      .evaluate((n) => Boolean(n.closest('.ui-conversion-controls'))),
  );
  assert(
    await page.locator('#audio-input').evaluate((n) => Boolean(n.closest('.ct-input-area'))),
    'shared upload remains in the actual input card',
  );
  await audio.locator('.ct-source').selectOption('text');
  await audio.locator('.ct-input').fill('媒体输入草稿');
  await audio.locator('.ct-source').selectOption('shared');
  await audio.locator('.ct-source').selectOption('text');
  assert.equal(await audio.locator('.ct-input').inputValue(), '媒体输入草稿');
  await go(page, 'byte-codecs?task=native%3Abyte-codecs', 'byte-codecs');
  assert(
    await page
      .locator('#byte-codecs-format')
      .evaluate((n) => Boolean(n.closest('.ui-conversion-controls'))),
    'native byte codecs use the same format/parameter band',
  );
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
}
try {
  for (const width of [1920, 768, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } }),
      page = await context.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('http://127.0.0.1:' + server.address().port + '/');
    await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
    await checkConversionSource(page, width);
    if (process.env.UI_CONSISTENCY_SCOPE === 'conversion-source') {
      checks.push({ width, conversionSource: true });
      await context.close();
      continue;
    }
    await go(page, 'audio/play?task=native%3Aaudio-play', 'audio');
    const black = page.locator('#music-keyboard .black').first();
    await black.scrollIntoViewIfNeeded();
    await black.hover();
    assert.notEqual(
      await black.evaluate((n) => getComputedStyle(n).backgroundColor),
      'rgba(0, 0, 0, 0)',
      'black key keeps opaque paint on hover',
    );
    assert.equal(
      await black.evaluate((n) => n.style.getPropertyPriority('background-color')),
      '',
      'menu highlight must not clear a graphics control',
    );
    await black.focus();
    assert.notEqual(
      await black.evaluate((n) => getComputedStyle(n).backgroundColor),
      'rgba(0, 0, 0, 0)',
      'focus preserves key paint',
    );
    if (process.env.UI_CONSISTENCY_SCREENSHOTS === '1')
      await page
        .locator('#music-keyboard')
        .screenshot({ path: join(output, width + '-piano-hover.png') });
    if (width === 1920) {
      await page.mouse.down();
      await black.waitFor({ state: 'visible' });
      await page.waitForFunction(() =>
        document.querySelector('#music-keyboard .black').classList.contains('is-playing'),
      );
      assert.match(await page.locator('#music-readout').innerText(), /C#4/);
      await page.waitForFunction(
        () =>
          getComputedStyle(document.querySelector('#music-keyboard .black')).backgroundColor ===
          'rgb(240, 165, 0)',
      );
      assert.equal(
        await black.evaluate((n) => getComputedStyle(n).backgroundColor),
        'rgb(240, 165, 0)',
        'live note retains active surface',
      );
      await page.mouse.up();
      assert.equal(await black.evaluate((n) => n.classList.contains('is-playing')), false);
      await aligned(page, '#music-bpm', '#music-play');
      await aligned(page, '.ui-select-host:has(#midi-track) button', '#midi-export');
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    if (process.env.UI_CONSISTENCY_SCREENSHOTS === '1')
      await page.screenshot({ path: join(output, width + '-instruments.png'), fullPage: true });
    if (width === 1920) {
      const composition = await page.evaluate(() =>
        ['music-sequence', 'midi-output'].map(
          (id) => document.getElementById(id).closest('[data-ui=card]').getBoundingClientRect().top,
        ),
      );
      assert(Math.abs(composition[0] - composition[1]) < 2, 'melody and MIDI share a desktop row');
      const emptyHeight = await page.locator('#midi-output').evaluate((n) => n.clientHeight);
      assert(emptyHeight < 100, 'empty MIDI output uses its declared two rows');
      const bytes = await page.evaluate(async () => {
        const { Midi } = await import('/vendor/round2/midi.js');
        const midi = new Midi(),
          track = midi.addTrack();
        for (let i = 0; i < 30; i++)
          track.addNote({ name: 'C4', time: i * 0.5, duration: 0.5, velocity: 0.8 });
        return [...midi.toArray()];
      });
      await page
        .locator('#midi-input')
        .setInputFiles({ name: 'layout.mid', mimeType: 'audio/midi', buffer: Buffer.from(bytes) });
      await page.waitForFunction(() =>
        document.getElementById('midi-output').value.includes('30 音符'),
      );
      await page.waitForFunction(
        (height) => document.getElementById('midi-output').clientHeight > height + 100,
        emptyHeight,
      );
      await page.locator('#midi-to-melody').click();
      assert.match(await page.locator('#music-sequence').inputValue(), /C4:/);
      await page.locator('#midi-input').setInputFiles([]);
      await page.waitForFunction(() => document.getElementById('midi-output').clientHeight < 100);
    }
    await go(page, 'audio/signal?task=native%3Aaudio-spectrum', 'audio');
    if (width === 1920) {
      await aligned(page, '#audio-start', '#audio-export');
      await aligned(page, '#morse-wpm', '#morse-audio-save');
    }
    if (process.env.UI_CONSISTENCY_SCREENSHOTS === '1')
      await page.screenshot({ path: join(output, width + '-spectrum.png'), fullPage: true });
    if (width === 1920) {
      const wav = await page.evaluate(async () => {
        window.layoutAudioInput = document.getElementById('audio-input');
        window.layoutAudioParent = window.layoutAudioInput.parentNode;
        const { wavEncode } = await import('/media.js');
        return [
          ...new Uint8Array(
            wavEncode(
              [
                Float32Array.from(
                  { length: 16000 },
                  (_, i) => Math.sin((i / 16000) * 440 * Math.PI * 2) * 0.1,
                ),
              ],
              16000,
            ),
          ),
        ];
      });
      await page
        .locator('#audio-input')
        .setInputFiles({ name: 'layout.wav', mimeType: 'audio/wav', buffer: Buffer.from(wav) });
      await page.waitForFunction(
        () =>
          document.getElementById('audio-info').textContent.includes('layout.wav') &&
          !document.getElementById('audio-export').disabled,
      );
    }
    await go(page, 'audio/audio?task=topic%3Aaudio-metadata&op=Extract+Audio+Metadata', 'audio');
    const pane = page.locator('#ct-audio .ui-conversion>[data-ui=split-view]');
    assert.equal(await pane.getAttribute('data-align'), 'start');
    assert.equal(
      await page.locator('#ct-audio .ui-conversion').getAttribute('data-ui'),
      'card',
      'one shared surface owns the task',
    );
    assert.equal(
      await page.locator('#ct-audio .ui-conversion-controls').getAttribute('data-ui'),
      'box',
      'settings do not add a nested card frame',
    );
    assert.deepEqual(
      await page
        .locator('#ct-audio .ui-conversion-panes>[data-ui=card]>[data-ui=card-title]')
        .allTextContents(),
      ['输入', '结果'],
    );
    assert(
      await page.locator('#ct-audio .ct-result [data-ui=empty-state]').isVisible(),
      'empty result gives a readable next step',
    );
    assert.equal(
      await page.locator('#ct-audio .ct-copy').getAttribute('data-variant'),
      'quiet',
      'result actions stay subordinate to execution',
    );
    assert(
      await page.locator('#ct-audio .ct-actions>.result-recording').isVisible(),
      'notebook actions stay in the result action group',
    );
    assert.equal(
      await page.locator('#main').evaluate((n) => getComputedStyle(n).outlineStyle),
      'none',
      'programmatic page focus does not frame the full document',
    );
    if (width === 1920) {
      assert(
        (await page.locator('#ct-audio .ui-conversion-controls').boundingBox()).height < 150,
        'short parameters and actions share a compact band',
      );
    }
    await page.locator('#ct-audio .ct-source').selectOption('text');
    assert.equal(await pane.getAttribute('data-align'), 'start');
    assert(await page.locator('#ct-audio .ct-input').isVisible());
    await page.locator('#ct-audio .ct-input').fill('保留输入与来源状态');
    await page.locator('#ct-audio .ct-source').selectOption('shared');
    assert.equal(await pane.getAttribute('data-align'), 'start');
    await page.locator('#ct-audio .ct-source').selectOption('text');
    assert.equal(await page.locator('#ct-audio .ct-input').inputValue(), '保留输入与来源状态');
    await page.locator('#ct-audio .ct-source').selectOption('shared');
    const notices = page.locator('#panel-audio>.tool-provenance .project-notices').first();
    await notices.locator('summary').click();
    await notices.locator('a').first().waitFor({ state: 'visible' });
    await notices.locator('summary').click();
    if (width === 1920) {
      assert(
        await page.evaluate(
          () =>
            document.getElementById('audio-input') === window.layoutAudioInput &&
            Boolean(window.layoutAudioInput.closest('.ct-input-area')),
        ),
        'the original uploader belongs to the task input card',
      );
      assert.match(
        await page.locator('#audio-info').innerText(),
        /layout\.wav/,
        'moving the uploader retains the loaded source',
      );
      assert(
        await page.locator('#panel-audio>.surface').evaluate((n) => n.hidden),
        'the redundant upload sidebar leaves the layout',
      );
      const gap = await pane.evaluate((n) => {
        const card = n.firstElementChild,
          last = [...card.children]
            .filter((c) => !c.hidden && c.getBoundingClientRect().height > 0)
            .at(-1);
        return card.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom;
      });
      assert(gap < 24, 'asset card ends after its actual input content: ' + gap);
      await page.locator('#ct-audio .ct-run').click();
      await page.waitForFunction(() =>
        document.querySelector('#ct-audio .ct-status').textContent.startsWith('处理完成'),
      );
      assert(
        await page.locator('#ct-audio .ct-result textarea').isVisible(),
        'a real result replaces the empty state with its full text view',
      );
      assert.equal(await page.locator('#ct-audio .ct-result [data-ui=empty-state]').count(), 0);
      assert(
        await page.locator('#ct-audio-result-notebook').isEnabled(),
        'regrouped actions retain their actual result lease',
      );
    }
    if (process.env.UI_CONSISTENCY_SCREENSHOTS === '1')
      await page.screenshot({ path: join(output, width + '-metadata.png'), fullPage: true });
    await go(page, 'morse?task=native%3Amorse-audio&dir=decode', 'morse');
    const morse = page.locator('#panel-morse .ui-conversion>[data-ui=split-view]');
    assert.equal(await morse.getAttribute('data-align'), 'start');
    if (width === 1920) {
      assert(
        (await page.locator('#panel-morse .ui-conversion-controls').boundingBox()).height < 220,
        'Morse options do not reserve a row per group',
      );
    }
    await page.locator('#morse-alphabet-toggle').click();
    await page.locator('#morse-alphabet-body table').waitFor({ state: 'visible' });
    assert(await page.locator('#morse-alphabet').isVisible());
    await page.locator('#morse-alphabet-toggle').click();
    await page.locator('#morse-direction').selectOption('encode');
    assert.equal(await morse.getAttribute('data-align'), 'start');
    assert(await page.locator('#morse-input').isVisible());
    await page.locator('#morse-input').fill('SOS');
    await page.locator('#morse-direction').selectOption('decode');
    await page.locator('#morse-direction').selectOption('encode');
    assert.equal(await page.locator('#morse-input').inputValue(), 'SOS');
    await page.locator('#morse-direction').selectOption('decode');
    if (process.env.UI_CONSISTENCY_SCREENSHOTS === '1')
      await page.screenshot({ path: join(output, width + '-morse.png'), fullPage: true });
    if (width === 1920) {
      await go(page, 'audio/signal?task=native%3Aaudio-spectrum', 'audio');
      assert(
        await page.evaluate(
          () =>
            document.getElementById('audio-input') === window.layoutAudioInput &&
            window.layoutAudioInput.parentNode === window.layoutAudioParent,
        ),
        'returning to native audio restores the same picker',
      );
      assert.match(await page.locator('#audio-info').innerText(), /layout\.wav/);
      const download = page.waitForEvent('download');
      await page.locator('#audio-export').click();
      assert.match((await download).suggestedFilename(), /\.wav$/);
    }
    if (width === 1920) {
      for (const [route, panel] of [
        ['substitution?task=native%3Asubstitution', 'substitution'],
        ['score?task=native%3Ascore', 'score'],
      ]) {
        await go(page, route, panel);
        // The exact shared toolbar geometry is also checked below without relying
        // on labels or engine-specific field IDs.
        const rows = await page
          .locator('#panel-' + panel + ' [data-ui=toolbar]:has(>[data-ui=field])')
          .evaluateAll((nodes) =>
            nodes.map((n) => ({
              align: getComputedStyle(n).alignItems,
              margins: [...n.querySelectorAll(':scope>[data-ui=field]')].map(
                (f) => getComputedStyle(f).marginBottom,
              ),
            })),
          );
        assert(rows.length);
        for (const row of rows) {
          assert.equal(row.align, 'flex-end');
          assert(row.margins.every((m) => m === '0px'));
        }
      }
    }
    await go(page, 'hanzi?task=topic%3Ahanzi-properties&view=native%3Ahanzi', 'hanzi');
    assert.equal(
      await page.locator('#panel-hanzi [data-ui=split-view]>.result-recording').count(),
      0,
      'recording actions must not create a third pane',
    );
    assert(
      await page
        .locator('#hanzi-output')
        .evaluate((n) =>
          n.closest('[data-ui=card]').contains(document.getElementById('hanzi-result-notebook')),
        ),
      'notebook action belongs to the actual result card',
    );
    assert(
      (await page.locator('#hanzi-output').boundingBox()).height < 120,
      'old readonly templates start compact',
    );
    await page.locator('#hanzi-output').evaluate((n) => {
      n.value = Array.from({ length: 30 }, (_, i) => '完整结果 ' + i).join('\n');
    });
    await page.waitForFunction(() => document.getElementById('hanzi-output').clientHeight > 200);
    assert.equal(
      (await page.locator('#hanzi-output').inputValue()).split('\n').length,
      30,
      'sizing retains full output',
    );
    await page.locator('#hanzi-output').evaluate((n) => {
      n.value = '';
    });
    await page.waitForFunction(() => document.getElementById('hanzi-output').clientHeight < 120);
    await go(page, 'encoding/base?task=topic%3Abase-family&op=To+Base32', 'encoding');
    const alphabet = page.locator('#panel-encoding .chef-editable-value');
    if (width === 1920) {
      const bounds = await alphabet
        .locator('.ui-select-trigger,input')
        .evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().top));
      assert.equal(bounds.length, 2);
      assert(Math.abs(bounds[0] - bounds[1]) < 2, 'preset and editable value share a row');
    }
    await page.locator('#panel-encoding .ct-input').fill('foobar');
    await page.locator('#panel-encoding .ct-run').click();
    await page.waitForFunction(() =>
      document.querySelector('#panel-encoding .ct-status').textContent.startsWith('处理完成'),
    );
    assert.equal(
      await page.locator('#panel-encoding .ct-result textarea').inputValue(),
      'MZXW6YTBOI======',
    );
    assert(
      await page.locator('#panel-encoding .result-recording button').first().isEnabled(),
      'actual result publishes the regrouped recording lease',
    );
    await alphabet.locator('select').selectOption('0-9A-V=');
    assert.equal(await alphabet.locator('input').inputValue(), '0-9A-V=');
    assert(
      await page.locator('#panel-encoding .result-recording button').first().isDisabled(),
      'parameter changes invalidate recording synchronously',
    );
    await page.locator('#panel-encoding .ct-run').click();
    await page.waitForFunction(() =>
      document.querySelector('#panel-encoding .ct-status').textContent.startsWith('处理完成'),
    );
    assert.equal(
      await page.locator('#panel-encoding .ct-result textarea').inputValue(),
      'CPNMUOJ1E8======',
    );
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await go(page, 'audio/play?task=native%3Aaudio-play', 'audio');
    await black.hover();
    assert.notEqual(
      await black.evaluate((n) => getComputedStyle(n).backgroundColor),
      'rgba(0, 0, 0, 0)',
    );
    if (width === 768) {
      await page.evaluate(async () => {
        (await import('/preferences.js')).setPreferences({ textSize: 'large' });
      });
      await settle(page);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    }
    checks.push({
      width,
      opaquePianoStates: true,
      sourceLayoutAndDrafts: true,
      compositeParameters: true,
      resultActionOwnership: true,
      legacyResultSizing: true,
      reducedMotion: true,
    });
    await context.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(join(output, 'checks.json'), JSON.stringify({ checks, errors }, null, 2));
  console.log(JSON.stringify({ checks, errors }, null, 2));
} finally {
  await browser.close();
  await closeDevServer(server);
}
