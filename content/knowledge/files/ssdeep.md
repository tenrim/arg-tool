---
capabilityId: op:SSDEEP
title: SSDEEP 模糊哈希
topicGroup: file-compression
summary: 将数据转为数值块尺度和两组内容触发签名，解释固定格式与短样本的限制。
aliases:
  - SSDEEP
  - ssdeep 签名
  - 块大小
sources:
  - id: paper
    title: Identifying Almost Identical Files Using Context Triggered Piecewise Hashing
    publisher: Jesse Kornblum · DFRWS
    url: https://dfrws.org/presentation/identifying-almost-identical-files-using-context-triggered-piecewise-hashing/
    language: en
    kind: author-spec
    locator: 滚动哈希触发边界与同源文件比较
  - id: ss
    title: ssdeep 项目源码
    publisher: ssdeep-project
    url: https://github.com/ssdeep-project/ssdeep/blob/master/fuzzy.c
    language: en
    kind: implementation
    locator: digest、fuzzy_compare、块尺度与比较约束
  - id: engine
    title: CyberChef 11.5.0 加密模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: SSDEEP digest：小块初值、滚动窗口、两串及数值块尺度
---

## 介绍
<!-- sources: paper, ss -->
ssdeep 用内容触发的方式分段，再把分段摘要转换为短字符序列。整条签名可用于比较两个文件是否可能保有大量相同或相近的区域。

## 数值块尺度
<!-- sources: ss, engine -->
输出由「块尺度:签名一:签名二」组成。第一项是十进制数字，生成从较小尺度开始，可依据总字节数和分段数调整。第二、三项分别取通常为此尺度及两倍尺度的局部摘要。

## 滚动定位与压缩特征
<!-- sources: paper, ss, engine -->
滚动窗口的值决定在哪些位置结束分段。多个输入片段都被压缩为少量字符，文件长短和内容特征都会影响表达能力。固定模块使用自身的片段字符生成实现，跨版本需用同一输入测试一致性。

## 同一小尺度上的样本
<!-- sources: ss, engine -->
以下是固定引擎的真实输出，空串和非空串中的冒号均属于签名格式。

:::example 零字节输入
[输入]
零字节
[结果]
3::
[说明]
最小数值块尺度是 3，两组摘要没有字符。
:::

:::example 一组短 ASCII 数据
[输入]
hello
[结果]
3:iKn:p
[说明]
块尺度为 3，两个摘要串长度分别是 3 和 1。
:::

:::example 延长同一开头
[输入]
hello world
[结果]
3:iKFSMPn:rJPn
[说明]
首串仍保留前两个字符 iK，其余分段受新增字节影响。
:::

## 选择比较资料
<!-- sources: paper, ss, engine -->
短签名的特征数少，偶然相同或匹配不到的情形更难解释。应保留原输入，且把不同算法生成的签名分开。需要跨系统对照时，可先用固定文件比较各端生成的签名。

## 常见误区
- 第一段写的是十进制块尺度，不是摘要自身的长度。
- 同一块尺度可能得到不同长度的签名。
- 短签名相等不代表原文件逐字节一致。
