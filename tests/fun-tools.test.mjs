import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import {
  scramble,
  visualShares,
  fileToPixels,
  pixelsToFile,
  cropPixels,
} from '../public/fun-tools/image-engine.js';
import { watermark, textTransform } from '../public/fun-tools/text-engine.js';
import { prepareTransfer, receiver } from '../public/fun-tools/screen-model.js';
const require = createRequire(import.meta.url);
test('SpectroTrace 裁剪保留逐像素字节并拒绝超出原图的区域', () => {
  const image = { width: 4, height: 3, data: Uint8ClampedArray.from({ length: 48 }, (_, i) => i) };
  assert.deepEqual(
    [...cropPixels(image, { x: 1, y: 1, width: 2, height: 2 }).data],
    [...image.data.slice(20, 28), ...image.data.slice(36, 44)],
  );
  for (const rect of [
    { x: -1, y: 0, width: 1, height: 1 },
    { x: 3, y: 2, width: 2, height: 1 },
    { x: 0, y: 0, width: 0, height: 1 },
    { x: 0.5, y: 0, width: 1, height: 1 },
  ])
    assert.throws(() => cropPixels(image, rect), /裁剪区域/);
});
const C = require('../upstream/fun-tools/node_modules/crypto-js');
import { spawnSync } from 'node:child_process';
const pic = readFileSync(
  new URL('../upstream/fun-tools/pic-scramble/source/index.html', import.meta.url),
  'utf8',
);
const reference = {};
vm.createContext(reference);
vm.runInContext(
  pic.slice(
    pic.indexOf('function gilbert2d'),
    pic.indexOf('</script>', pic.indexOf('function gilbert2d')),
  ),
  reference,
);
test('Gilbert 原坐标与黄金位移：矩形、单行、单列、重复反向', () => {
  for (const [width, height] of [
    [1, 1],
    [1, 9],
    [9, 1],
    [7, 4],
    [4, 7],
    [32, 31],
  ]) {
    const data = Uint8ClampedArray.from({ length: width * height * 4 }, (_, i) => i % 256),
      curve = reference.gilbert2d(width, height),
      n = width * height,
      offset = Math.round(((Math.sqrt(5) - 1) / 2) * n),
      expected = new Uint8ClampedArray(data.length);
    for (let i = 0; i < n; i++) {
      const a = curve[i],
        b = curve[(i + offset) % n];
      expected.set(
        data.slice((a[1] * width + a[0]) * 4, (a[1] * width + a[0]) * 4 + 4),
        (b[1] * width + b[0]) * 4,
      );
    }
    const out = scramble({ width, height, data });
    assert.deepEqual(out.data, expected);
    assert.deepEqual(scramble(out, true).data, data);
    assert.deepEqual(scramble(scramble(out), true).data, out.data);
  }
});
test('视觉密码分片各半黑，黑秘密互补、白秘密相同，透明与放大', () => {
  for (const scale of [1, 2, 8]) {
    const [a, b] = visualShares(
      { width: 2, height: 1, data: new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]) },
      128,
      scale,
    );
    for (let secret = 0; secret < 2; secret++) {
      let ac = 0,
        bc = 0,
        union = 0;
      for (let y = 0; y < 2 * scale; y++)
        for (let x = secret * 2 * scale; x < (secret + 1) * 2 * scale; x++) {
          const i = (y * a.width + x) * 4 + 3;
          ac += a.data[i] === 255;
          bc += b.data[i] === 255;
          union += a.data[i] === 255 || b.data[i] === 255;
        }
      assert.equal(ac, 2 * scale * scale);
      assert.equal(bc, ac);
      assert.equal(union, (secret ? 2 : 4) * scale * scale);
    }
  }
});
test('郭飞水印已知 Rust LCG 位序、Unicode、自定义字符、全部位置、移除与损坏', () => {
  const code = watermark('', { direction: 'encode', secret: 'A', position: 'end' });
  assert.equal([...code].map((c) => (c === '\ufeff' ? '1' : '0')).join(''), '00011110');
  for (const position of ['end', 'index', 'random'])
    for (const password of ['', '密碼😀']) {
      const options = {
        direction: 'encode',
        secret: '秘密\u0000😀',
        password,
        position,
        index: 1,
        zero: '\u200b',
        one: '\u200c',
      };
      const value = watermark('甲😀乙', options);
      assert.equal(watermark(value, { ...options, direction: 'decode' }), options.secret);
      assert.equal(watermark(value, { ...options, direction: 'remove' }), '甲😀乙');
    }
  assert.throws(() => watermark('\u2060', { direction: 'decode' }), /完整字节/);
  assert.throws(() => watermark('text', { direction: 'decode' }), /未找到/);
});
test('兽音全部 UTF-16 范围、四符号与首尾格式', () => {
  const text = String.fromCharCode(...Array.from({ length: 65536 }, (_, i) => i));
  for (const alphabet of ['嗷呜啊~', '😀😃😄😁'])
    for (const framed of [false, true]) {
      const options = { alphabet, framed, direction: 'encode' },
        encoded = textTransform('beast-codec', text, options);
      assert.equal(
        textTransform('beast-codec', encoded, { ...options, direction: 'decode' }),
        text,
      );
    }
  assert.throws(() =>
    textTransform('beast-codec', 'abc', { direction: 'decode', alphabet: '嗷呜啊~' }),
  );
  assert.throws(() =>
    textTransform('beast-codec', 'abc', { direction: 'encode', alphabet: 'aabc' }),
  );
});
test('佛又曰与原版逐项映射互通，原 AES 解密与密码错误', () => {
  const src = readFileSync(
    new URL('../upstream/fun-tools/buddha/source/js/main.js', import.meta.url),
    'utf8',
  );
  const pairs = [
    ...src
      .slice(src.indexOf('function togod'), src.indexOf('function toman'))
      .matchAll(/replaceAll\("([^"]+)", "([^"]+)"\)/g),
  ].map(([, a, b]) => [a.replaceAll('\\', ''), b]);
  assert.equal(pairs.length, 65);
  for (const password of ['', '私人密钥']) {
    const text = '中文😀\n\u0000A',
      encoded = textTransform(
        'buddha-codec',
        text,
        { direction: 'encode', password },
        { CryptoJS: C },
      );
    let body = encoded.slice(4);
    for (const [from, to] of pairs) body = body.replaceAll(to, from);
    assert.equal(
      C.AES.decrypt('U2FsdGVkX1' + body, password || 'takuron.top').toString(C.enc.Utf8),
      text,
    );
    let upstream = C.AES.encrypt(text, password || 'takuron.top')
      .toString()
      .slice(10);
    for (const [from, to] of pairs) upstream = upstream.replaceAll(from, to);
    assert.equal(
      textTransform(
        'buddha-codec',
        '佛又曰：' + upstream,
        { direction: 'decode', password },
        { CryptoJS: C },
      ),
      text,
    );
    assert.throws(() =>
      textTransform(
        'buddha-codec',
        encoded,
        { direction: 'decode', password: 'wrong' },
        { CryptoJS: C },
      ),
    );
  }
});
test('StegCloak 加密/HMAC 四组合与原 npm 格式互通', () => {
  // The original lzutf8 Node scheduler retains a MessagePort. A separate oracle
  // process explicitly exits only after all compatibility assertions pass.
  const source = `import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { textTransform } from './public/fun-tools/text-engine.js';
const require=createRequire(import.meta.url);
const StegCloak=require('./upstream/fun-tools/node_modules/stegcloak');
  for(const encrypt of [false,true])for(const integrity of [false,true]){
    const options={direction:'encode',secret:'Secret 中文😀',password:'password',encrypt,integrity};
    const upstream=new StegCloak(encrypt,integrity), value=textTransform('text-steganography','cover text',options,{StegCloak});
    assert.equal(upstream.reveal(value,'password'),options.secret);
    const orig=upstream.hide(options.secret,'password','cover text');
    assert.equal(textTransform('text-steganography',orig,{...options,direction:'decode'},{StegCloak}),options.secret);
    if(encrypt&&integrity)assert.throws(()=>upstream.reveal(value,'wrong'));
  }
process.exit(0);`;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', source], {
    cwd: new URL('../', import.meta.url),
    encoding: 'utf8',
    timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr);
});
test('HideInfo 大端长度、所有字节、空文件、末尾零及超长头', () => {
  for (const bytes of [
    new Uint8Array(),
    new Uint8Array([0]),
    Uint8Array.from({ length: 10000 }, (_, i) => i % 256),
  ]) {
    const image = fileToPixels(bytes);
    assert.deepEqual(pixelsToFile(image), bytes);
    const rgb = [];
    for (let i = 0; i < image.data.length; i += 4) rgb.push(...image.data.slice(i, i + 3));
    const length = new DataView(Uint8Array.from(rgb).buffer).getUint32(0, false);
    assert.equal(length, bytes.length);
    assert.deepEqual(Uint8Array.from(rgb.slice(4, 4 + length)), bytes);
  }
  const bad = fileToPixels(new Uint8Array([1]));
  bad.data[0] = 255;
  assert.throws(() => pixelsToFile(bad), /声明长度/);
});
test('ScreenDrop 原协议乱序重复、缺块、CRC、SHA、长中文文件名、容量', async () => {
  const bytes = Uint8Array.from({ length: 2048 }, (_, i) => i % 256),
    t = await prepareTransfer(bytes, '中文😀.bin', 128),
    r = receiver();
  for (const packet of t.chunks.slice(1).reverse()) r.add(packet);
  r.add(t.chunks.at(-1));
  assert.deepEqual(r.missing(), [1]);
  await assert.rejects(r.finish(), /分块不足/);
  r.add(t.chunks[0]);
  const out = await r.finish();
  assert.deepEqual(out.fileData, bytes);
  assert.equal(out.fileName, '中文😀.bin');
  const bad = t.chunks[0].slice(0, -1) + 'x';
  assert.throws(() => receiver().add(bad), /CRC/);
  const other = await prepareTransfer(new Uint8Array(bytes.length).fill(9), '中文😀.bin', 128),
    mix = receiver();
  mix.add(t.chunks[0]);
  for (const packet of other.chunks.slice(1)) mix.add(packet);
  await assert.rejects(mix.finish(), /SHA-256/);
  await assert.rejects(prepareTransfer(bytes, '中'.repeat(86), 128), /文件名/);
  for (const capacity of [128, 256, 400, 600, 900, 1240]) {
    const empty = await prepareTransfer(new Uint8Array(), 'empty', capacity),
      rr = receiver();
    empty.chunks.forEach((x) => rr.add(x));
    assert.equal((await rr.finish()).fileSize, 0);
  }
});
