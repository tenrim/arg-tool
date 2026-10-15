import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {deflateSync} from 'node:zlib';
import {resolve, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

// Tiny, lossless RGBA fixtures. Browser Canvas would premultiply transparent
// colours and could erase the very low bits this regression needs to inspect.
function png(width, height, rgba) {
  function crc(bytes) {
    let value = 0xffffffff;
    for (const byte of bytes) {
      value ^= byte;
      for (let bit = 0; bit < 8; bit++) value = value & 1 ? (value >>> 1) ^ 0xedb88320 : value >>> 1;
    }
    return (value ^ 0xffffffff) >>> 0;
  }
  function chunk(name, data) {
    const type = Buffer.from(name), size = Buffer.alloc(4), checksum = Buffer.alloc(4);
    size.writeUInt32BE(data.length); checksum.writeUInt32BE(crc(Buffer.concat([type, data])));
    return Buffer.concat([size, type, data, checksum]);
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let row = 0; row < height; row++) Buffer.from(rgba.slice(row * width * 4, (row + 1) * width * 4)).copy(scanlines, row * (width * 4 + 1) + 1);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(scanlines)), chunk('IEND', Buffer.alloc(0))]);
}

// Known data, independent of the adapter's Row-bit transposition algorithm.
const fixtures = [
  {width: 2, height: 2, rgba: [1, 0, 0, 255, 0, 1, 0, 255, 1, 1, 0, 255, 0, 0, 0, 255]},
  {width: 3, height: 2, rgba: [129, 66, 7, 255, 132, 65, 14, 254, 130, 67, 5, 253, 137, 68, 10, 252, 134, 69, 3, 251, 135, 70, 8, 250]}
].map(fixture => ({...fixture, png: Array.from(png(fixture.width, fixture.height, fixture.rgba))}));

export async function checkChefCorrections(browser) {
  const engine = JSON.parse(await readFile('public/vendor/cyberchef/ENGINE.json'));
  const upstream = JSON.parse(await readFile('public/vendor/cyberchef/UPSTREAM.json'));
  const before = new Map([...engine.files, ...upstream.files.filter(file => ['modules/Image.js', 'modules/Crypto.js', 'modules/Encodings.js'].includes(file.path))].map(file => [file.path, file.sha256]));
  for (const [path, sha] of before) assert.equal(createHash('sha256').update(await readFile('public/vendor/cyberchef/' + path)).digest('hex'), sha);
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
          assert.ok(url.pathname.startsWith(prefix), 'resource escaped deployment directory');
          const relative = url.pathname.slice(prefix.length);
          if (relative === 'correction-check.html') return route.fulfill({body: '<!doctype html><title>Worker corrections</title>', contentType: 'text/html'});
          if (relative === 'vendor/cyberchef/modules/Encodings.js' && url.searchParams.has('failure')) return route.fulfill({status: 503, body: 'Unavailable', contentType: 'text/javascript'});
          if (relative === 'correction-probe.js') return route.fulfill({contentType: 'text/javascript', body: `
            importScripts('./cyberchef-operation-corrections.js');
            self.OpModules = {};
            self.onmessage = ({data: mode}) => {
              const native = Object.defineProperty;
              let error, untouched;
              try {
                self.CyberChefOperationCorrections.importEncodings(() => {
                  if (mode === 'missing') importScripts('./vendor/cyberchef/modules/Encodings.js?failure=1');
                  if (mode === 'throw') { importScripts('./vendor/cyberchef/modules/Encodings.js'); throw new Error('Injected import failure'); }
                  if (mode === 'shape') {
                    class Other { get value() { return true; } }
                    for (const key of ['any', 'int', 'array', 'boolean', 'double', 'string', 'object']) Other[key] = () => null;
                    Object.defineProperty(Other, 'ownVariants', {value: []});
                    self.otherType = Other;
                  }
                });
              } catch (failure) { error = failure.message; }
              if (mode === 'throw') {
                try { new self.OpModules.Encodings['AMF Encode']().run(true, ['AMF3']); untouched = false; }
                catch (failure) { untouched = /only a getter/.test(failure.message); }
              } else if (mode === 'shape') untouched = Object.getOwnPropertyDescriptor(self.otherType.prototype, 'value').set === undefined;
              self.postMessage({mode, restored: Object.defineProperty === native, error, untouched});
            };`});
          await route.fulfill({body: await readFile(resolve('public', relative)), contentType: ({'.js': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm'})[extname(relative)] || 'application/octet-stream'});
        } catch { missing.push(url.pathname); await route.abort(); }
      });
      if (scenario !== 'native') await context.addInitScript(() => {
        const NativeWorker = window.Worker;
        window.Worker = class extends NativeWorker {
          constructor(url, options) {
            const original = new URL(url, location.href);
            if (!original.pathname.endsWith('/cyberchef-worker.js')) { super(url, options); return; }
            const bootstrap = URL.createObjectURL(new Blob(['importScripts(' + JSON.stringify(original.href) + ');'], {type: 'text/javascript'}));
            super(bootstrap, options); this.bootstrap = bootstrap;
          }
          terminate() { super.terminate(); if (this.bootstrap) URL.revokeObjectURL(this.bootstrap); }
        };
      });
      const page = await context.newPage();
      await page.goto('https://arg.test' + prefix + 'correction-check.html');
      const result = await page.evaluate(async ({prefix, fixtures}) => {
        const {CyberChefClient} = await import(prefix + 'cyberchef-client.js');
        const client = new CyberChefClient();
        const completed = [];
        const text = response => new TextDecoder().decode(response.bytes);
        const run = (input, op, args = []) => client.bake(input, [{op, args}], {structured: true});
        const check = (actual, expected, label) => { if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(label + ': ' + JSON.stringify(actual) + ' !== ' + JSON.stringify(expected)); completed.push(label); };
        const lsbArgs = (colours, order, bit) => [...colours, ...Array(4 - colours.length).fill(''), order, bit];
        const expected = (rgba, width, height, colours, order, bit) => {
          const indexes = colours.map(colour => ['R', 'G', 'B', 'A'].indexOf(colour));
          const pixels = Array.from({length: width * height}, (_, index) => order === 'Row' ? index : index % height * width + Math.floor(index / height));
          const bits = pixels.flatMap(index => indexes.map(channel => (rgba[index * 4 + channel] >>> bit) & 1));
          const bytes = [];
          for (let offset = 0; offset < bits.length; offset += 8) bytes.push(parseInt(bits.slice(offset, offset + 8).join(''), 2));
          return bytes;
        };
        // The Decoder intentionally returns its original node tree. Project
        // only the test's JSON subset from real parsed fields; do not replace
        // the operation output or assume structured clone preserves getters.
        const semantic = (node, format) => {
          if (format === 'AMF0') {
            if ([0, 1, 2, 12].includes(node.marker)) return node.$value;
            if (node.marker === 5) return null;
            if (node.marker === 10) return node.values.map(value => semantic(value, format));
            if (node.marker === 3) return Object.fromEntries(node.properties.map(property => [property.key, semantic(property.value, format)]));
          } else {
            if (node.marker === 1) return null;
            if (node.marker === 2) return false;
            if (node.marker === 3) return true;
            if ([4, 5].includes(node.marker)) return node.$value;
            if (node.marker === 6) return node.stringOrReference.$value;
            if (node.marker === 9) return node.$values.map(value => semantic(value, format));
            if (node.marker === 10) return Object.fromEntries(node.$traits.sealedMemberNames.map((name, index) => [name.$value, semantic(node._values[index], format)]));
          }
          throw new Error('Unexpected AMF test node marker ' + node.marker);
        };
        try {
          for (const [bytes, expectedText, label] of [
            [[], 'ffff', 'empty'], [[255], 'ff', 'odd FF high byte'], [[1, 2, 3], 'fbfd', 'odd trailing byte'],
            [[255, 255], '00', 'ones complement zero'], [[255, 255, 255, 255, 0, 1], 'fffe', 'second end-around carry'],
            [[0, 1, 242, 3, 244, 245, 246, 247], '220d', 'RFC1071 vector']
          ]) check(text(await run(Uint8Array.from(bytes).buffer, 'TCP/IP Checksum')), expectedText, 'checksum ' + label);
          const long = new Uint8Array(262146); long.fill(255); long[long.length - 2] = 0; long[long.length - 1] = 1;
          check(text(await run(long.buffer, 'TCP/IP Checksum')), 'fffe', 'checksum beyond signed 32-bit sum');
          check(text(await client.bake(Uint8Array.of(255, 255, 255, 255, 0, 1).buffer, [{op: 'TCP/IP Checksum', args: []}, {op: 'To Upper case', args: ['All']}], {structured: true})), 'FFFE', 'checksum complete recipe and uppercase');

          const statistics = await run('AAB', 'Chi Square');
          if (Math.abs(statistics.dish.value - 1271 / 3) > 1e-10) throw new Error('Pearson AAB: ' + statistics.dish.value);
          completed.push('Pearson all 256 classes');
          check((await run(Uint8Array.from({length: 256}, (_, i) => i).buffer, 'Chi Square')).dish.value, 0, 'Pearson uniform distribution');
          check((await run('A', 'Chi Square')).dish.value, 255, 'Pearson zero-frequency classes');
          const statisticsChain = Number(text(await client.bake('AAB', [{op: 'Chi Square', args: []}, {op: 'To Upper case', args: ['All']}], {structured: true})));
          if (Math.abs(statisticsChain - 1271 / 3) > 1e-10) throw new Error('Pearson complete recipe: ' + statisticsChain);
          completed.push('Pearson complete recipe');

          const first = fixtures[0], input = Uint8Array.from(first.png).buffer;
          check(Array.from((await run(input, 'Extract LSB', lsbArgs(['R', 'G'], 'Row', 0))).bytes), [0x9c], '2x2 row RG');
          check(Array.from((await run(input, 'Extract LSB', lsbArgs(['R', 'G'], 'Column', 0))).bytes), [0xb4], '2x2 column RG exact byte');
          check(Array.from((await run(input, 'Extract LSB', lsbArgs(['R'], 'Row', 0))).bytes), [0x0a], '2x2 original right-aligned partial Row byte');
          check(Array.from((await run(input, 'Extract LSB', lsbArgs(['R'], 'Column', 0))).bytes), [0x0c], '2x2 right-aligned partial Column byte');
          for (const fixture of fixtures) for (const bit of [0, 1, 2, 7]) for (const colours of [['R'], ['G', 'B'], ['A', 'R', 'B', 'G'], ['R', 'R']]) {
            const image = Uint8Array.from(fixture.png).buffer;
            for (const order of ['Row', 'Column']) check(Array.from((await run(image, 'Extract LSB', lsbArgs(colours, order, bit))).bytes), expected(fixture.rgba, fixture.width, fixture.height, colours, order, bit), fixture.width + 'x' + fixture.height + ' ' + order + ' ' + colours.join('') + ' bit' + bit);
          }
          check(text(await client.bake(input, [{op: 'Extract LSB', args: lsbArgs(['R', 'G'], 'Column', 0)}, {op: 'To Hex', args: ['None', 0]}], {structured: true})), 'b4', 'LSB complete recipe and To Hex');

          for (const format of ['JPEG', 'TIFF']) {
            const fixture = fixtures[1], image = Uint8Array.from(fixture.png).buffer;
            const converted = await run(image, 'Convert Image Format', [format, 100, 'Auto', 1]);
            const decoded = text(await run(converted.bytes.buffer, 'Extract RGBA', [',', true])).split(',').map(Number);
            for (const bit of [0, 7]) for (const colours of [['R'], ['B', 'G', 'R', 'A']]) {
              const expectedBytes = expected(decoded, fixture.width, fixture.height, colours, 'Column', bit);
              check(Array.from((await run(converted.bytes.buffer, 'Extract LSB', lsbArgs(colours, 'Column', bit))).bytes), expectedBytes, format + ' column ' + colours.join('') + ' bit' + bit);
              check(text(await client.bake(image, [{op: 'Convert Image Format', args: [format, 100, 'Auto', 1]}, {op: 'Extract LSB', args: lsbArgs(colours, 'Column', bit)}, {op: 'To Hex', args: ['None', 0]}], {structured: true})), expectedBytes.map(byte => byte.toString(16).padStart(2, '0')).join(''), format + ' complete conversion/column/hex recipe');
            }
          }

          for (const [value, bytes] of [[true, [3]], [false, [2]], [null, [1]], [[], [9, 1, 1]]]) {
            check(Array.from((await run(JSON.stringify(value), 'AMF Encode', ['AMF3'])).bytes), bytes, 'AMF3 standard marker ' + JSON.stringify(value));
          }
          const values = [true, false, null, 0, 42, -1, 3.5, '', 'ARG', '你好 🧩', [],
            [true, false, null, 1.25, '你'], {'你好': '🧩', nested: [{a: true, b: []}, [false, null]]},
            JSON.parse('{"__proto__":{"x":true},"constructor":[]}')];
          for (const format of ['AMF0', 'AMF3']) for (const [index, value] of values.entries()) {
            const encoded = await run(JSON.stringify(value), 'AMF Encode', [format]);
            const decoded = await run(encoded.bytes.buffer, 'AMF Decode', [format]);
            check(semantic(decoded.dish.value, format), value, format + ' original Decoder node fields ' + index);
            const hex = Array.from(encoded.bytes, byte => byte.toString(16).padStart(2, '0')).join('');
            check(text(await client.bake(JSON.stringify(value), [{op: 'AMF Encode', args: [format]}, {op: 'To Hex', args: ['None', 0]}], {structured: true})), hex, format + ' complete encoding/hex recipe ' + index);
            const decodedChain = await client.bake(JSON.stringify(value), [{op: 'AMF Encode', args: [format]}, {op: 'AMF Decode', args: [format]}], {structured: true});
            check(semantic(decodedChain.dish.value, format), value, format + ' complete original encoding/decoding recipe ' + index);
          }
          const longStrings = ['a'.repeat(65535), 'é'.repeat(32767) + 'a', 'é'.repeat(32768), '你'.repeat(23334), 'a'.repeat(70000)];
          for (const format of ['AMF0', 'AMF3']) for (const [index, value] of longStrings.entries()) {
            const encoded = await run(JSON.stringify(value), 'AMF Encode', [format]);
            const decoded = await run(encoded.bytes.buffer, 'AMF Decode', [format]);
            check(semantic(decoded.dish.value, format), value, format + ' UTF8 byte length boundary ' + index);
            if (format === 'AMF0') check(encoded.bytes[0], new TextEncoder().encode(value).length > 65535 ? 12 : 2, 'AMF0 short/long marker boundary ' + index);
          }
          // Independently specified AMF bytes prevent an encoder/decoder pair
          // from hiding the same mistake. Embedded NUL is data in an AMF
          // length-delimited UTF-8 string, including property/trait names.
          for (const [format, hex] of [['AMF0', '020003410042'], ['AMF3', '0607410042']]) {
            const bytes = Uint8Array.from(hex.match(/../g), pair => parseInt(pair, 16));
            check(semantic((await run(bytes.buffer, 'AMF Decode', [format])).dish.value, format), 'A\0B', format + ' independently specified embedded-NUL bytes');
            check(text(await client.bake(JSON.stringify('A\0B'), [{op: 'AMF Encode', args: [format]}, {op: 'To Hex', args: ['None', 0]}], {structured: true})), hex, format + ' standard embedded-NUL encoding bytes unchanged');
          }
          const nulValues = ['\0', '\0A', 'A\0B', 'A\0', '你\0🧩\0好', '你\0'.repeat(18000),
            {'A\0B': '你\0好', '\0': ['\0A', null, true], '你\0🧩': {'\0键': '尾\0'}},
            ['A\0B', ['你\0🧩', false], {'\0开头': ['末\0', {'中\0键': '中\0文'}]}]];
          for (const format of ['AMF0', 'AMF3']) for (const [index, value] of nulValues.entries()) {
            const encoded = await run(JSON.stringify(value), 'AMF Encode', [format]);
            const decoded = await run(encoded.bytes.buffer, 'AMF Decode', [format]);
            check(semantic(decoded.dish.value, format), value, format + ' NUL/string/key/array original Decoder fields ' + index);
            const hex = Array.from(encoded.bytes, byte => byte.toString(16).padStart(2, '0')).join('');
            check(text(await client.bake(JSON.stringify(value), [{op: 'AMF Encode', args: [format]}, {op: 'To Hex', args: ['None', 0]}], {structured: true})), hex, format + ' NUL encoding/hex complete recipe ' + index);
            const chain = await client.bake(JSON.stringify(value), [{op: 'AMF Encode', args: [format]}, {op: 'AMF Decode', args: [format]}], {structured: true});
            check(semantic(chain.dish.value, format), value, format + ' NUL encoding/decoding complete recipe ' + index);
            if (format === 'AMF0' && typeof value === 'string') check(encoded.bytes[0], new TextEncoder().encode(value).length > 65535 ? 12 : 2, 'AMF0 NUL short/long string marker ' + index);
          }
          for (const mode of ['missing', 'throw', 'shape']) {
            const probe = await new Promise((resolve, reject) => {
              const worker = new Worker(prefix + 'correction-probe.js');
              worker.onmessage = ({data}) => { worker.terminate(); resolve(data); };
              worker.onerror = event => { event.preventDefault(); worker.terminate(); reject(new Error('AMF import probe failed')); };
              worker.postMessage(mode);
            });
            check(probe.restored, true, 'AMF temporary import hook restored ' + mode);
            if (mode !== 'shape' && !probe.error) throw new Error('AMF failed import must throw ' + mode);
            if (mode !== 'missing') check(probe.untouched, true, 'AMF rejected/failed shape leaves original prototype ' + mode);
          }
          return {completed};
        } catch (error) { return {completed, error: error.message}; }
        finally { client.close(); }
      }, {prefix, fixtures});
      assert.equal(result.error, undefined, scenario + ': ' + result.error);
      assert.deepEqual({missing, external}, {missing: [], external: []}, scenario);
      const adapterURL = 'https://arg.test' + prefix + 'cyberchef-operation-corrections.js';
      await context.route(adapterURL, route => route.fulfill({status: 503, body: 'Unavailable', contentType: 'text/javascript'}));
      const failed = await page.evaluate(async prefix => {
        const {CyberChefClient} = await import(prefix + 'cyberchef-client.js');
        const client = new CyberChefClient();
        try { await client.bake('abc', [{op: 'ROT13', args: [true, true, false, 13]}]); return {success: true}; }
        catch (error) { return {error: error.message, closed: client.closed}; }
        finally { client.close(); }
      }, prefix);
      assert.match(failed.error || '', /cyberchef-operation-corrections\.js/, scenario + ' adapter bootstrap failure');
      assert.equal(failed.closed, true, scenario + ' failed worker terminated');
      await context.unroute(adapterURL);
      const recovered = await page.evaluate(async prefix => {
        const {CyberChefClient} = await import(prefix + 'cyberchef-client.js');
        const client = new CyberChefClient();
        try { return new TextDecoder().decode((await client.bake(Uint8Array.of(255, 255, 255, 255, 0, 1).buffer, [{op: 'TCP/IP Checksum', args: []}])).bytes); }
        finally { client.close(); }
      }, prefix);
      assert.equal(recovered, 'fffe', scenario + ' new worker retries the adapter');
      assert.deepEqual({missing, external}, {missing: [], external: []}, scenario);
      console.log('PASS: operation corrections ' + scenario + ', ' + (result.completed.length + 2) + ' actual Worker cases.');
    } finally { await context.close(); }
  }
  for (const [path, sha] of before) assert.equal(createHash('sha256').update(await readFile('public/vendor/cyberchef/' + path)).digest('hex'), sha, 'upstream bytes unchanged: ' + path);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const {chromium} = createRequire(new URL('../test-tools/package.json', import.meta.url))('playwright');
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage']});
  try { await checkChefCorrections(browser); } finally { await browser.close(); }
}
