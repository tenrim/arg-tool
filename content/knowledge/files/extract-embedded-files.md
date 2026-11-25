---
capabilityId: op:Extract%20Files
title: 提取文件
topicGroup: files
summary: 由格式签名和数据边界在混合字节中切出文件候选。
aliases:
  - Extract Files
  - 文件提取
  - file carving
  - 格式边界
sources:
  - id: png
    title: PNG Specification, Third Edition
    publisher: W3C
    url: https://www.w3.org/TR/2025/REC-png-3-20250624/
    language: en
    kind: standard
    locator: §5.2 PNG signature，§5.3 Chunk layout，IEND
  - id: engine
    title: CyberChef Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Extract Files，候选识别、最小长度过滤与导出
---

## 介绍
<!-- sources: png, engine -->

文件提取从较大字节流中划出可能独立使用的一段数据。先定位某种格式的签名，再按该格式的长度、内部块或结束标记决定切片范围。这种依据数据本身复原片段的做法称为文件雕刻。

## 数据块与边界
<!-- sources: png, engine -->

PNG 的第一段为 8 字节签名。每个块包含长度、类型、内容和 CRC，总占用字节数等于其内容长度加 12。IEND 的内容长度为 0，它占最后 12 字节。对单块 IDAT 的下列短图，长度之和为 8 + 25 + 29 + 12 = 74 字节。

## 区分切片与完整性
<!-- sources: png, engine -->

文件名中的提取偏移便于回到原始流。提取过程只需找到合适边界即可生成候选，无须证明每一块的 CRC 都正确。例如 IEND 尾部的 CRC 被改动，提取仍可能产生一个带 `.png` 扩展名的文件。格式校验和解码结果提供另一层证据。

## 实际切片的核对
<!-- sources: png, engine -->

样例仅保留图像分类，以便独立观察 PNG 结果。默认最小长度有可能滤掉人工构造的小图。在短例中将最小大小设为 0，第三例再用最小大小 100 做对照。

:::example 从前缀后切出完整图
[输入]
4D 49 53 54 后接下面的 74 字节，再补 16 个 00，最小大小为 0。
89 50 4E 47 0D 0A 1A 0A 00 00 00 0D 49 48 44 52 00 00 00 02 00 00 00 01 08 06 00 00 00 F4 22 7F 8A
00 00 00 11 49 44 41 54 78 9C 63 74 14 09 F8 FF 9F 91 81 01 00 0D 80 02 A6 78 DF 47 D9
00 00 00 00 49 45 4E 44 AE 42 60 82
[结果]
extracted_at_0x4.png，74 字节，与图的原始字节逐项相同。
[说明]
切片从偏移 4 开始，在 IEND 的 CRC 结束后停止，未包含前缀或尾随的零。
:::

:::example 仅有 PNG 签名
[输入]
4D 49 53 54 89 50 4E 47 0D 0A 1A 0A，随后补 16 个 00，最小大小为 0。
[结果]
没有导出的 PNG 候选。
[说明]
这组字节可以获得签名匹配，但不具备该提取器用来切出 PNG 的完整数据块结构。
:::

:::example 最小大小过滤
[输入]
使用第一个示例的完整字节，最小大小改为 100。
[结果]
不再导出 74 字节的 PNG。
[说明]
过滤比较的是提取出的候选大小。原输入也只有 94 字节，但判断应以候选的 74 字节为准。
:::

## 恢复记录中的边界
<!-- sources: png, engine -->

候选切片应保留原偏移、长度及生成时使用的类型规则。遇到截断或被其他片段隔开的文件，需结合额外证据判断缺失区间。能用某个软件打开也未必意味着每块校验通过，必要时应单独检查记录所涉及的数据和路径。

## 常见误区

- 有签名仅意味着可定位起点，导出候选还需要找到可解释的边界。
- 导出名称通常由提取工具分配，不提供原文件系统中的名称。
- 大小过滤适合减少候选，调得过高会舍弃确实存在的小文件。

