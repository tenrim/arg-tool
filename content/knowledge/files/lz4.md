---
capabilityId: pair:LZ4%20Compress
title: LZ4 压缩与解压
topicGroup: file-compression
summary: 说明 LZ4 的字面量与回指，并识别包含标志、块长度与结束标记的帧。
aliases:
  - LZ4 Compress
  - LZ4 Decompress
  - LZ4 帧
sources:
  - id: frame
    title: LZ4 Frame Format
    publisher: Yann Collet / LZ4 项目
    url: https://github.com/lz4/lz4/blob/dev/doc/lz4_Frame_format.md
    language: en
    kind: author-spec
    locator: Magic Number、Frame Descriptor、Data Blocks 与 EndMark
  - id: block
    title: LZ4 Block Format
    publisher: Yann Collet / LZ4 项目
    url: https://github.com/lz4/lz4/blob/dev/doc/lz4_Block_format.md
    language: en
    kind: author-spec
    locator: 字面量、偏移和长度标记
  - id: engine
    title: CyberChef 11.5.0 压缩模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Compression.js
    language: en
    kind: implementation
    locator: LZ4 Compress / Decompress 读取并产生 LZ4 frame
---

## 介绍
<!-- sources: frame, block -->
LZ4 将原字节表示为直接保存的字面量及对已出现字节的引用。它可以组成裸块，也可以把不同块组合到带头部和结束标记的帧中。

## LZ4 帧边界
<!-- sources: frame, engine -->
普通帧以字节 04 22 4D 18 开头，即小端魔数 184D2204。随后是帧描述和数据块。每块有四字节小端长度，最高位为 1 时为直接储存块。长度字段为 00000000 时表示帧中块已结束。

## 压缩块如何还原
<!-- sources: block, engine -->
块中的 token 给出字面量个数及匹配长度的一部分，必要时由扩展字节继续表示。匹配的偏移指出从已经解出的哪处重复复制。同一帧中如果某段压缩不划算，也可以直接存那段字节。

## 帧数据的例子
<!-- sources: frame, block, engine -->
下面给出固定模块输出的实际帧及解码结果。

:::example 五字节直接储存
[输入]
ASCII HELLO
[结果]
04 22 4D 18 40 70 DF 05 00 00 80 48 45 4C 4C 4F 00 00 00 00
[说明]
块长字段为小端 80000005，最高位置位且长度为 5。
:::

:::example 重复文本缩成更小的块
[输入]
HELLO 重复 40 次，共 200 字节
[结果]
30 字节的帧；一个压缩块的长度字段为 0F 00 00 00
[说明]
压缩块实际占 15 字节，回读得到重复的 200 字节。
:::

:::example 短二进制块
[输入]
00 01 FF 00
[结果]
19 字节的帧，块长字段为 04 00 00 80，解回原四字节
[说明]
最高位为 1，四个数据字节原样放在帧中。
:::

## 帧与应用自带长度
<!-- sources: frame, block, engine -->
拿到 LZ4 相关的数据时应先确定是否带帧结构。某些应用只留裸块，原始长度及字典由外层给出，不能仅凭算法名称用帧解码。帧内也可能按选项包含内容检查值。

## 常见误区
- LZ4 裸块和 LZ4 帧有不同的边界信息。
- 帧中最高位标记的块仍可能是直接存储。
- 帧结束标记不是数据中的一个全零原始块。
