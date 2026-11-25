---
capabilityId: native:units-chemistry
title: 化学单位
topicGroup: unit-conversion
summary: 按粒子种类、质量、体积或时间区分物质的量、浓度、摩尔质量和催化活性。
aliases:
  - 单位换算
  - 摩尔
  - 物质的量
  - 浓度
  - 摩尔质量
  - 催化活性
sources:
  - id: si
    title: SI Brochure
    publisher: BIPM
    url: https://www.bipm.org/en/publications/si-brochure
    language: en
    kind: standard
    locator: SI 基本单位、相干导出单位、前缀和并用单位
  - id: qalc
    title: Unit List
    publisher: Qalculate!
    url: https://qalculate.github.io/manual/qalculate-definitions-units.html
    language: en
    kind: official-doc
    locator: 原计算内核单位目录及类别
  - id: kat
    title: Resolution 12 of the 21st CGPM (1999)
    publisher: BIPM
    url: https://www.bipm.org/en/committees/cg/cgpm/21-1999/resolution-12
    language: en
    kind: standard
    locator: 催化活性的 SI 导出单位 katal
---

## 介绍
<!-- sources: si, qalc -->
化学计量常按物质的量表达。1 mol 指定实体含 6.02214076×10²³ 个该实体。实体可以是原子、分子、离子或其他指定粒子，表达数量时应写清对象。

## 前缀只改摩尔刻度
<!-- sources: si, qalc -->
毫摩尔是千分之一摩尔，微摩尔是百万分之一摩尔。换算时不改变实体种类。若从物质的量求实体个数，则乘以阿伏伽德罗常数。

:::example 毫摩尔到摩尔
[输入]
2 mmol to mol
[结果]
0.002 mol
[说明]
前缀 milli 表示 10⁻³。
:::

## 物质的量浓度
<!-- sources: si, qalc -->
物质的量浓度为溶质的摩尔数除以溶液体积。SI 相干导出单位为 mol/m³，实验中常用 mol/L。一立方米等于一千升，换成每立方米时数值增加一千倍。

:::example 每升一摩尔
[输入]
1 mol/L to mol/m^3
[结果]
1000 mol/m³
[说明]
同样的浓度下，1000 L 中含有 1000 mol。
:::

## 摩尔质量、摩尔能与质量分数
<!-- sources: si, qalc -->
摩尔质量为质量除以物质的量，常用 g/mol。摩尔能为能量除以物质的量，摩尔熵为熵除以物质的量。质量分数则是组分质量与总质量的比，常写为百分数。已知质量时，需给定样品的摩尔质量才能求其摩尔数。

:::example 摩尔质量的质量前缀
[输入]
18 g/mol to kg/mol
[结果]
0.018 kg/mol
[说明]
分母 mol 不改变，只有分子 g 换成 kg。
:::

## 催化活性
<!-- sources: kat, si, qalc -->
一 katal（kat）等于每秒一摩尔的反应转化速率。催化活性的定义关联特定测定过程，数值还受底物与反应条件影响。按体积表达时，量为催化活性浓度，另有体积因子。

## 常见误区

- 物质的量要说明所数的粒子种类。
- mol/L 中的体积是溶液总体积。
- 克和摩尔之间需要提供具体物质的摩尔质量。
- 含有 mol 的多个量仍然要检查分子、分母和其余单位。
