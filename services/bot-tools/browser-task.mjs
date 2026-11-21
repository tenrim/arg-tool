import { resultFormatter } from './results.mjs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const { chromium } = createRequire(import.meta.url)('playwright');

// Only the parent supplies this message. No HTTP field becomes executable code.
process.once('message', async ({ job, config, limits, fingerprint }) => {
  let browser, browserServer;
  let response;
  try {
    browserServer = await chromium.launchServer({
      host: '127.0.0.1',
      headless: true,
      chromiumSandbox: true,
      executablePath: config.chromiumPath || undefined,
    });
    process.send?.({ event: 'browser-started', pid: browserServer.process().pid });
    browser = await chromium.connect(browserServer.wsEndpoint());
    const context = await browser.newContext({ serviceWorkers: 'block', acceptDownloads: false });
    const base = new URL(config.resourceBase);
    const host = new URL('__bot_tools_host__.html', base).href;
    await context.routeWebSocket('**/*', (socket) => socket.close());
    await context.route('**/*', async (route) => {
      const request = route.request(),
        url = new URL(request.url());
      if (url.href === host && request.method() === 'GET')
        return route.fulfill({
          contentType: 'text/html',
          body: '<!doctype html><title>计算任务</title>',
          headers: {
            'Content-Security-Policy':
              "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; connect-src 'self'",
          },
        });
      if (
        request.method() !== 'GET' ||
        url.origin !== base.origin ||
        !url.pathname.startsWith(base.pathname) ||
        url.search ||
        url.username ||
        url.password ||
        !/\.(?:js|mjs|json|wasm|data|bin|xml)$/.test(url.pathname)
      )
        return route.abort('blockedbyclient');
      // No redirects can escape the allowlist. Fetch ourselves with zero redirects,
      // then fulfill: route.continue alone would follow unchecked redirects.
      try {
        const result = await route.fetch({ maxRedirects: 0, timeout: 15000 });
        if (result.status() >= 300 && result.status() < 400) return route.abort('blockedbyclient');
        return route.fulfill({ response: result });
      } catch {
        return route.abort('failed');
      }
    });
    const page = await context.newPage();
    await page.goto(host);
    const remoteCatalogue = await page.evaluate(async (base) => {
      const r = await fetch(new URL('vendor/cyberchef/catalogue.json', base));
      if (!r.ok) throw Error('catalogue unavailable');
      return await r.text();
    }, base.href);
    if (createHash('sha256').update(remoteCatalogue).digest('hex') !== fingerprint)
      throw Error('catalogue version mismatch');
    const formatter = await page.evaluateHandle(resultFormatter);
    response = await page.evaluate(
      async ({ base, job, limits, formatter }) => {
        let client,
          loaded = false;
        const fail = (code, message) => ({
          ok: false,
          engine: job.engine,
          error: { code, message },
        });
        try {
          if (job.engine === 'cyberchef') {
            const { CyberChefClient } = await import(new URL('cyberchef-client.js', base).href);
            client = new CyberChefClient();
            await client.ready;
            loaded = true;
            const output = await client.bake(job.input, job.recipe, { structured: true });
            const formatted = formatter(output, limits, job.recipe.at(-1).op);
            if (formatted.error) return fail(formatted.error.code, formatted.error.message);
            return { ok: true, engine: job.engine, result: formatted.result };
          }
          const { qalculateClient } = await import(new URL('qalculate/client.js', base).href);
          client = qalculateClient((stage) => {
            if (stage === '正在计算…') loaded = true;
          });
          const output = await client.run('calculate', { expressions: [job.expression] });
          const value = output.values[0];
          // libqalculate Calculator.h: INFORMATION=0, WARNING=1, ERROR=2.
          if (value.messages.some((m) => m.type >= 1))
            return fail(
              value.messages.some((m) => m.type === 2) ? 'INVALID_INPUT' : 'CALCULATION_WARNING',
              value.messages
                .filter((m) => m.type >= 1)
                .map((m) => m.text)
                .join('\n')
                .slice(0, 1024),
            );
          if (value.plot || output.generatedFiles?.length)
            return fail('UNSUPPORTED_RESULT', '首版不支持绘图或文件结果，请使用工具网页。');
          const text = value.output,
            warnings = value.messages.map((m) => m.text);
          if (
            new TextEncoder().encode(JSON.stringify({ text, warnings })).length > limits.outputBytes
          )
            return fail('OUTPUT_TOO_LARGE', '计算结果超过 64 KiB，请缩小表达式。');
          return { ok: true, engine: job.engine, result: { type: 'text', text, warnings } };
        } catch (error) {
          const unavailable =
            !loaded || /组件 .*载入失败|运算线程出错|内核加载或执行失败/.test(error.message);
          return fail(
            unavailable ? 'ENGINE_UNAVAILABLE' : 'INVALID_INPUT',
            unavailable ? '引擎资源无法加载，请稍后重试。' : String(error.message).slice(0, 1024),
          );
        } finally {
          client?.close?.();
          client?.cancel?.();
        }
      },
      { base: base.href, job, limits, formatter },
    );
  } catch {
    response = {
      ok: false,
      engine: job.engine,
      error: { code: 'ENGINE_UNAVAILABLE', message: '浏览器或固定引擎资源不可用。' },
    };
  } finally {
    await browser?.close().catch(() => {});
    await browserServer?.close().catch(() => {});
  }
  process.send?.(response, () => process.disconnect());
});
