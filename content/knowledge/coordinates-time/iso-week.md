---
capabilityId: native:iso-week
title: ISO 周与年内日序
topicGroup: coordinates-time
summary: 区分 ISO 周所属年和公历年，计算周日期、星期及公历年中的日序。
aliases:
  - 周数
  - 第几周
  - 第几天
  - ISO 8601
  - week number
  - 年内序数
sources:
  - id: iso
    title: ISO 8601-1:2019
    publisher: International Organization for Standardization
    url: https://www.iso.org/standard/70907.html
    language: en
    kind: official-doc
    locator: 日期和时间的基本表示
  - id: python
    title: datetime 日期模型
    publisher: Python Software Foundation
    url: https://docs.python.org/3/library/datetime.html
    language: en
    kind: official-doc
    locator: date、timedelta 与 isocalendar
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
---

## 介绍
<!-- sources: iso, python -->
公历日期可以用年、月、日，也可以用 ISO 周所属年、周数和星期描述。年内日序另从公历一月一日开始计数。周日期跨越公历年界时，这三种表示的年或序号不一定同时翻转。

## 第一周与周所属年
<!-- sources: iso, python -->
一周始于星期一，止于星期日。含该公历年第一个星期四的周为第 1 周，它也一定含 1 月 4 日。对任意日期，可先定位它所在周的星期四，用星期四的年份识别周所属年。

:::example 一月初仍属上一周历年
[输入]
2021-01-01
[结果]
2020-W53-5
[说明]
元旦是星期五，该周的星期四为 2020-12-31。
:::

## 周数与星期的换算
<!-- sources: python, dates -->
取 1 月 4 日所在周的星期一为锚点。目标日期离锚点的整周数加一得到周数，星期一至星期日依次编码 1 至 7。反算时，向锚点加上 7×(周数−1)＋(星期−1) 天。

:::example 年末进入下一个周历年
[输入]
2019-12-30
[结果]
2020-W01-1
[说明]
这个星期一所在周含 2020-01-02 和 2020-01-04，是 2020 年第一周。
:::

## 第五十三周的判定
<!-- sources: python, dates -->
全年有 52 或 53 个完整 ISO 周。可用指定周反算日期再做一次正算，检查周所属年和周数是否仍等于输入。公历 1 月 1 日为星期四，或公历闰年的 1 月 1 日为星期三时，该周历年有第 53 周。

:::example 不存在的第五十三周
[输入]
2021-W53-1
[结果]
年份 2021 的第 53 周不存在
[说明]
从 2021-01-04 加 52 周得到 2022-01-03，该日已经属于 2022-W01。
:::

## 公历年内日序
<!-- sources: usno, dates -->
日期离同一公历年的 1 月 1 日相隔多少天，将差值加一就是年内日序。平年全年有 365 天，闰年有 366 天，日序由公历年决定。

:::example 闰年末日
[输入]
2024-12-31
[结果]
年内日序为 366；周日期为 2025-W01-2
[说明]
该日是公历闰年的最后一天，又是下一 ISO 周历年第一周的星期二。
:::

## 常见误区

- 公历年和 ISO 周所属年可以不同。
- 将包含元旦的周一律标作第 1 周会错判部分年份。
- 年内日序从 1 开始，星期一也用 1 标识，两者计数对象不同。
- 并非每个周历年都有第 53 周。
