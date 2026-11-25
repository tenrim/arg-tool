---
capabilityId: native:battery-runtime
title: 电池续航
topicGroup: maths
summary: 把电池容量转换为能量，按可用比例、转换效率和负载估计续航。
aliases:
  - 电池瓦时
  - mAh 换算
  - 负载平均功率
sources:
  - id: battery
    title: Energy Unlimited, Revision 9
    publisher: Victron Energy / Reinout Vader
    url: https://www.victronenergy.com/upload/documents/Book-Energy-Unlimited-EN.pdf
    language: en
    kind: author-spec
    locator: 第 2、3、6 章，瓦时换算和放电影响
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
<!-- sources: battery, energy -->

电池续航可用可供负载使用的能量除以负载功率来估计。电池容量常用 Ah 或 mAh 描述电荷，也可直接用 Wh 描述能量。两种数据含义不同。

## 从电荷换算能量
<!-- sources: battery, model -->

用适合电池标注的标称电压 U，将容量 C 换成 Ah 后估计 E(Wh)=C(Ah)U(V)。mAh 除以 1000 得 Ah。若已给 Wh，则不再乘电压。

:::example 配套标称电压
[输入]
10000 mAh，容量标注对应的电芯标称电压为 3.7 V。
[结果]
额定能量约 37 Wh。
[说明]
10000 mAh 等于 10 Ah，10×3.7=37。
:::

## 剩余能量与转换效率
<!-- sources: battery, model -->

若从当前状态至截止条件的可用比例为 f，负载侧的转换效率为 η，则负载可用能量 E有效=E f η。两个比例均需把百分数除以 100。

:::example 充电宝的负载侧能量
[输入]
额定 37 Wh，剩余可用 100%，输出转换效率 80%，平均负载 5 W。
[结果]
有效能量 29.6 Wh，估计可用 5.92 小时。
[说明]
37×0.8=29.6，29.6÷5=5.92。
:::

## 恒定和平均功率
<!-- sources: energy, battery, model -->

当合适的平均功率 P 以 W 表示，估计时间为 t=E有效/P，单位小时。负载有短高峰时，能量估算仍可用平均值，但单独的峰值电流还可能触发电池保护。

:::example 从一半电量起算
[输入]
额定 60 Wh，可用比例 50%，效率 90%，负载 9 W。
[结果]
有效能量 27 Wh，约 3 小时。
[说明]
60×0.5×0.9=27，27÷9=3。
:::

## 能量估算的范围
<!-- sources: battery, model -->

实际电池的可用容量随环境、老化、放电倍率和保护截止而变。标称电压是换算估值用的电芯或电池组数值。负载侧 USB 输出电压和这个数值可以不同。

## 常见误区

- 仅凭 mAh 不足以确定 Wh。
- 用输出端电压乘电芯侧额定容量会混淆两侧数据。
- 相同额定能量在不同负载与温度下可能得到不同续航。
