self.onmessage = async ({data: {text, resourceBase}}) => {
  try {
    const base = new URL(resourceBase);
    if (!['http:', 'https:'].includes(base.protocol) || base.origin !== self.location.origin) throw Error('围棋组件资源地址无效。');
    let parser, core;
    try {[parser, core] = await Promise.all([import(new URL('vendor/discovery/sgf.js', base)), import(new URL('discovery/go-core.js', base))]);}
    catch {throw Error('围棋解析组件载入失败，请重试。');}
    self.postMessage({games: core.compileGo(text, parser)});
  } catch (error) {self.postMessage({error: error.message || '棋谱解析失败。'});}
};
