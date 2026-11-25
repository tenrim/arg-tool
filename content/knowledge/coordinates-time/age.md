---
capabilityId: native:age
title: 年龄计算
topicGroup: coordinates-time
summary: 按出生日期和年度生日判断已满周岁及距离下一次生日的天数。
aliases:
  - 周岁
  - 生日
  - 下次生日
  - age calculator
sources:
  - id: usno
    title: Leap Years
    publisher: U.S. Naval Observatory
    url: https://aa.usno.navy.mil/faq/leap_years
    language: en
    kind: official-doc
    locator: 公历闰年例外与 400 年循环
  - id: dates
    title: 公历日期运算
    publisher: 迷雾工具箱
    url: /practical/dates.js
    language: zh-CN
    kind: implementation
    locator: civil、shiftDate、dateDifference、ageAt
  - id: python
    title: datetime 日期模型
    publisher: Python Software Foundation
    url: https://docs.python.org/3/library/datetime.html
    language: en
    kind: official-doc
    locator: date、timedelta 与 isocalendar
---

## 介绍
<!-- sources: dates, python -->
周岁是到参考日期时已经度过的出生周年数。以出生的公历年月日为起点，比较参考日期与该年的周年日，可确定年龄是否已随这一年的生日增加。

## 用周年日判断已满年数
<!-- sources: dates, python -->
先以参考年份减出生年份，再比较参考月日与该年生日。参考日期早于该年生日时，要从年份差中扣去一年。在出生当天，到达的周年数为零。

:::example 生日前与生日当天
[输入]
出生于 2010-11-25，分别在 2026-11-24 与 2026-11-25 计算
[结果]
15 周岁；16 周岁
[说明]
前一天尚未过满第 16 个周年，后一天恰好到达周年日。
:::

## 闰日出生的平年周年日
<!-- sources: usno, dates -->
2 月 29 日出生者在平年遇不到原月日。日期算术可按 2 月的最后一天映射到 2 月 28 日，也可按 2 月 28 日的次日映射到 3 月 1 日。两条规则只有在平年的 2 月 28 日一带会造成周岁判断分歧。

:::example 平年采用不同周年日
[输入]
出生于 2000-02-29，参考日期 2025-02-28
[结果]
采用 2 月 28 日为周年日得 25 岁，采用 3 月 1 日得 24 岁
[说明]
两种计算的年份差都是 25。后一种周年日尚未来到，扣去一年。
:::

## 最近一个尚未过去的生日
<!-- sources: dates, python -->
若当年周年日尚未过去，使用当年周年日。已经过去则取下一年的周年日，再按日历天数计算距离。当天的距离为零。

:::example 距离周年日还有一天
[输入]
出生于 2000-02-29，参考日期 2025-02-28，平年按 3 月 1 日
[结果]
下个周年日为 2025-03-01，相距 1 天
[说明]
2025 年 2 月止于 28 日，下一个民用日期就是 3 月 1 日。
:::

## 周岁与已过天数
<!-- sources: usno, dates -->
相同周岁可以对应不同的已过天数，原因包括出生日期、闰日和参考日期。精确到天的年龄描述可另外给出日期差。参考日期早于出生日期时不存在已过的出生周年。

## 常见误区

- 只做年份相减会在当年生日之前多算一岁。
- 出生当天的周岁为零。
- 闰日出生的平年周年日需要明示计算约定。
- 不宜把周岁乘以固定的 365 天推算已过天数。
