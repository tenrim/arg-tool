---
capabilityId: native:date-difference
title: 日期差
topicGroup: coordinates-time
summary: 把两个公历日期的间隔表示为带方向的天数、历法年月日或星期数。
aliases:
  - 相隔天数
  - 日期间隔
  - 星期数
  - 工作日
  - date difference
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
<!-- sources: python, dates -->
日期差有三个常见口径。天数差按跨越的日期边界计数，包含首尾的个数按区间内日期计数，年月日间隔则先量出完整的历法月。选择口径会改变输出的意义。

## 带符号的日数与端点
<!-- sources: python, dates -->
将每个公历日期赋予递增的整数序号，结束序号减去开始序号得到带符号天数。若要统计含首尾的日期个数，取带符号天数的绝对值再加一。同日相减为零，含首尾则有一个日期。

:::example 跨过一个闰日
[输入]
2024-02-28 至 2024-03-01，按经过天数
[结果]
相隔 2 天
[说明]
先跨到 2 月 29 日，再跨到 3 月 1 日。
:::

:::example 反向且数首尾
[输入]
2024-03-01 至 2024-02-28，包含首尾
[结果]
带符号的天数差 −2，区间含 3 个日期
[说明]
先后方向由相减决定，计数覆盖 2 月 28 日、29 日和 3 月 1 日。
:::

## 完整周与整月的拆分
<!-- sources: dates, usno -->
七个日期步长组成一周，把计数除以 7 可得整周及余日。历法月的拆法从较早日期出发，找到不跨过末日的最大整月数，再量取锚点到末日的余日。跨到较短月份时按月末截取。

:::example 整月与天数是不同口径
[输入]
2025-01-31 至 2025-02-28
[结果]
28 天，或 1 个月 0 天
[说明]
向后移动 1 个月时，原日号 31 截取到 2 月 28 日。
:::

## 星期计数
<!-- sources: python, dates -->
完整七天中有五个星期一至星期五。余下的不足一周可从区间较早日期逐日检查。便于复算的半开区间从较早日期开始，排除较晚日期。将末日纳入后，若它恰为周末，周中日期数保持不变。

:::example 周末前后的计数
[输入]
2024-03-01 至 2024-03-04，排除较晚日期
[结果]
3 个日期，星期一至五的日期有 1 个
[说明]
落在区间中的星期为五、六、日，只有星期五计入。
:::

## 日历天与实际时长
<!-- sources: dates, python -->
没有当地时分和时区的两个日期足以计算日历天数。要问两地实际经历的小时数，需先把当地时刻转换到统一时间轴。发生调钟的日期可能包含 23 或 25 小时。

## 常见误区

- 包含首尾的个数与带方向的天数差可以同时显示，符号口径不同。
- 工作日若只按星期一至五计数，不能自动涵盖假日、调休或轮班。
- 整月再加余日依赖实际的起止日期，月数不能一律乘 30。
- 同日的日差为零，只有把那天计入区间时才得到一。
