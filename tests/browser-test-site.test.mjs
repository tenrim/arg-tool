import test from 'node:test';
import assert from 'node:assert/strict';
import { startBrowserTestSite } from '../scripts/browser-test-site.mjs';

test('browser sites use distinct ephemeral ports and close their own resources', async () => {
  const first = await startBrowserTestSite(),
    second = await startBrowserTestSite();
  try {
    assert.notEqual(first.base, second.base);
    assert.equal((await fetch(first.base)).status, 200);
    assert.equal((await fetch(second.base)).status, 200);
    await first.close();
    await assert.rejects(fetch(first.base));
    assert.equal((await fetch(second.base)).status, 200);
  } finally {
    await first.close();
    await second.close();
  }
});
