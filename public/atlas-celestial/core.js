/** Pure queries for complete, pinned IAU and NASA catalogue snapshots. No I/O or UI. */
import {normalizeChineseSearch} from '../reference/chinese-search.js';
const fold = normalizeChineseSearch;
const tokens = value => {
  const query = fold(String(value ?? '').trim());
  if (query.length > 10000) throw Error('查询内容过长。');
  return query.split(/\s+/).filter(Boolean);
};
const has = (terms, values) => {const source = fold(values.join(' ')); return terms.every(term => source.includes(term));};
const rows = data => {if (!data || !Array.isArray(data.records)) throw Error('资料格式无效，请重新加载。'); return data.records;};
function paginate(records, params, convert, note, facets) {
  const pageSize = params.pageSize === undefined ? 24 : Number(params.pageSize);
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw Error('每页数量应为 1 至 100。');
  const requested = params.page === undefined ? 0 : Number(params.page);
  if (!Number.isInteger(requested) || requested < 0) throw Error('页码无效。');
  const page = Math.min(requested, Math.max(0, Math.ceil(records.length / pageSize) - 1));
  return {items: records.slice(page * pageSize, (page + 1) * pageSize).map(convert), total: records.length, page, pageSize, note: records.length ? note : '本地完整快照中没有匹配项，请调整条件。', facets};
}
const entries = pairs => pairs.map(([label, value]) => [label, String(value ?? '未提供')]);
const present=(record,primary,additional=[])=>({...record,presentation:{primary:record.fields.filter(([label])=>primary.includes(label)),additional:record.fields.filter(([label])=>additional.includes(label))}});
export function queryConstellations(data, params = {}) {
  const all = rows(data), terms = tokens(params.query);
  if (params.filter && params.filter !== 'all') throw Error('星座筛选条件无效。');
  const index = all.map(r => ({id: r.id, title: `${r.zh} · ${r.name}`, chart: r.charts[0]?.path}));
  const filtered = all.filter(r => (!params.recordId || r.id === params.recordId) && has(terms, [r.id, r.zh, r.name, r.english, r.genitive, r.pronunciation, r.genitivePronunciation, ...r.charts.map(chart => chart.title)]));
  return paginate(filtered, params, r => present({
    id: r.id, title: `${r.zh} · ${r.name}`, chart: r.charts[0]?.path, charts: r.charts, boundaries: r.boundaries, raw: r,
    fields: entries([['中文名称', r.zh], ['拉丁主格', r.name], ['IAU 缩写', r.abbreviation], ['英文名称', r.english], ['拉丁属格', r.genitive], ['主格读音（原文）', r.pronunciation], ['属格读音（原文）', r.genitivePronunciation], ['图谱历元', 'J2000'], ['边界坐标（原始文本）', r.boundaries.map(x => x.text).join('\n\n')], ['官方资料', r.sourceURL]])
  },['中文名称','拉丁主格','IAU 缩写','图谱历元'],['英文名称','拉丁属格','主格读音（原文）','属格读音（原文）']), '完整 88 星座；巨蛇座含蛇头、蛇尾两幅图。图谱与边界为 J2000；星座范围不等同于黄道占星日期。', {types: [], index});
}
export const ECLIPSE_TYPES = Object.freeze({
  'solar:P': '日偏食', 'solar:A': '日环食', 'solar:T': '日全食', 'solar:H': '全环食',
  'lunar:N': '半影月食', 'lunar:P': '月偏食', 'lunar:T': '月全食'
});
const eclipseName = record => ECLIPSE_TYPES[`${record.kind}:${record.type[0]}`];
const year = (value, label) => {
  if (value === '' || value === undefined || value === null) return null;
  if (!/^-?\d{1,4}$/.test(String(value))) throw Error(`${label}应使用 -1999 至 3000 的天文年份整数（含 0 年）。`);
  const n = Number(value); if (n < -1999 || n > 3000) throw Error(`${label}超出目录范围 -1999 至 3000。`); return n;
};
const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
function calendarQuery(value) {
  const query = fold(String(value ?? '').trim());
  if (/^-?\d{1,4}$/.test(query)) return {year: year(query, '查询年份')};
  const chineseYear = /^(-?\d{1,4})\s*年$/.exec(query);
  if (chineseYear) return {year: year(chineseYear[1], '查询年份')};
  const iso = /^(-?\d{1,4})-(\d{1,2})-(\d{1,2})$/.exec(query);
  const chinese = /^(-?\d{1,4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*[日号]$/.exec(query);
  const original = /^(-?\d{1,4})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})$/.exec(query);
  const numeric = iso || chinese;
  if (!numeric && !original) return null;
  const result = {year: year((numeric || original)[1], '查询年份'), month: numeric ? Number(numeric[2]) : MONTH_NAMES.indexOf(original[2]) + 1, day: Number((numeric || original)[3])};
  const gregorian = result.year > 1582 || result.year === 1582 && (result.month > 10 || result.month === 10 && result.day >= 15);
  const leap = result.year % 4 === 0 && (!gregorian || result.year % 100 !== 0 || result.year % 400 === 0);
  const maxDay = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][result.month - 1];
  if (!maxDay || result.day < 1 || result.day > maxDay || result.year === 1582 && result.month === 10 && result.day >= 5 && result.day <= 14) throw Error('查询日期不符合目录使用的儒略历／格里高利历。');
  return result;
}
export function queryEclipses(data, params = {}) {
  const all = rows(data), terms = tokens(params.query), from = year(params.fromYear, '起始年份'), to = year(params.toYear, '结束年份');
  const date = calendarQuery(params.query);
  if (from !== null && to !== null && from > to) throw Error('起始年份不能晚于结束年份。');
  const filter = params.filter || '';
  if (filter && !['solar', 'lunar', ...Object.keys(ECLIPSE_TYPES)].includes(filter)) throw Error('日月食类型无效。');
  const saros = params.saros === '' || params.saros === undefined || params.saros === null ? null : Number(params.saros);
  if (saros !== null && (!Number.isInteger(saros) || saros < -100 || saros > 300)) throw Error('沙罗序列编号应为 -100 至 300 的整数。');
  const counts = new Map();
  for (const r of all) {const type = `${r.kind}:${r.type[0]}`; counts.set(type, (counts.get(type) || 0) + 1); counts.set(r.kind, (counts.get(r.kind) || 0) + 1);}
  const facets = {types: [{value: 'solar', label: '全部日食', count: counts.get('solar') || 0}, {value: 'lunar', label: '全部月食', count: counts.get('lunar') || 0}, ...Object.entries(ECLIPSE_TYPES).map(([value,label]) => ({value,label,count:counts.get(value)||0}))]};
  const filtered = all.filter(r => (!params.recordId || r.id === params.recordId) && (!filter || (filter.includes(':') ? `${r.kind}:${r.type[0]}` === filter : r.kind === filter)) && (from === null || r.year >= from) && (to === null || r.year <= to) && (saros === null || Number(r.saros) === saros) && (date ? r.year === date.year && (date.month === undefined || r.month === date.month && r.day === date.day) : has(terms, [r.id, r.date, r.dateISO, r.rawLine, r.ascii?.rawLine, eclipseName(r), r.kind === 'solar' ? '日食 solar sun' : '月食 lunar moon'])));
  return paginate(filtered, params, r => present({id: r.id, title: `${r.year}年${r.month}月${r.day}日 · ${eclipseName(r)}`, raw: r, fields: entries([
    ['食的类别', eclipseName(r)], ['NASA 目录编号', r.catalogNumber], ['日期（中文，原目录历法）', `${r.year}年${r.month}月${r.day}日`], ['日期（原目录历法）', r.date], ['天文年份', r.year], ['历法', r.calendar === 'julian' ? '儒略历' : '格里高利历'],
    ['食甚时刻 TD', r.td], ['ΔT＝TD－UT（秒）', r.deltaT], ['朔望月编号', r.lunationNumber], ['沙罗序列', r.saros], ['类型与附加标记（原文）', r.type], [r.kind === 'solar' ? 'QLE 参数' : 'QSE 参数', r.quincena], ['Gamma（地球赤道半径）', r.gamma],
    ...(r.kind === 'solar' ? [['食分（直径比）', r.magnitude], ['食甚点纬度', r.latitude], ['食甚点经度', r.longitude], ['太阳高度（度）', r.sunAltitude], ['食带宽度（千米）', r.pathWidth], ['中心食持续时间', r.centralDuration]] : [['半影食分', r.penumbralMagnitude], ['本影食分', r.umbralMagnitude], ['半影食持续时间（分钟）', r.penumbralDuration], ['偏食持续时间（分钟）', r.partialDuration], ['全食持续时间（分钟）', r.totalDuration], ['月亮直射点纬度', r.latitude], ['月亮直射点经度', r.longitude]]),
    ...(r.ascii ? [...(r.kind === 'solar' ? [['ASCII 原表图版号', r.ascii.plateNumber], ['ASCII 原表太阳方位角（度）', r.ascii.sunAzimuth], ['ASCII 原表食甚点纬度', r.ascii.latitude], ['ASCII 原表食甚点经度', r.ascii.longitude]] : []), ['ASCII 原始发行表行', r.ascii.rawLine], ['两种表格的原文字段差异', r.ascii.differences.length ? r.ascii.differences.join('、') + '（保留原表精度／版本差异，不互相覆盖）' : '无']] : []),
    ['原始网页目录行', r.rawLine], ['官方目录页', r.sourceURL], ['官方食图', r.links[0]?.url || '未提供']
  ])},['食的类别','日期（中文，原目录历法）','历法','食甚时刻 TD','食分（直径比）','食甚点纬度','食甚点经度','中心食持续时间','半影食分','本影食分','半影食持续时间（分钟）','偏食持续时间（分钟）','全食持续时间（分钟）'],['沙罗序列','ΔT＝TD－UT（秒）','食带宽度（千米）','太阳高度（度）']), '完整 -1999 至 3000 年目录。年份含 0；1582-10-04 及以前用儒略历，之后用格里高利历；TD 不是当地钟表时间。目录事件不等于在任意地点可见。', facets);
}
