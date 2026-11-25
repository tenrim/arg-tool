---
capabilityId: pair:Bzip2%20Compress
title: Bzip2 压缩与解压
topicGroup: file-compression
summary: 说明 bzip2 的块整理、游程和 Huffman 压缩，并关联文件头的块级别。
aliases:
  - Bzip2 Compress
  - Bzip2 Decompress
  - bzip2 压缩块
sources:
  - id: bzip
    title: bzip2 and libbzip2 Manual
    publisher: Julian Seward
    url: https://sourceware.org/bzip2/manual/manual.html
    language: en
    kind: author-spec
    locator: 第 1、2、3 节，分块、块大小、低内存解压及库
  - id: engine
    title: CyberChef 11.5.0 压缩模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Compression.js
    language: en
    kind: implementation
    locator: Bzip2 Compress / Decompress 的 wasm、块级别、work factor 及低内存选项
---

## 介绍
<!-- sources: bzip, engine -->
bzip2 是无损压缩格式。它对局部字节排列进行 Burrows–Wheeler 变换，使相近上下文能聚集，再利用移动到前端、游程处理和 Huffman 编码等步骤降低表示成本。

## 分块限制与开头字节
<!-- sources: bzip, engine -->
输入按块处理，块大小级别从 1 到 9，每级约 100000 字节。流以 BZh 开头，接着是级别的 ASCII 字符，例如 BZh1 或 BZh9。这个级别规定最大块大小，实际最后一块可能短得多。

## 解压和校验
<!-- sources: bzip, engine -->
解压按相反的步骤恢复字节并核对校验。低内存解压会采用另一种读取策略，减少内存，可能增加时间；生成的原字节仍相同。压缩的 work factor 影响编码端对数据块的处理策略。

## 三个小样本
<!-- sources: bzip, engine -->
以下均用 work factor 30。长度和首部来自固定运行实现，原字节可用独立解码器核对。

:::example 一级小块
[输入]
ASCII HELLO，块大小级别 1
[结果]
41 字节，头 42 5A 68 31；解压得到 HELLO
[说明]
42 5A 68 31 是文本 BZh1。
:::

:::example 使用九级块
[输入]
ASCII HELLO 重复五次，块级别 9
[结果]
42 字节，头 42 5A 68 39；低内存解压得到原有 25 字节
[说明]
小输入不必占满九级块允许的最大大小。
:::

:::example 含零和高值字节
[输入]
原字节 00 01 FF 00，块级别 1
[结果]
40 字节的 bzip2 流；解压返回 00 01 FF 00
[说明]
算法以字节为单位，零值和 FF 不需要先转换成可读文本。
:::

## 压缩与成员管理
<!-- sources: bzip, engine -->
bzip2 提供流压缩。若内容是 TAR 等归档，解压得到的是原归档字节，还要读取归档成员。小输入甚至可能比压缩前更长，因为格式页首、块信息和校验都有固定成本。

## 常见误区
- 公布的块级别是字节上限的一部分，不是压缩比例。
- 低内存解压不会改变原始负载。
- bzip2 与 gzip 需要不同的解码规则。
