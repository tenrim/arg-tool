---
capabilityId: native:astronomy
title: 天体位置与升落
topicGroup: sky
summary: 按观测地点和时刻计算天体方位、升落、月相以及全球或当地食象。
aliases:
  - 天文
  - 升落
  - 方位角
  - 高度角
  - 月相
  - UTC
sources:
  - id: hko
    title: 太阳视赤经与视赤纬
    publisher: 香港天文台
    url: https://www.hko.gov.hk/sc/gts/astronomy/sun_ra_dec.htm
    language: zh-CN
    kind: official-doc
    locator: 赤道坐标和时间说明
  - id: engine
    title: Astronomy Engine
    publisher: Don Cross
    url: https://github.com/cosinekitty/astronomy/tree/v2.1.19
    language: en
    kind: author-spec
    locator: Horizon、SearchRiseSet、MoonPhase、SearchLocalSolarEclipse
  - id: source
    title: 固定 Astronomy Engine 实现
    publisher: Don Cross
    url: /vendor/science/astronomy.js
    language: en
    kind: implementation
    locator: Equator、Horizon 与各事件查找
  - id: na
    title: "Catalog of Solar Eclipses: 2001 to 2100"
    publisher: NASA GSFC
    url: https://eclipse.gsfc.nasa.gov/SEcat5/SE2001-2100.html
    language: en
    kind: official-doc
    locator: 09561 全球食甚及类别
  - id: here
    title: 天文查询的输出和边界
    publisher: 迷雾工具箱
    url: /science/core.js
    language: zh-CN
    kind: implementation
    locator: astronomy：UTC 换算、观测方向和事件模式
---

## 介绍
<!-- sources: hko, engine -->
赤经和赤纬指出天体在天球上的方向，高度角和方位角则是对某个地面观察者而言的位置。同一天体在不同时间、经纬度下，从观察者附近地平线量得的方向会改变。

## 从时刻、天球位置到当地地平
<!-- sources: hko, engine, here -->
将当地日期和时间减去 UTC 偏移得计算时刻。用天体当时的赤经、赤纬与观察地经纬度转到地平坐标。方位由北顺时针量取，正东 90°，高度为零时在参考地平线上。负高度表示方向落在地平线以下。

:::example 同一时刻的输入
[输入]
2024-04-08 18:00 UTC，或 2024-04-09 02:00 UTC+8；地点均为 0°、0°，天体太阳
[结果]
方位约 277.59°，高度约 0.83°
[说明]
两个输入代表同一个 UTC 时刻。同一地点和天体得到相同方向。
:::

## 升落搜索和近地平线条件
<!-- sources: engine, source, here -->
升起和落下通过查找未来的地平事件求得，搜索范围为输入时刻后 24 小时。标准大气折射和天体视盘会影响对应地平事件；山体、建筑与实际大气并未输入引擎。纬度很高时，一个天体可能始终在地平线上或下。

## 月相角与月面照亮比例
<!-- sources: engine, here -->
月相角按月亮相对太阳的视黄经变化表示。新月约为 0°，上弦约 90°，满月约 180°，下弦约 270°。照亮比例是可见月面受照面积的比例；同样的比例可出现在盈亏不同的阶段。

:::example 近新月的两个读数
[输入]
2024-04-08 18:00 UTC，地点 0°、0°
[结果]
月相角约 359.79°，照亮比例显示 0.00%，下一次新月约 18:21 UTC
[说明]
359.79° 接近下一圈的 0°。小的照亮比例四舍五入后显示为 0.00%。
:::

## 全球日食与当地食象
<!-- sources: na, source, here -->
全球食甚描述阴影路径总体几何条件下的特定时刻。当地搜索以观测点计算初亏、食甚、复圆，以及可能存在的全食或环食阶段。各阶段太阳高度可辅助判断地平条件。

:::example 达拉斯观测点的当地食甚
[输入]
由 2024-04-01 00:00 UTC 向后查日食，观测点 32.7767°N、96.797°W
[结果]
2024-04-08 日全食，当地食甚约 18:42:37 UTC，太阳高度约 64.63°
[说明]
观测点落在全食路径附近。计算该地点的食甚，与官方目录的全球食甚约 18:17 UT 回答的是两种问题。
:::

## 常见误区

- 赤经的小时单位不能直接当作天体高度或经度。
- 全球日食日期不能证明任意一个地点都能看到日全食。
- 月面照亮比例不能独自区分盈月与亏月。
- 升落没有在 24 小时搜索窗发生，不能据此判定以后也不发生。
