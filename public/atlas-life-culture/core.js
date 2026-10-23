// Pure, local catalogue queries. Workers own fetch/cancellation; this module owns no UI or network.
import {normalizeChineseSearch} from '../reference/chinese-search.js';
import {CLDR_VERSION, territoryEntries} from '../reference-locale/names.js';
const birdIndexes = new WeakMap();
const musicIndexes = new WeakMap();
const RANK_NAMES = Object.freeze({ order: '目', family: '科', genus: '属', species: '种', subspecies: '亚种' });
const BIRD_FIELDS = Object.freeze({
  Sequence: '分类序号', Taxon_rank: '分类等级', Order: '目', Family: '科', Family_English_name: '科英文名称',
  Scientific_name: '学名', Authority: '命名人', Bibliographic_details: '文献详情', English_name_AviList: 'AviList 英文名',
  English_name_Clements_v2025: 'Clements v2025 英文名', English_name_BirdLife_v10: 'BirdLife v10 英文名',
  Proposal_number: '提案编号', Decision_summary: '分类决策说明', Range: '分布', Extinct_or_possibly_extinct: '灭绝状态',
  IUCN_Red_List_Category: 'IUCN 红色名录类别', BirdLife_DataZone_URL: 'BirdLife 资料链接', Species_code_Cornell_Lab: 'Cornell 物种代码',
  Birds_of_the_World_URL: 'Birds of the World 链接', AvibaseID: 'Avibase 编号', Gender_of_genus: '属名语法性别',
  Type_species_of_genus: '属的模式种', Type_locality: '模式产地', Title_of_original_description: '原始描述标题',
  Original_description_URL: '原始描述链接', Protonym: '原始学名'
});
const MUSIC_FIELDS = Object.freeze({ name: '常用名', complete_name: '完整姓名', epoch: '时期', birth: '出生日期', death: '逝世日期', popular: '热门标记', recommended: '推荐标记', title: '作品名', subtitle: '补充描述', searchterms: '检索别名', genre: '体裁' });
const EPOCH_NAMES = Object.freeze({ '20th Century': '20 世纪（20th Century）', '21st Century': '21 世纪（21st Century）', Baroque: '巴洛克（Baroque）', Classical: '古典主义（Classical）', 'Early Romantic': '浪漫主义早期（Early Romantic）', 'Late Romantic': '浪漫主义晚期（Late Romantic）', Medieval: '中世纪（Medieval）', 'Post-War': '战后（Post-War）', Renaissance: '文艺复兴（Renaissance）', Romantic: '浪漫主义（Romantic）' });
const GENRE_NAMES = Object.freeze({ Chamber: '室内乐（Chamber）', Keyboard: '键盘乐（Keyboard）', Orchestral: '管弦乐（Orchestral）', Stage: '舞台作品（Stage）', Vocal: '声乐（Vocal）' });
const fold = normalizeChineseSearch;
const text = value => value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
const tokens = value => fold(value).trim().split(/\s+/u).filter(Boolean);
const matches = (haystack, parts) => parts.every(part => haystack.includes(part));
const fieldLabel = (key, labels, prefix = '') => `${prefix}${labels[key] || key}（${key}）`;
const shown = pairs => pairs.filter(([, value]) => value !== null && value !== undefined && value !== '');
const chineseOnly = label => label?.replace(/（[^）]*）/g, '');
let territoryNames;
function rangeNames(value) {
  if (!territoryNames) {
    const names = new Map();
    for (const entry of territoryEntries()) for (const english of entry.english) {
      const key = fold(english);
      if (!key) continue;
      const existing = names.get(key);
      if (existing && existing.code !== entry.code) existing.ambiguous = true;
      else if (!existing) names.set(key, {code: entry.code, labels: entry.labels});
    }
    const entries = [...names].filter(([, entry]) => !entry.ambiguous).sort(([a], [b]) => b.length - a.length);
    territoryNames = {names: new Map(entries), expression: new RegExp('(?<![\\p{L}\\p{N}])(?:' + entries.map(([name]) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![\\p{L}\\p{N}])', 'gu')};
  }
  // Only exact, nonoverlapping CLDR English territory mentions are supplemented.
  // This is a search aid, not a translation or reinterpretation of range prose.
  return [...new Set([...fold(value).matchAll(territoryNames.expression)].flatMap(match => territoryNames.names.get(match[0]).labels))];
}
function facet(values, labels = {}) {
  const counts = new Map();
  for (const value of values) if (value !== null && value !== undefined && value !== '') counts.set(String(value), (counts.get(String(value)) || 0) + 1);
  return [...counts].sort(([a], [b]) => a.localeCompare(b, 'en')).map(([value, count]) => ({ value, label: labels[value] || value, count }));
}
function paginate(rows, params, makeItem, extra) {
  const pageSize = Math.max(1, Math.min(100, Math.trunc(Number(params.pageSize)) || 24));
  const total = rows.length;
  const page = Math.max(0, Math.min(Math.max(0, Math.ceil(total / pageSize) - 1), Math.trunc(Number(params.page)) || 0));
  return { items: rows.slice(page * pageSize, (page + 1) * pageSize).map(makeItem), total, page, pageSize, ...extra };
}
function birdIndex(data) {
  if (birdIndexes.has(data)) return birdIndexes.get(data);
  if (!data || !Array.isArray(data.columns) || !Array.isArray(data.records) || data.columns.length !== 26 || new Set(data.columns).size !== data.columns.length) throw new Error('鸟类目录列结构无效。');
  const col = Object.fromEntries(data.columns.map((name, index) => [name, index]));
  for (const name of ['Sequence', 'Taxon_rank', 'Order', 'Family', 'Scientific_name', 'English_name_AviList']) if (!Object.hasOwn(col, name)) throw new Error('鸟类目录缺少必要列。');
  const rows = data.records.map(values => {
    if (!Array.isArray(values) || values.length !== data.columns.length) throw new Error('鸟类目录记录列数不完整。');
    const chinese = data.chineseNames?.[values[col.Scientific_name]], geography = rangeNames(values[col.Range]);
    return { id: `bird:${values[col.Sequence]}`, values, chinese, geography, search: fold([...values.map(text), ...(chinese?.names || []), ...geography].join('\n')) };
  });
  if (new Set(rows.map(row => row.id)).size !== rows.length) throw new Error('鸟类目录分类序号重复。');
  const get = (row, field) => row.values[col[field]];
  const result = { rows, col, get, byId: new Map(rows.map(row => [row.id, row])), facets: { orders: facet(rows.map(row => get(row, 'Order'))), families: facet(rows.map(row => get(row, 'Family'))), ranks: facet(rows.map(row => get(row, 'Taxon_rank')), RANK_NAMES) } };
  birdIndexes.set(data, result);
  return result;
}
function birdItem(data, row) {
  const raw = Object.fromEntries(data.columns.map((name, index) => [name, row.values[index]]));
  return { id: row.id, presentation: {primary: shown([['中文名', row.chinese?.simplified || row.chinese?.traditional], ['学名', raw.Scientific_name], ['分类等级', RANK_NAMES[raw.Taxon_rank] || raw.Taxon_rank], ['目', raw.Order], ['科', raw.Family], ['分布地名', row.geography.join('、')]]), additional: shown([['繁体中文名', row.chinese?.traditional], ['英文名', raw.English_name_AviList], ['命名人', raw.Authority], ['分布原文', raw.Range], ['灭绝状态', raw.Extinct_or_possibly_extinct], ['IUCN 红色名录类别', raw.IUCN_Red_List_Category]])}, title: [row.chinese?.simplified || row.chinese?.traditional || raw.English_name_AviList, raw.Scientific_name].filter(Boolean).join(' · '), fields: [...(row.chinese ? [['中文名（IOC 15.2，简体）', row.chinese.simplified || '原表未提供'], ['中文名（IOC 15.2，繁体）', row.chinese.traditional || '原表未提供'], ['中文名原表行号', row.chinese.sourceRow], ['中文名来源', 'https://www.worldbirdnames.org/new/ioc-lists/master-list-2/'], ['中文名署名与许可', `${data.meta.chineseSupplement?.citation || 'Gill, Donsker & Rasmussen (Eds). IOC World Bird List 15.2'}；CC BY 3.0 Unported。`], ['中文名快照日期', data.meta.chineseSupplement?.snapshotDate]] : []), ...(row.geography.length ? [['分布地名（CLDR 中文检索补充）', row.geography.join('、')], ['分布地名补充来源与许可', `Unicode CLDR ${CLDR_VERSION}；https://cldr.unicode.org/；Unicode, Inc.；Unicode-3.0。仅匹配原文中完整英文地名，保留英文分布原文。`]] : []), ...data.columns.map(name => [fieldLabel(name, BIRD_FIELDS), raw[name]])], raw };
}

/** Every main-sheet row, including order/family/genus, remains searchable. */
export function queryBirds(data, params = {}) {
  const index = birdIndex(data);
  const parts = tokens(params.query);
  const selected = params.recordId ? index.byId.get(String(params.recordId)) : null;
  const rows = params.recordId ? (selected ? [selected] : []) : index.rows.filter(row => (!params.order || index.get(row, 'Order') === params.order) && (!params.family || index.get(row, 'Family') === params.family) && (!params.rank || index.get(row, 'Taxon_rank') === params.rank) && matches(row.search, parts));
  return paginate(rows, params, row => birdItem(data, row), { facets: index.facets, note: `AviList ${data.meta.version} Extended：完整 ${data.meta.recordCount.toLocaleString('zh-CN')} 条分类记录；全部 26 列保留。${data.meta.chineseSupplement ? `IOC 15.2 按完整学名精确补充 ${data.meta.chineseSupplement.matchedSpecies.toLocaleString('zh-CN')} 个种的中文名；未匹配种及目、科、属、亚种保留原名。` : '当前快照未提供中文鸟名，请使用学名或英文名。'}分布说明仍为原文，中文地名仅按 CLDR 的完整英文地名匹配辅助检索，不代表已翻译分布或完成地域鉴定。` });
}

/** Auxiliary workbook content keeps original sheet names, row numbers and cell notes. */
export function queryBirdMetadata(data, params = {}) {
  if (!data || !Array.isArray(data.sheets)) throw new Error('鸟类名录的工作表资料无效。');
  const sheetName = Object.hasOwn(params, 'sheet') ? params.sheet : params.category || 'How to use';
  const parts = tokens(params.query);
  const all = data.sheets.flatMap((sheet, sheetIndex) => sheet.rows.map(row => ({ id: `bird-metadata:${sheetIndex}:${row.row}`, sheet, row, search: fold(row.values.map(text).join('\n')) })));
  const rows = all.filter(item => params.recordId ? item.id === params.recordId : (!sheetName || item.sheet.name === sheetName) && matches(item.search, parts));
  return paginate(rows, params, item => {
    const { sheet, row } = item;
    const annotations = Object.fromEntries(Object.entries(sheet.cellMetadata).filter(([cell]) => Number(cell.match(/\d+$/u)?.[0]) === row.row));
    const raw = { sheet: sheet.name, row: row.row, values: row.values, cellMetadata: annotations, mergedCells: sheet.mergedCells };
    if (sheet.recordsRef) raw.mainTableRecordsRef = sheet.recordsRef;
    return { id: item.id, title: `${sheet.name} · 原表第 ${row.row} 行`, fields: [['工作表', sheet.name], ['原始行号', row.row], ...row.values.map((value, index) => [`原表第 ${index + 1} 列`, value]), ...Object.entries(annotations).map(([cell, value]) => [`单元格 ${cell} 注释／超链接`, value])], raw };
  }, { facets: { sheets: data.sheets.map(sheet => ({ value: sheet.name, label: sheet.name, count: sheet.rows.length })) }, note: '辅助工作表完整保留原始行号及非空单元格；附表及分类决定没有可直接导入的配套中文资料，保留原文。主表记录另在鸟类名录查询，原始六工作表 XLSX 可完整下载。' });
}

function musicIndex(data) {
  if (musicIndexes.has(data)) return musicIndexes.get(data);
  if (!data || !Array.isArray(data.records) || !Array.isArray(data.composers)) throw new Error('古典音乐资料结构无效。');
  const byComposer = new Map(data.composers.map(composer => [composer.id, composer]));
  const byWork = new Map(data.records.map(work => [work.id, work]));
  if (byComposer.size !== data.composers.length || byWork.size !== data.records.length) throw new Error('古典音乐记录编号重复。');
  const terminology = (data.terminology || []).map(term => ({...term, searchNames: [...new Set(Object.values(term.labels))], expression: new RegExp('(?<![\\p{L}\\p{N}])' + fold(term.english).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}\\p{N}])', 'u')}));
  const works = data.records.map(work => {
    const composer = byComposer.get(work.composerId);
    if (!composer || !composer.workIds.includes(work.id)) throw new Error('作品与作曲家关系不完整。');
    const formTerms = terminology.filter(term => term.expression.test(fold(work.raw.title)));
    return { ...work, composer, formTerms, search: fold([...Object.values(work.raw), ...Object.values(composer.raw), ...(composer.chinese?.names || []), ...formTerms.flatMap(term => term.searchNames), EPOCH_NAMES[composer.raw.epoch], GENRE_NAMES[work.raw.genre]].map(text).join('\n')) };
  });
  const composers = data.composers.map(composer => {
    const linked = composer.workIds.map(id => byWork.get(id));
    if (linked.some(work => !work || work.composerId !== composer.id)) throw new Error('作曲家作品索引不完整。');
    return { ...composer, works: linked.map(work => work.raw), search: fold([...Object.values(composer.raw), ...(composer.chinese?.names || []), EPOCH_NAMES[composer.raw.epoch], ...linked.map(work => GENRE_NAMES[work.raw.genre])].map(text).join('\n')) };
  });
  const facets = { composers: composers.map(composer => ({ value: composer.id, label: composerName(composer), count: composer.workIds.length })).sort((a, b) => a.label.localeCompare(b.label, 'zh-CN')), epochs: facet(composers.map(composer => composer.raw.epoch), EPOCH_NAMES), genres: facet(works.map(work => work.raw.genre), GENRE_NAMES) };
  const result = { works, composers, facets, byId: new Map([...works, ...composers].map(row => [row.id, row])) };
  musicIndexes.set(data, result);
  return result;
}
const chineseName = row => row.chinese?.labels?.['zh-hans'] || row.chinese?.labels?.['zh-cn'] || row.chinese?.labels?.zh || row.chinese?.names?.[0];
const composerName = row => [chineseName(row), row.raw.complete_name || row.raw.name].filter(Boolean).join(' · ');
const chineseMusicFields = row => row.chinese ? [['作曲家中文名与别名（Wikidata）', row.chinese.names.join('；')], ['中文名来源条目', row.chinese.sourceURL], ['Wikidata 条目修订号', row.chinese.revision], ['中文名署名与许可', 'Wikidata contributors；结构化数据 CC0 1.0。'], ['中文名快照日期', row.chinese.snapshotDate]] : [];
function musicItem(row) {
  if (row.id.startsWith('composer:')) {
    const raw = { ...row.raw, works: row.works };
    return { id: row.id, presentation: {primary: shown([['中文名', chineseName(row)], ['完整姓名', row.raw.complete_name || row.raw.name], ['时期', chineseOnly(EPOCH_NAMES[row.raw.epoch]) || row.raw.epoch], ['出生日期', row.raw.birth], ['逝世日期', row.raw.death], ['本快照作品数', row.workIds.length]])}, composerId: row.id, title: composerName(row), fields: [...chineseMusicFields(row), ...Object.entries(row.raw).map(([key, value]) => [fieldLabel(key, MUSIC_FIELDS), value]), ['时期（中文）', EPOCH_NAMES[row.raw.epoch] || row.raw.epoch], ['本快照作品数', row.workIds.length]], raw };
  }
  return { id: row.id, presentation: {primary: shown([['作品名', row.raw.title], ['补充描述', row.raw.subtitle], ['作曲家', chineseName(row.composer) || row.composer.raw.complete_name || row.composer.raw.name], ['体裁', chineseOnly(GENRE_NAMES[row.raw.genre]) || row.raw.genre], ['时期', chineseOnly(EPOCH_NAMES[row.composer.raw.epoch]) || row.composer.raw.epoch]]), additional: shown([['标题术语', row.formTerms.map(term => term.searchNames.join('／')).join('；')]])}, composerId: row.composerId, title: `${row.raw.title} · ${composerName(row.composer)}`, fields: [...chineseMusicFields(row.composer), ...(row.formTerms.length ? [['标题术语（中文检索补充，不是完整标题翻译）', row.formTerms.map(term => `${term.english}：${term.searchNames.join('／')}`).join('；')], ['标题术语来源与许可', row.formTerms.map(term => `${term.sourceURL}；修订 ${term.revision}；Wikidata contributors；CC0 1.0`).join('\n')]] : []), ...Object.entries(row.raw).map(([key, value]) => [fieldLabel(key, MUSIC_FIELDS), value]), ['体裁（中文）', GENRE_NAMES[row.raw.genre] || row.raw.genre], ['时期（中文）', EPOCH_NAMES[row.composer.raw.epoch] || row.composer.raw.epoch], ...Object.entries(row.composer.raw).map(([key, value]) => [fieldLabel(key, MUSIC_FIELDS, '作曲家 '), value])], raw: { work: row.raw, composer: row.composer.raw } };
}

/** No popular/recommended subset: all original composers and all their works are indexed. */
export function queryMusic(data, params = {}) {
  const index = musicIndex(data);
  const parts = tokens(params.query);
  const selected = params.recordId ? index.byId.get(String(params.recordId)) : null;
  const source = params.category === 'composers' ? index.composers : index.works;
  const rows = params.recordId ? (selected ? [selected] : []) : source.filter(row => {
    const composer = row.composer || row;
    return (!params.composerId || composer.id === params.composerId) && (!params.epoch || composer.raw.epoch === params.epoch) && (!params.genre || (row.composer ? row.raw.genre === params.genre : row.works.some(work => work.genre === params.genre))) && matches(row.search, parts);
  });
  if (!params.recordId && parts.length) {
    const exactComposer = row => (row.composer || row).chinese?.names.some(name => parts.includes(fold(name))) ? 0 : 1;
    rows.sort((a, b) => exactComposer(a) - exactComposer(b));
  }
  return paginate(rows, params, musicItem, { facets: index.facets, note: `Open Opus ${data.meta.snapshotDate} 完整快照：${data.meta.composerCount} 位作曲家、${data.meta.recordCount.toLocaleString('zh-CN')} 部作品。${data.meta.chineseSupplement ? `其中 ${data.meta.chineseSupplement.chineseComposerCount} 位作曲家的中文名与别名由 Wikidata 精确身份核对后批量补充，可用中文姓名、时期和体裁检索作品。` : '当前快照未提供作曲家中文名。'}${data.meta.chineseTerminology ? `${data.meta.chineseTerminology.termCount} 项中文音乐形式术语仅匹配原题中的完整英文词，辅助查找，不等于作品分类或完整标题翻译。` : ''}作品名称与描述仍为原文，未找到可按作品身份批量核对的完整中文来源；未匹配作曲家也保留原名，不作机器翻译。不含录音、乐谱或肖像图片。` });
}
