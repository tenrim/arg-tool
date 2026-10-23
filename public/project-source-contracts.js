import {PRACTICAL_TASKS} from './practical/catalog.js';
import {UNIT_DISCIPLINES} from './capabilities/unit-catalog.js';
import {COMPLETION_SOURCES} from './completion/sources.js';
// Actual integrated dependencies, separate from reference documents and engines.
// Every new task must declare sources explicitly, including [] for original code.
import {REFERENCE_TOOLS,referenceToolSources} from './reference/catalog.js';
const cipher='https://github.com/philippica/cipher_machine';
const chinese='https://github.com/philippica/ChinesePuzzleTool';
const elements='https://github.com/Bowserinator/Periodic-Table-JSON';
const quickjs='https://github.com/justjake/quickjs-emscripten';
const entry=(id,panel,urls,roles={})=>['native:'+id,Object.freeze({panel,urls:Object.freeze(urls),roles:Object.freeze(roles)})];
const classical=['playfair','adfgx','adfgvx','trifid','autokey','beaufort','columnar','nihilist'];
const numbers=['integer'];
const codeProjects={
 brainfuck:['https://github.com/nilaymaj/esolang-park','Brainfuck 的真实执行、纸带与单步引擎。'],
 ook:['https://github.com/nilaymaj/esolang-park','Ook! 语法经本站适配后交给 Brainfuck 执行、纸带与单步引擎。'],
 befunge:['https://github.com/nilaymaj/esolang-park','Befunge-93 二维指针、栈与单步执行引擎。'],
 deadfish:['https://github.com/nilaymaj/esolang-park','Deadfish 真实指令执行与单步状态引擎。'],
 whitespace:['https://github.com/susisu/Whitespace-JS','Whitespace 执行引擎，含原 loquat 与 co 依赖许可。'],
 malbolge:['https://github.com/zb3/malbolge-vm','Malbolge 虚拟机与单步状态。'],
 python:['https://github.com/pyodide/pyodide','本地 Python 标准库运行，含 CPython 及其独立历史许可。'],
 javascript:[quickjs,'独立 QuickJS 虚拟机执行 JavaScript，不使用网页宿主执行用户代码。'],
 lua:['https://github.com/ceifa/wasmoon','本地 Lua 运行包，含 Lua 核心许可。'],
 sql:['https://github.com/sql-js/sql.js','本地 SQLite 查询与数据库导入导出，保留 SQLite 公有领域声明。'],
};
export const TASK_PROJECT_SOURCES=Object.freeze(Object.fromEntries([
 entry('braille','symbols',['https://github.com/kfarnung/puzzle-lib'],{'https://github.com/kfarnung/puzzle-lib':'复用六点盲文字母映射；字符按键仅列 A–Z 与数字标记，逐点输入仍保留全部六点组合，两种方式共用选择。'}),
 ...PRACTICAL_TASKS.map(t=>entry(t.id,t.id,['geometry','bmi'].includes(t.id)?['https://github.com/Qalculate/libqalculate','https://gmplib.org/','https://www.mpfr.org/','https://gitlab.gnome.org/GNOME/libxml2','https://github.com/emscripten-core/emscripten']:['meeting','countdown'].includes(t.id)?['https://www.iana.org/time-zones','https://github.com/python/tzdata','https://github.com/unicode-org/cldr-json','https://github.com/nk2028/opencc-js']:[],{'https://github.com/Qalculate/libqalculate':t.id==='bmi'?'使用完整内核的 BMI 函数及原生长度、质量单位定义。':'使用完整内核的几何函数与任意精度表达式计算。','https://www.iana.org/time-zones':'用固定完整 TZif 资料解析所选日期的真实偏移、跳时和回拨；未来规则为快照预测。'})),
 ...UNIT_DISCIPLINES.map(d=>entry('units-'+d.id,'unitconvert',['https://github.com/Qalculate/libqalculate','https://gmplib.org/','https://www.mpfr.org/','https://gitlab.gnome.org/GNOME/libxml2','https://github.com/emscripten-core/emscripten'],{'https://github.com/Qalculate/libqalculate':'按当前学科提供完整随包单位定义、前缀和真实换算；货币为固定快照。'})),
 entry('chemistry','chemistry',[elements],{[elements]:'完整 118 元素数据与全部原始字段。'}),
 entry('chemistry-formula','chemistry',[elements],{[elements]:'完整 118 元素的原子量、符号和中文名称，用于摩尔质量、原子数及质量占比；语法解析与计数为本站实现。'}),
 entry('chemistry-molecule','chemistry',['https://github.com/rdkit/rdkit']),
 entry('qalculate','qalculate',['https://github.com/Qalculate/libqalculate','https://gmplib.org/','https://www.mpfr.org/','https://gitlab.gnome.org/GNOME/libxml2','https://www.gnuplot.info/','https://github.com/emscripten-core/emscripten']),
 ...COMPLETION_SOURCES.map(([id,urls])=>entry(id,id,urls)),
 entry('video-animation','video',['https://github.com/matt-way/gifuct-js','https://github.com/photopea/UPNG.js','https://github.com/matt-way/jsBinarySchemaParser','https://github.com/nodeca/pako','https://github.com/101arrowz/fflate'],{'https://github.com/101arrowz/fflate':'完整动画 ZIP 打包，保存全部原始帧、合成帧、参数和原文件。'}),
 entry('video-native','video',['https://github.com/ffmpegwasm/ffmpeg.wasm'],{'https://github.com/ffmpegwasm/ffmpeg.wasm':'固定本地 FFmpeg 核心的原生命令、格式、编解码器、滤镜及完整帮助；只处理显式选择的本机文件。'}),
 entry('radix','basics',[]),
 entry('image-steg','image',['https://github.com/Ge0rg3/StegOnline'],{'https://github.com/Ge0rg3/StegOnline':'浏览器内多位隐写提取、原生数据与图像嵌入、完整调色板及 RGBA 导出；PNG 原始像素由随包 PngToy 读取。'}),
 ...REFERENCE_TOOLS.map(tool=>{const sources=referenceToolSources(tool);return entry(tool.id,tool.id,sources.map(([,url])=>url),Object.fromEntries(sources.map(([,url,role])=>[url,role])));}),
 entry('it-ports','it-reference',['https://www.iana.org/protocols','https://github.com/nk2028/opencc-js']),
 entry('it-http','it-reference',['https://www.iana.org/protocols','https://github.com/mdn/translated-content','https://github.com/nk2028/opencc-js']),
 entry('it-formats','it-reference',['https://www.iana.org/protocols','https://github.com/jshttp/mime-db','https://github.com/mdn/translated-content','https://github.com/nk2028/opencc-js']),
 entry('it-domains','it-reference',['https://github.com/publicsuffix/list','https://github.com/nk2028/opencc-js']),
 entry('simbad','simbad',['https://simbad.cds.unistra.fr/simbad/']),
 entry('vizier','vizier',['https://vizier.cds.unistra.fr/']),
 entry('cod','cod',['https://www.crystallography.net/cod/']),
 entry('pubchem','pubchem',['https://pubchem.ncbi.nlm.nih.gov/']),
 entry('placenames','placenames',['https://dmfw.mca.gov.cn/']),
 entry('zdic','zdic',['https://www.zdic.net/']),
 entry('cnkgraph','cnkgraph',['https://cnkgraph.com/']),
 entry('pokewiki','pokewiki',['https://wiki.52poke.com/']),
 entry('oeis','oeis',['https://oeis.org/'],{'https://oeis.org/':'主动联网查询得到的 OEIS 数列条目数据与元数据；经本站服务器转发，未打包离线数列库或 OEIS 软件引擎。'}),
 entry('timezones','timezones',['https://www.iana.org/time-zones','https://github.com/python/tzdata','https://github.com/unicode-org/cldr-json','https://github.com/nk2028/opencc-js']),
 entry('constellations','constellations',['https://iauarchive.eso.org/public/themes/constellations/','https://github.com/nk2028/opencc-js']),
 entry('eclipses','eclipses',['https://eclipse.gsfc.nasa.gov/','https://github.com/nk2028/opencc-js']),
 entry('birds','birds',['https://www.avilist.org/checklist/v2025b/','https://www.worldbirdnames.org/new/ioc-lists/master-list-2/','https://github.com/unicode-org/cldr-json','https://github.com/nk2028/opencc-js']),
 entry('classical-music','classical-music',['https://openopus.org/','https://www.wikidata.org/','https://github.com/nk2028/opencc-js']),
 entry('image-barcode','image',['https://github.com/Sec-ant/zxing-wasm','https://github.com/zxing-cpp/zxing-cpp','https://github.com/Ge0rg3/StegOnline'],{
  'https://github.com/Sec-ant/zxing-wasm':'本地 WASM 多制式条码读取接口；输入为原始图片或明确选择的当前视图像素。',
  'https://github.com/zxing-cpp/zxing-cpp':'实际二维码与条形码定位、纠错和内容解码核心。',
  'https://github.com/Ge0rg3/StegOnline':'共享图片输入读取 PNG 时使用随包 PngToy 原始像素解码（MIT）；此操作不调用隐写提取。'}),
 entry('image-qr','image',['https://github.com/Merricx/qrazybox','https://github.com/cozmo/jsQR','https://github.com/Ge0rg3/StegOnline'],{
  'https://github.com/Merricx/qrazybox':'二维码结构、格式、RS 错误／擦除恢复、码字编辑、解除掩码与填充恢复。',
  'https://github.com/cozmo/jsQR':'本地 Worker 中的二维码定位、纠错与修复矩阵解码。',
  'https://github.com/Ge0rg3/StegOnline':'共享图片输入读取 PNG 时使用随包 PngToy 原始像素解码（MIT）；此操作不调用隐写提取。'}),
 ...Object.entries(codeProjects).map(([language,[url,role]])=>entry(language==='brainfuck'?'code':'code-'+language,'code',[url],{[url]:role})),
 ...classical.map(id=>entry('classical-'+id,'classical-'+id,[])),
 ...numbers.map(id=>entry('number-'+id,'number-'+id,['https://github.com/alpertron/calculators'])),
 entry('morse-audio','morse',['https://github.com/ggerganov/ggmorse']),
 entry('score','score',['https://github.com/paulrosen/abcjs','https://github.com/Tonejs/Midi']),
 entry('element-spelling','element-spelling',[elements],{[elements]:'118 个元素的符号、原子序数与名称数据；拆分与计数由本站实现。'}),
 entry('element-words','element-spelling',[elements,cipher],{[elements]:'完整 118 元素数据，用于校验单词的元素符号组成。',[cipher]:'用于元素单词筛选的完整英文词库。'}),
 entry('stroke-endpoints','stroke-endpoints',[chinese]),
 ...['sudoku','magicSquare','mine','nonogram','drop','custom'].map(id=>entry('hunt-constraints-'+id,'hunt-constraints',[cipher],{[cipher]:'原始中文规则解析、约束传播与搜索引擎，以及单词约束使用的完整词库。'})),
 entry('dictionary-substitution','dictionary-substitution',[cipher],{[cipher]:'SubstitutionSolver 字典约束替换求解器、完整词库与词类数据。'}),
 ...['qwerty','ninekey'].map(id=>entry('keyboard-'+id,'keyboard',[cipher],{[cipher]:'完整 12 行键盘与符号映射模板，以及实际转换参数。'})),
 ...['words','words-wildcard','words-letters','words-regex','words-fuzzy','words-contains','word-grid','word-boggle'].map(id=>entry(id,'words',[cipher],{[cipher]:'真实查词与网格搜词算法、完整六类英文词库及词类数据。'})),
 entry('words-code','words',[cipher,quickjs],{[cipher]:'完整六类英文词库与词类数据。',[quickjs]:'在独立受限环境执行用户查词谓词，不在网页宿主中执行代码。'}),
 entry('words-chinese','words',[chinese],{[chinese]:'原始中文条件查询、完整词语与成语库、字属性、部件与拼音数据。'}),
]));
export const OPERATION_PROJECT_SOURCES=Object.freeze({
 'Parse QR Code':Object.freeze({panel:'image',urls:Object.freeze(['https://github.com/gchq/CyberChef','https://github.com/Ge0rg3/StegOnline']),roles:Object.freeze({
  'https://github.com/gchq/CyberChef':'当前二维码识别操作的官方本地处理引擎。',
  'https://github.com/Ge0rg3/StegOnline':'沿用上方 PNG 原图的像素预览或当前视图时使用随包 PngToy 解码（MIT）；二维码识别仍由 CyberChef 执行，不调用隐写提取。',
 })}),
});
export const NOTEBOOK_PROJECT_SOURCES=Object.freeze([
 'https://github.com/Vanessa219/vditor',
 'https://github.com/88250/lute',
 'https://github.com/cure53/DOMPurify',
 'https://github.com/KaTeX/KaTeX',
 'https://github.com/highlightjs/highlight.js',
 'https://github.com/mermaid-js/mermaid',
 'https://github.com/apache/echarts',
 'https://github.com/markmap/markmap',
 'https://github.com/adrai/flowchart.js',
 'https://github.com/mdaines/viz.js',
 'https://github.com/wavedrom/wavedrom',
 'https://github.com/paulrosen/abcjs',
 'https://github.com/reymond-group/smilesDrawer',
]);
