---
capabilityId: native:water-mixing
title: 冷热水混合
topicGroup: maths
summary: 以等量热交换推导水混合温度和配水比例，明确质量与环境条件。
aliases:
  - 混合水温
  - 热平衡
  - 配水比例
sources:
  - id: heat
    title: Temperature Change and Heat Capacity
    publisher: OpenStax
    url: https://openstax.org/books/college-physics-2e/pages/14-2-temperature-change-and-heat-capacity
    language: en
    kind: author-spec
    locator: 第 14.2 节的热平衡、Q=mcΔT 和水的比热
  - id: model
    title: 日常物理计算公式实现
    publisher: 迷雾工具箱
    url: /practical/everyday-model.js
    language: zh-CN
    kind: implementation
    locator: calculateEveryday 和标准大气及饱和模型
---

## 介绍
<!-- sources: heat -->

两份温度不同的水在热隔离条件下交换热量，最终趋向同一温度。忽略容器吸热、蒸发和向外界散热时，热水失去的能量等于冷水得到的能量。

## 按同一比热建立等式
<!-- sources: heat, model -->

将冷水写成质量 mᶜ 与初温 Tᶜ，将热水写成 mʰ、Tʰ，末温为 Tᶠ。相同水的比热 c 约去后，有 mᶜ(Tᶠ−Tᶜ)=mʰ(Tʰ−Tᶠ)。因此 Tᶠ=(mᶜTᶜ+mʰTʰ)/(mᶜ+mʰ)。

:::example 冷热各一公斤
[输入]
20 °C 冷水 1 kg，80 °C 热水 1 kg。
[结果]
50 °C，总质量 2 kg。
[说明]
两项权重相同，(20+80)÷2=50。
:::

## 不等量混合
<!-- sources: heat, model -->

体量较大的一份水对最终温度的影响更强。只要两种水均存在且无其它热源，末温在两个初温之间。分开记录质量和温度可以用权重估计方向。

:::example 冷水质量加倍
[输入]
20 °C 冷水 2 kg，80 °C 热水 1 kg。
[结果]
平衡温度 40 °C。
[说明]
(2×20+1×80)÷3=40，结果靠近冷水初温。
:::

## 由目标温度求比例
<!-- sources: heat, model -->

规定总质量 M 后，热水量 mʰ=M(Tᶠ−Tᶜ)/(Tʰ−Tᶜ)，冷水量 mᶜ=M−mʰ。若目标温度等于一侧初温，应用等式后另一份用量为零。低于最低或高于最高初温的目标不能靠这两种水实现。

:::example 配三公斤温水
[输入]
冷水 20 °C、热水 80 °C，总量 3 kg，目标 35 °C。
[结果]
热水 0.75 kg，冷水 2.25 kg。
[说明]
热水份额为 (35−20)÷(80−20)=1/4。
:::

## 质量、体积和热损耗
<!-- sources: heat, model -->

这套平衡用质量而非体积。不同温度时水的密度会变化，因此精确实验不能把每升水视为完全相同的质量。容器也会吸热，测量结果可因容器、室温和搅拌状况偏离理想温度。

## 常见误区

- 不等量混合时不能直接取温度的简单平均。
- 热水占比不是目标温度除以热水温度。
- 混合温度等式需要水处于液态且散热可忽略。
