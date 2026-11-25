---
capabilityId: op:Frequency%20distribution
title: 字符频率分布
topicGroup: cipher-analysis
summary: 解释固定范围的字节计数、百分比、Unicode 多字节输入和统计的排列边界。
aliases:
  - Frequency distribution
  - 字节直方图
  - 频率分布
sources:
  - id: freq
    title: NIST/SEMATECH e-Handbook — Histogram
    publisher: 美国国家标准与技术研究院
    url: https://www.itl.nist.gov/div898/handbook/eda/section3/histogra.htm
    language: en
    kind: official-doc
    locator: 计数和归一化频率
  - id: utf
    title: RFC 3629 — UTF-8
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc3629.html
    language: en
    kind: standard
    locator: 第 3 节：序列组成
  - id: worker
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Frequency distribution
---

## 介绍
<!-- sources: freq, worker -->

频率分布依据选定的单位对样本分组，并记录各类出现次数。这里的单位是八位字节。每个字节只能落入 00 至 FF 的一个组，总共 256 组。

## 绝对频数与相对频率
<!-- sources: freq, worker -->

某值出现 k 次，输入共有 n 个字节，则相对频率是 k/n。百分比在这个比例上乘以 100。相同的次数在长度不同的样本里可以代表不同的比例。

:::example 大小写分别计数
[输入]
AABa
[结果]
41 有 2 次，占 50%；42 和 61 各 1 次，各占 25%。
[说明]
A、B、a 的编码是三个不同的字节值，不能合并大小写。
:::

## UTF-8 文本的统计单位
<!-- sources: utf, worker -->

以文本输入时，转换出的 UTF-8 字节进入频率表。一个 Unicode 码点可能拆成几个字节。统计这些字节的频率，可以分析底层表示，但无法直接当作码点的出现次数。

:::example 一个码点跨四个统计桶
[输入]
A😀A
[结果]
共 6 字节。41 出现两次，F0、9F、98、80 各一次。
[说明]
两个 A 各占一字节，笑脸在 UTF-8 中占四字节。样本有 5 个不同的字节值。
:::

## 零频数与显示范围
<!-- sources: freq, worker -->

未出现的字节值频数为零。直方图可以为了紧凑而略去这些空桶。此时应保留原来的分母和字节标签，否则读者不能仅凭柱子的相对位置知道哪个值缺失。

:::example 有效范围并不等于已见范围
[输入]
41 41 42 42
[结果]
41 与 42 均占 50%；其余 254 个字节值频数为零。
[说明]
即使图里只显示两个非零项，率仍用 4 个输入字节计算。
:::

## 分布能说明的内容
<!-- sources: freq, worker -->

频率表保留各值出现多少次，舍去了这些值在原样本里的位置。例如 AABB 和 ABAB 具有相同的字节分布。要找重复片段、序列边界或文件偏移，还需要访问原始字节。

## 常见误区

- UTF-8 中的一个可见字符不一定对应一个统计桶。
- 隐藏图中的零项不会让原本未出现的字节变成不存在的类别。
- 相同频率表只能证明计数相同，不能恢复字节的排列顺序。
