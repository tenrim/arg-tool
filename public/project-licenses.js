// Pinned project licenses, verified against the bundled notices and THIRD_PARTY.md.
export const PROJECT_LICENSES = [
{"name":"Nodemailer","url":"https://github.com/nodemailer/nodemailer","license":"MIT-0","notices":["licenses/nodemailer-MIT-0.txt"],"role":"固定 10.1.1，仅用于独立服务发送用户主动提交的问题报告，不进入浏览器运算包。"},
{"name":"IANA Protocol Registries","url":"https://www.iana.org/protocols","license":"CC0 1.0（协议注册表数据；不含引用的RFC文档）","notices":["vendor/it-reference/IANA-CC0-1.0.txt","vendor/it-reference/IANA-NOTICE.txt"],"role":"固定服务端口、IP协议号、HTTP状态与字段、字符集名称和别名；派生JSON加入本站中文科普。"},
{"name":"mime-db","url":"https://github.com/jshttp/mime-db","license":"MIT","notices":["vendor/it-reference/mime-db-LICENSE.txt"],"role":"固定1.54.0媒体类型、扩展名、默认字符集、来源标记与可压缩性资料。"},
{"name":"Public Suffix List","url":"https://github.com/publicsuffix/list","license":"MPL-2.0（原始和派生公共后缀数据）","notices":["vendor/it-reference/PSL-LICENSE.txt","vendor/it-reference/PSL-NOTICE.txt","vendor/it-reference/public_suffix_list.dat"],"role":"完整ICANN/PRIVATE公共后缀规则；含通配、例外和IDN。原生匹配实现，不使用tldts。"},
{"name":"RFC Editor Index","url":"https://www.rfc-editor.org/rfc-index/","license":"RFC索引事实元数据；RFC文档原许可另行适用（未引入正文）","notices":["vendor/it-reference/RFC-NOTICE.txt"],"role":"2026-07-31索引中精选56项编号、短标题、状态与更新关系；中文摘要为本站原创。"},
{"name": "cryptii", "url": "https://github.com/cryptii/cryptii", "license": "MIT", "notices": ["vendor/basics/cryptii-LICENSE.txt", "vendor/basics/NOTICE.txt"], "role": "敲击码与坐标方阵转换引擎"},
{"name": "romanice", "url": "https://github.com/dkin-om/romanice", "license": "MIT", "notices": ["vendor/basics/romanice-LICENSE.txt", "vendor/basics/NOTICE.txt"], "role": "标准罗马数字双向转换"},
{"name": "Invisibles", "url": "https://github.com/cig13zs/invisibles", "license": "MIT", "notices": ["vendor/basics/invisibles-LICENSE.txt", "vendor/basics/NOTICE.txt"], "role": "隐藏字符分类与清理"},
{"name": "baudot.js", "url": "https://github.com/zenoamaro/baudot.js", "license": "MIT", "notices": ["vendor/basics/baudot-LICENSE.txt", "vendor/basics/NOTICE.txt"], "role": "五位电传编码和三种字母表"},
{"name":"Turing Machine Viz","url":"https://github.com/aepsilon/turing-machine-viz","license":"BSD-3-Clause","notices":["vendor/turing/LICENSE.txt","vendor/turing/NOTICE.txt"],"role":"固定图灵机规则解析、纸带与状态转移引擎；本站适配 Unicode、停留移动、限额和回退。"},
{"name":"js-yaml","url":"https://github.com/nodeca/js-yaml","license":"MIT","notices":["vendor/turing/js-yaml-LICENSE.txt","vendor/turing/NOTICE.txt"],"role":"固定 4.3.2 本地 YAML 解析，使用安全数据模式，不执行 JavaScript 标签。"},
{"name":"doken","url":"https://github.com/yishn/doken","license":"MIT","notices":["vendor/discovery/doken-LICENSE.txt","vendor/discovery/NOTICE.txt"],"role":"Sabaki SGF 使用的固定 1.0.0 tokenizer。"},
{"name":"Sabaki SGF","url":"https://github.com/SabakiHQ/sgf","license":"MIT（含 doken tokenizer 的 MIT 许可）","notices":["vendor/discovery/sgf-LICENSE.txt","vendor/discovery/doken-LICENSE.txt","vendor/discovery/NOTICE.txt"],"role":"SGF 字符串解析、节点分支与转义；棋盘和复盘规则为本站实现。"},
{"name":"Marine Signal Flags","url":"https://github.com/dzangolab/marine-signal-flags","license":"MIT","notices":["vendor/discovery/marine-LICENSE.txt","vendor/discovery/marine-README.txt"],"role":"36 张原始海事字母旗、数字旗 SVG；保留原许可署名。"},
{"name":"Currency Codes","url":"https://github.com/datasets/currency-codes","license":"PDDL 1.0（数据）","notices":["vendor/discovery/currency-README.txt","vendor/discovery/currency-datapackage.json"],"role":"现行与历史 ISO 4217 实体—货币资料；本站按代码和状态合并显示。"},
{"name":"HYG Star Database","url":"https://github.com/astronexus/HYG-Database","license":"CC BY-SA 4.0（原始及派生数据）","notices":["vendor/discovery/hyg-LICENSE.txt","vendor/discovery/hyg-README.txt","vendor/discovery/NOTICE.txt"],"role":"HYG 4.1 明亮／命名恒星精选，J2000 星表坐标及字段；筛选数据继续同许可。"},
{"name":"OpenNGC","url":"https://github.com/mattiaverga/OpenNGC","license":"CC BY-SA 4.0（原始及派生数据）","notices":["vendor/discovery/ngc-LICENSE.txt","vendor/discovery/ngc-README.txt","vendor/discovery/ngc-FIELDS.txt","vendor/discovery/NOTICE.txt"],"role":"NGC／IC 及补充深空目录；保留字段来源、缺失值与原始别名。"},
{"name":"Natural Earth","url":"https://github.com/nvkelso/natural-earth-vector","license":"公共领域（地图数据）","notices":["vendor/reference/natural-earth-LICENSE.txt"],"role":"世界地图的固定简化轮廓；投影和点选界面由本站实现。"},
{"name": "Countries", "url": "https://github.com/annexare/Countries", "license": "MIT", "notices": ["vendor/reference/countries-LICENSE.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "flag-icons", "url": "https://github.com/lipis/flag-icons", "license": "MIT", "notices": ["vendor/reference/flags-LICENSE.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "OurAirports", "url": "https://github.com/davidmegginson/ourairports-data", "license": "Unlicense / 公共领域", "notices": ["vendor/reference/airports-LICENSE.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "UN/LOCODE 数据集", "url": "https://github.com/datasets/un-locode", "license": "PDDL 1.0（数据）", "notices": ["vendor/reference/ports-README.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "Unicode Character Database", "url": "https://github.com/unicode-org/unicodetools", "license": "Unicode-3.0（数据）", "notices": ["vendor/reference/unicode-LICENSE.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "i-ching", "url": "https://github.com/strobus/i-ching", "license": "MIT", "notices": ["vendor/reference/iching-LICENSE.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "Tarot Card Data", "url": "https://github.com/smallcat419/tarot-card-data", "license": "CC0 1.0（数据；本站中文简述另行编写）", "notices": ["vendor/reference/tarot-README.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "TarotCards / 1909 RWS 牌面", "url": "https://github.com/mixvlad/TarotCards", "license": "公共领域（1909 RWS 牌面）；MIT（随附来源文档）", "notices": ["vendor/reference/tarot-art-NOTICE.txt", "vendor/reference/tarot-art-SOURCES.txt", "vendor/reference/tarot-art-metadata.json", "vendor/reference/tarot-art-LICENSE.txt", "vendor/reference/tarot-art-README.txt"], "role": "塔罗查询使用的 78 张本地公版牌面；原画 Pamela Colman Smith，扫描修复 Steve P.。"},
{"name": "Gearberry / 蓝金幻想牌面", "url": "https://github.com/reginanka/tarot-cards", "license": "CC BY 4.0（牌面；按上游声明）", "notices": ["vendor/reference/tarot-gearberry-NOTICE.txt", "vendor/reference/tarot-gearberry-LICENSE.txt", "vendor/reference/tarot-gearberry-README.txt"], "role": "Tarot Cards WebP Collection by Gearberry；默认塔罗牌面，78 张原始 WebP 本地分发。"},
{"name": "Color Names", "url": "https://github.com/meodai/color-names", "license": "MIT", "notices": ["vendor/reference/colors-LICENSE.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "ICS 国际年代地层表", "url": "https://github.com/i-c-stratigraphy/chart", "license": "CC BY 4.0（派生查询数据）", "notices": ["vendor/reference/geology-chart-LICENSE.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "OEIS 数列数据", "url": "https://github.com/oeis/oeisdata", "license": "CC BY-SA 4.0（派生索引同许可）", "notices": ["vendor/reference/oeis-LICENSE.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "Crystallography Open Database", "url": "https://www.crystallography.net/cod/", "license": "CC0 1.0 / 公共领域（保留原始晶体文献归属）", "notices": ["vendor/reference/cod-NOTICE.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "Astronomy Engine", "url": "https://github.com/cosinekitty/astronomy", "license": "MIT", "notices": ["vendor/science/astronomy-LICENSE.txt"], "role": "科学与历法工具使用的固定本地组件或数据。"},
{"name": "lunar-javascript", "url": "https://github.com/6tail/lunar-javascript", "license": "MIT", "notices": ["vendor/science/lunar-LICENSE.txt"], "role": "科学与历法工具使用的固定本地组件或数据。"},
{"name": "Periodic-Table-JSON", "url": "https://github.com/Bowserinator/Periodic-Table-JSON", "license": "CC BY-SA 3.0（数据；本站中文字段与筛选结果为改编）", "notices": ["vendor/science/elements-LICENSE.txt"], "role": "科学与历法工具使用的固定本地组件或数据。"},
{"name": "SeqViz", "url": "https://github.com/Lattice-Automation/seqviz", "license": "MIT", "notices": ["vendor/science/seqviz-LICENSE.txt"], "role": "科学与历法工具使用的固定本地组件或数据。"},
{"name": "NtSeq", "url": "https://github.com/keithwhor/NtSeq", "license": "MIT", "notices": ["vendor/science/ntseq-LICENSE.txt"], "role": "科学与历法工具使用的固定本地组件或数据。"},
{"name": "RDKit / MinimalLib", "url": "https://github.com/rdkit/rdkit", "license": "BSD-3-Clause（含上游随附声明）", "notices": ["vendor/science/rdkit-LICENSE.txt"], "role": "科学与历法工具使用的固定本地组件或数据。"},

  {
    "name": "CyberChef",
    "url": "https://github.com/gchq/CyberChef",
    "license": "Apache-2.0（另含依赖许可原文）",
    "notices": [
      "vendor/cyberchef/LICENSE.txt",
      "vendor/knowledge/LICENSE.txt",
      "vendor/knowledge/NOTICE.txt"
    ],
    "role": ""
  },
  {
    "name": "puzzle-lib",
    "url": "https://github.com/kfarnung/puzzle-lib",
    "license": "MIT",
    "notices": [
      "vendor/puzzle-lib/LICENSE.txt"
    ],
    "role": ""
  },
  {
    "name": "jsQR",
    "url": "https://github.com/cozmo/jsQR",
    "license": "Apache-2.0",
    "notices": [
      "vendor/jsqr-LICENSE.txt"
    ],
    "role": ""
  },
  {
    "name": "fft.js",
    "url": "https://github.com/indutny/fft.js",
    "license": "MIT",
    "notices": [
      "vendor/fft-LICENSE.txt"
    ],
    "role": ""
  },
  {
    "name": "exifr",
    "url": "https://github.com/MikeKovarik/exifr",
    "license": "MIT",
    "notices": [
      "licenses/exifr-7.1.3-MIT.txt"
    ],
    "role": ""
  },
  {
    "name": "Noto Serif SC",
    "url": "https://github.com/google/fonts",
    "license": "OFL-1.1",
    "notices": [
      "fonts/NotoSerifSC-OFL.txt"
    ],
    "role": "Noto Serif SC 界面字形子集"
  },
  {
    "name": "Noto Sans SC",
    "url": "https://github.com/google/fonts/tree/main/ofl/notosanssc",
    "license": "OFL-1.1",
    "notices": [
      "fonts/NotoSansSC-OFL.txt"
    ],
    "role": "中文界面、工具标题及等宽输入区中文回退字形；本地可变字重子集"
  },
  {
    "name": "Inter",
    "url": "https://github.com/rsms/inter",
    "license": "OFL-1.1",
    "notices": [
      "fonts/Inter-OFL.txt"
    ],
    "role": "英文界面文字与数字；固定 4.1 本地可变字体"
  },
  {
    "name": "JetBrains Mono",
    "url": "https://github.com/JetBrains/JetBrainsMono",
    "license": "OFL-1.1",
    "notices": [
      "fonts/JetBrainsMono-OFL.txt"
    ],
    "role": "界面等宽字体"
  },
  {
    "name": "AperiSolve",
    "url": "https://github.com/Zeecka/AperiSolve",
    "license": "MIT",
    "notices": [
      "vendor/aperisolve/LICENSE.txt"
    ],
    "role": ""
  },
  {
    "name": "StegOnline",
    "url": "https://github.com/Ge0rg3/StegOnline",
    "license": "StegOnline：WTFPL；PngToy：MIT",
    "notices": [
      "vendor/stegonline/LICENSE.txt"
    ],
    "role": ""
  },
  {
    "name": "cipher-machine",
    "url": "https://github.com/philippica/cipher_machine",
    "license": "BSD-3-Clause",
    "notices": [
      "vendor/hunt/cipher-machine/LICENSE"
    ],
    "role": ""
  },
  {
    "name": "chinese-puzzle",
    "url": "https://github.com/philippica/ChinesePuzzleTool",
    "license": "BSD-2-Clause",
    "notices": [
      "vendor/hunt/chinese-puzzle/LICENSE"
    ],
    "role": ""
  },
  {
    "name": "stereogram",
    "url": "https://github.com/piellardj/stereogram-solver",
    "license": "MIT",
    "notices": [
      "vendor/hunt/stereogram/LICENSE"
    ],
    "role": ""
  },
  {
    "name": "SSTV Decoder",
    "url": "https://github.com/Equinoxis/sstv-decoder",
    "license": "MIT（上游 README 声明）",
    "notices": [
      "vendor/hunt/sstv/README.md"
    ],
    "role": ""
  },
  {
    "name": "ffmpeg.wasm / FFmpeg 核心",
    "url": "https://github.com/ffmpegwasm/ffmpeg.wasm",
    "license": "封装：MIT；当前核心：GPL-2.0-or-later",
    "notices": [
      "vendor/hunt/ffmpeg/LICENSE",
      "vendor/hunt/ffmpeg-core/LICENSE.GPLv2.txt"
    ],
    "role": ""
  },
  {
    "name": "zxing-wasm / ZXing-C++",
    "url": "https://github.com/Sec-ant/zxing-wasm",
    "license": "封装：MIT；ZXing-C++：Apache-2.0",
    "notices": [
      "vendor/hunt/zxing/LICENSE",
      "vendor/hunt/zxing/ZXing-C++-LICENSE.txt"
    ],
    "role": ""
  },
  {
    "name": "cnchar",
    "url": "https://github.com/theajack/cnchar",
    "license": "MIT",
    "notices": [
      "vendor/round1/cnchar/LICENSE"
    ],
    "role": ""
  },
  {
    "name": "pinyin-pro",
    "url": "https://github.com/zh-lx/pinyin-pro",
    "license": "MIT",
    "notices": [
      "vendor/round1/pinyin-pro/LICENSE"
    ],
    "role": ""
  },
  {
    "name": "OpenCC-JS",
    "url": "https://github.com/nk2028/opencc-js",
    "license": "代码：MIT；字典数据：Apache-2.0",
    "notices": [
      "vendor/round1/opencc-js/LICENSE",
      "vendor/round1/opencc-js/THIRD_PARTY_LICENSES.md",
      "vendor/round1/opencc-js/LICENSES/Apache-2.0.txt"
    ],
    "role": ""
  },
  {
    "name": "tone",
    "url": "https://github.com/Tonejs/Tone.js",
    "license": "MIT",
    "notices": [
      "vendor/round1/tone/LICENSE.md"
    ],
    "role": ""
  },
  {
    "name": "cubejs",
    "url": "https://github.com/ldez/cubejs",
    "license": "MIT",
    "notices": [
      "vendor/round1/cubejs/LICENSE"
    ],
    "role": ""
  },
  {
    "name": "cubing.js",
    "url": "https://github.com/cubing/cubing.js",
    "license": "MPL-2.0（本站选择；上游另提供 GPL-3.0-or-later）",
    "notices": [
      "vendor/round1/cubing/LICENSE-GPL.md",
      "vendor/round1/cubing/LICENSE-MPL.md"
    ],
    "role": ""
  },
  {
    "name": "three",
    "url": "https://github.com/mrdoob/three.js",
    "license": "MIT",
    "notices": [
      "vendor/round1/three/LICENSE",
      "vendor/round4/LICENSES.txt"
    ],
    "role": "cubing.js 的三维渲染依赖"
  },
  {
    "name": "random-uint-below",
    "url": "https://github.com/lgarron/random-uint-below.js",
    "license": "Unlicense",
    "notices": [
      "vendor/round1/random-uint-below/LICENSE.md"
    ],
    "role": "cubing.js 的随机数依赖"
  },
  {
    "name": "substitution",
    "url": "https://github.com/cateyelow/substitution-cipher-solver",
    "license": "MIT",
    "notices": [
      "vendor/round1/substitution/LICENSE"
    ],
    "role": ""
  },
  {
    "name": "qrazybox",
    "url": "https://github.com/Merricx/qrazybox",
    "license": "MIT",
    "notices": [
      "vendor/round1/qrazybox/LICENSE"
    ],
    "role": ""
  },
  {
    "name": "chinese-telegraph-code",
    "url": "https://github.com/kirklin/chinese-telegraph-code",
    "license": "代码：MIT；数据：Unicode 数据许可",
    "notices": [
      "vendor/round1/telegraph/LICENSE",
      "vendor/round1/telegraph/DATA_LICENSE.md"
    ],
    "role": ""
  },
  {
    "name": "Make Me a Hanzi",
    "url": "https://github.com/skishore/makemeahanzi",
    "license": "LGPL-3.0-or-later（仅字典数据）",
    "notices": [
      "vendor/round1/makemeahanzi/COPYING",
      "vendor/round1/makemeahanzi/LGPL",
      "vendor/round1/makemeahanzi/GPL"
    ],
    "role": ""
  },
  {
    "name": "Pitchy",
    "url": "https://github.com/ianprime0509/pitchy",
    "license": "MIT",
    "notices": [
      "vendor/round2/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "Tonal",
    "url": "https://github.com/tonaljs/tonal",
    "license": "MIT",
    "notices": [
      "vendor/round2/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "Tonejs/Midi",
    "url": "https://github.com/Tonejs/Midi",
    "license": "MIT",
    "notices": [
      "vendor/round2/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "Pixelmatch",
    "url": "https://github.com/mapbox/pixelmatch",
    "license": "ISC",
    "notices": [
      "vendor/round2/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "Chroma.js",
    "url": "https://github.com/gka/chroma.js",
    "license": "BSD-3-Clause AND Apache-2.0",
    "notices": [
      "vendor/round2/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "fflate",
    "url": "https://github.com/101arrowz/fflate",
    "license": "MIT",
    "notices": [
      "vendor/round2/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "Proj4js",
    "url": "https://github.com/proj4js/proj4js",
    "license": "MIT",
    "notices": [
      "vendor/round2/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "MGRS",
    "url": "https://github.com/proj4js/mgrs",
    "license": "MIT",
    "notices": [
      "vendor/round2/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "node-geohash",
    "url": "https://github.com/sunng87/node-geohash",
    "license": "MIT",
    "notices": [
      "vendor/round2/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "cspuz_core",
    "url": "https://github.com/semiexp/cspuz_core",
    "license": "主项目：MIT；Glucose / MiniSat 与运行库许可见原文",
    "notices": [
      "vendor/round3/LICENSE",
      "vendor/round3/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "Esolang Park",
    "url": "https://github.com/nilaymaj/esolang-park",
    "license": "MIT",
    "notices": [
      "vendor/coderunner/LICENSES.txt",
      "vendor/knowledge/esolang-park/LICENSE.txt"
    ],
    "role": ""
  },
  {
    "name": "Whitespace-JS",
    "url": "https://github.com/susisu/Whitespace-JS",
    "license": "MIT",
    "notices": [
      "vendor/coderunner/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "malbolge-vm",
    "url": "https://github.com/zb3/malbolge-vm",
    "license": "MIT",
    "notices": [
      "vendor/coderunner/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "Pyodide",
    "url": "https://github.com/pyodide/pyodide",
    "license": "Pyodide：MPL-2.0；CPython：PSF 及历史许可",
    "notices": [
      "vendor/coderunner/python/LICENSE.txt",
      "vendor/coderunner/python/CPYTHON-LICENSE.txt",
      "vendor/coderunner/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "quickjs-emscripten",
    "url": "https://github.com/justjake/quickjs-emscripten",
    "license": "MIT（包含底层 QuickJS 许可）",
    "notices": [
      "vendor/coderunner/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "Wasmoon",
    "url": "https://github.com/ceifa/wasmoon",
    "license": "MIT（包含 Lua 许可）",
    "notices": [
      "vendor/coderunner/LICENSES.txt",
      "vendor/coderunner/LUA-LICENSE.txt"
    ],
    "role": ""
  },
  {
    "name": "sql.js",
    "url": "https://github.com/sql-js/sql.js",
    "license": "sql.js：MIT；SQLite：公有领域",
    "notices": [
      "vendor/coderunner/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "Glucose / MiniSat",
    "url": "https://github.com/semiexp/glucose",
    "license": "Glucose/Syrup：自定义许可（含竞赛限制）；MiniSat：MIT",
    "notices": [
      "vendor/round3/LICENSE"
    ],
    "role": "纸笔谜题的底层 SAT 求解器"
  },
  {
    "name": "ZXing-C++",
    "url": "https://github.com/zxing-cpp/zxing-cpp",
    "license": "Apache-2.0",
    "notices": [
      "vendor/hunt/zxing/ZXing-C++-LICENSE.txt"
    ],
    "role": "zxing-wasm 使用的条码识别底层"
  },
  {
    "name": "chess.js",
    "url": "https://github.com/jhlywa/chess.js",
    "license": "BSD-2-Clause",
    "notices": [
      "vendor/round4/LICENSES.txt"
    ],
    "role": "第四轮空间与模拟工具及其运行依赖"
  },
  {
    "name": "konva",
    "url": "https://github.com/konvajs/konva",
    "license": "MIT",
    "notices": [
      "vendor/round4/LICENSES.txt"
    ],
    "role": "第四轮空间与模拟工具及其运行依赖"
  },
  {
    "name": "copy/life",
    "url": "https://github.com/copy/life",
    "license": "BSD-2-Clause",
    "notices": [
      "vendor/round4/LICENSES.txt"
    ],
    "role": "第四轮空间与模拟工具及其运行依赖"
  }
];
export const projectKey=url=>new URL(url).href.replace(/\/$/, "").toLowerCase();
export const projectLicense=url=>PROJECT_LICENSES.find(p=>projectKey(p.url)===projectKey(url));
