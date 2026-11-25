---
capabilityId: native:geo-distance
title: 地理距离与方位角
topicGroup: coordinates-time
summary: 用两点的经纬度求球面最短弧长度与出发、抵达方向。
aliases:
  - 两点距离
  - 经纬度距离
  - 大圆距离
  - 初始方位角
  - 终到方位角
  - geographic distance
  - bearing
sources:
  - id: geo
    title: Calculate distance and bearing between two Latitude/Longitude points
    publisher: Chris Veness / Movable Type
    url: https://www.movable-type.co.uk/scripts/latlong.html
    language: en
    kind: author-spec
    locator: Distance、Bearing 与 Final bearing
  - id: coords
    title: 球面距离和方位计算
    publisher: 迷雾工具箱
    url: /round2/coordinates-engine.js
    language: zh-CN
    kind: implementation
    locator: distanceBearing
---

## 介绍
<!-- sources: geo, coords -->
球面上的两点可由球心和两位置确定的大圆连接。通常取小于半圆的短弧作为最短距离。距离单位继承所用半径，取地球平均半径 6371.0088 km 时得到千米值。

## 由经纬差求圆心角
<!-- sources: geo, coords -->
纬度记作 φ，经度记作 λ，先把角度换为弧度。计算 h＝sin²(Δφ/2)＋cosφ₁ cosφ₂ sin²(Δλ/2)。圆心角为 2 atan2(√h, √(1−h))，乘半径得到弧长。

:::example 沿赤道向东一度
[输入]
起点 (0°, 0°)，终点 (0°, 1°)
[结果]
约 111.195080 km
[说明]
圆心角是 π/180 弧度，乘 6371.0088 km。
:::

## 初始方位与终到方位
<!-- sources: geo, coords -->
初始方位从真北顺时针度量，0° 指北，90° 指东。计算初值用 atan2(sinΔλ cosφ₂, cosφ₁ sinφ₂−sinφ₁ cosφ₂ cosΔλ)，再转为 0° 至不足 360°。交换起终点重算得到反向出发角，给反向角加 180° 并折回圆周即为终到角。

:::example 纬线与最短弧的方向
[输入]
起点 (45°, 0°)，终点 (45°, 90°)
[结果]
初始方位约 54.74°，终到方位约 125.26°
[说明]
纬度相同并不要求一路沿纬线。代入两端角得 arctan(√2) 及其关于 90° 的对称角。
:::

## 跨过经线边界的短弧
<!-- sources: geo, coords -->
经度可取 −180° 至 180°，其中 −180° 与 180° 表示同一条经线。经差用半角正弦的平方进入弧长，跨越这条经线时仍能得到较短的圆弧。

:::example 经过 180° 经线
[输入]
起点 (0°, 179°)，终点 (0°, −179°)
[结果]
约 222.390160 km，初始方位 90°
[说明]
从 179° 向东角度增加两度就到 −179°，距离为赤道一度距离的两倍。
:::

## 无唯一方向与模型边界
<!-- sources: geo, coords -->
相同位置没有唯一出发方向。对跖点有许多条等长半圆可走，距为 π 倍半径。极点处经度退化，当前计算省略含极点的两端方向。球面模型将地球看成半径固定的球体，测量精度高时需要约定参考椭球。

:::example 赤道上的对跖点
[输入]
起点 (0°, 0°)，终点 (0°, 180°)
[结果]
约 20015.114442 km，方向留空
[说明]
弧长为 π×6371.0088 km。任一通过两点的大圆均有可等长到达的半圆。
:::

## 常见误区

- 输入纬度和经度时应保留顺序与半球符号。
- 初始方位和终到方位可相差很大。同一纬度也可能走出先向北、后向南的短弧。
- 反向出发角与终到角相差 180°。
- 球面短弧不会反映道路绕行、跨海限制或海拔变化。
