---
capabilityId: native:extract-transpose
title: 文字行列转置
topicGroup: text-language
summary: 将由等宽文本行组成的矩阵交换行列，把原列逐条写为新行。
aliases:
  - 转置
  - transpose
  - 竖读
sources:
  - id: unicode
    title: ECMA-262 字符串迭代器
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-string-iterator-objects
    language: en
    kind: standard
    locator: 字符串迭代按代码点长度推进
  - id: matrix
    title: numpy.transpose
    publisher: NumPy
    url: https://numpy.org/doc/stable/reference/generated/numpy.transpose.html
    language: en
    kind: official-doc
    locator: 二维数组交换两轴
  - id: engine
    title: 答案提取核心
    publisher: 迷雾工具箱
    url: /hunt-extract.js
    language: zh-CN
    kind: implementation
    locator: extractAnswer 的 transpose 分支、码点拆分及等宽检查
---

## 介绍
<!-- sources: matrix, engine -->
文字行列转置把原来横向排列的若干等宽文本行当作矩阵，让原列依次成为输出行。对填字、方格或整齐的符号表，可用它换一种阅读方向。

## 坐标如何交换
<!-- sources: matrix, engine -->
原第 i 行第 j 列的元素放在新第 j 行第 i 列。m 行 n 列变为 n 行 m 列。原矩阵第一列从上到下读出，得到新矩阵的第一行。

## 清理后核对等宽
<!-- sources: unicode, engine -->
处理前忽略空白行并去掉行内空白，再按码点计算行宽。各行必须有相同宽度。不等宽时提示不能转置，需要先还原材料的真实网格或按题目确定有无占位符。

## 转置的实际例子
<!-- sources: unicode, matrix, engine -->
以下展示矩形、含补充平面符号，以及空行被去掉后的网格。

:::example 两行三列
[输入]
123
456
[结果]
14
25
36
[说明]
原第一列是 1、4，变成第一行。2×3 变为 3×2。
:::

:::example 空格去除后按码点编列
[输入]
A 🧩 3
B Ω 4
[结果]
AB
🧩Ω
34
[说明]
两个格内有图标或希腊字母，恰各占一个码点位置。
:::

:::example 保留符号的列
[输入]
1.

2?
[结果]
12
.?
[说明]
忽略中间空行，句点和问号留在各自的第二列，一起转成第二行。
:::

## 连续两次转置
<!-- sources: matrix, engine -->
一个已清理的矩形连续转置两次，每个元素都回到原坐标。原材料的空格与空行在清理中已失去，不能靠再转置恢复。转置也不会把任一行或列反向。

## 常见误区
- 转置可用于矩形，不要求行数等于列数。
- 它交换行列，不是把网格转过 90°。
- 原图若用空格标空格子，应先用明确的占位符重新表示。
