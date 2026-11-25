---
capabilityId: native:chemistry-formula
title: 摩尔质量与分子式
topicGroup: matter
summary: 展开元素下标、括号倍数和结晶水，再逐元素加总常用原子量。
aliases:
  - 分子式
  - Ca(OH)2
  - 原子计数
  - 结晶水
  - 摩尔质量
sources:
  - id: weights
    title: Standard Atomic Weights
    publisher: CIAAW
    url: https://www.ciaaw.org/atomic-weights.htm
    language: en
    kind: standard
    locator: 现行表中的 Z、元素符号、代表值与区间
  - id: mol
    title: "SI base unit: mole"
    publisher: BIPM
    url: https://www.bipm.org/en/si-base-units/mole
    language: en
    kind: standard
    locator: 指定粒子数与物质的量
  - id: core
    title: 元素与化学式计算
    publisher: 迷雾工具箱
    url: /science/core.js
    language: zh-CN
    kind: implementation
    locator: splitElements、formula、元素表积分
  - id: table
    title: 随页面使用的元素数值表
    publisher: 迷雾工具箱
    url: /vendor/science/elements.json
    language: zh-CN
    kind: implementation
    locator: H、O、Ca、Cu 和 S 的 atomic_mass
---

## 介绍
<!-- sources: mol, weights -->

摩尔质量是试样质量除以物质的量，常以 g/mol 表示。给定化学式后，可以用各元素的原子数乘相应原子量并求和，得到近似的式量和摩尔质量。

## 下标与元素大小写
<!-- sources: weights, core -->

元素符号后没有下标时计一个，与该元素相邻的数字只乘该符号。大小写区分元素符号，例如 Co 是钴，CO 是碳与氧各一个。

:::example 水的原子总数
[输入]
H2O
[结果]
H 两个、O 一个，合计约 18.0150 g/mol
[说明]
2 × 1.008 + 15.999 = 18.015。
:::

## 括号内每项共同放大
<!-- sources: core, table -->

括号后的下标适用于整个括号内的各元素。若还有嵌套括号，先算最内一层，再把计数交给外层。

:::example 氢氧化钙
[输入]
Ca(OH)2
[结果]
Ca 一个、O 两个、H 两个，合计约 74.0924 g/mol
[说明]
40.0784 + 2 × 15.999 + 2 × 1.008 = 74.0924。
:::

## 结晶水、前导系数与质量比例
<!-- sources: core, table -->

化学式中的居中点可分隔结晶水。点后的系数乘该部分所有元素，然后与宿主部分相加。某元素的质量贡献除以合计值，即得质量占比。

:::example 五水合硫酸铜
[输入]
CuSO4·5H2O
[结果]
Cu 一个、S 一个、O 九个、H 十个；合计约 249.6773 g/mol
[说明]
五个 H2O 贡献 5 个氧和 10 个氢；加上硫酸根的四个氧共九个。
:::

## 近似值的来历
<!-- sources: weights, mol, table -->

天然材料的同位素比例可能不同，评价机构的推荐值会留区间或不确定度。上述结果使用随附数值作为计算输入，结果做小数位保留。相对式量无单位，摩尔质量的单位则为 g/mol。

## 常见误区

- 括号后的下标不能只乘最后一个元素。
- 结晶水分隔点不表示小数点。
- 按所用原子量表计算的平均质量不同于具体同位素组合的精确质量。

