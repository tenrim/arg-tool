# 历史时区资料固定来源

本轮固定 **IANA TZDB 2026e** 与 Python Software Foundation 的 **tzdata 2026.5**。归档的固定地址、SHA-256 与逐文件摘要见 `public/vendor/timezones/UPSTREAM.json`。

- `tzdata2026e.tar.gz`：完整官方资料源包，全部普通文件保留在 `iana/`；运行包保留全部 Zone／Rule／Link 资料文件及 `backzone`、`backward`、`zone.tab`、`zone1970.tab`、`zonenow.tab`、`iso3166.tab`，没有人工筛选国家、时区或年份。
- `tzdata-2026.5-py2.py3-none-any.whl`：PSF 官方对应版本的完整 TZif 编译数据；运行目录中 598 个名称（包括别名）的 TZif 字节与该 wheel 完全相同。
- 这是上游默认 zic 编译口径：启用 `backward`，未启用可选 `PACKRATDATA=backzone`。`backzone` 的 125 个补充历史 Zone 块保留为单独史料查询，界面明确不将它们冒称实际换算规则。
- IANA 数据为公共领域。IANA LICENSE 提及的三个 BSD 源文件不在数据包中，也未进入本项目引擎。PSF 分发包装采用 Apache-2.0；版权简式声明与完整许可同时保留。

## 离线复现

在已有固定归档的情况下，运行 `python scripts/import-timezones.py` 可完全离线重新生成运行文件、目录和原始记录索引。显式使用 `--download` 才下载这两个固定地址；下载后先核对固定摘要，再提取，不执行 wheel 中任何 Python 代码。

普通网站构建不需要 Python、系统时区包、zic 或联网。浏览器内实际计算只使用本站 `public/timezones/core.js` 解析的固定 TZif 与 POSIX 尾规则，不调用 `Intl` 查询宿主时区资料。

## 计算与范围

支持公历延拓的 1–9999 年民用日期时间，秒级历史偏移、真实 DST 标志和缩写。当地时间映射枚举并验证全部偏移候选；重复时段保留全部 UTC，不存在的时段保留空结果和实际跳变范围。尾规则支持 M／J／年内日序、负转换小时以及 wall／standard／UTC 时间基准，包含南半球和负 DST。

时间尺度是 POSIX 秒，不累计闰秒。1970 年前的记录不保证全球完整；未来结果按此版本规则推算，不承诺各国政策保持不变。时区缩写不作为唯一时区标识。

`scripts/build-timezone-oracle.py` 只读取此固定 wheel，以 CPython `ZoneInfo.from_file` 生成独立对照 fixture（598 时区 × 10 个历史／未来日期）。fixture 位于 `tests/fixtures/`，不进入站点运行包。
