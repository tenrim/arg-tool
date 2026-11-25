---
capabilityId: op:DateTime%20Delta
title: 日期时间加减
topicGroup: coordinates-time
summary: 对已知时刻加减日、小时、分、秒，理解闰日、跨月和跨年。
aliases:
  - DateTime Delta
  - 日期加减
  - 时间增减
sources:
  - id: moment
    title: Moment.js 文档
    publisher: Moment.js
    url: https://momentjs.com/docs/
    language: en
    kind: official-doc
    locator: String + Format、Add / Subtract、周与日历字段
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
    locator: DateTime Delta：按 UTC 解析并依次加减 days、hours、minutes、seconds
---

## 介绍
<!-- sources: rfc, moment -->
日期时间加减用既有时刻和一段增量得到另一个时刻。跨过午夜要进入邻日，跨过月末要用相邻月份的实际长度，跨年则要更新年份。

## 按顺序施加量
<!-- sources: moment, engine -->
在当前处理里，日期按 UTC 解析，依次调整日、小时、分和秒，最后按输入格式输出。以整秒输入为例，1 小时是 3600 秒，1 分是 60 秒；在该 UTC 日历运算中，跨天后用公历月份确定年月日。

## 闰日和边界
<!-- sources: rfc, moment -->
公历月份的长度有 28、29、30 或 31 天。闰年里的 2 月有 29 天。因此，从 3 月 1 日减一天有时会到 2 月 28 日，有时会到 2 月 29 日。日历中的一个月也不能统一换成 30 天。

## 可核对的跨日样本
<!-- sources: rfc, engine -->
均以 YYYY-MM-DD HH:mm:ss 表示 UTC，保证结果可直接比较。

:::example 闰年二月底的进位
[输入]
2024-02-28 23:59:59，加 1 秒
[结果]
2024-02-29 00:00:00
[说明]
越过午夜进入 2 月 29 日。
:::

:::example 跨月减一天
[输入]
2024-03-01 00:00:00，减 1 天
[结果]
2024-02-29 00:00:00
[说明]
在闰年里，3 月之前的最后一天是 2 月 29 日。
:::

:::example 向前跨年
[输入]
2024-12-31 23:30:00，加 2 小时
[结果]
2025-01-01 01:30:00
[说明]
先过午夜进到下一年，表盘时间留下 1 小时 30 分。
:::

## UTC 与当地日历
<!-- sources: rfc, moment, engine -->
有夏令时的当地日历里，从今天的同一表盘时间到明天可能是 23 或 25 小时。UTC 计算不会加入当地夏令时切换。若题目提供本地时间，应先确定时点，再区分题意是加实际时长还是跳到下一当地日。

## 常见误区
- 不能一律把一个月当 30 天。
- 跨过闰日时要使用实际年份。
- UTC 下的日期加减不会自动模拟指定地区的夏令时。
