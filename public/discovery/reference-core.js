import {currencyLabels,currencySymbols} from "../reference-locale/names.js";
import {normalizeChineseSearch as fold} from '../reference/chinese-search.js';
import {CHINESE_SKY} from '../vendor/reference-chinese/sky.js';
const matches = (query, values) => query.split(/\s+/).every(part => fold(values.join(' ')).includes(part));
const page = (rows, p) => {const n = Math.max(0, Math.floor(Number(p.page) || 0)); return {total: rows.length, page: n, items: rows.slice(n * 24, n * 24 + 24), note: rows.length ? '' : '本地资料中没有匹配项，请调整条件。'};};
const fields = rows => rows.filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => [k, String(v)]);
export const MARINE_MEANINGS = {
 A:'水下有潜水员，请慢速远离。', B:'正在装卸或运载危险货物。', C:'是／肯定。', D:'请远离，我操纵困难。', E:'正在向右转向。', F:'失去操纵能力，请与我通信。', G:'需要引航员。', H:'船上有引航员。', I:'正在向左转向。', J:'失火并载有危险货物，或有危险货物泄漏，请远离。', K:'希望与你通信。', L:'请立即停船。', M:'船已停止，且无对水移动。', N:'否／否定。', O:'有人落水。', P:'在港时：全体人员回船，准备开航。', Q:'船舶健康，请求准入。', R:'现行通用单旗信号未规定含义。', S:'机器正在倒车。', T:'请远离，正在双船拖网作业。', U:'正在驶向危险区域。', V:'需要援助。', W:'需要医疗援助。', X:'停止当前行动，注意我的信号。', Y:'正在走锚。', Z:'需要拖船。'
};
export function currencyName(record) {return currencyLabels(record.code)[0]||record.name;}
export function queryCurrencies(p, data, countries) {
  const query = fold(String(p.query || '').trim()), groups = new Map();
  if (query.length > 10000) throw Error('查询内容过长。');
  const country = countries.find(c => c.id.toLowerCase() === fold(p.region || ''));
  if (p.region && !country) throw Error('请输入有效的两字母国家／地区代码。');
  const queryCountries = query ? countries.filter(c => matches(query, [c.id, c.name, c.english, c.native])) : [];
  for (const r of data) {
    if (p.filter && r.status !== p.filter) continue;
    const related = r.status === 'current' ? countries.filter(c => c.currency.includes(r.code)) : [];
    if (country && !related.some(c => c.id === country.id)) continue;
    if (query && !matches(query, [r.code, r.numeric, r.name, ...currencyLabels(r.code), ...currencySymbols(r.code), r.entity, ...related.flatMap(c => [c.name, c.english, c.id])]) && !(r.status === 'current' && queryCountries.some(c => c.currency.includes(r.code)))) continue;
    const id = r.code + ':' + r.status; if (p.recordId && p.recordId !== id) continue;
    if (!groups.has(id)) groups.set(id, {record: r, members: [], countries: related});
    groups.get(id).members.push(r);
  }
  return page([...groups].sort(([a],[b]) => a.localeCompare(b)).map(([id, {record: r, members, countries: related}]) => ({
    id, title: `${r.code} · ${currencyName(r)}`, currencyCode: r.code, countryCodes: related.map(c => c.id), countryLinks:related.map(c=>({id:c.id,name:c.name,flag:c.flag})),
    fields: fields([['字母代码', r.code], ['数字代码', r.numeric || '未指定'], ['显示名称', currencyName(r)], ['中文名称／别名（CLDR）', currencyLabels(r.code).join('、')||'CLDR 未收录，保留原文'], ['英文名称（原文）', r.name], ['状态', r.status === 'current' ? '现行（资料快照）' : '历史／已退出'], ['最小单位小数位', r.minorUnit === null ? '未指定／不适用' : r.minorUnit], ['使用实体（资料原文）', [...new Set(members.map(r => r.entity))].join('；')], ['相关国家／地区', related.map(c => c.name).join('、')], ['退出时间（原记录）', [...new Set(members.map(r => r.withdrawal).filter(Boolean))].join('；')]])
  })), p);
}
export function queryMarine(p, data) {
  const input = String(p.query || '').trim();
  if (input.length > 10000) throw Error('查询内容过长。');
  const convert = (r, id = r.id) => ({id, title: r.name + ' · ' + r.phonetic, marineFlag: r.file, symbol: r.id, fields: [['字符', r.id], ['识别读音', r.phonetic], ['单旗基础含义', MARINE_MEANINGS[r.id] || '数字旗，用于数字组合。']]});
  if (p.mode === 'sequence') {
    const sequence = input.replace(/\s/g, '').toUpperCase();
    if (!/^[A-Z0-9]{1,128}$/.test(sequence)) throw Error('旗语组合请输入 1–128 个英文字母或数字，可用空格分隔。');
    return {...page([...sequence].map((c, i) => convert(data.find(r => r.id === c), `${c}:${i}`)), p), sequence};
  }
  const symbol=input.normalize('NFKC').toUpperCase(), exact=/^[A-Z0-9]$/.test(symbol);
  return page(data.filter(r => (!p.recordId || r.id === p.recordId) && (!p.filter || (p.filter === 'letters' ? /[A-Z]/ : /\d/).test(r.id)) && (exact?r.id===symbol:matches(fold(input), [r.id, r.name, r.phonetic, MARINE_MEANINGS[r.id] || '']))).map(r => convert(r)), p);
}
export function queryMarineBook(p, pages){
  const input=String(p.query||'').trim();if(input.length>10000)throw Error('查询内容过长。');
  const words=input.toUpperCase().split(/\s+/).filter(Boolean);
  const exact=/^[A-Z]{1,3}\s*\d{0,2}$/i.test(input)?new RegExp('(?:^|\\n)\\s*'+input.toUpperCase().replace(/\s+/g,'\\s*')+'(?:\\s|$)'):null;
  const records=pages.filter(r=>(!p.recordId||p.recordId==='icos-'+r.page)&&(exact?exact.test(r.text):words.every(w=>r.text.toUpperCase().includes(w))));
  return page(records.map(r=>({id:'icos-'+r.page,title:'国际信号规则 · PDF 第 '+r.page+' 页',fields:[['正文（原文）',r.text]],sourceUrl:'/vendor/completion/marine/Pub102bk.pdf#page='+r.page,...(r.image==='flag-chart.png'?{sourceImage:'/vendor/completion/marine/flag-chart.png'}:{})})),p);
}
export const SKY_TYPES = {G:'星系', GPair:'星系对', GTrpl:'星系三重组', GGroup:'星系群', OCl:'疏散星团', GCl:'球状星团', 'Cl+N':'星团与星云', PN:'行星状星云', HII:'电离氢区', Neb:'星云', RfN:'反射星云', SNR:'超新星遗迹', EmN:'发射星云', DrkN:'暗星云', '*':'单星', '**':'双星', '*Ass':'恒星星协', Dup:'重复目录记录', NonEx:'不存在／未确认的目录记录', Other:'其他'};
export const CONSTELLATIONS={And:'仙女座',Ant:'唧筒座',Aps:'天燕座',Aqr:'宝瓶座',Aql:'天鹰座',Ara:'天坛座',Ari:'白羊座',Aur:'御夫座',Boo:'牧夫座',Cae:'雕具座',Cam:'鹿豹座',Cnc:'巨蟹座',CVn:'猎犬座',CMa:'大犬座',CMi:'小犬座',Cap:'摩羯座',Car:'船底座',Cas:'仙后座',Cen:'半人马座',Cep:'仙王座',Cet:'鲸鱼座',Cha:'蝘蜓座',Cir:'圆规座',Col:'天鸽座',Com:'后发座',CrA:'南冕座',CrB:'北冕座',Crv:'乌鸦座',Crt:'巨爵座',Cru:'南十字座',Cyg:'天鹅座',Del:'海豚座',Dor:'剑鱼座',Dra:'天龙座',Equ:'小马座',Eri:'波江座',For:'天炉座',Gem:'双子座',Gru:'天鹤座',Her:'武仙座',Hor:'时钟座',Hya:'长蛇座',Hyi:'水蛇座',Ind:'印第安座',Lac:'蝎虎座',Leo:'狮子座',LMi:'小狮座',Lep:'天兔座',Lib:'天秤座',Lup:'豺座',Lyn:'天猫座',Lyr:'天琴座',Men:'山案座',Mic:'显微镜座',Mon:'麒麟座',Mus:'苍蝇座',Nor:'矩尺座',Oct:'南极座',Oph:'蛇夫座',Ori:'猎户座',Pav:'孔雀座',Peg:'飞马座',Per:'英仙座',Phe:'凤凰座',Pic:'绘架座',Psc:'双鱼座',PsA:'南鱼座',Pup:'船尾座',Pyx:'罗盘座',Ret:'网罟座',Sge:'天箭座',Sgr:'人马座',Sco:'天蝎座',Scl:'玉夫座',Sct:'盾牌座',Ser:'巨蛇座',Sex:'六分仪座',Tau:'金牛座',Tel:'望远镜座',Tri:'三角座',TrA:'南三角座',Tuc:'杜鹃座',UMa:'大熊座',UMi:'小熊座',Vel:'船帆座',Vir:'室女座',Vol:'飞鱼座',Vul:'狐狸座'};
const deepNames = {NGC0224:'仙女座星系', NGC1976:'猎户座大星云', NGC1952:'蟹状星云', NGC6205:'武仙座球状星团', NGC5194:'涡状星系', NGC6720:'环状星云', NGC7293:'螺旋星云'};
export const skyName = r => CHINESE_SKY[r.id]?.name || deepNames[r.id] || r.name;
export const identifier = s => {const m = /^(ngc|ic|m)[ :_-]*0*(\d+)$/i.exec(String(s).trim()); return m ? m[1].toUpperCase() + ':' + Number(m[2]) : null;};
export function filterSky(p, index) {
  const query = fold(String(p.query || '').trim()); if (query.length > 10000) throw Error('查询内容过长。');
  let mag = null;
  if (p.maxMagnitude !== '' && p.maxMagnitude != null) {mag = Number(p.maxMagnitude); if (!Number.isFinite(mag) || mag < -30 || mag > 30) throw Error('星等上限应为 -30 至 30；留空不限。');}
  const code = identifier(query);
  return index.filter(r => (!p.recordId || r.id === p.recordId) && (!p.filter || r.type === p.filter) && (mag === null || r.mag !== null && r.mag <= mag) && (code ? [r.id, ...r.aliases].some(a => identifier(a) === code) : matches(query, [r.id, r.name, skyName(r), ...(CHINESE_SKY[r.id]?.names||[]), ...r.aliases, SKY_TYPES[r.type], r.constellation, CONSTELLATIONS[r.constellation]])));
}
export function skyRows(p, index, details = []) {
  const rows = filterSky(p, index), byId = new Map(details.map(r => [r.id, r]));
  const result = page(rows, p);
  result.items = result.items.map(r => {
    const raw = byId.get(r.id)?.raw || {}, valid = r.ra !== null && r.dec !== null && Number.isFinite(r.ra) && Number.isFinite(r.dec), items = [
      ['目录编号', r.id], ['名称', skyName(r)], ['来源名称', r.name], ['其他标识', r.aliases.join('、')], ['类别', SKY_TYPES[r.type] || r.type], ['星座', (CONSTELLATIONS[r.constellation]||'')+' · '+(r.constellation || '未收录')], ['赤经 J2000（小时）', valid ? r.ra.toFixed(6) : '未提供'], ['赤纬 J2000（度）', valid ? r.dec.toFixed(6) : '未提供'], ['视星等（V）', r.mag === null ? '未提供' : r.mag]
    ];
    items.push(['中文名称／别名',CHINESE_SKY[r.id]?.names.join('、')],['中文名称来源',CHINESE_SKY[r.id]?.source],['长轴／短轴（角分）', raw.MajAx || raw.MinAx ? `${raw.MajAx || '—'} / ${raw.MinAx || '—'}` : '未提供'], ['形态（原文）', raw.Hubble], ['红移', raw.Redshift], ['来源字段归属', raw.Sources]);
    return {id: r.id, title: skyName(r) + (skyName(r) !== r.id ? ' · ' + r.id : ''), fields: fields(items), sky: valid && !['Dup', 'NonEx'].includes(r.type) ? {id: r.id, name: skyName(r), ra: r.ra, dec: r.dec} : null};
  });
  return result;
}
