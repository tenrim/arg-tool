---
capabilityId: native:trip-cost
title: 行程能耗与费用
topicGroup: maths
summary: 按百公里消耗估计燃油或电量费用，并纳入额外费用与分摊。
aliases:
  - 百公里油耗
  - 百公里电耗
  - 行程费用
sources:
  - id: doe
    title: Vehicle Cost Calculator Assumptions and Methodology
    publisher: U.S. Department of Energy
    url: https://afdc.energy.gov/calc/cost_calculator_methodology.html
    language: en
    kind: official-doc
    locator: Vehicle Fuel Use Calculations 与 Fuel Emissions and Costs
  - id: model
    title: 行程和财务计算公式实现
    publisher: 迷雾工具箱
    url: /practical/travel-finance-model.js
    language: zh-CN
    kind: implementation
    locator: calculateTravelFinance 与 loanSchedule 的运算口径
---

## 介绍
<!-- sources: doe -->

行程费用可按一段路使用的能源计算，再加上其他费用。燃油车和电动车使用不同能源单位，但当两者都用每百公里的消耗表示时，可以用相同的比例关系换算。

## 百公里能耗和路程
<!-- sources: doe, model -->

路程 D 以 km 计，百公里能耗 C 以 L/100 km 或 kWh/100 km 计。本段消耗量 Q=D C/100。这里假设给出的平均能耗能代表该段路线。

:::example 两百公里耗油
[输入]
200 km，平均 7 L/100 km。
[结果]
消耗 14 L。
[说明]
路程是百公里单位的两倍，7×2=14。
:::

## 能源单价和额外开支
<!-- sources: doe, model -->

按燃油的元/L 或电能的元/kWh 选用匹配单价 r。能源费用 Qr，总费用等于能源费用加用户纳入的停车、通行等费用。价格是计算输入，未从路程自动得知。

:::example 燃油总费用
[输入]
已知耗油 14 L，油价 8 元/L，额外费用 30 元。
[结果]
能源费用 112 元，总费用 142 元。
[说明]
14×8=112，再加 30。
:::

## 分摊与每公里支出
<!-- sources: doe, model -->

每人平均分摊为总费用除以人数，每公里费用为总费用除以路程。两者使用相同的总费用口径，单独核算纯能源支出时可另记其中一项。

:::example 电动行程三人分摊
[输入]
150 km，16 kWh/100 km，1.2 元/kWh，额外费用 12 元，3 人。
[结果]
24 kWh，总费用 40.8 元，每人 13.6 元。
[说明]
24×1.2+12=40.8，40.8÷3=13.6。
:::

## 能源口径和差异
<!-- sources: doe, model -->

预估充电开支时，应确认能耗是电池消耗量还是充电计量表上的输入量。两者可能相差一些转换损耗。路线的载荷、车速与温度也会影响实际费用。

## 常见误区

- L/100 km 的数字应按经过的百公里数量乘算。
- 元/L 与元/kWh 必须配对应消耗量。
- 未输入的停车、折旧和服务费不会自动包含在总费用中。
