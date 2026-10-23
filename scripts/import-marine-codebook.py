"""Explicit maintainer import of the complete NGA Pub.102 (2020), all 159 pages."""
from pathlib import Path
import hashlib,json,urllib.request
from pypdf import PdfReader
root=Path('upstream/completion-20261017/marine');root.mkdir(exist_ok=True)
url='https://msi.nga.mil/api/publications/download?key=16694273%2FSFH00000%2FPub102bk.pdf'
cached=Path('.tmp-expansion-tests/icos.pdf')
raw=cached.read_bytes() if cached.exists() else urllib.request.urlopen(url,timeout=60).read()
(root/'Pub102bk.pdf').write_bytes(raw)
reader=PdfReader(root/'Pub102bk.pdf')
assert len(reader.pages)==159,'Upstream edition changed; review before importing'
pages=[{'page':i+1,'text':page.extract_text()} for i,page in enumerate(reader.pages)]
assert [p['page'] for p in pages if not p['text'].strip()]==[2],'Review any new image-only pages'
# Page 2 is the full colour signal-flag chart, not an empty page.
image=reader.pages[1].images[0]
(root/'flag-chart.png').write_bytes(image.data)
pages[1].update(text='国际信号旗完整图版 / International signal flags',image='flag-chart.png')
(root/'pages.json').write_text(json.dumps(pages,ensure_ascii=False),encoding='utf-8')
(root/'SOURCE.json').write_text(json.dumps({'url':url,'edition':'1969 edition, revised 2020','pages':159,'sha256':hashlib.sha256(raw).hexdigest(),'extraction':'pypdf '+__import__('pypdf').__version__+'; every PDF page, no selection'},indent=2),encoding='utf-8')
(root/'NOTICE.txt').write_text('NGA International Code of Signals, Pub. 102, 1969 edition (Revised 2020).\nSource: '+url+'\nTitle page: COPYRIGHT 2020 BY THE UNITED STATES GOVERNMENT; NO COPYRIGHT CLAIMED UNDER TITLE 17 U.S.C.\nAll 159 PDF pages and their full extracted text are retained. No machine translation. Source PDF controls any text extraction ambiguity.\n',encoding='utf-8')
print('NGA: preserved all',len(pages),'pages')
