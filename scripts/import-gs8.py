"""Maintain the complete published GS8 symbol tables; never omit duplicate codes.
Run explicitly online. Runtime and primary build use the fixed JSON snapshot.
"""
import hashlib, html, json, re, urllib.request
from pathlib import Path

root = Path('upstream/completion-20261017/gs8')
root.mkdir(exist_ok=True)
pages = ['overlap', 'numbers', 'ascii', 'greek', 'miscellaneous', 'indicators', 'shape']
rows, sources = [], []
for page in pages:
    url = 'https://web.archive.org/web/20100611002719id_/http://dots.physics.orst.edu/gs_' + page + '.html'
    cached = Path('.tmp-expansion-tests/gs_' + page + '.html')
    data = cached.read_bytes() if cached.exists() else urllib.request.urlopen(url, timeout=45).read()
    sources.append({'page': page, 'url': url, 'sha256': hashlib.sha256(data).hexdigest()})
    # Only factual symbol/dot assignments, not explanatory prose or page markup.
    text = re.sub(r'<(?:li|br)\b[^>]*>', '\n', data.decode(), flags=re.I)
    text = html.unescape(re.sub(r'<[^>]*>', ' ', text))
    text = re.sub(r'\s+', ' ', text)
    # Entries begin after a tag boundary; multiline labels are normalized.
    raw = re.split(r'<(?:li|br)\b[^>]*>', data.decode(), flags=re.I)
    for part in raw[1:]:
        part = html.unescape(re.sub(r'<[^>]*>', ' ', part))
        part = re.sub(r'\s+', ' ', part).strip()
        for m in re.finditer(r'(?:^|\])\s*([^\[\]]+?)\s*\[([1-8, ]+)\]', part):
            label, dots = m.groups()
            cells = [''.join(sorted(set(c.strip()))) for c in dots.split(',')]
            rows.append({'id': f'{page}-{len(rows)+1}', 'name': label.strip(), 'dots': cells,
                         'publishedDots': dots, 'source': page})
    expected = {'overlap':7,'numbers':10,'ascii':19,'greek':35,'miscellaneous':28,'indicators':40,'shape':9}[page]
    if sum(r['source']==page for r in rows) != expected:
        raise ValueError('Published symbol coverage changed: ' + page)
letters = ['1','12','14','145','15','124','1245','125','24','245','13','123','134','1345','135','1234','12345','1235','234','2345','136','1236','2456','1346','13456','1356']
for i, dots in enumerate(letters):
    for upper in [False, True]:
        char = chr((65 if upper else 97) + i)
        rows.append({'id': ('upper-' if upper else 'lower-')+char, 'name': char,
                     'dots': [dots+('7' if upper else '')], 'source': 'overlap', 'character': char})
for char,dots in [(' ','0'),(',', '2'),(';','23'),(':','25'),('.','256'),('!','235'),("'",'3'),('-','36'),('“','236'),('”','356')]:
    rows.append({'id': 'literal-'+str(ord(char)), 'name': char, 'dots':[dots], 'source':'overlap','character':char})
payload={'sources':sources,'symbols':rows,'notes':[
 '原作者数字表将 0 列为 136，与 u 同码；文字描述与表值不一致。保留原始表值，解码显示全部候选，不自行猜改。',
 'phi 原表写为 12148，重复点号 1 归一为 1248，publishedDots 保留原记法。',
 '原表两项 underline 使用不同点位，均保留。命名标记表示 GS8 排版结构，不自动执行数学排版。']}
(root/'symbols.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
print('Published GS8 entries:',len(rows), 'by page:',{p:sum(r['source']==p and 'character' not in r for r in rows) for p in pages})
