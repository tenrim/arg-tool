// Stable broad categories shared by the discovery registry and every shell.
// This module must not import the async registry: registry consumes toolPages.
export const capabilityCategories = [
 {id:'codec',title:'编解码与加解密',name:'编解码与加解密',icon:'encoding'},
 {id:'reference',title:'资料查询',name:'资料查询',icon:'countries'},
 {id:'media',title:'图片音视频与文件处理',name:'图片音视频与文件处理',icon:'image'},
 {id:'other',title:'其他工具',name:'其他工具',icon:'turing'},
 {id:'knowledge',title:'科普',name:'科普',icon:'knowledge'}
];
import {PRACTICAL_TASKS} from './practical/catalog.js';
import {UNIT_DISCIPLINES} from './capabilities/unit-catalog.js';
import {GROUPS} from './chef-tools/catalog.js';
import {EXPANSION_TASKS} from './expansion/catalog.js';
import {ATLAS_TOOLS,TIMEZONE_TOOL} from './atlas/catalog.js';
import {GUIDE_PAGES} from './external-guide/catalog.js';
const taskLinks=keys=>keys.map(key=>[GROUPS[key].panel+'/'+key,GROUPS[key].title,GROUPS[key].hint]);
const section=(id,name,hint,items)=>({id,name,hint,items});
const definitions={
 codec:[
  section('characters','字符与数字','ASCII、UTF-8、数字进制与字母编号',[
   ['basics','基础转换'],['basics/ascii','ASCII 转换'],['basics/radix','数字进制转换'],['basics/characters','字符与 UTF-8 字节'],['basics/letters','字母与数字（A1Z26）'],['roman','罗马数字转换'],['invisible','隐藏字符检查'],...taskLinks(['radix','charset'])]),
  section('encoding','通用与传输编码','Base 系列、网页转义与二进制封装',[
   ['encoding','编码转换'],['basics/escapes','转义与实体'],...taskLinks(['base','webencoding','binaryencoding'])]),
  section('communication','符号与通信编码','摩斯、盲文、敲击码与打孔纸带',[
   ['symbols','交互符号'],['tapcode','敲击码与坐标方阵'],['baudot','波多码与打孔纸带'],...taskLinks(['symbolic'])]),
  section('classical','古典密码与密码机','移位、替换、换位与转子密码',[
   ['crypto','加解密'],...taskLinks(['classical','machines'])]),
  section('modern','现代加密','对称、公钥加密与密钥对',taskLinks(['symmetric','publickey'])),
  section('authentication','签名、口令与密钥','签名、令牌、派生与证书',taskLinks(['signatures','credentials','derivation','certificates'])),
  section('cipher-analysis','密文识别与分析','自动识别、统计与单表替换求解',[
   ['analysis','密文分析与自动解码'],['substitution','单表替换求解'],...taskLinks(['statistics'])]),
  section('text-language','文字、语言与提取','整理、比较、汉字、查词与答案提取',[
   ['textlab','文字整理与提取'],['language','语言与文字变体'],['hanzi','汉字工具'],['words','查词与搜词'],['extract','答案提取'],...taskLinks(['clean','extract','compare','language'])]),
  section('formats','数据格式与排版','JSON、CSV、结构查询与图表',[
   ['datalab','格式与数据'],...taskLinks(['format','code','charts'])])
 ],
 reference:[
  section('sequences','数列与数学资料','按整数连续项或 A 编号主动联网查询 OEIS',[
   ['oeis','OEIS 数列在线查询']]),
  section('technical','IT 固定资料','端口、HTTP、文件格式与域名',[
   ['it-reference','IT 固定资料']]),
  section('world','国家、货币与交通','地区地图、国旗、货币、机场与港口',[
   ['countries','国家地区与国旗'],['currencies','货币代码资料'],['airports','机场代码'],['ports','港口与运输地点代码'],['placenames','国家地名在线查询']]),
  section('sky','天体目录与观测','深空天体、太阳系与升落',[
   ['sky','深空天体目录'],['astronomy','天文线索'],['simbad','SIMBAD 天体在线查询'],['vizier','VizieR 星表在线查询']]),
  section('matter','元素、物质与生命','元素、分子与生物资料',[
   ['chemistry','元素与化学线索'],['cod','COD 晶体在线查询'],['pubchem','PubChem 物质在线查询']]),
  section('language-reference','字词与诗文资料','公开字词原文、诗文作品、作者与韵部检索',[['zdic','汉典字词原文查询'],['cnkgraph','搜韵诗文与词谱在线查询']]),
  section('culture-reference','作品与专题百科','带版本与来源的专题百科文字检索',[['pokewiki','神奇宝贝百科在线查询']]),
  section('characters-reference','字符与信号对照','Unicode 字符表与海事信号旗',[
   ['unicode','Unicode 字符查询'],['marine','海事信号旗']]),
  section('colors','颜色与色名','连续色盘、颜色代码与名称',[['colors','颜色名称查询']]),
  section('calendar','日期与传统历法','农历、干支、生肖与节气',[['calendar','传统历法']]),
  section('music-reference','音乐作品资料','作曲家、作品与体裁',[]),
  section('geology','地质年代','年代时间带与 Ma 定位',[['geology','地质年代查询']]),
  section('traditions','八卦与塔罗','卦象、卦辞、牌组与牌面资料',[
   ['iching','八卦与六十四卦'],['tarot','塔罗牌查询']])
 ],
 media:[
  section('image','图像编辑与分析','调整、隐写、元数据、二维码与图片比较',[
   ['image','图片处理与隐写'],...taskLinks(['imageEdit','imageColour','imageInspect','imageMake'])]),
  section('fragments','碎片拼接','拼接、旋转、对齐与导出',[['fragments','碎片拼接台']]),
  section('files','文件、字节与压缩','识别、字节、压缩与哈希校验',[
   ['file','文件与压缩包'],['file/hex','十六进制编辑器'],...taskLinks(['inspect','compression','hashes'])]),
  section('audio','声音与音乐','频谱、音高、乐器、MIDI 与标签',[
   ['audio','音频与音乐'],['audio/signal','声音与频谱'],['audio/music','乐理与 MIDI'],['audio/play','乐器模拟'],...taskLinks(['audio'])]),
  section('video','视频与动画','帧、音轨、片段与 GIF',[
   ['video','视频处理'],...taskLinks(['media'])]),
  section('models','三维模型观察','模型导入、线框与截面',[['model','三维模型观察']])
 ],
 other:[
  section('boards','棋谱复盘','围棋、国际象棋与棋谱分支',[
   ['go','围棋棋谱复盘'],['chess','国际象棋复盘']]),
  section('logic','纸笔逻辑','网格题型、约束与答案提取',[['paper','纸笔解题']]),
  section('simulation','交互模拟','生命游戏、魔方与状态演示',[
   ['life','生命游戏'],['cube','魔方模拟']]),
  section('programming','代码与计算模型','代码运行、图灵机与单步执行',[
   ['code','代码运行'],['turing','图灵机']]),
  section('maths','数学计算','普通与科学计算器、整数因数验证',[
   ['qalculate','综合计算器'],['mathlab','数值工具'],...taskLinks(['maths','units'])]),
  section('unit-conversion','单位换算','按学科选择物理量、原单位与目标单位',[['unitconvert','单位换算',UNIT_DISCIPLINES.map(d=>d.title).join('、')]]),
  section('sequence-processing','生物序列处理','蛋白质表示、互补链与转写',[['sequence','蛋白质与核酸序列']]),
  section('coordinates-time','坐标与时间换算','坐标、距离、时间戳与时区',[
   ['coordinates','坐标与时间'],...taskLinks(['time'])]),
  section('network','网址与网络查询','网址解析、IP 表示与主动网络查询',[
   ['networklab','网络数据'],...taskLinks(['network'])]),
  section('pipeline','CyberChef 完整处理链','配方、分支、循环与保留操作',[['cyberchef','CyberChef 完整处理链']])
 ]
};
for(const task of PRACTICAL_TASKS)definitions.other.find(group=>group.id===task.group).items.push([task.id,task.title]);
for(const task of EXPANSION_TASKS){const group=Object.values(definitions).flat().find(g=>g.id===task.group);if(!group.items.some(([route])=>route===task.panel))group.items.push([task.panel,task.title]);}
for(const task of [...ATLAS_TOOLS,TIMEZONE_TOOL])definitions.reference.find(group=>group.id===task.group).items.push([task.id,task.title]);
// Learning groups follow the original subject categories instead of maintaining
// a second taxonomy. Function lessons themselves are registered from the cited content model.
definitions.knowledge=capabilityCategories.filter(category=>category.id!=='knowledge').map((category,index)=>
 section('learn-'+category.id,category.title+'知识','每项功能的具体规则、步骤、实例与原始依据',[[index?'knowledge/'+category.id:'knowledge',index?category.title+'知识':'科普阅读']]));
export const toolGroups = capabilityCategories.map(category=>({...category,
 sections:definitions[category.id],items:definitions[category.id].flatMap(item=>item.items)}));
const groupIcons={characters:'basics',encoding:'encoding',communication:'symbols',classical:'crypto',modern:'crypto',
 authentication:'crypto','cipher-analysis':'analysis','text-language':'textlab',formats:'datalab',world:'countries',sky:'astronomy',
 matter:'chemistry','characters-reference':'unicode',colors:'colors',calendar:'calendar',geology:'geology',traditions:'iching',
 technical:'it-reference',sequences:'mathlab','language-reference':'hanzi','culture-reference':'knowledge',image:'image',fragments:'fragments',files:'file',audio:'audio',video:'video',models:'model',boards:'go',
 logic:'paper',simulation:'life',programming:'code',maths:'mathlab','unit-conversion':'mathlab','sequence-processing':'sequence',
 'coordinates-time':'coordinates',network:'networklab',pipeline:'cyberchef',...Object.fromEntries(capabilityCategories.filter(category=>category.id!=='knowledge').map(category=>['learn-'+category.id,category.icon]))};
export const capabilityGroupDefinitions = toolGroups.flatMap(category=>category.sections.map(section=>({
 id:section.id,category:category.id,title:section.name,hint:section.hint,icon:groupIcons[section.id]
})));
// A root tool is registered once; subroutes stay searchable compatibility links.
export const toolPages = [...new Map(toolGroups.flatMap(group=>group.sections.flatMap(section=>
 section.items.filter(([route])=>!route.includes('/')).map(([route,title])=>
 [route,{route,title,group:group.id,where:section.name}])))).values()];
export const notebookViews=[{id:'notes',route:'notebook',title:'笔记'},{id:'mindmap',route:'notebook/mindmap',title:'思维导图'},{id:'whiteboard',route:'notebook/whiteboard',title:'线索白板'}];
export const notebookViewForRoute=path=>notebookViews.find(view=>view.route===path||view.id!=='notes'&&view.id===path);
export const sitePages=[{route:'home',title:'首页'},{route:'notebook',title:'笔记本',aliases:['笔记','脑图','思维导图','白板','线索白板','Excalidraw','Mind Elixir']},...GUIDE_PAGES,{route:'about',title:'关于'},{route:'settings',title:'设置'}];
