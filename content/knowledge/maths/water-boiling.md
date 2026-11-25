---
capabilityId: native:water-boiling
title: 水的沸点
topicGroup: maths
summary: 用 IAPWS 纯水饱和曲线从绝对气压反算沸点，并区分按海拔的近似估计。
aliases:
  - 沸点
  - 饱和蒸气压
  - IAPWS
sources:
  - id: iapws
    title: SR1-86(1992) Saturation Properties of Ordinary Water Substance
    publisher: IAPWS
    url: https://iapws.org/public/documents/6dGkr/Supp-sat.pdf
    language: en
    kind: standard
    locator: 第 3 页式 (1) 与临界常量
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
<!-- sources: iapws -->

在纯水的液汽平衡中，饱和蒸气压随温度升高。外界绝对压力固定时，对应的平衡饱和温度常用来估计沸点。真实煮沸过程还受溶质、过热和局部压力差影响。

## IAPWS 饱和关联式
<!-- sources: iapws, model -->

取 T 为开尔文温度，Tᶜ=647.096 K，pᶜ=22064 kPa，τ=1−T/Tᶜ。令六项系数依次为 −7.85951783、1.84408259、−11.7866497、22.6807411、−15.9618719、1.80122502。

饱和压力 p 满足 ln(p/pᶜ)=(Tᶜ/T)×(a₁τ+a₂τ^1.5+a₃τ³+a₄τ^3.5+a₅τ⁴+a₆τ^7.5)。压力以 kPa 表示，摄氏温度为 T−273.15。

:::example 在标准大气压求温度
[输入]
绝对气压 101.325 kPa。
[结果]
约 99.9743 °C。
[说明]
数值反解得到约 373.1243 K。日常说的 100 °C 是近似。
:::

## 从压力求温度
<!-- sources: iapws, model -->

给定压力后，可以利用饱和曲线的单调性用二分法搜索温度。试温对应的饱和压过低，就提高温度下界，反之降低上界。适用范围从三相点约 0.611657 kPa 到液汽临界压力 22064 kPa。

:::example 压力下降后的沸点
[输入]
现场绝对气压 80 kPa。
[结果]
约 93.4853 °C。
[说明]
在较低压力，较低温度就可达到相同外压的饱和蒸气压。
:::

## 用海拔估算外压
<!-- sources: nws, iapws, model -->

若只有海拔，可先用标准大气模型估计所在位置压力，再反算沸点。两个模型各有自己的限定，天气偏离标准大气时，压力估计也会传递到温度结果。

:::example 海拔 2000 米
[输入]
以标准大气换算 2000 m。
[结果]
估得 79.4870 kPa，沸点约 93.3123 °C。
[说明]
第一步根据海拔求气压，第二步应用纯水饱和关联式。
:::

## 绝对压力与水样条件
<!-- sources: iapws, model -->

仪表给的是表压时，需要知道环境压力才能换成绝对压力。在临界点之上不再存在普通液体和蒸气之间的沸腾边界。这一关联式描述纯水平衡性质，单独用它无法还原溶液的沸腾行为。

## 常见误区

- 水在不同压力下的沸点可以明显变化。
- 表压为零时，绝对压力仍约为当时周围气压。
- 按海拔得到的沸点是标准大气估计，不能代替当日测压。
