---
capabilityId: op:Jq
title: Jq 查询
topicGroup: formats
summary: jq 将 JSON 值送入过滤器。过滤器可以提取、筛选或构造结果，同一输入也可产生多条输出。
aliases:
  - Jq
  - jq filter
  - jq 过滤器
  - JSON 管道
sources:
  - id: manual
    title: jq 1.6 Manual
    publisher: jq 维护者
    url: https://jqlang.org/manual/v1.6/
    language: en
    kind: official-doc
    locator: Basic filters、Iterator、Pipe、select 及对象构造
  - id: rfc
    title: RFC 8259 — The JavaScript Object Notation Data Interchange Format
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc8259.html
    language: en
    kind: standard
    locator: 第 2、4 至 7、9 节，JSON 语法及互操作约定
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Jq，使用 jq 执行过滤器并呈现多值输出
---

## 介绍
<!-- sources: manual, rfc -->
jq 对 JSON 值执行过滤器。过滤器可以照原样返回输入、提取成员、产生多条值，也可以重新组织数据。点号 . 指经过当前步骤的值，管道 | 则把左边的结果交给右边继续处理。

## 迭代与逐项过滤
<!-- sources: manual -->
在数组上使用 .[] 会让每个元素成为一条输出。管道右侧对左边产生的每条值分别运行。select 按条件保留原值，通过后仍可从这条值继续取字段。

:::example 筛出数量较多的项目
[输入]
{"items":[{"name":"a","qty":1},{"name":"b","qty":3}]}
.items[] | select(.qty > 1) | .name
[结果]
"b"
[说明]
两条对象依次参与比较。a 的 qty 为 1 未通过，b 的 qty 为 3 通过，最后得到 b 的 name。
:::

## 多条输出与一个数组
<!-- sources: manual, fixed -->
允许多条结果的过滤器可让调用环境一条条读取它们。方括号 [表达式] 则收集表达式生成的所有值，构造一个数组。应用也可能把多条独立输出呈现为一个列表，语义上仍要区分过滤器是否明确构造了数组。

:::example 收集名称为一个数组
[输入]
[{"name":"a"},{"name":"b"}]
[.[] | .name]
[结果]
["a","b"]
[说明]
内部表达式产生两个字符串。方括号收集后向下游传递一个数组。
:::

## 对象构造与计算
<!-- sources: manual, rfc -->
花括号构造对象，键旁的表达式可以使用当前值进行计算。这样可保留部分字段、改名或直接加入派生值。先确定输入字段的类型，避免把表示数字的字符串与数值表达式混用。

:::example 构造含求和结果的对象
[输入]
{"a":5,"b":7}
{sum: (.a + .b)}
[结果]
{"sum":12}
[说明]
表达式读出两个数值并相加，新对象只有 sum 成员。
:::

## 缺失值与选择结果
<!-- sources: manual -->
读取对象中不存在的键，简单索引通常产生 null。select 的条件为假时不发出值。前者是一条值，后者没有输出。传给下一个过滤器时，空结果不会运行下游，null 则会作为输入继续传递。

## 常见误区
- .[] 对数组产生逐项结果，[.[]] 会重新把它们收成数组。
- 管道中后续的点号指当前输入，可能早已不是整份文档。
- 一条输出 null 与没有输出的区别在计数或再次计算时会显现。
