#!/usr/bin/env python3
"""Maintenance only: download pinned sources. Ordinary builds never use the network."""
import concurrent.futures, hashlib, json, pathlib, urllib.request, time
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE=ROOT/'upstream/reference'
PINS=json.loads((BASE/'pins.json').read_text())
jobs=[]
def add(key,repo,path): jobs.append((key,repo,path))
for key,repo,path in [
 ('countries.json','annexare/Countries','dist/countries.min.json'),
 ('countries-LICENSE.txt','annexare/Countries','LICENSE'),
 ('flags-LICENSE.txt','lipis/flag-icons','LICENSE'),
 ('airports.csv','davidmegginson/ourairports-data','airports.csv'),
 ('airports-LICENSE.txt','davidmegginson/ourairports-data','LICENSE'),
 ('ports.csv','datasets/un-locode','data/code-list.csv'),
 ('ports-README.txt','datasets/un-locode','README.md'),
 ('ports-metadata.json','datasets/un-locode','datapackage.json'),
 ('iching.json','strobus/i-ching','lib/data.json'),
 ('iching-LICENSE.txt','strobus/i-ching','LICENSE'),
 ('tarot.json','smallcat419/tarot-card-data','index.json'),
 ('tarot-README.txt','smallcat419/tarot-card-data','README.md'),
 ('colors.csv','meodai/color-names','src/colornames.csv'),
 ('colors-LICENSE.txt','meodai/color-names','LICENSE'),
 ('geology-chart.ttl','i-c-stratigraphy/chart','chart.ttl'),
 ('geology-timescale.ttl','i-c-stratigraphy/chart','source/gts2020.ttl'),
 ('geology-chart-LICENSE.txt','i-c-stratigraphy/chart','LICENSE'),
 ('geology-labels.ttl','i-c-stratigraphy/geologic-timescale-kg','rdf/taxonomies/gts-skos.ttl'),
 ('geology-colors.ttl','i-c-stratigraphy/geologic-timescale-kg','rdf/taxonomies/chart-colors.ttl'),
 ('geology-LICENSE.txt','i-c-stratigraphy/geologic-timescale-kg','LICENSE'),
 ('unicode-LICENSE.txt','unicode-org/unicodetools','LICENSE'),
 ('world.geojson','nvkelso/natural-earth-vector','geojson/ne_110m_admin_0_countries.geojson'),
 ('natural-earth-LICENSE.txt','nvkelso/natural-earth-vector','LICENSE.md'),
 ('tarot-art-README.txt','mixvlad/TarotCards','README.md'),
 ('tarot-art-SOURCES.txt','mixvlad/TarotCards','SOURCES.md'),
 ('tarot-art-LICENSE.txt','mixvlad/TarotCards','LICENSE'),
 ('tarot-art-metadata.json','mixvlad/TarotCards','tarot/rider-waite/metadata.json'),
 ('tarot-gearberry-README.txt','reginanka/tarot-cards','README.md'),
 ('tarot-gearberry-LICENSE.txt','reginanka/tarot-cards','LICENSE.md'),
 ('tarot-gearberry-cards.json','reginanka/tarot-cards','cards.json'),
]: add(key,repo,path)
# Only the explicitly public-domain 1909 RWS deck, not other licensed decks or covers.
major_art='Fool Magician High_Priestess Empress Emperor Hierophant Lovers Chariot Strength Hermit Wheel_of_Fortune Justice Hanged_Man Death Temperance Devil Tower Star Moon Sun Judgement World'.split()
art_files=[f'{n:02d}_{name}.jpg' for n,name in enumerate(major_art)]
art_files += [f'{suit}{n:02d}.jpg' for suit in ['Wands','Cups','Swords','Pents'] for n in range(1,15)]
for name in art_files:add('tarot-art/'+name,'mixvlad/TarotCards','tarot/rider-waite/720px/'+name)
# Full modern deck, excluding the unused back. Preserve unmodified WebP bytes.
gearberry_files=[f'm{n:02d}.webp' for n in range(22)]
gearberry_files += [f'{suit}{n:02d}.webp' for suit in ['w','c','s','p'] for n in range(1,15)]
for name in gearberry_files:add('tarot-gearberry/'+name,'reginanka/tarot-cards','cards/'+name)
for f in ['UnicodeData.txt','Blocks.txt','Scripts.txt','NameAliases.txt']:
 add(f,'unicode-org/unicodetools','unicodetools/data/ucd/17.0.0/'+f)
def fetch(job):
 key,repo,path=job;dest=BASE/'sources'/key;dest.parent.mkdir(parents=True,exist_ok=True)
 url=f'https://raw.githubusercontent.com/{repo}/{PINS[repo]}/{path}'
 if not dest.exists():
  for attempt in range(3):
   try:
    with urllib.request.urlopen(url,timeout=60) as r: data=r.read()
    dest.write_bytes(data);break
   except Exception:
    if attempt==2: raise RuntimeError("Download failed: "+url)
    time.sleep(attempt+1)
 data=dest.read_bytes()
 return {'path':str(dest.relative_to(ROOT)),'url':url,'sha256':hashlib.sha256(data).hexdigest()}
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool: records=list(pool.map(fetch,jobs))
 countries=json.loads((BASE/'sources/countries.json').read_text())
 flags=[('flags/'+code.lower()+'.svg','lipis/flag-icons','flags/4x3/'+code.lower()+'.svg') for code in countries if code not in {"AC","TA"}]
 with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool: records+=list(pool.map(fetch,flags))
 # Keep retired originals and their license provenance archived; never fetch them.
 previous=json.loads((BASE/'imports.json').read_text()) if (BASE/'imports.json').exists() else {}
 for record in previous.get('files',[]):
  path=record['path'].replace('\\','/')
  if path.startswith(('upstream/reference/sources/oeis/','upstream/reference/sources/crystals/')) or path.endswith(('/oeis-LICENSE.txt','/cod-README-COPYING.txt')):records.append(record)
 (BASE/'imports.json').write_text(json.dumps({'pins':PINS,'files':records},ensure_ascii=False,indent=2)+'\n')
 print('Pinned sources downloaded:',len(records))
