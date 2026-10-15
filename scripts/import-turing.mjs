// Maintenance-only network import. Ordinary builds use build-turing.mjs offline.
import {readFile, writeFile, mkdir, mkdtemp, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const commit = 'b4dab9e4a649051ada94cb352c48ec177da5952e';
const version = '4.3.2';
const integrity = 'sha512-SFNOvSJ+Dgf/9An904Yx+CgSlIPCkIpao4qo51lpee25TIRejdH3rhR4EZMGoNx3/TP3O+wzWuiTFl4sqbltzA==';
const files = ['LICENSE', 'README.md', 'package.json', 'src/TuringMachine.js', 'src/tape/Tape.js', 'src/parser.js', 'src/state-diagram/StateGraph.js', ...['binaryAdd', 'binaryIncrement', 'binaryMult', 'busyBeaver3', 'busyBeaver4', 'copy1s', 'divisibleBy3', 'divisibleBy3Base10', 'lengthMult', 'matchBinaryStrings', 'matchThreeLengths', 'palindrome', 'powersOfTwo', 'repeat01', 'unaryMult'].map(name => `src/examples/${name}.yaml`)];
let previous = {files: []};
try {previous = JSON.parse(await readFile(join(root, 'upstream/turing/imports.json'), 'utf8'));} catch (error) {if (error.code !== 'ENOENT') throw error;}
// A reviewed version change is explicit in this source pin. For the same version,
// enforce every prior digest; the unrelated Turing upstream pin stays strict.
const previousYAMLVersion = previous.packages?.['js-yaml']?.version;
const expected = new Map(previous.files.filter(record => !record.path.startsWith('upstream/turing/sources/js-yaml/') || previousYAMLVersion === version).map(record => [record.path, record.sha256]));
const records = [];
async function save(path, bytes, url) {
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (expected.has(path) && expected.get(path) !== sha256) throw Error('Turing import integrity mismatch: ' + path);
  await mkdir(join(root, path, '..'), {recursive: true});
  await writeFile(join(root, path), bytes);
  records.push({path, url, sha256});
}
function download(url) {return execFileSync('curl', ['--fail', '--silent', '--show-error', '--location', '--max-time', '60', url], {maxBuffer: 2 * 1024 * 1024});}
for (const file of files) {
  const url = `https://raw.githubusercontent.com/aepsilon/turing-machine-viz/${commit}/${file}`;
  await save('upstream/turing/sources/turing-machine-viz/' + file, download(url), url);
}
const packageURL = `https://registry.npmjs.org/js-yaml/-/js-yaml-${version}.tgz`;
const archive = download(packageURL);
if ('sha512-' + createHash('sha512').update(archive).digest('base64') !== integrity) throw Error('js-yaml package integrity mismatch');
await save(`upstream/turing/sources/js-yaml-${version}.tgz`, archive, packageURL);
if (previousYAMLVersion && previousYAMLVersion !== version && /^\d+\.\d+\.\d+$/.test(previousYAMLVersion)) await rm(join(root, `upstream/turing/sources/js-yaml-${previousYAMLVersion}.tgz`), {force: true});
const temporary = await mkdtemp(join(tmpdir(), 'mist-turing-import-'));
try {
  const archivePath = join(temporary, 'package.tgz');
  await writeFile(archivePath, archive);
  execFileSync('tar', ['xzf', archivePath, '-C', temporary, 'package/LICENSE', 'package/README.md', 'package/package.json', 'package/dist/js-yaml.mjs']);
  for (const file of ['LICENSE', 'README.md', 'package.json', 'dist/js-yaml.mjs']) await save('upstream/turing/sources/js-yaml/' + file, await readFile(join(temporary, 'package', file)), packageURL);
} finally {await rm(temporary, {recursive: true, force: true});}
await writeFile(join(root, 'upstream/turing/imports.json'), JSON.stringify({pins: {'turing-machine-viz': commit}, packages: {'js-yaml': {version, integrity}}, files: records}, null, 2) + '\n');
console.log('Imported pinned Turing machine sources:', records.length);
