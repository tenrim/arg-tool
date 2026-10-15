# 围棋、海事旗、货币与天体目录

固定上游提交在 `pins.json`，原始文件和逐文件摘要在 `imports.json`；发布文件、原始文件与维护脚本摘要统一登记到 `public/vendor/discovery/UPSTREAM.json`。普通构建仅复制已经固定的本地文件，不联网，也不需要 Python。

| 上游 | 实际使用 | 许可 |
| --- | --- | --- |
| [Sabaki SGF](https://github.com/SabakiHQ/sgf) 3.5.0 | 字符串 SGF 解析、节点、分支、转义；生成 ESM 时移除 Node 文件/Buffer 编码接口 | MIT |
| [doken](https://github.com/yishn/doken) 1.0.0 | SGF 解析器的 tokenizer；原始包保留，依赖固定 | MIT |
| [Marine Signal Flags](https://github.com/dzangolab/marine-signal-flags) | 26 面字母旗和 10 面数字旗原始 SVG；保留 Panayiotis Lipiridis 的许可署名 | MIT |
| [Currency Codes](https://github.com/datasets/currency-codes) | 446 条 ISO 4217 实体记录，277 条现行快照、169 条历史记录；数字代码以字符串保留前导零 | PDDL 1.0 数据 |
| [HYG Database](https://github.com/astronexus/HYG-Database) 4.1 | 9,026 条 V 星等 ≤6.5 或有专名的恒星，排除太阳；保留原始目录字段 | CC BY-SA 4.0，派生数据同许可 |
| [OpenNGC](https://github.com/mattiaverga/OpenNGC) | 全部 NGC/IC 及补充表 14,034 条记录；J2000 方向、别名、类型与字段来源 | CC BY-SA 4.0，派生数据同许可 |

海事旗的简短中文单旗含义为本站按事实编写，不是对上游 SVG 项目的文字资料声明；不包含替代旗、回答旗及完整多旗信号书。货币不含汇率，国家对应关系使用现有固定 Countries 数据，不能当作实时货币公告。

天体索引共 23,060 条，47 个详情分包每包最多 500 条，按结果当前页加载。7 条缺失坐标保留 `null`；Dup/NonEx 类型不能送入天文计算。赤经为 J2000 小时，赤纬为度；恒星距离哨兵不作为真实距离显示。天文联动调用现有 Astronomy Engine，将固定方向换算到观测日期，忽略自行、真实距离视差、地形和面状范围。

棋盘、基础提子/禁止自杀/简单劫规则、分支选择和 SVG 导出由本站实现。SGF 文件最多 512 KB、2,000 节点、32 局，支持 UTF-8、2–25 路正方形；不提供 AI、胜率、自动数目或完整规则裁判。

维护重新下载：`python3 scripts/import-discovery.py`；仅此步骤联网。离线重新生成：`python3 scripts/build-discovery.py`。任何生成前先运行 `npm run audit:integrity`，核对原始固定文件后才能更新清单。`tests/discovery.test.mjs` 与 `scripts/browser-discovery.mjs` 验证实际规则、资料、联动、失败恢复及普通/Blob/子目录线程，已纳入统一 `npm run verify`。

HYG 原始 33,932,548 字节 CSV 以确定性 gzip 归档保存在 `upstream/discovery/sources/hyg/hygdata_v41.csv.gz`，避免源码托管单对象限制。导入和离线生成保留全部原始内容，清单同时保存归档 SHA-256、解压原文 SHA-256 和原文大小；完整性审计核对两者。网页数据、引擎、许可和声明字节保持不变。
