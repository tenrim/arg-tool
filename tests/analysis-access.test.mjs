import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  createAnalysisAccess,
  ANALYSIS_UNLOCK_KEY,
  ANALYSIS_CLUE,
} from '../public/capabilities/analysis-access.js';
import { createRegistry, searchEntries } from '../public/capabilities/registry.js';
import { createPreferenceTargets } from '../public/capabilities/preference-targets.js';

test('layered puzzle decodes to the answer, accepts completed answer only and stores no input', () => {
  const data = new Map();
  const storage = () => ({
    getItem: (key) => data.get(key),
    setItem: (key, value) => data.set(key, value),
  });
  const access = createAnalysisAccess(storage);
  let updates = 0;
  access.subscribe(() => updates++);
  for (const value of ['', '拨开', '拨开迷雾!', '5ouo5byA6L+36Zu+', '拨开 迷雾'])
    assert.equal(access.submit(value), null);
  const rotated = Buffer.from(ANALYSIS_CLUE, 'hex').toString('utf8');
  const base64 = rotated.replace(/[A-Za-z]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) + (char.toLowerCase() <= 'm' ? 13 : -13)),
  );
  const answer = Buffer.from(base64, 'base64').toString('utf8');
  for (const intermediate of [ANALYSIS_CLUE, rotated, base64])
    assert.equal(access.submit(intermediate), null);
  assert.equal(answer, '拨开迷雾');
  assert.deepEqual(access.submit(' ' + answer + '\n'), { persisted: true });
  assert.deepEqual([...data], [[ANALYSIS_UNLOCK_KEY, 'solved-v1']]);
  assert.equal(updates, 1);
  assert.equal(access.submit(answer), null);
  assert(createAnalysisAccess(storage).unlocked());
});

test('storage denial permits a session unlock without reporting persistence', () => {
  const access = createAnalysisAccess(() => {
    throw Error('denied');
  });
  assert.equal(access.unlocked(), false);
  assert.deepEqual(access.submit('拨开迷雾'), { persisted: false });
  assert(access.unlocked());
});

test('locked discovery hides only analysis and its lesson while preserving source inventory', async () => {
  const catalogue = JSON.parse(
    await readFile(new URL('../public/vendor/cyberchef/catalogue.json', import.meta.url), 'utf8'),
  );
  const full = createRegistry(catalogue),
    locked = createRegistry(catalogue, { includeLocked: false });
  const ids = ['native:cipher-detect', ...full.byId.get('native:cipher-detect').learningIds];
  for (const id of ids) {
    assert.equal(locked.byId.get(id).listed, false);
    assert(!locked.groups.some((group) => group.entryIds.includes(id)));
    for (const query of ['', '文本线索分析', '未知编码'])
      assert(
        !searchEntries(locked, query, '', { includeKnowledge: true }).some(
          (entry) => entry.id === id,
        ),
      );
  }
  assert.equal(full.entries.length, locked.entries.length);
  assert.equal(full.coverage.operationCount, locked.coverage.operationCount);
  assert.equal(full.coverage.visibleEntryCount - locked.coverage.visibleEntryCount, ids.length);
  for (const entry of full.entries)
    if (!ids.includes(entry.id)) assert.equal(locked.byId.get(entry.id).listed, entry.listed);
  assert.equal(createPreferenceTargets(locked).resolve('analysis'), null);
  assert(createPreferenceTargets(full).resolve('analysis'));
});
