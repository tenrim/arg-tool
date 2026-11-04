import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const config = JSON.parse(
  await readFile(new URL('../tools/reference-code.json', import.meta.url), 'utf8'),
);
const endpoint = new URL(config.endpoint);
assert.equal(endpoint.protocol, 'http:');
assert.equal(endpoint.hostname, '127.0.0.1');
assert(!endpoint.username && !endpoint.password);
assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(config.projectPrefix));
assert(
  /^[\w-]+$/.test(config.projectStateId || 'project'),
  'Project index state must remain a local child name',
);
const ids = new Set(),
  prefixes = new Set([config.projectPrefix]);
for (const item of config.references) {
  assert(item.id && !ids.has(item.id));
  ids.add(item.id);
  assert(item.prefix && !prefixes.has(item.prefix));
  prefixes.add(item.prefix);
  assert(/^[\w-]+$/.test(item.folder), 'Reference folder must be a local child name');
  assert(/^[a-f0-9]{40}$/.test(item.commit), 'Reference commit must be pinned');
  const url = new URL(item.url);
  assert.equal(url.protocol, 'https:');
  assert(!url.username && !url.password);
  assert(item.license && item.use);
}
console.log(
  'PASS: loopback reference endpoint and ' +
    ids.size +
    ' pinned reference declarations; no reference checkout or service needed.',
);
