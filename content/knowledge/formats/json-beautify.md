---
capabilityId: op:JSON%20Beautify
title: 格式化 JSON
topicGroup: formats
summary: JSON 排版在对象和数组的边界处添加缩进和换行。需要保留重复键、数字原字面量或原始转义时，应特别区分按结构排版与解析后重新序列化。
aliases:
  - JSON Beautify
  - JSON 美化
  - JSON 缩进
  - JSON 排版
sources:
  - id: rfc
    title: RFC 8259 — The JavaScript Object Notation Data Interchange Format
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc8259.html
    language: en
    kind: standard
    locator: 第 2、4 至 7、9 节，JSON 语法及互操作约定
  - id: ecma
    title: ECMAScript — The JSON Object
    publisher: Ecma TC39
    url: https://tc39.es/ecma262/multipage/structured-data.html#sec-json-object
    language: en
    kind: standard
    locator: JSON.parse 与 JSON.stringify 的规则
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: JSON Beautify，缩进、键排序及序列化
---

## 介绍
<!-- sources: rfc, ecma -->
JSON 文本可表示对象、数组、字符串、数值、布尔值和 null。格式化为嵌套结构添加缩进，让对象成员与数组元素的层级更容易看清。传输或存储若依赖原始字节，仍须保留输入文本。

## 字符串边界与空白
<!-- sources: rfc, ecma -->
语法允许在结构符号邻接处放入空格、制表或换行。引号内部的空格属于字符串内容，反斜杠后的转义另按字符串规则解释。排版时应先辨认引号和转义边界，再决定哪些空白属于格式。

:::example 保留字符串中的两个空格
[输入]
[ "a  b", 2 ]
[结果]
[
  "a  b",
  2
]
[说明]
数组的两个元素独立成行。字符串里 a 和 b 中间仍保留两个空格。
:::

## 对象成员与数组顺序
<!-- sources: rfc, fixed -->
JSON 的数组按位置存放元素。排序对象成员时，可以改动成员在文本中的列出次序，但数组元素的位置仍应保留。统一键顺序便于阅读文本差异，有应用把成员原有顺序或拼写纳入外部约定时，还须另核其规则。

:::example 排列两个对象成员
[输入]
{"b":2,"a":[1,true]}，按键名排序并用两个空格缩进
[结果]
{
  "a": [
    1,
    true
  ],
  "b": 2
}
[说明]
对象先列 a，后列 b。数组内部仍先是数值 1，后是布尔值 true。
:::

## 类型与重复键
<!-- sources: rfc, ecma -->
有引号的数字是字符串，数值和布尔值各有自己的语法。规范建议同一对象内的键名唯一。若有多个同名成员，不同解析器可能保留最后一个、报错或保留全部，解析后输出时不一定能恢复原稿中的所有值。

:::example 字符串编号与数值并存
[输入]
{"id":"007","n":7,"active":false}
[结果]
{
  "id": "007",
  "n": 7,
  "active": false
}
[说明]
编号保留前导零及引号，n 仍是数值，active 仍是布尔值。
:::

## 重写数据的边界
<!-- sources: rfc, ecma -->
解析再输出的方式可能把等价的转义写成不同形式，也可能改变数字文本中的指数表示和无意义的尾零。在数值精度有限的解析环境中，整数很大时还可能变为近似值。逐字核对、计算摘要或验证签名均应使用所要求的原始字节或专门规定的规范化形式。

## 常见误区
- 字符串中的空白和结构外的空白遵循不同规则。
- 格式化后的排版一致，不能证明两份材料原始字节相同。
- 重复键和超出数值精度的数字需要在解析前保留原文，否则可能无法从排版结果恢复。
