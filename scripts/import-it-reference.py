#!/usr/bin/env python3
"""Maintenance-only source import. Ordinary build-it-reference.mjs stays offline."""
import base64, concurrent.futures, hashlib, io, json, pathlib, tarfile, urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE=ROOT/'upstream/it-reference'
PINS=json.loads((BASE/'pins.json').read_text())
MIME_VERSION='1.54.0'
MIME_INTEGRITY='sha512-aU5EJuIN2WDemCcAp2vFBfp/m4EAhWJnUNSSw0ixs7/kXbd6Pg64EmwJkNdFhB8aWt1sH2CTXrLxo/iAGV3oPQ=='
jobs=[]
for name in ['service-names-port-numbers','protocol-numbers','http-status-codes','http-fields','character-sets']:
 jobs.append(('iana/'+name+'.xml','https://raw.githubusercontent.com/larseggert/iana-assignments/'+PINS['larseggert/iana-assignments']+'/'+name+'/'+name+'.xml'))
jobs.append(('iana/CC0-1.0.txt','https://raw.githubusercontent.com/spdx/license-list-data/'+PINS['spdx/license-list-data']+'/text/CC0-1.0.txt'))
for name in ['public_suffix_list.dat','LICENSE']:jobs.append(('psl/'+name,'https://raw.githubusercontent.com/publicsuffix/list/'+PINS['publicsuffix/list']+'/'+name))
jobs.append(('mime-db/package.tgz','https://registry.npmjs.org/mime-db/-/mime-db-'+MIME_VERSION+'.tgz'))
def fetch(job):
 name,url=job;data=urllib.request.urlopen(url,timeout=45).read();path=BASE/'sources'/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)
 return {'path':str(path.relative_to(ROOT)),'url':url,'sha256':hashlib.sha256(data).hexdigest()}
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=6)as pool:files=list(pool.map(fetch,jobs))
 archive=(BASE/'sources/mime-db/package.tgz').read_bytes()
 if 'sha512-'+base64.b64encode(hashlib.sha512(archive).digest()).decode()!=MIME_INTEGRITY:raise RuntimeError('mime-db archive integrity mismatch')
 with tarfile.open(fileobj=io.BytesIO(archive))as package:
  for name in ['db.json','LICENSE','README.md','package.json']:
   member=package.extractfile('package/'+name)
   if member is None:raise RuntimeError('Missing pinned mime-db file: '+name)
   data=member.read();path=BASE/'sources/mime-db'/name;path.write_bytes(data)
   files.append({'path':str(path.relative_to(ROOT)),'url':jobs[-1][1],'sha256':hashlib.sha256(data).hexdigest(),'archive_path':'package/'+name})
 # The retired RFC selection remains an original archive, not runtime data.
 previous=json.loads((BASE/'imports.json').read_text()) if (BASE/'imports.json').exists() else {}
 files.extend(record for record in previous.get('files',[]) if 'rfc-index' in record['path'])
 (BASE/'imports.json').write_text(json.dumps({'pins':PINS,'packages':{'mime-db':{'version':MIME_VERSION,'integrity':MIME_INTEGRITY}},'files':sorted(files,key=lambda file:file['path'])},indent=2)+'\n')
 print('Imported pinned IT sources:',len(files))
