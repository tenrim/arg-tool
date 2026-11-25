---
capabilityId: op:Haversine%20distance
title: 球面距离
topicGroup: coordinates-time
summary: 以半正矢公式求经纬度两端的大圆短弧，说明弧度、地球半径和近似范围。
aliases:
  - Haversine distance
  - 大圆距离
  - 半正矢
sources:
  - id: math
    title: geosphere distHaversine
    publisher: Robert J. Hijmans / CRAN
    url: https://search.r-project.org/CRAN/refmans/geosphere/html/distHaversine.html
    language: en
    kind: author-spec
    locator: 半正矢球面距离与半径
  - id: usgs
    title: 经纬度单位距离
    publisher: USGS
    url: https://www.usgs.gov/faqs/how-much-distance-does-a-degree-minute-and-second-cover-your-maps
    language: en
    kind: official-doc
    locator: 经度方向随纬度变化
  - id: engine
    title: HaversineDistance 运行源码
    publisher: GCHQ
    url: /vendor/knowledge/cyberchef/src/core/operations/HaversineDistance.mjs
    language: en
    kind: implementation
    locator: run、纬经差、6371000 米球体半径
---

## 介绍
<!-- sources: math, usgs -->
球面距离以球体近似地球，求两地表点在大圆上的短弧长。大圆所在平面经过球心，弧长为球心夹角乘半径。高度变化、公路绕行和实际椭球的扁率不进入这一模型。

## 半正矢与角度
<!-- sources: math, engine -->
纬度记为 φ，经度记为 λ，先把度数乘 π/180 换成弧度。设 a=sin²(Δφ/2)＋cosφ₁ cosφ₂ sin²(Δλ/2)，夹角为 2atan2(√a,√(1−a))。本项距离以 6 371 000 米为球半径，用它乘夹角。

## 纬度、经度与日界线
<!-- sources: usgs, engine -->
有效纬度为 −90° 至 90°，经度常写为 −180° 至 180°。在赤道，相同的经度差对应较长距离；靠近极点，两条经线趋近。经度差跨 ±180° 时，半正弦平方的周期使结果对应较短的圆弧。

## 三组角距
<!-- sources: math, engine -->
以下四个数按纬度一、经度一、纬度二、经度二排列，距离按米给出。

:::example 赤道上一度
[输入]
0,0,0,1
[结果]
约 111194.927 米
[说明]
夹角为 π/180，乘 6371000。
:::

:::example 跨过 180° 经线
[输入]
0,179,0,-179
[结果]
约 222389.853 米
[说明]
两点位于赤道，较短的圆心角是 2°，不是 358°。
:::

:::example 从赤道到北极
[输入]
0,0,90,0
[结果]
约 10007543.398 米
[说明]
同一条经线上差 90°，距离为半径乘 π/2。
:::

## 精度与用途
<!-- sources: math, usgs -->
相同点的距离为零，对跖点的短弧长度为 πR，但经过它们的大圆有无穷多个。范围较大、用途要求精确时，需用测地线与明确的参考椭球；返回数的显示位数只代表这项计算的舍入程度。

## 常见误区
- 输入是角度，正弦和余弦使用弧度。
- 经度一度的地面距离随纬度变化。
- 大圆距离是球面模型的结果，与沿道路或航线的实际里程不同。
