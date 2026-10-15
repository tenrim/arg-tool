import {readFile,writeFile,readdir,mkdir,copyFile,lstat} from 'node:fs/promises';
import {resolve,relative,join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const hash=b=>createHash('sha256').update(b).digest('hex');
const outIndex=process.argv.indexOf('--out');
if(outIndex>=0&&!process.argv[outIndex+1])throw Error('--out requires a directory');
const out=resolve(outIndex<0?'/tmp/arg-release':process.argv[outIndex+1]);
for(const dir of ['dist','public'])if(out===resolve(dir)||out.startsWith(resolve(dir)+'/'))throw Error('Keep release artifacts outside public/dist');
async function inventory(dir){const entries=[];async function walk(base){for(const e of await readdir(base,{withFileTypes:true})){const path=join(base,e.name);if(e.isSymbolicLink()||!(await lstat(path)).isFile()&&!e.isDirectory())throw Error('Unexpected entry '+path);if(e.isDirectory())await walk(path);else entries.push({path:relative(dir,path),sha256:hash(await readFile(path))});}}await walk(dir);return entries.sort((a,b)=>a.path.localeCompare(b.path,'en'));}
const [source,built]=await Promise.all([inventory('public'),inventory('dist')]);
if(JSON.stringify(source)!==JSON.stringify(built))throw Error('dist differs from public; run npm run build first');
if(!built.some(f=>f.path==='index.html'))throw Error('Missing entrypoint');
if(built.some(f=>/^round4\/(graph|geometry|circuit)(-view)?\.js$|^vendor\/round4\/(graph|geometry|circuit)\.js|JointJS-source/.test(f.path)))throw Error('Retired tool in release');
await mkdir(out,{recursive:true});
for(const [src,dst]of [['deploy/1PANEL.md','部署说明.md'],['deploy/1panel-locations.conf','1panel-locations.conf']])await copyFile(src,join(out,dst));
await writeFile(join(out,'site-files.sha256'),built.map(f=>`${f.sha256}  ${f.path}`).join('\n')+'\n');
let baseline='unavailable';try{baseline=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{}
await writeFile(join(out,'release.json'),JSON.stringify({created_at:new Date().toISOString(),source_baseline:baseline,file_count:built.length,content_sha256:hash(JSON.stringify(built)),format:'Static site; site.zip extracts index.html at root',retired:['graph','geometry','circuit']},null,2)+'\n');
execFileSync('python3',['-c',`import pathlib,sys,zipfile
root=pathlib.Path(sys.argv[1]);out=pathlib.Path(sys.argv[2])
with zipfile.ZipFile(out/'site.zip','w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(root.rglob('*')):
  if p.is_file(): z.write(p,p.relative_to(root))
with zipfile.ZipFile(out/'site.zip') as z:
 assert z.testzip() is None
 assert 'index.html' in z.namelist()
`,resolve('dist'),out]);
const names=['site.zip','site-files.sha256','release.json','部署说明.md','1panel-locations.conf'];
await writeFile(join(out,'SHA256SUMS'),(await Promise.all(names.map(async n=>`${hash(await readFile(join(out,n)))}  ${n}`))).join('\n')+'\n');
execFileSync('python3',['-c',`import pathlib,sys,zipfile
out=pathlib.Path(sys.argv[1]);names=sys.argv[2:]
with zipfile.ZipFile(out/'迷雾工具箱-1Panel发布包.zip','w',zipfile.ZIP_STORED) as z:
 for n in names:z.write(out/n,n)
with zipfile.ZipFile(out/'迷雾工具箱-1Panel发布包.zip') as z:assert z.testzip() is None
`,out,...names,'SHA256SUMS']);
console.log(`PASS: ${built.length} verified static files. Release: ${out}/迷雾工具箱-1Panel发布包.zip`);
