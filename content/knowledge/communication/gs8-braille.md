---
capabilityId: native:gs8
title: GS8 盲文
topicGroup: communication
summary: 介绍用于数学与科学文本的 Gardner–Salinas 八点体系，保留符号表的重叠与多单元结构。
aliases:
  - Gardner–Salinas
  - GS8 科学盲文
  - 八点盲文
sources:
  - id: unicode
    title: Unicode 17.0 第 21.1 节 Braille
    publisher: Unicode 联盟
    url: https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-21/
    language: en
    kind: standard
    locator: Braille Patterns、点序及不规定语言含义的编码边界
  - id: design
    title: "TRIANGLE: Tri-Modal Access to Text, Tables, Equations, Graphs, Calculations, and Figures"
    publisher: John A. Gardner 等
    url: https://www.dinf.ne.jp/doc/english/Us_Eu/conf/csun_97/csun97_011.html
    language: en
    kind: author-spec
    locator: GS 六点和八点表示及科学文本用途
  - id: table
    title: GS8 已发布符号表的固定数据
    publisher: John Gardner / Norberto Salinas
    url: /vendor/completion/gs8/symbols.json
    language: en
    kind: implementation
    locator: 原始表地址及摘要；greek-37、miscellaneous-87、numbers-17、lower-u
  - id: engine
    title: GS8 符号转换与候选输出
    publisher: 迷雾工具箱
    url: /completion/gs8.js
    language: zh-CN
    kind: implementation
    locator: gs8Symbols、精确符号标记和重叠行为
---

## 介绍
<!-- sources: design, unicode -->
GS8 是 Gardner 与 Salinas 提出的八点盲文方案，面向数学、科学和一般文本的触读表示。八点单元在六点位置下方增加左 7、右 8 两点，可容纳 256 种不同点阵。

## 符号表与点位
<!-- sources: design, table, unicode -->
希腊字母、数字和科学运算符可以从原表查得各自的点位。编码为 Unicode 时，每个凸起的点贡献 2ⁿ⁻¹；不过 Unicode 只确定形状。点 1 和 8 的字符是 U+2881，依 GS8 表才有 α 这一含义。

## 多单元与重叠
<!-- sources: table, engine -->
有些条目用连续单元表达标记，不能简单按一个点阵字符切开。原表也有不同条目落在同一组点位的情况。转写中可显示有歧义的候选或借材料的上下文判断，不能仅凭一个点阵固定唯一字符。

## 可追溯的符号例子
<!-- sources: unicode, table, engine -->
以下三组分别核对希腊字母、科学符号和数字/字母冲突。

:::example 希腊字母 alpha
[输入]
α
[结果]
⢁，U+2881
[说明]
凸点为 1、8，偏移是 1＋128=129，即十六进制 81。
:::

:::example 无穷大符号
[输入]
∞
[结果]
⢓，U+2893
[说明]
凸点为 1、2、5、8，权重之和为 1＋2＋16＋128=147。
:::

:::example 一个点阵的两个候选
[输入]
解码 ⠥（点 136）
[结果]
{numbers-17|lower-u}
[说明]
原表在此点位列了数字 0 和小写 u。两项在固定资料中均保留。
:::

## 转写与科学表达
<!-- sources: design, table, engine -->
读出数学标记后，需要结合起止边界和所在代码表解释结构。转换程序给出符号或候选，不对表达式求值，也不自行补全上下标。保存原点阵序列可避免回读时丢失分组和歧义。

## 常见误区
- 八点点阵可用于许多方案，GS8 是其中一种约定。
- 相同的 Unicode 点阵可能承载不同符号。
- 连续点阵中存在多单元标记，应保留原边界线索。
