import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import assert from 'node:assert/strict';
const {chromium} = createRequire(new URL('../test-tools/package.json', import.meta.url))('playwright');
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '/usr/bin/chromium'), args:['--no-sandbox', '--disable-dev-shm-usage']});
const types = {'.js':'text/javascript', '.wasm':'application/wasm', '.json':'application/json', '.html':'text/html', '.css':'text/css', '.woff2':'font/woff2'};
try {
  for (const scenario of ['native', 'blob', 'blob-subpath']) {
    const prefix = scenario === 'blob-subpath' ? '/toolbox/' : '/', errors = [], external = [], missing = [];
    const context = await browser.newContext();
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.protocol === 'blob:') return route.continue();
      if (url.hostname !== 'arg.test') {external.push(url.href); return route.abort();}
      if (!url.pathname.startsWith(prefix)) {missing.push(url.pathname); return route.abort();}
      if (url.pathname.endsWith('/probe.html')) return route.fulfill({contentType:'text/html', body:'<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="./ui-theme.css"><link rel="stylesheet" href="./ui/components.css"><title>Alpertron engine contract</title><main id="main"></main>'});
      try {const path = resolve('public', url.pathname.slice(prefix.length)); await route.fulfill({body:await readFile(path), contentType:types[extname(path)] || 'application/octet-stream'});}
      catch {missing.push(url.pathname); await route.abort();}
    });
    await context.addInitScript(useBlob => {
      const NativeWorker = Worker; window.__liveAlpertronWorkers = 0;
      window.Worker = class extends NativeWorker {
        constructor(url, options) {
          const original = new URL(url, location.href), tracked = original.pathname.endsWith('/expansion/alpertron-worker.js');
          if (tracked && window.__blockAlpertronWorker) {window.__blockAlpertronWorker = false; throw new DOMException('Blocked test Worker', 'SecurityError');}
          const bootstrap = tracked && useBlob ? URL.createObjectURL(new Blob(['importScripts('+JSON.stringify(original.href)+');'], {type:'text/javascript'})) : null;
          super(bootstrap || url, options); this.tracked = tracked; this.bootstrap = bootstrap; this.stall = tracked && window.__stallAlpertronWorker;
          if (this.stall) window.__stallAlpertronWorker = false;
          if (tracked) window.__liveAlpertronWorkers++;
        }
        postMessage(...args) {if (!this.stall) super.postMessage(...args);}
        terminate() {super.terminate(); if (this.tracked) {window.__liveAlpertronWorkers--; this.tracked = false;} if (this.bootstrap) {URL.revokeObjectURL(this.bootstrap); this.bootstrap = null;}}
      };
    }, scenario !== 'native');
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto('https://arg.test'+prefix+'probe.html');
    const outputs = await page.evaluate(async () => {
      const {AlpertronClient} = await import('./expansion/alpertron-client.js');
      window.Client = AlpertronClient;
      const client = new AlpertronClient(); window.client = client; const results = {};
      results.integer = (await client.run({expression:'982451659877161571'})).text;
      results.retired = [];
      for (const calculator of ['gaussian','quadratic','discreteLog','quadraticMod','squares','cubes','twoSquaresPower','continuedFraction','polynomial']) {
        results.retired.push(await client.run({calculator,expression:'1234'}).then(()=>'WRONG SUCCESS',error=>error.message));
      }
      results.siqs = (await client.run({expression:'155138089136278053654321569148671',algorithm:'siqs'})).text;
      await client.run({expression:'65'}); results.divisors = (await client.divisors()).text;
      const first = await client.run({action:'evaluate',expression:'x=1;x=x+1;x<=1002;x'});
      results.paused = first.paused; results.batch = (await client.continue()).text;
      results.hasFirstChunk = results.batch.includes('1000'); results.hasSecondChunk = results.batch.includes('1002');
      results.error = await client.run({expression:'1/0'}).then(()=>'WRONG SUCCESS', error => error.name+': '+error.message);
      results.recovery = (await client.run({expression:'65'})).text;
      client.destroy(); return results;
    });
    assert.match(outputs.integer, /982451653.*1000000007.*ECM/s, scenario);
    assert.equal(outputs.retired.length,9);for(const error of outputs.retired)assert.match(error,/不支持的数论计算器/);
    assert.match(outputs.siqs, /2305843009213693951.*SIQS/s);
    assert.match(outputs.divisors, /Euler's totient: 48[\s\S]*65/);
    assert.equal(outputs.paused, true); assert.equal(outputs.hasFirstChunk, true); assert.equal(outputs.hasSecondChunk, true);
    assert.match(outputs.error, /AlpertronExpressionError: Division by zero/);
    assert.match(outputs.recovery, /65 = 5.*13/);
    // A missing/corrupt local WASM must reject and allow a fresh retry.
    const wasmUrl = 'https://arg.test'+prefix+'vendor/expansion/alpertron/integer.wasm';
    for (const response of [{status:503,body:'Unavailable'}, {status:200,body:'not a wasm module',contentType:'application/wasm'}]) {
      await context.route(wasmUrl, route => route.fulfill(response));
      const failure = await page.evaluate(async () => {window.client = new window.Client(); return window.client.run({expression:'65'}).then(()=>'WRONG SUCCESS', error => error.message);});
      assert.notEqual(failure, 'WRONG SUCCESS');
      await context.unroute(wasmUrl);
      assert.match(await page.evaluate(async () => {const result = await window.client.run({expression:'65'}); window.client.destroy(); return result.text;}), /65 = 5.*13/);
    }
    const lifecycle = await page.evaluate(async () => {
      const client = new window.Client(); window.client = client;
      const first = client.run({expression:'2^521-1'}).then(()=>'WRONG SUCCESS', error=>error.name);
      client.cancel(); const stopped = await first;
      window.__stallAlpertronWorker = true;
      const short = new window.Client({timeoutMs:40});
      const timed = await short.run({expression:'65'}).then(()=>'WRONG SUCCESS',error=>error.name);
      const recovered = (await short.run({expression:'65',timeoutMs:30000})).text; short.destroy();
      window.__blockAlpertronWorker = true;
      const blocked = await client.run({expression:'65'}).then(()=>'WRONG SUCCESS',error=>error.message);
      const afterBlocked = (await client.run({expression:'65'})).text; client.destroy();
      return {stopped,timed,recovered,blocked,afterBlocked,live:window.__liveAlpertronWorkers};
    });
    assert.equal(lifecycle.stopped, 'AbortError'); assert.equal(lifecycle.timed, 'TimeoutError');
    assert.match(lifecycle.recovered, /65 = 5.*13/); assert.match(lifecycle.blocked, /无法启动/);
    assert.match(lifecycle.afterBlocked, /65 = 5.*13/); assert.equal(lifecycle.live, 0);
    if (scenario === 'native') {
      await page.evaluate(async () => {
        const {mountAlpertron} = await import('./expansion/alpertron-view.js');
        const {connectNotebook} = await import('./handoff/button.js');
        window.views = mountAlpertron(document.querySelector('#main'));
        connectNotebook(request => {window.noteRequest=request; window.capturedNote=request.read(); window.noteIsCurrent=request.isCurrent();});
        window.showNumber = id => {for (const panel of window.views.panels) panel.hidden=panel.id!=='panel-number-'+id; document.dispatchEvent(new CustomEvent('arg:panelchange',{detail:{name:'number-'+id}}));};
        window.showNumber('integer');
      });
      const show = id => page.evaluate(id => window.showNumber(id), id);
      const run = async id => {
        await page.locator('#number-'+id+'-run').click();
        await page.waitForFunction(id => /本地计算完成|本批已完成/.test(document.querySelector('#number-'+id+'-status').textContent), id);
        return page.locator('#number-'+id+'-output').inputValue();
      };
      await page.locator('#number-integer-input').fill('65'); assert.match(await run('integer'), /65 = 5.*13/);
      await page.locator('#number-integer-divisors').click();
      await page.waitForFunction(() => document.querySelector('#number-integer-output').value.includes('List of divisors'));
      assert.match(await page.locator('#number-integer-output').inputValue(), /Euler's totient: 48[\s\S]*65/);
      await page.locator('#number-integer-notebook').click();
      assert.equal(await page.evaluate(() => window.noteIsCurrent), true);
      assert.match(await page.evaluate(() => window.capturedNote.text), /Euler's totient: 48/);
      await page.locator('#number-integer-input').fill('66');
      assert.equal(await page.locator('#number-integer-notebook').isDisabled(), true);
      assert.equal(await page.evaluate(() => window.noteRequest.isCurrent()), false);
      await page.locator('#number-integer-batch-file').setInputFiles({name:'numbers.txt',mimeType:'text/plain',buffer:Buffer.from('GCD(84,30)\nF(20)')});
      await page.waitForFunction(() => document.querySelector('#number-integer-input').value.includes('F(20)'));
      await page.locator('#number-integer-action').selectOption('evaluate');
      assert.match(await run('integer'), /6[\s\S]*6765/);
      await page.locator('#number-integer-input').fill('x=1;x=x+1;x<=1002;x'); await run('integer');
      assert.equal(await page.locator('#number-integer-continue').isVisible(), true);
      await page.locator('#number-integer-continue').click();
      await page.waitForFunction(() => document.querySelector('#number-integer-output').value.includes('1002'));
      assert.match(await page.locator('#number-integer-output').inputValue(), /1000[\s\S]*1001[\s\S]*1002/);
      assert.deepEqual(await page.locator('[id^="panel-number-"]').evaluateAll(nodes=>nodes.map(node=>node.id)),['panel-number-integer']);
      assert.equal(await page.locator('#number-integer-sum-squares').count(),0,'retired power-sum result shortcut is removed');
      await show('integer');
      await page.locator('#number-integer-input').fill(''); await page.locator('#number-integer-input').focus();
      await page.locator('#panel-number-integer > details > summary').click();
      await page.getByText('数论函数',{exact:true}).click();
      await page.getByRole('button',{name:'ModPow(',exact:true}).click();
      assert.equal(await page.locator('#number-integer-input').inputValue(), 'ModPow(,,)');
      assert.equal(await page.locator('#number-integer-notebook').isDisabled(), true);
      for (const reducedMotion of ['no-preference','reduce']) {
        await page.emulateMedia({reducedMotion});
        for (const width of [320,390,1440]) {
          await page.setViewportSize({width,height:900});
          for (const id of ['integer']) {await show(id); assert.ok(await page.evaluate(width => document.documentElement.scrollWidth<=width+1, width), id+' overflow '+width+' '+reducedMotion);}
        }
      }
      await page.evaluate(() => {document.querySelector('#main').replaceChildren();});
      await page.waitForFunction(() => window.__liveAlpertronWorkers === 0);
    }
    assert.deepEqual({errors, external, missing}, {errors:[],external:[],missing:[]});
    console.log(scenario+' PASS: real integer WASM, 9 retired calculator requests rejected, ECM/SIQS, full arithmetic and continuation reports, original math serialization, local resource failure/retry, cancel/timeout/Worker denial; no external requests.');
    await context.close();
  }
} finally {await browser.close();}
