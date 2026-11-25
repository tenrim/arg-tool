---
capabilityId: native:chemistry-molecule
title: SMILES 分子结构
topicGroup: matter
summary: 读懂文本中的原子、键、分支和闭环，从结构式还原分子连接图。
aliases:
  - SMILES
  - CCO
  - 分子结构
  - 芳香环
sources:
  - id: daylight
    title: Daylight Theory：SMILES
    publisher: Daylight Chemical Information Systems
    url: https://www.daylight.com/dayhtml/doc/theory/theory.smiles.html
    language: en
    kind: author-spec
    locator: 3.1–3.4，原子、键、分支、环和芳香性
  - id: rdkit
    title: RDKit.js：JavaScript toolkit for cheminformatics
    publisher: RDKit 项目
    url: https://www.rdkitjs.com/
    language: en
    kind: official-doc
    locator: 读取 SMILES 和绘制结构图
  - id: worker
    title: 分子与格式检查的调用
    publisher: 迷雾工具箱
    url: /science/native-api.js
    language: zh-CN
    kind: implementation
    locator: rdkitClue 与分子结构输出
---

## 介绍
<!-- sources: daylight, rdkit -->

SMILES 是用一行字符写分子连接关系的表示法。它把原子和键组成的分子图按某条路径记录下来，遇到分支或回路时插入简短标记。不同遍历可能描述同一结构。

## 原子、隐式氢和键
<!-- sources: daylight, worker -->

常见有机元素可用符号写出，未另标记的连接通常按单键或芳香键规则解释。氢在不少位置可以根据语法和化合价省略。如果结构带显式同位素与形式电荷，通常在方括号内记录。

:::example 三个显式原子
[输入]
CCO
[结果]
两个 C 和一个 O，沿 C–C–O 相连，2 条键
[说明]
隐式氢未逐个写出，组成仍为 C2H6O。
:::

## 同一个分子式的不同图
<!-- sources: daylight, worker -->

分子式只记录元素种类和数量。改变同一组原子的连接顺序，可能得到具有相同分子式的另一种结构。

:::example 改变氧的位置
[输入]
比较 CCO 与 COC
[结果]
前者 C–C–O，后者 C–O–C；分子式均 C2H6O
[说明]
两条字符串读为乙醇和二甲醚，连接方式不同。
:::

## 分支和环闭合
<!-- sources: daylight, rdkit -->

括号表示从当前路径旁开一支。配对数字把先后读到的两个原子以一条键连接，数字本身不代表一个新原子。小写 c 在这里表示芳香碳。

:::example 分辨两个六元环
[输入]
c1ccccc1 和 C1CCCCC1
[结果]
前者苯，C6H6；后者环己烷，C6H12；各有 6 个显式原子和 6 条键
[说明]
数字 1 记录闭环，大小写影响芳香性与隐式氢。
:::

## 二维绘制与解析失败
<!-- sources: daylight, rdkit, worker -->

二维结构图突出连结、芳香性和书写的立体标记。此类绘图不用于恢复一套唯一的三维原子坐标。若闭环标记没有配对或价态语法无效，需要检查原始结构字符串。

## 常见误区

- CCO 是 SMILES，C2H6O 是分子式。
- 相同分子式不足以识别唯一连接图。
- 绘图中未标出的氢仍可能属于分子。

