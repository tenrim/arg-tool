import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import {localPath} from './module-graph.mjs';
let failed = false;
const filesIndex=process.argv.indexOf('--files');
async function check(file){
  const classicWorker = file.replaceAll('\\','/') === 'public/vendor/cyberchef/ChefWorker.js';
  const result = classicWorker
    ? spawnSync(process.execPath, ['--input-type=commonjs', '--check'], {input:await readFile(file), encoding:'utf8'})
    : spawnSync(process.execPath, ['--check',file], {encoding:'utf8'});
  if(result.status!==0){console.error(result.stderr);failed=true;}
}
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory() && entry.name!=='vendor') await walk(file);
    else if (/\.(js|mjs)$/.test(entry.name)) {
      await check(file);
    }
  }
}
if(filesIndex>=0){
  const files=process.argv.slice(filesIndex+1);if(!files.length)throw Error('--files needs paths');
  for(const file of files)await check(localPath(file));
}else{
  await import('./audit-ui.mjs');await import('./audit-docs.mjs');
  await walk('public');await walk('scripts');await walk('tests');
}
if (failed) process.exit(1);
console.log('JavaScript syntax checks passed.');
