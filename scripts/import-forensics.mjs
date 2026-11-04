// Explicit maintenance import; never runs during the offline website build.
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
const commit = 'feec31092f0e548513d76545293caa41eb4f1ad8';
const root = 'upstream/aperisolve-single';
const records = [];
async function get(path) {
  const response = await fetch(
    `https://api.github.com/repos/Zeecka/AperiSolve/contents/${path}?ref=${commit}`,
    { signal: AbortSignal.timeout(30000) },
  );
  if (!response.ok) throw Error(`${path}: ${response.status}`);
  return response.json();
}
async function save(path) {
  const data = await get(path);
  const bytes = Buffer.from(data.content, 'base64');
  if (!bytes.length) throw Error(`Empty upstream file: ${path}`);
  await mkdir(dirname(`${root}/${path}`), { recursive: true });
  await writeFile(`${root}/${path}`, bytes);
  records.push({ path, sha256: createHash('sha256').update(bytes).digest('hex') });
}
const modules = await get('aperisolve/analyzers');
const paths = [
  ...modules.filter((x) => x.name.endsWith('.py')).map((x) => x.path),
  'aperisolve/config.py',
  'aperisolve/filetype.py',
  'aperisolve/utils/png.py',
  'aperisolve/utils/utils.py',
  'aperisolve/models.py',
  'LICENSE',
  'Dockerfile',
  'docker/config.guess',
  'docker/config.sub',
  'docker/pdfid.py',
];
for (let i = 0; i < paths.length; i += 3) await Promise.all(paths.slice(i, i + 3).map(save));
await writeFile(
  `${root}/SOURCE.json`,
  JSON.stringify(
    {
      repository: 'https://github.com/Zeecka/AperiSolve',
      commit,
      files: records.sort((a, b) => a.path.localeCompare(b.path)),
    },
    null,
    2,
  ) + '\n',
);
console.log(`Pinned ${records.length} files at ${commit}`);
const runtime = JSON.parse(await readFile(`${root}/RUNTIME_SOURCE.json`, 'utf8'));
const asset = runtime.openstego;
let bytes = await readFile(`${root}/${asset.file}`).catch(() => null);
if (!bytes || createHash('sha256').update(bytes).digest('hex') !== asset.sha256) {
  const response = await fetch(asset.assetApi, {
    headers: { Accept: 'application/octet-stream' },
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) throw Error(`OpenStego: ${response.status}`);
  bytes = Buffer.from(await response.arrayBuffer());
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256)
    throw Error('OpenStego release asset hash mismatch');
  await writeFile(`${root}/${asset.file}`, bytes);
}
console.log('Verified pinned OpenStego release package');
