---
capabilityId: native:forensics-strings
title: 二进制字符串提取
topicGroup: files
summary: GNU strings 在二进制文件中找出满足长度和可打印规则的连续字符段，用于观察文件中现成的文字。
aliases:
  - GNU strings
  - 二进制文件字符串
  - 提取可见片段
  - 可打印字符扫描
sources:
  - id: gnu
    title: GNU Binary Utilities — strings
    publisher: GNU Binutils 项目
    url: https://sourceware.org/binutils/docs/binutils/strings.html
    language: en
    kind: official-doc
    locator: 最短长度、扫描范围、编码选项与偏移
  - id: ascii
    title: RFC 20 — ASCII Format for Network Interchange
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc20.txt
    language: en
    kind: standard
    locator: 第 2、3 节，字符表及八位字节中的表示
  - id: upstream
    title: Aperi’Solve 原分析器
    publisher: Aperi’Solve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/strings.py
    language: en
    kind: implementation
    locator: StringsAnalyzer 在给定文件上调用 GNU strings
---

## 介绍
<!-- sources: gnu, upstream -->
GNU strings 读取原始文件，列出连续可打印字符段。它适合从非文本数据中发现可读名称和明显标记。工具调用的扫描范围与编码规则决定哪些内容会被列出来。

## 连续片段与默认长度
<!-- sources: gnu, ascii, upstream -->
默认最短片段长度为 4。若连续片段只包含三个可打印字符，仍会被过滤。常见的 NUL 或换行会断开片段，所以同一文件里可能有多条可读结果。

:::example 片段达到最短长度
[输入]
00 50 4C 41 4E 00 4D 41 50 00
[结果]
在默认单字节扫描中得到 PLAN。
[说明]
PLAN 有 4 个连续可打印字符，MAP 只有 3 个。00 结束前一片段。
:::

## 文件位置与重复内容
<!-- sources: gnu, ascii -->
文件里反复出现相同文字时，各自仍占用不同位置。基本扫描可分别输出它们。支持偏移显示时，可将结果定位回对应的字节区，便于区别同名片段的上下文。

:::example 同一文字来自两个位置
[输入]
4D 41 50 53 00 4D 41 50 53 00
[结果]
扫描得到 MAPS、MAPS 两条。
[说明]
两条片段分别从偏移 0 和 5 开始。内容相同，位置不同。
:::

## 宽字符与不同编码
<!-- sources: gnu -->
GNU strings 支持选择单字节或某些宽编码。采用 UTF-16LE 写下的 ASCII 片段，中间有 00。按默认单字节扫描时这些零字节结束连续片段，按正确的宽格式扫描才可连读。

:::example 单字节条件下漏掉宽字符
[输入]
45 00 41 00 53 00 54 00 00 00
[结果]
默认单字节、最短长度 4 时没有命中；按 16 位小端代码单元可识别 EAST。
[说明]
默认模式看到的是长度为 1 的零散字母。16 位小端模式会把每个字母字节与紧跟的 00 作为一组。
:::

## 扫描范围与结果含义
<!-- sources: gnu, upstream -->
有些文件的扫描按内容区段，有些会扫描整份输入。压缩或编码的数据也可能没有直接可读的文字。找到一个词只说明对应位置匹配字符规则，应结合格式及文件上下文判断其用途。

## 常见误区
- 可打印片段不保证是句子、字段或作者有意留下的线索。
- 字符串很短或编码不同，即使人能解释原数据，也可能没有默认命中。
- 看见重复结果时，若要判断它们是否来自同一处，应复核原偏移。
