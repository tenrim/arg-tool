// cnchar-all 3.2.6 uses explanation/<first character>.json and draw/<character>.json.
// Its explanation transport resolves HTTP failures as an empty value; validate
// the original bundled resources before handing their bytes to the same engine.
export async function loadHanziResource(kind, character, { signal, fetcher = fetch } = {}) {
  if (!['explanation', 'draw'].includes(kind) || Array.from(character).length !== 1)
    throw Error('汉字资料请求无效。');
  signal?.throwIfAborted();
  const label = kind === 'explanation' ? '字词释义' : '笔顺';
  let response;
  try {
    response = await fetcher(
      new URL(
        '../vendor/hanzi-full/data/' + kind + '/' + encodeURIComponent(character) + '.json',
        import.meta.url,
      ),
      { signal },
    );
  } catch {
    signal?.throwIfAborted();
    throw Error(label + '资料载入失败，请检查连接后重试。');
  }
  signal?.throwIfAborted();
  if (!response.ok) throw Error(`${label}资料载入失败（HTTP ${response.status}），请重试。`);
  let data;
  try {
    data = await response.json();
  } catch (error) {
    signal?.throwIfAborted();
    throw Error(
      label +
        (error instanceof SyntaxError
          ? '资料格式不正确，请重试。'
          : '资料载入失败，请检查连接后重试。'),
    );
  }
  signal?.throwIfAborted();
  const valid =
    data &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    (kind === 'explanation'
      ? Object.values(data).every((value) => typeof value === 'string')
      : Array.isArray(data.strokes) &&
        data.strokes.length > 0 &&
        data.strokes.every((stroke) => typeof stroke === 'string' && stroke.length > 0) &&
        Array.isArray(data.medians) &&
        data.medians.length === data.strokes.length &&
        data.medians.every(
          (median) =>
            Array.isArray(median) &&
            median.length > 0 &&
            median.every(
              (point) => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite),
            ),
        ));
  if (!valid) throw Error(label + '资料格式不正确，请重试。');
  return data;
}
