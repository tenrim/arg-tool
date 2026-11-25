---
capabilityId: native:calendar
title: 传统历法
topicGroup: world
summary: 按同一民用日期对照农历、公历、干支和节气，并辨别同名闰月。
aliases:
  - 农历
  - 公历
  - 阴阳历
  - 节气
  - 干支
  - 闰月
sources:
  - id: standard
    title: GB/T 33661-2017 农历的编算和颁行
    publisher: 国家标准公开系统
    url: https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=E107EA4DE9725EDF819F33C60A44B296
    language: zh-CN
    kind: standard
    locator: 中国农历编算标准
  - id: hko
    title: 公历与农历对照表
    publisher: 香港天文台
    url: https://www.hko.gov.hk/sc/gts/time/conversion.htm
    language: zh-CN
    kind: official-doc
    locator: 2023、2024 年对照与午夜边界说明
  - id: year
    title: 今夕是何年
    publisher: 香港天文台
    url: https://www.hko.gov.hk/sc/education/astronomy-and-time/time-service/00506-what-year-is-it-today.html
    language: zh-CN
    kind: official-doc
    locator: 春节换年、立春和年干支
  - id: jie
    title: 二十四节气
    publisher: 香港天文台
    url: https://www.hko.gov.hk/sc/gts/time/24solarterms.htm
    language: zh-CN
    kind: official-doc
    locator: 太阳黄经等分及中气
  - id: source
    title: 历法换算及展示
    publisher: 迷雾工具箱
    url: /science/core.js
    language: zh-CN
    kind: implementation
    locator: calendar：日期、闰月、干支与文化历法
---

## 介绍
<!-- sources: standard, hko -->
农历属于阴阳历。月份依照朔望月设置，同时通过节气和闰月维持历月与太阳年之间的对应关系。公历和农历可用不同的年月日描述同一个民用日期。

## 月首、月长与闰月
<!-- sources: standard, hko, jie, source -->
包含朔的民用日为初一，相邻两个初一相隔 29 或 30 天。按农历置闰规则，多出来的月可成为前一月的闰月，沿用其月名。反查农历日期必须保留是否为闰月的信息。

:::example 闰二月的首日
[输入]
农历 2023 年闰二月初一
[结果]
公历 2023-03-22
[说明]
这里指农历的第二个同名月份，使用对应的闰月而非常规二月。
:::

## 年干支、生肖与春节
<!-- sources: standard, year, hko -->
干支由十天干与十二地支按顺序相配，六十年循环。农历年干支按正月初一切换，生肖与年地支关联。立春可以先到，农历年仍保持上一个干支，直至春节。

:::example 甲辰年正月初一
[输入]
公历 2024-02-10
[结果]
农历 2024 年正月初一，甲辰年，生肖龙
[说明]
该日是农历新年开始，对照表与春节换年口径一致。
:::

## 太阳黄经与节气
<!-- sources: jie, year, hko, source -->
二十四节气按太阳视黄经的 15° 步长排列，节和中气交替。节气描述太阳周年运动中的时刻，和农历月份初一独立产生。按节气表示月干支时，也要区分与按朔望月标记的月份。

:::example 立春不与春节同日
[输入]
公历 2024-02-04
[结果]
当日节气为立春，农历仍是癸卯年腊月廿五
[说明]
朔日与太阳到达立春节气的时点分别确定，两者在这一年相差数天。
:::

## 历法换算的使用范围
<!-- sources: standard, hko, source -->
公历日期按公历月长验证，农历日期按所选历月的实际长度验证。朔或节气发生在午夜附近时，时间基准或推算差值可能影响所属日期。对照中的佛历和道历为同一天的文化日期表示，有各自的纪年习惯。

## 常见误区

- 农历闰月是增加一个月，公历闰年是增加一天。
- 一般月名不能自动辨明常月还是闰月。
- 立春与正月初一分别按太阳运动和农历月首确定。
- 节气结果的钟点应与采用的时间标准一起记录。
