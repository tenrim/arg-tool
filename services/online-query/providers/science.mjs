// Read-only official science services. The service owner supplies bounded,
// cancellable requests and validates hosts; no adapter accepts a user-supplied URL.
const PAGE = 25,
  WINDOW = 250;
const plain = (value) => value && typeof value === 'object' && !Array.isArray(value);
const error = (status, code, message) => Object.assign(new Error(message), { status, code });
const invalid = (message) => error(400, 'INVALID_QUERY', message);
const malformed = (title) =>
  error(
    502,
    'INVALID_UPSTREAM_RESPONSE',
    `${title} 返回的数据格式不正确，请稍后重试或到原站查询。`,
  );
function keys(input, allowed) {
  if (!plain(input) || Object.keys(input).some((key) => !allowed.includes(key)))
    throw invalid('查询字段不正确。');
}
function text(value, max, label, { optional = false } = {}) {
  if (value === undefined && optional) return '';
  if (
    typeof value !== 'string' ||
    value.length > max ||
    /\p{Cc}/u.test(value) ||
    (!optional && !value.trim())
  )
    throw invalid(`${label}格式不正确。`);
  return value.trim();
}
function integer(value, min, max, label, defaultValue) {
  const number = value === undefined ? defaultValue : value;
  if (!Number.isSafeInteger(number) || number < min || number > max)
    throw invalid(`${label}超出允许范围。`);
  return number;
}
function offset(value) {
  const result = integer(value, 0, WINDOW - PAGE, '分页起点', 0);
  if (result % PAGE) throw invalid('分页起点须为 25 的倍数。');
  return result;
}
function checkResponse(response, title) {
  if (!response || !response.ok)
    throw error(
      response?.status === 429 ? 503 : 502,
      response?.status === 429 ? 'UPSTREAM_RATE_LIMITED' : 'UPSTREAM_UNAVAILABLE',
      `${title} 当前无法完成查询，请稍后重试或前往原站。`,
    );
}
async function json(ctx, url, title, options) {
  const { response, text } = await ctx.request(url, options);
  checkResponse(response, title);
  let result;
  try {
    result = JSON.parse(text);
  } catch {
    throw malformed(title);
  }
  if (!result || typeof result !== 'object') throw malformed(title);
  return result;
}
function result(id, parameters, ctx, sourceURL, records, attribution, extra = {}) {
  ctx.signal?.throwIfAborted();
  return {
    provider: id,
    query: parameters.query || parameters.id || String(parameters.cid || ''),
    parameters,
    records,
    total: null,
    next: null,
    attribution,
    fetchedAt: new Date(ctx.now()).toISOString(),
    sourceURL,
    ...extra,
  };
}
const codAttribution = {
  name: 'Crystallography Open Database (COD)',
  credit: 'COD contributors and the original structure authors/publications',
  license: 'CC0 1.0 (database/data); retain original scientific references',
  licenseURL: 'https://creativecommons.org/publicdomain/zero/1.0/',
  termsURL: 'https://www.crystallography.net/cod/new.html',
};
const pubchemAttribution = {
  name: 'PubChem',
  credit: 'PubChem, NCBI/NLM/NIH and the individual data providers identified in each record',
  license: 'PubChem 公共服务；第三方资料按各提供方条款，非统一 CC0',
  termsURL: 'https://pubchem.ncbi.nlm.nih.gov/docs/copyright-and-data-usage-policy',
};

const ELEMENTS = new Set(
  'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(
    ' ',
  ),
);
function codID(value) {
  if (typeof value !== 'string' || !/^\d{7}$/.test(value)) throw invalid('COD 编号须为七位数字。');
  return value;
}
function elementList(value, max) {
  if (value === undefined) return [];
  if (
    !Array.isArray(value) ||
    value.length > max ||
    value.some((e) => !ELEMENTS.has(e)) ||
    new Set(value).size !== value.length
  )
    throw invalid('化学元素条件不正确。');
  return [...value];
}
function validateCOD(input) {
  const mode = input?.mode || 'search';
  if (['detail', 'cif'].includes(mode)) {
    keys(input, ['mode', 'id']);
    return { mode, id: codID(input.id) };
  }
  if (mode !== 'search') throw invalid('COD 查询模式不正确。');
  keys(input, [
    'mode',
    'query',
    'formula',
    'elements',
    'excludeElements',
    'spacegroup',
    'year',
    'doi',
    'start',
  ]);
  const p = {
    mode,
    query: text(input.query, 200, '晶体关键词', { optional: true }),
    formula: text(input.formula, 120, 'Hill 分子式', { optional: true }),
    elements: elementList(input.elements, 8),
    excludeElements: elementList(input.excludeElements, 4),
    spacegroup: text(input.spacegroup, 60, '空间群', { optional: true }),
    year: input.year == null ? null : integer(input.year, 1000, 2100, '论文年份'),
    doi: text(input.doi, 200, 'DOI', { optional: true }),
    start: offset(input.start),
  };
  if (!p.query && !p.formula && !p.elements.length && !p.spacegroup && !p.year && !p.doi)
    throw invalid('请填写晶体检索条件，不能读取整个数据库。');
  if (p.elements.some((e) => p.excludeElements.includes(e)))
    throw invalid('同一元素不能同时要求包含和排除。');
  return p;
}
function codURL(p, format) {
  const url = new URL('https://www.crystallography.net/cod/result');
  url.searchParams.set('format', format);
  if (p.mode === 'detail') {
    url.searchParams.set('id', p.id);
    // An exact ID must also resolve entries excluded from ordinary searches.
    // COD 1000000 is a documented duplicate of 2011331, not a missing entry.
    for (const flag of ['include_duplicates', 'include_errors', 'include_theoretical'])
      url.searchParams.set(flag, '1');
  } else {
    for (const [key, value] of Object.entries({
      text: p.query,
      formula: p.formula,
      spacegroup: p.spacegroup,
      year: p.year,
      doi: p.doi,
    }))
      if (value) url.searchParams.set(key, String(value));
    p.elements.forEach((e, i) => url.searchParams.set(`el${i + 1}`, e));
    p.excludeElements.forEach((e, i) => url.searchParams.set(`nel${i + 1}`, e));
  }
  return url.href;
}
function codActions(id) {
  return [
    { label: '完整晶体记录', parameters: { mode: 'detail', id } },
    { label: '读取原始 CIF', parameters: { mode: 'cif', id } },
  ];
}
async function executeCOD(p, ctx) {
  if (p.mode === 'cif') {
    const sourceURL = `https://www.crystallography.net/cod/${p.id}.cif`,
      response = await ctx.request(sourceURL);
    checkResponse(response.response, 'COD');
    if (!/^data_\S+/m.test(response.text) || /^\s*</.test(response.text)) throw malformed('COD');
    return result(
      'cod',
      p,
      ctx,
      sourceURL,
      [
        {
          id: p.id,
          title: `COD ${p.id} · 原始 CIF`,
          fields: { id: p.id, format: 'CIF', cif: response.text },
          sourceURL,
        },
      ],
      codAttribution,
      { total: 1, query: p.id },
    );
  }
  let total = null;
  if (p.mode === 'search') {
    const countURL = codURL(p, 'count'),
      count = await ctx.request(countURL);
    checkResponse(count.response, 'COD');
    if (!/^\s*\d+\s*$/.test(count.text)) throw malformed('COD');
    total = Number(count.text.trim());
    if (!Number.isSafeInteger(total)) throw malformed('COD');
    if (total > WINDOW)
      throw error(
        422,
        'QUERY_TOO_BROAD',
        `COD 匹配到 ${total} 条记录，请增加条件缩小到 ${WINDOW} 条以内后查询。`,
      );
    if (!total) return result('cod', p, ctx, countURL, [], codAttribution, { total: 0 });
  }
  const sourceURL = codURL(p, 'json'),
    raw = await json(ctx, sourceURL, 'COD');
  if (
    !Array.isArray(raw) ||
    raw.length > WINDOW ||
    raw.some((row) => !plain(row) || !/^\d{7}$/.test(String(row.file ?? row.id ?? '')))
  )
    throw malformed('COD');
  if (p.mode === 'detail' && raw.some((row) => String(row.file ?? row.id) !== p.id))
    throw malformed('COD');
  const start = p.start || 0,
    records = raw.slice(start, start + PAGE).map((fields) => {
      const id = String(fields.file ?? fields.id);
      return {
        id,
        title: String(
          fields.commonname || fields.chemname || fields.mineral || fields.formula || `COD ${id}`,
        ),
        summary: String(fields.formula || ''),
        fields,
        sourceURL: `https://www.crystallography.net/cod/${id}.html`,
        actions: codActions(id),
      };
    });
  return result('cod', p, ctx, sourceURL, records, codAttribution, {
    total: total === null ? raw.length : total,
    next: p.mode === 'search' && raw.length > start + PAGE ? { ...p, start: start + PAGE } : null,
    rawResponse: raw,
  });
}

function cid(value) {
  return integer(value, 1, Number.MAX_SAFE_INTEGER, 'PubChem CID');
}
function validatePubChem(input) {
  const mode = input?.mode || 'search';
  if (mode === 'search') {
    keys(input, ['mode', 'kind', 'query', 'start']);
    const kind = input.kind ?? 'name';
    if (!['name', 'cid', 'formula', 'smiles', 'inchi'].includes(kind))
      throw invalid('PubChem 标识类型不正确。');
    const query = text(
      input.query,
      kind === 'name' ? 300 : kind === 'formula' ? 200 : 2000,
      '物质查询',
    );
    if (
      kind === 'cid' &&
      (!/^\d+$/.test(query) || !Number.isSafeInteger(Number(query)) || Number(query) < 1)
    )
      throw invalid('CID 必须为正整数。');
    if (kind === 'formula' && !/^[A-Za-z0-9()[\]+.\-]+$/.test(query))
      throw invalid('分子式格式不正确。');
    return { mode, kind, query, start: offset(input.start) };
  }
  if (!['detail', 'synonyms', 'structure'].includes(mode))
    throw invalid('PubChem 查询模式不正确。');
  keys(input, mode === 'structure' ? ['mode', 'cid', 'dimension'] : ['mode', 'cid']);
  const p = { mode, cid: cid(input.cid) };
  if (mode === 'structure') {
    p.dimension = input.dimension ?? '2d';
    if (!['2d', '3d'].includes(p.dimension)) throw invalid('请选择 2D 或 3D 结构。');
  }
  return p;
}
function pubchemActions(id) {
  return [
    { label: '完整注释与资料来源', parameters: { mode: 'detail', cid: id } },
    { label: '全部同义词', parameters: { mode: 'synonyms', cid: id } },
    { label: '2D 原子/键/坐标', parameters: { mode: 'structure', cid: id, dimension: '2d' } },
    { label: '3D 原子/键/坐标', parameters: { mode: 'structure', cid: id, dimension: '3d' } },
  ];
}
function compoundRecord(raw) {
  return plain(raw) && Number.isSafeInteger(raw.id?.id?.cid) && raw.id.id.cid > 0;
}
function compoundTitle(compound) {
  return (
    compound.props?.find((p) => p.urn?.label === 'IUPAC Name' && p.urn?.name === 'Preferred')?.value
      ?.sval || `PubChem CID ${compound.id.id.cid}`
  );
}
async function pubchemJSON(ctx, url, options) {
  const { response, text } = await ctx.request(url, options);
  if (response?.status === 404) {
    let raw;
    try {
      raw = JSON.parse(text);
    } catch {
      throw malformed('PubChem');
    }
    if (plain(raw?.Fault) && raw.Fault.Code === 'PUGREST.NotFound') return { empty: true, raw };
  }
  checkResponse(response, 'PubChem');
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw malformed('PubChem');
  }
  if (!plain(raw)) throw malformed('PubChem');
  if (raw.Fault) throw malformed('PubChem');
  return { raw };
}
async function executePubChem(p, ctx) {
  const base = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug',
    official = (id) => `https://pubchem.ncbi.nlm.nih.gov/compound/${id}`;
  if (p.mode !== 'search') {
    const sourceURL =
      p.mode === 'detail'
        ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${p.cid}/JSON`
        : p.mode === 'synonyms'
          ? `${base}/compound/cid/${p.cid}/synonyms/JSON`
          : `${base}/compound/cid/${p.cid}/record/JSON?record_type=${p.dimension}`;
    const value = await pubchemJSON(ctx, sourceURL);
    if (value.empty)
      return result('pubchem', p, ctx, sourceURL, [], pubchemAttribution, {
        total: 0,
        rawResponse: value.raw,
      });
    const raw = value.raw;
    if (
      (p.mode === 'detail' && (!plain(raw.Record) || raw.Record.RecordNumber !== p.cid)) ||
      (p.mode === 'synonyms' &&
        (!Array.isArray(raw.InformationList?.Information) ||
          raw.InformationList.Information.some((r) => r.CID !== p.cid))) ||
      (p.mode === 'structure' &&
        (!Array.isArray(raw.PC_Compounds) ||
          raw.PC_Compounds.some((r) => !compoundRecord(r) || r.id.id.cid !== p.cid)))
    )
      throw malformed('PubChem');
    const title =
      p.mode === 'detail'
        ? raw.Record.RecordTitle
        : `PubChem CID ${p.cid} · ${p.mode === 'synonyms' ? '同义词' : p.dimension + ' 结构'}`;
    return result(
      'pubchem',
      p,
      ctx,
      sourceURL,
      [
        {
          id: String(p.cid),
          title: String(title || `PubChem CID ${p.cid}`),
          fields: raw,
          sourceURL: official(p.cid),
          actions: pubchemActions(p.cid),
        },
      ],
      pubchemAttribution,
      { total: 1, query: String(p.cid) },
    );
  }
  let sourceURL, options;
  if (p.kind === 'formula')
    sourceURL = `${base}/compound/fastformula/${encodeURIComponent(p.query)}/cids/JSON?MaxRecords=${WINDOW + 1}`;
  else if (['smiles', 'inchi'].includes(p.kind)) {
    sourceURL = `${base}/compound/${p.kind}/cids/JSON`;
    options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ [p.kind]: p.query }).toString(),
    };
  } else sourceURL = `${base}/compound/${p.kind}/${encodeURIComponent(p.query)}/cids/JSON`;
  const value = await pubchemJSON(ctx, sourceURL, options);
  if (value.empty)
    return result('pubchem', p, ctx, sourceURL, [], pubchemAttribution, {
      total: 0,
      rawResponse: value.raw,
    });
  const ids = value.raw.IdentifierList?.CID;
  if (
    !Array.isArray(ids) ||
    ids.some((id) => !Number.isSafeInteger(id) || id < 1) ||
    new Set(ids).size !== ids.length
  )
    throw malformed('PubChem');
  const selected = ids.slice(p.start, p.start + PAGE),
    next = p.start + PAGE < Math.min(ids.length, WINDOW) ? { ...p, start: p.start + PAGE } : null,
    total = p.kind === 'formula' && ids.length >= WINDOW + 1 ? null : ids.length;
  if (!selected.length)
    return result('pubchem', p, ctx, sourceURL, [], pubchemAttribution, {
      total,
      next,
      rawResponse: value.raw,
    });
  const recordURL = `${base}/compound/cid/${selected.join(',')}/record/JSON`,
    details = await pubchemJSON(ctx, recordURL);
  if (
    details.empty ||
    !Array.isArray(details.raw.PC_Compounds) ||
    details.raw.PC_Compounds.length !== selected.length ||
    details.raw.PC_Compounds.some(
      (row) => !compoundRecord(row) || !selected.includes(row.id.id.cid),
    ) ||
    new Set(details.raw.PC_Compounds.map((row) => row.id.id.cid)).size !== selected.length
  )
    throw malformed('PubChem');
  const byID = new Map(details.raw.PC_Compounds.map((row) => [row.id.id.cid, row])),
    records = selected.map((id) => {
      const fields = byID.get(id);
      return {
        id: String(id),
        title: String(compoundTitle(fields)),
        fields,
        sourceURL: official(id),
        actions: pubchemActions(id),
      };
    });
  return result('pubchem', p, ctx, sourceURL, records, pubchemAttribution, {
    total,
    next,
    rawResponse: { identifiers: value.raw, recordSourceURL: recordURL },
    limits: { window: WINDOW, moreBeyondWindow: ids.length > WINDOW },
    query: p.query,
  });
}

export const SCIENCE_PROVIDERS = Object.freeze([
  Object.freeze({
    id: 'cod',
    title: 'COD 晶体在线查询',
    allowedHosts: ['www.crystallography.net'],
    minimumIntervalMs: 1000,
    timeoutMs: 30000,
    validate: validateCOD,
    execute: executeCOD,
  }),
  Object.freeze({
    id: 'pubchem',
    title: 'PubChem 物质在线查询',
    allowedHosts: ['pubchem.ncbi.nlm.nih.gov'],
    minimumIntervalMs: 300,
    timeoutMs: 30000,
    validate: validatePubChem,
    execute: executePubChem,
  }),
]);
