import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const importer = fileURLToPath(new URL('../scripts/import-knowledge-sources.py', import.meta.url));
const currentCommit = 'a'.repeat(40), oldCommit = 'b'.repeat(40);
const path = 'src/core/operations/ToBase58.mjs';
const relative = 'cyberchef/' + path;
const remote = commit => 'https://raw.githubusercontent.com/gchq/CyberChef/' + commit + '/' + path;
const cachedContent = 'cached source\n', freshContent = 'new pinned source\n';
const digest = value => createHash('sha256').update(value).digest('hex');
const matchingManifest = () => ({commit: currentCommit, files: [{path: relative,
  source_url: remote(currentCommit), sha256: digest(cachedContent)}]});

// Load only the production cache predicate and fetch function. The importer's
// top-level collector, thread pool, downloads and corpus rewrites cannot run.
// fetch gets a temporary destination and a stub-only urllib namespace.
const pythonHarness = String.raw`
import ast
import hashlib
import json
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace

payload = json.load(sys.stdin)
tree = ast.parse(Path(sys.argv[1]).read_text(), filename=sys.argv[1])
names = {'source_cache_record', 'fetch'}
definitions = [node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name in names]
assert {node.name for node in definitions} == names
module = ast.Module(body=definitions, type_ignores=[])
with tempfile.TemporaryDirectory(prefix='knowledge-source-cache-') as directory:
    destination = Path(directory)
    target = destination / payload['relative']
    if payload.get('cachedFileExists', True):
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(payload['cachedContent'].encode())
    calls = []
    class Response:
        status = 200
        def __enter__(self):
            return self
        def __exit__(self, *args):
            return False
        def read(self):
            return payload['freshContent'].encode()
    def stub_urlopen(url, timeout):
        calls.append({'url': url, 'timeout': timeout})
        return Response()
    scope = {'DEST': destination, 'COMMIT': payload['currentCommit'],
             'old_manifest': payload['manifest'], 'hashlib': hashlib,
             'urllib': SimpleNamespace(request=SimpleNamespace(urlopen=stub_urlopen))}
    exec(compile(module, sys.argv[1], 'exec'), scope)
    remote = 'https://raw.githubusercontent.com/gchq/CyberChef/' + payload['currentCommit'] + '/' + payload['path']
    eligible = scope['source_cache_record'](payload['manifest'], payload['relative'], remote, payload['currentCommit']) is not None
    result = {'eligible': eligible}
    try:
        result['record'] = scope['fetch'](payload['path'])
    except Exception as error:
        result.update(errorName=type(error).__name__, error=str(error))
    result.update(calls=calls, finalContent=target.read_text() if target.exists() else None)
    print(json.dumps(result))
`;

function exercise(manifest, options = {}) {
  const child = spawnSync('python3', ['-c', pythonHarness, importer], {encoding: 'utf8',
    input: JSON.stringify({manifest, currentCommit, path, relative, cachedContent, freshContent, ...options}),
    timeout: 10_000});
  assert.equal(child.error, undefined, String(child.error));
  assert.equal(child.status, 0, child.stderr);
  return JSON.parse(child.stdout);
}

function assertFresh(result) {
  assert.equal(result.eligible, false);
  assert.equal(result.errorName, undefined);
  assert.deepEqual(result.calls, [{url: remote(currentCommit), timeout: 45}]);
  assert.equal(result.finalContent, freshContent);
  assert.deepEqual(result.record, {path: relative, source_url: remote(currentCommit), sha256: digest(freshContent)});
}

test('knowledge sources: matching commit, URL, digest and bytes reuse the pinned cache without network', () => {
  const result = exercise(matchingManifest());
  assert.equal(result.eligible, true);
  assert.deepEqual(result.calls, []);
  assert.equal(result.finalContent, cachedContent);
  assert.deepEqual(result.record, matchingManifest().files[0]);
});

test('knowledge sources: valid hexadecimal digest case does not change the cached source identity', () => {
  const manifest = matchingManifest();
  manifest.files[0].sha256 = manifest.files[0].sha256.toUpperCase();
  const result = exercise(manifest);
  assert.equal(result.eligible, true);
  assert.equal(result.errorName, undefined);
  assert.deepEqual(result.calls, []);
  assert.equal(result.finalContent, cachedContent);
  assert.equal(result.record.sha256, digest(cachedContent));
});

test('knowledge sources: a new commit cannot relabel same-path old bytes as the new source', () => {
  const manifest = matchingManifest();
  manifest.commit = oldCommit;
  manifest.files[0].source_url = remote(oldCommit);
  assertFresh(exercise(manifest));
});

test('knowledge sources: matching URL and bytes do not override a mismatched manifest commit', () => {
  const manifest = matchingManifest();
  manifest.commit = oldCommit;
  assertFresh(exercise(manifest));
});

test('knowledge sources: matching commit and path do not override a different source URL', () => {
  const manifest = matchingManifest();
  manifest.files[0].source_url = remote(oldCommit);
  assertFresh(exercise(manifest));
});

test('knowledge sources: absent or malformed digest metadata cannot qualify a cached file', () => {
  for (const value of [undefined, '', 'bad', 'g'.repeat(64), 123]) {
    const manifest = matchingManifest();
    if (value === undefined) delete manifest.files[0].sha256;
    else manifest.files[0].sha256 = value;
    assertFresh(exercise(manifest));
  }
});

test('knowledge sources: absent or ambiguous file records cannot qualify same-path local bytes', () => {
  const absent = matchingManifest();
  absent.files = [];
  assertFresh(exercise(absent));
  const duplicate = matchingManifest();
  duplicate.files.push({...duplicate.files[0]});
  assertFresh(exercise(duplicate));
});

test('knowledge sources: matching provenance still rejects tampered bytes without downloading over evidence', () => {
  const tampered = 'tampered source\n';
  const result = exercise(matchingManifest(), {cachedContent: tampered});
  assert.equal(result.eligible, true);
  assert.equal(result.errorName, 'AssertionError');
  assert.match(result.error, /Changed source mirror/);
  assert.deepEqual(result.calls, []);
  assert.equal(result.finalContent, tampered);
  assert.equal(result.record, undefined);
});

test('knowledge sources: a missing file is fetched from the fixed remote even with matching manifest metadata', () => {
  const result = exercise(matchingManifest(), {cachedFileExists: false});
  assert.equal(result.eligible, true);
  assert.equal(result.errorName, undefined);
  assert.deepEqual(result.calls, [{url: remote(currentCommit), timeout: 45}]);
  assert.equal(result.finalContent, freshContent);
  assert.deepEqual(result.record, {path: relative, source_url: remote(currentCommit), sha256: digest(freshContent)});
});
