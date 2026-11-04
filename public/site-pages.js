import { mountSettings } from './settings-page.js';
import { loadRegistry } from './capabilities/registry.js';
import { createHomeIntroduction } from './home-page.js';
import { panelTaskTitle } from './capabilities/task-selection.js';
import { mountCapabilityBrowser } from './capabilities/browser.js';
import {
  animateCollection,
  Box,
  Card,
  ToolPanel,
  ToolHeader,
  Toolbar,
  EmptyState,
  Link,
  Disclosure,
  Result,
} from './ui/index.js';
import { toolPages } from './navigation.js';
import {
  getPreferences,
  favoriteEntries,
  isFavorite,
  preferenceTarget,
  getRecentEntries,
  exportPreferences,
} from './preferences.js';
import { APP_VERSION } from './site-version.js';
import { createExternalGuide } from './external-guide/page.js';
import { GUIDE_PAGES } from './external-guide/catalog.js';

const byRoute = new Map(toolPages.map((p) => [p.route, p]));
// Keep the current release first; historical records retain their original scope.
const releaseNotes = [
  {
    version: APP_VERSION,
    title: '文件分析、多语言运行与全新首页',
    changes: [
      '2026-11-04 · V2.0：本次集中上线文件分析、多语言代码运行、十项趣味工具，以及首页、搜索和结果展示改进。原有本地工具、笔记和偏好继续保留；需要服务器处理的任务只有在明确提交后才会上传当次文件或代码。',
      '文件分析：接入 ExifTool、libmagic、GraphicsMagick、Binwalk、Foremost、pngcheck、PCRT、zsteg、Steghide、OutGuess、JSteg、JPSeek、OpenStego、PDFiD、pdfinfo、strings 和频谱分析。可分别查看元数据、识别格式、检查或修复 PNG、扫描与提取嵌入文件、提取不同格式的隐写内容、检查 PDF 和生成声音频谱。',
      '分析方式：按需运行单项分析，不自动整套扫描。同用途功能集中在原专题中，保留浏览器本地方式；参数包括密码、扫描与提取模式、递归深度、字符串编码及偏移等，以对应工具实际支持为准。报告、原始输出、恢复文件与归档均可查看或下载。',
      '服务器处理边界：单个文件最多 20 MB，单项分析最多 240 秒。每次任务使用独立、无网络的隔离容器，修改输入、停止或离开页面会取消任务；超限明确报错，不把截断结果当成完整输出。',
      '代码运行：新增 C、C++、C#、Java、TypeScript、Go、Rust、PHP、Ruby、R、Perl、Bash、Kotlin、Swift、Dart、Scala 和 PowerShell。连同原有 Python、JavaScript、Lua、SQL 及六种解谜语言，共 27 种，按“主流／常用”和“冷门／解谜”分组，并标明本地或服务器运行。',
      '代码执行体验：保留标准输入、示例、草稿、停止与结果保存，区分编译诊断、运行错误和程序输出。新增语言仅在“发送并运行”后提交，使用独立 Linux 沙箱；这是单文件程序运行器，不提供联网安装依赖、完整 IDE、UIKit 或 Flutter。',
      '图片与视觉密码：新增 Gilbert 图片混淆及恢复，支持原图恢复和图片下载；视觉密码支持文字或图片生成随机分片、透明 PNG 下载、两张分片导入和滑动叠合观察。',
      '文字隐写与趣味编码：新增 StegCloak、郭飞文本隐水印、兽音译者和佛又曰。保留各自原格式、密码或字符表选项及对应提取方式；不同方案的加密、认证和容量限制分别说明，不混用格式。',
      '图片与声音互转：整合 SpectroTrace 与 Spectrum，保留各自合成和恢复算法。支持裁剪、频带与时间范围、窗长、位深、相位恢复、播放、频谱预览和 PNG／WAV 下载；Exact、Compact 与任意图片合成分别提供实际参数和质量说明。',
      '文件图像封装与屏幕传输：新增“化物为图”，将文件或文字封装为 PNG 并恢复原始字节；新增“二维码传文件”，支持发送端循环播放、暂停、单步和跳转，以及接收端摄像头、缺块补传、CRC／SHA-256 校验和完整文件下载。',
      '首页重排：保留编年史配色、字体与扫描线，增加简洁用途介绍、真实 Base64 解码示例和折叠使用帮助。工具分类先展示概览，点击后仍可查看完整目录；没有收藏或最近使用记录时，不再显示空白占位。',
      '工具推荐：原“常用工具”改为每批 8 项的推荐区，支持“换一批”，兼顾不同类别并避开上一批工具；推荐不混入科普，不根据玩家文件或笔记建立画像。修复帮助展开、收起时因间距导致的动画跳变。',
      '搜索与跳转：搜索命中具体操作后直接进入对应子功能和方向，避免 URL 解码等结果打开后还要再选一次。补充“图片藏了文字”等材料与用途表达的匹配；保留顶部主搜索，科普结果仍默认关闭，可在设置中开启。',
      'CyberChef 使用体验：复用可用的本地引擎，减少反复初始化；加载和运行状态分别反馈。Magic 改为可读的候选展示，支持复制结果片段和继续处理，同时保留完整 JSON、统计依据和原始信息；候选并不等于已经确认的答案。',
      '输入、错误与结果：修正 Magic 重复输入区，说明 Base64 输入预处理与实际解码操作的区别；为 AES 等错误补充中文解释和字段定位，原始错误仍可展开。部分编码工具提供示例与参数重置，扩展参数按用途收起，手机运行后可直接定位结果。',
      '布局与信息整理：工具页所用项目和来源改为可收起展示，完整署名和许可继续保留；调整长结果区、文件选择提示、空笔记状态与悬浮入口避让。生活计算主结果更易阅读，完整精度、计算条件、公式及来源仍可查看和保存。',
      '正确性修复：ZIP 文件名默认遵循 CP437，并优先采用有效的 UTF-8 标记和 Unicode 扩展；旧中文、日文等编码可手动选择，解压与文件比较共用同一规则。修复单位换算完成后残留加载提示，以及词库求解达到上限时未明确说明搜索尚未穷尽的问题。',
      '数据与使用边界：笔记、白板和脑图继续使用原浏览器数据库，没有增加云同步；重要内容仍建议导出备份。第三方在线查询与 Desmos 依赖各自服务的实际可用性，新增工具的来源、许可和适用限制可在对应页面查阅。',
    ],
  },
  {
    version: 'V1.9',
    title: '文件版本比较、批量处理与笔记快捷侧栏',
    changes: [
      '2026-11-02 更新：新增文件版本比较，可对照两组文件、文件夹或 ZIP，查看新增、删除、修改和不变的文件；内容完全相同且唯一配对时提示疑似改名，支持文本／十六进制预览及完整比较报告导出。',
      '新增多文件批量处理，支持 SHA-256、Base64 编解码、文本换行统一，以及 PNG、JPEG、WebP 静态图片转换。可逐项下载、单独重试失败项、打包下载成功结果；源文件不被覆盖，处理在浏览器本地完成。',
      '支持参数预设的工具可保存、应用、重命名和删除多份设置。预设按工具及操作区分，仅保存获准的选项和数值，不包含正文、文件、密码或密钥，应用后不自动运行。',
      '改进 CyberChef、综合计算器、单位换算及延迟载入页面的加载反馈，区分准备引擎与实际执行；文件工作区支持停止和失败重试，不显示虚构百分比。',
      '右下角“笔记本”直接打开可编辑、自动保存的笔记侧栏，手机使用窄屏面板；没有笔记时自动创建。列表与格式工具按需展开，可转到完整笔记页面，继续使用原来的笔记数据库和编辑器。',
      '修复快速新建笔记时编辑内容可能抢在笔记切换前写入的问题，保留当前工具输入、键盘入口和关闭侧栏后的焦点；统一维护入口、代码格式及模块职责说明。',
    ],
  },
  {
    version: 'V1.8',
    title: '笔记本完善、出行财务计算与函数绘图',
    changes: [
      '2026-11-01 更新：新增行程与配速、行程能耗与费用、反应与制动距离、利息与本息增长、贷款还款计算五项工具。每项均列出实际公式、单位、适用条件与参考来源；贷款提供完整逐期还款表，利率与价格由用户填写。',
      '新增 Desmos 函数绘图（在线），在工具页内使用官方中文计算器。首次打开才联网加载；切换工具保留当前页面，刷新前请使用 Desmos 自身保存或分享。表达式由 Desmos 处理，不会自动转存本站笔记。',
      '笔记支持项目／文件夹、标签、置顶、排序、复制、批量整理及笔记之间的引用和反向引用。搜索扩展到附件名、UTF-8 文本附件、脑图节点与备注、白板文字。',
      '附件支持重命名、替换、下载和删除；整张图稿支持重命名、复制、删除及跨笔记移动。增加历史版本预览、恢复与下载，完整备份保留历史；历史从启用后开始，最多保留 20 份且合计不超过 64 MB，超限轮换最旧记录。',
      '笔记标题和列表可生成脑图层级，关联图稿支持从笔记更新，以及预览确认后写回笔记。更新时保留匹配标题节点的标识和样式。修复白板重开后样式被覆盖的问题，保存素材库和视口，同一页面会话中切换图稿可继续撤销。',
      '脑图和白板补齐透明 PNG、SVG、尺寸选项及原生文件导出；白板可仅导出选中对象。脑图增加 OPML、Markdown 和新版 JSON 型 XMind 大纲交换，保留导入原件；旧 XML 型 XMind 及专属样式不保证兼容，完整图稿请使用本站格式备份。',
      '普通搜索默认不索引科普，可在“设置 → 使用习惯 → 搜索中显示科普”中开启，即时生效并保存在当前浏览器；科普目录和相关科普入口继续保留。',
      '统一笔记本普通按钮、编辑器工具栏的悬停与键盘焦点反馈，修正页头按钮样式覆盖；综合计算器使用自带键盘时减少手机系统软键盘遮挡。',
    ],
  },
  {
    version: 'V1.7',
    title: '日常计算与笔记入口更新',
    changes: [
      '2026-10-28 更新：新增海拔气压、水的沸点、露点与结露、冷热水混合、加热时间、耗电与电费、电池续航、溶液稀释八项计算器，可从“其他工具 / 数学计算”进入，也可直接搜索名称。',
      '每项计算器下方列出实际采用的计算公式、参数单位、适用条件和原始参考链接，并补充对应科普与完整算例。公式依据包括 IAPWS、NOAA/NWS、OpenStax、EIA 与相关机构公开资料。',
      '支持从海拔估算标准气压或由当地气压反求气压高度；水的沸点可按已知绝对气压计算，或按海拔估算。露点可结合表面温度查看液态水凝结的温度条件。页面明确区分模型估算与实际测量，零下露点不冒称霜点。',
      '冷热水混合可求混合温度或目标配水质量；加热可填写功率与效率；用电可按平均功率、时长和自填电价估算；电池支持 Wh、Ah、mAh，并考虑可用容量比例与输出效率；稀释支持反求原液体积、最终体积或最终浓度。',
      '新增计算在浏览器内完成。复制、下载或加入笔记的结果保留本次条件、公式及来源；修改条件、切换求解方式或离开工具后，旧结果立即失效。',
      '笔记本入口改为右下角常驻的醒目按钮，桌面打开原有笔记侧栏，手机打开笔记本页面；与字符输入键盘共用悬浮操作区，避免入口重叠。',
      '修复手机深色模式下“新建笔记”文字与背景混在一起的问题，恢复默认浅色文字及清楚的悬停、键盘焦点状态。',
    ],
  },
  {
    version: 'V1.6',
    title: '字符与数字资料、布局及设置完善',
    changes: [
      '2026-10-26 更新：新增语言文字字符表，提供 37 组现代与历史文字。日文、韩文、希腊、西里尔、希伯来、阿拉伯、泰文、天城文，以及拉丁、藏文、蒙古文、南亚文字、卢恩、欧甘、古埃及象形与楔形等均可分组浏览、查询和复制。',
      '新增数字与数值符号入口，完整收录 Unicode 17.0.0 数值表的 2,023 个字符。涵盖各文字系统十进制数字、罗马数字、分数、汉字数值、围合数字、上下标、算筹、玛雅、楔形及爱琴数字；支持按精确数值查询，分数不转换为近似小数。',
      '字符表支持字符、标准名称与码点查询，复制原字符、加入笔记和导出当前筛选的全部记录。保留全部 11,172 个现代韩文合成音节；日语及韩语汉字明确限定为 CLDR 收录范围，罕见字符的显示取决于设备字体。资料在本地处理，来源与许可随页面提供。',
      '其他工具的外站指南新增 pudone，提供综合在线工具目录的访问入口。',
      '统一工具表单、输入结果区和操作按钮的布局，减少不必要的空白与错位，修正部分页面仍沿用旧布局的问题；保持 ARG 编年史配色、整体风格与扫描线。',
      '完善设置页：增加输入与结果换行、编辑区字号、普通参数记忆、最近使用、收藏排序、执行快捷键、全站音量与静音，以及笔记存储占用和备份入口。参数记忆默认关闭，不保存正文、文件、密码或密钥。',
    ],
  },
  {
    version: 'V1.5',
    title: '启动、工具恢复与阅读体验改进',
    changes: [
      '首次打开时显示带动画的加载页面，加载失败时提供重试入口，减少启动阶段只有黑屏、无法判断状态的问题。',
      '修复收藏和启动页恢复时未准确回到具体工具的问题，保留专题成员与操作方向；设置中的启动工具选项去重，继续兼容旧偏好备份。',
      '单位换算将数值与结果并排展示，补齐 452 项随包单位的中文名称并整理符号显示；详细记号可展开，结果操作统一排布，窄屏自动换行。',
      '普通计算器支持键盘等号直接计算；科学计算器保留等式输入，Enter 和页面计算键的使用方式不变。',
      '长篇科普增加可折叠的章节目录，合并专题的重复参考资料；改善返回目录和信息技术资料选中记录时的定位，避免焦点停在视野之外。',
      '鸟类目录默认展示物种，优先显示中文名称与常用信息；分类细节可展开，完整分类记录、原始字段、导出与来源许可继续保留。',
    ],
  },
  {
    version: 'V1.4',
    title: '科普内容扩充与工作台体验完善',
    changes: [
      '扩充全部 256 篇科普页面，补写知识介绍、规则原理、计算步骤、实例、参数和适用边界；专题保留各成员的具体内容，参考资料统一放在文章末尾。',
      '科普改为目录与正文分别全页展示，宽屏目录按可用空间排成多列，手机保持单列；优化文章层级、正文与示例宽度，保留搜索、返回目录和真实工具联动。',
      '调整工具页头、参数表单、结果与空状态的层级，改善日期偏移分组、在线查询和窄屏布局；单位换算移除多余的名称／符号搜索框，突出换算结果。',
      '设置页分开备份恢复与重置清理，统一文件选择和危险操作的外观；减轻静态扫描线纹理，改善文字阅读与控件辨识。',
      '修复南纬及负零度分坐标解析、倒放音频片段导出和 SSTV 采样不一致、音频取消后按钮状态，以及修改文件偏移后旧结果未清除等问题。',
      '修复快速切换工具方向、最近使用方向记忆、动态下拉选项与键盘检索，以及输入法确认误触发计算、时区加载时选中项丢失等交互问题。',
      '使用 Animate UI 的页面进入效果，统一同面板与跨面板切换；修正过渡参数、分批启动、重复初始化及旧渲染状态回写，减少错误提示观察器的全页扫描。首次加载仍可能有短暂卡顿。',
      '拆分音频、文件和实用计算的界面与状态模块，明确路由、模型、输入和结果的职责；保留原始文件、本机处理及来源许可。',
    ],
  },
  {
    version: 'V1.3',
    title: '实用计算与符号录入体验优化',
    changes: [
      '重新整理综合计算器，采用集中显示屏与按键，历史、设置和完整结果放入侧边面板；修复按键悬停高亮跨行滑动等动效问题。',
      '单位换算独立为其他工具下的分类入口，按学科查找；修改数值或选择单位后实时换算，支持交换单位，不再额外点击计算。货币仍为随包固定汇率。',
      '新增日期加减、日期差、年龄、倒计时、ISO 周与年内日序，以及跨时区会议规划，可比较各地时间并寻找共同空档。',
      '增加独立的地理距离与方位角、BMI 和常见几何计算；19 种图形可按适用尺寸计算面积、周长、体积或表面积。完善摩尔质量与分子式，支持下标、方括号及结晶水写法。',
      '盲文与旗语增加图形按键，点击字母即录入，支持连续输入；逐点输入和方向输入作为可切换的备选方式，共用当前选择。盲文按键只展示有对应含义的字符。',
      '改善参数表单和窄屏排布；鸟类等资料优先展示常用信息，完整原始字段与来源许可仍可展开。修复同一专题的不同功能在最近使用中重复出现的问题。',
      '移除“输入或设置已改变，请重新计算”等过程提示；输入变化时清除旧结果，保留实际进度、错误和必要的联网说明。',
    ],
  },
  {
    version: 'V1.2',
    title: '计算、动图与解谜工作区完善',
    changes: [
      '新增“综合计算与单位换算”：普通与科学计算器支持按键、键盘、角度、内存和上次结果；单位换算按类别查找并选择，统一承接原有同类入口。使用本地 Qalculate 内核，货币为随包汇率快照。',
      '新增 GIF／APNG 动图逐帧分析，可播放、前后步进、查看局部帧和相邻帧差异，导出全部帧、精灵图及完整参数，也可按网格切片。',
      '魔方工作区扩充到固定库中的 21 种形状，支持公式、逐步观察、手动转动及观察记录；按形状提供实际可用的二维／三维视图，撤下自动求解和竞速打乱入口。',
      '完善汉字的字形、逐笔、笔顺、释义和组词查询；乐理增加明确的音程与移调表单，保留音名、频率、和弦及音阶工具。',
      '生物序列增加线性／环形查看、位置、搜索、错配和正反六阅读框翻译，保留本机文件的全部解析序列、注释和原文件。元素资料保留全部 118 个元素原始字段，常用信息在前，完整字段可展开。',
      '天文工具增加当地日食查询和星座归属；历法保留常用换算，并将佛历／道历作为可选文化参考。化学保留符号拆分、分子式计数、结构图与常用标识。',
      '图片增加原始调色板和 RGBA 导出，隐写嵌入与二维码码字编辑归入进阶区；视频提供常用输出格式选择，进阶命令仍由本地 FFmpeg 实际执行，保留完整输出与日志。',
      '完整 CyberChef 处理链补充多输入标签、断点、单步、输入输出对应高亮及 Magic 候选采用，保留原始输入、配方和全部来源操作。',
      '按解谜用途整理功能，移除难用或低相关的专业方法表单；综合计算不再展示完整定义目录和自定义数据入口。统一任务标题字体、字重和响应式字号，补齐相关说明、科普与来源许可。',
    ],
  },
  {
    version: 'V1.1',
    title: '工作台界面、交互动效与搜索体验升级',
    changes: [
      '调整工作台界面，统一顶栏、侧栏、页脚、任务按钮和参数表单的排布，保留迷雾系列的深色、琥珀与青色风格，改善电脑和手机上的阅读与操作体验。',
      '实际接入 Animate UI 2.0 与 Motion，统一普通单选下拉、弹窗、抽屉、折叠、标签切换和按钮反馈；侧栏、页头与工具栏增加连续滑动的悬停高亮。',
      '修复高亮遮挡文字、展开或收起时跳动、快速开关弹窗后的状态残留，以及动态下拉选项、重复选项值和弹窗内键盘操作等问题。',
      '优化笔记侧栏的打开、关闭、拖动调宽和转独立页面体验，操作时保留当前工具输入、文件和原编辑器内容。',
      '搜索结果增加匹配文字高亮；命中功能别名、具体操作或说明时展示对应原文片段，英文拼写有误时也能显示模糊匹配的位置。顶部、首页、侧栏与完整工具目录共用这一能力。',
      '保留中文输入法、方向键、Enter、Escape 和 Tab 操作，修复长搜索列表的焦点问题；连续输入不反复播放入场动画，减少动态效果设置实时生效。',
      '补齐本轮组件的来源与许可证说明，并完成相关布局、动效、搜索及笔记回归。浏览器系统弹窗和第三方编辑器内部界面继续保留各自实现。',
    ],
  },
  {
    version: 'V1.0',
    title: '统一工作台与笔记可靠性完善',
    changes: [
      '桌面端可在工具页面右侧打开笔记本，拖动分隔线调整宽度，也可转到独立笔记页面；正文、思维导图和线索白板继续围绕同一篇笔记记录线索。',
      '笔记新增回收站，删除后可恢复，永久删除需再次确认；补齐多窗口编辑冲突保护，避免旧页面覆盖新的修改。',
      '支持当前笔记的完整备份，以及包含回收站的全部笔记备份；大容量备份自动分批，保留附件、可编辑图稿和原始来源数据。普通列表改用摘要索引，避免每次打开都读取全部附件，保留正文搜索。',
      '优化工具查找：搜索 Base32、Base64、Base85 等名称时优先打开对应工具与操作；收藏、最近使用和启动设置显示实际任务名称，工具数量与科普数量分开统计。',
      '统一首页卡片、转换参数、输入结果、点选方阵与查询页面的排布，减少不必要的留白和重复控件，兼顾手机、键盘操作及减少动态效果设置。',
      '扩充按方向组织的专业外站介绍，AperiSolve 归入图像与分析外站；保留各网站的具体能力介绍和原站链接，不把外链描述为本站已集成的处理功能。',
      '修复在线查询初次进入时的状态提示，以及切换任务、取消、修改输入后的旧结果失效；查询仍仅在玩家主动提交后发送，本地工具不依赖查询或邮件服务。',
      '完善网站、在线查询与邮件反馈的统一启动及部署说明，补齐相关来源许可和针对性回归验证。笔记保存在当前浏览器，建议定期导出完整备份。',
    ],
  },
  {
    version: 'V0.9.5',
    title: '解谜工具扩充与在线资料查询',
    changes: [
      '扩充二维码修复：支持 1–40 版本、四档纠错的码字分析、错误与擦除恢复、格式及填充恢复，修改可明确采用或撤销；新增支持 111 种制式的条码生成器，识别仍按各原有引擎的支持范围运行。',
      '接入折纸模拟，保留所选项目全部 90 份折痕文件，支持 SVG／FOLD 导入、直线与曲线折叠、物理参数调整、暂停与单步，以及 FOLD、OBJ、STL、PNG、SVG 导出。',
      '加入所选开源包全部 46 套多语言键盘布局，可向工具输入框选区插入文字；扩充键位换位、坐标、移位、镜像、手机多击与 T9 词库查询。',
      '新增电阻／电容色环、25 对线缆色码、排列排名与反排名；扩充旗语、无线电拼读、普鲁士电报、海事信号、GS8 和盲文，保留完整选定码本、159 页海事规则书及 Liblouis 的 268 张翻译表。',
      '补充 basE91、Base100、Base65536、UU／XX、AA／JJ、Crockford、z-base-32、Bubble Babble、Gray、Manchester、Fibonacci、Elias、Hamming／SECDED 等编码，保留各格式的真实输入单位、完整字节和纠错能力。',
      '增加 OEIS、汉典、搜韵、SIMBAD、VizieR、COD、PubChem、国家地名信息库和神奇宝贝百科的在线资料入口。仅在主动查询时经本站服务器访问指定来源，保留原站链接；COD 适配已完成，但上游连通尚未验证成功。',
      '依据 CLDR、IOC、Wikidata 和 MDN 已有资料补充中文名称、别名与说明，保留原库记录和字段；在线结果优先展示有效信息，改善宝可梦基本资料、诗文分句和散文排版，以及桌面列表与正文布局。',
      '在资料查询下增加外站资料指南，按方向归类并保留各网站的详细介绍。取消本站图片完整扫描及 Docker 配套，改为 AperiSolve 介绍与官网入口，本地通道、位平面及隐写提取继续保留。',
      '修复笔记附件引用与导出、长文本保存、录音切换后的旧回调，以及在线查询取消和限流、静态文件访问、邮件反馈请求管理等问题；补齐新增工具的笔记／图稿记录、使用说明、科普与来源许可。',
    ],
  },
  {
    version: 'V0.9.2',
    title: '资料扩充、笔记联动与反馈完善',
    changes: [
      '将 Base 家族、数字与字节编解码、PGP、信息提取、二维码等同用途功能集中到对应工作区，保留各自真实操作、处理引擎和参数，减少重复入口。',
      '精简任务页顶部的重复按钮和分类信息，统一转换页面布局；顶端查找支持直接输入、中英文名称和模糊匹配。部分底层操作仅在完整 CyberChef 配方工作区中保留。',
      '扩充历史时区、88 星座、五千年日月食目录、AviList 鸟类名录和 Open Opus 古典音乐资料，保留所选固定版本的完整收录范围，并补齐使用说明、科普与来源许可。',
      '移除部分只有少量样本的资料页，避免把精选内容当作完整数据库；可用的完整目录与实际运算能力继续保留。',
      '补齐代码运行、资料查询、图片、音频和文件处理等工具结果的笔记／图稿入口，记录真实输出、完整查询数据及相关文件；不恢复跨工具处理按钮。',
      '修复修改输入、切换任务及异步处理完成后旧结果仍可能被记录的问题，打开保存窗口后也不会误存后来切换的另一条结果。',
      '调整资料加载方式，使用 JSON 与 HTTP 压缩协商，修复正常查询可能触发 IDM 接管下载的问题。',
      '完善网页内问题反馈及邮件服务连接配置；网站与邮件服务支持通过一个 npm start 统一启动，简化部署和后续更新。',
    ],
  },
  {
    version: 'V0.9',
    title: '笔记本与专题工具工作区',
    changes: [
      '补齐代码运行及各原生工具的笔记／图稿记录，独立保存真实输出、完整查询数据和文件，修复入口随旧跨工具按钮消失的问题；跨工具处理保持删除。资料加载改为 JSON 与 HTTP 压缩协商，避免压缩包被下载扩展接管。',
      '新增历史时区、88 星座、五千年日月食目录、AviList 鸟类名录和 Open Opus 古典音乐资料，完整保留所选固定版本的记录、字段和附表，支持本地检索与笔记记录，并补齐科普、使用说明及来源许可。',
      '按实际用途整合信息提取、PGP、RSA、哈希、压缩解压、汉字查询、查词、视频和代码运行等专题，同一页面选择具体操作，保留原始输入、独立参数草稿与实际处理能力。',
      '进一步收拢 Base 家族、数字与字节编解码、字符编码与码点、文字转义与还原，保留各格式的真实操作、方向、参数与输入单位。整体整数进制转换继续与逐字节编码区分。',
      '二维码与条形码识别、二维码生成和矩阵修复合并到一个工具入口；保留 ZXing、QRazyBox／jsQR 和 CyberChef 各自的完整功能及来源，支持沿用原图或当前图片视图，生成结果仍可导出 PNG、SVG、EPS、PDF。',
      '修复二维码切换功能后的旧结果回填与识别结果加入笔记、脑图或白板的问题；切换成员和修改来源会立即使旧结果失效，保留修复矩阵、撤销记录及输入草稿。',
      '四则运算、位逻辑、集合运算、网络报文拆解、流量指纹和开发生成器等 78 个底层操作移出独立目录、搜索及科普入口，继续在完整 CyberChef 配方工作区使用。数学区保留整数分解与单位换算。',
      '新增 Vditor 笔记本，支持三种编辑模式、公式与图表、附件、搜索、自动保存、删除及导入导出。笔记保存在当前浏览器，可通过完整备份迁移。',
      '思维导图与线索白板整合进同一个笔记本，分别使用 Mind Elixir 和 Excalidraw；可在当前笔记中插入、编辑和重新打开图稿，保留原稿、预览与附件。工具结果可直接加入笔记、脑图或白板，并保留完整原始数据。',
      '补充 Playfair、ADFGX、ADFGVX、Trifid、Autokey、Beaufort、列移位置换与 Nihilist 八种古典密码，支持真实双向处理及对应参数。',
      '补全中文条件查词、成语、汉字笔画匹配、六类英文词库、网格搜词、字典替换搜索、约束求解与键盘／符号映射，接入 ChinesePuzzleTool 和 cipher_machine 的实际算法与数据。',
      '接入 Alpertron 的本地整数计算，支持整数分解、素性检验、表达式、除数与批处理；移除方程、离散对数、幂和、连分数等高级数学任务。接入 ggmorse，支持摩斯音频识别与生成、主动录音及信号诊断。',
      '新增五线谱与节奏录入、试听和谱面／MIDI／WAV 导出，以及基于全部 118 个元素符号的拆词与词库筛选。',
      '扩充 25 项底层任务及对应科普，并按实际用途合并展示，常规计算均在浏览器内完成。统一转换页面的参数、输入与结果布局，并补齐新增功能页末的所用项目、具体用途和许可证。',
      '精简任务页顶部，移除分类路径、相邻工具横排与重复方向按钮；转换方向直接在原表单下拉框选择，相关科普与使用说明放在标题同一操作区。',
      '顶端查找改为直接输入、原位显示候选，支持中英文名称、用途和模糊匹配；保留 Ctrl／⌘+K、方向键和回车操作。',
      'CyberChef 完整处理链在导航中只保留一个入口，分支、寄存器、条件跳转等 10 个流程控制继续在配方内使用，其说明整合进处理链科普。',
      '整理资料查询范围：移除本地数列精选、晶体样本、筛选恒星、精选 RFC 和简编指令资料，避免把少量收录当作完整数据库。深空天体目录保留全部 14,034 条固定 OpenNGC 记录；本机 CIF 统一从三维模型观察中打开，天文、数论和反汇编计算继续保留。',
    ],
  },
  {
    version: 'V0.8',
    title: '工具联动与问题反馈',
    changes: [
      '新增“用其他工具处理”：把当前结果交给另一个工具，按结果类型推荐下一步，并按大分类、工具组和处理方向选择目标。',
      '接收结果后直接展示上一步的文本、图片或十六进制预览，保留完整原始数据；有旧输入时先确认替换，不会自动执行。单项工具中的“送到处理链”按钮已移除，处理链保留独立入口。',
      '新增网页内“报告问题”：填写问题、复现步骤及选填附件，预览后发送到维护者邮箱。不会自动附上解谜输入、文件或结果；邮件服务不可用时仍可复制或下载报告。',
    ],
  },
  {
    version: 'V0.7',
    title: '统一任务页面与稳定性修复',
    changes: [
      '侧栏具体功能直接进入对应任务；首页和大分类保留总览。移除工具内重复的聚合页面、分类菜单和操作列表，避免同一功能出现两套界面。',
      '修复读取末尾附带 ZIP 数据的 PNG 图片时可能无响应、报越界错误的问题，保留图片原始字节供隐写和文件检查使用。',
      '完善切换任务、修改输入、停止运算后的结果失效处理，避免旧结果或迟到的响应覆盖当前内容。',
    ],
  },
  {
    version: 'V0.6',
    title: '五类导航与逐功能科普',
    changes: [
      '工具统一整理为编解码与加解密、资料查询、图片音视频与文件处理、其他工具、科普五大类；侧栏、目录和搜索使用同一份功能登记。',
      '将支持的编码／解码、加密／解密合为同一功能入口，在工具内明确切换方向；补充基础转换、交互符号、十六进制编辑器和 IT 固定资料。',
      '科普按具体功能分别介绍规则、步骤、可核对例子、参数和边界，并在正文旁列出参考资料，可同页打开对应工具。',
    ],
  },
  {
    version: 'V0.5',
    title: '紧凑工作台与使用偏好',
    changes: [
      '重新整理工作台布局，采用常驻侧栏和居中搜索；手机使用导航抽屉，精简顶栏与常驻说明，保留深色配色和 CRT 扫描线。',
      '统一输入、结果、帮助和交互反馈，调整中文及代码字体，关闭会影响密文和符号辨读的字体连字。',
      '加入首页、关于与设置，提供收藏、最近使用，以及字号、密度、动效、扫描线和启动页偏好；支持设置与收藏的导入导出。',
    ],
  },
  {
    version: 'V0.4',
    title: '科学资料与图形浏览',
    changes: [
      '加入天文、化学、生物序列和传统历法工具，以及国家、机场、港口、Unicode、塔罗、颜色、地质、数列和晶体等固定资料查询。',
      '为资料查询补充地图、字符表、塔罗牌面、连续色盘等图形浏览方式，点选后查看对应记录。',
      '完善地区、货币、交通和天体之间的资料关联，支持将真实 CIF 晶体数据带入三维模型观察。',
    ],
  },
  {
    version: 'V0.3',
    title: '媒体处理与交互工具扩充',
    changes: [
      '扩充音频、音乐、视频、压缩文件、坐标与时间处理功能，并把相关操作整合到原有素材工作区。',
      '加入原生纸笔解题，支持标准数独、数回、数墙和照明；提供题面编辑、撤销、求解及结果导出。',
      '加入十种语言的代码运行工具，以及图片碎片拼接、三维模型观察、棋谱复盘和生命游戏等交互工具。',
    ],
  },
  {
    version: 'V0.2',
    title: '图片隐写与常用解谜工具',
    changes: [
      '整合 AperiSolve 的图像分析算法与 StegOnline 的位平面、数据提取能力，扩充通道、元数据、PNG 数据块和 LSB 检查。',
      '补充汉字属性与反查、单表替换求解、密文统计分析、交互符号输入、合成乐器、三阶魔方和二维码修复。',
      '为工具补充中文使用说明，并逐步完善原图、当前视图与处理结果的区分，以及各开源项目的来源和许可说明。',
    ],
  },
  {
    version: 'V0.1',
    title: '基础工具箱',
    changes: [
      '建立中文 ARG 解谜工作台，提供文字、编码与密码、图片、音频和文件的基础处理入口。',
      '接入本地 CyberChef 引擎，在站内完成常用编码、解码与加解密；常规工具的数据处理在浏览器内进行。',
      '确立海军蓝、琥珀、青色及 CRT 扫描线的视觉风格，开始集中整理常用开源工具与项目来源。',
    ],
  },
];
function versionHistory() {
  const [current, ...history] = releaseNotes;
  const changes = (release) =>
    Box({
      tag: 'ul',
      children: release.changes.map((text) =>
        Box({ tag: 'li', children: [Box({ tag: 'p', text })] }),
      ),
    });
  return Disclosure({
    id: 'about-versions',
    className: 'surface ui-flow-branch',
    children: [
      Box({ tag: 'summary', text: `版本更新 · ${current.version}` }),
      Box({
        tag: 'h3',
        text: `${current.version} · ${current.title}`,
        attrs: { 'data-current-version': current.version },
      }),
      changes(current),
      Result({
        layout: 'collection',
        children: history.map((release) =>
          Disclosure({
            className: 'surface ui-flow-branch',
            attrs: { 'data-release-version': release.version },
            children: [
              Box({ tag: 'summary', text: `${release.version} · ${release.title}` }),
              changes(release),
            ],
          }),
        ),
      }),
    ],
  });
}
function heading(title, code) {
  return ToolHeader({ className: 'page-heading chronicle-heading', title, eyebrow: '// ' + code });
}
function link(text, route, navigate) {
  return Link({
    text,
    attrs: { href: '#' + route },
    on: {
      click: (event) => {
        if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        navigate(route);
      },
    },
  });
}
function externalLink(text, href) {
  return Link({
    text: text + ' ↗',
    attrs: {
      href,
      target: '_blank',
      rel: 'noopener noreferrer',
      'aria-label': text + '（在新窗口打开）',
    },
  });
}
function downloadSettings() {
  const url = URL.createObjectURL(new Blob([exportPreferences()], { type: 'application/json' }));
  const a = Link({ attrs: { href: url, download: '迷雾工具箱-设置.json' } });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export function mountSitePages(main, { navigate, notebook }) {
  let registry;
  const home = ToolPanel({
    id: 'panel-home',
    className: 'panel site-page',
    hidden: true,
    attrs: { 'aria-label': '首页' },
  });
  const collections = Box({ className: 'home-collections' }),
    starred = Card({ title: '已收藏', className: 'surface home-collection' }),
    latest = Card({ title: '最近使用', className: 'surface home-collection' });
  const starList = Box({ className: 'home-quick-links' }),
    recentList = Box({ className: 'home-quick-links' });
  starred.append(starList);
  latest.append(recentList);
  collections.append(starred, latest);
  const browse = Card({ title: '工具分类', className: 'surface home-browser' });
  const {
    intro: homeIntro,
    help: homeHelp,
    example: homeExample,
  } = createHomeIntroduction({ navigate, browse });
  home.append(homeIntro, collections, browse, homeExample, homeHelp);
  mountCapabilityBrowser(browse, {
    searchId: 'home-search',
    overview: true,
    searchable: false,
    searchKnowledge: () => getPreferences().searchKnowledge,
  });
  function syncFavoriteButtons() {
    for (const b of home.querySelectorAll('[data-favorite]')) {
      const active = isFavorite(b.dataset.favorite);
      b.setAttribute('aria-pressed', String(active));
      b.setAttribute(
        'aria-label',
        (active ? '取消收藏' : '收藏') +
          ' · ' +
          (preferenceTarget(b.dataset.favorite)?.title || ''),
      );
    }
  }
  function refreshCollections() {
    const p = getPreferences();
    for (const [section, list, entries, enabled, empty] of [
      [starred, starList, favoriteEntries(), p.showFavorites, '点击工具页星标即可收藏。'],
      [latest, recentList, getRecentEntries(), p.showRecent, '打开工具后会显示在这里。'],
    ]) {
      section.hidden = !enabled || !entries.length;
      section.dataset.empty = String(!entries.length);
      animateCollection(
        list,
        () => {
          list.replaceChildren();
          for (const entry of entries) list.append(link(entry.title, entry.route, navigate));
          if (!entries.length) list.append(EmptyState({ text: empty, size: 'compact' }));
        },
        { key: (node) => node.getAttribute('href') },
      );
    }
    collections.hidden = starred.hidden && latest.hidden;
    syncFavoriteButtons();
  }
  document.addEventListener('arg:collectionschange', refreshCollections);
  document.addEventListener('arg:preferenceschange', refreshCollections);
  refreshCollections();

  const about = ToolPanel({
    id: 'panel-about',
    className: 'panel site-page',
    hidden: true,
    header: heading('关于工具箱', 'ABOUT / 关于'),
  });
  const intro = Card({
    title: '迷雾工具箱',
    className: 'surface',
    children: [
      Box({
        tag: 'img',
        className: 'about-brand-logo',
        attrs: {
          src: new URL('./branding/20261028-toolbox/logo.svg', import.meta.url).href,
          width: '64',
          height: '64',
          alt: '迷雾工具箱标志',
        },
      }),
      Box({ tag: 'p', text: `当前版本：${releaseNotes[0].version}` }),
      Box({
        tag: 'p',
        className: 'site-lead',
        text: '为 ARG 与 Puzzlehunt 准备的中文解谜工作台。',
      }),
      Box({
        tag: 'p',
        text: '从密码、编码与符号，到图片隐写、音视频、科学资料和交互模拟，将常用工具放在同一个网页中。',
      }),
      Toolbar({
        children: [
          link('浏览全部工具', 'home', navigate),
          link('调整使用偏好', 'settings', navigate),
        ],
      }),
    ],
  });
  const source = Card({
    id: 'about-source',
    title: '源码与部署',
    children: [
      Box({
        tag: 'p',
        text: '迷雾工具箱原创程序代码按 GPL-3.0-or-later 提供，第三方代码、数据和素材保留各自许可。依赖与对应源码可通过仓库的固定清单自动安装。',
      }),
      Box({
        tag: 'p',
        text: '这是可自行部署的独立源码版。常规工具在本机运行；服务器文件分析、扩展代码运行和邮件反馈需要部署者另外配置。',
      }),
      Toolbar({ children: [externalLink('源码与部署说明', 'https://github.com/tenrim/arg-tool')] }),
    ],
  });
  const privacy = Card({
    title: '数据与隐私',
    className: 'surface',
    children: [
      Box({
        tag: 'p',
        text: '常规本地工具在浏览器内计算，其输入、文件和结果不会上传到本站服务器。',
      }),
      Box({
        tag: 'p',
        text: '代码运行中标注“服务器”的语言，只有点击“发送并运行”才把当前代码与标准输入交给本站临时隔离容器。每次独立运行，不联网、不保存执行历史，任务结束删除临时文件；标注“本地”的语言仍在浏览器执行。',
      }),
      Box({
        tag: 'p',
        text: '标注“服务器处理”的文件分析工具，只有点击“上传并处理”才发送所选文件、当前参数及必要密码到本站独立处理容器，不发送给 AperiSolve 官网。任务结束、取消或超时后删除容器内临时文件，不建立上传历史或密码数据库。',
      }),
      Box({
        tag: 'p',
        text: 'Desmos 在线函数绘图在首次进入时直接加载外站网页，切换工具保留该网页会话。输入、登录、保存和分享由 Desmos 及其政策管理。本站不读取其表达式，也不会向其附带笔记、文件或其他工具输入。',
      }),
      Box({
        tag: 'p',
        text: '标注“在线查询”的功能需要联网：只有点击查询，才将本次查询经本站服务器发送到所标明的外站。本站不持久保存查询内容和返回结果；外站可能按其政策记录请求。这些查询不会附带你的笔记、文件、其他工具输入或浏览器身份凭据。',
      }),
      Box({
        tag: 'p',
        text: '本源码版默认在本机生成问题报告，可复制或下载；只有部署者启用同源反馈服务后才发送报告和主动选择的附件。设置、收藏、笔记及图稿保存在当前浏览器。可选的工具参数记忆仅保存受支持的选项、数值参数和操作方向，不保存工具输入、文件、密码或密钥。最近使用可关闭记录；开启时仅记录在当前会话，仅选择“上次使用的工具”作为启动页时额外保存一个工具 ID。',
      }),
      Box({
        tag: 'p',
        text: 'HTTP、DNS 等主动联网操作会向指定服务发送请求；外部服务遵循对方政策。网页及本地引擎需要从服务器加载，托管服务可能记录访问日志。',
      }),
    ],
  });
  const limitations = Card({
    title: '使用范围',
    className: 'surface',
    children: [
      Box({
        tag: 'p',
        text: '查询资料以随站点提供的数据集为准。密文识别与自动求解提供候选，不保证每道题都有答案。',
      }),
      Box({
        tag: 'p',
        text: '大型引擎按需加载。建议使用较新的浏览器，并通过 HTTPS 访问；各工具的输入格式和限额见标题旁的使用说明。',
      }),
    ],
  });
  const credits = Disclosure({
    className: 'surface about-credits',
    children: [
      Box({ tag: 'summary', text: '开源项目与许可证' }),
      Box({ className: 'resource-grid' }),
    ],
  });
  about.append(
    intro,
    source,
    versionHistory(),
    Box({ className: 'site-info-grid', children: [privacy, limitations] }),
    credits,
  );

  const settings = mountSettings({ navigate, notebook, downloadSettings });
  main.prepend(home);
  main.append(about, settings, ...GUIDE_PAGES.map(createExternalGuide));
  function updateNames(panel, capabilityId) {
    if (!registry) return;
    for (const [id, page] of byRoute) {
      if (panel && id !== panel) continue;
      const title = panelTaskTitle(registry, id, capabilityId);
      if (title) byRoute.set(id, { ...page, title });
    }
    refreshCollections();
  }
  document.addEventListener('arg:panelchange', (event) =>
    updateNames(event.detail.name, event.detail.capabilityId),
  );
  loadRegistry()
    .then((value) => {
      registry = value;
      updateNames();
    })
    .catch(() => {
      /* directory owns retry */
    });
}
