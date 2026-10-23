#!/usr/bin/env python3
"""Offline deterministic projection; all network acquisition is in import-atlas-celestial.py."""
import gzip,hashlib,io,json,pathlib,re,shutil
from atlas_celestial import constellation_rows,century_links,text,links,clean,IAU,NASA
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE=ROOT/'upstream/atlas-celestial'; S=BASE/'sources'; O=ROOT/'public/vendor/atlas-celestial'
SNAPSHOT='2026-10-17'
ACK="Eclipse Predictions by Fred Espenak and Jean Meeus (NASA's GSFC)"
IAU_CREDIT='IAU / Sky & Telescope; Roger Sinnott and Rick Fienberg; constellation patterns by Alan MacRobert.'
MONTHS={v:i+1 for i,v in enumerate('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split())}
def read(name):
 data=(S/name).read_bytes()
 try:return data.decode('utf-8')
 except UnicodeDecodeError:return data.decode('cp1252')
def write(path,value):
 path.parent.mkdir(parents=True,exist_ok=True)
 path.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8',newline='\n')
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def parse_eclipses(source,kind,url):
 result=[]
 for html_line in source.splitlines():
  line=text(html_line).rstrip()
  if not re.match(r'^\d{5}\s+-?\d{4}\s+[A-Z][a-z]{2}\s+\d{2}\s+\d{2}:\d{2}:\d{2}',line):continue
  c=line.split(); expected=[15,17] if kind=='solar' else [18]
  if len(c) not in expected:raise RuntimeError('Unexpected '+kind+' column count '+str(len(c))+': '+line)
  yr=int(c[1]); month=MONTHS[c[2]]; day=int(c[3]);dt=f'{c[1]} {c[2]} {c[3]}'
  dateiso=('-' if yr<0 else '')+f'{abs(yr):04d}-{month:02d}-{day:02d}'
  row={'id':kind+':'+c[0],'kind':kind,'catalogNumber':c[0],'year':yr,'month':month,'day':day,'date':dt,'dateISO':dateiso,'calendar':'julian' if (yr,month,day)<=(1582,10,4) else 'gregorian','td':c[4],'deltaT':c[5],'lunationNumber':c[6],'saros':c[7],'type':c[8],'quincena':c[9],'gamma':c[10],'sourceURL':url,'links':links(html_line,url),'rawLine':line,'rawColumns':c}
  if kind=='solar':row.update({'magnitude':c[11],'latitude':c[12],'longitude':c[13],'sunAltitude':c[14],'pathWidth':c[15] if len(c)>15 else '', 'centralDuration':c[16] if len(c)>16 else ''})
  else:row.update({'penumbralMagnitude':c[11],'umbralMagnitude':c[12],'penumbralDuration':c[13],'partialDuration':c[14],'totalDuration':c[15],'latitude':c[16],'longitude':c[17]})
  result.append(row)
 return result

def parse_ascii(source,kind):
 result={}
 for line in source.splitlines():
  if not re.match(r'^\s*\d{1,5}\s+'+(r'\d{3}\s+' if kind=='solar' else '')+r'-?\d{4}\s+[A-Z][a-z]{2}\s+\d{2}\s+\d{2}:\d{2}:\d{2}',line):continue
  c=line.split(); expected=[17,19] if kind=='solar' else [18]
  if len(c) not in expected:raise RuntimeError('Unexpected ASCII columns '+kind+': '+line)
  p=1 if kind=='solar' else 0
  row={'catalogNumber':c[0], 'date':' '.join(c[1+p:4+p]),'td':c[4+p],'deltaT':c[5+p],'lunationNumber':c[6+p],'saros':c[7+p],'type':c[8+p],'quincena':c[9+p],'gamma':c[10+p],'rawLine':line.rstrip(),'rawColumns':c}
  if kind=='solar':row.update({'plateNumber':c[1],'magnitude':c[12],'latitude':c[13],'longitude':c[14],'sunAltitude':c[15],'sunAzimuth':c[16],'pathWidth':c[17] if len(c)>17 else '', 'centralDuration':c[18] if len(c)>18 else ''})
  else:row.update({'penumbralMagnitude':c[11],'umbralMagnitude':c[12],'penumbralDuration':c[13],'partialDuration':c[14],'totalDuration':c[15],'latitude':c[16],'longitude':c[17]})
  key=kind+':'+c[0].zfill(5)
  if key in result:raise RuntimeError('Duplicate ASCII event '+key)
  result[key]=row
 return result

def main():
 imports=json.loads((BASE/'imports.json').read_text(encoding='utf-8'))
 for rec in imports['files']:
  p=ROOT/rec['path']
  if digest(p)!=rec['sha256']:raise RuntimeError('Pinned original mismatch '+str(p))
 O.mkdir(parents=True,exist_ok=True)
 # Chinese factual display labels reuse the existing complete 88-name site mapping.
 mapping_source=(ROOT/'public/discovery/reference-core.js').read_text(encoding='utf-8')
 mapping_expr=re.search(r'export const CONSTELLATIONS=\{([^}]+)\}',mapping_source).group(1)
 zh=dict(re.findall(r"(\w+):'([^']+)'",mapping_expr))
 if len(zh)!=88:raise RuntimeError('Complete Chinese mapping must cover 88 IAU abbreviations')
 source=read('iau-constellations.html'); stars=constellation_rows(source)
 if len(stars)!=88 or len(set(r['id'] for r in stars))!=88:raise RuntimeError('Incomplete IAU table')
 for r in stars:
  r['zh']=zh[r['id']];r['charts']=[];r['boundaries']=[]
  for a in r['assets']:
   if a['kind'] not in ('chart','boundary'):continue
   path=a['local'];dest=O/path;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(S/path,dest)
   if a['kind']=='chart':
    b=dest.read_bytes()
    if b[:6] not in (b'GIF87a',b'GIF89a'):raise RuntimeError('Invalid chart GIF '+path)
    title=r['zh'] if r['id']!='Ser' else '巨蛇座 · '+('蛇头 Serpens Caput' if 'sercp' in path else '蛇尾 Serpens Cauda')
    r['charts'].append({'path':path,'title':title,'sourceURL':a['url'],'credit':IAU_CREDIT,'license':'CC BY 4.0'})
   else:r['boundaries'].append({'path':path,'sourceURL':a['url'],'text':dest.read_bytes().decode('utf-8')})
 if sum(len(r['charts']) for r in stars)!=89 or sum(len(r['boundaries']) for r in stars)!=89:raise RuntimeError('Expected all 89 chart and boundary files')
 shutil.copyfile(S/'charts/legend.gif',O/'charts/legend.gif')
 legend=re.split(r'Charts Text Legend',source,maxsplit=1)[-1]
 legend=re.split(r'<h2>',legend,maxsplit=1)[0]
 star_meta={'title':'IAU 88 Constellations','snapshot':SNAPSHOT,'count':88,'chartCount':89,'boundaryCount':89,'epoch':'J2000','sourceURL':IAU,'sources':[IAU],'credit':IAU_CREDIT,'chartLicense':'CC BY 4.0','scope':'Complete official 88-row name table, 89 unmodified GIF charts and 89 unmodified boundary TXT files; Serpens has Caput and Cauda.','chineseNames':'Existing complete 88-name mapping from public/discovery/reference-core.js, frozen as factual display labels.','legend':clean(legend),'legendChart':'charts/legend.gif'}
 write(O/'constellations.json',{'meta':star_meta,'records':stars})
 combined=[];headers={}; counts={}; docs=[]
 for kind,prefix,total in [('solar','SE',11898),('lunar','LE',12064)]:
  urls=century_links(read(kind+'-index.html'),kind)
  if len(urls)!=50:raise RuntimeError('Missing century tables '+kind)
  records=[]
  for url in urls:
   content=read(kind+'/'+url.rsplit('/',1)[1]); parsed=parse_eclipses(content,kind,url)
   if not parsed:raise RuntimeError('Empty century '+url)
   records+=parsed
   # Preserve all actual preformatted table headers and unmodified row fields.
   pres=re.findall(r'(?is)<pre\b[^>]*>(.*?)</pre>',content)
   for pre in pres:
    pretext=text(pre)
    if re.search(r'^\d{5}\s+-?\d{4}',pretext,re.M):
     header=re.split(r'\n\d{5}\s+-?\d{4}',pretext,maxsplit=1)[0]
     if header.strip() not in headers.setdefault(kind,[]):headers[kind].append(header.strip())
  records.sort(key=lambda r:int(r['catalogNumber']))
  if len(records)!=total or len(set(r['id'] for r in records))!=total:raise RuntimeError('Wrong '+kind+' count '+str(len(records)))
  if [int(r['catalogNumber']) for r in records]!=list(range(1,total+1)):raise RuntimeError('Noncontiguous catalogue '+kind)
  ascii_records=parse_ascii(read(kind+'-ascii.txt'),kind)
  if set(ascii_records)!=set(r['id'] for r in records):raise RuntimeError('ASCII/web catalogue coverage differs '+kind)
  for r in records:
   ar=ascii_records[r['id']]
   if ar['date']!=r['date']:raise RuntimeError('ASCII joins a different event '+r['id'])
   ar['differences']=[key for key in ar if key not in ('rawLine','rawColumns','catalogNumber') and key in r and ar[key]!=r[key]]
   r['ascii']=ar
  counts[kind]=len(records);combined+=records
  for suffix,title in [('index','Catalogue overview'),('key','Full column key and predictions')]:
   name=kind+'-'+suffix+'.html'; doc={'id':kind+'-'+suffix,'title':title,'sourceURL':NASA+prefix+'cat5/'+prefix+('catalog.html' if suffix=='index' else 'catkey.html'),'text':text(read(name)).strip()};docs.append(doc)
  docs.append({'id':kind+'-publication','title':'Official catalogue publication and complete ASCII data','sourceURL':NASA+'SEpubs/5MK'+('SE' if kind=='solar' else 'LE')+'.html','text':text(read(kind+'-publication.html')).strip()})
 for name,title,url in [('calendar.html','Calendar Dates',NASA+'SEhelp/calendar.html'),('delta-t.html','Delta T',NASA+'SEcat5/deltat.html')]:docs.append({'id':name[:-5],'title':title,'sourceURL':url,'text':text(read(name)).strip()})
 combined.sort(key=lambda r:(r['year'],r['month'],r['day'],r['kind']))
 eclipse_meta={'title':'Five Millennium Catalogs of Solar and Lunar Eclipses','snapshot':SNAPSHOT,'counts':counts,'count':len(combined),'fromYear':-1999,'toYear':3000,'yearNumbering':'Astronomical numbering including year 0 (1 BCE); negative year -1 is 2 BCE.','calendar':'Julian through 1582-10-04; Gregorian from 1582-10-15. Original catalogue dates are not proleptic Gregorian dates.','timeScale':'Greatest eclipse is Terrestrial Dynamical Time (TD). Delta T = TD - UT (seconds). No conversion to UTC or local clock is inferred.','uncertainty':'Historical and future Delta T estimates are uncertain. Greatest eclipse coordinates do not establish visibility at an arbitrary observer location.','credit':ACK,'license':'NASA eclipse data reproduction permitted with the required acknowledgment; full permission preserved in NASA-NOTICE.txt and original key pages.','headers':headers,'asciiHeaders':{kind:read(kind+'-ascii.txt').splitlines()[:13] for kind in ['solar','lunar']},'asciiFormat':'The complete official ASCII edition is retained per record separately, including solar plate numbers, solar azimuth and coordinate precision. It never overwrites the web table. differences lists text/precision/version differences in common fields.','sources':[NASA+'SEcat5/SEcatalog.html',NASA+'LEcat5/LEcatalog.html',NASA+'5MCSE/5MKSEcatalog.txt',NASA+'5MCLE/5MKLEcatalog.txt'],'documentation':docs}
 write(O/'eclipses.json',{'meta':eclipse_meta,'records':combined})
 # Metadata is explicit and locally readable; source HTML is archived, never executed.
 (O/'NASA-NOTICE.txt').write_text('NASA Eclipse Web Site — data reproduction permission\n\nPermission is freely granted to reproduce this data when accompanied by an acknowledgment:\n"'+ACK+'"\n\nSources:\n'+NASA+'SEcat5/SEcatkey.html\n'+NASA+'LEcat5/LEcatkey.html\n'+NASA+'SEpubs/5MKSE.html\n'+NASA+'SEpubs/5MKLE.html\n\nAll eclipse calculations are by Fred Espenak. Published catalogues: Espenak and Meeus, NASA TP-2009-214174 (solar) and NASA TP-2009-214173 (lunar). Original ASCII headers, edition identifiers and table precision are preserved, including the older solar ASCII header referring to TP-2008-214170.\n\nThis local projection preserves all official catalogue entries and original fields; it changes presentation only. No observer-local visibility or modern high-accuracy time correction is claimed.\n',encoding='utf-8',newline='\n')
 (O/'IAU-NOTICE.txt').write_text('IAU constellation charts and factual tables\n\n'+IAU_CREDIT+'\nThe original chart images are released under the Creative Commons Attribution 4.0 International license.\n'+IAU+'\nhttps://creativecommons.org/licenses/by/4.0/\n\n89 chart GIFs (88 constellations; Serpens split into Caput and Cauda) and chart legend are unchanged. Complete official name table and boundary coordinates are retained as factual data. Chinese display labels reuse the existing site mapping and are not presented as IAU-provided translations.\n\nBoundary TXT files remain byte-identical, retain their file headers, and are supplied with this attribution and original source URLs.\n',encoding='utf-8',newline='\n')
 shutil.copyfile(S/'cc-by-4.0.txt',O/'CC-BY-4.0.txt')
 for name in ['constellations.json','eclipses.json']:
  out=io.BytesIO()
  with gzip.GzipFile(filename='',mode='wb',compresslevel=9,fileobj=out,mtime=0) as z:z.write((O/name).read_bytes())
  (O/(name+'.gz')).write_bytes(out.getvalue())
 runtime=[{'path':p.relative_to(ROOT).as_posix(),'sha256':digest(p),'bytes':p.stat().st_size} for p in sorted(O.rglob('*')) if p.is_file() and p.name!='UPSTREAM.json']
 write(O/'UPSTREAM.json',{'snapshot':SNAPSHOT,'generator':'scripts/build-atlas-celestial.py','source_manifest':'upstream/atlas-celestial/imports.json','scope':{'constellations':88,'charts':89,'boundaries':89,**counts},'files':runtime,'sources':imports['files']})
 print('Complete celestial snapshots:',len(stars),'constellations;',counts,';',len(runtime),'runtime files')
if __name__=='__main__':main()
