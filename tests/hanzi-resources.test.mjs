import test from 'node:test';
import assert from 'node:assert/strict';
import { loadHanziResource } from '../public/round1/hanzi-resources.js';

test('汉字资源用真实目录和码点构造地址，不把HTTP失败当成未收录', async () => {
  const calls = [];
  const data = { 永远: '长远；永久。' };
  const fetcher = async (url, options) => {
    calls.push({ url: String(url), options });
    return Response.json(data);
  };
  const controller = new AbortController();
  assert.deepEqual(
    await loadHanziResource('explanation', '永', { fetcher, signal: controller.signal }),
    data,
  );
  assert.match(calls[0].url, /\/data\/explanation\/%E6%B0%B8\.json$/);
  assert.equal(calls[0].options.signal, controller.signal);
  for (const status of [404, 503])
    await assert.rejects(
      loadHanziResource('explanation', '永', {
        fetcher: async () => new Response('', { status }),
      }),
      new RegExp('资料载入失败.*' + status),
    );
  await assert.rejects(
    loadHanziResource('explanation', '永', {
      fetcher: async () => {
        throw new TypeError('Failed to fetch');
      },
    }),
    /字词释义资料载入失败，请检查连接后重试/,
  );
});

test('只有有效原字库对象可用于未收录判断，笔顺必须保留有效原始数据', async () => {
  assert.deepEqual(
    await loadHanziResource('explanation', '永', { fetcher: async () => Response.json({}) }),
    {},
  );
  const drawing = {
    strokes: ['M 1 2 L 3 4'],
    medians: [
      [
        [1, 2],
        [3, 4],
      ],
    ],
    radStrokes: [],
  };
  assert.deepEqual(
    await loadHanziResource('draw', '永', { fetcher: async () => Response.json(drawing) }),
    drawing,
  );
  for (const data of [
    null,
    [],
    { strokes: [], medians: [] },
    { strokes: ['M 0 0'], medians: [[]] },
  ])
    await assert.rejects(
      loadHanziResource('draw', '永', { fetcher: async () => Response.json(data) }),
      /资料格式不正确/,
    );
  await assert.rejects(
    loadHanziResource('explanation', '永', {
      fetcher: async () =>
        new Response('broken', { headers: { 'content-type': 'application/json' } }),
    }),
    /资料格式不正确/,
  );
  await assert.rejects(
    loadHanziResource('explanation', '永', {
      fetcher: async () => ({
        ok: true,
        json: async () => {
          throw new TypeError('Failed to fetch');
        },
      }),
    }),
    /资料载入失败，请检查连接后重试/,
  );
});

test('取消后即使旧资源晚到也不得采纳，失败不缓存以允许下一次真实重试', async () => {
  const controller = new AbortController();
  let release;
  const pending = loadHanziResource('explanation', '永', {
    signal: controller.signal,
    fetcher: () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  });
  controller.abort();
  release(Response.json({ 永: '永久。' }));
  await assert.rejects(pending, { name: 'AbortError' });
  let calls = 0;
  const fetcher = async () =>
    ++calls === 1 ? new Response('', { status: 503 }) : Response.json({ 永: '永久。' });
  await assert.rejects(loadHanziResource('explanation', '永', { fetcher }), /503/);
  assert.deepEqual(await loadHanziResource('explanation', '永', { fetcher }), { 永: '永久。' });
  assert.equal(calls, 2);
});
