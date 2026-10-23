import {DISCOVERY_REFERENCES} from '../discovery/catalog.js';
const source=(name,repo,role)=>[name,repo.startsWith('https:')?repo:'https://github.com/'+repo,role];
const countrySources=[source('Countries','annexare/Countries','国家地区、首都、区号与货币数据'),source('flag-icons','lipis/flag-icons','本地 SVG 旗帜'),source('Natural Earth','nvkelso/natural-earth-vector','本地简化世界地图轮廓')];
const chineseSources=id=>[
 source('OpenCC-JS','nk2028/opencc-js','仅用于本地资料检索的繁简字形归一化，保留原始字段'),
 ...['unicode','currencies'].includes(id)?[source('Unicode CLDR 中文资料','unicode-org/cldr-json','固定简繁中文名称、关键词与标准标识对照；未收录部分保留原文')]:[],
 ...['countries','airports','ports','sky'].includes(id)?[source('Wikidata 中文名称补充','https://www.wikidata.org/','按标准标识及严格身份规则补充已有中文标签与别名；不是原始数据库的全量译文')]:[],
];
// Visible language scope, separate from operational help and source licences.
export const REFERENCE_LANGUAGE_NOTES=Object.freeze({
 countries:'国家／地区中文名称已收录；首都中文名称按已取得来源补充，未对应的首都保留原文。原始记录、代码与名称仍完整保留。',
 airports:'机场库完整保留。中文机场名称与别名只补充能从资料中可靠对应的记录；未对应的机场及城市字段仍显示原文，可继续按 IATA、ICAO／本地标识或原名查找。',
 ports:'运输地点库完整保留。中文名称只补充可靠对应的记录，其余显示原文；本次未取得完整中文地名译库，可按 UN/LOCODE 或原名查找。',
 unicode:'中文名称与关键词来自固定 Unicode CLDR，覆盖其中的 Emoji／符号注释，并补充文字系统和已有区块标签；不是全部 Unicode 标准名称的中文翻译。名称查询另支持已注释的字符序列；字符与码位查询仍按原码位拆解。',
 currencies:'中文货币名称使用固定 Unicode CLDR 对应代码，避免因浏览器语言资料版本不同而变化；未覆盖的历史代码保留原文，不人工编造名称。',
 sky:'保留全部 OpenNGC 目录。中文名称只来自可可靠对应的资料；没有已确认中文名称的对象保留目录号和原名，不人工给编号天体命名。',
 colors:'31,918 条来源色名以英文为主，本次尚未获得可可靠批量对应的完整中文名称资料，保留原文。红、蓝、绿、黑、白、黄、紫、橙及“红色”等为色值快捷输入，并非全部色名的中文翻译。',
 geology:'采用 ICS 已有中文名，并按其中文父级及下／中／上对应规则补齐 21 个原本缺名的单位；同时支持早／中／晚年代术语。原始标识、年代边界和层级不因语言适配而改变。',
 tarot:'中文牌名与关键词沿用现有牌库，支持繁简检索；不同牌组的常用异名没有逐条人工补写，可用原牌名、英文名或序号查找。',
});
export const REFERENCE_TOOLS=[
 {id:'countries',title:'国家地区与国旗',placeholder:'名称、首都、国家代码、货币或电话区号',note:'252 条国家／地区记录，含 250 面旗帜；AC、TA 旗帜未收录。支持中文名称，专名保留来源原文。资料快照：2026-10-09。',sources:countrySources},
 {id:'airports',title:'机场代码',placeholder:'IATA、ICAO／本地标识、机场或城市名称',note:'收录 86,226 条机场与航空设施记录，包括已关闭设施和没有 IATA 代码的地点；不是实时航班查询。地名保留来源原文。',sources:[source('OurAirports','davidmegginson/ourairports-data','机场代码、地点与坐标'),source('Countries','annexare/Countries','国家地区名称对照'),source('Natural Earth','nvkelso/natural-earth-vector','机场结果定位的本地世界地图')]},
 {id:'ports',title:'港口与运输地点代码',placeholder:'UN/LOCODE、地点名称或国家代码',note:'收录 116,213 条运输地点记录，并非全部都是海港。可按功能筛选；日期是记录原有的 YYMM 字段，不代表今日运营状态。',sources:[source('UN/LOCODE 数据集','datasets/un-locode','联合国运输地点代码的固定 CSV 快照'),source('Countries','annexare/Countries','国家地区名称对照'),source('Natural Earth','nvkelso/natural-earth-vector','运输地点结果定位的本地世界地图')]},
 {id:'unicode',title:'Unicode 字符查询',placeholder:'粘贴字符，或输入 U+0041 U+1F600',note:'Unicode 17.0.0。按码位拆解，组合 Emoji 可能包含多个码位；字符名称与文字系统保留标准英文原名。字体缺字不等于字符不存在。',sources:[source('Unicode Character Database','unicode-org/unicodetools','字符属性、区块、文字系统与别名')]},
 {id:'iching',title:'八卦与六十四卦',placeholder:'卦名、编号、卦象或读音',note:'8 个卦象与 64 个重卦；六十四卦编号使用文王卦序。二进制按自下而上显示，阳爻为 1、阴爻为 0。',sources:[source('i-ching','strobus/i-ching','卦名、卦序、阴阳爻与上下卦')]},
 {id:'tarot',title:'塔罗牌查询',placeholder:'中文／英文牌名、序号、花色或关键词',note:'78 张牌的名称、编号和象征对应，默认蓝金幻想 Gearberry 牌面，可切换经典 RWS。Gearberry 为正义 VIII、力量 XI，RWS 为力量 VIII、正义 XI；编号查询随所选版本变化。中文关键词为本站简述。',sources:[source('Tarot Card Data','smallcat419/tarot-card-data','78 张牌的名称、花色与元素资料'),source('Gearberry / 蓝金幻想牌面','reginanka/tarot-cards','Tarot Cards WebP Collection by Gearberry；78 张本地 WebP，按上游 CC BY 4.0 声明分发'),source('TarotCards / 1909 RWS 牌面','mixvlad/TarotCards','经典牌面切换；Pamela Colman Smith 原画、Steve P. 修复扫描；78 张公版牌面随站点提供')]},
 {id:'colors',title:'颜色名称查询',placeholder:'英文色名、#RGB、#RRGGBB 或红色等基础颜色',note:'31,918 条色名以英文为主，尚未获得可可靠批量对应的完整中文名称资料，保留原文。支持红、蓝、绿、黑、白、黄、紫、橙及“红色”等写法作为色值快捷输入，并非全部色名的中文翻译。输入色值按 CIE Lab ΔE76 列出最近 48 项；距离越小越接近。不是统一工业色号。',sources:[source('Color Names','meodai/color-names','颜色名称与 HEX 对照')]},
 {id:'geology',title:'地质年代查询',placeholder:'中文／英文名称，或在年代模式输入 Ma 数值',note:'179 条有年代边界的官方图表记录，时间单位为百万年（Ma）。采用固定 ICS 图表快照；边界值会同时列出相邻单位，年代数字可能随研究修订。',sources:[source('ICS 国际年代地层表','i-c-stratigraphy/chart','官方地质年代、中文名称、层级与图表颜色')]},
 ...DISCOVERY_REFERENCES
].map(tool=>({...tool,sources:[...tool.sources,...chineseSources(tool.id)]}));

// Country context uses the original country/flag/map data, not every supplement
// the country workspace happens to expose (for example capital-name overlays).
export function referenceToolSources(tool){
 const shared=['countries','currencies','airports','ports'].includes(tool.id)?countrySources:[];
 return [...new Map([...tool.sources,...shared].map(item=>[item[1],item])).values()];
}
