---
capabilityId: native:extract-position
title: 按位置提取答案
topicGroup: text-language
summary: 对清理后的每条记录使用同一个从 1 起算的位置，再按源行次序拼接。
aliases:
  - 固定索引
  - 每行第 N 个字
  - index extraction
sources:
  - id: unicode
    title: ECMA-262 字符串迭代器
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-string-iterator-objects
    language: en
    kind: standard
    locator: 字符串迭代按代码点长度推进
  - id: grapheme
    title: Unicode Text Segmentation
    publisher: Unicode 联盟
    url: https://www.unicode.org/reports/tr29/
    language: en
    kind: standard
    locator: 第 3 节，扩展字素簇与多个码点
  - id: engine
    title: 答案提取核心
    publisher: 迷雾工具箱
    url: /hunt-extract.js
    language: zh-CN
    kind: implementation
    locator: extractAnswer 的 index 分支、去除空白和越界检查
---

## 介绍
<!-- sources: unicode, engine -->
固定位置提取从每一行取第 N 个码点，依行的输入顺序连成一个结果。常见材料是一列答案或同类标签，每一行本来就应承担一个连续单元。

## 清理后的位置计算
<!-- sources: unicode, engine -->
把每个非空行的空白去掉，逐个码点形成位置表。首码点位置为 1；要取第 N 个，就访问数组偏移 N−1。空行不参加，标点和数字仍可占一个位置。

## 码点的计数
<!-- sources: unicode, grapheme -->
一个补充平面符号可以在 UTF-16 中用两个单元表示，逐码点读取会把两个单元当成一项。一个可见字形也可由多个码点组成，例如连成一幅图形的表情序列；数可见图标与数码点有时得到不同索引。

## 相同索引的对照
<!-- sources: unicode, engine -->
以下都使用位置 2。三个结果分别展示单码点表情、标点和空行。

:::example 每行抽取第二个码点
[输入]
A🧩C
7Ω2
фЖ9
[结果]
🧩ΩЖ
[说明]
三个保留行都取位置 2，🧩 作为一个码点进入结果。
:::

:::example 去空白后标点仍参与
[输入]
1 - 2
A . B
[结果]
-.
[说明]
空格被移除，短横线与句点分别在第二位。
:::

:::example 忽略空行
[输入]
1 2

3 4
[结果]
24
[说明]
第二个物理行为空，保留的两行分别贡献 2 和 4。
:::

## 检查题目给出的规则
<!-- sources: grapheme, engine -->
清理后的某一行比指定位置短时，当前处理会指出这行的索引无效，不继续拼半个答案。如果材料要求空格或段落也占位，可以先记录原网格，也可按其标注重新建立真正的答案行。

## 常见误区
- 位置从 1 起算。
- 共用同一个索引与为每行分别给索引是两种规则。
- 自动移除空白会改变原始文字里的位置。
