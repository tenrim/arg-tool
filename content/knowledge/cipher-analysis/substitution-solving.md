---
capabilityId: native:substitution
title: 单表替换求解
topicGroup: cipher-analysis
summary: 依据重复图样、部分映射、一一对应与频率复核单表替换候选。
aliases:
  - monoalphabetic substitution
  - 词型
sources:
  - id: stats
    title: 重复图样、重合指数和移位评分
    publisher: 迷雾工具箱
    url: /round1/analysis-engine.js
    language: zh-CN
    kind: implementation
    locator: wordPattern、partialDecode、validateMap、ic、analyze
  - id: class
    title: Ciphers：Monoalphabetic Substitution
    publisher: Ray Toal／Loyola Marymount University
    url: https://cs.lmu.edu/~ray/notes/ciphers/
    language: en
    kind: author-spec
    locator: Substitution Ciphers 的定义及字频分析
  - id: refic
    title: The Index of Coincidence
    publisher: NSA 档案
    url: https://www.cryptomuseum.com/people/friedman/files/NSA_TIOC_1955.pdf
    language: en
    kind: author-spec
    locator: 字频、重合概率和单表替换的关系
---

## 介绍
<!-- sources: class, stats -->

单表替换用一张固定表把字母与字母配对。对一一对应的表，任一密文字母始终还原为同一个明文字母，两个不同密文字母也不会共用明文去向。

## 重复形状保持不变
<!-- sources: class, stats -->

从左到右对第一次出现的字母编号，之后再次出现时复用原编号。可以用图样筛掉词形不匹配的猜测，即使密文和明文的具体字母不同。

:::example 计算词形图样
[输入]
KLLK 与 NOON
[结果]
两者均为 0.1.1.0
[说明]
首尾同一字母，中间两项同一字母，且与首尾不同。
:::

## 部分映射和占位
<!-- sources: stats, class -->

尚不明确的替换可以留空。输出中已确定字母随原大小写显示，未知字母用占位符表示。标点依然保留，便于观察断词和标点线索。

:::example 对照不完整映射
[输入]
XyZZw!；仅填写 X→H、Z→L
[结果]
H·LL·!
[说明]
两个未知位置显示占位，两个 Z 都解成 L。
:::

## 固定映射的复核
<!-- sources: stats, class -->

填完整的部分可用于实际材料。若两个密文字母都被填成同一个明文字母，就违反了置换条件，猜测应回退调整。

:::example 用四个配对解五个字母
[输入]
XYZZW；X→H、Y→E、Z→L、W→O
[结果]
HELLO
[说明]
Z 重复两次，不需要为第二处另建一个条目。
:::

## 频率线索的作用
<!-- sources: class, refic, stats -->

单表替换保留频数直方图的形状和重合指数，但对应字母发生变化。可用高频、重复字组与已知词形缩小范围，短材料受词本身影响很大。

## 常见误区

- 重复字母位置可筛选候选，不能只看词长。
- 最常出现的一个字符不必对应 E。
- 同明文字母被两个不同密文字母占用时不符合一一映射。

