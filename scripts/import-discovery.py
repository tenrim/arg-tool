#!/usr/bin/env python3
"""Maintenance only: fetch fixed discovery sources. Ordinary builds are offline.

Existing downloaded sources are validated against imports.json. Reimporting from
scratch fetches the same commits and package integrity, never latest.
"""
import base64
import gzip
import concurrent.futures
import hashlib
import io
import json
import pathlib
import tarfile
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = ROOT / 'upstream/discovery'
PINS = json.loads((BASE / 'pins.json').read_text())
DOKEN_INTEGRITY = 'KoWqzS6SrHWKqbRU8DlXAEja0IorWvSN4O37ptueAc/unSnbd4lOYGFKNaRrOH2CayIrdkQje3EoTlg6Xpn3xg=='
JOBS = []
def add(local, repo, remote):
    JOBS.append((local, f'https://raw.githubusercontent.com/{repo}/{PINS[repo]}/{remote}'))

for local, repo, remote in [
    ('currency/codes-all.csv', 'datasets/currency-codes', 'data/codes-all.csv'),
    ('currency/README.md', 'datasets/currency-codes', 'README.md'),
    ('currency/datapackage.json', 'datasets/currency-codes', 'datapackage.json'),
    ('ngc/NGC.csv', 'mattiaverga/OpenNGC', 'database_files/NGC.csv'),
    ('ngc/addendum.csv', 'mattiaverga/OpenNGC', 'database_files/addendum.csv'),
    ('ngc/NGC_guide.txt', 'mattiaverga/OpenNGC', 'NGC_guide.txt'),
    ('ngc/README.md', 'mattiaverga/OpenNGC', 'README.md'),
    ('ngc/CC-BY-SA-4.0.txt', 'mattiaverga/OpenNGC', 'LICENSES/CC-BY-SA-4.0.txt'),
    ('marine/LICENSE', 'dzangolab/marine-signal-flags', 'LICENSE'),
    ('marine/README.md', 'dzangolab/marine-signal-flags', 'README.md'),
    ('sgf/LICENSE', 'SabakiHQ/sgf', 'LICENSE'),
    ('sgf/README.md', 'SabakiHQ/sgf', 'README.md'),
    ('sgf/package.json', 'SabakiHQ/sgf', 'package.json'),
]:
    add(local, repo, remote)
for letter in 'abcdefghijklmnopqrstuvwxyz0123456789':
    add('marine/flags/' + letter + '.svg', 'dzangolab/marine-signal-flags', 'dist/svg/' + letter + '.svg')
for name in ['main', 'helper', 'parse', 'tokenize', 'peekable', 'stringify', 'iconv-lite', 'jschardet']:
    add('sgf/src/' + name + '.js', 'SabakiHQ/sgf', 'src/' + name + '.js')
JOBS.append(('doken-1.0.0.tgz', 'https://registry.npmjs.org/doken/-/doken-1.0.0.tgz'))

def fetch(job):
    local, url = job
    dest = BASE / 'sources' / local
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not dest.exists():
        with urllib.request.urlopen(url, timeout=60) as response:
            data = response.read()
        if dest.suffix == '.gz':
            data = gzip.compress(data, mtime=0)
        temporary = dest.with_name(dest.name + '.tmp')
        temporary.write_bytes(data)
        temporary.replace(dest)
    data = dest.read_bytes()
    record = {'path': str(dest.relative_to(ROOT)), 'url': url, 'sha256': hashlib.sha256(data).hexdigest()}
    if dest.suffix == '.gz':
        content=gzip.decompress(data)
        record.update({'compression':'gzip','content_sha256':hashlib.sha256(content).hexdigest(),'content_bytes':len(content)})
    if record['path'] in EXPECTED and record['sha256'] != EXPECTED[record['path']]:
        raise RuntimeError('Pinned source mismatch: ' + record['path'])
    return record

if __name__ == '__main__':
    previous = json.loads((BASE / 'imports.json').read_text()) if (BASE / 'imports.json').exists() else {}
    EXPECTED = {r['path']: r['sha256'] for r in previous.get('files', [])}
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        records = list(pool.map(fetch, JOBS))
    # Retired HYG snapshot stays archived with its original hashes, but is no
    # longer fetched or transformed into a partial runtime star catalogue.
    records.extend(record for record in previous.get('files', []) if pathlib.PurePath(record['path']).as_posix().replace('\\', '/').startswith('upstream/discovery/sources/hyg/'))
    package = (BASE / 'sources/doken-1.0.0.tgz').read_bytes()
    if base64.b64encode(hashlib.sha512(package).digest()).decode() != DOKEN_INTEGRITY:
        raise RuntimeError('doken 1.0.0 package integrity mismatch')
    with tarfile.open(fileobj=io.BytesIO(package), mode='r:gz') as archive:
        for member in archive.getmembers():
            if not member.isfile():
                continue
            path = pathlib.PurePosixPath(member.name)
            if path.parts[0] != 'package' or '..' in path.parts:
                raise RuntimeError('Unsafe package path')
            dest = BASE / 'sources/doken' / pathlib.Path(*path.parts[1:])
            dest.parent.mkdir(parents=True, exist_ok=True)
            data = archive.extractfile(member).read()
            dest.write_bytes(data)
            records.append({'path': str(dest.relative_to(ROOT)), 'package': 'doken@1.0.0', 'sha256': hashlib.sha256(data).hexdigest()})
    (BASE / 'imports.json').write_text(json.dumps({
        'pins': PINS, 'packages': {'doken': {'version': '1.0.0', 'integrity': 'sha512-' + DOKEN_INTEGRITY}},
        'files': records,
    }, indent=2) + '\n')
    print('Imported pinned discovery sources:', len(records))
