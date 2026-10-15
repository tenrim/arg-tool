"""Maintenance-only import of cited, pinned CyberChef implementation sources.

Normal builds are offline. These files are documentation copies, never loaded
as execution modules. Preserve source bytes, license and upstream identities.
"""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import subprocess
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / 'public/vendor/knowledge'
PIN = json.loads((ROOT / 'public/vendor/cyberchef/UPSTREAM.json').read_text())
COMMIT = PIN['commit']

collector = """
import {readdir} from 'node:fs/promises';
const records={};
for(const file of (await readdir('./public/knowledge/articles')).filter(name=>name.endsWith('.js')).sort()){
 records[file]=(await import('./public/knowledge/articles/'+file)).articles;
}
process.stdout.write(JSON.stringify(records));
"""
records = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', collector], cwd=ROOT))
requests = {}
for articles in records.values():
    for article in articles:
        for source in article['sources']:
            original = source.get('upstreamUrl', source['url'])
            url = urllib.parse.urlparse(original)
            prefix = '/gchq/CyberChef/'
            if url.hostname == 'raw.githubusercontent.com' and url.path.startswith(prefix):
                version, path = url.path[len(prefix):].split('/', 1)
            elif url.hostname == 'github.com' and url.path.startswith(prefix + 'blob/'):
                version, path = url.path[len(prefix + 'blob/'):].split('/', 1)
            else:
                continue
            if not path.startswith('src/'):
                continue
            assert version in [COMMIT, 'v' + PIN['version']], 'Unpinned cited source: ' + original
            assert all(part not in ['', '..', '.'] for part in path.split('/'))
            requests.setdefault(path, []).append((source, original))

def source_cache_record(manifest, relative, remote, commit):
    """Return a reusable record only for the exact pinned source identity.

    A matching old digest proves local integrity, not provenance for a new
    commit or URL. Keep this decision pure so maintenance tests never import
    this script's network and article-rewrite entrypoint.
    """
    if manifest.get('commit') != commit:
        return None
    matches = [entry for entry in manifest.get('files', []) if entry.get('path') == relative]
    if len(matches) != 1:
        return None
    record = matches[0]
    digest = record.get('sha256')
    if record.get('source_url') != remote or not isinstance(digest, str):
        return None
    if len(digest) != 64 or any(char not in '0123456789abcdefABCDEF' for char in digest):
        return None
    return record


old_manifest = json.loads((DEST / 'UPSTREAM.json').read_text()) if (DEST / 'UPSTREAM.json').exists() else {'files': []}

def fetch(path):
    target = DEST / 'cyberchef' / path
    relative = target.relative_to(DEST).as_posix()
    remote = 'https://raw.githubusercontent.com/gchq/CyberChef/' + COMMIT + '/' + path
    cached = source_cache_record(old_manifest, relative, remote, COMMIT)
    if target.exists() and cached is not None:
        data = target.read_bytes()
        assert hashlib.sha256(data).hexdigest() == cached['sha256'].lower(), 'Changed source mirror: ' + relative
    else:
        with urllib.request.urlopen(remote, timeout=45) as response:
            assert response.status == 200
            data = response.read()
        assert data and not data.lstrip().startswith(b'<!DOCTYPE'), 'Non-source response: ' + remote
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    return {'path': relative, 'source_url': remote, 'sha256': hashlib.sha256(data).hexdigest()}

DEST.mkdir(parents=True, exist_ok=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    files = list(pool.map(fetch, sorted(requests)))
license_data = (ROOT / 'public/vendor/cyberchef/LICENSE.txt').read_bytes()
(DEST / 'LICENSE.txt').write_bytes(license_data)
notice = ('CyberChef source documentation copies\nCopyright GCHQ and original contributors.\n'
          'Project: https://github.com/gchq/CyberChef\nVersion: ' + PIN['version'] + '\nCommit: ' + COMMIT + '\n'
          'License: Apache License 2.0; complete text in LICENSE.txt.\n'
          'The cited source files are unmodified. Original source headers remain intact.\n'
          'These are read-only references; the official execution runtime is unchanged.\n')
(DEST / 'NOTICE.txt').write_text(notice)
for name in ['LICENSE.txt', 'NOTICE.txt']:
    files.append({'path': name, 'sha256': hashlib.sha256((DEST / name).read_bytes()).hexdigest()})
# The already-pinned language interpreter's original README is an authoritative
# description of that implementation, not an invented universal language spec.
language_pin = json.loads((ROOT / 'upstream/coderunner/SOURCE.json').read_text())
language_hashes = {entry['path']: entry['sha256'] for entry in language_pin['files']}
language_docs = set()
for articles in records.values():
    for article in articles:
        for source in article['sources']:
            original = source.get('upstreamUrl', source['url'])
            url = urllib.parse.urlparse(original)
            prefix = '/nilaymaj/esolang-park/'
            if url.hostname == 'raw.githubusercontent.com' and url.path.startswith(prefix):
                version, path = url.path[len(prefix):].split('/', 1)
            elif url.hostname == 'github.com' and url.path.startswith(prefix + 'blob/'):
                version, path = url.path[len(prefix + 'blob/'):].split('/', 1)
            else:
                continue
            assert version == language_pin['commit'], 'Unpinned interpreter document: ' + original
            assert path in language_hashes and path.endswith('README.md')
            relative = 'esolang-park/' + path
            data = (ROOT / 'upstream/coderunner/esolang-park' / path).read_bytes()
            assert hashlib.sha256(data).hexdigest() == language_hashes[path]
            target = DEST / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
            if relative not in language_docs:
                files.append({'path': relative, 'source_url': original, 'sha256': language_hashes[path], 'project': 'Esolang Park', 'license': 'MIT'})
                language_docs.add(relative)
            source.update(url='/vendor/knowledge/' + relative, upstreamUrl=original,
                          license='MIT', licenseUrl='/vendor/knowledge/esolang-park/LICENSE.txt', mirroredCommit=version)
if language_docs:
    license_data = (ROOT / 'public/vendor/coderunner/esolang-park.LICENSE.txt').read_bytes()
    assert hashlib.sha256(license_data).hexdigest() == language_hashes['LICENSE']
    (DEST / 'esolang-park/LICENSE.txt').write_bytes(license_data)
    files.append({'path': 'esolang-park/LICENSE.txt', 'sha256': language_hashes['LICENSE'], 'project': 'Esolang Park', 'license': 'MIT'})
manifest = {'project': 'CyberChef', 'version': PIN['version'], 'commit': COMMIT,
            'license': 'Apache-2.0 (CyberChef); MIT (explicit Esolang Park documents)',
            'role': 'unaltered, read-only cited implementation documents', 'files': files}
(DEST / 'UPSTREAM.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')

for path, uses in requests.items():
    for source, original in uses:
        source.update(url='/vendor/knowledge/cyberchef/' + path, upstreamUrl=original,
                      license='Apache-2.0', licenseUrl='/vendor/knowledge/LICENSE.txt', mirroredCommit=COMMIT)
for name, articles in records.items():
    # No registry or category data is generated here; only actual source links.
    (ROOT / 'public/knowledge/articles' / name).write_text(
        '// Function-specific lessons with primary references and unaltered pinned source mirrors.\n'
        'export const articles = ' + json.dumps(articles, ensure_ascii=False, indent=2) + ';\n')
print(json.dumps({'mirrored_sources': len(requests), 'article_files': len(records), 'commit': COMMIT}))
