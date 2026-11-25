---
capabilityId: native:countdown
title: 倒计时
topicGroup: coordinates-time
summary: 将目标时刻与当前时刻放在同一时间轴，按整秒分解剩余或已过时长。
aliases:
  - 距离某天
  - 已经过去
  - 纪念日
  - countdown
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
  - id: dates
    title: 公历日期运算
    publisher: 迷雾工具箱
    url: /practical/dates.js
    language: zh-CN
    kind: implementation
    locator: civil、shiftDate、dateDifference、ageAt
---

## 介绍
<!-- sources: rfc, dates -->
倒计时计算目标时刻与当前时刻的差。两者都表示为同一时间轴上的时刻后，可以从相减的正负判定剩余、到达或已过。

## 用时区确定目标时刻
<!-- sources: iana, rfc, planner -->
同一个当地年月日和时分，在不同时区对应的时刻可能不同。若当地偏移是 UTC+08:00，换算 UTC 时应从当地钟面读数减八小时。给定城市还需结合目标日期查当时的偏移。

:::example 同一时刻的两种钟面
[输入]
上海 2026-01-01 08:00，UTC 2026-01-01 00:00
[结果]
时间差为零
[说明]
上海的偏移是 UTC+08:00，将上海钟面读数减八小时便得到同一 UTC 时刻。
:::

## 从毫秒拆成日时分秒
<!-- sources: dates -->
设毫秒差 Δ 等于目标时刻减去观察时刻。整秒大小为 ⌊|Δ|/1000⌋。依次以 86400、3600 和 60 为单位除并取余，得到日时分秒。这里的一日表示经过 86400 秒。

:::example 一日一小时一分钟一秒
[输入]
目标比观察时刻晚 90061 秒
[结果]
剩余 1 天 1 小时 1 分 1 秒
[说明]
90061 可拆为 86400＋3600＋60＋1。
:::

## 调钟造成的空缺和重复
<!-- sources: iana, tz-na, planner -->
春季向前调钟可能跳过一段当地读数。秋季向后调钟则可能让一个读数对应两个真实时刻。前者要换一个有效输入，后者要标明使用转换前或转换后的那次。

:::example 纽约秋季重复半小时
[输入]
America/New_York，2026-11-01 01:30
[结果]
可对应 05:30 UTC 或 06:30 UTC
[说明]
夏令时期间采用 UTC−04:00，结束后采用 UTC−05:00，同一钟面相差一小时。
:::

:::example 纽约春季不存在的读数
[输入]
America/New_York，2026-03-08 02:30
[结果]
没有对应的当地时刻
[说明]
该日钟面从 01:59:59 跳到 03:00:00。
:::

## 剩余状态与显示精度
<!-- sources: dates -->
剩余或已过由原始时间差的符号决定，整秒栏位只显示已满的秒。相差不足一秒时，两个方向都可能显示零秒，直到原始差值等于零才恰好到达。

## 常见误区

- 跨城市比较目标时刻前应明确各自时区。
- 夏令时重复的钟面读数在选择先后前没有唯一的时间戳。
- 剩余的 86400 秒与到达下一个当地同一钟点可能不同。
- 用屏幕整数秒判断是否刚好到达会丢失毫秒级信息。
