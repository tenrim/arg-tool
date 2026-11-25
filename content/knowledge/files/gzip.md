---
capabilityId: pair:Gzip
title: Gzip 编码与解码
topicGroup: file-compression
summary: 将 DEFLATE 位流包装为 gzip 成员，读取可选文件信息与数据校验。
aliases:
  - Gzip
  - Gunzip
  - gzip 成员
  - GZIP CRC32
sources:
  - id: def
    title: RFC 1951 DEFLATE Compressed Data Format Specification
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc1951
    language: en
    kind: standard
    locator: 第 3.2 节，紧密位流、三类数据块、长度和距离
  - id: gzip
    title: RFC 1952 GZIP File Format Specification
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc1952
    language: en
    kind: standard
    locator: 第 2.3.1 节，标志、成员与 CRC32/ISIZE
  - id: engine
    title: CyberChef 11.5.0 压缩模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Compression.js
    language: en
    kind: implementation
    locator: Gzip 和 Gunzip：标志、文件名、评论、FHCRC、CRC32 与解码
---

## 介绍
<!-- sources: gzip, def -->
gzip 成员由头部、压缩数据及尾部组成。常见头字节为 1F 8B 08，其中 08 标记 DEFLATE。gzip 是压缩封装，可把单个 TAR 归档当作待压缩的字节流。

## 文件名、评论与头部校验
<!-- sources: gzip, engine -->
FLG 的对应位表示是否有文件名、评论或头部校验。固定实现中名为 Include file checksum 的开关实际控制 FHCRC，即头部 CRC 的低 16 位。正文 CRC32 与 ISIZE 则位于成员尾部，不随此开关消失。

## 数据尾部
<!-- sources: gzip, engine -->
尾部先保存未压缩数据的 CRC32，再保存原始大小对 2³² 取模的 ISIZE，均为小端。因此可以用解码后的正文和长度同这两个值对照。头部的修改时间等字段可使同一正文的完整 gzip 字节有所变化。

## 成员结构例子
<!-- sources: gzip, def, engine -->
以下只列出结构相关字段，动态写入的时间不作为每次必须一致的值。

:::example 简短正文的尾部
[输入]
HELLO，Store，不写文件名或评论
[结果]
成员以 1F 8B 08 00 起始，尾部为 36 64 44 C1 05 00 00 00
[说明]
HELLO 的 CRC32 为 C1446436，大小为 5；写入时均按小端。
:::

:::example 带名称、评论和头部检查
[输入]
HELLO，固定 Huffman，文件名 sample.txt，评论 demo，开启头部校验
[结果]
头部前三字节仍为 1F 8B 08，FLG 为 1A；解压得到 HELLO
[说明]
1A 同时设置 FHCRC、FNAME 和 FCOMMENT，数据尾部校验和长度沿用同一原文。
:::

:::example 读取空成员
[输入]
1F 8B 08 00 00 00 00 00 00 03 03 00 00 00 00 00 00 00 00 00
[结果]
零字节正文
[说明]
中间的 03 00 表示空的最终固定码块，尾部八字节为零。
:::

## 多层文件与可移植性
<!-- sources: gzip, def, engine -->
gzip 一般只还原流的内容；若内容是 TAR，还要用归档读取工具列出其成员。固定引擎曾在用 Store 生成空输入时输出无法正常解压的流，空成员的处理应以实际格式检查为准。

## 常见误区
- gzip 封装可以压缩归档，但并不提供 TAR 的成员目录。
- FHCRC 控制的是头部检查，尾部 CRC32 另有规定。
- 时间、文件名与压缩块策略都可能影响文件的最终字节。
