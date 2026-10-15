import {toolGroups} from '../public/navigation.js';
import {go} from './browser-navigation.mjs';
import { createRequire } from 'node:module';
import { mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
import { deflateSync } from 'node:zlib';
import { wavEncode } from '../public/media.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const artifacts = join(tmpdir(), 'arg-tools-browser'); await mkdir(artifacts, { recursive: true });
function rawPNG(width,height,pixels) {
 const chunk=(name,data)=>{const type=Buffer.from(name),body=Buffer.concat([type,data]);let crc=0xffffffff;for(const byte of body){crc^=byte;for(let b=0;b<8;b++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}const result=Buffer.alloc(data.length+12);result.writeUInt32BE(data.length);body.copy(result,4);result.writeUInt32BE((crc^0xffffffff)>>>0,result.length-4);return result;};
 const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
 const rows=[];for(let y=0;y<height;y++)rows.push(Buffer.from([0]),Buffer.from(pixels.slice(y*width*4,(y+1)*width*4)));
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(Buffer.concat(rows))),chunk('IEND',Buffer.alloc(0))]);
}
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
  const externalRequests = [];
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'arg-tools.test') { externalRequests.push(url.origin + url.pathname); await route.abort(); return; }
    const file = resolve('public', '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(resolve('public') + (process.platform==='win32'?'\\':'/'))) { await route.abort(); return; }
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json' };
    try { await route.fulfill({ status: 200, contentType: types[extname(file)] || 'application/octet-stream', body: await readFile(file), headers: { 'content-security-policy': "frame-src 'none'; worker-src 'self'" } }); }
    catch { await route.fulfill({ status: 404, body: 'Not found' }); }
  });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('https://arg-tools.test/#cyberchef');
  await page.evaluate(() => document.fonts.ready);
  assert.ok(await page.evaluate(() => document.fonts.check('900 32px "Noto Serif SC"', '密码与编码') && document.fonts.check('400 16px "JetBrains Mono"', 'ARG')), 'Local UI fonts should load');
  await page.waitForFunction(() => document.getElementById('cyberchef-stage').dataset.ready === 'true', null, { timeout: 40000 });
  const chef = page;
  async function outputEquals(expected) {
    await page.waitForFunction(text => document.getElementById('chef-output').value === text, expected, { timeout: 30000 });
  }
  async function execute() { await page.locator('#chef-run').click(); await page.waitForFunction(() => document.getElementById('cyberchef-status').textContent.startsWith('处理完成'), null, {timeout:30000}); }
  assert.equal(await page.locator('#chef-input').inputValue(),'');assert.equal(await page.locator('[data-chef-example]').count(),0);assert.equal(await page.locator('#panel-cyberchef h1').textContent(),'CyberChef 完整处理链');
  assert.equal(page.frames().length,1);assert.equal(await page.locator('a[href="https://github.com/tenrim/arg-tool"]').count(),0);
  async function importRecipe(recipe,input) {await page.locator('#chef-import-recipe').setInputFiles({name:'test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(recipe))});await page.waitForFunction(n=>document.querySelectorAll('.chef-step').length===n,recipe.length);await page.locator('#chef-input').fill(input);await execute();}
  for(const [recipe,input,value]of [
    [[{op:'From Base64',args:['A-Za-z0-9+/=',true,false]}],'QVJHIOW3peWFtw==','ARG 工具'],
    [[{op:'To Base64',args:['A-Za-z0-9+/=']}],'ARG 工具','QVJHIOW3peWFtw=='],
    [[{op:'From Hex',args:['Auto']}],'41 52 47','ARG'],
    [[{op:'ROT13',args:[true,true,false,13]}],'NET','ARG'],
    [[{op:'From Base64',args:['A-Za-z0-9+/=',true,false]},{op:'ROT13',args:[true,true,false,13]}],'TkVU','ARG']]) {await importRecipe(recipe,input);await outputEquals(value);}
  assert.equal(await page.locator('.chef-step').first().locator('.chef-step-heading strong').textContent(),'Base64解码');
  assert.equal(await page.locator('.chef-step [data-arg="1"] span').first().textContent(),'移除字符表以外的字符');
  await page.locator('#chef-category').selectOption('all'); await page.locator('#chef-search').fill('Reverse');
  await page.locator('#chef-operations [data-operation="Reverse"]').click(); await execute(); await outputEquals('GRA');
  await page.locator('#chef-input').fill('SEVMTE8='); assert.equal(await page.locator('#chef-output').inputValue(),'','Changed input clears outdated output'); await execute(); await outputEquals('BYYRU');
  await page.locator('.chef-saved-tools summary').click(); await page.locator('#chef-save-name').fill('ARG smoke recipe'); await page.locator('#chef-save').click();
  assert.ok(await page.evaluate(() => localStorage.getItem('arg.cyberchef.recipes.v1')?.includes('ARG smoke recipe')));
  const recipeDownload=page.waitForEvent('download');await page.locator('#chef-export-recipe').click();const recipeJSON=await readFile(await (await recipeDownload).path());
  assert.deepEqual(JSON.parse(recipeJSON).map(s=>s.op),['From Base64','ROT13','Reverse']);
  await page.locator('#chef-clear-recipe').click();await page.locator('#chef-saved').selectOption('0');await page.locator('#chef-load').click();await execute();await outputEquals('BYYRU');
  await go(page,'image');await go(page,'cyberchef');await outputEquals('BYYRU');assert.equal(await page.locator('.chef-step').count(),3);
  await page.locator('#chef-clear-recipe').click();await page.locator('#chef-search').fill('维吉尼亚');await page.locator('#chef-operations [data-operation="Vigenère Decode"]').click();
  await page.locator('#chef-recipe [aria-label="维吉尼亚解码 密钥"]').fill('LEMON');await page.locator('#chef-input').fill('LXFOPVEFRNHR');await execute();await outputEquals('ATTACKATDAWN');
  await page.locator('#chef-clear-recipe').click();await page.locator('#chef-search').fill('AES Decrypt');await page.locator('#chef-operations [data-operation="AES Decrypt"]').click();
  await page.locator('#chef-recipe input[aria-label="AES解密 密钥"]').fill('000102030405060708090a0b0c0d0e0f');await page.locator('#chef-recipe [aria-label="AES解密 模式"]').selectOption('ECB/NoPadding');await page.locator('#chef-recipe [aria-label="AES解密 输出格式"]').selectOption('Hex');await page.locator('#chef-input').fill('69c4e0d86a7b0430d8cdb78070b4c55a');await execute();await outputEquals('00112233445566778899aabbccddeeff');
  await page.locator('#chef-clear-recipe').click();await page.locator('#chef-search').fill('SHA2');await page.locator('#chef-operations [data-operation="SHA2"]').click();await page.locator('#chef-recipe [aria-label="SHA2 哈希 大小"]').selectOption('256');await page.locator('#chef-input').fill('abc');await execute();await outputEquals('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  await page.locator('#chef-clear-recipe').click();await page.locator('#chef-search').fill('Gzip');await page.locator('#chef-operations [data-operation="Gzip"]').click();await execute();
  const gzipDownload=page.waitForEvent('download');await page.locator('#chef-download').click();const compressed=await readFile(await (await gzipDownload).path());assert.deepEqual([...compressed.subarray(0,2)],[31,139]);
  await page.locator('#chef-to-input').click();await page.locator('#chef-clear-recipe').click();await page.locator('#chef-operations [data-operation="Gunzip"]').click();await execute();await outputEquals('abc');
  await page.locator('#chef-file').setInputFiles({name:'bytes.bin',mimeType:'application/octet-stream',buffer:Buffer.from([0,255,65])});await page.waitForFunction(()=>document.getElementById('cyberchef-status').textContent.includes('文件已载入'));
  await page.locator('#chef-clear-recipe').click();await execute();const rawDownload=page.waitForEvent('download');await page.locator('#chef-download').click();assert.deepEqual([...await readFile(await (await rawDownload).path())],[0,255,65]);
  await page.locator('#chef-import-recipe').setInputFiles({name:'recipe.json',mimeType:'application/json',buffer:recipeJSON});await page.waitForFunction(()=>document.querySelectorAll('.chef-step').length===3);assert.equal(await page.locator('.chef-step').count(),3);
  await page.locator('#chef-import-recipe').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('[{"op":"<img src=x onerror=alert(1)>","args":[]}]')});await page.waitForFunction(()=>document.getElementById('cyberchef-status').textContent.includes('导入失败'));assert.equal(await page.locator('.chef-step').count(),3,'Invalid import preserves current recipe');
  // Cancel a running official operation and ensure its late response cannot replace newer input.
  await page.locator('#chef-clear-recipe').click();await page.locator('#chef-search').fill('Sleep');await page.locator('#chef-operations [data-operation="Sleep"]').click();
  await page.evaluate(()=>{document.getElementById('chef-run').click();document.getElementById('chef-cancel').click();const input=document.getElementById('chef-input');input.value='fresh';input.dispatchEvent(new Event('input'));});
  assert.equal(await page.locator('#chef-output').inputValue(),'');await page.locator('#chef-clear-recipe').click();await execute();await outputEquals('fresh');
  // A missing engine asset must show an inline error and recover using the same page.
  const recovery=await context.newPage();let failAsset=true;await recovery.route('**/vendor/cyberchef/ChefWorker.js',async route=>{if(failAsset){failAsset=false;await route.fulfill({status:503,body:'Temporarily unavailable'});}else await route.fallback();});
  await recovery.goto('https://arg-tools.test/#cyberchef');await recovery.waitForFunction(()=>document.getElementById('cyberchef-status').classList.contains('error'));await recovery.locator('#cyberchef-retry').click();await recovery.waitForFunction(()=>document.getElementById('cyberchef-stage').dataset.ready==='true',null,{timeout:30000});assert.equal(recovery.frames().length,1);await recovery.close();
  const originalOnlyTools=new Set(['extract','knowledge']);
  assert.equal(await page.locator('.panel:not(.site-page) > .tool-provenance').count(), new Set(toolGroups.flatMap(g=>g.items.map(i=>i[0].split('/')[0])).filter(id=>!originalOnlyTools.has(id))).size);
  assert.equal(await page.locator('#panel-about > .tool-provenance,#panel-extract > .tool-provenance,#panel-knowledge > .tool-provenance').count(),0,'Original-only tools omit third-party project footers');
  for (const footer of await page.locator('.tool-provenance').all()) {
    assert.ok(await footer.locator('a[href^="https://"]').count(), 'Every page should name and link its actual projects');
    assert.ok(await footer.evaluate(element => element === element.parentElement.lastElementChild), 'Project links should sit at the bottom of each page');
  }
  await importRecipe([{op:'From Base64',args:['A-Za-z0-9+/=',true,false]},{op:'ROT13',args:[true,true,false,13]}],'TkVU');await outputEquals('ARG');await page.locator('#chef-search').fill('解码');await page.locator('.chef-saved-tools summary').click();

  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({ path: join(artifacts, 'desktop.png'), fullPage: true });
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 16; canvas.height = 16; const ctx = canvas.getContext('2d'); const image = ctx.createImageData(16, 16);
    for (let i = 0; i < 256; i++) { image.data[i * 4] = 128 + Number(('01000001'[i] || '0')); image.data[i * 4 + 1] = 64; image.data[i * 4 + 2] = 32; image.data[i * 4 + 3] = 255; }
    ctx.putImageData(image, 0, 0); return canvas.toDataURL().split(',')[1];
  });
  await go(page,'image'); await page.locator('#image-input').setInputFiles({ name: 'lsb-test.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
  await page.waitForFunction(() => document.getElementById('image-status').textContent === '图片已载入');
  assert.match(await page.locator('#image-info').textContent(),/PNG 原始像素/);
  for(const [mode,expected] of [['red',[128,128,128,255]],['green',[64,64,64,255]],['blue',[32,32,32,255]],['alpha',[255,255,255,255]],['gray',[75,75,75,255]],['invert',[127,191,223,255]]]) {
    await page.locator('#image-mode').selectOption(mode);await page.waitForFunction(()=>document.getElementById('image-status').textContent.startsWith('图像调整 ·'));
    assert.deepEqual(await page.evaluate(()=>[...document.getElementById('image-canvas').getContext('2d').getImageData(0,0,1,1).data]),expected,mode);
  }
  await page.locator('#image-mode').selectOption('contrast');await page.locator('#image-contrast').evaluate(el=>{el.value='0';el.dispatchEvent(new Event('input'));});await page.waitForFunction(()=>document.getElementById('image-status').textContent.startsWith('图像调整 ·'));
  assert.deepEqual(await page.evaluate(()=>[...document.getElementById('image-canvas').getContext('2d').getImageData(0,0,1,1).data]),[128,64,32,255]);
  await page.locator('[data-image-engine="steg"]').click();await page.locator('#lsb-run').click();await page.waitForFunction(()=>document.getElementById('image-output').value.includes('UTF-8'));
  assert.match(await page.locator('#image-output').inputValue(),/UTF-8 预览：\nA/);
  const lsbDownload=page.waitForEvent('download');await page.locator('#lsb-download').click();assert.equal((await readFile(await(await lsbDownload).path()))[0],65);
  await page.locator('#lsb-offset').fill('1');await page.locator('#lsb-run').click();await page.waitForFunction(()=>document.getElementById('image-status').textContent.startsWith('提取完成'));
  assert.match(await page.locator('#image-output').inputValue(),/提取 31 个完整字节/);
  await page.locator('#lsb-offset').fill('0');await page.locator('#lsb-preset').selectOption('rgb');assert.equal(await page.locator('#steg-bit-table input:checked').count(),3);
  await page.locator('#lsb-preset').selectOption('r');
  await page.locator('#lsb-pixel-order').selectOption('Column');assert.equal(await page.locator('#image-output').inputValue(),'');assert.ok(await page.locator('#lsb-download').isDisabled());
  await page.locator('#image-mode').selectOption('r');await page.waitForFunction(()=>document.getElementById('image-status').textContent.startsWith('StegOnline ·'));
  assert.deepEqual(await page.evaluate(()=>[...document.getElementById('image-canvas').getContext('2d').getImageData(0,0,1,1).data]),[255,255,255,255]);
  await page.locator('[data-image-engine="aperi"]').click();await page.waitForFunction(()=>document.getElementById('image-status').textContent.startsWith('AperiSolve ·'));
  assert.deepEqual(await page.evaluate(()=>[...document.getElementById('image-canvas').getContext('2d').getImageData(0,0,1,1).data]),[0,0,0,255]);
  await page.locator('#image-overview').click();await page.waitForFunction(()=>document.querySelectorAll('.image-plane-card').length===40,null,{timeout:30000});
  await page.locator('#image-remap').click();await page.waitForFunction(()=>document.getElementById('image-status').textContent.includes('随机颜色重映射'));
  const imageDownload=page.waitForEvent('download');await page.locator('#image-download').click();const savedPNG=await readFile(await(await imageDownload).path());assert.deepEqual([...savedPNG.subarray(0,8)],[137,80,78,71,13,10,26,10]);
  await page.screenshot({path:join(artifacts,'image-desktop.png'),fullPage:true});
  await page.locator('[data-image-engine="inspect"]').click();await page.locator('#image-qr').click();await page.waitForFunction(()=>document.getElementById('image-status').textContent==='未找到二维码');
  await page.locator('#image-png').click();await page.waitForFunction(()=>document.getElementById('image-status').textContent==='数据块读取完成');
  assert.match(await page.locator('#image-output').inputValue(),/IHDR/);assert.match(await page.locator('#image-output').inputValue(),/IEND/);assert.ok(await page.locator('#lsb-download').isDisabled());
  const textDownload=page.waitForEvent('download');await page.locator('#image-save-text').click();assert.match((await readFile(await(await textDownload).path())).toString(),/IHDR/);
  const qrPNG=await page.evaluate(async()=>{
    const {CyberChefClient}=await import('./cyberchef-client.js');const client=new CyberChefClient();
    try {await client.ready;const output=await client.bake('ARG QR 12345',[{op:'Generate QR Code',args:['PNG',5,4,'Medium']}]);return String(output.result).match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)?.[1];}
    finally {client.close();}
  });
  assert.ok(qrPNG,'Official QR generator should return a PNG');
  await page.locator('#image-input').setInputFiles({name:'qr.png',mimeType:'image/png',buffer:Buffer.from(qrPNG,'base64')});await page.waitForFunction(()=>document.getElementById('image-status').textContent==='图片已载入');
  await page.locator('#image-qr').click();await page.waitForFunction(()=>document.getElementById('image-status').textContent==='二维码识别完成');assert.equal(await page.locator('#image-output').inputValue(),'ARG QR 12345');
  await page.locator('[data-image-engine="basic"]').click();await page.locator('#image-mode').selectOption('invert');await page.waitForFunction(()=>document.getElementById('image-status').textContent.startsWith('图像调整 ·'));
  await page.locator('[data-image-engine="inspect"]').click();await page.locator('#image-analysis-source').selectOption('view');await page.locator('#image-qr').click();await page.waitForFunction(()=>document.getElementById('image-status').textContent==='二维码识别完成');assert.equal(await page.locator('#image-output').inputValue(),'ARG QR 12345');
  // Transparent PNG RGB bytes must survive raw decoding and LSB extraction.
  const hiddenPixels=Uint8Array.from({length:32},(_,i)=>i%4===0?Number('01000001'[i/4]):0);
  await page.locator('#image-input').setInputFiles({name:'transparent.png',mimeType:'image/png',buffer:rawPNG(8,1,hiddenPixels)});await page.waitForFunction(()=>document.getElementById('image-status').textContent==='图片已载入');
  await page.locator('[data-image-engine="steg"]').click();await page.locator('#lsb-pixel-order').selectOption('Row');await page.locator('#lsb-run').click();await page.waitForFunction(()=>document.getElementById('image-output').value.includes('UTF-8 预览：\nA'));
  await page.locator('#image-input').setInputFiles({ name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('invalid image') });
  await page.waitForFunction(() => document.getElementById('image-status').classList.contains('error'));
  assert.equal(await page.locator('#image-output').inputValue(), ''); assert.ok(await page.locator('#lsb-run').isDisabled());
  await go(page,'file'); await page.locator('#file-input').setInputFiles({ name: 'sample.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\nARGTOOLS\x00') });
  await page.waitForFunction(() => document.getElementById('file-stats').textContent.includes('PDF 文档')); await page.locator('#file-strings').click(); assert.match(await page.locator('#file-output').inputValue(), /ARGTOOLS/);
  await page.locator('#file-hash').click(); await page.waitForFunction(() => document.getElementById('file-output').value.startsWith('SHA-256'));
  await page.evaluate(() => {
    const transfer = new DataTransfer(); transfer.items.add(new File([new Uint8Array(32 * 1024 * 1024 + 1)], 'oversized.bin'));
    const input = document.getElementById('file-input'); input.files = transfer.files; input.dispatchEvent(new Event('change'));
  });
  await page.waitForFunction(() => document.getElementById('file-status').textContent.includes('超过 32 MB'));
  assert.equal(await page.locator('#file-output').inputValue(), ''); assert.ok(await page.locator('#file-hash').isDisabled());
  await go(page,'audio'); const rate = 8000, samples = new Float32Array(rate);
  for (let i = 0; i < 1600; i++) samples[i] = 0.3 * Math.sin(2 * Math.PI * 697 * i / rate) + 0.3 * Math.sin(2 * Math.PI * 1209 * i / rate);
  for (let i = 3200; i < 4800; i++) samples[i] = 0.3 * Math.sin(2 * Math.PI * 770 * i / rate) + 0.3 * Math.sin(2 * Math.PI * 1336 * i / rate);
  await page.locator('#audio-input').setInputFiles({ name: 'dtmf-test.wav', mimeType: 'audio/wav', buffer: Buffer.from(wavEncode([samples], rate)) });
  await page.waitForFunction(() => document.getElementById('audio-status').textContent.includes('音频已载入')); await page.locator('#audio-dtmf').click();
  await page.waitForFunction(() => document.getElementById('audio-output').value.includes('识别序列：15'));
  await page.locator('#max-hz').fill('4000'); await page.locator('#audio-spectrum').click(); await page.waitForFunction(() => document.getElementById('audio-status').textContent === '频谱图已生成');
  await page.locator('#fft-size').selectOption('1024'); assert.ok(await page.locator('#spectrum-download').isDisabled());
  const spectrumPixel = await page.evaluate(() => [...document.getElementById('spectrogram-canvas').getContext('2d').getImageData(0, 0, 1, 1).data]);
  assert.deepEqual(spectrumPixel, [0, 0, 0, 0]);
  await page.locator('#audio-reverse').click(); assert.equal(await page.locator('#audio-reverse').textContent(), '恢复正向预览');
  const audioDownload = page.waitForEvent('download'); await page.locator('#audio-export').click(); const audioFile = await audioDownload;
  assert.equal(audioFile.suggestedFilename(), 'arg-audio.wav'); const wav = await readFile(await audioFile.path());
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF'); assert.equal(wav.readUInt32LE(4), wav.length - 8);
  await page.locator('#audio-input').setInputFiles({ name: 'broken.wav', mimeType: 'audio/wav', buffer: Buffer.from('invalid audio') });
  await page.waitForFunction(() => document.getElementById('audio-status').classList.contains('error'));
  assert.ok(await page.locator('#audio-export').isDisabled()); assert.equal(await page.locator('#audio-output').inputValue(), '');
  assert.equal(await page.locator('#audio-player').getAttribute('src'), null);
  await go(page,'symbols'); await page.getByRole('button', { name: '盲文第 1 点', exact: true }).click(); assert.equal(await page.locator('#braille-letter').textContent(), 'A');
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('https://arg-tools.test/#pipeline');
  await page.waitForFunction(() => document.getElementById('cyberchef-stage').dataset.ready === 'true', null, { timeout: 90000 });
  assert.equal(new URL(page.url()).hash, '#cyberchef', 'Legacy bookmarks should open CyberChef');

  await page.evaluate(() => document.fonts.ready);
   await page.keyboard.press('Escape');
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({ path: join(artifacts, 'mobile.png'), fullPage: true });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const name of ['cyberchef', 'image', 'audio', 'file', 'symbols', 'about']) {
       await go(page,name);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name} should fit a ${width}px viewport`);
      if(name === 'image') {
        await page.locator('[data-image-engine="steg"]').click();
        assert.ok(await page.locator('#steg-bit-table').isVisible());
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `StegOnline bit matrix should fit a ${width}px viewport`);
        if(width <= 760) {
          assert.ok(await page.locator('#steg-controls').evaluate(el=>el.getBoundingClientRect().width > 240),'Image settings should occupy the full width');
          assert.ok(await page.locator('.steg-bit-row label').first().evaluate(el=>el.getBoundingClientRect().width >= 44 && el.getBoundingClientRect().height >= 44),'Bit selection should have usable touch targets');
        }
        for(const engine of ['basic','aperi','inspect']) {
          await page.locator(`[data-image-engine="${engine}"]`).click();
          assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1),`${engine} image tab should fit ${width}px`);
        }
        await page.locator('[data-image-engine="inspect"]').press('Home');
        assert.equal(await page.locator('[data-image-engine="basic"]').getAttribute('aria-selected'),'true');
      }
    }
    if (width <= 760) {
       await go(page,'cyberchef');
      for (const pane of ['operations', 'recipe', 'input', 'output']) {
        await chef.locator(`#chef-tabs [data-pane="${pane}"]`).click();
        assert.ok(await chef.locator(`#chef-pane-${pane}`).isVisible());
        assert.ok(await chef.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `CyberChef ${pane} should fit ${width}px`);
      }
      await chef.locator('#chef-tabs [data-pane="output"]').focus();
      await chef.locator('#chef-tabs [data-pane="output"]').press('ArrowLeft');
      assert.equal(await chef.locator('#chef-tabs [data-pane="input"]').getAttribute('aria-selected'), 'true');
    }
  }
  await page.locator('.skip').focus(); await page.keyboard.press('Enter'); assert.equal(await page.evaluate(() => document.activeElement.id), 'main');
  assert.deepEqual(externalRequests, [], 'Core tools and CyberChef recipes should use only bundled local assets');
  assert.deepEqual(errors, []); console.log(JSON.stringify({ status: 'passed', checks: ['505 Chinese operation names, native CyberChef under frame-src none, no example controls or own repository link', 'Base64 chain, Vigenere parameters, SHA-256, Gzip roundtrip and raw binary export', 'AES key format parameters, cancellation without stale responses, inline asset failure and retry', 'operation search, recipe JSON import/export, saved recipe reload and invalid import preservation', 'recipe persistence between pages', 'actual project links at each page footer', 'real AperiSolve planes/remapping and StegOnline LSB/PNG decode including transparent hidden RGB, byte offset/presets and stale-result clearing', 'restored channels/gray/invert/contrast, QR recognition from original and adjusted view, PNG chunks and text download', 'invalid image/audio and oversized file reset', 'file inspection and hash', 'audio upload, DTMF, spectrum, reverse and WAV bytes', 'Braille', 'all 6 panels and four image tabs at 320/390/768px, full-width settings and usable bit selection touch targets', 'four mobile CyberChef panes, keyboard tab switching and skip link', 'no runtime exceptions'], screenshots: [join(artifacts, 'desktop.png'), join(artifacts, 'mobile.png')] }, null, 2));
} finally { if (browser) await browser.close(); }
