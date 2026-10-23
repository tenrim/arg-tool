"""Derive input notation from the exact libqalculate sources already shipped.

Reference-only composite names (km_c, m_p_s, ...) are not input syntax.
No conversion factors are calculated here: Qalculate remains the calculator.
"""
import hashlib
import io
import json
from pathlib import Path
import tarfile
import xml.etree.ElementTree as ET
import zipfile

root = Path(__file__).resolve().parent.parent
archive = root / 'public/vendor/qalculate/source.zip'
with zipfile.ZipFile(archive) as bundle:
    with tarfile.open(fileobj=io.BytesIO(bundle.read('core.tar.gz')), mode='r:gz') as core:
        def document(suffix):
            name = next(n for n in core.getnames() if n.endswith('/data/' + suffix))
            return ET.fromstring(core.extractfile(name).read())
        definitions = [document('units.xml.in'), document('currencies.xml.in')]
        prefixes = document('prefixes.xml.in')
nodes = {}
def names(node):
    text = node.findtext('names') or node.findtext('_names') or ''
    return [(x.split(':', 1)[0], x.split(':', 1)[1]) if ':' in x else ('', x) for x in text.split(',') if x]
for doc in definitions:
    for node in doc.iter('unit'):
        if node.get('type'):
            for flags, name in names(node):
                nodes[name] = node
prefix_map = {}
for node in prefixes.iter('prefix'):
    exponent = node.findtext('exponent')
    if exponent is not None:
        values = names(node)
        abbreviation = next((name for flags, name in values if 'a' in flags), values[0][1])
        prefix_map[(node.get('type', 'decimal'), exponent)] = abbreviation
cache = {}
def notation(name, visiting=()):
    if name in cache:
        return cache[name]
    if name in visiting:
        raise ValueError('Cyclic unit definition: ' + name)
    node = nodes[name]
    if node.get('type') != 'composite':
        usable = [(flags, value) for flags, value in names(node) if 'o' not in flags]
        value = next((v for flags, v in usable if 'a' in flags and 'p' not in flags), usable[0][1])
    else:
        parts = []
        for part in node.findall('part'):
            unit = notation(part.findtext('unit'), visiting + (name,))
            prefix = part.find('prefix')
            if prefix is not None and prefix.text not in ('0', '', None):
                kind = prefix.get('type', 'decimal')
                symbol = prefix_map.get((kind, prefix.text))
                if symbol is None:
                    raise ValueError('Unknown prefix: ' + str((kind, prefix.text)))
                unit = symbol + unit
            exponent = part.findtext('exponent', '1')
            parts.append('(' + unit + ')' + ('^(' + exponent + ')' if exponent != '1' else ''))
        value = '*'.join(parts)
    cache[name] = value
    return value
for name in nodes:
    notation(name)
result = {'source': 'public/vendor/qalculate/source.zip', 'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
          'license': 'GPL-2.0-or-later (original libqalculate unit definitions)', 'notation': cache}
(root / 'public/qalculate/unit-definitions.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Derived {len(cache)} original unit names and their actual input notation.')
