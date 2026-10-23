import {createServer} from 'node:http';
import {readFile, mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve, extname, sep} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';

// This suite exercises only the newly integrated workflows and their named
// notebook/result/lifecycle bridges. It never starts unrelated tool engines.
const require = createRequire(new URL('../test-tools/package.json', import.meta.url));
const {chromium} = require('playwright');
const publicRoot = resolve('public');
const scratch = resolve('.tmp-expansion-tests/browser-expansion');
await mkdir(scratch, {recursive:true});
// The managed Windows host's default AppContainer temp ACL blocks downloads.
// Keep ephemeral browser artifacts in this explicit writable workspace scratch.
process.env.TEMP = scratch; process.env.TMP = scratch;
const shell = 'C:/Users/14299/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe';
const executablePath = process.env.CHROMIUM_PATH || (existsSync(shell) ? shell : '/usr/bin/chromium');
const failures = [], missing = [], external = [], visited = new Set();
const types = {'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.mjs':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json;charset=utf-8','.wasm':'application/wasm','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png','.wav':'audio/wav'};
const server = createServer(async (request, response) => {
  try {
    let path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (path.startsWith('/nested/')) path = path.slice('/nested'.length);
    if (path === '/') path = '/index.html';
    const file = resolve(publicRoot, '.' + path);
    if (!file.startsWith(publicRoot + sep)) throw Error('out of root');
    const bytes = await readFile(file);
    response.writeHead(200, {'Content-Type':types[extname(file)] || 'application/octet-stream','Cache-Control':'no-store'}); response.end(bytes);
  } catch { missing.push(request.url); response.writeHead(404); response.end('not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({executablePath, downloadsPath:scratch, args:['--no-sandbox','--disable-dev-shm-usage']});
let completed = 0;
const skip = process.env.EXPANSION_SKIP ? new RegExp(process.env.EXPANSION_SKIP) : null;
const stage = async (name, callback) => { if(skip?.test(name)) return; try { console.log('CHECK expansion: ' + name); await callback(); completed++; console.log('PASS expansion: ' + name); } catch (error) { throw new Error(`${name}: ${error.message}`, {cause:error}); } };

async function openTask(page, id, panel = id, direction) {
  const selected = await page.evaluate(async ({id, direction}) => {
    const base = new URL('./', document.baseURI);
    const [{loadRegistry,resolveCapability}, {capabilityRoute}] = await Promise.all([import(new URL('capabilities/registry.js', base)), import(new URL('capabilities/routes.js', base))]);
    // Topic members remain real variants, with one canonical discovery entry.
    // Use the same resolver as production so the exact member is retained.
    const {entry,direction:resolvedDirection} = resolveCapability(await loadRegistry(),'native:' + id,undefined,direction);
    if (!entry) throw Error(`真实登记缺少 native:${id}`);
    location.hash = capabilityRoute(entry, undefined, resolvedDirection);
    return {id:entry.id,variant:entry.variantId,direction:resolvedDirection};
  }, {id, direction});
  await page.locator('#panel-' + panel).waitFor({state:'visible'});
  await page.waitForFunction(selected => {
    const params = new URLSearchParams(location.hash.split('?')[1]);
    return params.get('task')===selected.id && (!selected.variant||params.get('view')===selected.variant)
      && (!selected.direction||params.get('dir')===selected.direction);
  }, selected);
  visited.add(id);
}
const input = (page, id) => page.locator('#' + id);
async function run(page, id, {keyboard = false} = {}) {
  if (keyboard) { await input(page, id + '-input').focus(); await page.keyboard.press('Control+Enter'); }
  else await input(page, id + '-run').click();
  await page.waitForFunction(id => {
    const button = document.getElementById(id + '-run'), status = document.getElementById(id + '-status');
    return button && !button.disabled && status?.textContent && !/正在|准备本地/.test(status.textContent);
  }, id, {timeout:45000});
  const text = await input(page, id + '-status').textContent();
  if (await input(page, id + '-status').getAttribute('data-state') === 'error') throw Error(text);
  return input(page, id + '-output').inputValue();
}
async function download(page, control) { const pending = page.waitForEvent('download'); await control.click(); const item = await pending; return readFile(await item.path()); }
async function runWords(page) {
  await input(page,'word-run').click();
  await page.waitForFunction(()=>{const status=document.getElementById('word-status')?.textContent;return status && !status.startsWith('正在');},undefined,{timeout:35000});
  const status=await input(page,'word-status').textContent();
  assert.match(status,/^找到/,'real dictionary Worker must finish successfully: '+status);
  return input(page,'word-output').inputValue();
}
async function noOverflow(page, description) {
  const bounds = await page.evaluate(() => ({body:document.body.scrollWidth, root:document.documentElement.scrollWidth, viewport:innerWidth}));
  assert.ok(bounds.body <= bounds.viewport + 2 && bounds.root <= bounds.viewport + 2, `${description}: ${JSON.stringify(bounds)}`);
}

try {
  for (const configuration of [{width:1440, height:1000, reducedMotion:'no-preference'}, {width:390,height:844,reducedMotion:'no-preference'}, {width:320,height:740,reducedMotion:'reduce'}]) {
    const context = await browser.newContext({viewport:{width:configuration.width,height:configuration.height}, reducedMotion:configuration.reducedMotion, hasTouch:configuration.width < 1100, acceptDownloads:true});
    const errors = [];
    await context.route('**/*', route => { const url = new URL(route.request().url()); if (url.origin !== origin && !['blob:','data:'].includes(url.protocol)) { external.push(url.href); return route.abort(); } return route.continue(); });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    const prefix = configuration.width === 320 ? '/nested/' : '/';
    await page.goto(origin + prefix + '#home');
    await page.locator('#panel-classical-playfair').waitFor({state:'attached',timeout:30000});
    assert.deepEqual(errors, [], 'application must start without hidden exceptions');

    await stage(`8 classical workspaces / ${configuration.width}px / ${configuration.reducedMotion}`, async () => {
      const cases = [
        {id:'playfair', value:'HIDETHEGOLDINTHETREESTUMP', fields:{squareKey:'PLAYFAIR EXAMPLE'}, expected:'BMODZBXDNABEKUDMUIXMMOUVIF', decoded:'HIDETHEGOLDINTHETREXESTUMP'},
        {id:'adfgx', value:'JIGSAW',fields:{key:'BALLOON'},decoded:'IIGSAW'},
        {id:'adfgvx',value:'HELLOWORLD',fields:{alphabet:'PH0QG64MEA1YL2NOFDXKR3CVS5ZW7BJ9UTI8',key:'GERMAN'},expected:'FVFDAGXAFFFFGFAGADFG',decoded:'HELLOWORLD'},
        {id:'trifid',value:'TRIFIDSAREFRACTIONATEDCIPHERS',fields:{squareKey:'EXTRAORDINARY',period:'10'},expected:'EYMXVUCRYYYYEAYVYOVVXITDPATHE',decoded:'TRIFIDSAREFRACTIONATEDCIPHERS'},
        {id:'autokey',value:'ATTACKATDAWN',fields:{key:'QUEENLY'},expected:'QNXEPVYTWTWP',decoded:'ATTACKATDAWN'},
        {id:'beaufort',value:'CEQUALSKMINUSP',fields:{key:'RECIPROCAL'},expected:'PAMOPGWSODEKKT',decoded:'CEQUALSKMINUSP'},
        {id:'columnar',value:'WEAREDISCOVEREDFLEEATONCE',fields:{key:'ZEBRAS'},expected:'EVLNACDTESEAROFODEECWIREE',decoded:'WEAREDISCOVEREDFLEEATONCE'},
        {id:'nihilist',value:'THEEARLYBIRD',fields:{squareKey:'SIMPLE',key:'EASY'},expected:'65 55 32 75 43 65 26 08 44 34 54 79',decoded:'THEEARLYBIRD'},
      ];
      for (const test of cases) {
        const id = 'classical-' + test.id;
        await openTask(page, id); await input(page, id + '-direction').selectOption('encrypt');
        for (const [key,value] of Object.entries(test.fields)) await input(page, id + '-' + key).fill(value);
        await input(page, id + '-input').fill(test.value);
        const cipher = await run(page, id, {keyboard: test.id === 'autokey'});
        if (test.expected) assert.equal(cipher, test.expected, test.id);
        await input(page, id + '-direction').selectOption('decrypt');
        assert.equal(await input(page, id + '-input').inputValue(), test.value, 'direction selection must never adopt output');
        assert.equal(await input(page, id + '-output').inputValue(), '', 'direction change invalidates output synchronously');
        await input(page, id + '-input').fill(cipher); assert.equal(await run(page, id), test.decoded, test.id + ' inverse');
        await noOverflow(page, id);
      }
    });

    await stage(`all six constraint entries and real structured solving / ${configuration.width}px`, async () => {
      for (const name of ['sudoku','magicSquare','mine','nonogram','drop','custom']) {
        await openTask(page, 'hunt-constraints-' + name, 'hunt-constraints');
        assert.equal(await input(page,'hunt-constraints-preset').inputValue(), name);
        assert.ok((await input(page,'hunt-constraints-input').inputValue()).length > 10);
      }
      await input(page,'hunt-constraints-rows').fill('2'); await input(page,'hunt-constraints-columns').fill('3');
      await input(page,'hunt-constraints-input').fill('每一格是黑格或白格\n第1行从左到右连续的黑格长度是[3]\n第2行从左到右连续的黑格长度是[0]\n每一列的黑格的数量是1');
      assert.match(await run(page,'hunt-constraints'), /唯一解/);
      assert.equal(await page.locator('#hunt-constraints-grid tbody td').count(), 6);
      const saved = JSON.parse((await download(page,input(page,'hunt-constraints-save'))).toString());
      assert.deepEqual(saved.first.cells, ['black','black','black','white','white','white']); assert.equal(saved.complete,true);
      await input(page,'hunt-constraints-rows').fill('1'); await input(page,'hunt-constraints-columns').fill('3'); await input(page,'hunt-constraints-max-solutions').fill('2');
      await input(page,'hunt-constraints-input').fill('每一格是从1到3的数字');
      assert.match(await run(page,'hunt-constraints'), /多个解/);
      assert.equal(await page.getByText('全部解的共同部分',{exact:true}).count(),0,'incomplete enumeration must not present common cells as certain');
      await page.locator('#hunt-constraints-details').getByRole('button',{name:'下一解',exact:true}).click();
      assert.match(await page.locator('#hunt-constraints-grid caption').textContent(), /第 2/);
      await noOverflow(page,'constraint grid');
    });

    await stage(`keyboard original mapping operations / ${configuration.width}px`, async () => {
      await openTask(page,'keyboard-ninekey','keyboard','encrypt');
      assert.equal(await input(page,'keyboard-mode').inputValue(),'ninekey');
      await input(page,'keyboard-input').fill('hello world');
      assert.equal(await run(page,'keyboard'),'42 32 53 53 63 / 91 63 73 53 31');
      await input(page,'keyboard-use').click(); await input(page,'keyboard-direction').selectOption('decrypt');
      assert.equal(await run(page,'keyboard'),'hello world');
      await input(page,'keyboard-table').selectOption('polybius'); await input(page,'keyboard-input').fill('24');
      assert.equal(await run(page,'keyboard'),'{i|j}');
      assert.equal(await input(page,'keyboard-table').locator('option').count(),12);
      await noOverflow(page,'keyboard mapping');
    });

    if (configuration.width === 1440) {
      await stage('module Worker blob boundary, resource failure and fresh retry', async () => {
        const job = payload => page.evaluate(async payload => {
          const script = new URL('expansion/worker.js', document.baseURI).href;
          const wrapper = URL.createObjectURL(new Blob([`import ${JSON.stringify(script)};`], {type:'text/javascript'}));
          const worker = new Worker(wrapper, {type:'module'});
          try { return await new Promise((resolve, reject) => {
            const timer = setTimeout(()=>reject(Error('Blob module Worker did not settle')),10000);
            worker.onmessage=event=>{if(event.data.kind==='progress')return;clearTimeout(timer);resolve(event.data);};
            worker.onerror=event=>{clearTimeout(timer);event.preventDefault();reject(Error(event.message));};
            worker.postMessage({...payload,resourceBase:new URL('./',document.baseURI).href});
          }); } finally {worker.terminate();URL.revokeObjectURL(wrapper);}
        }, payload);
        assert.equal((await job({task:'classical',cipher:'autokey',input:'ATTACKATDAWN',options:{key:'QUEENLY'}})).result.text,'QNXEPVYTWTWP');
        assert.equal((await job({task:'keyboard',mode:'ninekey',input:'21427494',options:{direction:'decrypt'}})).result.text,'ahsz');
        let failedOnce = false;
        const pattern = '**/vendor/expansion/hunt/english-standard.json';
        const handler = route => {if(!failedOnce){failedOnce=true;return route.abort('failed');}return route.continue();};
        await context.route(pattern,handler);
        try {
          const payload={task:'constraints',options:{rows:1,columns:1,rules:'每一格是1',dataset:'standard',maxSolutions:2}};
          const failed=await job(payload);assert.match(failed.error,/fetch|失败/i);
          const retried=await job(payload);assert.equal(retried.result.status,'unique');assert.deepEqual(retried.result.first.cells,[1]);
        } finally {await context.unroute(pattern,handler);}
      });

      await stage('dictionary SubstitutionSolver full lexicon, locked mapping and notebook persistence', async () => {
        await openTask(page,'dictionary-substitution');
        await input(page,'dictionary-substitution-input').fill('UIF DBU');
        await input(page,'dictionary-substitution-locked').fill('U=T\nI=H\nF=E\nD=C\nB=A');
        assert.match(await run(page,'dictionary-substitution'), /THE CAT/);
        assert.equal(await input(page,'dictionary-substitution-dataset').locator('option').count(),6);
        await input(page,'dictionary-substitution-notebook').click();
        await page.locator('#notebook-capture[open]').waitFor(); await input(page,'notebook-entry-title').fill('真实替换候选回归');
        await page.waitForFunction(() => !document.getElementById('notebook-capture-save').disabled);
        await input(page,'notebook-capture-save').click(); await page.waitForFunction(() => document.getElementById('notebook-capture-status').textContent.includes('已加入'));
        const note = await page.evaluate(async () => { const {createNotebookStore}=await import('./notebook/store.js'); const store=createNotebookStore(); const rows=await store.list(); await store.close(); const note=rows.find(row=>row.title==='真实替换候选回归'); return note?{...note,assets:note.assets.map(asset=>({...asset,bytes:[...asset.bytes]}))}:null; });
        assert.ok(note?.markdown.includes('THE CAT')); assert.ok(note.assets.length > 0);
        const text = new TextDecoder().decode(new Uint8Array(note.assets[0].bytes)); assert.ok(JSON.parse(text).candidates.some(candidate=>candidate.text==='THE CAT'));
        await page.locator('#notebook-capture').getByRole('button',{name:'关闭',exact:true}).click();
      });

      await stage('element real 118-element decomposition, word filter and editable input invalidation', async () => {
        await openTask(page,'element-spelling'); await input(page,'element-spelling-input').fill('bacon');
        assert.match(await run(page,'element-spelling'), /Ba|Ac/);
        const saved = JSON.parse((await download(page,input(page,'element-spelling-save'))).toString());
        assert.ok(BigInt(saved.total) >= 2n); assert.ok(saved.rows.every(row=>row.symbols.join('').toLowerCase()==='bacon'));
        await openTask(page,'element-words','element-spelling'); await input(page,'element-spelling-input').fill('bacon\nzzz\ncarbon');
        const words = await run(page,'element-spelling'); assert.match(words,/bacon/); assert.doesNotMatch(words,/\bzzz\b/);
        await input(page,'element-spelling-input').fill('new'); assert.equal(await input(page,'element-spelling-output').inputValue(),'');
      });

      await stage('stroke complete data and keyboard-accessible real endpoint matching', async () => {
        const data=JSON.parse(await readFile('public/vendor/expansion/hunt/stroke-endpoints.json','utf8'));
        const char=Object.keys(data).find(char=>data[char].length===1), code=data[char][0], head=Math.floor(code/1000000), tail=code%1000000;
        await openTask(page,'stroke-endpoints'); await input(page,'stroke-endpoints-input').fill(JSON.stringify([[Math.floor(head/1000),head%1000],[Math.floor(tail/1000),tail%1000]]));
        assert.ok((await run(page,'stroke-endpoints')).includes(char));
        const canvas=page.locator('#panel-stroke-endpoints canvas'); await canvas.focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter');
        assert.equal(await input(page,'stroke-endpoints-output').inputValue(),'','endpoint change must invalidate matching');
      });

      await stage('score real ABC engraving, MIDI and PCM WAV, with keyboard entry', async () => {
        await openTask(page,'score'); await input(page,'score-input').fill('C4:1 D4:0.5 R:0.5 G4:2');
        assert.match(await run(page,'score'), /C4,60/); await page.locator('#panel-score .expansion-score-notation svg').waitFor();
        const midi=await download(page,page.locator('#panel-score').getByRole('button',{name:'下载 MIDI',exact:true})); assert.equal(midi.subarray(0,4).toString(),'MThd'); assert.ok(midi.includes(Buffer.from('MTrk')));
        await page.locator('#panel-score').getByRole('button',{name:'生成试听',exact:true}).click(); await page.waitForFunction(()=>!Array.from(document.querySelectorAll('#panel-score button')).find(button=>button.textContent==='下载 WAV').disabled);
        const wav=await download(page,page.locator('#panel-score').getByRole('button',{name:'下载 WAV',exact:true})); assert.equal(wav.subarray(0,4).toString(),'RIFF'); assert.ok(wav.length>44); assert.ok(wav.subarray(44).some(value=>value!==0));
        await input(page,'score-staff').focus(); await page.keyboard.press('ArrowUp'); await page.keyboard.press('Enter'); assert.equal(await input(page,'score-output').inputValue(),'');
      });

      await stage('GGMorse real generated WAV and same-workspace recognition', async () => {
        await openTask(page,'morse-audio','morse','encode'); await input(page,'morse-input').fill('SOS SOS SOS'); await input(page,'morse-encode-frequency').fill('600');
        await run(page,'morse'); const wav=await download(page,input(page,'morse-save')); assert.equal(wav.subarray(0,4).toString(),'RIFF');
        await input(page,'morse-direction').selectOption('decode'); await input(page,'morse-frequency').fill('600'); await input(page,'morse-speed').fill('25');
        await input(page,'morse-file').setInputFiles({name:'local-morse.wav',mimeType:'audio/wav',buffer:wav});
        await page.waitForFunction(()=>document.getElementById('morse-source-info').textContent.includes('PCM'));
        const result=await run(page,'morse'); assert.match(result.replace(/\s/gu,''),/SOSSOS/); assert.ok(await page.locator('#morse-signal-plot').count());
      });

      await stage('Alpertron real local WASM factorization UI', async () => {
        await openTask(page,'number-integer'); await input(page,'number-integer-input').fill('10403');
        const output=await run(page,'number-integer'); assert.match(output,/101/); assert.match(output,/103/);
      });

      await stage('English six complete dictionaries, metadata filter, two-word and isolated QuickJS code', async () => {
        await openTask(page,'words-wildcard','words');
        const counts=JSON.parse(await readFile('public/vendor/expansion/hunt/DATASETS.json','utf8'));
        for(const dataset of ['standard','large','raw','alternate','twl06','idioms']) {
          const records=JSON.parse(await readFile(`public/vendor/expansion/hunt/english-${dataset}.json`,'utf8'));
          assert.equal(records.length,counts.english[dataset].records);
          const word=records.find(entry=>/^[a-z]{3,12}$/.test(entry.word))?.word || records[0].word;
          await input(page,'word-dictionary').selectOption(dataset); await input(page,'word-query').fill(word); await input(page,'word-custom').fill('');
          assert.ok((await runWords(page)).split('\n').includes(word),dataset+' includes actual source record '+word);
        }
        const standard=JSON.parse(await readFile('public/vendor/expansion/hunt/english-standard.json','utf8'));
        const noun=standard.find(entry=>/^[a-z]{4,10}$/.test(entry.word)&&(entry.flags&1)&&!(entry.flags&2));
        await input(page,'word-dictionary').selectOption('standard'); await input(page,'word-filter').selectOption('1'); await input(page,'word-query').fill(noun.word);
        assert.ok((await runWords(page)).split('\n').includes(noun.word));
        await input(page,'word-filter').selectOption('2'); assert.ok(!(await runWords(page)).split('\n').includes(noun.word));
        await input(page,'word-filter').selectOption('31'); await input(page,'word-custom').fill('cat\ndog'); await input(page,'word-query').fill('######'); await input(page,'word-two').check();
        assert.ok((await runWords(page)).includes('cat dog'));
        await openTask(page,'words-code','words'); await input(page,'word-code').fill("word => word === 'cat' && (typeof fetch + ':' + word)");
        assert.match(await runWords(page),/undefined:cat/);
        await input(page,'word-code').fill('word => { while (true) {} }'); await input(page,'word-run').click();
        await input(page,'word-code').fill("word => word === 'dog' && word"); assert.equal(await runWords(page),'dog');
        await openTask(page,'words-chinese','words'); await input(page,'chinese-dictionary').selectOption('idioms'); await input(page,'chinese-query').fill('一心一意');
        assert.ok((await runWords(page)).split('\n').includes('一心一意'));
      });
    }

    await stage(`task cancellation, focus and viewport bounds / ${configuration.width}px`, async () => {
      await openTask(page,'hunt-constraints-custom','hunt-constraints'); await input(page,'hunt-constraints-rows').fill('9'); await input(page,'hunt-constraints-columns').fill('9');
      await input(page,'hunt-constraints-input').fill('每一格是从1到9的数字\n每一行互不相同\n每一列互不相同');
      await page.evaluate(()=>{document.getElementById('hunt-constraints-run').click();document.getElementById('hunt-constraints-stop').click();});
      assert.equal(await input(page,'hunt-constraints-output').inputValue(),''); assert.equal(await input(page,'hunt-constraints-run').isEnabled(),true);
      await openTask(page,'keyboard-qwerty','keyboard','encrypt'); await input(page,'keyboard-input').fill('abc'); await input(page,'keyboard-input').focus();
      assert.equal(await run(page,'keyboard',{keyboard:true}),'qwe'); await input(page,'keyboard-input').fill('abcd'); assert.equal(await input(page,'keyboard-output').inputValue(),'');
      await noOverflow(page,'keyboard final');
      assert.equal((await context.pages()).length,1,'no extra tool windows');
      assert.deepEqual(errors,[], 'no uncaught application errors');
    });
    await context.close();
  }
  assert.deepEqual(external,[], 'all computation/data/resources stay local');
  assert.deepEqual(missing.filter(path=>!path.includes('favicon')),[], 'no missing runtime files');
  console.log(`PASS expansion browser: ${completed} scoped workflow groups; ${visited.size} registered tasks exercised; ${skip ? 'selected groups only; earlier passing groups intentionally skipped' : 'PC / 390 / 320; normal / reduced; local real engines, notebook and cancellation'}.`);
} catch(error) { failures.push(error.message); throw error; }
finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
