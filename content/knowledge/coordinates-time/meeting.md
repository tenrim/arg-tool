---
capabilityId: native:meeting
title: 跨时区会议规划
topicGroup: coordinates-time
summary: 在共同时间轴上比较各地点的当地可用时间，检验整场会议并寻找空档。
aliases:
  - 世界时间
  - 共同空档
  - 夏令时
  - 时差
  - meeting planner
sources:
  - id: rfc
    title: RFC 3339
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc3339.html
    language: en
    kind: standard
    locator: 第 4 节 当地时间的偏移
  - id: iana
    title: Time Zone Database
    publisher: IANA
    url: https://www.iana.org/time-zones
    language: en
    kind: official-doc
    locator: 各地 UTC 偏移和夏令时规则
  - id: tz-na
    title: tzdb 北美区规则
    publisher: IANA
    url: https://data.iana.org/time-zones/tzdb/northamerica
    language: en
    kind: official-doc
    locator: Rule US、America/New_York
  - id: planner
    title: 时区解释与共同空档
    publisher: 迷雾工具箱
    url: /timezones/planner.js
    language: zh-CN
    kind: implementation
    locator: selectInstant、meetingAt、planMeeting
---

## 介绍
<!-- sources: rfc, iana, planner -->
跨时区会议规划把一个会议开始时刻和一段实际持续时间分发到各地点。比较在每个地点显示的当地日期和钟点，可以决定会议是否落入各自的可用时间。

## 从提议地点换算共同时间
<!-- sources: rfc, iana -->
用提议地点、当地日期和钟点找到一个 UTC 时刻，再按参与地点在这一时刻的偏移转换。比较当地时间时应保留年、月、日及星期，跨过午夜会改变日期。

:::example 上海晚间与纽约上午
[输入]
2026-01-15 21:00 上海时间，持续 60 分钟
[结果]
UTC 为 13:00–14:00；纽约为当天 08:00–09:00
[说明]
上海减八小时换算 UTC，纽约一月采用 UTC−05:00。
:::

:::example 跨到当地上一天
[输入]
2026-01-15 08:00 上海时间
[结果]
纽约当地 2026-01-14 19:00
[说明]
得到的 UTC 时刻为 1 月 15 日零点，向西换算时跨过午夜。
:::

## 对整段会议检查可用性
<!-- sources: planner -->
会议占据从开始时刻起、到结束时刻之前的连续区间。可用性需要覆盖占用的时间段，结束可刚好落在可用区间的右边界。若限定星期一至星期五，也要按每位参与者当地的星期判断。

:::example 右边界和跨界对照
[输入]
可用 09:00–18:00 UTC；分别检查 17:00 开始开 60 分钟和 17:59:30 开始开 1 分钟
[结果]
第一场可用，第二场不可用
[说明]
第一场只占用 18:00 之前的时间，第二场有 30 秒落在窗口之外。
:::

## 夏令时与持续时间
<!-- sources: iana, tz-na, planner -->
会议长度以实际经过的分钟计。跨越调钟时，单看当地开始和结束的小时数会误读长度。遇到重复的钟面时间，还要标出偏移或说明是第一遍还是第二遍。

:::example 春季拨快一小时
[输入]
纽约 2026-03-08 01:30 开始，持续 60 分钟
[结果]
当地结束时间 03:30
[说明]
开始对应 06:30 UTC，结束对应 07:30 UTC，期间当地偏移从 −05:00 变为 −04:00。
:::

## 共同空档的筛选
<!-- sources: planner -->
将搜索起点向上取到下一个半小时刻度，再找所有地点均满足持续时间的候选。查找窗口长七天，最多列十二个匹配项。未找到某个候选时，区分无共同区间和现有共同区间未覆盖采样刻度。

## 常见误区

- 同一个 UTC 时刻可以在两个地点属于不同日期和星期。
- 只检查开场时刻可能漏掉会议超出可用区间的部分。
- 昨天算出的城市时差不宜直接套到跨夏令时的未来日期。
- 半小时刻度的搜索结果不包含未落在刻度上的全部可能时间。
