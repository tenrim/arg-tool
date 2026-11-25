---
capabilityId: op:Translate%20DateTime%20Format
title: 转换日期时间格式
topicGroup: coordinates-time
summary: 先按输入格式和时区建立时刻，再用目标时区与格式呈现同一事件。
aliases:
  - Translate DateTime Format
  - 日期重排
  - 时区转换
sources:
  - id: rfc
    title: RFC 3339 Date and Time on the Internet
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc3339
    language: en
    kind: standard
    locator: 第 4、5 节，UTC 偏移、日期、闰年与时刻表示
  - id: moment
    title: Moment.js 文档
    publisher: Moment.js
    url: https://momentjs.com/docs/
    language: en
    kind: official-doc
    locator: String + Format、Add / Subtract、周与日历字段
  - id: tz
    title: Moment Timezone 文档
    publisher: Moment.js
    url: https://momentjs.com/timezone/docs/
    language: en
    kind: official-doc
    locator: Parsing in Zone 与 Converting to Zone
  - id: iana
    title: Theory and pragmatics of the tz code and data
    publisher: IANA Time Zone Database
    url: https://data.iana.org/time-zones/theory.html
    language: en
    kind: standard
    locator: 地区时区命名与历史 UTC 偏移
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Translate DateTime Format：读取输入格式与时区，选择输出格式与时区
---

## 介绍
<!-- sources: rfc, moment, tz -->
日期时间格式转换把同一个时刻改用另一种文字表示。它可以只改变分隔符，也可以改变说明该事件的当地时区和表盘值。

## 区分解析和格式化
<!-- sources: moment, engine -->
先按输入格式决定字段的含义，再按输入时区把当地表盘放到时间线上。最后将该时刻调到目标时区，用输出格式组成文本。YYYY 对应年，MM 对应月，DD 对应日，Z 常用于显示带冒号的数字偏移。

## 区域和数值偏移
<!-- sources: rfc, tz, iana -->
UTC 偏移用当地时间与 UTC 的差来表示。固定的 +08:00 是一个偏移值。America/New_York 则表示一套可随时间改变的地区规则，应按该时刻实际适用的偏移换算。

## 日期重排与跨日实例
<!-- sources: rfc, tz, engine -->
下面的例子分别改变输出时区和字段排布。输出格式可使结果日期跨日，但时间线上的时刻沿用源值。

:::example 上海时间换 UTC
[输入]
2024-02-29 08:30:00，Asia/Shanghai；输出到 UTC，格式 YYYY/MM/DD HH:mm:ss Z
[结果]
2024/02/29 00:30:00 +00:00
[说明]
上海在该日为 UTC+08:00，从本地表盘减 8 小时得到 UTC。
:::

:::example UTC 换纽约并跨回上一日
[输入]
2024-07-01 00:00:00，UTC；输出到 America/New_York，格式 YYYY/MM/DD HH:mm:ss Z
[结果]
2024/06/30 20:00:00 -04:00
[说明]
纽约此时偏移为 −4 小时。日期变成上一日，但时刻未变。
:::

:::example 日月顺序明确后再重排
[输入]
01/02/2024 00:00:00，指定 DD/MM/YYYY HH:mm:ss 与 UTC；输出 YYYY-MM-DD
[结果]
2024-02-01
[说明]
第一个字段是日，第二个是月。输出省略了时分秒和偏移。
:::

## 输出中省略的信息
<!-- sources: rfc, iana, moment -->
仅输出日历日期时，原时分秒和时区不在结果字符串里。原材料可保留完整日期时间和偏移，便于跨系统对照。重复出现的当地时钟时间需要显式偏移，才能区分夏令时切换前后的两个时刻。

## 常见误区
- 日期跨日可能来自时区转换，事件的时刻保持一致。
- 地区时区与固定偏移的含义不同。
- 省略偏移或时间字段后的文本不能保证可逆地恢复完整时刻。
