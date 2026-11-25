---
capabilityId: op:Offset%20checker
title: 检查偏移量
topicGroup: files
summary: 按起点对齐多个文本样本，标出所有样本共享的同位置符号。
aliases:
  - Offset checker
  - 样本偏移对照
  - 共同位置
sources:
  - id: string
    title: ECMA-262 String Type
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-string-type
    language: en
    kind: standard
    locator: 字符串的 UTF-16 代码单元与零起始位置
  - id: utf8
    title: RFC 3629 UTF-8
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc3629.txt
    language: en
    kind: standard
    locator: 第 3 节，一到四字节及各字节的排列
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Offset checker：分隔样本并逐 String 位置比较
---

## 介绍
<!-- sources: string, engine -->
偏移检查比较多份已从相同起点对齐的样本，把每个样本在相同位置都一样的文字高亮。相同内容出现在不同偏移时，不会被这次比较标为共同位置。

## 样本分隔和比较范围
<!-- sources: engine -->
先按给定分隔串拆成至少两个样本，再从第一份样本的第一个位置开始比较。只有每份样本在该位置都有同一值才算匹配。短样本结束后，其他样本的内容不会变成全组共享字段。

## 文本偏移和文件偏移
<!-- sources: string, utf8, engine -->
这里用 JavaScript 字符串索引，即 UTF-16 代码单元。UTF-8 文件中的字节偏移可能不同。例如 é 是一个 UTF-16 单元，在 UTF-8 中有两个字节。若要核对二进制偏移，可先将每个字节用等宽十六进制表示，再把字符位置按格式换回字节位置。

## 对齐的样本
<!-- sources: string, engine -->
各样本按相同起点排布，以下只说明结果所高亮的文本。

:::example 固定开头
[输入]
MIST#42

MIST@19
[结果]
仅高亮两份样本开头的 MIST
[说明]
使用空行分隔后，两个样本在偏移 0～3 处一样。
:::

:::example 多份与不同长度
[输入]
ABCD

AB

ABXY
[结果]
三个样本均高亮 AB
[说明]
在第三个位置处，中间样本已经没有字符。
:::

:::example 只有中间位置相同
[输入]
azq|bzq|bzz，分隔符为 |
[结果]
三个样本均高亮第二个位置的 z
[说明]
第一位并非全部相同，第三位也有 q 与 z 两种值。
:::

## 对齐带来的限制
<!-- sources: string, engine -->
若某份样本开头被插入一个字符，它后续同样的内容也会整体偏移。可以用已知字段或文件头统一对齐后再比较。高亮可提示存在共同字段；还需原规范或其他样本确认该位置实际储存的信息。

## 常见误区
- 按固定位置比对不等于寻找任意位置的公共子串。
- 有共同文本并不能保证它是文件头或控制字段。
- 高亮的位置按 UTF-16 单元计数，不能当作 UTF-8 字节序号。
