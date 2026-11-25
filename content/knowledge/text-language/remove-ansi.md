---
capabilityId: op:Remove%20ANSI%20Escape%20Codes
title: 移除 ANSI 转义序列
topicGroup: text-language
summary: 终端转义序列可控制文字属性、光标和屏幕。清理文字时可去除其中识别到的控制序列，并保留普通字符。
aliases:
  - Remove ANSI Escape Codes
  - ANSI
  - 终端控制序列
  - CSI
  - SGR
sources:
  - id: ecma
    title: ECMA-48 — Control Functions for Graphic Character Imaging
    publisher: Ecma International
    url: https://ecma-international.org/publications-and-standards/standards/ecma-48/
    language: en
    kind: standard
    locator: 控制功能、CSI 与字符属性
  - id: windows
    title: 控制台虚拟终端序列
    publisher: Microsoft Learn
    url: https://learn.microsoft.com/zh-cn/windows/console/console-virtual-terminal-sequences
    language: zh-CN
    kind: official-doc
    locator: SGR、显示清除、窗口标题及序列示例
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Remove ANSI Escape Codes，识别并替换一组转义序列
---

## 介绍
<!-- sources: ecma, windows -->
终端可能收到普通文字和控制序列的混合内容。后者可改变颜色、移动光标、清屏或修改窗口标题。直接在文本里查找线索时，去除支持的控制序列可让普通文字相邻显示。

## ESC、CSI 和控制参数
<!-- sources: ecma, windows -->
ESC 的字节值是 1B。常见的七位 CSI 写法是 ESC 后接左方括号，其后可带参数及终止字母。SGR 以 m 结尾，用参数表示文字属性，例如 31 为红色前景，0 恢复默认属性。

:::example 去掉红色文字的着色标记
[输入]
Before [ESC][31mRed[ESC][0m after
[结果]
Before Red after
[说明]
[ESC] 代表一个实际的 1B 字节。着色开始和重置都不属于普通文字。
:::

## 光标与屏幕控制
<!-- sources: ecma, windows, fixed -->
某些控制序列改变已有文字的呈现，例如清除整个屏幕。直接从日志文本移除这些控制符会连接前后保留下来的文字，不会重演终端的绘制和清除过程。

:::example 清屏序列被移除
[输入]
Hi[ESC][2Jthere
[结果]
Hithere
[说明]
读取原始字符流时，Hi 与 there 都存在，CSI 2J 则请求清屏。去掉序列后两段普通文字相连。
:::

## 字面转义与真实控制字节
<!-- sources: windows, fixed -->
日志把不可见字符写成可见的反斜杠表示时，\x1b 是四个普通字符。它与实际出现的 ESC 字节不同。检测规则要按输入的真实形式判断，尤其是记录曾经被打印成 JSON 或调试字符串时。

:::example 连反斜杠在内的文本保持原样
[输入]
A\x1b[31mB（反斜杠 x 1 b 都是真实可见字符）
[结果]
A\x1b[31mB
[说明]
其中没有实际的 ESC 字节，字符序列以普通文字保留。
:::

## 控制序列种类与清理边界
<!-- sources: ecma, windows, fixed -->
控制串除了 CSI，还有能承载标题等信息的 OSC 等类型。清理结果取决于实现认识的序列范围，可能保留未覆盖的控制串。若目标是重建屏幕状态，则需按终端规则解释游标、缓冲区和覆盖动作。

## 常见误区
- 写成 \x1b 的日志字面量与一个 1B 字节不同。
- 去掉颜色或清屏码后，文本不一定与屏幕最终可见内容一致。
- 存在控制串时，清理前后的副本可分别用于证据保留和阅读。
