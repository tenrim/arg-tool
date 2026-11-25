---
capabilityId: native:eclipses
title: 日月食目录
topicGroup: sky
summary: 按 NASA 五千年目录阅读日食与月食类型、食甚、食分和沙罗序列。
aliases:
  - Solar eclipses
  - Lunar eclipses
  - Saros
  - 沙罗周期
  - 食甚
  - NASA
sources:
  - id: solar
    title: Key to Catalog of Solar Eclipses
    publisher: NASA GSFC / Fred Espenak 与 Jean Meeus
    url: https://eclipse.gsfc.nasa.gov/SEcat5/SEcatkey.html
    language: en
    kind: official-doc
    locator: TD、日食类型、食分与中心线时间
  - id: lunar
    title: Key to Catalog of Lunar Eclipses
    publisher: NASA GSFC / Fred Espenak 与 Jean Meeus
    url: https://eclipse.gsfc.nasa.gov/LEcat5/LEcatkey.html
    language: en
    kind: official-doc
    locator: 阴影食分、阶段和持续时间
  - id: saros
    title: Eclipses and the Saros
    publisher: NASA GSFC / Fred Espenak 与 Jean Meeus
    url: https://eclipse.gsfc.nasa.gov/SEsaros/SEsaros.html
    language: en
    kind: official-doc
    locator: 223 朔望月和约 8 小时偏移
  - id: epoch
    title: Calendar Dates
    publisher: NASA GSFC / Fred Espenak 与 Jean Meeus
    url: https://eclipse.gsfc.nasa.gov/SEhelp/calendar.html
    language: en
    kind: official-doc
    locator: 天文纪年与 1582 历法转换
  - id: delta
    title: Delta T (ΔT)
    publisher: NASA GSFC / Fred Espenak 与 Jean Meeus
    url: https://eclipse.gsfc.nasa.gov/SEcat5/deltat.html
    language: en
    kind: official-doc
    locator: ΔT＝TD−UT 及推算误差
  - id: row-s
    title: "Catalog of Solar Eclipses: 2001 to 2100"
    publisher: NASA GSFC / Fred Espenak 与 Jean Meeus
    url: https://eclipse.gsfc.nasa.gov/SEcat5/SE2001-2100.html
    language: en
    kind: official-doc
    locator: 目录 09561
  - id: row-l
    title: "Catalog of Lunar Eclipses: 2001 to 2100"
    publisher: NASA GSFC / Fred Espenak 与 Jean Meeus
    url: https://eclipse.gsfc.nasa.gov/LEcat5/LE2001-2100.html
    language: en
    kind: official-doc
    locator: 目录 09701 与 09702
---

## 介绍
<!-- sources: solar, lunar -->
日食发生在月球遮住太阳的方向，月食发生在月球经过地球的阴影时。NASA 五千年目录的日、月食版本分别记载 11,898 和 12,064 次事件，覆盖天文年份 −1999 至 3000。

## 阴影几何与类型
<!-- sources: solar, lunar, row-l -->
日食以 P、A、T、H 标识偏食、环食、全食和全环食。月食以 N、P、T 标识半影、偏食和全食。目录中类型码附加符号及 QLE 或 QSE 提供更多几何分类。日食分按遮住太阳直径的比例描述，月食分按月球直径浸入半影或本影的比例描述。

:::example 半影月食记录
[输入]
2023-05-05，月食
[结果]
编号 09702，类型 N，半影食分 0.9636，持续 257.5 分钟
[说明]
月球没有进入本影，本影阶段以及全食栏均没有持续时间。
:::

## 食甚时标与历法
<!-- sources: solar, epoch, delta, row-s -->
目录记录力学时 TD，ΔT 为 TD−UT，换为目录所用 UT 需从 TD 减掉 ΔT。早期历史事件及遥远未来的估计带有不确定性。公元 1 年前的天文纪年有 0 年；目录采用 1582-10-04 与 1582-10-15 相接的历法切换。

:::example 2024 年日全食的食甚
[输入]
2024-04-08，日食
[结果]
编号 09561，T，沙罗 139，TD 18:18:29，按所列 ΔT 得约 18:17:15 UT
[说明]
18:18:29 减 74 秒得 18:17:15。这个值仍不是各地点的当地钟点。
:::

## 持续时间、地理位置与可见性
<!-- sources: solar, lunar, row-s, row-l -->
日食目录的中心线持续时间针对食甚附近中心线的全食或环食阶段。月食分别给出半影、偏食和全食的时间范围。月食食甚点下方的地理坐标表示该刻月亮位于天顶的位置。实际能否观察应查当地地平和日月位置。

:::example 同一场月全食的三种时长
[输入]
2022-11-08，月全食
[结果]
编号 09701，T+，沙罗 136，半影 353.9 分钟，偏食 219.8 分钟，全食 85.0 分钟
[说明]
持续时间由不同阶段边界定出，全食只覆盖较短的一段。
:::

## 沙罗周期的复现与移动
<!-- sources: saros -->
223 个朔望月约为 6585.3223 天，长度也接近 239 个近点月和 242 个交点月。月相、月距与交点条件大致重复，于是产生同一沙罗序列的食象。比整日多出的近八小时会使地球自转额外约 120°，可见区域因此改变。

## 常见误区

- 食甚的 TD 需要按目录 ΔT 换算，不能直接作为 UT 或当地钟点使用。
- 半影、偏食和全食阶段的时长不能互换。
- 沙罗编号相同并不意味着恰好在相同地点可见。
- 历史日期应按目录的天文纪年和历法使用，不能直接套公历延拓。
