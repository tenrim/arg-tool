import {createRequire} from 'node:module';
import {readFile, mkdir} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import assert from 'node:assert/strict';
import {checkHelpPlacement} from './browser-help-placement.mjs';
const {chromium} = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
const screenshots = '/tmp/arg-ui-layout';
try {
  const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, reducedMotion: 'reduce'});
  const errors = [], external = [];
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'arg.test') {external.push(url.href); return route.abort();}
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
    try {
      await route.fulfill({body: await readFile(resolve('public', '.' + pathname)), contentType: ({'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.svg': 'image/svg+xml'})[extname(pathname)] || 'application/octet-stream'});
    } catch {errors.push('Missing ' + pathname); await route.abort();}
  });
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  await mkdir(screenshots, {recursive: true});
  await page.goto('https://arg.test/#crypto'); await page.waitForSelector('#ct-crypto[data-operation]');
  const go = async id => {
    await page.evaluate(id => {location.hash = id==='symbols'?'symbols?task=native:braille':id; scrollTo(0, 0);}, id);
    await page.waitForSelector('#panel-' + id + ':not([hidden])');
    if (['fragments', 'chess', 'life', 'model'].includes(id)) await page.waitForSelector(`#r4-${id} input`, {state: 'attached'});
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };
  const assertSearch = async selector => {
    await page.locator(selector + ' input').focus();
    const style = await page.locator(selector).evaluate(field => {
      const input = field.querySelector('input'), a = getComputedStyle(field), b = getComputedStyle(input);
      return {frame: a.outlineStyle, childFrame: b.outlineStyle, childShadow: b.boxShadow, childBorder: b.borderTopWidth, background: b.backgroundColor};
    });
    assert.equal(style.frame, 'solid', selector + ' has a visible shared focus frame');
    assert.equal(style.childFrame, 'none', selector + ' must not show a nested outline');
    assert.equal(style.childShadow, 'none'); assert.equal(style.childBorder, '0px');
    assert.equal(style.background, 'rgba(0, 0, 0, 0)', selector + ' does not retain an inner input card');
  };
  // Reproduce the reported form failure against EVERY official parameter schema,
  // without executing operations or changing the original worker/runtime.
  if(process.env.UI_LAYOUT_PART!=='workspace')for (const width of [320, 390, 800, 1440]) {
    await page.setViewportSize({width, height: 950}); await go('crypto');
    const audit = await page.evaluate(async () => {
      const ui = await import('/ui/index.js');
      const {getCatalogue} = await import('/chef-tools/catalog.js');
      const {renderParameters, defaults} = await import('/chef-tools/schema.js');
      const catalogue = await getCatalogue();
      const fields = ui.FormGrid({className: 'ct-parameters chef-args'});
      const area = ui.Box({className: 'ct-input-area', children: fields});
      const host = ui.Box({className: 'ct-tool', children: ui.SplitView({className: 'ct-work', children: area})});
      document.querySelector('#panel-crypto').append(host);
      let checks = 0, changes = 0; const failures = [];
      try {
        for (const [op, definition] of Object.entries(catalogue.operations)) {
          const step = {op, args: defaults(definition)};
          renderParameters(fields, definition, step, () => changes++);
          for (const field of fields.querySelectorAll('[data-arg]')) {
            if (!field.getClientRects().length) continue;
            const rect = field.getBoundingClientRect();
            for (const control of field.querySelectorAll('input,select,textarea')) {
              if (!control.getClientRects().length) continue;
              const r = control.getBoundingClientRect(); checks++;
              if (r.left < rect.left - 1 || r.right > rect.right + 1 || r.width < 19) failures.push([op, field.dataset.arg, 'clipped control']);
            }
            const checkbox = field.querySelector('input[type=checkbox]');
            if (checkbox) {
              const text = field.firstElementChild.getBoundingClientRect(), c = checkbox.getBoundingClientRect();
              if (getComputedStyle(field).flexDirection !== 'row' || rect.height < 44 || c.right > text.left || Math.abs(c.y + c.height / 2 - text.y - text.height / 2) > 2) failures.push([op, field.dataset.arg, 'checkbox label geometry']);
              if (field.htmlFor !== checkbox.id || !checkbox.id) failures.push([op, field.dataset.arg, 'label association']);
              const before = checkbox.checked, calls = changes;
              field.firstElementChild.click();
              if (checkbox.checked === before || changes !== calls + 1 || step.args[+field.dataset.arg] !== checkbox.checked) failures.push([op, field.dataset.arg, 'label click does not change recipe']);
            }
            if (field.classList.contains('chef-composite')) {
              if (field.tagName === 'LABEL' || field.getAttribute('role') !== 'group' || !document.getElementById(field.getAttribute('aria-labelledby'))) failures.push([op, field.dataset.arg, 'ambiguous compound label']);
              if ([...field.querySelectorAll('input,select')].some(control => !control.getAttribute('aria-label'))) failures.push([op, field.dataset.arg, 'unnamed compound control']);
            }
          }
        }
        return {operations: Object.keys(catalogue.operations).length, checks, failures};
      } finally {host.remove();}
    });
    assert.equal(audit.operations, 505); assert.deepEqual(audit.failures, [], `Parameter forms @${width}`);
    console.log(`PASS ${audit.operations} parameter schemas / ${audit.checks} controls @${width}px`);
  }
  await page.setViewportSize({width: 390, height: 844}); await go('crypto');
  await page.locator('#ct-crypto .ct-input').fill('Abc123');
  // Click the label instead of the tiny native checkbox; actual execution proves
  // the UI still changes CyberChef's arguments rather than only its appearance.
  await page.locator('#ct-crypto [data-arg="2"] span').click();
  await page.locator('#ct-crypto .ct-run').click();
  await page.waitForFunction(() => document.querySelector('#ct-crypto .ct-status').textContent.includes('处理完成'), null, {timeout: 45000});
  assert.equal(await page.locator('#ct-crypto .ct-output').inputValue(), 'Nop456');
  await page.screenshot({path: screenshots + '/crypto-mobile.png', fullPage: true});
  await go('encoding'); await page.waitForSelector('#ct-encoding .chef-composite');
  await page.locator('#ct-encoding .ct-input').fill('5Lit5paH'); await page.locator('#ct-encoding .ct-run').click();
  await page.waitForFunction(() => document.querySelector('#ct-encoding .ct-status').textContent.includes('处理完成'), null, {timeout: 45000});
  assert.equal(await page.locator('#ct-encoding .ct-output').inputValue(), '中文');
  await page.waitForFunction(() => document.querySelector('#ct-encoding .ct-output').style.height);
  assert.ok((await page.locator('#ct-encoding .ct-output').boundingBox()).height <= 170, 'A two-character result does not reserve a 300px editor');
  const resultBox=await page.locator('#ct-encoding .ct-result').boundingBox(),outputBox=await page.locator('#ct-encoding .ct-output').boundingBox();
  assert.ok(resultBox.height<=outputBox.height+6,'Ready Result must not retain a large empty minimum height around its short editor');
  await page.screenshot({path: screenshots + '/encoding-mobile.png', fullPage: true});
  for (const width of [320, 390, 800, 1440]) {
    await page.setViewportSize({width, height: 950}); await go('symbols');
    const geometry = await page.evaluate(() => {
      const dots = document.querySelector('#braille-dots'), result = document.querySelector('.symbol-result'), a = dots.getBoundingClientRect(), b = result.getBoundingClientRect();
      return {a: a.toJSON(), b: b.toJSON(), dots: [...dots.children].map(dot => dot.getBoundingClientRect().toJSON()), panel: document.querySelector('.symbol-compose').getBoundingClientRect().toJSON()};
    });
    assert.ok(geometry.a.right < geometry.b.left && Math.abs(geometry.a.y - geometry.b.y) < 20, `Balanced Braille input/result @${width}`);
    assert.ok(geometry.a.height <= 200 && geometry.b.height <= 200, 'No wrapped preview or oversized blank area');
    const d = geometry.dots; assert.equal(d.length, 6);
    for (let i = 0; i < 6; i += 2) {assert.ok(Math.abs(d[i].y - d[i + 1].y) < 1); assert.ok(d[i].x < d[i + 1].x); assert.ok(d[i].width >= 44 && d[i].height >= 44);}
    assert.ok(d[0].y < d[2].y && d[2].y < d[4].y, 'Two columns preserve standard 1/4, 2/5, 3/6 ordering');
  }
  await page.setViewportSize({width: 390, height: 844}); await go('symbols');
  await page.locator('#braille-dots button').first().click(); assert.equal(await page.locator('#braille-letter').textContent(), 'A');
  assert.equal(await page.locator('#braille-symbol').textContent(), '⠁');
  await page.screenshot({path: screenshots + '/symbols-mobile.png'});
  await page.locator('.workbench-menu').click(); await assertSearch('.rail-filter');
  await page.locator('.rail-directory-button').click();
  assert.equal(await page.locator('.directory-search input').evaluate(node => document.activeElement === node), false, 'Touch directory does not automatically open the keyboard');
  await assertSearch('.directory-search');
  await page.screenshot({path: screenshots + '/directory-mobile.png'});
  for (const [width, height] of [[320, 420], [390, 420], [844, 390]]) {
    await page.setViewportSize({width, height}); await page.waitForTimeout(80);
    const geometry = await page.locator('.tool-directory').evaluate(node => {
      const rect = node.getBoundingClientRect(), results = node.querySelector('.directory-results');
      results.scrollTop = results.scrollHeight;
      return {rect: rect.toJSON(), resultHeight: results.clientHeight, resultScroll: results.scrollTop, close: node.querySelector('[aria-label="关闭工具目录"]').getBoundingClientRect().toJSON(), scroll: node.scrollTop, width: innerWidth, height: innerHeight};
    });
    assert.ok(geometry.rect.top >= 0 && geometry.rect.bottom <= height + 1, 'Directory fits keyboard-sized viewport: ' + JSON.stringify({width,height,...geometry}));
    assert.ok(geometry.resultHeight >= 60 && geometry.resultScroll > 0 && geometry.scroll === 0, 'Results scroll independently of search and close controls');
    assert.ok(geometry.close.top >= 0 && geometry.close.bottom <= height, 'Close stays reachable after results scroll');
  }
  await page.setViewportSize({width: 390, height: 844});
  // Emulate the Android case where the keyboard changes ONLY visualViewport,
  // leaving the layout viewport and 100dvh unchanged. This is not a phone test.
  await page.evaluate(() => {
    Object.defineProperties(visualViewport, {height: {configurable: true, value: 360}, offsetTop: {configurable: true, value: 60}});
    visualViewport.dispatchEvent(new Event('resize')); visualViewport.dispatchEvent(new Event('scroll'));
  });
  // The controller schedules a frame; elapsed wall time does not guarantee
  // that Chromium has rendered it under load. Wait for its actual contract.
  await page.waitForFunction(() => {
    const style=document.querySelector('.tool-directory').style;
    return style.getPropertyValue('--ui-viewport-height')==='360px'&&style.getPropertyValue('--ui-viewport-top')==='60px';
  });
  const keyboard = await page.locator('.tool-directory').boundingBox();
  assert.ok(keyboard.y >= 60 && keyboard.y + keyboard.height <= 421, 'Dialog follows visual viewport height and pan offset: '+JSON.stringify({keyboard,metrics:await page.locator('.tool-directory').evaluate(n=>({height:innerHeight,vh:visualViewport.height,top:visualViewport.offsetTop,style:n.style.cssText,max:getComputedStyle(n).maxHeight}))}));
  await page.screenshot({path: screenshots + '/directory-keyboard.png'});
  await page.locator('[aria-label="关闭工具目录"]').click();
  assert.equal(await page.locator('.tool-directory').evaluate(node => node.style.getPropertyValue('--ui-viewport-height')), '', 'Close releases viewport state');
  await page.evaluate(() => {delete visualViewport.height; delete visualViewport.offsetTop;});
  await page.keyboard.press('Control+k');
  await page.setViewportSize({width: 390, height: 420}); await page.locator('.workspace-search input').fill('Base64'); await page.waitForTimeout(80);
  const searchBox = await page.locator('.workspace-search').boundingBox();
  assert.ok(searchBox.y >= 0 && searchBox.y + searchBox.height <= 420, 'Global search also fits the keyboard viewport');
  await page.keyboard.press('Escape'); await page.locator('.workspace-search').waitFor({state: 'hidden'});
  await go('cyberchef'); await page.locator('#chef-tabs [data-pane="operations"]').click(); await assertSearch('.search-field');
  const routes = await page.evaluate(async () => (await import('/navigation.js')).toolGroups.flatMap(group => group.items).map(([id]) => id).filter(id => !id.includes('/')));
  for (const width of [320, 390, 800, 1440]) {
    await page.setViewportSize({width, height: 950});
    for (const route of routes) {
      await go(route);
      const clipped = await page.evaluate(() => [...document.querySelectorAll('.panel:not([hidden]) input:not([type=file]),.panel:not([hidden]) select,.panel:not([hidden]) textarea')].filter(node => {
        if (!node.getClientRects().length) return false;
        const r = node.getBoundingClientRect();
        return r.left < -1 || r.right > innerWidth + 1;
      }).map(node => node.id || node.className));
      assert.deepEqual(clipped, [], `${route} clipped controls @${width}`);
    }
    console.log(`PASS ${routes.length} tool pages / control bounds @${width}px`);
  }
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  await page.setViewportSize({width:390,height:844});
  for (const route of ['crypto','encoding','symbols','astronomy','chemistry','sequence','calendar']) {
    await go(route);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route + ' enlarged text does not cause page overflow');
  }
  await page.evaluate(() => document.documentElement.style.fontSize = '');
  await page.setViewportSize({width:1440,height:950});
  await go('crypto'); await page.screenshot({path: screenshots + '/crypto-desktop.png', fullPage: true});
  await checkHelpPlacement(page,go);
  assert.deepEqual(errors, []); assert.deepEqual(external, []);
  console.log('PASS screenshot regressions: single search focus frame, 505 real schemas, label-driven ROT13/Base64 execution, balanced Braille, keyboard viewport and tool control bounds.');
} finally {await browser.close();}
