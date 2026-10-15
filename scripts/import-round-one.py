"""Maintenance import from pinned npm archives and Git revisions. Not run at site startup."""
import pathlib, shutil, json, hashlib, re, os, urllib.request, subprocess, tarfile, io
ROOT=pathlib.Path(__file__).resolve().parent.parent
CACHE=pathlib.Path('/tmp/arg-round1')
OUT=ROOT/'public/vendor/round1'; OUT.mkdir(parents=True,exist_ok=True)
VERSIONS={**{n:'3.2.6' for n in ['cnchar','cnchar-order','cnchar-radical','cnchar-code','cnchar-input','cnchar-idiom','cnchar-xhy','cnchar-trad']},'pinyin-pro':'3.29.4','opencc-js':'1.4.2','tone':'15.1.22','cubejs':'1.3.2','cubing':'0.63.8','three':'0.170.0','random-uint-below':'3.3.0'}
REVISIONS={'substitution':('cateyelow/substitution-cipher-solver','c4acfdec7e33ab58885c248142a2d34ed68233f6'),'qrazybox':('Merricx/qrazybox','72a0b00717c8bdebb6932174274c981e2c78fdaa'),'telegraph':('kirklin/chinese-telegraph-code','3f71155805e6905992c630ccb90119dde6877cfe')}
MAKEME_REV='bddc96d41bef78427ed0e034e9f7e31d71fd1b92'
CUBING_REV='d02c02fc90f3410e612315141072a47af03feb97'
for name,version in VERSIONS.items():
 dest=CACHE/name; meta=dest/'package/package.json'
 if not meta.exists() or json.loads(meta.read_text())['version']!=version:
  url=f'https://registry.npmjs.org/{name}/-/{name}-{version}.tgz'
  with tarfile.open(fileobj=io.BytesIO(urllib.request.urlopen(url).read()),mode='r:gz') as t:t.extractall(dest,filter='data')
for name,(repo,revision) in REVISIONS.items():
 dest=CACHE/name
 if not (dest/'.git').exists():subprocess.run(['git','clone','--quiet','https://github.com/'+repo+'.git',str(dest)],check=True)
 subprocess.run(['git','checkout','--quiet',revision],cwd=dest,check=True)
records=[]
def copy(src,dst):
 dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
def tree(src,dst):
 for f in src.rglob('*'):
  if f.is_file() and f.suffix not in ['.map','.ts']:copy(f,dst/f.relative_to(src))
def package(name,items,repo):
 src=CACHE/name/'package';p=json.loads((src/'package.json').read_text());dest=OUT/name;dest.mkdir(exist_ok=True)
 for a,b in items:
  f=src/a
  if f.is_dir():tree(f,dest/b)
  else:copy(f,dest/b)
 for f in src.iterdir():
  if f.is_file() and (re.search('license|notice|readme',f.name,re.I) or f.name=='package.json'):copy(f,dest/f.name)
 records.append(dict(name=name,version=p['version'],repository=repo,license=p.get('license'),source_url=f'https://registry.npmjs.org/{name}/-/{name}-{p["version"]}.tgz'))
for name in ['cnchar','cnchar-order','cnchar-radical','cnchar-code','cnchar-input','cnchar-idiom','cnchar-xhy','cnchar-trad']:
 package(name,[(next((CACHE/name/'package').glob('*.min.js')).name,'index.js')],'https://github.com/theajack/cnchar')
package('pinyin-pro',[('dist','dist')],'https://github.com/zh-lx/pinyin-pro')
package('opencc-js',[('dist/esm/full.js','full.js'),('LICENSES','LICENSES')],'https://github.com/nk2028/opencc-js')
package('tone',[('build/Tone.js','Tone.js'),('build/Tone.js.LICENSE.txt','Tone.js.LICENSE.txt')],'https://github.com/Tonejs/Tone.js')
package('cubejs',[('lib','lib')],'https://github.com/ldez/cubejs')
package('cubing',[('dist/lib','lib')],'https://github.com/cubing/cubing.js')
for license in ['LICENSE-MPL.md','LICENSE-GPL.md']:
 (OUT/'cubing'/license).write_bytes(urllib.request.urlopen(f'https://raw.githubusercontent.com/cubing/cubing.js/{CUBING_REV}/'+license).read())
for name in ['three','random-uint-below']:
 src=CACHE/name/'package';dest=OUT/name
 tree(src/'src' if name=='three' else src/'dist/esm',dest/('src' if name=='three' else 'dist/esm'))
 for file in ['package.json','LICENSE','LICENSE.md','README.md']:
  if (src/file).exists():copy(src/file,dest/file)
 p=json.loads((src/'package.json').read_text());records.append(dict(name=name,version=p['version'],license=p['license'],repository=p.get('repository'),source_url=f'https://registry.npmjs.org/{name}/-/{name}-{p["version"]}.tgz'))
# Native browser modules: resolve npm-only bare specifiers to local relative paths.
for f in (OUT/'cubing/lib').rglob('*.js'):
 s=f.read_text()
 def remap(m):
  spec=m.group(1)
  if spec.startswith('three/'):target=OUT/'three'/spec[6:]
  elif spec=='random-uint-below':target=OUT/'random-uint-below/dist/esm/index.js'
  else:return m.group(0)
  rel=os.path.relpath(target,f.parent);return '"'+(rel if rel.startswith('.') else './'+rel)+'"'
 f.write_text(re.sub(r'"(three/[^"\n]+|random-uint-below)"',remap,s))
for folder,repo,items in [('substitution','cateyelow/substitution-cipher-solver',['src','LICENSE','README.md']),('qrazybox','Merricx/qrazybox',['js/qr.js','js/table.js','LICENSE','README.md']),('telegraph','kirklin/chinese-telegraph-code',['data/cn.json','data/tw.json','LICENSE','DATA_LICENSE.md','README.md'])]:
 src=CACHE/folder;dest=OUT/folder
 for item in items:
  if (src/item).is_dir():
   for f in (src/item).rglob('*'):
    if f.is_file():copy(f,dest/f.relative_to(src))
  else:copy(src/item,dest/item)
 sha=subprocess.check_output(['git','rev-parse','HEAD'],cwd=src,text=True).strip()
 records.append(dict(name=folder,repository='https://github.com/'+repo,commit=sha,license='MIT; Unicode data license' if folder=='telegraph' else 'MIT'))
# Decomposition data: code and data retain distinct source notices.
for file in ['dictionary.txt','COPYING','README.md','LGPL']:
 dest=OUT/'makemeahanzi'/file;dest.parent.mkdir(exist_ok=True);dest.write_bytes(urllib.request.urlopen(f'https://raw.githubusercontent.com/skishore/makemeahanzi/{MAKEME_REV}/'+file).read())
records.append(dict(name='makemeahanzi',repository='https://github.com/skishore/makemeahanzi',commit=MAKEME_REV,license='LGPL-3.0-or-later (dictionary only)',source_url=f'https://raw.githubusercontent.com/skishore/makemeahanzi/{MAKEME_REV}/dictionary.txt'))
(OUT/'makemeahanzi'/'GPL').write_bytes(urllib.request.urlopen('https://raw.githubusercontent.com/cubing/cubing.js/'+CUBING_REV+'/LICENSE-GPL.md').read())
(OUT/'PROJECTS.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
print('Imported',len(records),'components')
