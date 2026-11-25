---
capabilityId: op:Jsonata%20Query
title: JSONata 查询
topicGroup: formats
summary: JSONata 以路径导航、筛选和映射选择数据，还可用表达式和构造器生成新的 JSON 结果。
aliases:
  - JSONata Query
  - JSONata 路径
  - JSON 数据变换
  - JSONata 聚合
sources:
  - id: path
    title: Path Operators
    publisher: JSONata 项目
    url: https://docs.jsonata.org/path-operators
    language: en
    kind: official-doc
    locator: 点号映射、方括号筛选及路径运算符
  - id: processing
    title: The JSONata processing model
    publisher: JSONata 项目
    url: https://docs.jsonata.org/processing
    language: en
    kind: official-doc
    locator: 序列扁平化、零项和单项输出
  - id: sum
    title: Numeric aggregation functions
    publisher: JSONata 项目
    url: https://docs.jsonata.org/aggregation-functions
    language: en
    kind: official-doc
    locator: $sum 的参数与数值总和
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Jsonata Query，执行表达式及返回 JSON 表示
---

## 介绍
<!-- sources: path, processing -->
JSONata 是面向 JSON 的查询与变换语言。路径表达式可以逐步选择成员、筛选多条记录，再在每条记录的上下文中计算。结果既可沿用原数据中的值，也能构造新的数组和对象。

## 点号映射与筛选
<!-- sources: path, processing -->
点号会对左侧得到的各项分别执行右侧表达式。方括号可把条件应用到当前各项，保留符合条件的记录。当前记录内的相对字段名根据该记录查找，不必每次重写从根开始的路径。

:::example 从数组筛选后取名称
[输入]
{"items":[{"name":"a","qty":1},{"name":"b","qty":3}]}
items[qty > 1].name
[结果]
"b"
[说明]
条件保留 qty 为 3 的对象，点号再读取它的 name。单项序列可输出为该字符串本身。
:::

## 序列和数组外形
<!-- sources: processing, fixed -->
JSONata 的路径结果可有零项、一项或多项。正常序列只有一项时，结果可直接是那个值，多项通常呈现为数组。需要稳定数组外形时，可用显式数组构造表达式。

:::example 稳定单项结果的外形
[输入]
{"items":[{"name":"a","qty":1},{"name":"b","qty":3}]}
[items[qty > 1].name]
[结果]
["b"]
[说明]
筛选规则未变，外层数组构造保留方括号。结果仍只含一个元素。
:::

## 逐项计算与聚合
<!-- sources: path, sum -->
括号内可写一个对每项执行的表达式，例如把每条记录的两个数值相乘。聚合函数接收产生的多个数值，再给出一个整体结果。$sum 要求参与求和的各项为数值。

:::example 分别计算后求和
[输入]
{"rows":[{"q":2,"p":3},{"q":4,"p":5}]}
$sum(rows.(q * p))
[结果]
26
[说明]
第一项产生 2 × 3 = 6，第二项产生 4 × 5 = 20，总和为 26。
:::

## 查询与构造
<!-- sources: path, processing -->
筛选可以只取已有字段，也可以将各字段作为构造新结构的材料。对象构造的键和值遵循 JSONata 自己的表达式规则。迁移表达式时，需要按目标语言重写路径、上下文和序列规则。

## 常见误区
- 查询只命中一条时，输出可以是标量。显式数组构造可保留数组外形。
- 点号左侧若有多项，右侧会在各项自己的上下文中计算。
- 路径无命中与实际读到 JSON 的 null 属于不同情况。
