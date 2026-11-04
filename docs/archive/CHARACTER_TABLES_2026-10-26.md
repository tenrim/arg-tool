> 历史记录，仅用于追溯。现行规则见 [开发指导](../DEVELOPMENT_GUIDE.md)，不要按本页旧版本、旧部署状态或测试清单执行当前任务。

# 语言文字字符表与 pudone 入口

新增 `#character-tables`，位于资料查询的文字与符号分组；pudone 位于其他工具的外站指南。沿用编年史配色、扫描线与共享组件，使用紧凑字符网格。不增加字典、在线翻译或用户输入上传。

## 资料范围

固定 Unicode UCD 17.0.0 与 CLDR JSON 48.2.0。完整保留日语、韩语、希腊语、俄语、希伯来语、阿拉伯语、泰语、印地语的 CLDR 主字符、辅助字符、索引集合原文；常用大小写通过 UCD 简单大小写映射补齐。日语汉字及韩语汉字只覆盖所选 CLDR 集合，不宣称全部汉字或完整词典。

Unicode 文字系统视图完整合并对应 Script 与 Script_Extensions：Hiragana、Katakana、Hangul、Greek、Cyrillic、Hebrew、Arabic、Thai、Devanagari。第二轮扩充后共 30,590 个唯一码点的元数据；CLDR 集合同时保留多码点序列。韩文现代合成音节完整列出 11,172 个，另有兼容字母和组合字母视图。

| 语言／文字 | 全部收录条目（含序列） | Unicode 文字系统码点 |
| --- | ---: | ---: |
| 日文 | 2,968 | 756（平／片假名合并去重） |
| 韩文 | 12,530 | 11,775 |
| 希腊文 | 531 | 531 |
| 西里尔文字 | 530 | 521 |
| 希伯来文 | 138 | 136 |
| 阿拉伯文 | 1,465 | 1,461 |
| 泰文 | 91 | 90 |
| 天城文 | 223 | 221 |

每页显示 96 项；下载包含当前筛选的全部记录，不截断到当前页。附加标记的虚线圆仅帮助显示，复制与导出保留原字符。右向左文字用 `bdi` 隔离。切换语言、分组、查询、分页或离页同步清除选中字符与笔记结果租约。

## 第二轮扩充

在原有 8 组基础上加入 29 组文字，共 37 组，另有独立数字入口。完整选择清单为 `upstream/character-tables/repertoires.json`，生成器同时生成公开目录元数据，避免维护两套集合：

拉丁、亚美尼亚、格鲁吉亚、孟加拉、古木基、古吉拉特、奥里亚、泰米尔、泰卢固、卡纳达、马拉雅拉姆、僧伽罗、老挝、藏文、缅甸、高棉、蒙古、埃塞俄比亚、叙利亚、它拿、N’Ko、卢恩、欧甘、腓尼基、科普特、格拉哥里、婆罗米、古埃及象形及楔形文字。

新增组完整使用对应 Unicode Script／Script_Extensions，不虚构 CLDR 常用集合，不把文字系统称为单一语言。字体由浏览器和系统提供，罕见／新增码点可能缺字，原始字符与码点仍保留。

数字使用同一固定 UCD 提交的 `extracted/DerivedNumericValues.txt`，含其 Unihan 派生记录，全量 2,023 个数值字符。不是只检查 Nd／Nl／No 类别，107 个 Han 文字系统的数值字符也保留。分组：十进制数字 770、罗马 39、分数 125、汉字数值 107、围合数字 153、上下标 20、算筹 25、玛雅 20、楔形 119、爱琴 45。各分组可以重叠，并非上述分组之和等于全集。

标准数值作为整数／分数字符串保存和导出，不使用浮点数代替 `1/3` 或 `-1/2`。查询支持 `数值:1/3` 和 `value:1/3`；仅按源表精确值匹配，不计算表达式或归约用户输入的分数。每组文字另有“本组数值字符”视图；Unicode 未赋予数值属性的字母不猜填传统字母记数。原始文本复制不受数值元数据影响。

第二轮验证：逐码点对照原始 Script／Script_Extensions 与全部 DerivedNumericValues；校验新增选择与原有 CLDR／韩文记录；实际浏览器遍历 29 个新增入口，检查数值详情、带负号分数、汉字分组、按值检索、完整 2,023 项导出及原字符复制。检查无匹配时禁用复制／下载，手机无溢出。首次检查发现数字“汉字”视图与日语“汉字”视图同名分支冲突，按语言所有者限定后，单元与实际浏览器用例通过。仅执行字符表相关检查，无整站验收。

## 来源与参考编码

- UCD：[unicode-org/unicodetools](https://github.com/unicode-org/unicodetools)，固定提交 `48d732faae1ba71ce9135db787e5a339f0559a98`，路径 `unicodetools/data/ucd/17.0.0/{UnicodeData,Scripts,ScriptExtensions,Blocks}.txt`。
- CLDR：[unicode-org/cldr-json](https://github.com/unicode-org/cldr-json/tree/48.2.0)，固定标签 `48.2.0`，路径 `cldr-json/cldr-misc-full/main/{ja,ko,el,ru,he,ar,th,hi}/characters.json`。完整原件和逐文件 SHA-256 在 `upstream/character-tables/PINS.json`。
- 数据许可均为 Unicode License v3；运行包 `public/vendor/character-tables/` 同时保存 LICENSE、NOTICE、SOURCE。关于页及实际工具页末均列出 UCD 与 CLDR。
- 先用 XERJ 查本项目 Unicode、外站指南所有者，再查 IT-Tools 的 Unicode／字符检索。参考 `CorentinTh/it-tools` 提交 `d505845f918e946ec300af7b36efc107e2f66e9e`，`src/tools/emoji-picker/emoji-picker.vue:9-39` 的分组、码点及名称检索组织；未复制其 GPL 代码或引入 Vue。页面使用本站共享 UI 与来源所有者。
- [pudone](https://pudone.com/) 仅登记外链及本站撰写的用途介绍，不抓取工具代码，不登记为已集成依赖。

离线重建命令：`python scripts/build-character-tables.py`。生成前检查所有固定输入摘要；普通页面运行无外站请求，资料仅首次进入时从本站加载。

## 本轮验证

- 字符模型与外站目录定向单元检查通过：完整文字系统覆盖、固定输入摘要、CLDR 原文、完整韩文音节及名称、组合标记与多码点复制／导出、pudone 登记。
- 新能力的 registry、帮助、实际科普章节和来源契约定向检查通过。首次浏览器检查暴露缺少科普章节前言，补齐真实内容后通过启动与入口检查。
- `scripts/browser-character-tables.mjs` 通过：延迟载入、失败重试、搜索入口、8 种语言、复制、分页、11,172 项完整下载、键盘操作、离页重进、来源页脚及 pudone 链接。没有页面脚本错误或外站请求。
- 1440、800、390 像素宽度无横向溢出；检查桌面和手机实际截图。只保存本轮验收图，不制作前后对照。
- 定向共享 UI 工厂、样式及模块导入边界检查通过。未运行整站套件；未提交、推送或部署。
