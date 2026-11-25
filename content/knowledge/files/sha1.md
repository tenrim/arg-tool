---
capabilityId: op:SHA1
title: SHA1 哈希
topicGroup: file-compression
summary: 说明 SHA-1 的消息扩展与 160 位输出，区分算法历史文档与现行使用政策。
aliases:
  - SHA-1
  - Secure Hash Algorithm 1
  - SHA1
sources:
  - id: nist
    title: FIPS 180-4
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
    language: en
    kind: standard
    locator: 第 5 节预处理与第 6.1 节 SHA-1
  - id: collision
    title: The First Collision for Full SHA-1
    publisher: CWI
    url: https://ir.cwi.nl/pub/26763/
    language: en
    kind: author-spec
    locator: 论文摘要与两份 PDF 的实证
  - id: policy
    title: NIST Transitioning Away from SHA-1 for All Applications
    publisher: NIST
    url: https://www.nist.gov/news-events/news/2022/12/nist-transitioning-away-sha-1-all-applications
    language: en
    kind: official-doc
    locator: SHA-1 迁移计划和截止时间
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: SHA1
---

## 介绍
<!-- sources: nist, policy -->

SHA-1 将任意合规长度的消息处理成 160 位摘要。NIST 在 1995 年以 FIPS 180-1 指定了 SHA-1，FIPS 180-4 也保留算法说明。这里的历史规格用于理解已有数据，现行迁移要求由单独的政策文件说明。

## 消息预处理
<!-- sources: nist, engine -->

SHA-1 把输入填充成 512 位块。原消息后增加 1 位、若干个 0，再写入 64 位原始长度。每块读为 16 个大端 32 位字，而最终摘要由五个 32 位状态字构成。

:::example 零字节输入的摘要
[输入]
空字节串。
[结果]
da39a3ee5e6b4b0d3255bfef95601890afd80709
[说明]
空输入仍带有一个补齐块，输出为五个 32 位状态字。
:::

## 消息扩展和压缩
<!-- sources: nist -->

每块的 16 个字扩展为 80 个调度字。位置 t 从 16 起用第 t−3、t−8、t−14、t−16 个字异或，再循环左移一位。压缩逐步混合这组消息字、五个状态寄存器、分段布尔函数和轮常数。

:::example 单字节向量
[输入]
ASCII a，十六进制 61。
[结果]
86f7e437faa5a7fce15d1ddcb9eaeaea377667b8
[说明]
原始长度域为 8 位，输出仍是 20 字节。
:::

## 摘要读取
<!-- sources: nist, engine -->

处理最后一块后依次输出五个状态字。计算与显示独立，40 个十六进制字符代表 20 字节，按 Base64 表示时字符数会改变。核对旧清单时须比较同一算法和完全相同的字节。

:::example ASCII abc
[输入]
61 62 63。
[结果]
a9993e364706816aba3e25717850c26c9cd0d89d
[说明]
这个结果用于校核标准 80 步 SHA-1。读取文本时增加换行会改变被散列的字节。
:::

## 碰撞实证和迁移
<!-- sources: collision, policy -->

2017 年公布的研究产生了内容不同、SHA-1 相同的两份 PDF，证明完整 SHA-1 的碰撞可实际构造。NIST 随后公布逐步停止 SHA-1 加密保护用途的计划，目标日期为 2030 年 12 月 31 日。散列碰撞实证本身不等于能从任意给定摘要还原原文。

## 常见误区

- SHA-1、SHA-2 与 SHA-3 是不同算法族。
- SHA-1 的 40 个十六进制字符表示 160 位。
- 两个文件的 SHA-1 相同不足以确认文件相同。
