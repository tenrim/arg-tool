---
capabilityId: native:forensics-foremost
title: 文件雕刻与恢复
topicGroup: files
summary: 依据文件头、文件尾及内部结构恢复片段，并使用审计报告追踪来源。
aliases:
  - Foremost
  - 文件雕刻
  - 文件恢复
  - audit.txt
sources:
  - id: foremost
    title: Foremost 项目说明
    publisher: Foremost 项目
    url: https://foremost.sourceforge.net/
    language: en
    kind: author-spec
    locator: Introduction，头、尾、内部结构和自定义规则
  - id: pngcode
    title: Foremost 1.5.7 源码 — extract.c
    publisher: Foremost 作者 / Debian Sources
    url: https://sources.debian.org/src/foremost/1.5.7-11/extract.c/
    language: en
    kind: implementation
    locator: extract_png，尺寸与 PNG 块间边界
  - id: adapter
    title: AperiSolve Foremost Analyzer
    publisher: Zeecka / AperiSolve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/foremost.py
    language: en
    kind: implementation
    locator: 读取原始数据并收集恢复文件
  - id: png
    title: PNG Specification, Third Edition
    publisher: W3C
    url: https://www.w3.org/TR/2025/REC-png-3-20250624/
    language: en
    kind: standard
    locator: §5，块结构，§11.2.4，IEND
---

## 介绍
<!-- sources: foremost, adapter -->

文件雕刻依靠字节序列内的格式特征寻找原文件的部分或全部数据。Foremost 是一种专门的雕刻工具，可从磁盘镜像或其他二进制文件中寻找相邻存放的文件内容。它主要查看数据本身，因此即使缺少原文件系统目录，仍可能提取出完整的连续片段。

## 起点、终点与结构
<!-- sources: foremost, pngcode, png -->

某些格式的头尾易于辨认，复杂格式还需要读长度与内部结构。Foremost 的内置 PNG 处理先检查候选的尺寸，再沿数据块的长度跳到下一块，直到定位 IEND。这一过程可算出截取范围，逐块 CRC 仍可根据 PNG 规范另行核验。

## 审计记录与文件名
<!-- sources: foremost, adapter -->

恢复结果通常有新分配的名称，并随工具报告保留偏移和大小等线索。使用审计记录可以回到原材料核对起点与终点。单凭新文件名无法找回原系统中的目录、文件名或创建时间。

## PNG 边界的三个样例
<!-- sources: foremost, pngcode, png -->

以下例子依据 Foremost 1.5.7 的 PNG 路径及格式规范演算。由签名、IHDR、图像数据和 IEND 组成的短图可以独立校验字节及 CRC。作为雕刻输入时，候选起点之后的缓冲长度也影响是否进入该版本的 PNG 处理。

:::example 夹在其他数据中的一张小图
[输入]
4D 49 53 54 后接下列 PNG，再接 64 个 00。
89 50 4E 47 0D 0A 1A 0A 00 00 00 0D 49 48 44 52 00 00 00 02 00 00 00 01 08 06 00 00 00 F4 22 7F 8A
00 00 00 11 49 44 41 54 78 9C 63 74 14 09 F8 FF 9F 91 81 01 00 0D 80 02 A6 78 DF 47 D9
00 00 00 00 49 45 4E 44 AE 42 60 82
[结果]
计算出的 PNG 范围为偏移 4 至 77，共 74 字节，尺寸 2 × 1。
[说明]
签名 8 字节，IHDR 占 25 字节，IDAT 占 29 字节，IEND 占 12 字节。偏移 78 起的尾随字节位于图像边界之外。
:::

:::example 文件存在但候选缓冲太短
[输入]
只保留上例的 74 字节 PNG，移除四字节前缀和全部尾随数据。
[结果]
PNG 的结构仍完整。Foremost 1.5.7 的 PNG 处理函数在候选缓冲不足 100 字节时先退出这一轮解析。
[说明]
规范定义的图片大小与候选程序进入解析的最短缓冲条件是两个独立约束。
:::

:::example 边界保留但校验失败
[输入]
第一个示例中，将 IEND 的最后一个 CRC 字节从 82 改为 83。
[结果]
IEND 仍在同一偏移，候选长度仍可算为 74。IEND 的正确 CRC 为 AE 42 60 82，改后校验不通过。
[说明]
该版雕刻函数按块范围计算长度，没有在这条分支重新计算 IEND 的 CRC。由同一边界切出的字节可能已经损坏。
:::

## 连续内容与碎片
<!-- sources: foremost, pngcode -->

雕刻常假定候选范围内的字节按原顺序连续保存。若图像被分割并夹入无关块，签名仍可能存在，而下一个块的类型和长度就未必合理。检查恢复质量时，可以比对独立格式解析、候选字节数和原材料的审计偏移。

## 常见误区

- 文件头和文件尾都出现，不足以证明中间数据完整。
- 结果目录中的名称是恢复工具生成的标识，不能还原原目录关系。
- 未产生某类输出可能与规则、数据截断或候选缓冲条件有关。

