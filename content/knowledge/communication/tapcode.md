---
capabilityId: native:tapcode
title: 敲击码
topicGroup: communication
summary: 把每个字母写为行、列两组敲击次数，以停顿分隔。
aliases:
  - Tap code
  - Knock code
  - 敲击
  - C/K
sources:
  - id: nsa
    title: "No Such Puzzle: Tap Codes"
    publisher: NSA
    url: https://www.nsa.gov/puzzles/view/article/3860720/no-such-puzzle-tap-codes/
    language: en
    kind: official-doc
    locator: 敲击两组次数与 C/K 方阵
  - id: tap
    title: TapCode 固定映射
    publisher: 迷雾工具箱随包原作者
    url: /vendor/basics/TapCode.js
    language: en
    kind: implementation
    locator: 五阶敲击映射
  - id: model
    title: 基础方阵模型
    publisher: 迷雾工具箱
    url: /basics/model.js
    language: zh-CN
    kind: implementation
    locator: squareModel 的敲击字母表、行列和写法
---

## 介绍
<!-- sources: nsa, tap -->
敲击码把每个字母表示为两组同类敲击。第一组计方阵的行，第二组计列。每组次数为一到五下，发送中用不同停顿区分组与字母边界。

## 五阶格与 C/K 合并
<!-- sources: nsa, model -->
常用 5×5 敲击表从 A 到 Z 排列，把 K 并到 C，故一格代表两者。首行是 A、B、C、D、E，第二行是 F、G、H、I、J。

:::example 最短的一对敲击
[输入]
. .
[结果]
A
[说明]
先一下、再一下，行一列一。
:::

## 用每组次数组成坐标
<!-- sources: nsa, tap, model -->
不同时长的停顿分出一行一列，再将每个字母的两组分开。文本记录可用空格分组，词之间可另以 / 标记。单独一组敲击不足以定位一个字母。

:::example 四下再三下
[输入]
.... ...
[结果]
S
[说明]
第四行按 Q、R、S、T、U 排列，第三列是 S。
:::

## 合并格的不可逆信息
<!-- sources: tap, model -->
C 与 K 都写成第一行第三列。逆向结果通常采用一个代表字母，由句意或题面再判断是否应读作另一字母。一段材料的顺序与停顿不足时，也会留下多种候选。

:::example C 与 K 共用格
[输入]
CK
[结果]
. ...  . ...
[说明]
两个字母得到完全相同的两组敲击，读回的两格不能区分 C 和 K。
:::

## 与坐标写法和摩斯的关系
<!-- sources: nsa, tap, model -->
敲击码的点只记录个数，可用行列数字代替。摩斯主要按点划顺序查不同的码表。观察两组各一至五下的重复结构，比看到某些点符号更能支持敲击码的判断。

## 常见误区

- 两个组分别是行和列，不能把全部敲击合计成一组。
- 敲击码常合并 C/K，不能直接套用常见 I/J 方阵。
- 单个符号只计次数，无需赋予摩斯划的含义。
- 超过五下的组需要重新检查分组或使用的方阵。
