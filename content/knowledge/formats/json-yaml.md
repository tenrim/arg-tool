---
capabilityId: pair:JSON%20to%20YAML
title: JSON / YAML
topicGroup: formats
summary: JSON 与 YAML 可互换映射、序列与基本值。转换能保留共同的数据模型，注释、标签、锚点和标量写法可按格式变化。
aliases:
  - JSON to YAML
  - YAML to JSON
  - YAML 映射
  - YAML 序列
sources:
  - id: json
    title: RFC 8259 — The JavaScript Object Notation Data Interchange Format
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc8259.html
    language: en
    kind: standard
    locator: 第 3 至 7 节，对象、数组、数值和字符串
  - id: yaml
    title: YAML Ain’t Markup Language 1.2.2
    publisher: YAML Language Development Team
    url: https://yaml.org/spec/1.2.2/
    language: en
    kind: standard
    locator: 第 3、6、8、10 章，节点模型、引用、块标量和 schema
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: JSON to YAML 与 YAML to JSON，序列化、类型及别名解析
---

## 介绍
<!-- sources: json, yaml -->
JSON 和 YAML 都可描述映射、序列和简单值。JSON 用花括号、方括号及逗号写结构，YAML 也可用缩进及行首短横线表达同样的层级。格式转换的一般过程是先解析数据，再按目标格式写出。

## 对象和数组的对应
<!-- sources: json, yaml, fixed -->
JSON 对象可写作 YAML 映射，数组可写为 YAML 序列，嵌套可以通过缩进继续表示。序列各项有先后顺序。显示对象条目时，即使书写顺序改变，也应确保各键与原值对应。

:::example 映射中的布尔值和序列
[输入]
{"id":"007","flag":true,"tags":["east","west"]}
[结果]
id: '007'
flag: true
tags:
  - east
  - west
[说明]
id 加引号以保留字符串，flag 是布尔值，tags 的两个序列项按原顺序排列。
:::

## 标量类型和引号
<!-- sources: json, yaml, fixed -->
YAML 解析器可按选定 schema 将不带引号的标量解读为字符串、数值、布尔值或 null。需要保留编号和带类型字面外观的文字时，显式引号可以避开隐式推断。不同 YAML 版本或 schema 对同一个裸词的解读也可能不同。

:::example 保留数字形式的编号和文本布尔词
[输入]
id: "007"
n: 7
flag: "true"
empty: null
[结果]
{"id":"007","n":7,"flag":"true","empty":null}
[说明]
编号、普通数字、文字 true 与空值分别保留各自的类型。
:::

## 锚点、别名和注释
<!-- sources: yaml, json, fixed -->
YAML 可给节点设置锚点，再用别名引用。JSON 文本没有同样的别名语法，常见转换会将共享值写在各自位置。注释、缩进和引号风格属于呈现，重写为 JSON 后不会保留。循环引用等无法展开为有限树的结构需要另做处理。

:::example 两个键共享同一序列
[输入]
source: &p [1, 2]
copy: *p
[结果]
{"source":[1,2],"copy":[1,2]}
[说明]
YAML 里的 copy 引用 source 的序列。JSON 在两个成员下各写一份序列内容。
:::

## 多行文本和往返转换
<!-- sources: yaml, json -->
YAML 可以使用块标量描述多行文本，具体换行规则由块标记和末尾修饰符决定。转换为 JSON 时，字符串中的换行常写成转义。往返核对宜比较实际值和类型；若需要作者写下的注释或排版，则保存源文件。

## 常见误区
- YAML 中 7 和写在引号里的 "7" 可以表示两种不同类型。
- JSON 文本没有 YAML 的锚点、别名和注释结构，往返不保证恢复原布局。
- YAML 的序列具有顺序，映射中展示键的排列与序列顺序意义不同。
