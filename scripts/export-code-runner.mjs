// Export provenance from the actual built image, never substitute source labels.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { containerCommand } from '../services/code-runner/process.mjs';
const exec = promisify(execFile);
const image = process.env.CODE_RUNNER_IMAGE || 'mist-code-runner:20261103';
async function docker(args) {
  const [command, argv] = containerCommand(process.env, args);
  const result = await exec(command, argv, {
    windowsHide: true,
    timeout: 60000,
    maxBuffer: 32 * 1024 * 1024,
  });
  return result.stdout;
}
const [info] = JSON.parse(await docker(['image', 'inspect', image]));
const read = (entry, ...args) =>
  docker([
    'run',
    '--rm',
    '--network=none',
    '--read-only',
    '--user=65534:65534',
    '--cap-drop=ALL',
    '--security-opt=no-new-privileges',
    '--memory=256m',
    '--cpus=0.5',
    '--entrypoint=' + entry,
    info.Id,
    ...args,
  ]);
const versions = JSON.parse(await read('cat', '/opt/mist-code/manifest.json'));
const notice = await read('cat', '/opt/mist-code/NOTICE.txt');
const packages = await read('dpkg-query', '--show');
if (
  !notice.includes('/usr/share/swift/LICENSE.txt') ||
  !notice.includes('/usr/share/common-licenses/GPL-3')
)
  throw Error('运行时或共享许可缺失');
const sha = (value) => createHash('sha256').update(value).digest('hex');
const sources = {};
for (const file of ['Dockerfile', 'profiles.json', 'runner.py', 'ARTIFACTS.json'])
  sources[file] = sha(await fs.readFile('services/code-runner/' + file));
const bases = [];
for (const name of ['dart:3.6.0', 'swift:6.0.3-noble']) {
  const [base] = JSON.parse(await docker(['image', 'inspect', name]));
  bases.push({ name, id: base.Id, digests: base.RepoDigests });
}
await fs.writeFile('public/licenses/CODE-RUNNER-NOTICE.txt', notice);
await fs.writeFile('services/code-runner/PACKAGES.txt', packages);
await fs.writeFile(
  'services/code-runner/RUNTIME.json',
  JSON.stringify(
    {
      builtImage: image,
      id: info.Id,
      created: info.Created,
      platform: info.Os + '/' + info.Architecture,
      size: info.Size,
      bases,
      versions,
      sources,
      noticeSha256: sha(notice),
      packagesSha256: sha(packages),
    },
    null,
    2,
  ) + '\n',
);
console.log('Exported actual versions, packages and original notices:', info.Id);
