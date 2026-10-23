#!/usr/bin/env python3
"""Offline, dependency-free generators for discovery data and the SGF adapter.

Every imported file must match imports.json before regeneration. Data selection
and adapter transformations are explicit here; original files remain untouched.
"""
import csv
import gzip
import hashlib
import json
import math
import pathlib
import re
import shutil

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = ROOT / 'upstream/discovery'
SOURCE = BASE / 'sources'
OUT = ROOT / 'public/vendor/discovery'
IMPORTS = json.loads((BASE / 'imports.json').read_text())
for record in IMPORTS['files']:
    path = ROOT / record['path']
    if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != record['sha256']:
        raise RuntimeError('Discovery source integrity mismatch: ' + record['path'])
    if record.get('compression') == 'gzip' and hashlib.sha256(gzip.decompress(path.read_bytes())).hexdigest() != record['content_sha256']:
        raise RuntimeError('Discovery original content mismatch: ' + record['path'])
OUT.mkdir(parents=True, exist_ok=True)
for old_chunk in (OUT / 'sky-records').glob('*.json'):
    old_chunk.unlink()
for name in ['hyg-LICENSE.txt', 'hyg-README.txt']:
    (OUT / name).unlink(missing_ok=True)

def save(name, value):
    (OUT / name).parent.mkdir(parents=True, exist_ok=True)
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n',encoding='utf-8',newline='\n')

def source_text(name):
    return (SOURCE / name).read_text()

def csv_rows(name, delimiter=','):
    path=SOURCE / name
    opener=gzip.open if path.suffix == '.gz' else open
    with opener(path, mode='rt', encoding='utf-8-sig', newline='') as source:
        yield from csv.DictReader(source, delimiter=delimiter)

def number(value):
    try:
        n = float(value)
        return n if math.isfinite(n) else None
    except (ValueError, TypeError):
        return None

currencies = []
for index, row in enumerate(csv_rows('currency/codes-all.csv')):
    code = row['AlphabeticCode'].strip()
    if not code:
        continue
    numeric = row['NumericCode'].strip()
    minor = row['MinorUnit'].strip()
    withdrawal = row['WithdrawalDate'].strip()
    currencies.append({
        'id': f'{code}:{index}', 'code': code,
        'numeric': numeric.zfill(3) if numeric.isdigit() else '',
        'name': row['Currency'], 'minorUnit': int(minor) if minor.isdigit() else None,
        'entity': row['Entity'], 'status': 'historic' if withdrawal else 'current',
        'withdrawal': withdrawal,
    })
save('currencies.json', currencies)

phonetics = 'Alfa Bravo Charlie Delta Echo Foxtrot Golf Hotel India Juliett Kilo Lima Mike November Oscar Papa Quebec Romeo Sierra Tango Uniform Victor Whiskey X-ray Yankee Zulu'.split()
digit_phonetics = 'Nadazero Unaone Bissotwo Terrathree Kartefour Pantafive Soxisix Setteseven Oktoeight Novenine'.split()
flags = []
for index, letter in enumerate('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'):
    filename = 'flags/' + letter.lower() + '.svg'
    flags.append({
        'id': letter, 'name': ('字母 ' if letter.isalpha() else '数字 ') + letter,
        'phonetic': phonetics[index] if index < 26 else digit_phonetics[index - 26],
        'file': filename,
    })
    (OUT / filename).parent.mkdir(exist_ok=True)
    shutil.copyfile(SOURCE / 'marine' / filename, OUT / filename)
save('marine-flags.json', flags)

def sexagesimal(value, declination=False):
    if not value.strip():
        return None
    pieces = value.strip().lstrip('+-').split(':')
    if len(pieces) != 3:
        raise RuntimeError('Invalid OpenNGC coordinate: ' + value)
    result = float(pieces[0]) + float(pieces[1]) / 60 + float(pieces[2]) / 3600
    if value.strip().startswith('-'):
        result = -result
    if not math.isfinite(result) or (abs(result) > 90 if declination else not 0 <= result < 24):
        raise RuntimeError('Out-of-range OpenNGC coordinate')
    return result

deep = []
for filename in ['ngc/NGC.csv', 'ngc/addendum.csv']:
    for raw in csv_rows(filename, ';'):
        id_ = raw['Name']
        aliases = [id_]
        for key in ['M', 'NGC', 'IC']:
            for value in raw[key].split(','):
                value = value.strip()
                if value:
                    aliases.append(key + str(int(value)) if value.isdigit() else key + value)
        for key in ['Common names', 'Identifiers', 'Cstar Names']:
            aliases.extend(value.strip() for value in raw[key].split(',') if value.strip())
        match = re.fullmatch(r'(NGC|IC)(0*)([1-9][0-9]*)(.*)', id_)
        if match:
            aliases.append(match[1] + match[3] + match[4])
        common = raw['Common names'].split(',')[0].strip()
        deep.append({
            'id': id_, 'kind': 'deep', 'name': common or id_,
            'aliases': list(dict.fromkeys(aliases)),
            'ra': sexagesimal(raw['RA']), 'dec': sexagesimal(raw['Dec'], True),
            'mag': number(raw['V-Mag']), 'type': raw['Type'],
            'constellation': raw['Const'], 'raw': raw,
        })
deep.sort(key=lambda row: row['id'])
if len({r['id'] for r in deep}) != len(deep):
    raise RuntimeError('Duplicate OpenNGC identifiers')
for row in deep:
    if (row['ra'] is None) != (row['dec'] is None):
        raise RuntimeError('Partial OpenNGC coordinate: ' + row['id'])

sky_index = []
chunks = []
chunk_size = 500
for start in range(0, len(deep), chunk_size):
    file = f'sky-records/ngc-{start // chunk_size:03d}.json'
    chunk = deep[start:start + chunk_size]
    save(file, chunk)
    chunks.append({'file': file, 'count': len(chunk)})
    sky_index.extend({**{key: value for key, value in row.items() if key != 'raw'}, 'chunk': file} for row in chunk)
save('sky-index.json', sky_index)
metadata = {
    'schema': 1, 'snapshot': '2026-10-10', 'counts': {
        'currencies': len(currencies),
        'currentCurrencyRows': sum(r['status'] == 'current' for r in currencies),
        'historicCurrencyRows': sum(r['status'] == 'historic' for r in currencies),
        'marineFlags': len(flags), 'deep': len(deep),
        'deepWithoutCoordinates': sum(r['ra'] is None for r in deep),
    },
    'sky': {
        'epoch': 'J2000.0', 'raUnit': 'hours', 'decUnit': 'degrees',
        'deepSelection': 'All rows from pinned OpenNGC NGC.csv and addendum.csv; unknown positions remain null, not zero.',
        'magnitude': 'OpenNGC V-Mag; absent visual magnitudes remain null (not substituted by B/J/H/K).',
        'chunks': chunks,
    },
}
save('META.json', metadata)

# Convert only the string parsing API to ESM, as recommended by Sabaki's browser
# README. fs and optional legacy buffer encoding code are not runtime imports.
# Original parser/tokenizer/helper algorithms are retained unchanged.
def esm_module(name, imports, body, names, default=False):
    path = OUT / 'sgf-internal' / (name + '.js')
    path.parent.mkdir(exist_ok=True)
    text = '// Generated offline from pinned upstream. See ../NOTICE.txt.\n' + imports + '\nconst exports = {};\n' + body
    if default:
        text += '\nexport default Peekable;\n'
    else:
        text += '\n' + '\n'.join(f'export const {n} = exports.{n};' for n in names) + '\n'
    path.write_text(text,encoding='utf-8',newline='\n')

esm_module('doken', '', source_text('doken/src/main.js'), ['regexRule', 'createTokenizer'])
esm_module('helper', '', source_text('sgf/src/helper.js'), ['escapeString', 'unescapeString', 'parseDates', 'stringifyDates', 'parseVertex', 'stringifyVertex', 'parseCompressedVertices'])
peekable = source_text('sgf/src/peekable.js').replace('module.exports = Peekable', '')
esm_module('peekable', '', peekable, [], True)
tokenize = source_text('sgf/src/tokenize.js')
tokenize = tokenize[tokenize.index('const _tokenize = createTokenizer'):tokenize.index('// The value of the first CA[] property')]
tokenize += '\nexports.tokenize = contents => [...exports.tokenizeIter(contents)]\n'
esm_module('tokenize', "import {createTokenizer, regexRule} from './doken.js';", tokenize, ['tokenizeIter', 'tokenize'])
parse = source_text('sgf/src/parse.js')
parse = parse[parse.index('function _parseTokens'):parse.index('exports.parseBuffer =')]
esm_module('parse', "import Peekable from './peekable.js';\nimport {tokenizeIter} from './tokenize.js';\nimport {unescapeString} from './helper.js';", parse, ['parse', 'parseTokens'])
stringify = source_text('sgf/src/stringify.js')
stringify = stringify[stringify.index('exports.stringify ='):]
esm_module('stringify', "import {escapeString} from './helper.js';", stringify, ['stringify'])
(OUT / 'sgf.js').write_text(
    '// Generated offline from @sabaki/sgf 3.5.0 and doken 1.0.0 (MIT). See NOTICE.txt.\n'
    "export {parse, parseTokens} from './sgf-internal/parse.js';\n"
    "export {tokenize, tokenizeIter} from './sgf-internal/tokenize.js';\n"
    "export {stringify} from './sgf-internal/stringify.js';\n"
    "export {escapeString, unescapeString, parseVertex, stringifyVertex, parseCompressedVertices, parseDates, stringifyDates} from './sgf-internal/helper.js';\n"
,encoding='utf-8',newline='\n')
for source, target in [
    ('currency/README.md', 'currency-README.txt'), ('currency/datapackage.json', 'currency-datapackage.json'),
    ('ngc/CC-BY-SA-4.0.txt', 'ngc-LICENSE.txt'), ('ngc/README.md', 'ngc-README.txt'),
    ('ngc/NGC_guide.txt', 'ngc-FIELDS.txt'),
    ('marine/LICENSE', 'marine-LICENSE.txt'), ('marine/README.md', 'marine-README.txt'),
    ('sgf/LICENSE', 'sgf-LICENSE.txt'), ('sgf/README.md', 'sgf-README.txt'),
    ('doken/LICENSE', 'doken-LICENSE.txt'),
]:
    shutil.copyfile(SOURCE / source, OUT / target)

(OUT / 'NOTICE.txt').write_text(
    'Discovery integrations — fixed local snapshots and generated browser adapter.\n\n'
    'Currency Codes: datasets/currency-codes, https://github.com/datasets/currency-codes\n'
    'Data: Open Data Commons Public Domain Dedication and License 1.0 (PDDL).\n'
    'https://opendatacommons.org/licenses/pddl/1-0/\n'
    'Original current and historic ISO 4217 currency/fund table consolidation from SIX Group.\n'
    'Generated fields normalize numeric codes to three digits, preserve entity rows and withdrawal strings,\n'
    'omit rows without an alphabetic currency code and derive current/historic from withdrawal.\n'
    'No exchange rates. Dataset snapshot, not a live ISO registry.\n\n'
    'Marine Signal Flags: dzangolab/marine-signal-flags, https://github.com/dzangolab/marine-signal-flags\n'
    'MIT, copyright Panayiotis Lipiridis (2013), as stated by upstream. See marine-LICENSE.txt.\n'
    '36 unmodified SVG assets. Chinese labels and phonetic identification fields are locally assembled factual labels.\n'
    'No long single-flag or multi-flag signal meanings copied from an external text.\n\n'
    'OpenNGC: Mattia Verga, https://github.com/mattiaverga/OpenNGC\n'
    'CC BY-SA 4.0. Complete pinned NGC.csv and addendum.csv records, including unavailable positions.\n'
    'Generated index converts J2000 sexagesimal coordinates; original raw fields/source references remain in detail chunks.\n'
    'Adapted OpenNGC data remain CC BY-SA 4.0. Credits to NED, HyperLEDA, SIMBAD, HEASARC and Harold Corwin\n'
    'are preserved in ngc-README.txt; per-object Sources fields are retained.\n\n'
    '@sabaki/sgf 3.5.0: Yichuan Shen / SabakiHQ, https://github.com/SabakiHQ/sgf\n'
    'MIT. doken 1.0.0: Yichuan Shen, https://github.com/yishn/doken — MIT.\n'
    'Generated static ESM modules keep upstream string-tokenization/parsing/helper/stringifying algorithms.\n'
    'Node filesystem and buffer parsing/automatic encoding detection are deliberately excluded; site file decoding is separate.\n'
    'No runtime npm/CDN requests. Original complete downloaded source and both licenses are in upstream/discovery.\n\n'
    'Pinned commits, original source URLs, imported and generated SHA-256: UPSTREAM.json.\n'
    'Generator: scripts/build-discovery.py (offline); importer: scripts/import-discovery.py (maintenance-only network).\n'
,encoding='utf-8',newline='\n')
files = IMPORTS['files'][:]
for script in ['scripts/import-discovery.py', 'scripts/build-discovery.py']:
    files.append({'path': script, 'sha256': hashlib.sha256((ROOT / script).read_bytes()).hexdigest()})
for path in sorted(OUT.rglob('*')):
    if path.is_file() and path.name != 'UPSTREAM.json':
        files.append({'path': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
(OUT / 'UPSTREAM.json').write_text(json.dumps({
    'pins': IMPORTS['pins'], 'packages': IMPORTS['packages'], 'files': files,
}, indent=2) + '\n',encoding='utf-8',newline='\n')
print('Generated discovery data:', json.dumps(metadata['counts']))
