"""Standard-library parsers shared by online import and offline projection."""
import html, re, urllib.parse
IAU='https://iauarchive.eso.org/public/themes/constellations/'
NASA='https://eclipse.gsfc.nasa.gov/'

def text(fragment):
 s=re.sub(r'(?is)<(script|style)\b[^>]*>.*?</\1>','',fragment)
 s=re.sub(r'(?i)<br\s*/?>|</(?:p|h[1-6]|li|tr|div)>','\n',s)
 return html.unescape(re.sub(r'<[^>]*>','',s)).replace('\r','')

def clean(fragment):return ' '.join(text(fragment).split())
def links(fragment,base):
 return [{'url':urllib.parse.urljoin(base,html.unescape(url)),'label':clean(label)} for url,label in re.findall(r'(?is)<a\b[^>]*href=[\"\']([^\"\']+)[\"\'][^>]*>(.*?)</a>',fragment)]

def constellation_rows(source):
 records=[]
 for row in re.findall(r'(?is)<tr\b[^>]*>(.*?)</tr>',source):
  cells=re.findall(r'(?is)<td\b[^>]*>(.*?)</td>',row)
  if len(cells)!=5:continue
  assets=links(cells[4],IAU)
  if not any('/constellations/gif/' in x['url'] for x in assets):continue
  # The upstream table mixes p/br/plain-text cells (Apus starts before its p).
  # Preserve the visible first line, rather than guessing the first p is its name.
  name_parts=[v.strip() for v in text(cells[0]).split('\n') if v.strip()]
  name=name_parts[0] if name_parts else ''
  pronunciation=' '.join(name_parts[1:])
  gen_parts=[v.strip() for v in text(cells[3]).split('\n') if v.strip()]
  seen=set(); files=[]
  for a in assets:
   url=a['url']
   if url in seen:continue
   seen.add(url)
   filename=url.rsplit('/',1)[-1]
   kind='chart' if '/constellations/gif/' in url else 'boundary' if '/constellations/txt/' in url else 'external'
   files.append({**a,'kind':kind,'local':('charts/' if kind=='chart' else 'boundaries/' if kind=='boundary' else '')+filename.lower()})
  records.append({'id':clean(cells[1]),'name':name,'pronunciation':pronunciation,'abbreviation':clean(cells[1]),'english':clean(cells[2]),'genitive':gen_parts[0] if gen_parts else '', 'genitivePronunciation':' '.join(gen_parts[1:]),'sourceCells':[clean(c) for c in cells],'assets':files,'sourceURL':IAU+'#'+clean(cells[1]).lower()})
 return records

def century_links(source,kind):
 prefix='SE' if kind=='solar' else 'LE'
 urls=[]
 for a in links(source,NASA+prefix+'cat5/'+prefix+'catalog.html'):
  if re.search('/'+prefix+r'cat5/'+prefix+r'-?\d{4}--?\d{4}\.html$',a['url']):
   if a['url'] not in urls:urls.append(a['url'])
 return urls
