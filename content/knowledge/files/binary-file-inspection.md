---
capabilityId: native:file
title: 文件识别与字节查看
topicGroup: files
summary: 使用前缀、十六进制、ASCII 片段、熵值和摘要检查本地文件。
aliases:
  - 文件查看
  - 字节
  - binary
sources:
  - id: file
    title: File API
    publisher: W3C
    url: https://www.w3.org/TR/FileAPI/
    language: en
    kind: standard
    locator: Blob、File 与 arrayBuffer
  - id: png
    title: Portable Network Graphics (PNG) Specification
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: PNG signature、IHDR 和文件结构
  - id: sha
    title: FIPS 180-4：Secure Hash Standard
    publisher: NIST
    url: https://csrc.nist.gov/pubs/fips/180-4/upd1/final
    language: en
    kind: standard
    locator: SHA-256 及摘要长度
  - id: media
    title: 本地文件特征与字节工具
    publisher: 迷雾工具箱
    url: /media.js
    language: zh-CN
    kind: implementation
    locator: fileAnalysis、hexDump、asciiStrings
---

## 介绍
<!-- sources: file, media -->

文件检查以读到的字节为依据。文件名是标签，文件头是容器通常具有的开头标识。即使后缀未知，也能查看字节分布、可打印片段及校验摘要。

## 格式前缀的用途
<!-- sources: png, media -->

一些格式将固定标志放在开头，以便识别。例如 PNG 签名有八个字节，后续块提供图像尺寸等详细信息。前缀匹配只能作为快速识别，仍需完整解析确认结构。

:::example 读 PNG 文件头
[输入]
89 50 4E 47 0D 0A 1A 0A 开始的正常 PNG 样本
[结果]
识别为 PNG；十六进制从 00000000 开始
[说明]
这八字节可用于区分与同名的其他格式。
:::

## 偏移与字符栏
<!-- sources: file, media -->

转储按偏移列出各字节的十六进制，右栏只解释可打印 ASCII。文件中出现控制符或高位字节时，读数仍保留在十六进制栏。

:::example 看原字节和字符串
[输入]
41 42 43 44 00 FF
[结果]
偏移 0 显示 ABCD；右栏 ABCD..
[说明]
后两个字节结束了连续的可打印区间。
:::

## 字节分布与熵
<!-- sources: media -->

字节熵估计相同字节在已读取数据中出现的概率。以 2 为底，熵是每个出现值的负概率乘对数再求和。平衡的两种字节给出 1 位熵，和数据顺序无关。

:::example 两种值各占半数
[输入]
00 00 FF FF
[结果]
字节熵为 1.0000（数值 1）
[说明]
两项各 p=1/2，所以两项贡献均为 0.5。
:::

## 用摘要协助复核
<!-- sources: file, media, sha -->

SHA-256 从完整输入导出固定宽度摘要。两份文件摘要相同可用于初步核对是否相同；需要确切字节证据时可进一步直接比较。摘要和高熵或低熵都不提供来源认证。

## 常见误区

- 文件后缀可以与文件内部结构不匹配。
- 一段可读字符不足以说明文件是文本。
- 熵高同时可能出现在正常压缩数据与随机数据中。

