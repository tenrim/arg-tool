---
capabilityId: op:CTPH
title: 上下文触发分段哈希
topicGroup: file-compression
summary: 用滚动上下文决定分段边界，再用短字符表示各段摘要。
aliases:
  - CTPH
  - 内容触发分段
  - 模糊哈希
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
    locator: CTPH digest：七字节滚动窗口，两种分段尺度，尺度的字符形式
---

## 介绍
<!-- sources: paper, engine -->
上下文触发分段哈希（CTPH）把输入分成与局部字节内容相关的片段，再用片段摘要构成签名。改动一个局部时，远处的边界可能仍与原输入一致，因此能为查找近似材料提供线索。

## 滚动窗口与触发点
<!-- sources: paper, engine -->
程序滑动一个很短的窗口，并在移动一步后更新滚动值。固定实现的窗口为 7 字节。滚动值对某个块尺度的余数达到约定条件时，结束当前段，把这一段摘要的一部分写入签名。

## 两种尺度的输出
<!-- sources: paper, engine -->
签名有三个以冒号分隔的部分。当前 CTPH 的第一段用一个字符表示尺度级别；后两项是以相邻块尺度构造的摘要串。签名看起来像 Base64 字符串，但字符表示的是分段特征，不能解码出文件。

## 短样本例子
<!-- sources: engine, paper -->
以下输入按 ASCII 字节计算，输出保留三个字段和冒号。

:::example 空输入
[输入]
零字节
[结果]
A::
[说明]
仍有尺度字段；两个签名串均为空。
:::

:::example 两字母样本
[输入]
ab
[结果]
A:C:C
[说明]
两个相邻尺度的签名在此次都仅有一个字符。
:::

:::example 加一个字母
[输入]
abc
[结果]
A:CH:CH
[说明]
尺度字符仍为 A，两个签名串都增长。签名中的 C 对应一个分段特征。
:::

## 证据解释
<!-- sources: paper, engine -->
CTPH 有助于寻找保留大量相似片段的材料，但也受样本长度、重复模式和实现差异影响。更严格的相等比较可用独立的密码学摘要或直接逐字节核对。

## 常见误区
- CTPH 签名不是原文件的压缩版本。
- 局部修改可能只改变部分特征，也可能改变分段尺度。
- 不同实现使用了相似思想，签名格式和分数仍可不同。
