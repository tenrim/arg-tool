---
capabilityId: op:Pad%20lines
title: 填充文本行
topicGroup: text-language
summary: 在每行开头或结尾增加指定长度的填充串，保留不同行原有的长度差。
aliases:
  - Pad lines
  - 行前填充
  - 补齐文本
sources:
  - id: spec
    title: ECMA-262 String.prototype.split
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.split
    language: en
    kind: standard
    locator: 分隔字符串、空项与空分隔符
  - id: pad
    title: ECMA-262 String.prototype.padEnd
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.padend
    language: en
    kind: standard
    locator: 按目标长度重复并截短填充串
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Pad lines：目标长度为行长加指定增量
---

## 介绍
<!-- sources: spec, engine -->
文本行填充在各行的开头或结尾附上重复字符。常见用途是加占位符、制作固定缩进或准备定宽记录。这里的长度数值表示每行额外增加的单元数。

## 计算新长度
<!-- sources: pad, engine -->
每行独立处理。如果原长为 m，增量为 n，则目标为 m＋n，应增加 n 个单元。各行同加 n，输入长短差仍存在。增量小于等于 0 时，不会借填充功能截短原行。

## 重复与截断
<!-- sources: pad, engine -->
当填充串含多个单元时，重复该串，取达到增量所需的一小段。例如需要三个单元而填充串是 xy，就取 xyx。空行同样参与填充。

## 填充方向对照
<!-- sources: spec, pad, engine -->
以下例子用可见字符表示附加部分，便于比较各行真实长度。

:::example 每行前加两个零
[输入]
a
bc
[结果]
00a
00bc
[说明]
开头、增量 2、填充串 0。结果分别长 3 和 4，原来的长度差仍为 1。
:::

:::example 末尾填充需要截短重复串
[输入]
a
bc
[结果]
axyx
bcxyx
[说明]
末尾、增量 3、填充串 xy，补入的是 xyx。
:::

:::example 给空行补字符
[输入]
a

b
[结果]
a.
.
b.
[说明]
末尾、增量 1、填充串为句点。中间原为空行，填充后只剩一个句点。
:::

## 显示宽度与字符单元
<!-- sources: pad, engine -->
字符在字体里可能等宽，也可能出现合字、宽字符和组合序列。按代码单元加相同数量的文本，不保证图面上对齐。需要制作真正定宽的数据时，还要明确以代码单元、字节还是显示列数计宽。

## 常见误区
- 增量 2 意味着每行加 2 个单元，不是把每行改成总长 2。
- 空行也可能产生填充文字。
- 混合字符图面宽度与实际文字长度可能不同。
