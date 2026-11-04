# 固定字符资料

8 份 `characters.json` 原件来自 Unicode CLDR JSON 48.2.0。`ScriptExtensions.txt` 与已有 `../reference/sources/` 中的 UnicodeData、Scripts、Blocks 均对应 Unicode UCD 17.0.0。下载地址、固定版本／提交及原件 SHA-256 见 PINS.json。

`scripts/build-character-tables.py` 校验摘要后，完整解析选定语言的主字符、辅助字符、索引集合，以及选定文字系统的 Script／Script_Extensions。不会按人工样本截断集合。保留原 Unicode 名称、类别、文字系统、区段及多码点序列。

生成产物、Unicode License v3 原文及来源说明位于 `public/vendor/character-tables/`。语言表及明确范围见 `docs/CHARACTER_TABLES_2026-10-26.md`。这些是字符资料，不是语言词典；日语汉字与韩语汉字以 CLDR 所选集合为范围。

第二轮选择清单为 `repertoires.json`，新增 29 组文字；`DerivedNumericValues.txt` 完整保留同版 Unicode 全部数值属性及 Unihan 派生记录，SHA-256 和固定来源同样在 PINS.json。数值以整数／分数字符串保存，不截断或近似。普通构建无需联网。
