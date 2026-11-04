// Offline maintenance build. Fixed original files remain byte-for-byte intact.
import { build } from '../tools/ui-runtime/node_modules/esbuild/lib/main.js';
import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { provenance } from './fun-tools-provenance.mjs';
const root = path.resolve(import.meta.dirname, '..');
const upstream = path.join(root, 'upstream/fun-tools');
const out = path.join(root, 'public/vendor/fun-tools');
await mkdir(out, { recursive: true });
const src = (id, file) => path.join(upstream, id, 'source', file);
const put = async (name, contents) => {
  await mkdir(path.dirname(path.join(out, name)), { recursive: true });
  await writeFile(path.join(out, name), contents);
};
await put('spectrum-demo.ogg', await readFile(src('spectrum', 'app/assets/demo.ogg')));
for (const id of [
  'pic-scramble',
  'visual-crypto',
  'hidden-watermark',
  'buddha',
  'spectrotrace',
  'spectrum',
  'hideinfo',
  'beast',
  'watermark-app',
  'stegcloak',
]) {
  const record = JSON.parse(await readFile(path.join(upstream, id, 'SOURCE.json'), 'utf8'));
  for (const [name, hash] of Object.entries(record.files)) {
    const bytes = await readFile(src(id, name));
    if (createHash('sha256').update(bytes).digest('hex') !== hash)
      throw Error(`${id}/${name} changed`);
  }
  await put(`${id}-SOURCE.json`, JSON.stringify(record, null, 2));
  await put(`${id}-LICENSE.txt`, await readFile(src(id, 'LICENSE')));
}
await put('screendrop-NOTICE.txt', await readFile(src('screendrop', 'README.md')));
await put('crypttool-NOTICE.txt', await readFile(src('crypttool', 'rust/crypt_tool/Cargo.toml')));
await copyFile(src('stegcloak', 'dist/stegcloak.min.js'), path.join(out, 'stegcloak.min.js'));
await copyFile(
  path.join(upstream, 'node_modules/crypto-js/crypto-js.js'),
  path.join(out, 'crypto-js.js'),
);
await copyFile(
  path.join(upstream, 'node_modules/crypto-js/LICENSE'),
  path.join(out, 'crypto-js-LICENSE.txt'),
);
await copyFile(src('screendrop', 'qrcode.min.js'), path.join(out, 'qrcode.js'));
await copyFile(
  path.join(upstream, 'node_modules/qrcode/license'),
  path.join(out, 'qrcode-LICENSE.txt'),
);
const pic = await readFile(src('pic-scramble', 'index.html'), 'utf8');
await put(
  'gilbert.js',
  '// Extracted unchanged from pic-scramble index.html:107–181 (MIT).\n' +
    pic.slice(
      pic.indexOf('function gilbert2d'),
      pic.indexOf('</script>', pic.indexOf('function gilbert2d')),
    ) +
    '\nexport { gilbert2d };\n',
);
const buddha = await readFile(src('buddha', 'js/main.js'), 'utf8');
const pairs = [
  ...buddha
    .slice(buddha.indexOf('function togod'), buddha.indexOf('function toman'))
    .matchAll(/replaceAll\("([^"]+)", "([^"]+)"\)/g),
].map(([, a, b]) => [a.replaceAll('\\', ''), b]);
await put(
  'buddha-map.js',
  '// Takuron V2 main.js:81–225; MIT.\nexport default ' + JSON.stringify(pairs) + ';\n',
);
const protocol = await readFile(src('screendrop', 'protocol.js'), 'utf8');
await put(
  'screendrop.js',
  protocol +
    '\nexport { encodeFile, decodePacket, mergeChunksWithMetadata, parseFirstPayloadMetadata, sha256Bytes, bytesToHex, uint8ArrayToBase64, base64ToUint8Array };\n',
);
const common = {
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  legalComments: 'linked',
  nodePaths: [path.join(upstream, 'node_modules')],
};
await build({
  ...common,
  entryPoints: [src('spectrotrace', 'app/lib/audio/generateFromImage.ts')],
  outfile: path.join(out, 'spectrotrace.js'),
});
await build({
  ...common,
  entryPoints: [path.join(upstream, 'node_modules/beast-codec/dist/index.js')],
  outfile: path.join(out, 'beast.js'),
});
await build({
  ...common,
  entryPoints: [path.join(upstream, 'aac-worker-source.js')],
  outfile: path.join(out, 'aac-worker.js'),
});
await build({
  ...common,
  entryPoints: [path.join(upstream, 'audio-decoders-worker-source.js')],
  outfile: path.join(out, 'audio-decoders-worker.js'),
});
await build({
  ...common,
  entryPoints: [src('spectrum', 'app/lib/audio.ts')],
  outfile: path.join(out, 'spectrum-audio.js'),
  plugins: [
    {
      name: 'standalone-aac-decoder',
      setup(build) {
        build.onLoad({ filter: /[\\/]app[\\/]lib[\\/]audio\.ts$/ }, async (args) => {
          let contents = await readFile(args.path, 'utf8');
          contents = contents.replace(
            'async function decodeWasm(engine: Engine, bytes: Uint8Array)',
            'async function decodeWasm(engine: Engine, bytes: Uint8Array, signal?: AbortSignal)',
          );
          contents = contents.replace(
            '  const decode = (await WASM_DECODERS[engine]()).default;',
            '  if (signal?.aborted) throw new DOMException("已停止", "AbortError");\n  const decode = (await WASM_DECODERS[engine]()).default;\n  if (signal?.aborted) throw new DOMException("已停止", "AbortError");',
          );
          contents = contents.replace(
            'export async function decodeAudioFile(data: ArrayBuffer)',
            'export async function decodeAudioFile(data: ArrayBuffer, signal?: AbortSignal)',
          );
          contents = contents
            .replace('decodeWasm("amr", bytes)', 'decodeWasm("amr", bytes, signal)')
            .replace('decodeWasm(engine, bytes)', 'decodeWasm(engine, bytes, signal)');
          contents = contents.replace(
            '  if (native) return native;',
            '  if (signal?.aborted) throw new DOMException("已停止", "AbortError");\n  if (native) return native;',
          );
          return { contents, loader: 'ts' };
        });
        build.onResolve({ filter: /^@audio\/decode-[a-z]+$/ }, (args) => ({
          path: args.path.slice('@audio/decode-'.length),
          namespace: 'codec-process',
        }));
        build.onLoad({ filter: /.*/, namespace: 'codec-process' }, (args) => ({
          contents: `import { audioDecoder } from '../../fun-tools/aac-client.js'; export default audioDecoder(${JSON.stringify(args.path)});`,
          loader: 'js',
        }));
        build.onResolve({ filter: /aac-client\.js$/ }, () => ({
          path: '../../fun-tools/aac-client.js',
          external: true,
        }));
      },
    },
  ],
});
await build({
  ...common,
  entryPoints: [path.join(upstream, 'spectrum-worker-source.js')],
  outfile: path.join(out, 'spectrum-worker.js'),
  loader: { '.wasm': 'file' },
  assetNames: '[name]-[hash]',
});
await provenance();
const hashes = {};
for (const file of await readdir(out))
  if (file !== 'MANIFEST.json')
    hashes[file] = createHash('sha256')
      .update(await readFile(path.join(out, file)))
      .digest('hex');
await put('MANIFEST.json', JSON.stringify(hashes, null, 2) + '\n');
console.log('趣味工具本地运行资源已生成。');
