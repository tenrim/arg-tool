---
capabilityId: op:LZNT1%20Decompress
title: LZNT1解压
topicGroup: file-compression
summary: 按 LZNT1 分块读取字面量和回引，恢复原始字节。
aliases:
  - LZNT1 Decompress
  - MS-XCA LZNT1
  - Windows LZNT1 分块
sources:
  - id: buffer
    title: MS-XCA — LZNT1 Buffer Format
    publisher: Microsoft
    url: https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-xca/124d9696-a69c-409a-a055-2562fbe255f9
    language: en
    kind: standard
    locator: §2.5.1.1 至各字段子节
  - id: copy
    title: MS-XCA — LZNT1 Processing Rules
    publisher: Microsoft
    url: https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-xca/b1ba6d34-499c-4017-ab0c-fe2daee93efc
    language: en
    kind: standard
    locator: §2.5.3，4096 字节分块与重叠复制
  - id: engine
    title: CyberChef Compression 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Compression.js
    language: en
    kind: implementation
    locator: LZNT1 Decompress，分块和回引处理
---

## 介绍
<!-- sources: buffer, copy -->

LZNT1 是微软公开记录的一种 LZ77 字节压缩格式。输入通常按 4096 字节划分，每块可压缩，也可原样存储。压缩块用短记录指向已经输出的字节，以便表达重复数据。

## 块头与负载长度
<!-- sources: buffer, engine -->

块头为 2 字节小端整数。普通数据块的位 14 至位 12 为二进制 011，位 15 指明是否压缩，低 12 位表示块头之后的负载长度减 1。例如字节 `02 30` 组成 0x3002，后接 3 字节原样负载。全零块头用于标记缓冲区结束。

## 标志字节与回引
<!-- sources: buffer, copy -->

压缩块由若干组标志和数据组成。一组先读一个标志字节，从低位起每一位描述随后一个数据元素。零位后面是一个字面字节，一位后面是两个字节的回引记录。回引的距离和长度字段按本块已输出的位置重新划分。短例中记录 `00 00` 表示从输出尾部向前 1 字节开始复制 3 字节。

## 从单块到连续块
<!-- sources: buffer, copy, engine -->

回引按字节顺序写入输出。因此一个距离为 1 的回引可以连续引用刚写出的相同字节。块头标明本块负载边界，解码器读到边界即进入下一块，未用完的标志位没有对应数据。

:::example 原样块
[输入]
02 30 41 42 43
[结果]
41 42 43
[说明]
头值 0x3002 的压缩位为 0，长度字段 2 加 1 后直接复制 3 字节。
:::

:::example 含重叠回引的压缩块
[输入]
03 B0 02 41 00 00
[结果]
41 41 41 41
[说明]
0xB003 指定 4 字节压缩负载。标志 02 先给出字面量 41，再用回引 0000 复制三次。
:::

:::example 连续两块
[输入]
02 30 41 42 43 03 B0 02 41 00 00
[结果]
41 42 43 41 41 41 41
[说明]
头一个块的负载用完后直接读取第二个块头。输出按块次序拼接。
:::

## 文件中寻找完整块
<!-- sources: buffer, engine -->

文件扩展名不会指出压缩块的确切起始位置。若候选块头声明的负载越过容器记录边界，应先检查取样偏移和原记录的长度。另有一个固定版本的兼容边界：`00 30 41` 依规范是单字节原样块，此处解码器却把低 12 位为零的块提前结束，实际返回空结果。不能将这份空结果解释为原数据没有字节。

## 常见误区

- 将块头直接按大端值解读会同时改变压缩位和负载长度。
- 复制长度大于回引距离仍可能完全合法，解码允许边写边引用。
- 一个标志字节最多描述 8 项，末组的数据元素数由块的长度约束。

