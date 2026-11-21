import assert from 'node:assert/strict';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseNativeTask } from './browser-navigation.mjs';
const cases = process.argv
  .find((arg) => arg.startsWith('--case='))
  ?.slice(7)
  .split(',') || ['regex', 'pinyin', 'phrases'];
assert(
  cases.every((name) => ['regex', 'pinyin', 'phrases'].includes(name)),
  'Unknown query regression case',
);
const site = await startBrowserTestSite();
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(site.base + '/#home');
  for (const name of cases) {
    if (name === 'regex') {
      await chooseNativeTask(page, 'native:words-regex');
      const query = async (pattern, corpus) => {
        await page.locator('#word-query').fill(pattern);
        await page.locator('#word-custom').fill(corpus);
        await page.locator('#word-run').click();
        await page.waitForFunction(() => {
          const text = document.getElementById('word-status').textContent;
          return text && !text.startsWith('正在加载');
        });
        return {
          status: await page.locator('#word-status').textContent(),
          output: await page.locator('#word-output').inputValue(),
        };
      };
      for (const [pattern, corpus, expected] of [
        ['^\\D+$', 'abc 123', 'abc'],
        ['^\\W+$', 'abc @@@', '@@@'],
        ['^ABC$', 'abc', ''],
        ['^ABC$', 'abc ABC', 'ABC'],
        ['^abc$', 'abc 123', 'abc'],
        ['^nomatch$', 'abc', ''],
      ]) {
        const result = await query(pattern, corpus);
        assert.match(result.status, /^找到/);
        assert.equal(result.output, expected, pattern);
      }
      const invalid = await query('[', 'abc');
      assert(!invalid.status.startsWith('找到'));
      assert.equal(invalid.output, '');
      assert.equal(
        (await query('^abc$', 'abc')).output,
        'abc',
        'failure does not poison the next query',
      );
    } else {
      await chooseNativeTask(page, name === 'pinyin' ? 'native:hanzi-sound' : 'native:hanzi-idiom');
      const lookup = async (input) => {
        await page.locator('#hanzi-input').fill(input);
        await page.locator('#hanzi-run').click();
        await page.waitForFunction(() => !!document.getElementById('hanzi-output').value);
        return page.locator('#hanzi-output').inputValue();
      };
      if (name === 'phrases') {
        assert(
          (await lookup('?心?意')).includes('一心一意'),
          'a wildcard in the first position stays a character query',
        );
        const all = await lookup('????');
        const expected = await page.evaluate(() =>
          window.cnchar.idiom.dict.idiom.filter((word) => [...word].length === 4),
        );
        assert(expected.length > 1000);
        assert.deepEqual(
          all.split('\n'),
          expected,
          'all matches, including downloads and recording source, remain in the original output',
        );
        await chooseNativeTask(page, 'native:hanzi-xhy');
        assert.equal(
          await lookup('大'),
          await page.evaluate(() => window.cnchar.xhy('大', 'fuzzy').join('\n')),
        );
        console.log('PASS query-' + name);
        continue;
      }
      const all = await lookup('yong');
      for (const char of ['永', '用', '庸', '詠']) assert(all.includes(char));
      const third = await lookup('yong3');
      assert(third.includes('永') && !third.includes('用'));
      assert.equal(await lookup('yǒng'), third);
      assert.equal(
        await lookup('YO\u030cNG'),
        third,
        'decomposed Unicode tone marks normalize before lookup',
      );
      assert.equal(
        await lookup('yong0'),
        '未找到匹配结果。',
        'explicit neutral tone is not expanded to all tones',
      );
      const lv = await lookup('lv4');
      assert(lv.includes('绿'));
      assert.equal(await lookup('lü4'), lv);
      assert.equal(
        await lookup('lü'),
        await page.evaluate(() =>
          [...new Set(window.cnchar.spellToWord('lü', 'alltone'))].join(' '),
        ),
      );
    }
    console.log('PASS query-' + name);
  }
  assert.deepEqual(errors, []);
} finally {
  await browser?.close();
  await site.close();
}
