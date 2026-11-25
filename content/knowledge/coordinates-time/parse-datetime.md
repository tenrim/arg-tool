---
capabilityId: op:Parse%20DateTime
title: 解析日期时间
topicGroup: coordinates-time
summary: 按格式和时区读出日期、时间、偏移及日历字段，核对无效日期。
aliases:
  - Parse DateTime
  - 日期解析
  - UTC 偏移
  - 年内日序
sources:
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
  - id: rfc
    title: RFC 3339 Date and Time on the Internet
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc3339
    language: en
    kind: standard
    locator: 第 4、5 节，UTC 偏移、日期、闰年与时刻表示
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Parse DateTime；format、isDST、isLeapYear、dayOfYear、week 和 quarter
---

## 介绍
<!-- sources: rfc, moment -->
日期解析依据字符串格式了解每段数字的含义，再结合时区确定时刻。输出的日期、星期、偏移和季度来自解析结果。若字符串只给出表盘时间，还缺少时区这一条件。

## 格式标记与日历检查
<!-- sources: rfc, moment, engine -->
常用年月日格式用 YYYY、MM、DD 分别表示年、月、日，HH:mm:ss 表示时分秒，其中小写 mm 是分钟。闰年可以有 2 月 29 日。公历年能整除 4 时通常是闰年，逢整百年要再能整除 400。

## 表盘、偏移和日历字段
<!-- sources: tz, moment, engine -->
地区时区可因当地规则和日期采用不同偏移。偏移不是地名本身，时区缩写也可能被不止一个地区使用。年内日序从 1 月 1 日记作第 1 天，周编号规则则可随语言区域改变，不能直接当成 ISO 周号。

## 闰日和时区实例
<!-- sources: tz, rfc, engine -->
三项都使用 YYYY-MM-DD HH:mm:ss 读取，分别观察闰年、本地偏移和无效日。

:::example UTC 闰日
[输入]
2024-02-29 12:34:56，UTC
[结果]
星期四，12:34:56，偏移 +0000；闰年，年内第 60 天，第一季度
[说明]
1 月有 31 天，2 月 29 日为本年的第 60 天。
:::

:::example 纽约夏季偏移
[输入]
2024-07-01 12:34:56，America/New_York
[结果]
星期一，12:34:56，EDT，偏移 −0400；处于夏令时
[说明]
此时纽约当地时刻比 UTC 晚 4 小时，换算到 UTC 为 16:34:56。
:::

:::example 非闰年的 2 月 29 日
[输入]
2023-02-29 12:34:56，UTC
[结果]
提示日期格式无效
[说明]
2023 不能被 4 整除，2 月没有第 29 日。
:::

## 资料核对中的时间歧义
<!-- sources: rfc, tz, moment -->
01/02/2024 等写法可能有两种日期顺序。夏令时切换还可能使某个当地时刻不存在或出现两次。必须保留材料给出的格式、时区或偏移；资料不足时可以列明假设再比较结果。

## 常见误区
- MM 是月份，mm 是分钟，不能互换。
- 当前区域的偏移与指定历史时点上的偏移可以不同。
- 周编号依赖开始日和第一周的定义，应根据来源核对。
