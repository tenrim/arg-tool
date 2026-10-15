import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {appPages} from './browser-host.mjs';

const {chromium} = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage']});
const types = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.wasm':'application/wasm','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const hexRoute = 'file?task=native%3Ahex-editor';
const sample = Buffer.concat([Buffer.from([0,65,255,32,52,18,0,0]), Buffer.from('ARG_ARG_中\r\n\0')]);
const privateName = 'MIST_SECRET_HEX_19.bin';

try {
  for (const scenario of ['native', 'blob', 'blob-subpath']) {
    const prefix = scenario === 'blob-subpath' ? '/toolbox/' : '/', errors = [], missing = [], external = [], writes = [];
    const context = await browser.newContext({viewport: {width:1280,height:950}, hasTouch:true});
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (url.protocol === 'blob:') return route.continue();
      if (request.method() !== 'GET') writes.push(url.href);
      if (url.hostname !== 'arg.test') {external.push(url.href); return route.abort();}
      try {
        assert.ok(url.pathname.startsWith(prefix), 'resource escaped the static deployment prefix');
        const path = resolve('public', url.pathname.slice(prefix.length) || 'index.html');
        await route.fulfill({body: await readFile(path), contentType:types[extname(path)] || 'application/octet-stream'});
      } catch {missing.push(url.pathname); await route.abort();}
    });
    await context.addInitScript(useBlob => {
      const Native = Worker;
      window.__hexLive = new Set(); window.__hexWorkers = 0; window.__hexPersistentWrites = []; window.__hexDatabaseOpens = [];
      const setItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key,value) {window.__hexPersistentWrites.push([String(key),String(value)]); return setItem.call(this,key,value);};
      const open = IDBFactory.prototype.open;
      IDBFactory.prototype.open = function(name,...args) {window.__hexDatabaseOpens.push(String(name)); return open.call(this,name,...args);};
      document.addEventListener('change',event=>{if(event.target?.id==='file-input' && event.target.files?.[0]) window.__hexSelectedSource=event.target.files[0];},true);
      window.Worker = class extends Native {
        constructor(url,options) {
          const original = new URL(url,location.href), tracked = /\/hex\/.*worker\.js$/.test(original.pathname);
          if (tracked && window.__hexRejectWorker) {window.__hexRejectWorker=false; throw new DOMException('Worker disabled by test','SecurityError');}
          let bootstrap;
          if (tracked && useBlob) bootstrap = URL.createObjectURL(new Blob([options?.type === 'module' ? 'import '+JSON.stringify(original.href)+';' : 'importScripts('+JSON.stringify(original.href)+');'],{type:'text/javascript'}));
          super(bootstrap || url,options); this.__hexTracked=tracked; this.__hexBootstrap=bootstrap;
          this.__hexStall=tracked && window.__hexStallWorker;
          if (this.__hexStall) window.__hexStallWorker=false;
          if (tracked) {this.__hexID=++window.__hexWorkers; window.__hexLive.add(this.__hexID);}
        }
        postMessage(...args) {if (!this.__hexStall) super.postMessage(...args);}
        terminate() {super.terminate(); if (this.__hexTracked) {window.__hexLive.delete(this.__hexID); this.__hexTracked=false;} if (this.__hexBootstrap) {URL.revokeObjectURL(this.__hexBootstrap); this.__hexBootstrap=null;}}
      };
    }, scenario !== 'native');
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto('https://arg.test'+prefix+'#'+hexRoute);
    await page.waitForSelector('#hex-editor:not([hidden])');
    const go = async route => {await page.evaluate(route => location.hash=route,route); await page.waitForSelector('#panel-'+route.split(/[/?]/)[0]+':not([hidden])');};
    const value = id => page.locator('#'+id).evaluate(node => 'value' in node ? node.value : node.textContent);
    const selected = () => page.locator('#hex-grid [data-byte-view="hex"][data-cursor="true"]').evaluate(node => Number(node.dataset.offset));
    const jump = async offset => {await page.locator('#hex-jump-value').fill(String(offset)); await page.locator('#hex-jump').click(); assert.equal(await selected(),Number(offset));};
    const load = async bytes => {await page.locator('#file-input').setInputFiles({name:privateName,mimeType:'application/octet-stream',buffer:bytes}); await page.waitForFunction(() => !document.querySelector('#hex-download').disabled && document.querySelector('#hex-grid [data-byte-view="hex"]'));};
    const download = async expected => {const ready=page.waitForEvent('download'); await page.locator('#hex-download').click(); const saved=await ready; assert.deepEqual(await readFile(await saved.path()),expected,'download contains the exact edited bytes, including NUL, invalid UTF-8 and CRLF');};
    const search = async (mode,pattern,direction='next') => {await page.locator('#hex-search-mode').selectOption(mode); await page.locator('#hex-search-value').fill(pattern); await page.locator('#hex-search-'+direction).click(); await page.waitForFunction(() => document.querySelector('#hex-search-stop').disabled); assert.equal(await page.locator('#hex-search-status').evaluate(node=>node.classList.contains('error')),false,await value('hex-search-status'));};

    if (scenario==='native') {
      const destroyed=await page.evaluate(async()=>{
        const {ByteGrid,byteGridController}=await import(new URL('./ui/index.js',location.href));
        let changes=0;const probe=ByteGrid({id:'hex-destroy-probe',onSelectionChange:()=>changes++});document.body.append(probe);
        const controller=byteGridController(probe);controller.setData({length:1024,read:(offset,length)=>new Uint8Array(length)});controller.select(1);
        const before={changes,selection:controller.selection};controller.destroy();controller.destroy();
        probe.querySelector('#hex-destroy-probe-next').click();controller.select(100,{focus:true});controller.setData({length:2,read:(offset,length)=>new Uint8Array(length)});controller.refresh();
        const after={changes,selection:controller.selection};probe.remove();return{before,after};
      });
      assert.deepEqual(destroyed.after,destroyed.before,'destroyed shared byte grids are inert even while their controls remain mounted');
    }
    assert.equal(await page.locator('#hex-download').isDisabled(),true,'empty editor cannot export a fabricated file');
    await load(sample); await download(sample);
    await jump(1); await page.locator('#hex-edit-value').fill('5a'); await page.locator('#hex-write').click();
    const edited=Buffer.from(sample); edited[1]=0x5a; await download(edited);
    assert.deepEqual(await page.evaluate(async()=>Array.from(new Uint8Array(await window.__hexSelectedSource.arrayBuffer()))),[...sample],'editing never overwrites the original selected File');
    if (scenario==='native') {
      await go('file?task=native%3Afile');await page.locator('#file-hash').click();await page.waitForFunction(()=>document.querySelector('#file-status').textContent==='摘要计算完成');
      assert.equal(await value('file-output'),'SHA-256\n'+createHash('sha256').update(sample).digest('hex'),'file analysis still reads original bytes before explicit edited-material adoption');
      await go(hexRoute);await page.waitForSelector('#hex-editor:not([hidden])');await download(edited);
    }
    await page.locator('#hex-undo').click(); await download(sample);
    await page.locator('#hex-redo').click(); await download(edited);
    await page.locator('#hex-undo').click();

    await jump(1); await page.locator('#hex-edit-value').fill('aa bb'); await page.locator('#hex-insert').click();
    await download(Buffer.concat([sample.subarray(0,1),Buffer.from([0xaa,0xbb]),sample.subarray(1)]));
    await page.locator('#hex-undo').click(); await download(sample);
    await jump(1); await page.locator('#hex-delete').click(); await download(Buffer.concat([sample.subarray(0,1),sample.subarray(2)]));
    await page.locator('#hex-undo').click(); await download(sample);
    await page.locator('#hex-edit-value').fill('gg'); await page.locator('#hex-write').click();
    assert.match(await value('hex-status'),/十六进制|格式|字节/); await download(sample);
    await page.locator('#hex-selection-length').fill('999');assert.equal(await page.locator('#hex-selection-length').inputValue(),'999');assert.equal(await page.locator('#hex-selection-length').getAttribute('aria-invalid'),'true');
    for (const id of ['hex-write','hex-insert','hex-delete','hex-copy']) assert.equal(await page.locator('#'+id).isDisabled(),true,'invalid selection cannot apply an old valid range: '+id);
    await jump(1);await page.locator('#hex-jump-value').fill('-1');await page.locator('#hex-jump').click();assert.equal(await page.locator('#hex-jump-value').getAttribute('aria-invalid'),'true');assert.equal(await page.locator('#hex-write').isDisabled(),true,'invalid offset disables editing until a real offset is selected');

    await jump(4); await page.locator('#hex-endian').selectOption('little');
    assert.match(await value('hex-inspector'),/Uint16[\s\S]*4660/,'little endian interpretation uses actual selected bytes');
    await page.locator('#hex-endian').selectOption('big'); assert.match(await value('hex-inspector'),/Uint16[\s\S]*13330/);
    await jump(1); await page.locator('#hex-grid [role=grid]').focus(); await page.keyboard.press('ArrowRight');
    assert.equal(await selected(),2); assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('role')),'grid','single grid keyboard focus survives byte selection redraw');
    await jump(1);
    await page.evaluate(()=>{
      const button=document.querySelector('#hex-copy'); window.__hexOriginalCopy=button.onclick; window.__hexOriginalClipboard=navigator.clipboard.writeText;
      navigator.clipboard.writeText=text=>{window.__hexCopied=text;return new Promise(resolve=>{window.__hexFinishCopy=resolve;});};
      button.onclick=function(event){return window.__hexCopyTask=window.__hexOriginalCopy.call(this,event);};
    });
    await page.locator('#hex-copy').click(); await page.waitForFunction(()=>typeof window.__hexFinishCopy==='function');
    assert.equal(await page.evaluate(()=>window.__hexCopied),'41','copy uses actual selected raw bytes');
    await page.locator('#hex-edit-value').fill('invalid'); await page.locator('#hex-write').click();
    const latestStatus=await value('hex-status'); assert.match(latestStatus,/十六进制|字节|格式/);
    await page.evaluate(async()=>{
      window.__hexFinishCopy(); await window.__hexCopyTask;
      navigator.clipboard.writeText=window.__hexOriginalClipboard; document.querySelector('#hex-copy').onclick=window.__hexOriginalCopy;
      delete window.__hexFinishCopy;delete window.__hexCopyTask;delete window.__hexOriginalCopy;delete window.__hexOriginalClipboard;
    });
    assert.equal(await value('hex-status'),latestStatus,'a delayed old copy cannot overwrite a newer invalid edit status');
    await jump(0); await search('text','ARG'); assert.equal(await selected(),8);
    await page.locator('#hex-search-next').click(); await page.waitForFunction(()=>document.querySelector('#hex-search-stop').disabled); assert.equal(await selected(),12);
    await page.locator('#hex-search-prev').click(); await page.waitForFunction(()=>document.querySelector('#hex-search-stop').disabled); assert.equal(await selected(),8);
    await jump(0); await search('hex','34 12'); assert.equal(await selected(),4);
    await jump(0); await search('text','中'); assert.equal(await selected(),16,'text search matches UTF-8 bytes without corrupting binary data');
    assert.equal(await page.evaluate(()=>window.__hexLive.size),0,'successful searches terminate their worker');

    // Leaving the task, changing the pattern and explicit stopping are synchronous
    // ownership changes. A stalled worker makes these race windows deterministic.
    await page.evaluate(()=>window.__hexStallWorker=true); await page.locator('#hex-search-value').fill('ARG'); await page.locator('#hex-search-next').click();
    await page.waitForFunction(()=>window.__hexLive.size===1); await page.locator('#hex-search-value').fill('new pattern');
    assert.equal(await page.evaluate(()=>window.__hexLive.size),0,'pattern edits cancel before a stale search can select a byte');
    await page.evaluate(()=>window.__hexStallWorker=true); await page.locator('#hex-search-next').click(); await page.waitForFunction(()=>window.__hexLive.size===1);
    await page.locator('#hex-search-stop').click(); assert.equal(await page.evaluate(()=>window.__hexLive.size),0);
    await page.evaluate(()=>window.__hexStallWorker=true); await page.locator('#hex-search-next').click(); await page.waitForFunction(()=>window.__hexLive.size===1);
    await go('home'); assert.equal(await page.evaluate(()=>window.__hexLive.size),0,'task leave cancels before animation');
    await go(hexRoute); await page.waitForSelector('#hex-editor:not([hidden])'); await download(sample);

    if (scenario === 'native') {
      await jump(1); await page.locator('#hex-edit-value').fill('5a'); await page.locator('#hex-write').click();
      await page.evaluate(()=>{
        // The same synchronous turn replaces the source after use was clicked,
        // before its queued bridge callback can claim the newer file selection.
        document.querySelector('#hex-use').click();
        const transfer=new DataTransfer();transfer.items.add(new File([new Uint8Array([77,73,83,84])],'replacement.bin',{type:'application/octet-stream'}));
        const input=document.querySelector('#file-input');input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
      });
      await page.waitForFunction(()=>document.querySelector('#file-status').textContent==='文件已载入');
      assert.match(await value('file-output'),/replacement\.bin/,'a queued old edited-file bridge cannot replace a newer source selection');
      await download(Buffer.from('MIST')); await load(sample);
      await page.evaluate(()=>window.__hexRejectWorker=true); await page.locator('#hex-search-value').fill('ARG'); await page.locator('#hex-search-next').click();
      await page.waitForSelector('#hex-search-status.error'); assert.equal(await page.locator('#hex-search-stop').isDisabled(),true);
      await jump(0); await search('text','ARG'); assert.equal(await selected(),8,'a fresh search recovers after Worker creation failure');
      await page.locator('#hex-search-value').fill('a'.repeat(1024*1024+1));await page.locator('#hex-search-next').click();
      await page.waitForSelector('#hex-search-status.error');assert.match(await value('hex-search-status'),/1\s*MB|上限|最多/);
      assert.equal(await page.evaluate(()=>window.__hexLive.size),0,'oversize search patterns are rejected before Worker allocation');
      const max=Buffer.alloc(32*1024*1024); max.set([0xde,0xad,0xbe,0xef],max.length-4);
      await load(max); await jump(0); await search('hex','de ad be ef'); assert.equal(await selected(),max.length-4);
      assert.ok(await page.locator('#hex-grid [data-byte-view="hex"]').count()<=512,'large files render bounded byte rows');
      await download(max);
      await page.locator('#file-input').setInputFiles({name:'oversized.bin',mimeType:'application/octet-stream',buffer:Buffer.alloc(max.length+1)});
      await page.waitForSelector('#file-status.error'); assert.match(await value('file-status'),/32\s*MB/); assert.equal(await page.locator('#hex-download').isDisabled(),true,'oversize selection invalidates the old editor immediately');
      await page.locator('#file-input').setInputFiles({name:'empty.bin',mimeType:'application/octet-stream',buffer:Buffer.alloc(0)});await page.waitForFunction(()=>!document.querySelector('#hex-download').disabled);
      await download(Buffer.alloc(0));assert.equal(await page.locator('#hex-write').isDisabled(),true);assert.equal(await page.locator('#hex-insert').isEnabled(),true);
      await page.locator('#hex-edit-value').fill('41 00 ff');await page.locator('#hex-insert').click();await download(Buffer.from([0x41,0,0xff]));await page.locator('#hex-undo').click();await download(Buffer.alloc(0));
      await load(sample); await jump(1); await page.locator('#hex-edit-value').fill('5a'); await page.locator('#hex-write').click();
      await page.evaluate(()=>{
        const replaceOnEntry=event=>{
          if(event.detail?.name!=='file') return;
          document.removeEventListener('arg:panelchange',replaceOnEntry);
          const transfer=new DataTransfer();transfer.items.add(new File([new Uint8Array([78,69,87])],'transition.bin',{type:'application/octet-stream'}));
          const input=document.querySelector('#file-input');input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
        };
        document.addEventListener('arg:panelchange',replaceOnEntry);
      });
      await page.locator('#hex-use').click();await page.waitForFunction(()=>document.querySelector('#file-status').textContent==='文件已载入' && document.querySelector('#file-output').value.includes('transition.bin'));
      await page.locator('#file-hash').click();await page.waitForFunction(()=>document.querySelector('#file-status').textContent==='摘要计算完成');assert.equal(await value('file-output'),'SHA-256\n'+createHash('sha256').update('NEW').digest('hex'),'new source selected during destination entry wins over the older edited-file handoff');
      await go(hexRoute);await page.waitForSelector('#hex-editor:not([hidden])');await load(sample);await jump(1);await page.locator('#hex-edit-value').fill('5a');await page.locator('#hex-write').click();
      await page.locator('#hex-use').click();await page.waitForFunction(()=>new URLSearchParams(location.hash.split('?')[1]).get('task')==='native:file' && document.querySelector('#file-mode-analysis').getAttribute('aria-selected')==='true' && document.querySelector('#file-output').value.includes('5a'));
      assert.deepEqual(await page.evaluate(async()=>Array.from(new Uint8Array(await window.__hexSelectedSource.arrayBuffer()))),[...sample],'explicit edited analysis material still leaves the selected source File intact');
      await page.locator('#file-hash').click();await page.waitForFunction(()=>document.querySelector('#file-status').textContent==='摘要计算完成');assert.equal(await value('file-output'),'SHA-256\n'+createHash('sha256').update(edited).digest('hex'),'explicit adoption sends exact edited bytes to the real file analysis model');
      await go(hexRoute); await page.waitForSelector('#hex-editor:not([hidden])');
    }

    // Fixed knowledge is useful immediately, searchable in Chinese and precise
    // identifiers, and linked to real existing workspaces in the same document.
    await go('it-reference'); await page.waitForSelector('#it-kind-ports');
    const kind = async name => {await page.locator('#it-kind-'+name).click(); await page.waitForFunction(name=>document.querySelector('#it-kind-'+name).getAttribute('aria-selected')==='true',name); await page.waitForFunction(()=>document.querySelector('#it-results [data-it-record]') || document.querySelector('#it-status').classList.contains('error')); assert.equal(await page.locator('#it-status').evaluate(node=>node.classList.contains('error')),false,await value('it-status'));};
    const query = async text => {await page.locator('#it-query').fill(text); await page.waitForFunction(()=>document.querySelector('#it-results [data-it-record]') || document.querySelector('#it-status').classList.contains('error'));};
    const detail = async expression => {const result=page.locator('#it-results [data-it-record]').filter({hasText:expression}).first(); await result.click(); await page.waitForSelector('#it-detail [data-it-detail]'); return page.locator('#it-detail').textContent();};
    await kind('ports'); await query('80'); assert.match(await detail(/http/i),/80[\s\S]*HTTP|HTTP[\s\S]*80/i);
    if (scenario==='native') {
      const resource='https://arg.test'+prefix+'vendor/it-reference/http.json';
      await context.route(resource,route=>route.fulfill({status:503,body:'Unavailable'}),{times:1});
      await page.locator('#it-kind-http').click();await page.waitForSelector('#it-status.error');
      assert.equal(await page.locator('#it-detail [data-it-detail]').count(),0,'failed catalogue load cannot display a previous category record');
      assert.equal(await page.locator('#it-retry').isVisible(),true);await page.locator('#it-retry').click();
      await page.waitForSelector('#it-results [data-it-record]');assert.equal(await page.locator('#it-status').evaluate(node=>node.classList.contains('error')),false,'failed fixed-data loads can be retried');
    }
    await kind('http'); await query('404'); assert.match(await detail(/404/),/Not Found|未找到|不存在/);
    await kind('formats'); await query('application/json'); assert.match(await detail(/json/i),/application\/json/);
    await query('utf-8'); assert.match(await detail(/utf-8/i),/UTF-8/i);
    await kind('domains'); await page.locator('#it-domain-input').fill('https://a.b.example.co.uk/path'); await page.locator('#it-domain-run').click();
    await page.waitForFunction(()=>document.querySelector('#it-domain-result').textContent.includes('example.co.uk'));
    assert.match(await value('it-domain-result'),/co\.uk/,'registrable domain respects a multi-label public suffix');
    await page.locator('#it-domain-input').fill('https://例子.公司.cn/路径'); await page.locator('#it-domain-run').click();
    await page.waitForFunction(()=>document.querySelector('#it-domain-result').textContent.includes('xn--') || document.querySelector('#it-domain-result').textContent.includes('例子'));
    await page.locator('#it-domain-input').fill('https://用户:密码@example.co.uk/path'); await page.locator('#it-domain-run').click();
    await page.waitForSelector('#it-domain-status.error');assert.equal(await value('it-domain-result'),'','URLs with credentials cannot leave an old domain result');
    if (scenario==='native') {
      const resource='https://arg.test'+prefix+'vendor/it-reference/rfc.json';let release,resolvePending;
      const pending=new Promise(resolve=>{resolvePending=resolve;});
      await context.route(resource,async route=>{resolvePending();await new Promise(resolveRelease=>{release=resolveRelease;});await route.fulfill({body:await readFile(resolve('public/vendor/it-reference/rfc.json')),contentType:'application/json'});});
      await page.locator('#it-kind-rfc').click();await pending;await kind('formats');await query('application/json');await detail(/json/i);
      const current=await value('it-detail');release();
      // Await the actual shared loader promise rather than a timing delay; the
      // abandoned page callback has now had the same real response available.
      await page.evaluate(async()=>{const model=await import(new URL('./it-reference/model.js',location.href));await model.loadITData('rfc');});
      assert.equal(await page.locator('#it-kind-formats').getAttribute('aria-selected'),'true');assert.equal(await value('it-detail'),current,'a delayed old catalogue cannot replace a newer selected record');
      await context.unroute(resource);
    }
    await kind('rfc'); await query('9110'); const rfc9110=await detail(/9110/);
    assert.match(rfc9110,/HTTP Semantics|HTTP\s*语义|HTTP语义/i);assert.match(rfc9110,/互联网标准/);assert.match(rfc9110,/RFC7231/);assert.match(rfc9110,/RFC3864/,'RFC continuation lines preserve actual status and replacement/update relationships');
    await query('7231');assert.match(await detail(/7231/),/RFC9110/,'obsolete predecessor identifies its actual replacement');
    await kind('instructions'); await query('xor'); assert.match(await detail(/xor/i),/异或|XOR/i);
    assert.ok(await page.locator('#it-detail [data-it-related]').count()>0,'technical concepts expose real existing related tools');
    const related=page.locator('#it-detail [data-it-related]').first(), target=await related.getAttribute('data-it-related');
    await page.evaluate(()=>window.__hexDocumentIdentity='same-document'); await related.click();
    await page.waitForFunction(target=>location.hash.slice(1).split('?')[0]===target.split('?')[0],target);
    assert.equal(await page.evaluate(()=>window.__hexDocumentIdentity),'same-document','related tools navigate inside the existing application');
    await page.waitForFunction(()=>document.querySelector('#panel-file .ct-tool')?.dataset.operation==='Disassemble x86');
    if(scenario==='native') {
      // This particular upstream operation accepts hexadecimal characters as
      // a string; the site's generic hex source would decode them prematurely.
      const task=page.locator('#panel-file .ct-tool');await task.locator('.ct-source').selectOption('text');await task.locator('.ct-input').fill('90');await task.locator('.ct-run').click();
      await page.waitForFunction(()=>{const status=document.querySelector('#panel-file .ct-status');return status?.textContent.includes('处理完成')||status?.classList.contains('error');},null,{timeout:60000});
      assert.equal(await task.locator('.ct-status').evaluate(node=>node.classList.contains('error')),false,await task.locator('.ct-status').textContent());assert.match(await task.locator('.ct-result textarea').inputValue(),/\bnop\b/i,'x86 knowledge link reaches the actual CyberChef disassembler and executes the NOP byte');
    }
    await go('it-reference'); await kind('http'); await query('404'); await detail(/404/);
    assert.equal(await page.locator('#panel-it-reference .tool-help-button').count(),1);
    assert.equal(await page.locator('#panel-it-reference .tool-provenance').evaluate(node=>node===node.parentElement.lastElementChild),true,'real dataset sources remain the final workspace content');
    assert.match(await page.locator('#panel-it-reference .tool-provenance').textContent(),/CC0|MIT|MPL/);
    await page.locator('#it-query').fill('<img src=x onerror="window.hexITInjected=true">');
    assert.equal(await page.evaluate(()=>window.hexITInjected),undefined); assert.equal(await page.locator('#it-results img,#it-detail script').count(),0,'queries are text and cannot instantiate HTML');

    for (const width of [320,390,800,1280,1440]) for (const motion of ['no-preference','reduce']) {
      await page.setViewportSize({width,height:860}); await page.emulateMedia({reducedMotion:motion});
      for (const route of [hexRoute,'it-reference']) {
        await go(route); if (route===hexRoute) await page.waitForSelector('#hex-editor:not([hidden])');
        const geometry=await page.locator(route===hexRoute?'#hex-editor':'#panel-it-reference').evaluate(root=>({
          scroll:document.documentElement.scrollWidth,width:innerWidth,
          outside:[...root.querySelectorAll('input,select,textarea,button')].filter(node=>node.getClientRects().length).filter(node=>{
            const outside=element=>{const r=element.getBoundingClientRect();return r.left<-.5||r.right>innerWidth+1;};
            if(!outside(node))return false;
            // Task peers use a bounded horizontal strip; verify that each
            // control becomes reachable instead of treating scrolling as clipping.
            let scroller=node.parentElement;
            while(scroller&&!(scroller.scrollWidth>scroller.clientWidth&&/auto|scroll/.test(getComputedStyle(scroller).overflowX)))scroller=scroller.parentElement;
            if(!scroller||scroller===document.body||scroller===document.documentElement||outside(scroller))return true;
            const left=scroller.scrollLeft;node.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
            const clipped=outside(node);scroller.scrollLeft=left;return clipped;
          }).map(node=>node.id||node.textContent),
          small:[...root.querySelectorAll('input:not([type=checkbox]),select,textarea,button')].filter(node=>node.getClientRects().length).filter(node=>{const r=node.getBoundingClientRect();return r.width<43.5||r.height<43.5;}).map(node=>({id:node.id,label:node.getAttribute('aria-label')||node.textContent,component:node.dataset.ui,className:node.className,w:node.getBoundingClientRect().width,h:node.getBoundingClientRect().height})),
        }));
        assert.ok(geometry.scroll<=geometry.width+1,route+' overflow '+width+' '+motion+': '+geometry.scroll); assert.deepEqual(geometry.outside,[],route+' outside controls '+width); assert.deepEqual(geometry.small,[],route+' undersized normal controls '+width);
      }
    }
    await page.setViewportSize({width:390,height:844}); await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    for (const route of [hexRoute,'it-reference']) {await go(route); assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' at 200% text stays in the viewport');}
    await page.evaluate(()=>document.documentElement.style.fontSize='');
    if (scenario==='native') {
      const settle=()=>page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().map(animation=>animation.finished.catch(()=>{})));});
      await page.setViewportSize({width:1280,height:950});await page.emulateMedia({reducedMotion:'no-preference'});await go(hexRoute);await settle();await page.screenshot({path:'/tmp/mist-hex-desktop.png',fullPage:true});
      await go('it-reference');await kind('ports');await query('80');await detail(/http/i);await settle();await page.screenshot({path:'/tmp/mist-it-desktop.png',fullPage:true});
      await page.setViewportSize({width:390,height:844});await detail(/http/i);await settle();await page.screenshot({path:'/tmp/mist-it-mobile.png',fullPage:true});
    }
    const persisted=await page.evaluate(()=>window.__hexPersistentWrites.map(([,value])=>value).join('\n'));
    assert.equal(persisted.includes(privateName),false,'file names never enter persistent preferences'); assert.equal(persisted.includes('ARG_ARG_'),false,'clue bytes never enter persistent preferences');
    assert.deepEqual(await page.evaluate(()=>window.__hexDatabaseOpens),[],'hex edits and knowledge queries do not create persistent file stores');
    assert.equal(await page.locator('iframe').count(),0); assert.equal(appPages(context).length,1);
    assert.deepEqual({errors,missing,external,writes},{errors:[],missing:[],external:[],writes:[]});
    await context.close();
    console.log('PASS hex/IT '+scenario+': exact binary exports, immutable original File, editing/history/endian/UTF8 search, worker cancellation/recovery and limits, fixed references/domain suffix/related tools, local privacy, 320–1440px/200% text and both motion modes');
  }
} finally {await browser.close();}
