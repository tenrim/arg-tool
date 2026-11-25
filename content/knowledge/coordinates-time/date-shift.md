---
capabilityId: native:date-shift
title: 日期加减
topicGroup: coordinates-time
summary: 在公历中按年月移动，再按周天数跨越日期边界。
aliases:
  - 日期推算
  - 几年几月几天后
  - add days
  - date arithmetic
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
<!-- sources: usno, dates -->
日期加减用于求基准日期之前或之后的某一天。年、月由历法定义，周固定为七个民用日期步长。公历一月有 31 天，四月有 30 天，二月的长度取决于年份。

## 公历月长与闰日
<!-- sources: usno, python -->
公历年份能被 4 整除时通常为闰年。整百年还须能被 400 整除。因此 2000 年的二月有 29 天，1900 年和 2100 年的二月各有 28 天。判断目标月长度要使用目标年份。

:::example 跨越世纪边界
[输入]
2099-02-28，加 1 年，再加 1 天
[结果]
2100-03-01
[说明]
加年先得到 2100-02-28，2100 年二月只有 28 天，后移一天即进入三月。
:::

## 年月的合并与截取
<!-- sources: usno, dates -->
以一年十二个月为单位，给基准年、月对应的连续月编号加上 12×年数＋月数，再还原为目标年和月。目标月缺少原日号时，取该月最后一天。原日号仍存在时直接保留。

:::example 闰年的月末
[输入]
2024-01-31，加 1 个月
[结果]
2024-02-29
[说明]
目标月日号上限是 29，原日号 31 被截取为 29。
:::

## 周天偏移的应用顺序
<!-- sources: dates, python -->
以年月处理后的日期为锚点，再移动 7×周数＋天数。负值表示向过去数。年月在一个连续值中合并，可以避免基准日经过多个短月时被反复截取。

:::example 年月合并后保留日号
[输入]
2024-02-29，加 1 年、1 个月和 1 天
[结果]
2025-03-30
[说明]
先把年月合为 13 个月，移动到 2025 年 3 月并保留 29 日，再加一天。
:::

:::example 月末倒推
[输入]
2025-03-31，减 1 个月再减 1 天
[结果]
2025-02-27
[说明]
先取 2025 年 2 月的月末 28 日，再向前数一天。
:::

## 周期计划中的月末基准
<!-- sources: dates, python -->
逐次从上次计算结果递推时，截取后的日号会成为新的基准。若约定始终在月末执行，宜分别按每个目标月确定月末。例如从闰年 1 月 31 日移动一个月再退一个月，得到的是 1 月 29 日。

## 常见误区

- 月份长短随月份和年份变化，把每个月当成 30 天会改变结果。
- 加月份和加天数的次序有影响，尤其在月末。
- 月末截取会丢失原日号，反向加减不能保证还原。
- 民用日期步长按日历数天。涉及当地时刻和夏令时的实际小时数需要另算。
