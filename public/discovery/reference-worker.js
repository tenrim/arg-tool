const resources = new Map();
export async function discoveryQuery(kind, params, base) {
  const read = async (path) => {
    const url = new URL(path, base).href;
    if (resources.has(url)) return resources.get(url);
    let response;
    try {
      response = await fetch(url);
    } catch {
      throw Error('本地资料载入失败，请重试。');
    }
    if (!response.ok) throw Error('本地资料载入失败，请重试。');
    const rows = await response.json();
    if (resources.size >= 8) resources.delete(resources.keys().next().value);
    resources.set(url, rows);
    return rows;
  };
  const core = await import(new URL('discovery/reference-core.js', base));
  if (kind === 'currencies') {
    const [data, countries] = await Promise.all([
      read('vendor/discovery/currencies.json'),
      read('vendor/reference/countries.json'),
    ]);
    return core.queryCurrencies(params, data, countries);
  }
  if (kind === 'marine')
    return params.mode === 'codebook'
      ? core.queryMarineBook(params, await read('vendor/completion/marine/pages.json'))
      : core.queryMarine(params, await read('vendor/discovery/marine-flags.json'));
  if (kind === 'sky') {
    const index = await read('vendor/discovery/sky-index.json'),
      rows = core.filterSky(params, index),
      page = Math.max(0, Math.floor(Number(params.page) || 0));
    const chunks = [...new Set(rows.slice(page * 24, page * 24 + 24).map((r) => r.chunk))];
    if (chunks.some((name) => !/^sky-records\/ngc-\d{3}\.json$/.test(name)))
      throw Error('天体分包地址无效。');
    const details = (
      await Promise.all(chunks.map((name) => read('vendor/discovery/' + name)))
    ).flat();
    return core.skyRows(params, index, details);
  }
  throw Error('未知资料库。');
}
