---
capabilityId: native:image-png
title: PNG 数据块检查
topicGroup: image-stego
summary: PNG 在固定签名后以连续块组织图像头、像素数据及辅助信息。逐块查看可以获得类型、长度和偏移。
aliases:
  - PNG 数据块
  - IHDR
  - IDAT
  - IEND
  - tEXt
sources:
  - id: png
    title: Portable Network Graphics (PNG) Specification (Third Edition)
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 第 5、11 节，签名、数据块、校验和标准块类型
  - id: local
    title: 本地 PNG 数据块解析
    publisher: 迷雾工具箱
    url: /media.js
    language: zh-CN
    kind: implementation
    locator: pngChunks 的长度和偏移解析、tEXt 预览及尾随字节
---

## 介绍
<!-- sources: png, local -->
PNG 的八字节签名之后是一系列数据块。常见文件先有 IHDR，像素压缩流用 IDAT 承载，最后由 IEND 结束。数据块检查按字节列出这些结构，适合了解图像附带了哪些记录。

## 长度、类型、数据与校验位
<!-- sources: png, local -->
块的前四字节给出大端数据长度，接下来四字节是块名，数据之后还有四字节 CRC。求下一块偏移时，用当前偏移加数据长度和 12 字节固定开销。即使块不含数据，也有 12 字节框架。

:::example 复算下一块的位置
[输入]
文件开头 8 字节签名，IHDR 的数据长度为 13，后接数据长度为 12 的 IDAT。
[结果]
IHDR 起于偏移 8，IDAT 起于偏移 33，下一块起于偏移 57。
[说明]
从 8 加 13 + 12 得 33，再加 12 + 12 得 57。
:::

## 文本块里的关键词与值
<!-- sources: png, local -->
tEXt 携带关键词、一个零字节分隔符和文字内容。它与图像像素独立，可在其他合适的块之间出现。文本预览用于辨认可读内容，逐字核查时还可从偏移读取原始字节。

:::example 文本块中的线索
[输入]
在 IHDR 与 IDAT 之间添加 tEXt，数据为 43 6C 75 65 00 45 41 53 54。
[结果]
tEXt 起于偏移 33，数据长 9 字节，关键词为 Clue，正文是 EAST。
[说明]
43 6C 75 65 和 45 41 53 54 都是可打印 ASCII，中间的 00 是分隔符。
:::

## IEND 和文件尾
<!-- sources: png, local -->
IEND 的数据长度为零，标记 PNG 数据流结束。从它之后继续读出的内容属于文件尾随数据。块检查可记录尾随区域的偏移与长度，但要进一步判断用途仍须观察实际字节。

:::example 单独定位尾部四字节
[输入]
总长 69 字节的有效 PNG 后附加 4E 4F 54 45。
[结果]
尾随数据从偏移 69 开始，共 4 字节，可按 ASCII 读成 NOTE。
[说明]
附加字节位于 IEND 的 CRC 之后，未增加另一个 PNG 块。
:::

## 块列表和完整性检查
<!-- sources: png, local -->
若块声明的长度指向文件边界之外，块解析无法按该长度读取完整数据。一个看似完整的块列表仍需另查校验、块顺序和解压结果，才能判断 PNG 是否满足完整格式要求。

## 常见误区
- 块长度字段只数数据，不含长度、类型与 CRC。
- 多个 IDAT 可以拼成一个压缩流，各块不用分别当作图像。
- IEND 后的可读内容属于另一段字节，不属于正常 PNG 块列表。
