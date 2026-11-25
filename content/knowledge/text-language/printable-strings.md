---
capabilityId: op:Strings
title: 提取可打印字符串
topicGroup: text-language
summary: 可打印字符串提取从二进制中选择连续可见的字符片段，并可按最短长度、编码、排序及去重条件显示。
aliases:
  - Strings
  - 可打印字符串
  - ASCII 字符提取
  - 宽字符
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
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Strings，单字节和宽字符匹配、排序与去重
---

## 介绍
<!-- sources: gnu, ascii, fixed -->
字符串扫描从一串原始字节中找出可解释成连续文字的片段。对格式未知的数据，可先看其中是否留有标识、文件名或简短提示。只有明确了字符编码和筛选范围，结果才便于复算。

## 连续字符与最短长度
<!-- sources: gnu, ascii, fixed -->
单字节的 ASCII 扫描可按待接受的字节范围分段。遇到不能匹配的控制字节时结束当前连续片段。最短长度限制会过滤片段，避免每个孤立字节都出现在输出中。

:::example 筛掉不足四个字符的片段
[输入]
00 41 42 43 44 00 41 42 43 00 48 45 4C 4C 4F 00
单字节模式，最短长度为 4。
[结果]
ABCD
HELLO
[说明]
中间的 ABC 只有三个字符而被略过。两侧的零字节参与分段，不计作可打印字符。
:::

## 宽字符与端序
<!-- sources: gnu, fixed -->
某些数据会用 16 位代码单元存放文字。ASCII 字母在 UTF-16LE 中通常表现为字母字节后跟 00。以单字节方式读时，00 可能切断每个字母；用 16 位小端匹配，才可识别连续的逻辑字符。

:::example 识别宽字符片段
[输入]
48 00 49 00 44 00 45 00 00 00
16 位小端模式，最短长度为 4。
[结果]
命中的逻辑字符为 HIDE，匹配的原字节仍是 48 00 49 00 44 00 45 00。
[说明]
小端代码单元分别为 0048、0049、0044、0045。原始匹配输出可以保留中间的 00，需以所选编码解释。
:::

## 排序、去重与计数
<!-- sources: fixed -->
按字节位置显示可以保留出现顺序。排序便于集中看相似片段，去重则将相同文字合并，只留一条显示。当计数作用于去重后的结果时，它表示唯一片段数。

:::example 对重复片段去重
[输入]
41 41 41 41 00 41 41 41 41 00 42 42 42 42 00
单字节模式，最短长度为 4，显示总数并去重。
[结果]
总数 2，片段为 AAAA 和 BBBB。
[说明]
原始扫描有三段，其中两个 AAAA 合并成一项。
:::

## 恢复上下文
<!-- sources: gnu, ascii -->
短文字也可能由其他数据偶然形成。若要判断某个片段的意义，可将它定位回原始文件，查看前后字节、编码、可能的长度字段或文件中的数据区。输出顺序被重排后，需回到原文件重新核对。

## 常见误区
- 最短长度调整会改变被列出的字符串。
- 宽字符的数据可能包含每隔一个出现的零字节，须按端序解释。
- 片段列表是原数据的一部分，仅凭它通常不能还原完整文档。
