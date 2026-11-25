---
capabilityId: op:Scan%20for%20Embedded%20Files
title: 扫描内嵌文件
topicGroup: files
summary: 查找较大字节流中出现的格式签名，列出可能的文件起点。
aliases:
  - Scan for Embedded Files
  - 内嵌文件
  - 文件签名
  - magic bytes
sources:
  - id: png
    title: PNG Specification, Third Edition
    publisher: W3C
    url: https://www.w3.org/TR/2025/REC-png-3-20250624/
    language: en
    kind: standard
    locator: §5.2 PNG signature，§5.3 Chunk layout，IEND
  - id: zlib
    title: RFC 1950 — ZLIB Compressed Data Format
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc1950.html
    language: en
    kind: standard
    locator: §2.2，CMF、FLG 和 Adler-32
  - id: engine
    title: CyberChef Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Scan for Embedded Files，按偏移报告命中
---

## 介绍
<!-- sources: png, engine -->

内嵌文件扫描从输入的各个字节位置匹配已知格式的特征。开头不是某个文件类型的输入，仍可能在中段或尾部包含该类型的完整数据。扫描报告一般给出所在的字节偏移、推测类型与扩展名。

## 偏移与格式签名
<!-- sources: png, engine -->

偏移从输入的第 0 字节开始计数，十进制 45 和十六进制 0x2D 指同一个位置。PNG 文件从八个固定字节开始，后续是按长度组织的数据块。仅出现固定前缀不足以知道图片还剩多少字节，也不能判断能否解码。

## 同一范围中的多种命中
<!-- sources: png, zlib, engine -->

常见 PNG 的 IDAT 数据使用 zlib 封装，因此一个完整 PNG 内部还可能出现 zlib 签名。命中偏移晚于图片起点，可对应图片内部的压缩流。把候选与外围文件的结构对照，才能确定是附加项目、内部分段还是误命中。

## 字节序列实算
<!-- sources: png, zlib, engine -->

下列样例使用同一张 2 × 1 PNG。第一个例子列出全长 74 字节的原始数据，后两例改变签名所在位置或移除签名后的真实结构。

:::example PNG 内出现 zlib 签名
[输入]
4D 49 53 54 后接下面的 74 字节，再补 16 个 00。
89 50 4E 47 0D 0A 1A 0A 00 00 00 0D 49 48 44 52 00 00 00 02 00 00 00 01 08 06 00 00 00 F4 22 7F 8A
00 00 00 11 49 44 41 54 78 9C 63 74 14 09 F8 FF 9F 91 81 01 00 0D 80 02 A6 78 DF 47 D9
00 00 00 00 49 45 4E 44 AE 42 60 82
[结果]
偏移 4（0x04）报 PNG，偏移 45（0x2D）报 zlib。
[说明]
本 PNG 的 zlib 头 78 9C 在自身偏移 41。前缀占 4 字节，扫描输入中的偏移为 45。
:::

:::example 一份输入中的两张图
[输入]
四字节前缀 4D 49 53 54，接一份上例 PNG、两字节 01 02、第二份同 PNG，再补 16 个 00。
[结果]
PNG 候选偏移 4 和 80，zlib 候选偏移 45 和 121。
[说明]
第二张图从 4 + 74 + 2 = 80 开始，图内压缩流位置仍相对起点为 41。
:::

:::example 缺失后续结构的签名
[输入]
4D 49 53 54 89 50 4E 47 0D 0A 1A 0A，随后补 16 个 00。
[结果]
在偏移 4（0x04）报 PNG 候选。这段数据缺少有效 IHDR 和 IEND。
[说明]
扫描定位了真实存在的八字节模式，完整结构检查仍无法确认有一张图片。
:::

## 结果的用途
<!-- sources: png, engine -->

查找附在容器尾部的线索时，先记录偏移，再用该格式的长度、结束标记及校验限定边界。改变文件起始位置或先切出一段再扫描，会改变报告相对哪个输入计数。保留原始偏移及切片起点，才能把候选对应回同一个源文件。

## 常见误区

- 两种候选可能位于同一个文件内，例如 PNG 与它的图像压缩流。
- 偏移 4 表示其前面有四个字节，按从一数起是第 5 字节。
- 扫描没有列出某种格式，只能说明已启用的规则在当前输入中没有给出它的命中。

