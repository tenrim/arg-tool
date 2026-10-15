> 当前状态（2026-10-11）：83 项来源许可登记；使用第三方代码、数据或素材的工具页脚列出实际来源，纯本站实现与浏览器内置接口不展示为项目；实际清单以 `public/project-licenses.js` 和 `upstream-manifest.json` 的 `components` 为准。旧纸笔编辑器以及图论路径、几何作图、数字电路和专用依赖已移除，相关旧记录仅供历史追溯；退役记录见 `retired_components`。当前原生纸笔工具使用 cspuz_core。验证数字与覆盖范围统一见 [VERIFICATION.md](VERIFICATION.md)。

# 第三方代码与授权

### Nodemailer（可选邮件反馈服务）

- 固定版本：10.1.1，来源：https://github.com/nodemailer/nodemailer ，许可 MIT-0。
- 用途：仅在独立服务端通过 SMTP 发送用户主动提交的问题报告；不进入浏览器运行包。
- 依赖与完整性锁：`services/feedback/package-lock.json`；许可原文：`public/licenses/nodemailer-MIT-0.txt`。
- 部署与数据边界：[结果联动与邮件反馈](docs/HANDOFF_FEEDBACK.md)。

## 随源码提供

### CyberChef

- 来源：<https://github.com/gchq/CyberChef>，版本 v11.5.0；发布提交 `8cd426dd4f40f1423912d5fad91b578a86a65112`。
- 官方发布 ZIP：`https://github.com/gchq/CyberChef/releases/download/v11.5.0/CyberChef_8cd426dd4f40f1423912d5fad91b578a86a65112.zip`。
- ZIP SHA-256：`f6478925d3eaa16ec08626a85f5b85eed10d531a5e18700615fed7ecb024cccf`。
- 授权：Apache-2.0，Crown Copyright 2016–2026。上游许可原文位于 `public/vendor/cyberchef/LICENSE.txt`；其内含组件的所有 `.LICENSE.txt` 声明均随包保留。源码及依赖清单位于上述固定版本的上游仓库。
- 使用范围：官方 ChefWorker、505 个操作参数定义、操作模块和运行资源。密码与编码、处理链由真实上游引擎执行，界面由本站实现，数据不通过本站服务端计算。用户主动选择 HTTP、DNS 或地图等操作时，遵循上游的联网行为。
- 包导入：`scripts/install-cyberchef.py` 只省略重复的 `.br` / `.gz` HTTP 压缩副本，保留 OCR 的 `.traineddata.gz`，并将 `CyberChef_v11.5.0.html` 重命名为 `index.html`。74 个运行文件的内容保持不变；逐文件摘要见 `public/vendor/cyberchef/UPSTREAM.json`。
- 引擎提取：`scripts/extract-cyberchef.mjs` 先核验全部上游运行文件，捕获官方发布包中的内联 ChefWorker 字节，保存为 `ChefWorker.js`；序列化上游操作与分类为 `catalogue.json`。没有改写运算代码；生成文件及来源摘要见 `ENGINE.json`，所需操作模块与资源仍使用原包。相关 ChefWorker 和模块依赖许可保持在 `assets/*.LICENSE.txt`。
- 本站适配：`public/cyberchef-client.js` 使用官方工作线程消息协议；`public/cyberchef.js` 和 `styles.css` 实现同一页面内的操作、参数、配方及输入输出，无 iframe 或独立窗口。原版完整 UI 保留在上游包供维护提取，不参与本站页面加载。HTML 结果只显示文本，不运行其脚本或外部资源。
- 中文适配：`public/cyberchef-i18n.js` 是本站原创的名称、标签、选项和简要说明，提供常用操作的详细中文说明，其余说明依据操作名与上游输入输出类型编写；不是对上游长篇说明的逐段译本。数据输出和配方值不做翻译。

### AperiSolve

- 仓库：<https://github.com/Zeecka/AperiSolve>；固定提交 `2a675c206cf7a4108682d6d96459c03680c9b2c4`。
- 授权：MIT，Copyright (c) 2026 Zeecka，原文保留于 `upstream/aperisolve/LICENSE` 与 `public/vendor/aperisolve/LICENSE.txt`。
- 原始代码：`decomposer.py`、`color_remapping.py`。在 `scripts/build-image-vendor.mjs` 中将 NumPy 位分解、RGB 叠加和随机映射操作移植为浏览器 RGBA 循环。源文件与输出摘要见 `public/vendor/aperisolve/UPSTREAM.json`。
- 完整服务端扫描与 Linux 分析程序未部署。图片页提供官方中文版入口，当前图片不会自动上传。

### StegOnline / PngToy

- 仓库：<https://github.com/Ge0rg3/StegOnline>；固定提交 `b9996d5e4830f3bd0e229b82f8b1b987adcce6a2`。
- StegOnline 授权：上游 README 声明 WTFPL，仓库没有独立 LICENSE 文件。README 原文保留在 `upstream/stegonline/README.md`，声明见 `public/vendor/stegonline/LICENSE.txt`。
- 直接复用 `ExtractDataService`、`BitPlaneBrowserComponent` 与 `HelpersService`。生成脚本移除 Angular 注入、装饰器及事件发射器，转换 TypeScript；运算逻辑保持原样。调用适配仅导出完整字节并限制最大输出，修正上游末尾不足一个字节时输出半字节的行为。
- PNG 解码使用上游随包的 PngToy 0.4.0 ALPHA，MIT，Ken Nilsen / Epistemex (c) 2015。`pngtoy.min.js` 字节与要求保留的许可头完整保留。
- 原始源码和生成摘要见 `upstream/stegonline/`、`public/vendor/stegonline/UPSTREAM.json`。本站只复用图层浏览、数据提取与 PNG 解码，不提供上游数据嵌入界面。

### puzzle-lib

- 来源：<https://github.com/kfarnung/puzzle-lib>
- 上游版本：1.7.0；固定 Git tree：`232b5eb5feaac4673dfa3af3551c81bdb4cd1d01`。
- 授权：MIT，Copyright (c) 2018 Kyle Farnung。
- 原始文件：`upstream/puzzle-lib/src/` 与 `upstream/puzzle-lib/LICENSE`。
- 使用范围：当前符号对照页使用 Morse、Braille 及其 Common、Conversion 依赖。Cipher 转换函数仍作为内部兼容实现保留，已由 CyberChef 接管原来的文本工具界面。Semaphore 源码作为符号扩展接口保留，目前未接入界面。
- 改动：Node.js 将 TypeScript 转成 JavaScript，并为浏览器相对导入补全 `.js` 扩展名。原始上游源码保持不变。
- 生成输出：`public/vendor/puzzle-lib/`，附 `LICENSE.txt`。

### jsQR

- 来源：<https://github.com/cozmo/jsQR>，版本 1.4.0。
- 授权：Apache License 2.0。
- 原始分发文件：`dist/jsQR.js`，Git blob `99ea9df26907009e5553233ffe03c529c1521739`。
- 使用范围：图片页二维码识别；`public/vendor/jsqr.js`，内容未改动；附 `public/vendor/jsqr-LICENSE.txt`。

### fft.js

- 来源：<https://github.com/indutny/fft.js>，版本 4.0.4。
- 授权：MIT，Copyright Fedor Indutny, 2017。
- 原始文件：`upstream/fft.js/fft.cjs`，Git blob `c13b408614877ffbcf1f9a25b8a525f5445394ce`；授权原文位于保留的 README。
- 改动：仅把 CommonJS `module.exports = FFT` 改为 ESM `export default FFT`，以便浏览器和后台线程使用。
- 输出：`public/vendor/fft.js` 与 `public/vendor/fft-LICENSE.txt`。

### Noto Serif SC（界面字形子集）

- 来源：Google Fonts `ofl/notoserifsc/NotoSerifSC[wght].ttf`：<https://github.com/google/fonts/tree/main/ofl/notoserifsc>。
- 原始 Git blob：`eab063faf229160a52d3760f5555150e4eb9e5bf`；SHA-256：`050080d9255a86808f2945bffac582b31ef32bc36411ce29563b4961670c66f9`。
- 授权：SIL OFL 1.1，Copyright 2012 Google Inc.；完整许可见 `public/fonts/NotoSerifSC-OFL.txt`。
- 改动：以 fontTools 保留界面源码中的字形与可变字重，并转换为 WOFF2。维护脚本为 `scripts/subset-ui-font.py`。用户输入中未包含的字符使用系统字体回退。
- 输出：`public/fonts/noto-serif-sc-ui.woff2`，目前用于站名与少量目录标题。原始 25 MB TTF 不随站点提供。

### Noto Sans SC（中文界面字形子集）

- 来源：Google Fonts `ofl/notosanssc/NotoSansSC[wght].ttf`：<https://github.com/google/fonts/tree/main/ofl/notosanssc>。
- 固定提交：`2894aab31764f10f29c421bdfd2340d3b382d384`；原始 Git blob：`fb0637bafbcd804fe32152370a1225990745b4bc`；源文件 SHA-256：`a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da`。维护脚本先校验原始文件；输出 SHA-256 登记在 `upstream-manifest.json`。
- 授权：SIL OFL 1.1，Copyright 2014–2021 Adobe，Reserved Font Name 为 Source；完整原文见 `public/fonts/NotoSansSC-OFL.txt`，内容 SHA-256 为 `1c05c68c34f9708415aada51f17e1b0092d2cea709bf4a94cd38114f9e73d7d9`。
- 改动：`scripts/subset-ui-sans.py` 使用 fontTools 4.60.1 / Brotli 1.2.0 保留本站原生 HTML、JS、CSS 的界面字形与可变字重，转换为 WOFF2，保留字体内部名称和版权信息。上游目录不参与字形扫描；原始 17.8 MB TTF 位于仓库外，不随站点提供。
- 输出：`public/fonts/noto-sans-sc-ui.woff2`。用于中文界面和工具标题，同时替代等宽输入区的中文衬线回退；未覆盖的用户字符使用系统黑体回退。正常构建离线，不制作子集或更新字体。

### Inter

- 来源：<https://github.com/rsms/inter>，固定版本 4.1，官方 `docs/font-files/InterVariable.woff2`；Git blob 为 `5a8d3e72ad7ffb62af3b146e1b1f54ab5813a212`。
- 文件 SHA-256：`693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3`。
- 授权：SIL OFL 1.1，Copyright 2016 The Inter Project Authors；完整原文见 `public/fonts/Inter-OFL.txt`，SHA-256 为 `262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a`。
- 本地文件：`public/fonts/inter-variable.woff2`，未修改官方分发字节。用于英文界面文字与数字，中文使用 Noto Sans SC；页面不请求 Google Fonts 或字体 CDN。

### JetBrains Mono

- 来源：<https://github.com/JetBrains/JetBrainsMono>；分发包 `@fontsource-variable/jetbrains-mono@5.2.8`。
- 固定下载地址：`https://cdn.jsdelivr.net/npm/@fontsource-variable/jetbrains-mono@5.2.8/files/jetbrains-mono-latin-wght-normal.woff2`。
- SHA-256：`18be452724bfdc236c074ca94a249a7f41a86752c7d04ab258ce9ed5651f6a7e`。
- 授权：SIL OFL 1.1，Copyright 2020 The JetBrains Mono Project Authors；完整许可见 `public/fonts/JetBrainsMono-OFL.txt`。
- 本地文件：`public/fonts/jetbrains-mono-latin.woff2`，内容未改动，用于英文标签和代码文本。

### 编年史视觉参考

用户提供的迁移包用于核对首页的颜色、字体、边框、扫描线和导航语言。本站保留独立的工具界面实现；早期侧栏、目录和搜索交互参考 IT-Tools，现有四类能力总览与任务组织由本站实现；未引入 IT-Tools 源代码或运行依赖，不将其列为已集成项目。配色与静态 CRT 纹理沿用编年史参考，不分发迁移包的后台、账号逻辑或用户上传素材。

## 按需组件

图片页首次使用元数据时加载以下固定版本，所选图片仍在浏览器内处理。CyberChef 自带的相关操作继续由其官方运行包负责。

### exifr 7.1.3

- 来源：<https://github.com/MikeKovarik/exifr>；MIT。
- 固定来源：`https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/full.umd.js`；原字节保留在 `public/vendor/exifr.js`，MIT 原文在 `public/licenses/exifr-7.1.3-MIT.txt`。运行时从本站加载；版本、来源与 SHA-256 记录在 upstream-manifest.json。
- 对用户选择的图片在浏览器内进行元数据分析，不提交图片给 CDN。

图片 OCR 入口及 Tesseract.js 7.0.0 按需加载代码已按用户要求移除。CyberChef 的官方包及其原始许可文件保持完整。

## 后续选型注意

本站未整库复用 The Belfry。它的仓库主许可证与部分声明移植自 GPLv2 的 steghide 代码需要分别核清。FFmpeg.wasm 的 MIT 封装与 FFmpeg 核心及编解码库的许可也不能混为一谈。

`media.js` 中的图像通道、灰度、反色、对比度、PNG 数据块、历史 LSB 兼容函数，以及本站 WAV 编码、频谱组织和 DTMF 检测为自编实现。当前图片页保留这些图像调整和文件信息功能，补充调用上述 AperiSolve / StegOnline 适配；没有复用 The Belfry 的代码。

## 浏览器解谜组件（含已退役组件的历史记录）

表中的 pzprjs、penpa、noqx、sudoku、exolve、exet 均已退役，以下对应改造说明描述历史版本；这些运行包和编辑器不属于当前发布。其余列出的查词、立体图、音视频和条码组件仍在使用。

所有固定来源见 `upstream-manifest.json` 和 `public/vendor/hunt/PROJECTS.json`，逐文件 SHA-256 见 `public/vendor/hunt/INTEGRITY.json`。本地运行目录保留 README、LICENSE 及内含依赖声明。

| 项目 | 固定提交 / npm 版本 | 授权 |
| --- | --- | --- |
| [cipher-machine](https://github.com/philippica/cipher_machine) | `29fa4ee1c60873484688c250b37c87d93f54cae4` | BSD-3-Clause |
| [chinese-puzzle](https://github.com/philippica/ChinesePuzzleTool) | `8b4ebec728138981a94b4ff743026084e9e37ef5` | BSD-2-Clause |
| [pzprjs](https://github.com/robx/pzprjs) | `8d3415a0336a5032bb650b6aa831705c33fe47d2` | MIT; emoji OFL-1.1 |
| [penpa](https://github.com/swaroopg92/penpa-edit) | `34e3fe97804e518288870b70d919e7e76ee18b4d` | MIT; bundled dependency notices |
| [noqx](https://github.com/T0nyX1ang/noqx) | `706540dfb4c7d67919bb5029e4741838c5981501` | Apache-2.0 (selected); Penpa+ MIT; bundled runtime notices |
| [sudoku](https://github.com/sigh/Interactive-Sudoku-Solver) | `5ae66740ad2634312e9ea48781893fbbb842a0e3` | MIT |
| [exolve](https://github.com/viresh-ratnakar/exolve) | `d0be2ed636afdb1542964d9e59f0590351521b0d` | MIT |
| [exet](https://github.com/viresh-ratnakar/exet) | `ea5711805d7733ebd5350d5a49f082b10389dd40` | MIT; lexicon notices in source |
| [stereogram](https://github.com/piellardj/stereogram-solver) | `ef4e8251dde6d7ecd4856bc43be70fe3ec5484f3` | MIT |
| [sstv](https://github.com/Equinoxis/sstv-decoder) | `2b1f236a394faad784b273f5aeeb3ec637ac8749` | MIT declaration in README; no standalone LICENSE upstream |
| [ffmpeg](https://github.com/ffmpegwasm/ffmpeg.wasm) | `0.12.15` | MIT |
| [ffmpeg-core](https://github.com/ffmpegwasm/ffmpeg.wasm) | `0.12.10` | GPL-2.0-or-later |
| [zxing](https://github.com/Sec-ant/zxing-wasm) | `2.2.4` | MIT |

- cipher_machine：保留原始 Trie、OneWord、WordSearch 与词库于 `upstream/hunt/cipher-machine`；浏览器适配补全 ESM 路径，将两个字符串正则 eval 改为 RegExp，移除调试输出。ChinesePuzzleTool 保留上游原始 HTML 和数据，提取查询算法并增加无效表达式检查。
- 历史已退役 pzprjs：曾使用官方编译棋盘和规则组件；Penpa+、Noqx、Interactive Sudoku Solver、Exet：保留实际上游页面和引擎，增加同域导航、中文常用控件、响应式主题及来源页脚。移除遥测加载。Noqx 按上游部署流程裁剪 Python 类型引用，修正本地 Clingo 路径与中文按钮状态判断；内含 PyScript、MicroPython 和 Clingo 的许可原文随包保存。
- 历史已退役 Exolve：曾用于实际渲染及格式转换；本站传入内容先用已有 DOMPurify 清理。Exet 的英语词库与词形表随包提供，词库的原始许可声明保留于源码与 README；未打包所有语言词库。
- 历史 cspuz 纸笔题链接求解已按用户要求移除，运行包不再发布。`upstream/hunt/cspuz` 仅保留历史构建补丁，不属于当前集成功能。
- stereogram-solver：使用原始周期检测算法与位移差分算法，TypeScript 转为 JS，在 Worker 中将 canvas 改为 OffscreenCanvas。zxing-wasm：打包官方 npm ESM 并使用原始 WASM；MIT，底层 ZXing-C++ Apache-2.0 声明另行保留。
- SSTV Decoder：使用原始 decoder worker、模式模块与 FFT。上游 README 明确声明 MIT，但没有独立 LICENSE 文件；完整 README 保留，本记录不虚构独立许可证。没有复用缺乏明确许可的 pefech/js-sstv。
- ffmpeg.wasm：封装 @ffmpeg/ffmpeg 0.12.15 为 MIT；@ffmpeg/core 0.12.10 当前单线程核心为 **GPL-2.0-or-later**，不能将整个核心标为 MIT。GPL 原文随包保存。核心仅作无损 gzip 压缩，浏览器解压后执行。对应构建源码为 <https://github.com/ffmpegwasm/ffmpeg.wasm/tree/71aa99d37c02a7b4c435275ca9ef50e612f6efa1>，FFmpeg 源码为 <https://github.com/FFmpeg/FFmpeg/tree/n5.1.4>；构建配方、版本与依赖源码地址保留在 `upstream/hunt/ffmpeg-build/` 的 Dockerfile、build/、src/。这些依赖各自的许可继续适用。

普通构建直接复制已检入的运行文件，不重新抓取上游或改变版本。实际页面底部提供各项目的直接链接；本站仓库不作为工具来源展示。

### 历史：已退役编辑器的界面与触屏适配（2026-10-08）

`public/ui-theme.css` 与 `public/hunt-native.css` 提供统一主题；`public/hunt-layout.js` 重排现有控件节点，保留上游事件与状态。Penpa / Noqx 的 `coord_point` 从 offsetLeft 改为可见画布边界与原始尺寸换算，以支持嵌套布局、滚动和缩放后的准确输入；修改由 `scripts/finalize-hunt-projects.mjs` 生成。数字快捷键使用上游编辑器接口，ISS 通过原有输入事件录入。Exet 重新导入题面时自动适配新生成的编辑区。未修改求解算法和第三方授权。

### 历史：已退役同文档编辑器与 Penpa 求解（2026-10-08）

`scripts/build-embedded-editors.mjs` 从保留的固定版本资源生成 `public/vendor/hunt/embedded`：经典脚本增加作用域包装，顶层声明通过属性暴露给同一编辑器；ISS UI 模块绑定自己的 document/window/Worker，原始计算线程不改动。Exet 词库及延迟库使用相同隔离，去掉空地址资料 iframe 的自动主页面加载，项目说明改为站内中文文字，未打包的词库选项不显示。原始源文件与许可证继续保留。Acorn 8.15.0 仅是维护时解析器，不随浏览器运行。

Noqx 的 prepare/generate/store 调用改为异步 Worker 消息；`public/embedded/noqx-worker.js` 直接使用随包的 MicroPython、原始 Noqx Python 规则与 clingo-wasm，省去主文档中的 PyScript 启动层。实际依赖仍为 Noqx（Apache-2.0）、MicroPython（MIT）和 clingo-wasm / Clingo（各自随包许可），Penpa+（MIT）负责棋盘和答案显示。新增 Penpa 求解界面调用同一真实引擎，不把题型元数据或显示结果冒充求解。未升级固定版本。

原生编辑器的中文展示在 `hunt-translations.json` / `hunt-native.js` 维护；生成适配文件和资源一起记录在 INTEGRITY.json。原始英文帮助、题型代码和用户数据保留。

## 第一轮扩充（2026-10-08）

来源见 `upstream-manifest.json` 与 `public/vendor/round1/PROJECTS.json`；逐文件摘要见 `INTEGRITY.json`。固定导入脚本为 `scripts/import-round-one.py`，生成适配在 `scripts/build-round-one.mjs`。运行时全部从本站加载，不调用这些项目的在线服务。

| 项目 | 版本 / 固定提交 | 用途与许可 |
| --- | --- | --- |
| [cnchar](https://github.com/theajack/cnchar) 及 order/radical/code/input/idiom/xhy/trad | 3.2.6 | 字属性、反查、成语和编码；MIT |
| [pinyin-pro](https://github.com/zh-lx/pinyin-pro) | 3.29.4 | 语境拼音、声调；MIT |
| [OpenCC-JS](https://github.com/nk2028/opencc-js) | 1.4.2 | 简繁转换；MIT，数据 Apache-2.0，随附 LICENSES |
| [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) | bddc96d41bef78427ed0e034e9f7e31d71fd1b92 | 仅 dictionary.txt 结构数据；LGPL-3.0-or-later，COPYING/LGPL/GPL 随附；未使用 graphics.txt |
| [chinese-telegraph-code](https://github.com/kirklin/chinese-telegraph-code) | 3f71155805e6905992c630ccb90119dde6877cfe | 大陆/台湾电码；MIT 代码与 Unicode 数据许可分别保留 |
| [substitution-cipher-solver](https://github.com/cateyelow/substitution-cipher-solver) | c4acfdec7e33ab58885c248142a2d34ed68233f6 | 英文三元组评分、爬山及模拟退火；MIT |
| [Tone.js](https://github.com/Tonejs/Tone.js) | 15.1.22 | Web Audio 合成音色；MIT，保留 bundle 依赖声明 |
| [cubing.js](https://github.com/cubing/cubing.js) | 0.63.8 | 三维魔方；MPL-2.0 / GPL-3.0-or-later 双许可，本站选择 MPL-2.0 |
| [cubejs](https://github.com/ldez/cubejs) | 1.3.2 | 魔方状态与两阶段求解；MIT |
| [Three.js](https://github.com/mrdoob/three.js) | 0.170.0 | cubing.js 三维依赖；MIT |
| [random-uint-below](https://github.com/lgarron/random-uint-below.js) | 3.3.0 | cubing.js 随机数依赖；Unlicense |
| [QRazyBox](https://github.com/Merricx/qrazybox) | 72a0b00717c8bdebb6932174274c981e2c78fdaa | 仅结构模板及版本图案表；MIT |

单表替换原始 TypeScript 源码保留，构建时增加锁定映射限制，搜索只交换未锁定字母；计算在 Worker 内执行。cubing.js 仅将 npm 裸模块路径改为本地相对路径，其对应源码固定在 `d02c02fc90f3410e612315141072a47af03feb97`，原 MPL/GPL 许可保留。Make Me a Hanzi 的字典保持原文，未将 LGPL 数据改标为 MIT。

二维码模板由保留的 QRazyBox `js/qr.js`、`js/table.js` 生成 ESM 包装；没有复制其 sqrd 或其他纠错移植。实际解码复用现有 jsQR（Apache-2.0）。格式 BCH、网格编辑、图片采样与格式枚举为本站实现。Magic 复用未修改的官方 CyberChef Worker；字频、IC、卡西斯基间距、凯撒/维吉尼亚候选是本站实现。交互旗语/盲文/摩斯复用已有 puzzle-lib，猪圈和数码管输入是本站规则实现。没有集成或冒称 Quipqiup 官方代码，也不将仅研究过的仓库列为依赖。

## 历史：已退役网格与逻辑合并（2026-10-08）

Penpa+ 是唯一编辑界面，Noqx 提供同页自动求解；不再载入独立 Noqx UI。原始两项目代码及许可继续保留。Noqx 的形状预设从固定版本 `app/js/param.js` 提取为 `embedded/noqx-presets.json`，生成脚本为 `scripts/build-solver-data.mjs`，复用范围新增至形状数据；未升级上游。自定义形状输入、预览、参数草稿、分享配置和兼容入口为本站适配。求解仍在原有 MicroPython / Clingo Worker 运行，不使用远程服务。

## 第二轮纯前端集成（2026-10-08）

以下项目的实际代码已打包为本地 ESM，无 CDN 或在线运算调用。新增界面、任务取消、资源上限、时间与坐标输入校验属于本站适配，不声称属于上游。固定 npm 版本及传递依赖由 `upstream/round2/package-lock.json` 记录（含 npm integrity）；所用原始源文件、README、package.json 与许可保留在 `upstream/round2/sources/`。`public/vendor/round2/UPSTREAM.json` 记录逐文件 SHA-256；`LICENSES.txt` 集中保留版权声明。导入脚本为 `scripts/import-round-two.mjs`，esbuild 0.25.12 仅用于维护打包。

| 项目 | 固定版本 | 实际用途 | 许可 |
| --- | --- | --- | --- |
| [Pitchy](https://github.com/ianprime0509/pitchy) | 4.1.0 | McLeod 单音音高检测，依赖 fft.js | MIT |
| [Tonal](https://github.com/tonaljs/tonal) | 6.5.0 | 音符、频率、音程、和弦、音阶 | MIT |
| [Tonejs/Midi](https://github.com/Tonejs/Midi) | 2.0.28 | 标准 MIDI 读写，依赖 midi-file / array-flatten | MIT |
| [Pixelmatch](https://github.com/mapbox/pixelmatch) | 8.0.0 | 双图感知差异统计与着色；未使用其 Node CLI / pngjs | ISC |
| [Chroma.js](https://github.com/gka/chroma.js) | 3.2.0 | 色彩空间换算 | BSD-3-Clause，内含 ColorBrewer 配色许可 Apache-2.0；保留完整原文 |
| [fflate](https://github.com/101arrowz/fflate) | 0.8.3 | 流式 Deflate/GZIP 解压及 ZIP 创建 | MIT |
| [Proj4js](https://github.com/proj4js/proj4js) | 2.22.0 | WGS84 / UTM 投影换算，依赖 wkt-parser 与其自带 MGRS | MIT |
| [MGRS](https://github.com/proj4js/mgrs) | 2.2.0 | MGRS 编码与网格中心解码 | MIT |
| [node-geohash](https://github.com/sunng87/node-geohash) | 0.6.4 | Geohash 编码、解码 | MIT |

保留的 Tonal 子包来自同一 MIT 仓库；个别 npm 子包缺少 LICENSE 文件，导入时从 Tonal 6.5.0 根包复制同项目原文。fft.js 4.0.4 的 MIT 原文位于 README，另外提取为 LICENSE，并保留 README。项目来源只列真正使用的代码；已研究但未使用的项目不列为集成。

原 Tone.js 琴键、QRazyBox / jsQR 修复功能通过移动原 DOM 节点合并，计算引擎未替换。纯像素叠加/XOR、ZIP 目录读取与 CRC 验证、球面距离和 JD 换算是本站实现；不归因于其他项目。每个合并页面末尾汇总其所有实际项目链接。

## 第三轮原生纸笔解题（2026-10-08）

第三轮仅复用 [cspuz_core / cspuz_rs_puzzles](https://github.com/semiexp/cspuz_core) 提交 `d88f99c8c7872d400d2f0d2456860f50f3d1f1f6` 的四种规则求解：数独、数回、数墙、照明。新增 arg_solve_board 整数网格 C ABI 返回所有解共同确定的值；不接入上游 UI、URL 求解入口或在线服务。数回规则补充一条“至少有一条边”的约束，以排除上游通用环约束允许的空解，其他三种规则未改动。适配与补丁由 scripts/build-round-three.py 完整生成。

求解底层为 [semiexp/glucose](https://github.com/semiexp/glucose)，固定 `240ac9aed87e3c23bbd126a43080208c351faba4`。cspuz_core 主项目为 MIT，但其 Glucose / MiniSat 声明及 Glucose-Syrup 条款不能用一个 MIT 标签代替；原文完整保留于运行目录 LICENSE 与 LICENSES.txt。当前构建使用单线程 Glucose，不启用 Cadical 或 glucose_rs 后端。原始源码快照为 upstream/round3/cspuz-core-source.tar.gz，包含固定子模块；保留子模块不代表运行时使用。

Rust 1.85.1 / Emscripten 3.1.69 生成 ESM 加载器和 WASM，运行文件约 550 KB（未压缩）。json 0.12.4、Rust 标准库和 Emscripten 所带运行库声明汇总保留在 LICENSES.txt，Cargo.lock 固定传递依赖，SHA-256 见 public/vendor/round3/UPSTREAM.json。中文棋盘、输入与结果模型、存储、SVG、Worker 消息适配属于本站实现。没有重新集成 Penpa / Noqx、pzprjs、ISS、Exet / Exolve。

## CyberChef 任务界面重组（2026-10-08）

沿用原固定 CyberChef 11.5.0 官方运行文件、ChefWorker、模块、字体及 bundled notices，未修改上游分发字节、版本或 ENGINE.json / UPSTREAM.json。新界面位于 `public/chef-tools/`，属于本站适配，复用同一 `CyberChefClient`；参数 schema 渲染从原配方编辑器提取并共用。没有为这些功能另引入图片/压缩/图表库，CyberChef 内含依赖仍遵守原分发包的逐模块许可。

协议适配增加原始 File / List<File> / HTML 结果处理，保留 JSON 与二进制字节；原配方调用保持原协议。`docURL` 使用同源根路径，使 Jimp 的路径拼接正确读取随包字体图片，未改写 Image 模块。图像结果以本地 Blob 预览；数据图表只重建允许的 SVG 几何和有限样式，HTML 只提取安全文本，不执行上游展示脚本。具体项目与链接仍在各使用该引擎的工具页最后列出。

505 项用途映射及未开放快捷入口的说明记录在 `upstream/cyberchef/task-map.json`。没有恢复图片 OCR。`public/cyberchef-worker.js` 是本站类型兼容适配：在官方 Image 模块载入后，仅将 Remove EXIF 的 Uint8Array 返回值转为其声明的 byteArray（普通数组）。官方脚本、引擎摘要及 JPEG 移除算法均不变；保留完整上游许可，实际运算仍归因于 CyberChef。此修复同时适用于图片页和处理链。

## 代码运行（2026-10-08）

实际运行资源位于 `public/vendor/coderunner/`，逐文件校验与 npm 包来源/完整性摘要见 `UPSTREAM.json`。维护依赖锁位于 `upstream/coderunner/package-lock.json`；上游 TS 原文与校验保留在 `esolang-park/` 和 `SOURCE.json`。正常构建使用固定运行字节，不安装依赖或联网。

| 项目 | 固定版本/提交 | 实际用途与授权 |
| --- | --- | --- |
| [Esolang Park](https://github.com/nilaymaj/esolang-park) | d84b21c333dc4ce417e0841145d69f04de1a4e2e | Brainfuck、Befunge-93、Deadfish 的真实解释核心；MIT，`esolang-park.LICENSE.txt` |
| [Whitespace-JS](https://github.com/susisu/Whitespace-JS) | 0.0.8 | 解析器、编译指令与 32 位 VM；MIT，包含 loquat/co 的独立许可 |
| [malbolge-vm](https://github.com/zb3/malbolge-vm) | 1.0.4 | 标准 Malbolge 执行和寄存器；MIT |
| [Pyodide](https://github.com/pyodide/pyodide) | 0.29.3 | CPython 3.13.2 的本地 WASM 和随包标准库；MPL-2.0，另保留 CPython 的 PSF 许可及其历史声明 |
| [quickjs-emscripten](https://github.com/justjake/quickjs-emscripten) | 0.32.0 | QuickJS release-sync 引擎、桥接及 FFI；MIT，含底层 QuickJS 作者许可 |
| [Wasmoon](https://github.com/ceifa/wasmoon) | 1.16.0 | Lua 5.4 WASM 引擎；MIT，另保留 Lua 作者声明 |
| [sql.js](https://github.com/sql-js/sql.js) | 1.14.2 | SQLite WASM、数据库导入查询及导出；MIT，SQLite 本体为公有领域 |

npm 组件及传递依赖许可汇总于 `LICENSES.txt`，Python 原文在 `python/LICENSE.txt`、`python/CPYTHON-LICENSE.txt`，Lua 原文在 `LUA-LICENSE.txt`。维护脚本使用 esbuild 0.28.2（MIT）生成 ESM 包，保留法律注释；Pyodide、SQL 与 WASM 运行文件按原字节复制。Ook! 的语法适配、本站界面、限额、输入输出和 Worker 管理为原创实现，不将外部完整 IDE 作为已集成项目。

未接入本轮的 Chef、Shakespeare、Piet、文言、LOLCODE、Ruby、C/C++、Piston、Judge0 和 TIO 不作为运行依赖展示。

## 历史统计：2026-10-08 统一许可证展示

- `public/project-licenses.js` 对应 46 个当前使用的项目来源；来源卡片及 66 处工具页脚链接统一显示许可，保留实际源代码链接。`project-sources.js` 仅用文本节点展示许可原文。
- 明确区分 FFmpeg 封装 MIT / 核心 GPL-2.0-or-later、ZXing 封装 MIT / C++ 核心 Apache-2.0、OpenCC 代码 MIT / 数据 Apache-2.0，以及电码数据的 Unicode 许可。cubing.js 选择 MPL-2.0；Make Me a Hanzi 只使用 LGPL-3.0-or-later 字典数据。
- Glucose / Syrup 的自定义许可包含 SAT 竞赛限制，不能笼统写成 MIT；原文同 MiniSat MIT 声明完整保存在 `public/vendor/round3/LICENSE`。SSTV 与 StegOnline 保留上游 README 的许可声明，不虚构不存在的独立原文。
- Pyodide / CPython、QuickJS、Lua、SQLite 及各自打包依赖声明仍随运行包保留。字体使用 OFL-1.1，浏览器内置 API 不适用第三方代码许可标签。
- 测试使用 Playwright 1.62.1（Apache-2.0），由 `test-tools/package-lock.json` 固定，仅开发使用，不进入网页发布包。测试素材来源见 `tests/fixtures/README.md`。

## 第四轮：保留的四种工具（2026-10-08 发布整理）

实际使用的引擎（全部本地按需加载）：Konva 10.7.1（MIT，碎片 Canvas 变换），chess.js 1.4.0（BSD-2-Clause，国际象棋规则/PGN/FEN），copy/life 提交 `924c90afb529ad5d417f11d795bc1b400fff8d18`（BSD-2-Clause，Hashlife），Three.js 0.170.0（MIT，模型加载/OrbitControls/WebGL；与已有魔方依赖版本相同）。

按用户要求移除图论、几何、电路及其专属 Cytoscape.js、JSXGraph、DigitalJS、JointJS 等依赖，不再向访客分发这些模块或其源码归档。历史版本及对应声明仍可通过 Git 历史追溯。该轮完成时为 49 项许可登记；之后增加 Inter 与 Noto Sans SC 为 51 项；本轮科学与历法再增加 6 项，该阶段为 57 项；信息查询新增 11 项为 68 项；可视浏览增加 Natural Earth 地图数据，该阶段为 69 项；塔罗公版牌面增加 TarotCards 素材，该阶段为 70 项；Gearberry 现代牌面再增加 1 项，该阶段为 71 项。

使用源码保留于 `upstream/round4/sources/`；许可原文在 `public/vendor/round4/LICENSES.txt`，项目来源目录逐项标明许可。copy/life 原文件位于 `upstream/round4/life/`，浏览器版本仅追加 ESM export。逐文件摘要见 `public/vendor/round4/UPSTREAM.json`。

维护重打包：`npm ci --ignore-scripts --prefix upstream/round4`，然后 `node scripts/import-round-four.mjs`；需要 Node.js 24，联网仅用于维护依赖安装。维护用 esbuild 0.25.12 为 MIT，不是运行依赖。普通测试和部署构建不安装这些包，也不访问 CDN。完整性检查覆盖发布运行文件、许可和所保存的上游源码。


## 科学与历法（当前在用）

本轮新增 Astronomy Engine（MIT）、lunar-javascript（MIT）、Periodic-Table-JSON（CC BY-SA 3.0 数据）、SeqViz（MIT）、NtSeq（MIT，SeqViz 密码子映射的上游来源）、RDKit MinimalLib（BSD-3-Clause）。具体固定版本、提交、复用范围和改编方式见 [upstream/science/README.md](upstream/science/README.md)。原始源码/分发文件保存在 `upstream/science/sources/`，随站点分发的许可文件位于 `public/vendor/science/*-LICENSE.txt`，全部登记到来源页面与对应工具页脚。

元素派生数据沿用 CC BY-SA 3.0：字段筛选至 118 元素的基础属性并添加中文名，不下载其外部图片。SeqViz 仅使用本地序列算法，无远程 WebFont 或上游界面。RDKit 使用对应发布版 JS/WASM，生成的分子 SVG 通过图片元素显示。


## 信息查询与晶体联动（2026-10-09）

固定提交、原始文件、下载地址与 SHA-256 见 [upstream/reference/README.md](upstream/reference/README.md)、`upstream/reference/pins.json` / `imports.json`；运行数据和摘要在 `public/vendor/reference/`。这些独立清单与总来源登记共同接受完整性审计。

| 实际来源 | 使用范围 | 许可 |
| --- | --- | --- |
| [Countries](https://github.com/annexare/Countries) | 国家、地区、首都、区号、货币、语言 | MIT |
| [flag-icons](https://github.com/lipis/flag-icons) | 250 面本地 SVG 旗帜 | MIT |
| [OurAirports](https://github.com/davidmegginson/ourairports-data) | 机场及设施 CSV 投影 | Unlicense / public domain |
| [UN/LOCODE dataset](https://github.com/datasets/un-locode) | 运输地点数据；保留状态、日期、功能 | PDDL-1.0；原声明在随包 README |
| [Unicode UCD](https://github.com/unicode-org/unicodetools) | 17.0.0 字符、范围、区块、文字系统和别名 | Unicode-3.0 |
| [i-ching](https://github.com/strobus/i-ching) | 八卦、六十四卦资料与爻形 | MIT |
| [Tarot Card Data](https://github.com/smallcat419/tarot-card-data) | 78 张牌的识别字段；中文名和简短关键词由本站编写 | CC0-1.0；保留 README 声明 |
| [TarotCards](https://github.com/mixvlad/TarotCards) | 78 张 1909 年 RWS 牌面 JPG，逐字节本地分发 | 公共领域（牌面）；MIT（随附来源文档） |
| [Gearberry Tarot Cards WebP Collection](https://github.com/reginanka/tarot-cards) | 默认蓝金幻想牌面；78 张原始 WebP，按牌名对应 | CC BY 4.0（按上游明确牌面声明） |
| [Color Names](https://github.com/meodai/color-names) | 颜色名称与 HEX | MIT |
| [ICS chart](https://github.com/i-c-stratigraphy/chart) | 地质年代表派生索引，保留层级、中文名与边界 | CC-BY-4.0 |
| [OEIS data](https://github.com/oeis/oeisdata) | 272 条精选数列的已知整数、名称、offset；原条目含原始引用 | CC-BY-SA-4.0；派生数列索引继续使用此许可 |
| [Crystallography Open Database](https://www.crystallography.net/cod/) | 14 份 CIF 数据，经固定 cod-tools 测试数据快照取得；保留 CIF 作者及论文信息 | CC0-1.0 / public domain；没有引入 cod-tools 程序代码 |

国家中文显示名在维护阶段由 Node Intl 生成并固定；Unicode 标准名称与专名保留来源写法。三维显示继续使用已登记的 Three.js（MIT）；CIF 解析、有限对称表达式计算和同页桥接为本站实现，不执行 CIF 中的代码，不把镜像程序的许可误套给数据。运行时不查询远程 OEIS、COD 或运输数据服务。


## 可视浏览地图（2026-10-09）

[Natural Earth](https://github.com/nvkelso/natural-earth-vector) 固定提交 `ca96624a56bd078437bca8184e78163e5039ad19`，使用 `geojson/ne_110m_admin_0_countries.geojson` 的 177 个轮廓。上游明确将全部地图数据置于公共领域；完整声明位于 `upstream/reference/sources/natural-earth-LICENSE.txt` 与运行目录同名文件。源 GeoJSON 保存原始字节，派生路径保留所有多边形环、孔洞和跨日期变更线的分段，按等距圆柱投影生成本地 SVG 坐标。固定 URL 与摘要见 reference 的 pins/imports/UPSTREAM 清单；普通构建不抓取地图。

世界地图用于国家、机场、运输地点三页，均补充了具体用途和许可页脚。机场坐标来自 OurAirports，运输地点坐标按 UN/LOCODE 度分记录换算，不由地图推断。八卦先天／后天排列为传统图式；塔罗叠牌、晶胞、字符表、连续色盘与数列图为本站界面实现；塔罗图片来源另列如下，运行时不请求外部图片服务。

## 塔罗公版牌面（2026-10-09）

[TarotCards](https://github.com/mixvlad/TarotCards) 固定提交 `840b84d012c6b74dc1634fa2d00d1b21f5b28093`，仅使用 `tarot/rider-waite/720px` 的 78 张 720×1200 JPG，不引入其他牌系、封面或脚本。原始字节同时保留在 upstream/reference/sources/tarot-art 和 public/vendor/reference/tarot-art，没有二次上色、裁切或缩放。

仓库 README、SOURCES 和牌组 metadata 明确区分：1909 年 Rider–Waite–Smith 牌面属于公共领域；附带文档为 MIT，牌面不标成软件 MIT。原画 Pamela Colman Smith，设计 Arthur Edward Waite，出版 Rider & Company；1909 Pam-A 牌组扫描修复归属 Steve P.，原来源为 https://steve-p.org/cards/RWSa.html。三份原文、MIT LICENSE 与本站 NOTICE 全部随包提供，可在项目来源页读取；固定 URL 和逐图 SHA-256 记录在 imports/UPSTREAM。

力量对应 08_Strength，正义对应 11_Justice；小阿尔卡那 01–10、11 侍从、12 骑士、13 王后、14 国王，Pents 对应星币。中文牌名和简短关键词仍为本站编写，识别字段仍按 Tarot Card Data 的 CC0 声明使用。Canvas 色盘、HSV 转换与触控／键盘交互由本站实现，不新增第三方选色组件。

## Gearberry 现代牌面（2026-10-09）

[reginanka/tarot-cards](https://github.com/reginanka/tarot-cards) 固定提交 `83a25b0d4caeb24fa7d556796cf6244d8a55fd81`。实际分发 78 张 848×1264 WebP，源文件与运行文件字节一致，不重新裁切、上色或缩放，不使用远程 CDN。牌背未引入；原 cards.json 完整保存在 upstream/reference/sources，用于按英文牌名验证对应关系，其占卜解释不参与运行数据。

上游 README 与 LICENSE.md 明确将这些图片按 CC BY 4.0 提供，要求署名“Tarot Cards WebP Collection by Gearberry - https://github.com/reginanka/tarot-cards”。源码保存许可与 README 原始字节；运行包保留这两份原文和本站 NOTICE，页脚、牌面区及项目来源页提供作者、项目与许可链接。上游未注明原始画师及图片创作方式，本站仅记录其许可声明，不推断其他创作来源。

Gearberry 为正义 VIII、力量 XI，对应 m08.webp、m11.webp。经典 RWS 仍为力量 VIII、正义 XI，二者按牌名匹配而非按数组序号替换。所选版本控制显示编号、数字查询、大阿尔卡那排序及结果缩略图；切换保留查询条件并作废旧查询。识别资料的 CC0、经典牌面的公共领域及来源文档 MIT 独立保留。

## 围棋、海事旗、货币与天体目录（2026-10-10）

固定提交、原始文件、派生方式与边界见 [upstream/discovery/README.md](upstream/discovery/README.md)。`public/vendor/discovery/UPSTREAM.json` 登记原始文件、运行文件和维护脚本 SHA-256；总来源清单与工具页脚登记 Sabaki SGF（MIT）、doken（MIT）、Marine Signal Flags（MIT，保留 Panayiotis Lipiridis 原署名）、Currency Codes（PDDL 1.0 数据）、HYG Database（CC BY-SA 4.0）和 OpenNGC（CC BY-SA 4.0）。

HYG 筛选及 OpenNGC 坐标、索引和分包详情为派生数据，继续 CC BY-SA 4.0；完整原始字段保留在详情及保存的源表，牌面等既有数据许可不受影响。海事旗 SVG 原始分发，本站中文简述为独立事实整理。SGF 的 ESM 适配只移除 Node 文件/Buffer 接口，保留上游解析与 tokenizer；棋盘及基础规则由本站编写。货币关联使用已经登记的 Countries 与 flag-icons，天文联动使用已经登记的 Astronomy Engine；这些项目也在实际相关工具页脚展示。

HYG 原始 33,932,548 字节 CSV 以确定性 gzip 归档保存在 `upstream/discovery/sources/hyg/hygdata_v41.csv.gz`，避免源码托管单对象限制。导入和离线生成保留全部原始内容，清单同时保存归档 SHA-256、解压原文 SHA-256 和原文大小；完整性审计核对两者。网页数据、引擎、许可和声明字节保持不变。


## 图灵机（2026-10-10）

[Turing Machine Viz](https://github.com/aepsilon/turing-machine-viz) 固定提交 `b4dab9e4a649051ada94cb352c48ec177da5952e`，BSD-3-Clause；[js-yaml](https://github.com/nodeca/js-yaml) 固定 4.3.2，MIT。实际复用上游规则解析、状态转换和 Tape 纸带算法；源文件原文、示例、完整许可及 README 保留在 `upstream/turing/sources`，运行包的许可和改动说明在 `public/vendor/turing`。页面和页末使用当前共有组件与来源登记，不加载上游页面或外部服务。

适配由固定脚本离线生成 CommonJS 到 ESM，少量 lodash 调用替换为本站原生辅助函数，不分发 lodash。增加 Unicode 码点、S 原地移动、重复规则校验、安全自有字段和 YAML 深度/节点限制；只解析 JSON_SCHEMA，不执行用户代码。js-yaml 分发字节保持原样。维护导入、离线生成和逐文件摘要见 [upstream/turing/README.md](upstream/turing/README.md)。两项许可登记后合计 79 项；来源清单与原始许可分别核验。

## 基础转换（2026-10-11）

ASCII／字符码／UTF-8字节／进制／转义／实体／A1Z26继续使用现有CyberChef Apache-2.0引擎，无新增替代实现。

| 来源 | 固定提交 | 许可／使用范围 |
| --- | --- | --- |
| [cryptii](https://github.com/cryptii/cryptii) | c04a823b5f3f0c8dfc9d8a4bd10e35ef8177d642 | MIT；TapCode、PolybiusSquare和三个实际ArrayUtil方法，原生兼容层不引入上游界面 |
| [romanice](https://github.com/dkin-om/romanice) | 8923e049da2558b2c23c7d1b4c2fe806afbcc494 | MIT；原罗马数字双向算法，本站限定标准1–3999 |
| [Invisibles](https://github.com/cig13zs/invisibles) | 5ab9e06817539817830caafe0f652a582a9258e9 | MIT；分类扫描与按类别清理，本站提供保护选项 |
| [baudot.js](https://github.com/zenoamaro/baudot.js) | 5f1a01d7d774f5c5583bc9591d09cb09e74c2140 | MIT；三种字母表及有状态编码／解码 |

原文位于upstream/basics/sources，完整许可及NOTICE随public/vendor/basics分发；固定导入、离线生成及全部源文件／产物摘要见UPSTREAM.json。TapCode的原始解码算法将上一点位置0误判为第一组，导致首组仅一次敲击时跨空格合并；生成器将该判断改为当前点位置j===0，保留实际回归。严格坐标、码字、字符范围验证、词分隔、显示限额和Emoji保护均在本站适配层。详见 [来源维护说明](upstream/basics/README.md)。四项新增登记后，全站合计83项许可；每个相关工具页末保留实际项目链接与许可证。

## IT 固定资料与科普（2026-10-12）

- **IANA Protocol Registries**：五份协议登记表的固定镜像提交 `a3cbd401df5dd06cf60f7376fa0601bd5f426aec`；原始端口、协议号、HTTP 状态／字段和字符集数据为 **CC0 1.0**。CC0 不包括引用的 RFC 文档。保留原 XML、CC0 原文和 IANA 声明。
- **mime-db 1.54.0**：**MIT**，固定 npm 原包及 integrity；复用媒体类型、扩展名、字符集和来源字段，保留许可原文。
- **Public Suffix List**：固定提交 `3929462652695bad04f0a27afb600974014a3c8b`，**MPL-2.0**；完整 ICANN／PRIVATE 数据及派生后缀资料保留该许可。随站点提供原列表、完整 MPL 原文和源记录；匹配实现为本站代码，没有引入 tldts。
- **RFC Editor Index**：固定 2026-07-31 索引镜像，只派生 56 项文档编号、短标题、状态及更新／替代事实；中文科普独立编写。未引入 RFC 正文、摘要或代码，也未把 RFC 文档标为 CC0／MIT。文档原许可依出版时版权声明和适用的 IETF Trust 条款；用途及链接见随包 RFC-NOTICE。

原始字节与哈希保存在 [资料来源目录](upstream/it-reference/README.md)；`import-it-reference.py` 为联网维护入口，`build-it-reference.mjs` 完全离线验证并生成运行数据。`public/vendor/it-reference/UPSTREAM.json` 登记原始和派生文件。十六进制模型、搜索、ByteGrid 与指令基础文字均为本站实现，不增加外部项目署名。

## 逐功能科普的文献和站内原文

科普使用基于原始标准、机构文档和作者实现的中文释读与演算，文献旁注不是把标准机构或本站代码登记为新软件依赖。固定 CyberChef 11.5.0 源码的只读副本按原字节保存在 `public/vendor/knowledge/cyberchef/`，Apache-2.0 原文、作者通知和上游固定提交均保留；已固定的 Esolang Park 作者 README 按 MIT 保存在同目录的独立子目录。两者继续使用现有项目许可登记，具体资料链接旁也显示真实许可。

逐文件摘要及实际原文地址见 `public/vendor/knowledge/UPSTREAM.json`。维护进口脚本为 `scripts/import-knowledge-sources.py`；正常构建不联网，不替换官方运算资源。校验和、位提取、统计等已发现的运行兼容问题在本站共用 Worker 操作适配处理，固定 vendor 原始字节与摘要不变。没有将博客、百科、文献平台或浏览器 Web API 冒充已集成的软件项目。
