---
capabilityId: op:Magic
title: 自动识别与解码
topicGroup: cipher-analysis
summary: 以输入特征试做候选操作，再对所得结果递归识别和复算。
aliases:
  - 自动解码
  - 递归检测
sources:
  - id: magic
    title: Automatic detection of encoded data using CyberChef Magic
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/wiki/Automatic-detection-of-encoded-data-using-CyberChef-Magic
    language: en
    kind: author-spec
    locator: 识别模式、候选递归、语言统计与熵
  - id: chef
    title: 固定 CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: Magic 或配方的操作定义和能力
  - id: raw
    title: CyberChef 固定版 Magic 搜索源码
    publisher: GCHQ
    url: https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/lib/Magic.mjs
    language: en
    kind: implementation
    locator: 格式检查、候选配方及评分
---

## 介绍
<!-- sources: magic, chef -->

CyberChef 的 Magic 接受一段输入，通过已有操作的识别条件探索若干候选转换。在看不出原始编码时，它能提出可核对的试走路径。

## 特征识别与候选
<!-- sources: magic, raw -->

输入的字符范围、分隔、文件前缀和语言特征用于选择尝试的转换。对同一输入，多个表示规则都可能成立。因而报告通常有若干条不同的候选。

:::example 识别分组信号
[输入]
.... . .-.. .-.. ---
[结果]
出现 From Morse Code → HELLO 候选
[说明]
空格将五组信号分开，候选仍应核对符合题面。
:::

## 递归深度和中间结果
<!-- sources: magic, chef, raw -->

如果首层输出还满足一种格式的特征，可以将它作为新的输入继续。搜索深度控制连续操作次数，强度和语言支持影响探索范围。

:::example 两层 Base64
[输入]
UVVKRA==，深度至少 2
[结果]
From Base64 → QUJD → From Base64 → ABC
[说明]
单层输出仍可用原来的 Base64 字母表解释。
:::

## 原始输入和候选配方
<!-- sources: raw, chef -->

候选数据字段用于预览，配方保存实际操作和参数。验证某条候选时应从原数据按该配方重新运行，避免把候选明文再解一遍。

:::example 从原文核对一条配方
[输入]
SGVsbG8gd29ybGQ=
[结果]
From Base64 候选；以原文重算得 Hello world
[说明]
候选显示与执行结果相符。
:::

## 已知片段与评分
<!-- sources: magic, raw -->

已知文本或正则形式的 crib 可以增加判断依据。统计输出的语言评分不是“破解概率”。部分匹配到预期字词仍应检查全段内容和可重新执行的转换路径。

## 常见误区

- 报告中可能同时呈现原样与已转换候选。
- 真实解法可能超过设定深度或不适合内建算法。
- 语言评分与候选的来源真实性无直接等价关系。

