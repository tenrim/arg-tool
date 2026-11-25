---
capabilityId: pair:Raw%20Deflate
title: 原始 Deflate 编码与解码
topicGroup: file-compression
summary: 在原字节与没有 zlib 或 gzip 外壳的 DEFLATE 位流之间转换。
aliases:
  - Raw Deflate
  - Raw Inflate
  - 裸 DEFLATE
sources:
  - id: def
    title: RFC 1951 DEFLATE Compressed Data Format Specification
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc1951
    language: en
    kind: standard
    locator: 第 3.2 节，紧密位流、三类数据块、长度和距离
  - id: zlib
    title: RFC 1950 ZLIB Compressed Data Format Specification
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc1950
    language: en
    kind: standard
    locator: 第 2.2～2.3 节，头部、可选词典和 Adler-32
  - id: engine
    title: CyberChef 11.5.0 压缩模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Compression.js
    language: en
    kind: implementation
    locator: Raw Deflate 和 Raw Inflate 的组块模式、起始索引
---

## 介绍
<!-- sources: def, zlib -->
DEFLATE 把数据表示成依次排列的数据块。块可直接储存字节，也可把短片段改写为对先前字节的回指，再对符号使用 Huffman 码。原始流不带 zlib 的头部和 Adler-32，也没有 gzip 的成员结构。

## 块和结束标志
<!-- sources: def -->
每个块的开头含 BFINAL 及 BTYPE。最后块的 BFINAL 为 1。BTYPE 可表示直接储存、固定 Huffman 或动态 Huffman；文件包含什么样的块，可按位查看。固定码使用规定的表，动态码须先从流中读表。

## 直接储存块
<!-- sources: def, engine -->
直接储存块对齐至下一字节后，以小端的 LEN、NLEN 保存负载长度及按位取反的 16 位值。其后跟未压缩正文。通过这一形式可在小样本上逐字节核对。

## 三种输入的对照
<!-- sources: def, engine -->
以下为固定实现的具体结果。不同合法压缩器可能产生别的位流，解开的字节应相同。

:::example 直接储存 HELLO
[输入]
HELLO，Store
[结果]
01 05 00 FA FF 48 45 4C 4C 4F
[说明]
01 表示最终储存块，长度 0005 按 16 位逐位取反是 FFFA，末尾五个字节是正文。
:::

:::example 固定码的同一数据
[输入]
HELLO，固定 Huffman
[结果]
F3 70 F5 F1 F1 07 00
[说明]
这一组为固定实现将样本编码后的位流，可解回 HELLO。
:::

:::example 从带前缀数据中解码
[输入]
AA BB 01 05 00 FA FF 48 45 4C 4C 4F，起始字节偏移 2
[结果]
HELLO
[说明]
从第三个字节开始解析，AA BB 不进入 DEFLATE 流。
:::

## 选择外壳和入口
<!-- sources: def, zlib, engine -->
先根据协议确认是否应处理裸流。有些空输入模式在固定引擎里不能生成可往返的裸流，例如测试中的 Store 空输入读回报 NLEN 异常。规范允许用有效的空块表示零字节，错误的编码不能证明空流是被禁止的。

## 常见误区
- 裸流自身没有 zlib 的 Adler-32 字段。
- 压缩方式不同，合法字节流也可能不同。
- 起始索引应指向实际 DEFLATE 块的第一个字节。
