# 鸟类与古典音乐固定资料

运行时只读取本地固定数据，不查询远端 API，不抓取图片、录音或乐谱。原始文件摘要在 `pins.json`；运行输出摘要在 `public/vendor/atlas-life-culture/UPSTREAM.json`。

## AviList v2025b Extended

- 固定官方 Extended XLSX（2026-06-11 修订），不是 Short 版本。
- 完整保留全部 33,684 条分类记录：46 目、252 科、2,376 属、11,131 种和 19,879 亚种；全部 26 列。
- 全部六个工作表及其中的决策说明、引文、使用说明、参考文献和变更记录保留。主表两行标题和辅助表原行号、注释、公式与超链接元信息在 `birds-metadata.json`；主表记录通过 `recordsRef` 引用 `birds.json`。原始 XLSX 也随运行包提供下载，保留原格式、样式与对象，不以 JSON 代替归档原件。
- 不改写英文名、学名、分布或上游分类，不自作添加中文鸟名或图片。
- CC BY 4.0，精确署名与完整法律文本随包。

## Open Opus

- 固定官方 `work/dump.json` 完整快照；以当前实际数据计数，不采用 ALLDATA 示例中的旧计数。
- 每位作曲家和其全部作品的所有原字段原样保存，运行格式只拆分关系并生成本快照的本地 ID。完整原 dump 保留在上游目录。
- 数据为 CC0 1.0；没有复用 PHP/API 软件代码，也没有获取肖像、录音或乐谱。资料范围是该发行实际收录的作曲家及作品，不称为全球音乐全集。

## 维护

普通构建离线，仅用 Python 标准库，不需要额外依赖：

```powershell
python scripts/build-atlas-life-culture.py
```

只在维护更新时运行下载器。默认只下载缺失文件并核验固定摘要；远端内容变化会失败，必须评审后明确使用 `--refresh` 更新 pins，再检查范围和许可：

```powershell
python scripts/import-atlas-life-culture.py
python scripts/import-atlas-life-culture.py --refresh --snapshot-date YYYY-MM-DD
```

查询接口在 `public/atlas-life-culture/core.js`；分页先过滤索引再创建当前页记录对象，完整原字段仅在当前页／选中记录生成，不创建全库 DOM。
