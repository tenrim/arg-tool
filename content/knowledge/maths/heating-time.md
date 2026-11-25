---
capabilityId: native:heating-time
title: 加热时间
topicGroup: maths
summary: 由水的质量、温升、加热功率和效率估计热量、耗电和时间。
aliases:
  - 水加热
  - 比热容
  - Q=mcΔT
sources:
  - id: heat
    title: Temperature Change and Heat Capacity
    publisher: OpenStax
    url: https://openstax.org/books/college-physics-2e/pages/14-2-temperature-change-and-heat-capacity
    language: en
    kind: author-spec
    locator: 第 14.2 节与水比热表
  - id: power
    title: Power
    publisher: OpenStax
    url: https://openstax.org/books/college-physics-2e/pages/7-7-power
    language: en
    kind: author-spec
    locator: 能量变化率、瓦和时间
  - id: energy
    title: Measuring electricity
    publisher: U.S. EIA
    url: https://www.eia.gov/energyexplained/electricity/measuring-electricity.php
    language: en
    kind: official-doc
    locator: 瓦、千瓦时和 40 W 照明算例
  - id: model
    title: 日常物理计算公式实现
    publisher: 迷雾工具箱
    url: /practical/everyday-model.js
    language: zh-CN
    kind: implementation
    locator: calculateEveryday 的单位与边界
---

## 介绍
<!-- sources: heat, power -->

给水加热需要把能量传给水和周边材料。若只估计液态水的温升，可以用恒比热近似计算水实际吸收的热量，再用设备的输入功率与效率估计所需时间。

## 水吸收的热量
<!-- sources: heat, model -->

质量 m 以 kg 计，初温 T₁ 与目标 T₂ 的差为 ΔT，液态水比热 c 近似 4186 J/(kg·K)。水吸热 Q=mcΔT。摄氏度温差与开尔文温差数值相同。

:::example 一公斤水升温六十度
[输入]
1 kg，从 20 °C 升到 80 °C。
[结果]
水吸热 251160 J。
[说明]
1×4186×60=251160。
:::

## 输入功率与效率
<!-- sources: heat, power, model -->

若有效效率为 η，装置需输入的能量 E=Q/η。功率 P 是每秒输入的焦耳数，因此 t=Q/(ηP)。P 以瓦计，η 使用百分数除以 100 后的比例，t 以秒计。

:::example 效率从 100% 降到 50%
[输入]
同一公斤水和相同温升，输入功率 1000 W，分别按两种效率。
[结果]
251.16 秒与 502.32 秒。
[说明]
水吸热未变。有效效率减半后，为水提供相同热量所需时间加倍。
:::

## 从焦耳换算用电量
<!-- sources: power, energy, model -->

1 kWh=3600000 J。将输入能量 E 除以该值，可求新一轮估计的用电量。若功率为按时段平均出的 W，这一方法仍要求效率和平均功率能代表所计算的过程。

:::example 半公斤的小温升
[输入]
0.5 kg 水从 40 °C 加热到 50 °C，输入 500 W，效率 80%。
[结果]
水吸收 20930 J，理想时间 52.325 秒，约 0.007267 kWh。
[说明]
有效 400 W，输入 26162.5 J。
:::

## 相变与散热
<!-- sources: heat, model -->

容器吸热和向周边散热会延长真实过程。达到沸点时，继续输入的热量可用于汽化，不能用升温同一式子跨过相变。相同标称设备功率若以脉冲方式运行，也应按时间核对输入。

## 常见误区

- 设备功率不能直接与水吸收的焦耳数等同。
- 50% 效率应该用比例 0.5 参与运算。
- 温升公式本身不计水变成蒸气所需热量。
