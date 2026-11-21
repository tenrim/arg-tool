# 在线科学资料阅读层固定回归样本

这些 JSON 是 2026-10-17 已保存的官方响应及本站适配器返回值的有界摘录，保留所测字段的原始值、单位、描述、参考系和来源；不是运行时查询样例或内置资料库。省略无关记录和重复的完整 XML／TSV 文本，只用于阅读层回归。原始检索条件在每个样本的 `result.parameters` 中。

- PubChem：CID 2244 的检索结构、3D 结构、前八个同义词，以及分子式、标识符、分子量等有限注释。注释值继续对应各条目的 ReferenceNumber 和提供方；不是将全部注释认定为 CC0。

COD 的早期回归使用明确的协议边界样例。2026-11-10 增加 `cod-detail-duplicate.json`，为官方 REST 接口指定 1000000 并开启 include_duplicates/include_errors/include_theoretical 后返回的完整原始记录，检验精确 ID 不受普通检索排除规则影响；不把保留夹具等同于任何时刻的外站可用性。晶胞单位按照 [COD MySQL schema](https://wiki.crystallography.net/cod_mysql_schema/)，CIF 标准标签仅提取已有明确单行值。

各服务的许可与具体使用范围继续由项目现有在线来源 notice 记录，运行时不下载这些测试文件。
