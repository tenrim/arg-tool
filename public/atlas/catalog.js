// Public discovery metadata only; engines and data loading belong to controllers.
export const ATLAS_TOOLS=Object.freeze([
 {id:'constellations',title:'星座资料',group:'sky',placeholder:'Ori、Orion、Orionis 或星座名称',aliases:['IAU','88星座','星座缩写','星座图谱','拉丁属格']},
 {id:'eclipses',title:'日月食目录',group:'sky',placeholder:'日期、目录编号、Saros 周期或类型',aliases:['NASA','日食','月食','天象','沙罗周期','Saros','eclipse']},
 {id:'birds',title:'鸟类名录',group:'matter',placeholder:'中文鸟名、学名、英文名、分类或分布',aliases:['AviList','鸟类分类','亚种','鸟名','scientific name']},
 {id:'classical-music',title:'古典音乐资料',group:'music-reference',placeholder:'中文作曲家名、作品原名、编号或体裁',aliases:['Open Opus','古典音乐作品','作曲家','BWV','Opus','交响曲']},
]);
export const TIMEZONE_TOOL=Object.freeze({id:'timezones',title:'历史时区资料',group:'calendar',aliases:['IANA','TZDB','时区','夏令时','DST','历史时差','重复时间']});
