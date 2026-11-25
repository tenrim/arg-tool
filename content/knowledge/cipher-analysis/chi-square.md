---
capabilityId: op:Chi%20Square
title: 卡方检验
topicGroup: cipher-analysis
summary: 说明相对于均匀字节分布的 Pearson 统计量、零频类别和显著性限制。
aliases:
  - Chi Square
  - Pearson 卡方
  - 字节均匀性
sources:
  - id: nist
    title: NIST/SEMATECH e-Handbook — Chi-Square Goodness-of-Fit Test
    publisher: 美国国家标准与技术研究院
    url: https://www.itl.nist.gov/div898/handbook/eda/section3/eda35f.htm
    language: en
    kind: official-doc
    locator: 公式、期望频数和样本量要求
  - id: correction
    title: 完整字节卡方统计适配
    publisher: 迷雾工具箱
    url: /cyberchef-operation-corrections.js
    language: zh-CN
    kind: implementation
    locator: patchChiSquare，256 类计数与平方和公式
  - id: engine
    title: CyberChef 固定源码 — ChiSquare
    publisher: GCHQ
    url: /vendor/knowledge/cyberchef/src/core/operations/ChiSquare.mjs
    language: en
    kind: implementation
    locator: 用于对照的旧版 run：只加入出现项
---

## 介绍
<!-- sources: nist, correction -->

Pearson 卡方统计量衡量观测频数与某个假设分布的距离。以均匀字节为假设时，每个字节值都应占相同的概率。偏离越大的类别通常为总量贡献越多。

## 观测值和期望值
<!-- sources: nist, correction -->

用 Oᵢ 表示第 i 类观测次数，用 Eᵢ 表示该类在假设下的预期次数。统计量是所有 (Oᵢ−Eᵢ)²/Eᵢ 的和。字节模型共有 256 类，总长 n 时每个 Eᵢ 都等于 n/256。

:::example 所有字节值恰好各出现一次
[输入]
00 到 FF，每个字节值出现一次
[结果]
χ² = 0
[说明]
总长为 256，各组观测次数和期望次数均为 1。
:::

## 零频项同样参与
<!-- sources: nist, correction, engine -->

观测次数为 0 的类别若有非零期望值，也偏离了假设，应累计其贡献。对均匀模型还可算作 ΣOᵢ² ÷ (n/256) − n，这个化简已经包含所有零频项的贡献。

:::example 两种不同字节
[输入]
41 42
[结果]
χ² = 254
[说明]
平方和为 1²+1²=2，除以 2/256 后减去总长 2。两个字节只是演示，样本不足以支撑显著性推断。
:::

## 集中出现的字节
<!-- sources: nist, correction -->

当各值的观察次数越不均匀，平方和越大。在相同字节数、相同组数和相同假设下，可以比较统计量。比较不同长度样本时则需要考虑样本量和检验前提。

:::example 四个字节都是同一种值
[输入]
41 41 41 41
[结果]
χ² = 1020
[说明]
平方和只有 4²。计算为 16 ÷ (4/256) − 4。
:::

## 统计量与检验结论
<!-- sources: nist, correction -->

要进行正式的拟合优度检验，需先指定假设、确定自由度，再在期望频数足够的条件下查临界值或计算概率。固定 256 类时短样本的期望频数会很小；虽然能算出描述统计量，不能直接把它当成显著性结论。

## 常见误区

- 未出现的字节值仍有其期望频数。忽略它们会低估偏差。
- 空数据的期望频数为零，公式无定义。界面用 0 作为占位不表示样本完美符合假设。
- 卡方值小只表示更接近当前假设，不能据此断定数据的来源或保密强度。
