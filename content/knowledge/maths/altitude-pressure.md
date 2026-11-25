---
capabilityId: native:altitude-pressure
title: 海拔气压
topicGroup: maths
summary: 用标准大气近似连接气压高度与绝对气压，了解模型与实测海拔的差异。
aliases:
  - 标准大气
  - 气压高度
  - 海拔与气压
sources:
  - id: nws
    title: Pressure Altitude
    publisher: U.S. National Weather Service
    url: https://www.weather.gov/media/epz/wxcalc/pressureAltitude.pdf
    language: en
    kind: official-doc
    locator: 气压高度方程及单位转换
  - id: model
    title: 日常物理计算公式实现
    publisher: 迷雾工具箱
    url: /practical/everyday-model.js
    language: zh-CN
    kind: implementation
    locator: calculateEveryday 和标准大气及饱和模型
---

## 介绍
<!-- sources: nws -->

同一高度的真实气压受天气影响。标准大气近似给出一张固定的压力和高度关系表，据此从高度估计气压，也能把气压映射为气压高度。由压力倒推的结果是基于该模型的高度读数。

## 向上高度与压力关系
<!-- sources: nws, model -->

取标准海平面气压 p₀=101.325 kPa。尺度常数 H=145366.45×0.3048=44307.69396 m。高度 h 使用米，压力 p 使用 kPa，气压高度关系为 h=H[1−(p/p₀)^0.190284]。

:::example 海平面基准
[输入]
绝对气压 101.325 kPa。
[结果]
气压高度 0 m。
[说明]
p/p₀=1，括号内为 0。
:::

## 从高度反推气压
<!-- sources: nws, model -->

将高度公式移项后得到 p=p₀(1−h/H)^(1/0.190284)。在模型采用的对流层范围内，高度升高时，括号内的值下降，气压随之降低。

:::example 两千米的模型读数
[输入]
高度 2000 m。
[结果]
约 79.487 kPa。
[说明]
先算 1−2000/44307.69396，再取约 5.255 次幂并乘以 101.325 kPa。
:::

## 压力单位和取值
<!-- sources: nws, model -->

NWS 公式原用毫巴和英尺，1 mbar 等于 1 hPa，10 hPa 等于 1 kPa。反查高度时使用测站所在位置的绝对气压。海平面折算气压已经补偿了高度影响。

:::example hPa 换算后反查
[输入]
测站气压约 700.974 hPa。
[结果]
约为 70.0974 kPa，模型气压高度约 3000 m。
[说明]
先除以 10 换成 kPa，再代入高度式。原始压力的舍入会带来高度误差。
:::

## 模型的适用边界
<!-- sources: nws, model -->

本近似用于对流层高度，并在计算中限于 −500 至 11000 m。使用高度反求压力时，气温分布、天气和湿度均未作为独立输入。核对某次实验的沸点时可优先使用现场实测绝对气压。

## 常见误区

- 气压高度随天气条件变化，可能和测绘海拔不同。
- 1 mbar＝1 hPa＝100 Pa＝0.1 kPa，换算时应保留所用的单位符号。
- 天气报告的海平面气压通常不是仪器在测站直接读到的压力。
