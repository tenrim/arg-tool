---
capabilityId: native:solution-dilution
title: 溶液稀释
topicGroup: maths
summary: 由溶质物质的量守恒求原液用量、最终体积或最终摩尔浓度。
aliases:
  - 摩尔浓度
  - C1V1=C2V2
  - 定容
sources:
  - id: molar
    title: Molarity
    publisher: OpenStax
    url: https://openstax.org/books/chemistry-2e/pages/3-3-molarity
    language: en
    kind: author-spec
    locator: 第 3.3 节溶质守恒、稀释近似与算例
  - id: model
    title: 日常物理计算公式实现
    publisher: 迷雾工具箱
    url: /practical/everyday-model.js
    language: zh-CN
    kind: implementation
    locator: calculateEveryday 的单位与边界
---

## 介绍
<!-- sources: molar -->

稀释是在不额外加入相同溶质的条件下增加溶剂，从而减小单位体积溶液里的溶质物质的量。摩尔浓度 C 的通常单位是 mol/L。

## 物质的量守恒
<!-- sources: molar, model -->

设原液浓度 C₁、取用体积 V₁，稀释后浓度 C₂、总溶液体积 V₂。设溶质没有反应或损失，C₁V₁=C₂V₂。若两个体积同用 mL，换升的因子在比例两侧抵消。

:::example 由两体积求最终浓度
[输入]
5.00 mol/L 原液取 850 mL，定容到 1800 mL。
[结果]
约 2.36111 mol/L。
[说明]
5.00×850÷1800，教材常按给定有效数字写为 2.36 mol/L。
:::

## 由目标浓度求原液
<!-- sources: molar, model -->

将守恒式除以原液浓度得到 V₁=C₂V₂/C₁。定容体积一般大于取用原液体积。目标浓度若高于原液，就需要浓缩或另一个过程，而非继续稀释。

:::example 配制四百毫升
[输入]
2 mol/L 原液，目标 0.5 mol/L，总溶液 400 mL。
[结果]
取 100 mL 原液，再补加溶剂至最终 400 mL。
[说明]
0.5×400÷2=100。
:::

## 稀释倍数
<!-- sources: molar, model -->

稀释倍数 F=C₁/C₂=V₂/V₁。已知取样体积与所需浓度时，也可用 V₂=F V₁ 先计算最终体积。倍数表示初末浓度比，不是稀释后的浓度值。

:::example 八倍定容
[输入]
取 25 mL 的 2 mol/L 原液，目标浓度 0.25 mol/L。
[结果]
稀释倍数 8，最终体积 200 mL。
[说明]
2÷0.25=8，25×8=200。
:::

## 定容与体积条件
<!-- sources: molar, model -->

溶液体积变化不总能用纯组分的单独体积直接相加。等式所求是最终溶液体积，实际用量根据定容测量。质量分数、摩尔分数等其他定义需要按自己的分母重新计算。

## 常见误区

- V₂ 是最终溶液体积，和新增溶剂体积不同。
- 体积左右不能使用未经换算的 L 与 mL。
- 若过程中溶质反应或损失，原来的守恒等式不能直接套用。
