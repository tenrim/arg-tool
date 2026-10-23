#!/usr/bin/env python3
"""Maintenance-only network importer; pinned bytes are verified, never silently replaced."""
import concurrent.futures, hashlib, json, pathlib, subprocess, time, urllib.parse
from atlas_celestial import constellation_rows, century_links
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE=ROOT/'upstream/atlas-celestial'; SOURCES=BASE/'sources'
IAU='https://iauarchive.eso.org/public/themes/constellations/'
NASA='https://eclipse.gsfc.nasa.gov/'
INITIAL=[
 ('iau-constellations.html',IAU),
 ('iau-copyright.html','https://iauarchive.eso.org/copyright/'),
 ('cc-by-4.0.txt','https://creativecommons.org/licenses/by/4.0/legalcode.txt'),
 ('solar-index.html',NASA+'SEcat5/SEcatalog.html'),
 ('lunar-index.html',NASA+'LEcat5/LEcatalog.html'),
 ('solar-key.html',NASA+'SEcat5/SEcatkey.html'),
 ('lunar-key.html',NASA+'LEcat5/LEcatkey.html'),
 ('solar-publication.html',NASA+'SEpubs/5MKSE.html'),
 ('lunar-publication.html',NASA+'SEpubs/5MKLE.html'),
 ('solar-ascii.txt',NASA+'5MCSE/5MKSEcatalog.txt'),
 ('lunar-ascii.txt',NASA+'5MCLE/5MKLEcatalog.txt'),
 ('delta-t.html',NASA+'SEcat5/deltat.html'),
 ('calendar.html',NASA+'SEhelp/calendar.html')]

def main():
 SOURCES.mkdir(parents=True,exist_ok=True)
 pinned=json.loads((BASE/'imports.json').read_text(encoding='utf-8')) if (BASE/'imports.json').exists() else {}
 pins={r['path']:r for r in pinned.get('files',[])}
 def fetch(job):
  name,url=job; dest=SOURCES/name; dest.parent.mkdir(parents=True,exist_ok=True)
  key=dest.relative_to(ROOT).as_posix()
  if not dest.exists():
   part=dest.with_suffix(dest.suffix+'.part')
   for attempt in range(3):
    r=subprocess.run(['curl.exe','--silent','--show-error','--fail','--location','--max-time','180',url,'--output',str(part)],capture_output=True)
    if r.returncode==0:
     part.replace(dest);break
    if part.exists():part.unlink()
    if attempt==2:raise RuntimeError('Download failed: '+url+' '+r.stderr.decode(errors='replace')[:300])
    time.sleep(attempt+1)
  data=dest.read_bytes(); digest=hashlib.sha256(data).hexdigest()
  if key in pins and pins[key]['sha256']!=digest:raise RuntimeError('Pinned source mismatch: '+key)
  return {'path':key,'url':url,'sha256':digest,'bytes':len(data)}
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:records=list(pool.map(fetch,INITIAL))
 rows=constellation_rows((SOURCES/'iau-constellations.html').read_text(encoding='utf-8'))
 if len(rows)!=88:raise RuntimeError('Expected 88 constellations, got '+str(len(rows)))
 jobs=[]
 for r in rows:
  for a in r['assets']:
   if a['kind'] in ('chart','boundary'):jobs.append((a['local'],a['url']))
 jobs.append(('charts/legend.gif','https://iauarchive.eso.org/static/public/constellations/gif/legend.gif'))
 for kind in ['solar','lunar']:
  links=century_links((SOURCES/(kind+'-index.html')).read_text(encoding='utf-8'),kind)
  if len(links)!=50:raise RuntimeError('Expected 50 century tables: '+kind+' '+str(len(links)))
  jobs.extend((kind+'/'+url.rsplit('/',1)[1],url) for url in links)
 with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:records+=list(pool.map(fetch,jobs))
 records.sort(key=lambda r:r['path'])
 (BASE/'imports.json').write_text(json.dumps({'snapshot':'2026-10-17','scope':'All 88 IAU constellations (89 charts/boundaries) and NASA 5000-year solar/lunar century tables, -1999..3000','files':records},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print('Pinned celestial sources:',len(records))
if __name__=='__main__':main()
