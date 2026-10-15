import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());if(url.hostname!=='arg-tools.test')return route.abort();
    const file = resolve('public', '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.json': 'application/json', '.woff2': 'font/woff2' };
    try { await route.fulfill({ status: 200, contentType: types[extname(file)] || 'application/octet-stream', body: await readFile(file) }); }
    catch { await route.fulfill({ status: 404, body: 'Not found' }); }
  });
  const page = await context.newPage();
  const errors = [], externalMethods = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if(new URL(request.url()).hostname !== 'arg-tools.test') externalMethods.push(request.method()); });
  page.on('console', msg => { if (msg.type() === 'error') console.log('Browser:', msg.text().slice(0,300)); });
  page.on('pageerror', error => console.log('Runtime error:', error.message));
  page.on('requestfailed', req => console.log('Failed request:', req.url().split('?')[0], req.failure()?.errorText));
  await page.goto('https://arg-tools.test/#image');
  async function task(id){await page.evaluate(id=>document.dispatchEvent(new CustomEvent('arg:opencapability',{detail:{id:'native:'+id}})),id);await page.waitForFunction(id=>document.querySelector('.capability-workspace-context')?.dataset.currentCapability==='native:'+id,id);}
  await task('image-exif');
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 800; canvas.height = 150;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = 'white'; ctx.fillRect(0,0,800,150);
    ctx.fillStyle = 'black'; ctx.font = 'bold 64px Arial'; ctx.fillText('ARG TOOLS 12345', 30, 100);
    return canvas.toDataURL().split(',')[1];
  });
  await page.locator('#image-input').setInputFiles({ name:'metadata-test.png', mimeType:'image/png', buffer:Buffer.from(png,'base64') });
  await page.waitForFunction(() => document.getElementById('image-status').textContent === '图片已载入');
  await page.locator('#image-exif').click();
  await page.waitForFunction(() => document.getElementById('image-status').textContent === '元数据读取完成' || document.getElementById('image-status').classList.contains('error'), null, { timeout:60000 });
  assert.equal(await page.locator('#image-status').textContent(), '元数据读取完成');
  console.log('PASS: locally pinned EXIF component, no external requests');
  assert.equal(await page.locator('#image-ocr').count(),0);
  assert.deepEqual(errors,[]);assert.deepEqual(externalMethods,[]);
} finally { await browser.close(); }
