#!/usr/bin/env python3
"""Offline, standard-library-only conversion; no source records or fields are filtered."""
import collections
import gzip
import hashlib
import json
from pathlib import Path
import posixpath
import re
import shutil
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'upstream/atlas-life-culture'
DEST = ROOT / 'public/vendor/atlas-life-culture'
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main', 'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
REL_NS = '{http://schemas.openxmlformats.org/package/2006/relationships}'
PIN = json.loads((SOURCE / 'pins.json').read_text(encoding='utf-8'))
CHINESE_SOURCE = ROOT / 'upstream/atlas-chinese'

def sha(data):
    return hashlib.sha256(data).hexdigest()

def write_json(name, value):
    data = (json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n').encode('utf-8')
    (DEST / name).write_bytes(data)
    (DEST / (name + '.gz')).write_bytes(gzip.compress(data, compresslevel=9, mtime=0))
    return len(data)

def column_number(reference):
    number = 0
    for c in re.match(r'[A-Z]+', reference).group():
        number = number * 26 + ord(c) - ord('A') + 1
    return number - 1

def relationships(archive, part):
    directory, filename = posixpath.split(part)
    rel_path = posixpath.join(directory, '_rels', filename + '.rels')
    if rel_path not in archive.namelist():
        return {}
    return {x.attrib['Id']: x.attrib for x in ET.fromstring(archive.read(rel_path))}

def read_workbook(path):
    with zipfile.ZipFile(path) as archive:
        strings = []
        if 'xl/sharedStrings.xml' in archive.namelist():
            strings = [''.join(t.text or '' for t in element.findall('.//s:t', NS)) for element in ET.fromstring(archive.read('xl/sharedStrings.xml'))]
        workbook = ET.fromstring(archive.read('xl/workbook.xml'))
        rels = relationships(archive, 'xl/workbook.xml')
        result = []
        for element in workbook.find('s:sheets', NS):
            ref = rels[element.attrib['{' + NS['r'] + '}id']]['Target']
            part = ref.lstrip('/') if ref.startswith('/') else posixpath.normpath(posixpath.join('xl', ref))
            xml = ET.fromstring(archive.read(part))
            sheet = {'name': element.attrib['name'], 'rows': [], 'cellMetadata': {}, 'mergedCells': []}
            for row in xml.findall('./s:sheetData/s:row', NS):
                values = []
                for cell in row.findall('s:c', NS):
                    index = column_number(cell.attrib['r'])
                    while len(values) <= index:
                        values.append(None)
                    raw = cell.find('s:v', NS)
                    raw = raw.text if raw is not None else None
                    kind = cell.attrib.get('t')
                    if kind == 's':
                        value = strings[int(raw)] if raw is not None else None
                    elif kind == 'inlineStr':
                        value = ''.join(t.text or '' for t in cell.findall('.//s:t', NS))
                    elif kind == 'b':
                        value = raw == '1' if raw is not None else None
                    elif kind in ('str', 'e', 'd'):
                        value = raw
                    elif raw is None:
                        value = None
                    else:
                        value = int(raw) if re.fullmatch(r'-?\d+', raw) else float(raw)
                    values[index] = value
                    formula = cell.find('s:f', NS)
                    if formula is not None:
                        sheet['cellMetadata'].setdefault(cell.attrib['r'], {})['formula'] = {'text': formula.text or '', **formula.attrib}
                    if kind == 'e':
                        sheet['cellMetadata'].setdefault(cell.attrib['r'], {})['error'] = raw
                while values and values[-1] is None:
                    values.pop()
                if values:
                    sheet['rows'].append({'row': int(row.attrib['r']), 'values': values})
            sheet_rels = relationships(archive, part)
            for link in xml.findall('./s:hyperlinks/s:hyperlink', NS):
                entry = dict(link.attrib)
                rid = entry.pop('{' + NS['r'] + '}id', None)
                if rid:
                    entry['target'] = sheet_rels[rid]['Target']
                sheet['cellMetadata'].setdefault(entry.pop('ref'), {})['hyperlink'] = entry
            for relationship in sheet_rels.values():
                if relationship.get('Type', '').endswith('/comments'):
                    target = relationship['Target']
                    target = target.lstrip('/') if target.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(part), target))
                    comments = ET.fromstring(archive.read(target))
                    authors = [a.text or '' for a in comments.findall('./s:authors/s:author', NS)]
                    for comment in comments.findall('./s:commentList/s:comment', NS):
                        sheet['cellMetadata'].setdefault(comment.attrib['ref'], {})['comment'] = {'author': authors[int(comment.attrib['authorId'])], 'text': ''.join(t.text or '' for t in comment.findall('.//s:t', NS))}
            sheet['mergedCells'] = [m.attrib['ref'] for m in xml.findall('./s:mergeCells/s:mergeCell', NS)]
            result.append(sheet)
        return result

def main():
    DEST.mkdir(parents=True, exist_ok=True)
    chinese_pin = json.loads((CHINESE_SOURCE / 'pins.json').read_text(encoding='utf-8'))
    for source in PIN['files'] + chinese_pin['files']:
        data = (ROOT / source['path']).read_bytes()
        if sha(data) != source['sha256']:
            raise RuntimeError(f"Fixed source mismatch: {source['path']}")
    sheets = read_workbook(SOURCE / 'AviList-v2025b-10Jun2026-extended.xlsx')
    main_sheet = sheets[0]
    columns = main_sheet['rows'][0]['values']
    labels = main_sheet['rows'][1]['values']
    main_rows = main_sheet['rows'][2:]
    records = [r['values'] + [None] * (len(columns) - len(r['values'])) for r in main_rows]
    counts = dict(collections.Counter(row[columns.index('Taxon_rank')] for row in records))
    if counts != {'order': 46, 'family': 252, 'genus': 2376, 'species': 11131, 'subspecies': 19879}:
        raise RuntimeError(f"AviList pinned scope changed: {counts}")
    main_sheet['recordRows'] = [r['row'] for r in main_rows]
    main_sheet['recordsRef'] = 'birds.json#/records'
    main_sheet['rows'] = main_sheet['rows'][:2]
    multilingual = read_workbook(CHINESE_SOURCE / 'IOC-Multilingual-15.2.xlsx')
    multilingual_sheet = next(sheet for sheet in multilingual if sheet['name'] == 'List')
    ioc_columns = multilingual_sheet['rows'][0]['values']
    if len(multilingual_sheet['rows']) != 11228:
        raise RuntimeError('Expected complete IOC 15.2 multilingual list of 11,227 species')
    ioc = {}
    for row in multilingual_sheet['rows'][1:]:
        values = row['values'] + [None] * (len(ioc_columns) - len(row['values']))
        key = values[ioc_columns.index('IOC_15.2')]
        if not key or key in ioc:
            raise RuntimeError('IOC scientific names must be complete and unique; never guess an ambiguous taxonomic match')
        simplified, traditional = values[ioc_columns.index('Chinese')], values[ioc_columns.index('Chinese (Traditional)')]
        ioc[key] = {'simplified': simplified, 'traditional': traditional, 'names': list(dict.fromkeys(value for value in [simplified, traditional] if value and re.search(r'[\u3400-\u9fff]', value))), 'sourceRow': row['row']}
    chinese_names = {}
    for row in records:
        scientific = row[columns.index('Scientific_name')]
        if row[columns.index('Taxon_rank')] == 'species' and scientific in ioc and ioc[scientific]['names']:
            chinese_names[scientific] = ioc[scientific]
    bird_chinese = {'dataset': 'IOC World Bird List Multilingual 15.2', 'snapshotDate': chinese_pin['snapshotDate'], 'license': 'CC-BY-3.0', 'sourceURL': 'https://www.worldbirdnames.org/new/ioc-lists/master-list-2/', 'citation': 'Gill F, D Donsker & P Rasmussen (Eds). 2026. IOC World Bird List (v15.2). doi:10.14344/IOC.ML.15.2. Chinese names: Zheng Guangmei (Ed), Jian Mei, China Bird Report Editors and Zheng Zuoxin; Traditional Chinese names: Juan Ching-Sung / Wild Bird Society of Taipei, as credited in original workbook Sources.', 'matchedSpecies': len(chinese_names), 'unmatchedSpecies': counts['species'] - len(chinese_names), 'sourceSpecies': len(ioc), 'scope': 'Chinese and Traditional Chinese names joined only by exact complete scientific-name equality, species rank only. All source Chinese fields retained; no inferred synonyms, genus reassignment, split/lump or subspecies naming. Original multilingual XLSX and its Sources worksheet archived unmodified.'}
    bird_meta = {'dataset': 'AviList', 'version': 'v2025b', 'snapshotDate': PIN['snapshotDate'], 'published': '2026-06-11', 'license': 'CC-BY-4.0; Chinese name supplement CC-BY-3.0; CLDR geographic search labels Unicode-3.0', 'url': 'https://www.avilist.org/checklist/v2025b/', 'doi': 'https://doi.org/10.2173/avilist.v2025b', 'citation': 'AviList Core Team. 2026. AviList: The Global Avian Checklist, v2025b. https://doi.org/10.2173/avilist.v2025b', 'recordCount': len(records), 'rankCounts': counts, 'columnCount': len(columns), 'metadataFile': 'birds-metadata.json', 'workbookFile': 'AviList-v2025b-10Jun2026-extended.xlsx', 'sheets': [{'name': s['name'], 'nonemptyRows': len(s.get('recordRows', [])) + len(s['rows'])} for s in sheets], 'chineseSupplement': bird_chinese, 'scope': 'Complete Extended workbook: all taxonomic ranks, 26 columns and all six worksheets; additive exact scientific-name Chinese-name supplement from IOC 15.2; no bird-photo or birdsong database.'}
    birds_size = write_json('birds.json', {'meta': bird_meta, 'columns': columns, 'labels': labels, 'records': records, 'chineseNames': chinese_names})
    write_json('birds-metadata.json', {'meta': bird_meta, 'sheets': sheets})
    shutil.copyfile(SOURCE / bird_meta['workbookFile'], DEST / bird_meta['workbookFile'])
    dump = json.loads((SOURCE / 'openopus-dump.json').read_text(encoding='utf-8'))
    if dump['status'].get('success') != 'true' or not isinstance(dump.get('composers'), list):
        raise RuntimeError('Open Opus did not provide a successful complete dump')
    chinese_music = json.loads((CHINESE_SOURCE / 'wikidata-composers.json').read_text(encoding='utf-8'))
    music_forms = json.loads((CHINESE_SOURCE / 'wikidata-music-forms.json').read_text(encoding='utf-8'))
    composer_names = {(row['completeName'], row['birth'], row['death']): row for row in chinese_music['records']}
    if len(composer_names) != len(chinese_music['records']):
        raise RuntimeError('Chinese composer identities are not unique')
    composers, works = [], []
    for number, raw in enumerate(dump['composers']):
        composer = {k: v for k, v in raw.items() if k != 'works'}
        composer_id = 'composer:' + sha(json.dumps(composer, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8'))[:20]
        ids = []
        for index, work in enumerate(raw.get('works', [])):
            work_id = f'work:{number}:{index}'
            ids.append(work_id)
            works.append({'id': work_id, 'composerId': composer_id, 'raw': work})
        record = {'id': composer_id, 'raw': composer, 'workIds': ids}
        chinese = composer_names.get((composer['complete_name'], composer['birth'], composer['death']))
        if chinese:
            record['chinese'] = {**chinese, 'snapshotDate': chinese_music['meta']['snapshotDate']}
        composers.append(record)
    if len(works) + len(composers) != int(dump['status']['rows']):
        raise RuntimeError('Open Opus status rows differs from all composers plus their works')
    music_meta = {'dataset': 'Open Opus', 'version': str(dump['status'].get('version', '')), 'snapshotDate': PIN['snapshotDate'], 'license': 'CC0-1.0', 'url': 'https://openopus.org/', 'sourceUrl': 'https://api.openopus.org/work/dump.json', 'recordCount': len(works), 'composerCount': len(composers), 'originalStatus': dump['status'], 'originalRequest': dump['request'], 'chineseSupplement': chinese_music['meta'], 'scope': 'Complete official work/dump.json snapshot, all composers and all their works and original fields. Additive Wikidata Chinese composer names after exact identity verification; work titles/descriptions remain original. IDs are local snapshot identifiers. Portrait URLs, if present upstream, are metadata only: no image fetch or redistributable portrait collection; no recordings, scores or exhaustive global music catalogue.'}
    music_meta['chineseTerminology'] = {**music_forms['meta'], 'termCount': len(music_forms['records'])}
    music_size = write_json('music.json', {'meta': music_meta, 'composers': composers, 'records': works, 'terminology': music_forms['records']})
    for name in ['AviList-CC-BY-4.0.txt', 'OpenOpus-CC0-1.0.txt', 'NOTICE.txt']:
        shutil.copyfile(SOURCE / name, DEST / name)
    for source_name, output_name in [('IOC-CC-BY-3.0.txt', 'IOC-CC-BY-3.0.txt'), ('Wikidata-CC0-1.0.txt', 'Wikidata-CC0-1.0.txt'), ('NOTICE.txt', 'CHINESE-NOTICE.txt')]:
        shutil.copyfile(CHINESE_SOURCE / source_name, DEST / output_name)
    files = [{'path': p.relative_to(ROOT).as_posix(), 'bytes': p.stat().st_size, 'sha256': sha(p.read_bytes())} for p in sorted(DEST.iterdir()) if p.name != 'UPSTREAM.json' and p.is_file()]
    (DEST / 'UPSTREAM.json').write_text(json.dumps({'snapshotDate': PIN['snapshotDate'], 'sources': PIN['files'] + chinese_pin['files'], 'files': files, 'transform': 'scripts/build-atlas-life-culture.py', 'preservation': 'All AviList records/columns/sheets/notes and every Open Opus composer/work/field; no original row selection or translation. Chinese names are additive sourced overlays, original record IDs and raw fields unchanged.'}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'birdsRecords': len(records), 'birdRanks': counts, 'birdsBytes': birds_size, 'chineseBirdSpecies': len(chinese_names), 'composers': len(composers), 'chineseComposers': len(composer_names), 'works': len(works), 'musicBytes': music_size}, ensure_ascii=False))

if __name__ == '__main__':
    main()
