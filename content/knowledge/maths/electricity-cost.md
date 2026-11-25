---
capabilityId: native:electricity-cost
title: 耗电与电费
topicGroup: maths
summary: 按平均功率和运行时长计算千瓦时，再按给定单价估算能源费用。
aliases:
  - 电量估算
  - 千瓦时
  - 耗电费用
sources:
  - id: energy
    title: Measuring electricity
    publisher: U.S. EIA
    url: https://www.eia.gov/energyexplained/electricity/measuring-electricity.php
    language: en
    kind: official-doc
    locator: 瓦、千瓦时和 40 W 照明算例
  - id: utility
    title: Calculate Appliance Operating Costs
    publisher: Hawaiian Electric
    url: https://www.hawaiianelectric.com/products-and-services/save-energy-and-money/calculate-energy-use/calculate-appliance-operating-costs
    language: en
    kind: official-doc
    locator: 按瓦数、运行时长和单价计算
  - id: model
    title: 日常物理计算公式实现
    publisher: 迷雾工具箱
    url: /practical/everyday-model.js
    language: zh-CN
    kind: implementation
    locator: calculateEveryday 的单位与边界
---

## 介绍
<!-- sources: energy, utility -->

电量是使用了多少电能，功率表示电能消耗速率。电量在账单上一般用千瓦时。若每千瓦时使用同一个单价，费用为电量与单价之积。

## 换算日用电量
<!-- sources: energy, model -->

将设备运行时的平均功率 P 从 W 换为 P/1000 kW。每天以该平均功率使用 h 小时，则日用电量 E=P h/1000 kWh。计算每日使用小时应与所用平均功率覆盖的时间一致。

:::example 低功率照明
[输入]
40 W，每天开 5 小时。
[结果]
每天 0.2 kWh。
[说明]
40 W 等于 0.04 kW，0.04×5=0.2。
:::

## 从日用电量到费用
<!-- sources: utility, model -->

假设每天的用电方式不变，连续 d 天用电 E总=E日 d。若单价为 r 元/kWh，估算能源费用为 E总r。有调价或分时电价时，应分别算不同时间块的电量与费用。

:::example 连续一个月照明
[输入]
按每天 0.2 kWh 使用 30 天，每千瓦时 0.6 元。
[结果]
总电量 6 kWh，能源费用 3.6 元。
[说明]
0.2×30=6，6×0.6=3.6。
:::

## 间歇运行的平均量
<!-- sources: energy, utility, model -->

不同功率时段的用电可以分段计算后相加。综合平均功率要按各段持续时间加权。铭牌最大值只描述某种条件下的功率，不能直接当作所有实际时段的平均。

:::example 每天半小时的大功率设备
[输入]
1500 W，每天开 0.5 小时，共 20 天，单价 0.8 元/kWh。
[结果]
每天 0.75 kWh，总计 15 kWh，费用 12 元。
[说明]
半小时用电以 1.5×0.5 计算。
:::

## 用电部分与整张账单
<!-- sources: energy, utility, model -->

固定单价模型估的是用电量对应的费用。实际收费还可包含固定项目、税费或者阶梯规则。对照账单应以同一抄表起止日期与相同计费口径比较。

## 常见误区

- kW 是功率，kWh 是能量。
- 30 分钟等于 0.5 小时。
- 按一个统一单价得到的是所设口径的电量费用。
