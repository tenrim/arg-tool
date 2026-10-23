import {capabilityCategories, capabilityGroupDefinitions, toolPages} from '../navigation.js';
import {getCatalogue, classifyCatalogue} from '../chef-tools/catalog.js';
import {operationName} from '../cyberchef-i18n.js';
import {TOOL_KEYWORDS, OPERATION_KEYWORDS, matchesSearch, searchText} from '../tool-search.js';
import {LANGUAGES} from '../coderunner/catalog.js';
import {TYPES} from '../round3/catalog.js';
import {ARTICLES,ARTICLE_ALIASES} from '../knowledge/content.js';
import {EXPANSION_TASKS} from '../expansion/catalog.js';
import {ATLAS_TOOLS,TIMEZONE_TOOL} from '../atlas/catalog.js';
import {rankCapabilities} from './search.js';
export {literalSearchEvidence} from './search.js';
import {PRACTICAL_TASKS} from '../practical/catalog.js';
import {UNIT_DISCIPLINES} from './unit-catalog.js';
import {CAPABILITY_TOPICS} from './topics.js';
import {CHAIN_ONLY_OPERATIONS} from './operation-policy.js';
import {consolidateTopics} from './topic-model.js';
// This registry is the canonical discovery index. Original route and operation
// IDs, argument schemas, engines and caller-owned input nodes stay unchanged.
export {capabilityCategories};
export const categories = capabilityCategories;

const groupDefinitions = capabilityGroupDefinitions;

const operationGroups = {
  charset: 'characters', radix: 'characters', base: 'encoding',
  webencoding: 'encoding', binaryencoding: 'encoding', symbolic: 'communication',
  classical: 'classical', machines: 'classical', symmetric: 'modern', publickey: 'modern',
  signatures: 'authentication', credentials: 'authentication', derivation: 'authentication',
  certificates: 'authentication', statistics: 'cipher-analysis', language: 'text-language',
  clean: 'text-language', extract: 'text-language', compare: 'text-language',
  format: 'formats', code: 'formats', charts: 'formats',
  imageEdit: 'image', imageColour: 'image', imageInspect: 'image', imageMake: 'image',
  hashes: 'files', compression: 'files', inspect: 'files', audio: 'audio', media: 'video',
  time: 'coordinates-time', network: 'network', maths: 'maths', units: 'maths', advanced: 'pipeline'
};

import {CHEF_OPERATION_PAIRS} from './operation-pairs.js';
export {CHEF_OPERATION_PAIRS} from './operation-pairs.js';

const nativeDefinitions = [
  ...PRACTICAL_TASKS.map(t=>[t.id,t.title,t.group,[t.id],'generic','',false,t.aliases]),
  ...UNIT_DISCIPLINES.map(d=>['units-'+d.id,d.title,'unit-conversion',['unitconvert'],'generic','',false,['单位换算',...d.aliases]]),
  ['qalculate','综合计算器','maths',['qalculate'],'generic','',false,['Qalculate','综合计算与单位换算','计算器','函数','复数','矩阵','微积分','方程','绘图','常数','RPN']],
  ['simbad','SIMBAD 天体在线查询','sky',['simbad'],'generic','',false,['SIMBAD','天体别名','恒星查询','ICRS','坐标检索']],
  ['vizier','VizieR 星表在线查询','sky',['vizier'],'generic','',false,['VizieR','星表','Hipparcos','天文目录','字段单位']],
  ['cod','COD 晶体在线查询','matter',['cod'],'generic','',false,['COD','晶体','COD CIF','在线晶体检索','空间群','晶胞','Crystallography Open Database']],
  ['pubchem','PubChem 物质在线查询','matter',['pubchem'],'generic','',false,['PubChem','CID','SMILES','InChI','化合物','分子式','同义词']],
  ['placenames','国家地名在线查询','world',['placenames'],'generic','',false,['国家地名信息库','民政部','地名来历','同名地名','同音地名','CGCS2000']],
  ['zdic','汉典字词原文查询','language-reference',['zdic'],'generic','',false,['汉典','zdic','字典','词典','字词释义']],
  ['cnkgraph','搜韵诗文与词谱在线查询','language-reference',['cnkgraph'],'generic','',false,['搜韵','知识图谱网','CNKGraph','诗文','作者','韵部','词谱']],
  ['pokewiki','神奇宝贝百科在线查询','culture-reference',['pokewiki'],'generic','',false,['52poke','宝可梦','神奇宝贝','Pokemon','皮卡丘','作品百科']],
  ['oeis', 'OEIS 数列在线查询', 'sequences', ['oeis'], 'generic', '', false, ['OEIS', '整数序列', '数列', 'A编号', 'A000045', '斐波那契', 'Fibonacci', 'integer sequences', '在线数列查询']],
  ['hex-editor', '十六进制编辑器', 'files', ['file'], 'generic', '', false, ['hex editor', '编辑字节', '二进制编辑', '修改文件头', 'ASCII搜索', '偏移', '撤销重做']],
  ['it-ports', '端口与网络协议资料', 'technical', ['it-reference'], 'generic', '', false, ['IANA', 'TCP', 'UDP', '服务端口', '80', '443', 'protocol number']],
  ['it-http', 'HTTP 状态与字段资料', 'technical', ['it-reference'], 'generic', '', false, ['状态码', '404', '请求头', '响应头', 'HTTP headers', 'Content-Type']],
  ['it-formats', 'MIME 与字符集资料', 'technical', ['it-reference'], 'generic', '', false, ['文件类型', '扩展名', 'charset', 'UTF-8', 'GBK', 'application/json']],
  ['it-domains', '域名与公共后缀资料', 'technical', ['it-reference'], 'generic', '', false, ['PSL', '注册域', '顶级域', 'TLD', 'IDN', 'co.uk', '公共后缀']],
  ['ascii', 'ASCII 文本与数字', 'characters', ['basics'], 'convert', 'ascii', true, ['字符转数字', '数字转字母', 'ASCII表', '控制字符']],
  ['utf8', 'UTF-8 字节与文字', 'characters', ['basics'], 'convert', 'utf8', true, ['文字转字节', '中文编码', 'UTF8', 'UTF-8']],
  ['a1z26', '字母与数字 A1Z26', 'characters', ['basics'], 'convert', 'a1z26', true, ['A=1', '字母序号', '数字转字母', 'A1Z26']],
  ['radix', '数字进制转换', 'characters', ['basics'], 'convert', '', true, ['二进制', '八进制', '十进制', '十六进制', '2–36进制', 'binary', 'hex']],
  ['roman', '罗马数字转换', 'characters', ['roman'], 'convert', 'roman', true, ['Roman numerals', 'IV', 'XIV', '罗马数']],
  ['invisible', '隐藏字符检查', 'characters', ['invisible'], 'convert', '', false, ['零宽字符', '不可见字符', 'BOM', '空格', 'zero width', '方向控制符']],
  ['morse', '摩斯点划录入', 'communication', ['symbols'], 'generic', '', false, ['Morse', '摩尔斯', '点划', '长短音']],
  ['braille', '六点盲文录入', 'communication', ['symbols'], 'generic', '', false, ['Braille', '盲文点位', '点字']],
  ['semaphore', '双旗旗语录入', 'communication', ['symbols'], 'generic', '', false, ['Semaphore', '旗语', '两个方向']],
  ['pigpen', '猪圈密码录入', 'communication', ['symbols'], 'generic', '', false, ['Pigpen', '九宫格密码', '图形字母']],
  ['seven-segment', '七段数码管录入', 'communication', ['symbols'], 'generic', '', false, ['七段', '电子数字', '数码管']],
  ['tapcode', '敲击码与坐标方阵', 'communication', ['tapcode'], 'generic', '', true, ['Tap code', 'Polybius', '波利比奥斯', '敲门', '5×5', '行列坐标']],
  ['baudot', '波多码与打孔纸带', 'communication', ['baudot'], 'generic', '', true, ['Baudot', 'ITA2', '五位码', '打孔纸带', '电传']],
  ['substitution', '单表替换求解', 'cipher-analysis', ['substitution'], 'generic', '', false, ['quipqiup', 'quipquip', '单表替换', '字母替换求解', 'substitution']],
  ['cipher-detect', '密文智能识别', 'cipher-analysis', ['analysis'], 'generic', '', false, ['不知道是什么密码', '自动分析', '自动解码', '密文格式']],
  ['extract-position', '按位置提取答案', 'text-language', ['extract'], 'generic', '', false, ['取第几个字', '首字母', '尾字母', '索引提取']],
  ['hanzi', '汉字属性与读音', 'text-language', ['hanzi'], 'generic', '', false, ['拼音', '笔画', '部首', '笔顺', '拆字', '汉字读音']],
  ['hanzi-code', '汉字编码与反查', 'text-language', ['hanzi'], 'generic', '', false, ['四角', '五笔', '仓颉', '电报码', '部件', '拼音反查']],
  ['words', '查词与字母重排', 'text-language', ['words'], 'generic', '', false, ['anagram', '通配符', '英文查词', '中文查词', '变位词']],
  ['word-grid', '网格搜词', 'text-language', ['words'], 'generic', '', false, ['word search', '字母矩阵', '搜词网格']],
  ['countries', '国家地区与国旗', 'world', ['countries'], 'world', 'world', false, ['世界地图', 'country', 'flag', '国名', '国家代码']],
  ['currencies', '货币代码', 'world', ['currencies'], 'world', 'world', false, ['ISO 4217', 'currency', '人民币', 'USD', 'CNY']],
  ['airports', '机场代码', 'world', ['airports'], 'world', 'world', false, ['IATA', 'ICAO', 'airport', '三字码', '四字码']],
  ['ports', '港口与运输地点代码', 'world', ['ports'], 'world', 'world', false, ['UN/LOCODE', 'port', '港口代码', '运输地点']],
  ['sky', '深空天体目录', 'sky', ['sky'], 'generic', '', false, ['Messier', 'NGC', 'IC', '星座', '星云', '深空']],
  ['astronomy', '天体位置与升落', 'sky', ['astronomy'], 'generic', '', false, ['天文', '日出日落', '月相', '火星', '方位角', '高度角']],
  ['chemistry', '元素周期表与化学线索', 'matter', ['chemistry'], 'generic', '', false, ['periodic table', '元素符号', '原子序数', '分子式', 'SMILES']],
  ['sequence', '氨基酸与密码子对照', 'matter', ['sequence'], 'generic', '', false, ['DNA', 'RNA', '氨基酸', '密码子', '标准密码表']],
  ['unicode', 'Unicode 字符表', 'characters-reference', ['unicode'], 'generic', '', false, ['码点', '字符查询', 'U+', 'Unicode block', '字符区段']],
  ['marine', '海事信号旗', 'characters-reference', ['marine'], 'generic', '', false, ['ICS', 'signal flags', '信号旗', '船旗', '国际信号旗']],
  ['colors', '自由色盘与颜色名称', 'colors', ['colors'], 'generic', '', false, ['color picker', 'colour', '色名', '色盘', 'HEX', 'RGB', 'HSL']],
  ['calendar', '传统历法查询', 'calendar', ['calendar'], 'generic', '', false, ['农历', '干支', '生肖', '节气', '阴历', 'lunar calendar']],
  ['geology', '地质年代时间带', 'geology', ['geology'], 'generic', '', false, ['地质年代表', 'Ma', '纪', '世', '寒武纪', 'Jurassic']],
  ['iching', '八卦与六十四卦', 'traditions', ['iching'], 'generic', '', false, ['I Ching', '易经', '卦象', '先天', '后天', '上下卦']],
  ['tarot', '塔罗牌组与牌面', 'traditions', ['tarot'], 'generic', '', false, ['Tarot', '大阿尔卡那', '小阿尔卡那', '牌面', '花色']],
  ['image', '图片预览与编辑', 'image', ['image'], 'image', 'image', false, ['旋转图片', '裁剪图片', '调整尺寸', '图片编辑']],
  ['image-steg', '图片隐写提取', 'image', ['image'], 'image', '', false, ['StegOnline', 'LSB', '隐写', '通道', '低位提取']],
  ['image-compare', '图片比较与差值', 'image', ['image'], 'image', '', false, ['图片差异', '异或图片', '差值']],
  ['image-qr', '二维码识别与修复', 'image', ['image'], 'image', '', false, ['QR code', '二维码矩阵', '二维码修复', '破损二维码', '修补']],
  ['image-stereo', '立体图隐藏轮廓', 'image', ['image'], 'image', '', false, ['Magic Eye', '随机点立体图', '立体图解码']],
  ['fragments', '碎片拼接台', 'fragments', ['fragments'], 'generic', '', false, ['拼图', '图像碎片', '拼接', '对齐', '旋转碎片']],
  ['file', '文件识别与字节查看', 'files', ['file'], 'generic', '', false, ['文件头', '十六进制编辑', '压缩包目录', 'hex viewer', 'ZIP']],
  ['audio-spectrum', '声音频谱与线索分析', 'audio', ['audio'], 'generic', '', false, ['声谱图', 'spectrogram', 'DTMF', 'SSTV', '频谱']],
  ['audio-music', '音高与乐理', 'audio', ['audio'], 'generic', '', false, ['音高检测', '音阶', '音程', '和弦', '乐理']],
  ['video', '指定时刻视频帧', 'video', ['video'], 'generic', '', false, ['单帧', '视频截图', '指定时间抽帧']],
  ['model', '三维模型观察', 'models', ['model'], 'generic', '', false, ['STL', 'OBJ', 'GLTF', '3D', '线框', '截面', 'CIF', '晶体结构', '晶体', '晶胞', '分数坐标']],
  ['go', '围棋棋谱复盘', 'boards', ['go'], 'generic', '', false, ['SGF', '围棋', '棋谱分支', 'go game']],
  ['chess', '国际象棋棋谱复盘', 'boards', ['chess'], 'generic', '', false, ['PGN', 'FEN', 'chess', '国际象棋']],
  ['paper', '标准数独求解', 'logic', ['paper'], 'generic', '', false, ['Sudoku', '数独', '网格逻辑']],
  ['cube', '魔方观察', 'simulation', ['cube'], 'generic', '', false, ['Rubik', '转动公式', '异形魔方', '二阶魔方', '高阶魔方', '五魔方', '金字塔魔方', '二维展开图']],
  ['life', '生命游戏', 'simulation', ['life'], 'life', 'life', false, ['Game of Life', '细胞自动机', 'RLE', '生命游戏']],
  ['code', 'Brainfuck 代码运行', 'programming', ['code'], 'generic', '', false, ['Brainfuck', 'BF', '偏门语言', '解释器']],
  ['turing', '图灵机', 'programming', ['turing'], 'generic', '', false, ['Turing machine', '纸带', '状态转移', '单步运行']],
  ['sequence-processing', '蛋白质与核酸序列转换', 'sequence-processing', ['sequence'], 'generic', '', false, ['DNA', 'RNA', 'FASTA', '互补链', '反向互补', '转写', '阅读框', '氨基酸三字母']],
  ['coordinates', '坐标与时间', 'coordinates-time', ['coordinates'], 'generic', '', false, ['经纬度', '时区', 'UNIX时间戳', '距离', '坐标转换', 'Geohash', 'MGRS', 'UTM', '儒略日', 'JD', 'MJD']],
  ['cyberchef', '完整 CyberChef 配方工作区', 'pipeline', ['cyberchef'], 'generic', '', false, ['CyberChef', '完整操作目录', '处理链', 'recipe', '配方', 'Fork', 'Merge', 'Subsection', 'Register', 'Conditional Jump', 'Label', 'Jump', 'Sleep', 'Return', 'Comment']],
  ['codepoint', 'Unicode 码点与文字', 'characters', ['basics'], 'convert', '', true, ['字符码', '码位', 'Unicode scalar', 'U+']],
  ['polybius', 'Polybius 坐标方阵', 'communication', ['tapcode'], 'generic', '', true, ['波利比奥斯', '行列密码', '5×5', '6×6', '关键词方阵']],
  ['invisible-clean', '隐藏字符清理', 'characters', ['invisible'], 'convert', '', false, ['删除零宽字符', '清理特殊空白', '去除不可见字符']],
  ['hanzi-pinyin', '拼音、声母与声调', 'text-language', ['hanzi'], 'generic', '', false, ['拼音首字母', '韵母', '声调', '汉字读音']],
  ['hanzi-simplified', '汉字转简体', 'text-language', ['hanzi'], 'generic', '', false, ['简体', 'OpenCC', '繁转简']],
  ['hanzi-traditional', '汉字转繁体', 'text-language', ['hanzi'], 'generic', '', false, ['繁体', 'OpenCC', '简转繁']],
  ['hanzi-sound', '按拼音反查汉字', 'text-language', ['hanzi'], 'generic', '', false, ['读音查汉字', 'shan3']],
  ['hanzi-stroke', '按笔画反查汉字', 'text-language', ['hanzi'], 'generic', '', false, ['笔画数查字', '几笔的字']],
  ['hanzi-component', '按部件反查汉字', 'text-language', ['hanzi'], 'generic', '', false, ['拆字', '木日', '部件组合']],
  ['hanzi-idiom', '成语查询', 'text-language', ['hanzi'], 'generic', '', false, ['成语通配', '五?十?', '四字成语']],
  ['hanzi-xhy', '歇后语查询', 'text-language', ['hanzi'], 'generic', '', false, ['歇后语', '后半句']],
  ['hanzi-cangjie', '仓颉编码反查', 'text-language', ['hanzi'], 'generic', '', false, ['Cangjie', '仓颉码', '完整码']],
  ['hanzi-wubi', '五笔编码反查', 'text-language', ['hanzi'], 'generic', '', false, ['Wubi', '五笔86', '五笔98', '编码前缀']],
  ['hanzi-telegraph', '汉字电报码双向转换', 'text-language', ['hanzi'], 'generic', '', true, ['四位电报码', '大陆电码', '台湾电码', 'telegraph code', '汉字转电报码', '电报码反查汉字', '四位数字查汉字', '电报码解码']],
  ['words-wildcard', '通配符与重复字型查词', 'text-language', ['words'], 'generic', '', false, ['#a##le', '重复字母模式', 'wildcard']],
  ['words-letters', '使用给定字母组词', 'text-language', ['words'], 'generic', '', false, ['letter bank', '给定字母', '字母库存']],
  ['words-regex', '正则表达式查词', 'text-language', ['words'], 'generic', '', false, ['regex dictionary', '模式查词']],
  ['words-fuzzy', '相似词查询', 'text-language', ['words'], 'generic', '', false, ['模糊查词', '编辑距离', 'fuzzy word']],
  ['words-chinese', '中文查词', 'text-language', ['words'], 'generic', '', false, ['中文词典', '汉语词语', '中文字型']],
  ['word-boggle', '相邻格转弯搜词', 'text-language', ['words'], 'generic', '', false, ['Boggle', '相邻字母', '转弯网格']],
  ['extract-first', '每行首字提取', 'text-language', ['extract'], 'generic', '', false, ['首字母', '藏头', 'acrostic']],
  ['extract-last', '每行末字提取', 'text-language', ['extract'], 'generic', '', false, ['末字母', '藏尾']],
  ['extract-indices', '按每行索引提取', 'text-language', ['extract'], 'generic', '', false, ['逐行索引', '不同编号']],
  ['extract-transpose', '文字行列转置', 'text-language', ['extract'], 'generic', '', false, ['竖读', '转置', '行列互换']],
  ['image-planes', '位平面与图层浏览', 'image', ['image'], 'image', '', false, ['AperiSolve', 'RGB图层', '位平面', '重映射']],
  ['image-color', '像素取色与色值', 'image', ['image'], 'image', '', false, ['图片取色', '像素坐标', '取色器']],
  ['image-exif', '图片 EXIF / XMP / IPTC 信息', 'image', ['image'], 'image', '', false, ['图片元数据', '拍摄地点', '相机信息']],
  ['image-png', 'PNG 数据块检查', 'image', ['image'], 'image', '', false, ['PNG chunk', '附加数据', '数据块']],
  ['image-barcode', '二维码与条形码识别', 'image', ['image'], 'image', '', false, ['ZXing', '二维码识别', '条码', '条形码']],
  ['audio-sstv', 'SSTV 声音还原图片', 'audio', ['audio'], 'generic', '', false, ['慢扫描电视', 'SSTV', '声音转图片']],
  ['audio-play', '乐器弹奏与 MIDI', 'audio', ['audio'], 'generic', '', false, ['钢琴', 'piano', 'MIDI', '乐器模拟', '旋律']],
  ['video-animation', 'GIF 与 APNG 逐帧分析', 'video', ['video'], 'generic', '', false, ['精灵图', 'sprite sheet', 'GIF帧', 'APNG', '动画逐帧', '动画切片']],
  ['video-frames', '视频连续帧提取', 'video', ['video'], 'generic', '', false, ['抽帧', '多帧', '逐帧']],
  ['video-audio', '视频音轨提取', 'video', ['video'], 'generic', '', false, ['视频转WAV', '提取声音', '音轨']],
  ['video-reverse', '视频片段倒放', 'video', ['video'], 'generic', '', false, ['反向播放', 'reverse video']],
  ['video-gif', '视频片段转 GIF', 'video', ['video'], 'generic', '', false, ['动画导出', '视频转GIF']],
  ['video-native', '媒体格式转换', 'video', ['video'], 'generic', '', false, ['FFmpeg', '滤镜', '转码', '轨道映射', '完整核心能力', '原生命令']],
  ['escape-hex', '反斜杠十六进制转义', 'encoding', ['basics'], 'convert', '', true, ['\\x', '字符串转义', 'hex escape']],
  ['escape-unicode', 'Unicode 转义与还原', 'encoding', ['basics'], 'convert', '', true, ['\\u', 'Unicode escape', 'Unicode反转义']],
  ['escape-html', 'HTML 实体与文字', 'encoding', ['basics'], 'convert', '', true, ['字符实体', '&#', 'HTML entity']],
  ['escape-url', 'URL 百分号编码', 'encoding', ['basics'], 'convert', '', true, ['percent encode', '%E4', 'URL解码']],
  ['chemistry-formula', '摩尔质量与分子式', 'matter', ['chemistry'], 'generic', '', false, ['摩尔质量','molar mass','原子计数','Ca(OH)2', '分子量', '化学式','结晶水','质量占比']],
  ['chemistry-molecule', 'SMILES 分子结构', 'matter', ['chemistry'], 'generic', '', false, ['RDKit', 'SMILES', '二维分子图', 'CCO']]
];
for(const [id,language] of Object.entries(LANGUAGES)) {
  if(id!=='brainfuck')nativeDefinitions.push(['code-'+id,language.name+' 代码运行','programming',['code'],'generic','',false,[id,language.name,language.ext,language.group]]);
}
for(const [id,puzzle] of Object.entries(TYPES)) {
  if(id!=='sudoku')nativeDefinitions.push(['paper-'+id,puzzle.name+' 求解','logic',['paper'],'generic','',false,[id,puzzle.name]]);
}

const representativePreferences = {
  sequences: ['native:oeis'],
  'language-reference':['native:zdic','native:cnkgraph'],
  'culture-reference':['native:pokewiki'],
  characters: ['native:ascii', 'native:utf8', 'native:radix', 'native:a1z26', 'native:invisible'],
  encoding: ['pair:To%20Base64', 'native:escape-url', 'native:escape-html', 'pair:To%20COBS'],
  communication: ['native:morse', 'native:braille', 'native:semaphore', 'native:tapcode', 'native:baudot'],
  classical: ['op:ROT13', 'pair:Vigen%C3%A8re%20Encode', 'pair:Rail%20Fence%20Cipher%20Encode', 'op:Enigma'],
  modern: ['pair:AES%20Encrypt', 'pair:RSA%20Encrypt', 'op:ChaCha', 'op:Generate%20RSA%20Key%20Pair'],
  authentication: ['op:RSA%20Sign', 'op:JWT%20Decode', 'op:Derive%20PBKDF2%20key', 'op:Parse%20X.509%20certificate'],
  'cipher-analysis': ['native:cipher-detect', 'native:substitution', 'op:Frequency%20distribution', 'op:Index%20of%20Coincidence'],
  'text-language': ['native:extract-position', 'native:hanzi', 'native:hanzi-code', 'native:words', 'op:Diff'],
  formats: ['pair:CSV%20to%20JSON', 'op:JSON%20Beautify', 'op:XPath%20expression', 'op:Heatmap%20chart'],
  world: ['native:countries', 'native:currencies', 'native:airports', 'native:ports'],
  sky: ['native:sky', 'native:astronomy','native:simbad','native:vizier'], matter: ['native:chemistry', 'native:sequence','native:cod','native:pubchem'],
  'characters-reference': ['native:unicode', 'native:marine'], colors: ['native:colors'], calendar: ['native:calendar'],
  geology: ['native:geology'], traditions: ['native:iching', 'native:tarot'],
  technical: ['native:it-ports', 'native:it-http', 'native:it-formats', 'native:it-domains'],
  image: ['native:image', 'native:image-steg', 'native:image-qr', 'native:image-compare', 'op:Extract%20EXIF'],
  fragments: ['native:fragments'], files: ['native:hex-editor', 'op:Detect%20File%20Type', 'op:Unzip', 'op:SHA2', 'op:MD5'],
  audio: ['native:audio-spectrum', 'native:audio-sstv', 'native:audio-music', 'native:audio-play', 'op:Extract%20Audio%20Metadata'],
  video: ['native:video', 'op:Play%20Media'], models: ['native:model'], boards: ['native:go', 'native:chess'],
  logic: ['native:paper','native:paper-slitherlink','native:paper-nurikabe','native:paper-akari'],
  simulation: ['native:life', 'native:cube'], programming: ['native:code','native:code-python','native:code-whitespace','native:code-sql','native:turing'],
  maths: ['op:Modular%20Inverse', 'op:Set%20Intersection', 'op:Convert%20distance', 'op:Pseudo-Random%20Integer%20Generator'],
  'sequence-processing': ['native:sequence-processing'],
  'coordinates-time': ['native:coordinates', 'pair:To%20UNIX%20Timestamp', 'op:Haversine%20distance'],
  network: ['op:Parse%20URI', 'op:Change%20IP%20format', 'op:Parse%20TCP', 'op:JA3%20Fingerprint'],
  pipeline: ['native:cyberchef']
};

const playerAliases = {
  characters: ['数字转字母', '文字变数字', '字符编码'], encoding: ['解码', '编码', '一串乱码'],
  communication: ['符号转字母', '点划线索', '图形密码'], classical: ['字母密码', '古典加密'],
  modern: ['加密文件', '解密', '密钥'], authentication: ['验签', '口令', '证书'],
  'cipher-analysis': ['不知道是什么密码', '识别密文', '自动破解'],
  'text-language': ['整理文字', '查字', '提取答案'], formats: ['转换格式', '整理数据'],
  image: ['处理图片', '看隐藏内容'], files: ['分析文件', '解压文件', '校验文件'],
  network: ['分析网址', '网络包'], 'coordinates-time': ['日期转换', '位置转换']
};

const control = (selector, value, event = 'change') => ({selector, value, event});
const nativeTargets = {
  ...Object.fromEntries(PRACTICAL_TASKS.map(t=>[t.id,{route:t.id}])),
  ...Object.fromEntries(UNIT_DISCIPLINES.map(d=>['units-'+d.id,{route:'unitconvert',controls:[control('#unit-discipline',d.id)]}])),
  qalculate:{route:'qalculate'},
  oeis: {route:'oeis'},
  simbad:{route:'simbad'},vizier:{route:'vizier'},cod:{route:'cod'},pubchem:{route:'pubchem'},placenames:{route:'placenames'},
  zdic:{route:'zdic'},cnkgraph:{route:'cnkgraph'},pokewiki:{route:'pokewiki'},
  'hex-editor': {route:'file',slice:'hex'},
  ...Object.fromEntries(['ports','http','formats','domains'].map(kind=>['it-'+kind,{route:'it-reference',slice:kind}])),
  ascii: {route:'basics/ascii'},
  utf8: {route:'basics/characters',controls:[control('#basics-format','hex')]},
  a1z26: {route:'basics/letters'},
  radix: {route:'basics/radix'},
  roman: {route:'roman'}, invisible: {route:'invisible',controls:[control('#invisible-action','inspect')]},
  morse: {route:'symbols',slice:'morse',anchor:'#morse-entry'},
  braille: {route:'symbols',slice:'braille',anchor:'#braille-dots'},
  semaphore: {route:'symbols',slice:'semaphore',anchor:'#semaphore-pad'},
  pigpen: {route:'symbols',slice:'pigpen',anchor:'#pigpen-keys'},
  'seven-segment': {route:'symbols',slice:'seven',anchor:'#seven-segments'},
  tapcode: {route:'tapcode',controls:[control('#tapcode-mode','tap')]},
  baudot: {route:'baudot'}, substitution:{route:'substitution'}, 'cipher-detect':{route:'analysis'},
  'extract-position': {route:'extract',controls:[control('#extract-mode','index')]},
  hanzi: {route:'hanzi',controls:[control('#hanzi-mode','info','input')]},
  'hanzi-code': {route:'hanzi',controls:[control('#hanzi-mode','four','input')]},
  words: {route:'words',controls:[control('[data-word-tab="english"]',undefined,'click'),control('#word-mode','anagram')]},
  'word-grid': {route:'words',controls:[control('[data-word-tab="grid"]',undefined,'click')]},
  'text-extract': {route:'textlab'}, 'data-format':{route:'datalab'}, classical:{route:'crypto/classical'},
  countries:{route:'countries'}, currencies:{route:'currencies'}, airports:{route:'airports'}, ports:{route:'ports'},
  sky:{route:'sky'}, astronomy:{route:'astronomy'}, chemistry:{route:'chemistry'},
  sequence:{route:'sequence',controls:[control('#seq-type','aa','input')]},
  unicode:{route:'unicode'},marine:{route:'marine'}, colors:{route:'colors'},calendar:{route:'calendar'},
  geology:{route:'geology'},iching:{route:'iching'},tarot:{route:'tarot'},
  image:{route:'image',tab:{panel:'image',id:'analysis'},engine:'basic',slice:'preview'},
  'image-steg':{route:'image',tab:{panel:'image',id:'analysis'},engine:'steg',slice:'extract'},
  'image-compare':{route:'image',tab:{panel:'image',id:'compare'},slice:'compare'},
  'image-qr':{route:'image',tab:{panel:'image',id:'repair'}},
  'image-stereo':{route:'image',tab:{panel:'image',id:'analysis'},engine:'basic',slice:'stereo',anchor:'#stereo-shift'},
  fragments:{route:'fragments'},file:{route:'file',slice:'preview',anchor:'#file-stats'},
  'audio-spectrum':{route:'audio/signal',tab:{panel:'audio',id:'signal'},slice:'spectrum'},
  'audio-music':{route:'audio/music',tab:{panel:'audio',id:'music'}},
  video:{route:'video',controls:[control('#video-mode','frame','input')]},model:{route:'model'},go:{route:'go'},chess:{route:'chess'},paper:{route:'paper',controls:[control('#paper-type','sudoku')]},
  cube:{route:'cube'},life:{route:'life'},code:{route:'code',controls:[control('#code-language','brainfuck')]},turing:{route:'turing'},mathlab:{route:'mathlab'},
  'sequence-processing':{route:'sequence'},coordinates:{route:'coordinates'},networklab:{route:'networklab'},cyberchef:{route:'cyberchef'}
};
Object.assign(nativeTargets,{
  codepoint:{route:'basics/characters',controls:[control('#basics-format','codepoint')]},
  polybius:{route:'tapcode',controls:[control('#tapcode-mode','polybius')]},
  'invisible-clean':{route:'invisible',controls:[control('#invisible-action','clean')]},
  'image-planes':{route:'image',tab:{panel:'image',id:'analysis'},engine:'aperi',slice:'planes'},
  'image-color':{route:'image',tab:{panel:'image',id:'compare'},slice:'color'},
  'image-exif':{route:'image',tab:{panel:'image',id:'analysis'},engine:'inspect',imageAction:'image-exif'},
  'image-png':{route:'image',tab:{panel:'image',id:'analysis'},engine:'inspect',imageAction:'image-png'},
  'image-barcode':{route:'image',tab:{panel:'image',id:'analysis'},engine:'inspect',imageAction:'barcode-read'},
  'audio-sstv':{route:'audio/signal',tab:{panel:'audio',id:'signal'},slice:'sstv',anchor:'#sstv-run'},
  'audio-play':{route:'audio/play',tab:{panel:'audio',id:'play'}}
});
for(const [id,format] of Object.entries({hex:'hex',unicode:'unicode',html:'html',url:'url'})) {
  nativeTargets['escape-'+id]={route:'basics/escapes',controls:[control('#basics-format',format)]};
}
nativeTargets['chemistry-formula']={route:'chemistry',controls:[control('#chem-mode','formula','input')]};
nativeTargets['chemistry-molecule']={route:'chemistry',controls:[control('#chem-mode','molecule','input')]};
nativeTargets['video-native']={route:'video',controls:[control('#video-mode','native','input')]};
for(const id of Object.keys(LANGUAGES)) {
  if(id!=='brainfuck')nativeTargets['code-'+id]={route:'code',controls:[control('#code-language',id)]};
}
for(const id of Object.keys(TYPES)) {
  if(id!=='sudoku')nativeTargets['paper-'+id]={route:'paper',controls:[control('#paper-type',id)]};
}
for(const [suffix,value] of Object.entries({pinyin:'pinyin',simplified:'simplified',traditional:'traditional',
 sound:'sound',stroke:'stroke',component:'component',idiom:'idiom',xhy:'xhy',cangjie:'cangjie',wubi:'wubi',
 telegraph:'tele-encode','telegraph-decode':'tele-decode'})) {
  nativeTargets['hanzi-'+suffix]={route:'hanzi',controls:[control('#hanzi-mode',value,'input')]};
}
for(const [suffix,value] of Object.entries({wildcard:'wildcard',letters:'letters',regex:'regex',fuzzy:'fuzzy'})) {
  nativeTargets['words-'+suffix]={route:'words',controls:[control('[data-word-tab="english"]',undefined,'click'),control('#word-mode',value)]};
}
nativeTargets['words-chinese']={route:'words',controls:[control('[data-word-tab="chinese"]',undefined,'click')]};
nativeTargets['word-boggle']={route:'words',controls:[control('[data-word-tab="grid"]',undefined,'click'),control('#word-grid-mode','boggle')]};
nativeTargets['word-grid'].controls.push(control('#word-grid-mode','straight'));
for(const mode of ['first','last','indices','transpose']) {
  nativeTargets['extract-'+mode]={route:'extract',controls:[control('#extract-mode',mode)]};
}
for(const mode of ['frames','audio','reverse','gif','animation']) {
  nativeTargets['video-'+mode]={route:'video',controls:[control('#video-mode',mode,'input')]};
}

for(const task of EXPANSION_TASKS){nativeDefinitions.push([task.id,task.title,task.group,[task.panel],'generic','',!!task.directions,task.aliases||[]]);nativeTargets[task.id]={route:task.panel,controls:task.controls||[],...(task.directions?{nativeDirections:task.directions}:{})};}
for(const task of [...ATLAS_TOOLS,TIMEZONE_TOOL]){nativeDefinitions.push([task.id,task.title,task.group,[task.id],'generic','',false,task.aliases]);nativeTargets[task.id]={route:task.id,controls:[]};}

function normalizeCatalogue(catalogue) {
  if (!catalogue || !catalogue.operations || Array.isArray(catalogue.operations)) {
    throw new TypeError('createRegistry requires the real CyberChef catalogue');
  }
  const classified = classifyCatalogue(catalogue);
  return {
    tools: toolPages.map(tool=>({...tool,id:tool.route})),
    operations: classified.map(entry=>({...entry,id:entry.op,name:operationName(entry.op)}))
  };
}

function operationTarget(operation) {
  const recipe = ['chain','retained'].includes(operation.mode);
  if (recipe) return {kind:'recipe',panel:'cyberchef',route:'cyberchef',operation:operation.op,sourceMode:operation.mode};
  if (operation.mode === 'existing') return {kind:'native',panel:'file',route:'file',slice:'archive',anchor:'#archive-list',sourceMode:operation.mode};
  return {kind:'operation',panel:operation.panel,route:`${operation.panel}/${operation.group}`,
    operation:operation.op,group:operation.group,sourceMode:operation.mode};
}

function pairedTitle(first, second) {
  if (first.op === 'To Base64') return 'Base64 编码与解码';
  if (first.op === 'Encode text') return '字符集编码与解码';
  if (first.op === 'To Case Insensitive Regex') return '大小写不敏感正则转换';
  if (first.op === 'PGP Encrypt and Sign') return 'PGP 加密签名与解密验签';
  const a = first.name.replace(/编码$|加密$|压缩$|签名$/, '').trim();
  const b = second.name.replace(/解码$|解密$|解压$/, '').trim();
  if (a === b) {
    if (/ Encrypt$/.test(first.op)) return `${a} 加密与解密`;
    if (/ Compress$/.test(first.op)) return `${a} 压缩与解压`;
    return `${a} 编码与解码`;
  }
  return `${first.name} ⇄ ${second.name}`;
}

export function createRegistry(catalogue) {
  catalogue = normalizeCatalogue(catalogue);
  const groupMap = new Map(groupDefinitions.map(group => [group.id, group]));
  const toolMap = new Map(catalogue.tools.map(tool => [tool.id, tool]));
  const operationMap = new Map(catalogue.operations.map(op => [op.id, op]));
  let entries = [];
  const usedOperations = new Set();
  const add = entry => {
    const group = groupMap.get(entry.group);
    if (!group) throw new Error(`Unknown capability group: ${entry.group}`);
    const aliases = [...new Set([entry.title, ...(entry.aliases || []), ...(playerAliases[entry.group] || []),
      ...entry.sourceOperationIds, ...entry.sourceToolIds.flatMap(id => {
        const source = toolMap.get(id);
        return source ? [source.title, TOOL_KEYWORDS[id] || ''] : [];
      }), ...entry.sourceOperationIds.map(id=>OPERATION_KEYWORDS[id] || '')])];
    entries.push({ ...entry, category: group.category, aliases });
  };

  for (const [id, title, group, sourceToolIds, workspace, sample, reversible, aliases] of nativeDefinitions) {
    // Omit an absent source instead of inventing a future tool in this inventory.
    if (!sourceToolIds.every(source => toolMap.has(source))) continue;
    const reference = groupMap.get(group).category === 'reference';
    const type = reference ? 'reference' : groupMap.get(group).category === 'media' ? 'media'
      : ['boards', 'simulation', 'programming'].includes(group) ? 'simulation'
        : groupMap.get(group).category === 'other' ? 'utility' : 'transform';
    const explicitOperations = ({a1z26:['A1Z26 Cipher Encode','A1Z26 Cipher Decode'],
      'escape-hex':['Escape string','Unescape string'],
      'escape-unicode':['Escape Unicode Characters','Unescape Unicode Characters'],
      'escape-html':['To HTML Entity','From HTML Entity'],
      'escape-url':['URL Encode','URL Decode']}[id] || []).filter(op=>operationMap.has(op));
    const target = nativeTargets[id];
    if (!target) throw new Error(`Missing native capability destination: ${id}`);
    const panel = target.route.split('/')[0];
    const open = {kind:'native',panel,controls:[],...target,
      ...(explicitOperations.length ? {operationControls:explicitOperations.map((op,index)=>({op,
        controls:[control('#basics-direction',index===0?'encode':'decode')]
      }))} : {})};
    if (id === 'hanzi-telegraph') open.nativeDirections = [
      {id:'encode',label:'汉字 → 电报码',aliases:['汉字转电报码','电报码编码'],controls:[control('#hanzi-mode','tele-encode','input')]},
      {id:'decode',label:'电报码 → 汉字',aliases:['电报码反查汉字','四位数字查汉字','电报码解码'],controls:[control('#hanzi-mode','tele-decode','input')]}
    ];
    add({ id: `native:${id}`, title, group, sourceToolIds: [...sourceToolIds], sourceOperationIds: explicitOperations,
      aliases, workspace:reference ? group : workspace, reversible, type, mode:'native',route:target.route,panel,open,
      ...(workspace === 'world' ? { mode: id } : {}),
      ...(explicitOperations.length ? {
        sourceModes: explicitOperations.map(op => operationMap.get(op).mode),
        directions: explicitOperations.map(op => ({ label: operationMap.get(op).name, operationId: op, op }))
      } : {}),
      tip: toolMap.get(sourceToolIds[0]).tip || '' });
    explicitOperations.forEach(op => usedOperations.add(op));
  }

  for (const [encodeId, decodeId] of CHEF_OPERATION_PAIRS) {
    const first = operationMap.get(encodeId);
    const second = operationMap.get(decodeId);
    if (!first || !second || first.mode !== 'task' || second.mode !== 'task') continue;
    if (usedOperations.has(first.id) && usedOperations.has(second.id)) continue;
    if (usedOperations.has(first.id) || usedOperations.has(second.id)) throw new Error(`Partially assigned inverse pair: ${first.id}`);
    const group = operationGroups[first.group];
    if (!group) throw new Error(`Unassigned operation group: ${first.group}`);
    const sample = first.op === 'To Base64' ? 'base64' : '';
    const open = operationTarget(first);
    add({ id: `pair:${encodeURIComponent(first.id)}`, title: pairedTitle(first, second), group,
      sourceToolIds: [...new Set([first.panel, second.panel].filter(id => toolMap.has(id)))],
      sourceOperationIds: [first.id, second.id], sourceModes: [first.mode, second.mode],
      aliases: [first.name, second.name, first.op, second.op],
      workspace: ['characters', 'encoding'].includes(group) ? 'convert' : group === 'image' ? 'image' : 'generic',
      type: groupMap.get(group).category === 'media' ? 'media'
        : groupMap.get(group).category === 'other' ? 'utility' : 'transform',
      reversible: true, engineName: first.op, op:first.op,mode:'task',route:open.route,panel:open.panel,open,
      directions: [{ label: first.name, operationId: first.id,op:first.op }, { label: second.name, operationId: second.id,op:second.op }],
      ...(first.id === 'A1Z26 Cipher Encode' ? { tip: '双向操作不保留原有大小写、空白与词间分隔。' }
        : first.id === 'To Case Insensitive Regex' ? {tip:'生成与解析限定为该编码格式；解析结果不保留原文字母的大小写。'}
          : first.id === 'PGP Encrypt and Sign' ? {tip:'加密并签名需要接收方公钥与签名私钥；解密并验签需要解密私钥与对应签名公钥。'} : {}) });
    usedOperations.add(first.id);
    usedOperations.add(second.id);
  }

  for (const operation of catalogue.operations) {
    if (usedOperations.has(operation.id)) continue;
    const group = operation.id==='Analyse UUID'?'formats':operationGroups[operation.group];
    if (!group) throw new Error(`Unassigned operation group: ${operation.group}`);
    const recipeOnly = CHAIN_ONLY_OPERATIONS.includes(operation.id);
    const open = operationTarget(recipeOnly ? {...operation,mode:'chain'} : operation);
    add({ id: `op:${encodeURIComponent(operation.id)}`, title: operation.name, group,
      sourceToolIds: toolMap.has(operation.panel) ? [operation.panel] : [],
      sourceOperationIds: [operation.id], sourceModes: [operation.mode], aliases: [operation.op],
      workspace: group === 'image' ? 'image' : ['characters', 'encoding'].includes(group) ? 'convert' : 'generic',
      type: groupMap.get(group).category === 'media' ? 'media'
        : groupMap.get(group).category === 'other' ? 'utility' : 'transform',
      reversible:false,engineName:operation.op,op:operation.op,mode:recipeOnly?'recipe-only':operation.mode,
      route:open.route,panel:open.panel,open,tip:operation.reason || '',listed:!recipeOnly&&!['retained','chain'].includes(operation.mode),
      ...(recipeOnly || operation.mode === 'retained' || operation.mode === 'chain' ? {
        execution: 'complete-workspace-only',
        tip: operation.reason || (operation.mode === 'chain' ? '处理链控制操作，需在完整配方中使用。' : '保留于完整 CyberChef；不是原生工具入口。')
      } : {}) });
    usedOperations.add(operation.id);
  }

  // Paired primitives can also be recipe-only. Keep their unique original
  // source ownership while excluding the whole family from discovery.
  for (const entry of entries) {
    const retired=entry.sourceOperationIds.filter(op=>CHAIN_ONLY_OPERATIONS.includes(op));
    if (!retired.length) continue;
    if (retired.length!==entry.sourceOperationIds.length) throw Error('配方范围不能拆开真实双向功能：'+entry.id);
    entry.listed=false;entry.mode='recipe-only';entry.execution='complete-workspace-only';
    entry.open=operationTarget({mode:'chain',op:entry.sourceOperationIds[0]});
    entry.route=entry.open.route;entry.panel=entry.open.panel;
  }
  const consolidated=consolidateTopics(entries,CAPABILITY_TOPICS,CHAIN_ONLY_OPERATIONS);
  entries=consolidated.entries.map(entry=>({...entry,category:groupMap.get(entry.group).category}));

  for(const article of ARTICLES){
    const topic=groupMap.get(article.topicGroup);
    if(!topic||topic.category==='knowledge')throw Error('科普内容缺少真实工具主题：'+article.id);
    add({id:'learn:'+article.id,title:article.title,group:'learn-'+topic.category,sourceToolIds:['knowledge'],sourceOperationIds:[],
      aliases:[article.summary,...article.aliases,topic.title],workspace:'learning',type:'learning',mode:'learning',reversible:false,
      route:'knowledge',panel:'knowledge',open:{kind:'learning',panel:'knowledge',route:'knowledge',articleId:article.id},articleId:article.id,topicGroup:article.topicGroup});
  }
  const groupOrder=new Map(groupDefinitions.map((group,index)=>[group.id,index]));
  const representativeRank=item=>{
    const preferred=representativePreferences[item.group] || [];
    const ranks=[item.id,...item.memberIds||[]].map(id=>preferred.indexOf(id)).filter(index=>index>=0);
    const index=ranks.length?Math.min(...ranks):-1;
    return index<0 ? Number.MAX_SAFE_INTEGER : index;
  };
  const labelOrder=new Intl.Collator('zh-Hans',{numeric:true,sensitivity:'base'});
  entries.sort((first,second)=>groupOrder.get(first.group)-groupOrder.get(second.group)
    || representativeRank(first)-representativeRank(second)
    || Number(!first.id.startsWith('native:'))-Number(!second.id.startsWith('native:'))
    || labelOrder.compare(first.title,second.title) || first.id.localeCompare(second.id,'en'));

  const entryMap = new Map(entries.map(entry => [entry.id, entry]));
  const byOperation = new Map();
  const aliases = new Map(consolidated.aliases);
  aliases.set('topic:units',{id:'native:units-everyday'});
  for(const [oldId,newId] of Object.entries(ARTICLE_ALIASES))aliases.set('learn:'+oldId,{id:'learn:'+newId});
  for (const entry of entries) {
    for (const op of entry.sourceOperationIds) {
      byOperation.set(op, entry);
      const oldId = `op:${encodeURIComponent(op)}`;
      if (oldId !== entry.id) aliases.set(oldId, {id:entry.id,op});
    }
  }
  for (const [first] of CHEF_OPERATION_PAIRS) {
    const owner = byOperation.get(first), oldId = `pair:${encodeURIComponent(first)}`;
    if (owner && oldId !== owner.id) aliases.set(oldId, {id:owner.id,op:first});
  }
  aliases.set('native:hanzi-telegraph-decode', {id:'native:hanzi-telegraph',direction:'decode'});
  const linkedEntries = [
    ['native:hex-editor','native:file'],
    ['native:it-ports','native:it-http'],
    ['native:it-formats','native:ascii','native:utf8'],
    ['native:it-domains','op:Parse%20URI','pair:To%20Punycode'],
    ['native:sequence', 'native:sequence-processing'], ['native:unicode', 'native:ascii'],
    ['native:marine', 'native:semaphore'], ['native:colors', 'native:image-compare'],
    ['native:sky', 'native:astronomy'],
    ['native:countries', 'native:currencies', 'native:airports', 'native:ports']
  ];
  for (const linked of linkedEntries) {
    for (const id of linked) {
      const canonical=key=>entryMap.has(key)?key:aliases.get(key)?.id;
      const entry = entryMap.get(canonical(id));
      if (entry) entry.relatedIds = [...new Set(linked.map(canonical).filter(other => other && other !== entry.id))];
    }
  }
  // Link knowledge to actual capabilities without duplicating engines or
  // confusing factual query records with explanatory articles.
  const lessonByCapability = new Map();
  for (const article of ARTICLES) for (const id of article.capabilityIds) {
    const owner = entryMap.get(id);
    if (!owner || owner.category === 'knowledge' || owner.listed === false || owner.group !== article.topicGroup)
      throw Error('科普必须对应同组真实可见功能：' + article.id + ' / ' + id);
    if (lessonByCapability.has(id)) throw Error('同一功能重复建立科普：' + id);
    lessonByCapability.set(id, 'learn:' + article.id);
  }
  for(const entry of entries.filter(item=>item.category!=='knowledge')){
    const lesson = lessonByCapability.get(entry.id);
    if (entry.listed !== false && !lesson) throw Error('可见功能缺少独立科普：' + entry.id);
    entry.learningIds = lesson ? [lesson] : [];
  }
  for(const article of ARTICLES){
    const lesson=entryMap.get('learn:'+article.id);
    const related=article.relatedIds.map(id=>entryMap.has(id)?id:aliases.get(id)?.id);
    if(related.some(id=>!id))throw Error('科普关联工具未登记：'+article.id);
    lesson.relatedIds=[...new Set(related)];
  }
  const groups = groupDefinitions.map(definition => {
    const sourceMembers = entries.filter(entry=>entry.group === definition.id);
    const members = sourceMembers.filter(entry=>entry.listed !== false);
    const preferred = (representativePreferences[definition.id] || [])
      .map(id => entryMap.has(id)?id:aliases.get(id)?.id)
      .filter(id => entryMap.get(id)?.group === definition.id && entryMap.get(id).listed !== false);
    const representatives = [...new Set([...preferred, ...members.map(entry => entry.id)])]
      .slice(0, Math.min(5, Math.max(preferred.length, Math.min(3, members.length))));
    return { ...definition, representatives, entries:members,entryIds:members.map(entry => entry.id),count:members.length,
      sourceEntryIds:sourceMembers.map(entry=>entry.id),sourceCount:sourceMembers.length };
  });
  const coveredToolIds = new Set(entries.flatMap(entry => entry.sourceToolIds));
  const coveredOperationIds = new Set(entries.flatMap(entry => entry.sourceOperationIds));
  const missingToolIds = catalogue.tools.filter(tool => !coveredToolIds.has(tool.id)).map(tool => tool.id);
  const missingOperationIds = catalogue.operations.filter(op => !coveredOperationIds.has(op.id)).map(op => op.id);
  const coverage = {
    toolCount: catalogue.tools.length, coveredToolCount: coveredToolIds.size,
    operationCount: catalogue.operations.length, coveredOperationCount: coveredOperationIds.size,
    entryCount: entries.length,visibleEntryCount:entries.filter(entry=>entry.listed !== false).length,
    visibleToolCount:entries.filter(entry=>entry.listed!==false&&entry.category!=='knowledge').length,
    knowledgeCount:entries.filter(entry=>entry.listed!==false&&entry.category==='knowledge').length,
    groupCount: groups.length, missingToolIds, missingOperationIds,
    sourceModes: Object.fromEntries([...new Set(catalogue.operations.map(op => op.mode))]
      .map(mode => [mode, catalogue.operations.filter(op => op.mode === mode).length])),
    categories: categories.map(category => ({ id: category.id, title: category.title,
      groupCount: groups.filter(group => group.category === category.id).length,
      entryCount: entries.filter(entry => entry.category === category.id && entry.listed !== false).length,
      sourceEntryCount:entries.filter(entry=>entry.category === category.id).length }))
  };
  if (new Set(entries.map(entry => entry.id)).size !== entries.length) throw new Error('Duplicate capability entry id');
  if (missingToolIds.length || missingOperationIds.length) throw new Error('The capability registry lost source inventory coverage');
  if (entries.flatMap(entry => entry.sourceOperationIds).length !== coveredOperationIds.size) throw new Error('An operation has multiple canonical owners');
  return { categories, groups, entries, coverage,byId:entryMap,byOperation,aliases,
    operationTargets:new Map(catalogue.operations.map(operation=>[operation.id,operationTarget(operation)])) };
}

// A legacy direction link resolves to its canonical family and that exact
// direction. Alias records are not inventory entries, so coverage stays unique.
export function resolveCapability(registry, id, op, direction, variant) {
  const alias = registry.aliases?.get(id);
  let entry = registry.byId.get(id) || registry.byId.get(alias?.id);
  if (!entry) return {entry:undefined,op:undefined,direction:undefined};
  // Flow-control rows own the original operation inventory, but they are not
  // workspaces. A request to insert one opens the single complete recipe owner.
  // Keep this request transient: ordinary entry into that owner preserves the
  // player's existing recipe instead of resetting it to a default operation.
  const requestedOperation=op||alias?.op;
  const flow = ['chain','recipe-only'].includes(entry.mode) ? entry : entry.id === 'native:cyberchef' ? registry.byOperation.get(requestedOperation) : null;
  if (['chain','recipe-only'].includes(flow?.mode)) {
    const owner = registry.byId.get('native:cyberchef');
    const operation = flow.sourceOperationIds.includes(requestedOperation) ? requestedOperation : flow.engineName || flow.sourceOperationIds[0];
    if (!owner || owner.listed === false) return {entry:undefined,op:undefined,direction:undefined};
    return {entry:{...owner,open:{...owner.open,kind:'recipe',operation,sourceMode:'chain'}},op:operation,direction:undefined};
  }
  let selectedVariant;
  if (entry.topicKind === 'native'||entry.topicKind === 'mixed') {
    const selected=entry.variants.find(item=>item.id===variant)
      ||(!variant&&entry.variants.find(item=>item.sourceOperationIds.includes(requestedOperation)))
      ||(!variant&&entry.variants.find(item=>item.id===alias?.variant))||entry.variants[0];
    selectedVariant=selected;
    entry={...entry,variantId:selected.id,taskId:selected.id,open:selected.open,
      route:selected.route,panel:selected.panel,directions:selected.directions};
  }
  const operations = selectedVariant?.sourceOperationIds||entry.sourceOperationIds;
  const requested = operations.includes(op) ? op : operations.includes(alias?.op) ? alias.op
    : selectedVariant?.engineName || (selectedVariant?operations[0]:entry.engineName || operations[0]);
  if (entry.topicKind === 'operation') {
    const source=registry.operationTargets.get(requested);
    if (!source) throw Error('专题缺少真实操作工作区：'+requested);
    entry={...entry,open:source,route:source.route,panel:source.panel};
  }
  const nativeDirections = entry.open.nativeDirections || [];
  const requestedDirection = nativeDirections.some(item=>item.id===direction) ? direction
    : nativeDirections.some(item=>item.id===alias?.direction) ? alias.direction : nativeDirections[0]?.id;
  return {entry,op:requested,direction:requestedDirection};
}

export function searchEntries(registry, query, category = '') {
  const entries=rankCapabilities(registry.entries,query,category);
  if(!String(query).trim())return entries;
  // Vocabulary expands discovery, but broad group aliases must not bury an
  // exact name below a bounded search surface. Rank only the existing matches;
  // empty-query navigation and equal-score inventory order remain unchanged.
  // A search result is still one family. Its transient direction preference
  // follows only an unambiguous direction-specific name, never shared page
  // vocabulary, and never mutates the registry's default or another search.
  return entries.map(entry=>{
    const choices=[...new Map([...(entry.actions||entry.directions||[]),
      ...(entry.variants||[]).flatMap(item=>item.directions||[])].map(item=>[item.op,item])).values()],term=searchText(query);
    const exact=choices.filter(item=>[item.op,item.label].some(value=>searchText(value)===term));
    const operations=exact.length?exact:choices.filter(item=>matchesSearch(
      [item.op,item.label,OPERATION_KEYWORDS[item.op]||''].join(' '),query));
    const native=(entry.open.nativeDirections||[]).filter(item=>matchesSearch(
      [item.label,...(item.aliases||[])].join(' '),query));
    if(operations.length===1)return {...entry,preferredOperation:operations[0].op};
    // Bare algorithm names select their real pair, not another topic member.
    const pair=CHEF_OPERATION_PAIRS.find(([a,b])=>entry.sourceOperationIds.includes(a)&&entry.sourceOperationIds.includes(b)&&
      [a,b].some(name=>searchText(name.replace(/^(?:To|From)\s+/i,'').replace(/\s+(?:Encode|Decode|Encrypt|Decrypt)$/i,''))===term));
    if(pair)return {...entry,preferredOperation:pair[0]};
    const variants=(entry.variants||[]).map(item=>{
      const title=searchText(item.title),aliases=(item.aliases||[]).map(searchText);
      const score=title===term?8:title.startsWith(term)?7:title.includes(term)?6:aliases.includes(term)?5
        :aliases.some(alias=>alias.startsWith(term))?4:matchesSearch([item.title,...item.aliases||[]].join(' '),query)?2:0;
      return {item,score};
    }).filter(item=>item.score).sort((a,b)=>b.score-a.score);
    if(variants.length&&variants[0].score!==variants[1]?.score)return {...entry,preferredVariant:variants[0].item.id};
    if(!variants.length&&entry.variants?.length){
      const approximate=rankCapabilities(entry.variants,query);
      if(approximate.length===1)return {...entry,preferredVariant:approximate[0].id};
    }
    if(native.length===1)return {...entry,preferredDirection:native[0].id};
    return entry;
  });
}

let registryPromise;
export function loadRegistry() {
  return registryPromise ??= getCatalogue().then(createRegistry).catch(error=>{
    registryPromise = null;
    throw error;
  });
}
