---
capabilityId: native:coordinates
title: 坐标与时间
topicGroup: coordinates-time
summary: 在经纬坐标、地图网格和时间刻度之间换用等价表示。
aliases:
  - WGS84
  - UTM
  - Geohash
  - MGRS
  - 儒略日
sources:
  - id: proj
    title: Universal Transverse Mercator
    publisher: PROJ
    url: https://proj.org/en/stable/operations/projections/utm.html
    language: en
    kind: official-doc
    locator: UTM 的横轴墨卡托投影、带号和半球
  - id: geohash
    title: latlon-geohash
    publisher: Chris Veness
    url: https://github.com/chrisveness/latlon-geohash
    language: en
    kind: author-spec
    locator: 编码、解码和包围盒
  - id: jd
    title: Converting Between Julian Dates and Gregorian Calendar Dates
    publisher: U.S. Naval Observatory
    url: https://aa.usno.navy.mil/faq/JD_formula
    language: en
    kind: official-doc
    locator: 儒略日正午起算与 MJD 零点差
  - id: time
    title: ECMAScript Time Values and Time Range
    publisher: Ecma / TC39
    url: https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-time-values-and-time-range
    language: en
    kind: standard
    locator: 毫秒和 epoch
  - id: local
    title: 坐标及时间转换
    publisher: 迷雾工具箱
    url: /round2/coordinates-engine.js
    language: zh-CN
    kind: implementation
    locator: coordinate、convertPoint、reversePoint、formatTime
---

## 介绍
<!-- sources: proj, jd, local -->
地理位置由参考系统和坐标数值共同定义。时间点也可以用偏移已知的钟表读数或纪元计数表示。转换的两端须明确用什么参考原点、单位和顺序。

## 度分秒转换
<!-- sources: proj, local -->
度分秒将一度分为 60 分、一分分为 60 秒。取角度大小 D＋M/60＋S/3600，最后依半球给整个数值赋号。北纬和东经为正，南纬和西经为负。

:::example 南纬度分秒
[输入]
12°30′30″S
[结果]
−12.508333…°
[说明]
12＋30/60＋30/3600≈12.508333，南纬使整体取负。
:::

## UTM 与 MGRS 网格
<!-- sources: proj, local -->
UTM 在各带内使用横轴墨卡托投影，按米返回东距和北距。反算必须提供带号与半球，常用 UTM 范围为南纬 80° 到北纬 84°。MGRS 用带号、纬带字母和网格字符给出区块，再用成对数字细分。

:::example 三度东经的赤道点
[输入]
纬度 0°，经度 3°
[结果]
UTM 31 带北半球，东距 500000 m，北距 0 m；MGRS 为 31NEA0000000000
[说明]
3°E 在 31 带中央经线。约定东距平移至 500000 m，赤道北距取 0 m。
:::

## Geohash 表示网格区域
<!-- sources: geohash, local -->
Geohash 反复二分经纬度范围，按位交错记录落入的半区，再按五位组编码。前缀对应较粗的矩形，更多字符继续缩小区域。解码到中心点时，原位置仍可能在格内其他地方。

:::example 五位网格的中心点
[输入]
Geohash wx4g0
[结果]
中心约为北纬 39.924316°、东经 116.389160°
[说明]
用五字符限定的经纬度区间取两个方向的中点。
:::

## ISO 日期时间、UNIX 与儒略日
<!-- sources: jd, time, local -->
这里的参考时刻为 1970-01-01 00:00:00 UTC。UNIX 秒或毫秒计这个参考点以来的时间。毫秒值除以 86400000 后加 2440587.5 得 JD，加 40587 得 MJD。MJD＝JD−2400000.5，日界在午夜；JD 的整数转换发生在正午。

:::example 同一纪元有多种写法
[输入]
1970-01-01T08:00:00+08:00
[结果]
1970-01-01T00:00:00Z，UNIX 秒值 0，JD 2440587.5，MJD 40587
[说明]
钟面时间减去八小时即回到 UTC 纪元。昼夜的显示改变，纪元数没有变。
:::

## 常见误区

- 南纬、西经的符号作用于度分秒的整个和。
- UTM 东距、北距相同但带号不同，可以对应不同地点。
- 网格中心点只是对该格的一种代表，精度不等于输入有更多位置信息。
- UNIX 秒与毫秒相差千倍，JD 与 MJD 则相差固定的零点。
