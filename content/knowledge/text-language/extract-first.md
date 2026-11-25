---
capabilityId: native:extract-first
title: 每行首字提取
topicGroup: text-language
summary: 跳过空白行，按顺序读取每条记录的首个非空白码点。
aliases:
  - 藏头
  - acrostic
  - 行首读取
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
    locator: extractAnswer 的 first 分支与原行顺序
---

## 介绍
<!-- sources: unicode, engine -->
每行首字提取把各行最前面的有效码点连成一条序列，可用于观察题面是否在行首安排符号或数据。它按文本中的行分隔读取，不受窗口自动折行影响。

## 空白和第一个位置
<!-- sources: unicode, engine -->
空白行先被忽略，再移除其余行内的空白。随后取第一个码点。行首如果有数字、引号、星号或其他标点，会直接取到这些符号，因为处理只剔除空白。

## 可见字形的边界
<!-- sources: unicode, grapheme -->
有些看似一个字符的序列包含别的码点，例如底字加组合变音符。第一个码点只选到了序列的一部分。读取藏头时若材料特意用了复合字形，应以出题材料的计数方式为准。

## 行首示例
<!-- sources: unicode, engine -->
以下为符号与数字的测试材料，结果保留各行首码点。

:::example 三行连接
[输入]
β2
∞ x
7-
[结果]
β∞7
[说明]
输出按原有第一、二、三行顺序组成。
:::

:::example 跳过空行并去缩进
[输入]
A9

 2B
[结果]
A2
[说明]
中间空行不输出，末行开头的空白不占位。
:::

:::example 取符号开头
[输入]
🧩ABC
※7
[结果]
🧩※
[说明]
两个首符号各占一个码点。后续数字或字母不参与。
:::

## 分行和原图比较
<!-- sources: grapheme, engine -->
若从 PDF 或网页复制，排版的换行可能跟原散文段落不同。使用输出之前可以核对材料上的行界和行首。按位置读取能展示一种潜在模式，其是否构成题目线索仍取决于原来的行序。

## 常见误区
- 视觉上的自动折行不一定存在于输入文本。
- 行首标点会被保留为首码点。
- 列表缩进被移除，空行不会贡献占位符。
