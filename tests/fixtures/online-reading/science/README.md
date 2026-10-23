# 在线科学资料阅读层固定回归样本

这些 JSON 是 2026-10-17 已保存的官方响应及本站适配器返回值的有界摘录，保留所测字段的原始值、单位、描述、参考系和来源；不是运行时查询样例或内置资料库。省略无关记录和重复的完整 XML／TSV 文本，只用于阅读层回归。原始检索条件在每个样本的 `result.parameters` 中。

- SIMBAD：M31 的名称、天区、B 波段测光、其他标识符和文献。原始检索经官方 TAP／ConeSearch，署名 CDS/SIMBAD 及原始测量、文献作者；适用 CDS 与各原资料条款。
- VizieR：`I/239/hip_main` 的目录、全字段模式和 HIP 1 记录，署名 CDS/VizieR 与 ESA Hipparcos 原目录作者；适用具体目录条款。
- PubChem：CID 2244 的检索结构、3D 结构、前八个同义词，以及分子式、标识符、分子量等有限注释。注释值继续对应各条目的 ReferenceNumber 和提供方；不是将全部注释认定为 CC0。

COD 当时连接超时，无下载响应；其回归在测试中明确使用协议边界样例，不作为真实结构或联网成功的证据。晶胞单位按照 [COD MySQL schema](https://wiki.crystallography.net/cod_mysql_schema/)，CIF 标准标签仅提取已有明确单行值。

各服务的许可与具体使用范围继续由项目现有在线来源 notice 记录，运行时不下载这些测试文件。
