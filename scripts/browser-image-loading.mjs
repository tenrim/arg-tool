import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import {deflateSync} from 'node:zlib';
import assert from 'node:assert/strict';
const {chromium} = createRequire(import.meta.url)('playwright');
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]), out = Buffer.alloc(body.length + 8);
  let crc = 0xffffffff;
  for (const byte of body) {crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);}
  out.writeUInt32BE(data.length); body.copy(out, 4); out.writeUInt32BE((crc ^ 0xffffffff) >>> 0, out.length - 4);
  return out;
}
const signature = Buffer.from([137,80,78,71,13,10,26,10]), header = Buffer.alloc(13);
header.writeUInt32BE(8); header.writeUInt32BE(1, 4); header[8] = 8; header[9] = 6;
// RGB hidden behind alpha=0 must survive the decoder; canvas re-encoding loses it.
const pixels = Buffer.from(Array.from({length:32}, (_,i) => i % 4 === 0 ? Number('01000001'[i / 4]) : 0));
const ihdr = chunk('IHDR', header), idat = chunk('IDAT', deflateSync(Buffer.concat([Buffer.from([0]), pixels]))), iend = chunk('IEND', Buffer.alloc(0));
const png = Buffer.concat([signature, ihdr, idat, iend]);
// A complete empty ZIP archive appended after PNG IEND reproduces the report.
const zip = Buffer.from('504b0506000000000000000000000000000000000000', 'hex');
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox','--disable-dev-shm-usage']});
try {
  const context = await browser.newContext({serviceWorkers:'block'}), errors = [], external = [];
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'arg.test') {external.push(url.href); return route.abort();}
    const file = resolve('public', '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
    try {await route.fulfill({body:await readFile(file), contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2'})[extname(file)] || 'application/octet-stream'});}
    catch {await route.fulfill({status:404,body:'Not found'});}
  });
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  await page.goto('https://arg.test/#image');
  async function task(id){await page.evaluate(id=>document.dispatchEvent(new CustomEvent('arg:opencapability',{detail:{id:'native:'+id}})),id);await page.waitForFunction(id=>document.querySelector('.capability-workspace-context')?.dataset.currentCapability==='native:'+id,id);}
  async function upload(buffer, name = 'test.png', error = false) {
    let onError;
    const failure = new Promise((_, reject) => {onError = e => reject(e); page.once('pageerror', onError);});
    try {
      await page.locator('#image-input').setInputFiles({name, mimeType:'image/png', buffer});
      await Promise.race([failure, page.waitForFunction(() => {
        const s = document.getElementById('image-status'); return s.textContent === '图片已载入' || s.classList.contains('error');
      })]);
      assert.equal(await page.locator('#image-status').evaluate(n => n.classList.contains('error')), error, await page.locator('#image-status').textContent());
    } finally {page.removeListener('pageerror', onError);}
  }
  async function extractA() {
    await task('image-steg'); await page.locator('#lsb-run').click();
    await page.waitForFunction(() => document.getElementById('image-output').value.includes('UTF-8 预览：\nA'));
    const downloading = page.waitForEvent('download'); await page.locator('#lsb-download').click();
    assert.deepEqual(await readFile(await (await downloading).path()), Buffer.from('A'));
  }
  await upload(Buffer.concat([png, zip]), 'with-zip.png'); await extractA();
  await task('image-png'); await page.locator('#image-png').click();
  await page.waitForFunction(() => document.getElementById('image-status').textContent === '数据块读取完成');
  assert.deepEqual(JSON.parse(await page.locator('#image-output').inputValue()).at(-1), {type:'IEND 后附加数据',offset:png.length,bytes:zip.length});
  // Trailers of any size are data, not another PNG chunk (including a partial header).
  for (const tail of [Buffer.from([1]), Buffer.alloc(11, 255), Buffer.alloc(128, 255)]) await upload(Buffer.concat([png, tail]));
  const invalidCRC = Buffer.from(png); invalidCRC[invalidCRC.length - 1] ^= 1;
  const hugeChunk = Buffer.from(png); hugeChunk.writeUInt32BE(0x7fffffff, 33);
  for (const broken of [png.subarray(0,4), png.subarray(0,-1), png.subarray(0,-12), hugeChunk, invalidCRC, Buffer.concat([signature, chunk('IHDR',header.subarray(0,8)),idat,iend])]) {
    await upload(broken, 'broken.png', true);
    assert.equal(await page.locator('#image-output').inputValue(), '');
    assert.ok(await page.locator('#lsb-run').isDisabled()); assert.ok(await page.locator('#image-png').isDisabled());
  }
  // IEND text inside a chunk payload must not terminate parsing.
  await upload(Buffer.concat([signature,ihdr,chunk('tEXt',Buffer.from('note\0IEND in payload')),idat,iend,zip])); await extractA();
  await upload(png, 'recovered.png'); await extractA();
  assert.deepEqual(errors, []); assert.deepEqual(external, []);
  console.log('PASS PNG+ZIP, arbitrary tails, raw transparent RGB/LSB bytes, malformed boundaries/CRC, failure recovery, local-only loading');
} finally {await browser.close();}
