#!/usr/bin/env python3
"""Offline maintenance: PYTHONPATH=/tmp/reference-python python scripts/build-reference.py.
Requires rdflib==7.2.1 only when regenerating the checked-in data, not normal builds.
"""
import csv,json,pathlib,hashlib,shutil,re,subprocess
from reference_world import build_world
from rdflib import Graph,Namespace
ROOT=pathlib.Path(__file__).resolve().parents[1];S=ROOT/'upstream/reference/sources';O=ROOT/'public/vendor/reference';O.mkdir(exist_ok=True,parents=True)
def save(name,rows):
 (O/(name+'.json')).write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n')
 print(name,len(rows) if isinstance(rows,list) else 'object')
def csvrows(name):return list(csv.DictReader((S/name).open(encoding='utf-8-sig',newline='')))
def original(name):return json.loads((S/name).read_text())
c=original('countries.json')
# Record Chinese display names in the generated snapshot, not a remote runtime API.
zh=json.loads(subprocess.check_output(['node','--input-type=module','-e',"const d=new Intl.DisplayNames(['zh-Hans'],{type:'region'});console.log(JSON.stringify(Object.fromEntries("+json.dumps(list(c))+".map(c=>[c,d.of(c)]))))"],text=True))
continents={'AF':'非洲','AN':'南极洲','AS':'亚洲','EU':'欧洲','NA':'北美洲','OC':'大洋洲','SA':'南美洲'}
countries=[{'id':code,'name':zh[code],'english':v['name'],'native':v['native'],'continent':continents.get(v['continent'],v['continent']),'capital':v['capital'],'phone':v['phone'],'currency':v['currency'],'languages':v['languages'],'flag':(S/'flags'/f'{code.lower()}.svg').exists()} for code,v in c.items()]
save('countries',countries)
shutil.copytree(S/'flags',O/'flags',dirs_exist_ok=True)
save('airports',[[r[k] for k in ['ident','iata_code','name','municipality','iso_country','type','latitude_deg','longitude_deg','elevation_ft','scheduled_service']] for r in csvrows('airports.csv')])
save('ports',[[r[k] for k in ['Country','Location','Name','NameWoDiacritics','Subdivision','Function','Status','Coordinates','IATA','Date','Change','Remarks']] for r in csvrows('ports.csv')])
rows=[];ranges=[];start=None
for line in (S/'UnicodeData.txt').read_text().splitlines():
 r=line.split(';');cp=int(r[0],16)
 if r[1].endswith(', First>'):start=[cp,r[1][1:-8],r[2],r[4]];continue
 if r[1].endswith(', Last>'):ranges.append([start[0],cp,*start[1:]]);continue
 rows.append([cp,r[1],r[2],r[4],r[5],r[6] or r[7] or r[8],r[12],r[13]])
def rangefile(name):
 a=[]
 for line in (S/name).read_text().splitlines():
  line=line.split('#')[0].strip()
  if not line:continue
  span,value=map(str.strip,line.split(';'));x=span.split('..');a.append([int(x[0],16),int(x[-1],16),value])
 return a
aliases={}
for l in (S/'NameAliases.txt').read_text().splitlines():
 if not l or l.startswith('#'):continue
 r=l.split(';');aliases.setdefault(str(int(r[0],16)),[]).append(r[1])
save('unicode',{'version':'17.0.0','rows':rows,'ranges':ranges,'blocks':rangefile('Blocks.txt'),'scripts':rangefile('Scripts.txt'),'aliases':aliases})
save('unicode-blocks',rangefile('Blocks.txt'))
# An equirectangular overview from pinned Natural Earth geometry. Keep every ring,
# including polygon holes and split antimeridian pieces; no remote map tiles.
save('world',build_world(original('world.geojson'),c))
save('iching',original('iching.json'))
# Preserve the source separately; publish factual identification fields and local Chinese glosses.
major='愚者 魔术师 女祭司 皇后 皇帝 教皇 恋人 战车 力量 隐者 命运之轮 正义 倒吊人 死神 节制 恶魔 高塔 星星 月亮 太阳 审判 世界'.split()
gloss='开始与冒险|意志与行动|直觉与隐秘|孕育与丰饶|秩序与权威|传统与指导|关系与选择|方向与决心|勇气与克制|独处与探索|变化与循环|公平与判断|暂停与换位|结束与转变|平衡与协调|束缚与欲望|突变与揭示|希望与更新|朦胧与潜意识|活力与喜悦|反思与觉醒|完成与整体'.split('|')
suits={'Wands':'权杖','Cups':'圣杯','Swords':'宝剑','Pentacles':'星币'};ranks=dict(zip(['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'],'首牌 二 三 四 五 六 七 八 九 十 侍从 骑士 王后 国王'.split()))
tarot=[]
major_art='Fool Magician High_Priestess Empress Emperor Hierophant Lovers Chariot Strength Hermit Wheel_of_Fortune Justice Hanged_Man Death Temperance Devil Tower Star Moon Sun Judgement World'.split()
rank_numbers={name:i+1 for i,name in enumerate(ranks)}
def tarot_name(name):return re.sub(r'^The ', '', name).casefold()
gearberry_cards=[r for r in original('tarot-gearberry-cards.json') if r['arcana'] in ['major','minor']]
gearberry_by_name={tarot_name(r['name']):r for r in gearberry_cards}
if len(gearberry_cards)!=78 or len(gearberry_by_name)!=78:raise RuntimeError('Gearberry must contain 78 unique named cards')
for t in original('tarot.json')['cards']:
 majorcard=t.get('arcana')=='Major' or t['id']<22
 name=major[t['id']] if majorcard else suits[t['suit']]+ranks[t['name'].split(' of ')[0]]
 art=f"{t['id']:02d}_{major_art[t['id']]}.jpg" if majorcard else f"{({'Pentacles':'Pents'}.get(t['suit'],t['suit']))}{rank_numbers[t['name'].split(' of ')[0]]:02d}.jpg"
 if not (S/'tarot-art'/art).is_file():raise RuntimeError('Missing tarot art: '+art)
 modern=gearberry_by_name[tarot_name(t['name'])]
 expected=f"m{(11 if t['id']==8 else 8 if t['id']==11 else t['id']):02d}.webp" if majorcard else f"{dict(Wands='w',Cups='c',Swords='s',Pentacles='p')[t['suit']]}{rank_numbers[t['name'].split(' of ')[0]]:02d}.webp"
 if modern['filename']!=expected or modern['number']!=int(expected[1:3]) or not (S/'tarot-gearberry'/expected).is_file():raise RuntimeError('Gearberry card name / number / image mismatch: '+t['name'])
 tarot.append({'id':str(t['id']),'name':name,'english':t['name'],'number':ranks.get(str(t['number']),t['number']),'suit':'大阿尔卡那' if majorcard else suits[t['suit']],'element':{'Air':'风','Water':'水','Fire':'火','Earth':'土'}.get(t.get('element'),''),'gloss':gloss[t['id']] if majorcard else {'Wands':'行动、创造与热情','Cups':'情感、关系与直觉','Swords':'思想、冲突与判断','Pentacles':'物质、工作与资源'}[t['suit']],'image':art,'gearberryImage':modern['filename'],'gearberryNumber':modern['number']})
save('tarot',tarot)
shutil.copytree(S/'tarot-art',O/'tarot-art',dirs_exist_ok=True)
shutil.copytree(S/'tarot-gearberry',O/'tarot-gearberry',dirs_exist_ok=True)
shutil.copyfile(S/'tarot-gearberry-README.txt',O/'tarot-gearberry-README.txt')
(O/'tarot-gearberry-NOTICE.txt').write_text('Tarot Cards WebP Collection by Gearberry - https://github.com/reginanka/tarot-cards\nLicense: Creative Commons Attribution 4.0 International (CC BY 4.0).\nhttps://creativecommons.org/licenses/by/4.0/\nPinned source: 83a25b0d4caeb24fa7d556796cf6244d8a55fd81.\n78 unmodified 848 x 1264 WebP card images, distributed byte-for-byte. No resizing, recolouring or cropping. The card back is not included.\nThe upstream README and LICENSE.md explicitly apply CC BY 4.0 to the images and require the attribution above. The repository does not identify an original illustrator or its image creation method; this site does not claim those details are verified.\nOriginal README and license are bundled as tarot-gearberry-README.txt and tarot-gearberry-LICENSE.txt. Original cards.json, including the unused back record and interpretations, is preserved only in upstream/reference/sources/tarot-gearberry-cards.json for provenance and name-to-file validation; the interpretation text is not used by the tool.\nChinese names and concise keywords remain local; identification fields remain sourced from Tarot Card Data. Match artwork by card name, not array position. Gearberry Justice VIII / Strength XI; classic RWS Strength VIII / Justice XI. The selected deck controls visible numbers, numeric queries, dropdown ordering and result images.\nPer-file pinned URLs and SHA-256: UPSTREAM.json.\n')
for name in ['tarot-art-README.txt','tarot-art-SOURCES.txt','tarot-art-metadata.json']:shutil.copyfile(S/name,O/name)
(O/'tarot-art-NOTICE.txt').write_text('Rider–Waite–Smith (1909), 78 card images. Public Domain.\nArtist: Pamela Colman Smith (1878–1951); design: Arthur Edward Waite; publisher: Rider & Company.\nOriginal 1909 Pam-A scans restored by Steve P.: https://steve-p.org/cards/RWSa.html\nImage mirror: https://github.com/mixvlad/TarotCards/tree/840b84d012c6b74dc1634fa2d00d1b21f5b28093/tarot/rider-waite/720px\nThese JPEGs are distributed byte-for-byte from the pinned mirror. No recolouring, cropping or resizing by this site.\nThe mirror explicitly designates this deck as Public Domain in metadata.json, README.md and SOURCES.md. Its documentation is MIT (tarot-art-LICENSE.txt); the artwork is not relabelled MIT.\nStrength VIII / Justice XI; minor ranks 01–10, 11 Page, 12 Knight, 13 Queen, 14 King.\nPer-file pinned URLs and SHA-256: UPSTREAM.json. Chinese names and concise keywords are authored locally.\n')
save('colors',[[r['name'],r['hex']] for r in csvrows('colors.csv')])
g=Graph().parse(S/'geology-chart.ttl',format='turtle');SK=Namespace('http://www.w3.org/2004/02/skos/core#');GT=Namespace('http://resource.geosciml.org/ontology/timescale/gts#');TM=Namespace('http://www.w3.org/2006/time#');DS=Namespace('https://data.stratigraphy.org/data/gts/');SC=Namespace('https://schema.org/');records=[]
for subject,rank in g.subject_objects(GT['rank']):
 begin=g.value(g.value(subject,TM.hasBeginning),DS.inMYA);end=g.value(g.value(subject,TM.hasEnd),DS.inMYA)
 if begin is None or end is None:continue
 labels={v.language:str(v) for v in g.objects(subject,SK.prefLabel)};rid=str(subject).split('/')[-1];rank=str(rank).split('/')[-1]
 records.append({'id':rid,'name':labels.get('zh',labels.get('en',rid)).replace(' ',''),'english':labels.get('en',rid),'rank':{'Eon':'宙','Era':'代','Period':'纪','Epoch':'世','Age':'期','SubPeriod':'亚纪','SubEpoch':'亚世'}.get(rank,rank),'start':float(begin),'end':float(end),'parent':str(g.value(subject,SK.broader) or '').split('/')[-1],'color':str(g.value(subject,SC.color) or '#7aa8b4')})
save('geology',sorted(records,key=lambda x:(-x['start'],x['end'])))
sequences=[]
for f in sorted((S/'oeis').glob('*.seq')):
 lines=f.read_text().splitlines();id=f.stem;parts=lambda codes:[l.split(' ',2)[2] for l in lines if len(l.split(' ',2))==3 and l[:2] in codes]
 terms=''.join(parts(['%V','%W','%X']) or parts(['%S','%T','%U'])).strip(',').split(',');terms=[v.strip() for v in terms if re.fullmatch(r'-?\d+',v.strip())]
 if len(terms)<3:continue
 sequences.append({'id':id,'name':' '.join(parts(['%N'])),'terms':terms,'offset':(parts(['%O']) or ['0'])[0].split(',')[0]})
save('integerseq',sequences)
# Only keep self-contained COD records; the app's strict parser validates structure before display.
crystals=[]
zhmin={'9008564-diamond':'金刚石','9011575-diamond':'金刚石（另一记录）','9000019':'铁蛇纹石','9000020':'氟铝镁石','9000025':'黑云母','9000079':'蓝辉铜矿','9000195':'钠镁矾','9000251':'副菱铁矾','9000305':'水磷锰矿','9000307':'硅钒钙石','9000612':'针钠钙石','9007550':'钙铜矾','9008434':'钛磷铁锰矿','9008098':'三碘化砷'}
for stem,zhname in zhmin.items():
 f=S/'crystals'/(stem+'.cif');raw=f.read_bytes();txt=raw.decode('utf8','replace');formula=re.search(r'^_chemical_formula_sum\s+([^\n]+)',txt,re.M);name=re.search(r'^_chemical_name_mineral\s+([^\n]+)',txt,re.M)
 crystals.append({'id':stem.split('-')[0],'name':zhname,'english':name[1].strip("'\"") if name else '', 'formula':formula[1].strip("'\"") if formula else '', 'file':f.name})
 (O/'crystals').mkdir(exist_ok=True);shutil.copyfile(f,O/'crystals'/f.name)
save('crystals',crystals)
for f in S.glob('*'):
 if f.is_file() and ('LICENSE' in f.name or f.name in ['tarot-README.txt','ports-README.txt']):shutil.copyfile(f,O/f.name)
(O/'cod-NOTICE.txt').write_text('Crystallography Open Database (COD)\nData: CC0 1.0 / public domain. https://www.crystallography.net/cod/\nhttps://creativecommons.org/publicdomain/zero/1.0/\nOriginal CIF notices, publication authors, article title and journal remain in each CIF file.\nPinned snapshots from cod-developers/cod-tools tests/inputs; no cod-tools program code is included.\nPreserve attribution to the original crystallographic publications.\n')
meta={'snapshot':'2026-10-09','counts':{k:len(json.loads((O/(k+'.json')).read_text())) for k in ['countries','airports','ports','tarot','colors','geology','integerseq','crystals']},'tarotDecks':{'gearberry':78,'rws':78},'unicode':'17.0.0','geology':'ICS chart pinned 81618a865cdb04998355a302f3e859908a080c0e'};save('META',meta)
imports=json.loads((ROOT/'upstream/reference/imports.json').read_text());files=imports['files'][:]
for f in sorted(O.rglob('*')):
 if f.is_file() and f.name!='UPSTREAM.json':files.append({'path':str(f.relative_to(ROOT)),'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
(O/'UPSTREAM.json').write_text(json.dumps({'pins':imports['pins'],'files':files},indent=2)+'\n')
