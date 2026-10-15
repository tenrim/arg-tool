// Maintenance-only import. Normal builds remain offline and verify every pin.
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const projects = {
  cryptii: {repo: 'cryptii/cryptii', commit: 'c04a823b5f3f0c8dfc9d8a4bd10e35ef8177d642', files: ['LICENSE.txt', 'README.md', 'package.json', 'src/ArrayUtil.js', 'src/Encoder/PolybiusSquare.js', 'src/Encoder/TapCode.js']},
  romanice: {repo: 'dkin-om/romanice', commit: '8923e049da2558b2c23c7d1b4c2fe806afbcc494', files: ['LICENSE', 'README.md', 'package.json', 'src/index.js', 'src/converter.js', 'src/symbols.js']},
  invisibles: {repo: 'cig13zs/invisibles', commit: '5ab9e06817539817830caafe0f652a582a9258e9', files: ['LICENSE', 'README.md', 'core.js']},
  baudot: {repo: 'zenoamaro/baudot.js', commit: '5f1a01d7d774f5c5583bc9591d09cb09e74c2140', files: ['LICENSE.md', 'README.md', 'package.json', 'src/baudot.ts', 'src/baudot.test.ts']},
};
let previous = {files: []};
try {previous = JSON.parse(await readFile(join(root, 'upstream/basics/imports.json'), 'utf8'));} catch (error) {if (error.code !== 'ENOENT') throw error;}
const expected = new Map(previous.files.map(file => [file.path, file.sha256])), records = [];
for (const [name, project] of Object.entries(projects)) for (const file of project.files) {
  const url = `https://raw.githubusercontent.com/${project.repo}/${project.commit}/${file}`;
  const bytes = execFileSync('curl', ['--fail', '--silent', '--show-error', '--location', '--max-time', '45', url], {maxBuffer: 2 * 1024 * 1024});
  const path = `upstream/basics/sources/${name}/${file}`, sha256 = createHash('sha256').update(bytes).digest('hex');
  if (expected.has(path) && expected.get(path) !== sha256) throw Error('Basic source integrity mismatch: ' + path);
  await mkdir(join(root, path, '..'), {recursive: true});await writeFile(join(root, path), bytes);records.push({path, url, sha256});
}
await writeFile(join(root, 'upstream/basics/imports.json'), JSON.stringify({projects, files: records}, null, 2) + '\n');
console.log('Imported pinned basic conversion sources:', records.length);
