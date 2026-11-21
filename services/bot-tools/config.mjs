export function readConfig(env = process.env) {
  const integer = (name, fallback, min, max) => {
    const value = Number(env[name] ?? fallback);
    if (!Number.isInteger(value) || value < min || value > max)
      throw Error(`配置 ${name} 超出允许范围。`);
    return value;
  };
  if (
    !/^[\x21-\x7e]{32,256}$/.test(env.BOT_TOOLS_TOKEN || '') ||
    env.BOT_TOOLS_TOKEN.startsWith('REPLACE_')
  )
    throw Error('请在私密配置中设置独立的 BOT_TOOLS_TOKEN（32 至 256 个非空白 ASCII 字符）。');
  const resourceBase = env.BOT_TOOLS_RESOURCE_BASE || '';
  if (resourceBase) {
    const url = new URL(resourceBase);
    if (
      (url.protocol !== 'https:' &&
        !(
          url.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
        )) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !url.pathname.endsWith('/')
    )
      throw Error('资源地址须为 HTTPS 或回环 HTTP 目录地址，不含凭据、查询参数，且以 / 结尾。');
  }
  const siteUrl = new URL(env.BOT_TOOLS_SITE_URL || 'http://localhost:3000/');
  if (
    !['https:', 'http:'].includes(siteUrl.protocol) ||
    siteUrl.username ||
    siteUrl.password ||
    siteUrl.hash ||
    siteUrl.search
  )
    throw Error('网页链接基址无效。');
  const host = env.BOT_TOOLS_HOST || '127.0.0.1';
  if (!['127.0.0.1', '::1'].includes(host))
    throw Error('服务只允许回环监听；远程使用请配置 HTTPS 反向代理。');
  return {
    token: env.BOT_TOOLS_TOKEN,
    host,
    resourceBase,
    siteUrl: siteUrl.href,
    port: integer('BOT_TOOLS_PORT', 3216, 0, 65535),
    concurrency: integer('BOT_TOOLS_CONCURRENCY', 2, 1, 4),
    timeoutMs: integer('BOT_TOOLS_TIMEOUT_MS', 30000, 100, 60000),
    chromiumPath: env.BOT_TOOLS_CHROMIUM_PATH || '',
  };
}
