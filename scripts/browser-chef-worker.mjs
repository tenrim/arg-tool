import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

// Exercise the unchanged engine with a real Worker, including hosted blob
// bootstraps whose location is not the original script's resource directory.
export async function checkChefWorker(browser) {
  for (const scenario of ['native', 'blob', 'blob-subpath']) {
    const prefix = scenario === 'blob-subpath' ? '/toolbox/' : '/';
    const context = await browser.newContext();
    const missing = [], external = [];
    try {
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.protocol === 'blob:') return route.continue();
        if (url.origin !== 'https://arg.test') { external.push(url.href); return route.abort(); }
        try {
          assert.ok(url.pathname.startsWith(prefix), 'resource escaped deployment directory: ' + url.pathname);
          const relative = url.pathname.slice(prefix.length) || 'index.html';
          if (relative === 'worker-check.html') return route.fulfill({body: '<!doctype html><title>Worker regression</title>', contentType: 'text/html'});
          const path = resolve('public', relative);
          await route.fulfill({body: await readFile(path), contentType: ({'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.png': 'image/png'})[extname(path)] || 'application/octet-stream'});
        } catch { missing.push(url.pathname); await route.abort(); }
      });
      if (scenario !== 'native') await context.addInitScript(() => {
        const NativeWorker = window.Worker;
        window.__chefBootstraps = 0;
        window.Worker = class extends NativeWorker {
          constructor(url, options) {
            const original = new URL(url, location.href);
            if (!original.pathname.endsWith('/cyberchef-worker.js')) { super(url, options); return; }
            const bootstrap = URL.createObjectURL(new Blob(['importScripts(' + JSON.stringify(original.href) + ');'], {type: 'text/javascript'}));
            super(bootstrap, options);
            this.bootstrap = bootstrap;
            window.__chefBootstraps++;
          }
          terminate() { super.terminate(); if (this.bootstrap) URL.revokeObjectURL(this.bootstrap); }
        };
      });
      const page = await context.newPage();
      await page.goto('https://arg.test' + prefix + 'worker-check.html');
      const result = await page.evaluate(async prefix => {
        const {CyberChefClient} = await import(prefix + 'cyberchef-client.js');
        const client = new CyberChefClient();
        try {
          const catalog = await fetch(prefix + 'vendor/cyberchef/catalogue.json').then(r => r.json());
          const args = name => catalog.operations[name].args.map(a => a.type === 'option' ? a.value[0] : a.value);
          const run = (input, name, values = args(name)) => client.bake(input, [{op: name, args: values}], {structured: true});
          const rot = await run('Hello ARG', 'ROT13');
          const md5 = await run('abc', 'MD5');
          const binary = await run(Uint8Array.of(0, 128, 255).buffer, 'To Hex');
          const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 16;
          const x = canvas.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 32, 16);
          const png = await new Promise(r => canvas.toBlob(r));
          const textArgs = args('Add Text To Image'); textArgs[0] = 'A'; textArgs[5] = 8;
          const image = await run(await png.arrayBuffer(), 'Add Text To Image', textArgs);
          const bitmap = await createImageBitmap(new Blob([image.bytes]));
          x.drawImage(bitmap, 0, 0); bitmap.close();
          const painted = x.getImageData(0, 0, 32, 16).data.some((v, i) => i % 4 !== 3 && v > 200);
          const decode = response => new TextDecoder().decode(response.bytes);
          return {rot: decode(rot), md5: decode(md5), binary: decode(binary), painted};
        } catch (error) { return {error: error.message}; }
        finally { client.close(); }
      }, prefix);
      assert.equal(result.error, undefined, scenario + ': ' + result.error);
      assert.equal(result.rot, 'Uryyb NET', scenario);
      assert.equal(result.md5.trim(), '900150983cd24fb0d6963f7d28e17f72', scenario);
      assert.equal(result.binary.trim(), '00 80 ff', scenario);
      assert.equal(result.painted, true, scenario + ' font asset');
      if (scenario !== 'native') assert.ok(await page.evaluate(() => window.__chefBootstraps) > 0);
      if (scenario === 'blob-subpath') {
        for (const [file, op, input] of [
          ['vendor/cyberchef/ChefWorker.js', 'ROT13', 'abc'],
          ['vendor/cyberchef/modules/Crypto.js', 'MD5', 'abc'],
          ['vendor/cyberchef/assets/fonts/Roboto72White.fnt', 'Add Text To Image', null]
        ]) {
          const url = 'https://arg.test' + prefix + file;
          await context.route(url, r => r.fulfill({status: 503, body: 'Unavailable', contentType: 'text/javascript'}));
          const execute = async () => page.evaluate(async ({prefix, op, input}) => {
            const {CyberChefClient} = await import(prefix + 'cyberchef-client.js');
            const client = new CyberChefClient();
            let failureDeadline;
            try {
              const catalog = await fetch(prefix + 'vendor/cyberchef/catalogue.json').then(r => r.json());
              const args = catalog.operations[op].args.map(a => a.type === 'option' ? a.value[0] : a.value);
              if (input === null) {
                const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 16;
                input = await (await new Promise(r => canvas.toBlob(r))).arrayBuffer();
                args[0] = 'A'; args[5] = 8;
              }
              const response = await Promise.race([
                client.bake(input, [{op, args}], {structured: true}),
                new Promise((_, reject) => { failureDeadline = setTimeout(() => reject(new Error('Resource failure was not propagated promptly')), 15000); })
              ]);
              return {bytes: response.bytes.length, value: op === 'Add Text To Image' ? '' : new TextDecoder().decode(response.bytes)};
            } catch (error) { return {error: error.message, closed: client.closed}; }
            finally { clearTimeout(failureDeadline); client.close(); }
          }, {prefix, op, input});
          const failed = await execute();
          assert.ok(failed.error, file + ' must reject');
          assert.match(failed.error, new RegExp(file.split('/').pop().replaceAll('.', '\\.')), file);
          assert.equal(failed.bytes, undefined, file + ' cannot report success');
          assert.equal(failed.closed, true, file + ' worker must terminate');
          await context.unroute(url);
          const recovered = await execute();
          assert.equal(recovered.error, undefined, file + ' fresh retry');
          assert.ok(recovered.bytes > 0);
          if (op === 'ROT13') assert.equal(recovered.value, 'nop');
          if (op === 'MD5') assert.equal(recovered.value, '900150983cd24fb0d6963f7d28e17f72');
          console.log('PASS: failed local resource and fresh retry: ' + file);
        }
        const cancelled = await page.evaluate(async prefix => {
          const {CyberChefClient} = await import(prefix + 'cyberchef-client.js');
          const client = new CyberChefClient();
          const pending = client.bake('abc', [{op: 'ROT13', args: [true, true, false, 13]}]);
          client.close(); client.close();
          try { await pending; return 'incorrect success'; } catch (error) { return error.message; }
        }, prefix);
        assert.equal(cancelled, '运算已停止');
      }
      // Verify the native task and the complete chain actually consume the
      // same fixed adapter, rather than only exercising a standalone client.
      await page.goto('https://arg.test' + prefix + '#encoding');
      const task = page.locator('#ct-encoding');
      await task.locator('.ct-input').fill('SGVsbG8gQVJH');
      await task.locator('.ct-run').click();
      await page.waitForFunction(() => /处理完成|错误|失败/.test(document.querySelector('#ct-encoding .ct-status')?.textContent || ''));
      assert.match(await task.locator('.ct-status').textContent(), /处理完成/, scenario + ' native task');
      assert.equal(await task.locator('.ct-output').inputValue(), 'Hello ARG');
      assert.equal(await task.locator('.ct-chain').count(),0);
      await page.evaluate(()=>location.hash='cyberchef');await page.waitForSelector('#panel-cyberchef:not([hidden])');
      await page.locator('#chef-import-recipe').setInputFiles({name:'decode.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify([{op:'From Base64',args:['A-Za-z0-9+/=',true,false]}]))});
      await page.waitForFunction(()=>document.querySelectorAll('#chef-recipe .chef-step').length===1);
      await page.locator('#chef-input').fill('SGVsbG8gQVJH');
      await page.locator('#chef-run').click();
      await page.waitForFunction(() => /处理完成|错误|失败/.test(document.getElementById('cyberchef-status')?.textContent || ''));
      assert.match(await page.locator('#cyberchef-status').textContent(), /处理完成/, scenario + ' complete chain');
      assert.equal(await page.locator('#chef-output').inputValue(), 'Hello ARG');
      assert.deepEqual({missing, external}, {missing: [], external: []}, scenario);
      console.log('PASS: CyberChef worker ' + scenario + ', real text/hash/binary/image/font output.');
    } finally { await context.close(); }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const {chromium} = createRequire(import.meta.url)('playwright');
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage']});
  try { await checkChefWorker(browser); } finally { await browser.close(); }
}
