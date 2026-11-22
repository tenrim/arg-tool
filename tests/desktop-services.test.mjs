import assert from 'node:assert/strict';
import test from 'node:test';
import { ORIGIN } from '../desktop/assets.cjs';
import { createServiceHandler } from '../desktop/services.cjs';

function submit(handler, path, { origin = ORIGIN, value = {} } = {}) {
  const url = new URL(path, ORIGIN);
  return handler(
    new Request(url, {
      method: 'POST',
      headers: {
        Origin: origin,
        'Content-Type': 'application/json',
        Cookie: 'not-for-upstream=1',
        Authorization: 'not-for-upstream',
      },
      body: JSON.stringify(value),
    }),
    url,
  );
}

test('desktop API uses a fixed destination and forwards only the approved request and headers', async () => {
  const calls = [];
  const handle = createServiceHandler(async (url, init) => {
    calls.push({ url, init });
    return Response.json(
      { records: [1] },
      { status: 429, headers: { 'Retry-After': '2', 'Set-Cookie': 'bad=1' } },
    );
  });
  assert.equal((await submit(handle, '/api/query/missing')).status, 404);
  assert.equal((await submit(handle, '/api/query/oeis?host=example.com')).status, 404);
  assert.equal(
    (await submit(handle, '/api/query/oeis', { origin: 'https://example.com' })).status,
    403,
  );
  assert.equal((await submit(handle, '/api/query/oeis', { value: 'x'.repeat(8192) })).status, 413);
  const response = await submit(handle, '/api/query/oeis', { value: { query: 'A000045' } });
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '2');
  assert.equal(response.headers.has('Set-Cookie'), false);
  assert.deepEqual(await response.json(), { records: [1] });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://www.tool.mistarg.cn/api/query/oeis');
  assert.equal(calls[0].init.redirect, 'error');
  assert.equal(calls[0].init.credentials, 'omit');
  assert.equal(calls[0].init.headers.Origin, 'https://www.tool.mistarg.cn');
  assert.deepEqual(JSON.parse(calls[0].init.body.toString()), { query: 'A000045' });
  assert(!Object.hasOwn(calls[0].init.headers, 'Cookie'));
  assert(!Object.hasOwn(calls[0].init.headers, 'Authorization'));
});

test('desktop file-analysis relay streams results, stops on cancellation, and reports a lost connection', async () => {
  let stream;
  let cancelled = false;
  const handle = createServiceHandler(
    async () =>
      new Response(
        new ReadableStream({
          start(controller) {
            stream = controller;
            stream.enqueue(new TextEncoder().encode('{"type":"plan"}\n'));
          },
          cancel() {
            cancelled = true;
          },
        }),
        { headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' } },
      ),
  );
  const response = await submit(handle, '/api/forensics/run');
  const reader = response.body.getReader();
  assert.equal(new TextDecoder().decode((await reader.read()).value), '{"type":"plan"}\n');
  stream.enqueue(new TextEncoder().encode('{"type":"end"}\n'));
  assert.equal(new TextDecoder().decode((await reader.read()).value), '{"type":"end"}\n');
  await reader.cancel();
  assert(cancelled);
  const lost = createServiceHandler(async () => {
    throw Error('network unavailable');
  });
  const failure = await submit(lost, '/api/query/oeis');
  assert.equal(failure.status, 503);
  assert.match((await failure.json()).message, /检查网络/);
});
