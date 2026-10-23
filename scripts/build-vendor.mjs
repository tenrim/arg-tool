import './build-image-vendor.mjs';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, relative, dirname } from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
const source = join(root, 'upstream/puzzle-lib/src');
const destination = join(root, 'public/vendor/puzzle-lib');

async function compile(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) await compile(full);
    else if (entry.name.endsWith('.ts')) {
      const output = join(destination, relative(source, full).replace(/\.ts$/, '.js'));
      let code = stripTypeScriptTypes(await readFile(full, 'utf8'), { mode: 'transform' });
      code = code.replace(/(from\s+['"])(\.{1,2}\/[^'"]+)(['"])/g, (match, a, path, b) => a + (path.endsWith('.js') ? path : path + '.js') + b);
      await mkdir(dirname(output), { recursive: true });
      await writeFile(output, '// Adapted from puzzle-lib; MIT, Kyle Farnung. See LICENSE.txt.\n' + code);
    }
  }
}
await compile(source);
await writeFile(join(destination, 'LICENSE.txt'), (await readFile(join(root, 'upstream/puzzle-lib/LICENSE'), 'utf8')).replaceAll('\r\n', '\n'));
const fftSource = (await readFile(join(root, 'upstream/fft.js/fft.cjs'), 'utf8')).replaceAll('\r\n', '\n');
await writeFile(join(root, 'public/vendor/fft.js'), '// fft.js, MIT, Fedor Indutny. See fft-LICENSE.txt.\n' + fftSource.replace('module.exports = FFT;', 'export default FFT;'));
const readme = (await readFile(join(root, 'upstream/fft.js/README.md'), 'utf8')).replaceAll('\r\n', '\n');
await writeFile(join(root, 'public/vendor/fft-LICENSE.txt'), readme.slice(readme.indexOf('#### LICENSE') + 13).trim());
console.log('Vendor modules generated.');
