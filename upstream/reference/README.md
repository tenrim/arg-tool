# 信息查询数据维护

资料快照日期：2026-10-09。普通 `npm run build` 只复制已检入 public 文件，不联网、不安装 Python 包。导航位置为“资料查询”的对应能力组，旧工具深链接继续兼容，功能与覆盖范围见 [主文档](../../README.md#信息查询2026-10-09)。

## 固定版本

| 仓库 | 提交 |
| --- | --- |
| [lipis/flag-icons](https://github.com/lipis/flag-icons) | `086f7e97d657358203916dbe84f61c2bccaa81eb` |
| [meodai/color-names](https://github.com/meodai/color-names) | `e47b4d8049bdad78d2d6bd05fa1855fceb94c948` |
| [smallcat419/tarot-card-data](https://github.com/smallcat419/tarot-card-data) | `b40718b33ea9de3a89dc65fc0e2c9a9a605e409e` |
| [mixvlad/TarotCards](https://github.com/mixvlad/TarotCards) | `840b84d012c6b74dc1634fa2d00d1b21f5b28093` |
| [reginanka/tarot-cards / Gearberry](https://github.com/reginanka/tarot-cards) | `83a25b0d4caeb24fa7d556796cf6244d8a55fd81` |
| [strobus/i-ching](https://github.com/strobus/i-ching) | `631a04b28ab7cc41f94265178bb99726831f2591` |
| [cod-developers/cod-tools](https://github.com/cod-developers/cod-tools) | `0060d4652a5a262fbda2276801f1244060d67128` |
| [annexare/Countries](https://github.com/annexare/Countries) | `1c393325611d89d3511de01269a4f60fe9dc1c6f` |
| [datasets/un-locode](https://github.com/datasets/un-locode) | `b1309b37edea63334a819a78c22b8967f61c37ad` |
| [i-c-stratigraphy/geologic-timescale-kg](https://github.com/i-c-stratigraphy/geologic-timescale-kg) | `76470bdd8bbdb3dc9543baa83c38512dbcdf5f9b` |
| [unicode-org/unicodetools](https://github.com/unicode-org/unicodetools) | `48d732faae1ba71ce9135db787e5a339f0559a98` |
| [davidmegginson/ourairports-data](https://github.com/davidmegginson/ourairports-data) | `56abe495bb3afcf8b5d8f01feec0f46ba4fd753f` |
| [oeis/oeisdata](https://github.com/oeis/oeisdata) | `693b5499c9d248f570dd2d979e8bd1d7eecf689b` |
| [i-c-stratigraphy/chart](https://github.com/i-c-stratigraphy/chart) | `81618a865cdb04998355a302f3e859908a080c0e` |

`imports.json` 保存每个原始文件的固定 URL 和 SHA-256，`sources/` 保存原始字节；`public/vendor/reference/UPSTREAM.json` 同时覆盖原始与派生文件。国家旗帜 250 份；塔罗两套各 78 张：Gearberry WebP（848×1264）及经典 RWS JPG（720×1200）。具体数量见运行目录 META.json。2026-10-16 已撤下 272 条 OEIS 精选索引和 14 份 COD 晶体样本；表中这两个项目仅保留原始归档，不再生成或发布数据、导航和科普入口。

地质运行数据实际只从 ICS chart 的 `chart.ttl` 提取，保留中文/英文名称、层级、边界和颜色。勘察时同时保存的 geologic-timescale-kg 及 gts2020 资料不参与运行数据合并，不应把不同版本边界混用。历史 CIF 原件及许可保留用于来源追溯和解析器回归，来源为 cod-tools 的 COD 快照，未使用该程序代码。解析器已迁入 `public/round4/cif.js`，仅由模型页的本机文件导入使用。

地图补充固定 [nvkelso/natural-earth-vector](https://github.com/nvkelso/natural-earth-vector) 提交 `ca96624a56bd078437bca8184e78163e5039ad19`。原文为 world.geojson 与 natural-earth-LICENSE.txt；生成器新增 world.json（177 个完整多边形环的等距圆柱路径）和 unicode-blocks.json（346 个 Unicode 17 区块）。地图保留源数据的简化轮廓与孔洞，仅用 ISO_A2_EH／ISO_A2 的有效国家代码匹配资料；未知地区保留独立 `ne:ADM0_A3` 标识且不可冒充已知国家，不能用 POSTAL 邮政缩写推断身份（北塞浦路斯的 CN 不代表中国）。此规则在 `scripts/reference_world.py` 由完整生成器和回归共用；不从轮廓推断机场或运输地点坐标。地图数据为公共领域，声明随原文和派生资料提供。

## 重建

需要 Node.js 24、Python 3 与维护专用 rdflib 7.2.1：

```bash
python -m venv /tmp/arg-reference-venv
/tmp/arg-reference-venv/bin/pip install rdflib==7.2.1
# 仅更新/恢复固定原始资料时运行，需联网：
python scripts/import-reference.py
# 从固定原文离线生成 JSON、许可与摘要：
/tmp/arg-reference-venv/bin/python scripts/build-reference.py
npm run audit:integrity
npm run verify -- --files scripts/build-reference.py
```

升级提交前先审查上游许可和字段变化。当前导入器复用已经存在的原始文件；变更 pins 时必须先移除相应旧文件再导入，避免把旧字节记到新 URL 下。生成器将中文地区显示名固化，因此维护时 Node/ICU 版本变化可能产生名称差异，须审核 diff。Unicode 使用 17.0.0 的四份 UCD 原文件；连续范围压缩保存，运行时生成汉字及 Hangul 标准名称。退役 OEIS/COD 原件只保留已有哈希，不再重新抓取；离线生成会明确清理旧的派生数据和随站声明。

## 许可与边界

许可证、具体来源用途见 [THIRD_PARTY](../../THIRD_PARTY.md)，每页也有相同归属。ICS 派生索引为 CC BY 4.0；不得统一改标为本站代码许可。Unicode、旗帜、机场、运输地点、塔罗等独立条款均随站点分发。历史 OEIS/COD 原文许可随 upstream 归档保留，不再声称它们是本站运行时依赖。

这些是固定快照，不表示实时机场运行状态、港口服务或最新科学结论。完整数列和晶体检索应使用 OEIS 与 COD，见 [外站资料清单](../../docs/EXTERNAL_REFERENCE_GUIDE.md)。本机 CIF 导入的格式与限额见主文档；三维球体不代表键长预测或矿物鉴定结果。

默认塔罗素材使用 Gearberry 的 78 张 WebP，按上游 README / LICENSE.md 的明确 CC BY 4.0 牌面声明分发，并保留原文与要求的署名“Tarot Cards WebP Collection by Gearberry”。上游未注明原始画师及图片创作方式，本站不推断为手绘或 AI；来源范围记录在 tarot-gearberry-NOTICE.txt。原 cards.json 完整保存在 sources/tarot-gearberry-cards.json，仅用于来源与牌名验证；其占卜解释和牌背未引入运行工具。源 WebP 与运行 WebP 字节一致。

经典切换保留 TarotCards 的 1909 RWS 720px 目录，源与运行 JPG 字节一致。tarot-art-README.txt / SOURCES.txt / metadata.json 保存牌面公共领域声明，tarot-art-LICENSE.txt 对应文档 MIT，NOTICE 记录原画、出版、修复与镜像归属。生成器按英文牌名与等级绑定两套图片，不依赖记录顺序。Gearberry 正义 VIII／力量 XI，与 RWS 力量 VIII／正义 XI 分开映射；运行模块 tarot-art.js 统一牌面文件、编号与尺寸，Worker 数字查询与下拉排序随版本切换。browser-reference 实际解码全部 156 张图片并验证尺寸、版本切换／查询保留／准确编号／下拉／叠牌／键盘／手机滑动。色盘由本站实现，与查询共用修改失效机制。
