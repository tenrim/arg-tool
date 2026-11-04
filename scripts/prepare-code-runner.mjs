// Explicit maintenance download; not imported by the application or normal build.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
const root = fileURLToPath(new URL('../services/code-runner/', import.meta.url));
const artifacts = JSON.parse(await fs.readFile(path.join(root, 'ARTIFACTS.json'), 'utf8'));
const hash = (data) => createHash('sha256').update(data).digest('hex');
for (const artifact of artifacts) {
  if (!/^(kotlin-lib\/)?[a-z0-9.-]+$/.test(artifact.file) || artifact.file.includes('..'))
    throw Error('安装包路径无效');
  const target = path.join(root, artifact.file);
  const existing = await fs.readFile(target).catch((error) => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (existing) {
    if (hash(existing) !== artifact.sha256) throw Error('已有安装包校验不符：' + artifact.file);
    console.log('Verified', artifact.file);
    continue;
  }
  await fs.mkdir(path.dirname(target), { recursive: true });
  await exec(
    process.platform === 'win32' ? 'curl.exe' : 'curl',
    [
      '-fLsS',
      '--connect-timeout',
      '20',
      '--max-time',
      '600',
      '--continue-at',
      '-',
      artifact.url,
      '-o',
      target + '.part',
    ],
    { windowsHide: true, maxBuffer: 1024 * 1024 },
  );
  if (hash(await fs.readFile(target + '.part')) !== artifact.sha256)
    throw Error('下载校验不符：' + artifact.file);
  await fs.rename(target + '.part', target);
  console.log('Downloaded and verified', artifact.file);
}
