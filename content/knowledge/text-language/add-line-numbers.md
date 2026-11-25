---
capabilityId: op:Add%20line%20numbers
title: 添加行号
topicGroup: text-language
summary: 给 LF 分隔的每条文本行加顺序编号，并解释编号偏移和空行。
aliases:
  - Add line numbers
  - 行号前缀
  - 按行编号
sources:
  - id: spec
    title: ECMA-262 String.prototype.split
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.split
    language: en
    kind: standard
    locator: 分隔字符串、空项与空分隔符
  - id: pad
    title: ECMA-262 String.prototype.padStart
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.padstart
    language: en
    kind: standard
    locator: 重复填充串及在目标长度截断
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Add line numbers：LF 分行、1＋offset 起号与空格对齐
---

## 介绍
<!-- sources: spec, engine -->
添加行号将文本按 LF 分为行，为每行加一个顺序编号。编号和正文之间插入一个空格。加入的内容会写入结果文本，可用于标明源行或比较重排前后的顺序。

## 起号和对齐方式
<!-- sources: pad, engine -->
首行编号为 1 加偏移，往后每行加一。编号长度不足输入总行数的十进制位数时，默认在编号左侧补空格。偏移可能导致一些编号超出该宽度，这些编号不会被截断。

## 空行和换行边界
<!-- sources: spec, engine -->
直接按 LF 切分时，两个相邻的 LF 之间有空行。末尾一个 LF 后也被视为还有一条空行。空行会获得编号和分隔空格；原始正文仍为空。

## 编号前缀的例子
<!-- sources: spec, pad, engine -->
以下用 ␠ 显式标记结果末尾的空格，实际结果使用普通空格。

:::example 从第一行开始
[输入]
a
b
[结果]
1 a
2 b
[说明]
默认偏移 0，首行编号为 1。
:::

:::example 从 10 开始且保留空行
[输入]
a

B
[结果]
10 a
11␠
12 B
[说明]
偏移设为 9。中间空行也计入序列。
:::

:::example 末尾 LF 后的编号
[输入]
a 后接一个 LF，偏移 0
[结果]
1 a
2␠
[说明]
分隔后在末尾形成一个空记录。
:::

## 编号作为追踪信息
<!-- sources: spec, engine -->
如果后来再进行排序、筛选或删除，可利用编号追查原位置。若原文已有数字开头，新增行号与原先的数据应区分存储。负偏移还可能生成负号，移除编号的模式需要覆盖这一情形。

## 常见误区
- 偏移为 9 时首行是 10。
- 空行及末尾分隔后的空记录也有行号。
- 添加的行号是正文字符，复制结果会带上这些编号。
