---
capabilityId: native:timezones
title: 历史时区资料
topicGroup: world
summary: 按有版本的 IANA 时区资料，将时刻投影到当地钟面并判断间隙与重复。
aliases:
  - IANA
  - TZDB
  - TZif
  - 夏令时
  - 时差
  - DST
  - fold
  - gap
  - 历史时间
sources:
  - id: theory
    title: Theory and pragmatics of the tz code and data
    publisher: IANA
    url: https://data.iana.org/time-zones/theory.html
    language: en
    kind: author-spec
    locator: Scope、Accuracy、Abbreviations
  - id: format
    title: "RFC 9636: The Time Zone Information Format"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc9636.html
    language: en
    kind: standard
    locator: 第 3.2、3.3 节 TZif 过渡记录及尾部
  - id: rules
    title: tzdb-2026e North America
    publisher: IANA
    url: https://data.iana.org/time-zones/tzdb-2026e/northamerica
    language: en
    kind: author-spec
    locator: Rule US 与 America/New_York
  - id: pacific
    title: tzdb-2026e Australasia
    publisher: IANA
    url: https://data.iana.org/time-zones/tzdb-2026e/australasia
    language: en
    kind: author-spec
    locator: Australia/Lord_Howe 与 Pacific/Apia
  - id: model
    title: 历史时区转换
    publisher: 迷雾工具箱
    url: /timezones/core.js
    language: zh-CN
    kind: implementation
    locator: zoneState、localToUTC、utcToLocal
  - id: version
    title: IANA 2026e 资料清单
    publisher: 迷雾工具箱
    url: /vendor/timezones/UPSTREAM.json
    language: zh-CN
    kind: implementation
    locator: 默认 zic 版、598 名称、backward 与 backzone
---

## 介绍
<!-- sources: theory, format -->
时区标识代表一套钟面规则随时间变化的记录。一个地点的 UTC 偏移可以随着当地平太阳时、标准时、夏令时和规则变更而改变。分析历史时刻应保留所选地点与资料版本。

## 正向换算与别名
<!-- sources: format, model, version -->
TZif 保存按绝对时刻排列的转换记录，包括偏移、缩写和 DST 标志。由 UTC 计算当地时间时，先确定时刻落在哪个区间，再将东正西负的偏移加到 UTC 时刻。别名通常关联同一份已编译规则。

:::example 上海的偏移
[输入]
Asia/Shanghai，2024-01-01 00:00:00 UTC
[结果]
当地 2024-01-01 08:00:00，UTC+08:00
[说明]
在相应日期选择偏移 +28800 秒，加入 UTC 钟面。
:::

## 反算当地时间的候选
<!-- sources: format, rules, pacific, model -->
由当地时间反推时，可枚举可能偏移并回算。只有反向和正向检查都吻合的候选才保留。时钟回拨会保留两个候选，前跳会出现无法回算的区间。

:::example 纽约回拨
[输入]
America/New_York，当地 2024-11-03 01:30
[结果]
05:30 UTC 对应 EDT，06:30 UTC 对应 EST
[说明]
两个候选分别减 4 小时和 5 小时后，都显示当地 01:30。
:::

:::example 半小时的当地空缺
[输入]
Australia/Lord_Howe，当地 2024-10-06 02:15
[结果]
不存在这个钟面时刻
[说明]
转换日的钟面在 01:59:59 后直接显示 02:30:00，空缺为 1800 秒。
:::

## 尾部推算与缩写
<!-- sources: format, model, theory, pacific -->
TZif 第二版及以后可以在结尾携带适用于最后过渡之后的 TZ 字符串。未来输出由所用版本的规则推算，过渡可能跨年，DST 调整也可能是半小时或负值。其符号和时间基准应按格式定义解释；CST 等缩写也可能在多个地区复用。

:::example 跨整日的前跳
[输入]
Pacific/Apia，当地 2011-12-30 12:00
[结果]
无候选 UTC，空缺为 86400 秒
[说明]
规则变更使整个 12 月 30 日的当地日期被跳过。
:::

## 历史数据的可解释范围
<!-- sources: theory, format, version -->
当前固定资料使用 IANA 2026e 默认编译规则及 backward 别名，共 598 个名称。可选的 backzone 史料可阅览，未并入这份默认转换。时区数据库侧重 1970 年后的共同钟表历史，早期数据不能覆盖各地全部做法。这组计算使用 POSIX 秒，输入不包含 23:59:60 闰秒。

## 常见误区

- 不能把某城市今天的偏移套到任意年份。
- 时钟调整的长度不一定为一小时。
- 请用时区标识和完整日期解释缩写，而非凭缩写推断唯一偏移。
- 完整的发布版不保证每个地点的全部历史均有一致证据。
