---
capabilityId: op:Compare%20CTPH%20hashes
title: 比较 CTPH 哈希
topicGroup: file-compression
summary: 按签名的尺度字段选择可比串，再将归一化编辑距离表示为比分。
aliases:
  - Compare CTPH hashes
  - CTPH 编辑距离
  - 模糊签名比较
sources:
  - id: paper
    title: Identifying Almost Identical Files Using Context Triggered Piecewise Hashing
    publisher: Jesse Kornblum · DFRWS
    url: https://dfrws.org/presentation/identifying-almost-identical-files-using-context-triggered-piecewise-hashing/
    language: en
    kind: author-spec
    locator: 滚动哈希触发边界与同源文件比较
  - id: engine
    title: CyberChef 11.5.0 加密模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Compare CTPH hashes：两条输入、首字符尺度选择及 Levenshtein 分数
---

## 介绍
<!-- sources: paper, engine -->
CTPH 的比较入口读取两条已生成的签名。目标是根据摘要串的近似性提出相似材料候选。它并未同时读入两份原文件，也不能统计原文件实际相同的字节数量。

## 按尺度选串
<!-- sources: paper, engine -->
固定实现先把第一段的尺度字符映射到 Base64 字母表位置。尺度相等时比较两条签名的第一组摘要串。两级相邻时，取较小尺度的第二串和较大尺度的第一串。若等级差大于 1，返回 0。

## 编辑距离到分数
<!-- sources: engine -->
选出的两串长度为 m、n，最少插入、删除或替换次数为 d。两者不同时为空时，结果是 100×(1−d/max(m,n))。这个值描述经过压缩后的摘要特征，而不是原数据的百分比。

## 简化签名的可复算例子
<!-- sources: engine, paper -->
以下是为展示比对规则构造的短签名，两条用换行分隔。

:::example 同一级且相差一处
[输入]
A:abcd:xy
A:abxd:uv
[结果]
75
[说明]
比较 abcd 与 abxd，只替换一个字符，分母为 4。
:::

:::example 比较相邻级别
[输入]
A:aa:xy
B:xz:uv
[结果]
50
[说明]
选较小尺度的 xy 和较大尺度的 xz，编辑距离为 1，分母为 2。
:::

:::example 尺度距离过大
[输入]
A:abcd:xy
C:abcd:uv
[结果]
0
[说明]
尺度索引相差两级，现有实现直接返回 0。
:::

## 用分数进行候选核查
<!-- sources: paper, engine -->
分数与输入长度和数据变化的分布相关。分数较高可以用于安排人工核查顺序。低分有时来自签名太短或尺度差异，不能单独排除源文件含有相关材料。

## 常见误区
- 输入是两条 CTPH 签名，不能直接当文件比较。
- 分数表示摘要字符串的接近程度。
- 尺度不同时并非总是选同一列做比较。
