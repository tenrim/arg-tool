# Maintenance only. Fetch exact pinned npm versions and Git snapshots; ordinary builds stay offline.
import urllib.request,json,tarfile,io,hashlib,pathlib,concurrent.futures,base64
root=pathlib.Path.cwd()
pkgs={'astronomy-engine':'2.1.19','lunar-javascript':'1.7.7','@rdkit/rdkit':'2026.9.1'}
def pull(item):
 name,version=item; meta=json.load(urllib.request.urlopen(f'https://registry.npmjs.org/{name}/{version}'));raw=urllib.request.urlopen(meta['dist']['tarball']).read();alg,expected=meta['dist']['integrity'].split('-',1);assert base64.b64encode(hashlib.new(alg,raw).digest()).decode()==expected
 dest=root/'upstream/science/sources'/f'{name.replace("/","-")}-{version}';dest.mkdir(parents=True,exist_ok=True)
 with tarfile.open(fileobj=io.BytesIO(raw),mode='r:gz') as t:
  for f in t.getmembers():
   if not f.isfile():continue
   rel=pathlib.PurePosixPath(f.name);assert rel.parts[0]=='package' and '..' not in rel.parts
   p=dest/pathlib.Path(*rel.parts[1:]);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(t.extractfile(f).read())
 return {'name':name,'version':version,'license':meta['license'],'repository':meta['repository'],'dist':meta['dist'],'source_directory':str(dest.relative_to(root))}
with concurrent.futures.ThreadPoolExecutor() as e: records=list(e.map(pull,pkgs.items()))
for repo,sha,files,dest in [('Bowserinator/Periodic-Table-JSON','9090b1c472a1e68f7295e77280f374f8d125cefc',['PeriodicTableJSON.json','LICENSE.md','README.md'],'periodic-table'),('Lattice-Automation/seqviz','7a0e8f4c45ad5f4d076178f54f08f071e91d7b6a',['src/sequence.ts','LICENSE','src/elements.ts'],'seqviz')]:
 for f in files:
  data=urllib.request.urlopen(f'https://raw.githubusercontent.com/{repo}/{sha}/{f}').read()
  p=root/'upstream/science/sources'/dest/f;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
 records.append({'name':dest,'repository':'https://github.com/'+repo,'commit':sha,'source_directory':'upstream/science/sources/'+dest})
(root/'upstream/science/imports.json').write_text(json.dumps(records,indent=2)+'\n')
print('Imported packages and source snapshots')

# Preserve the RDKit license from its matching release and the NtSeq attribution used by SeqViz.
for repo,sha,file,target in [('rdkit/rdkit','fece8caa860bdf6c9c82bdb9253f22a0cf87150c','license.txt','rdkit-LICENSE.txt'),('keithwhor/NtSeq','e8a3f87f5f2086a9bb54eac63d0018c6071a8c37','LICENSE','ntseq-LICENSE.txt')]:
 data=urllib.request.urlopen(f'https://raw.githubusercontent.com/{repo}/{sha}/{file}').read()
 (root/'upstream/science/sources'/target).write_bytes(data)
print('Run node scripts/build-science-vendor.mjs, review the diff, and update the integrity manifest deliberately.')
