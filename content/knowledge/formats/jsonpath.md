---
capabilityId: op:JPath%20expression
title: JPath 表达式
topicGroup: formats
summary: JSONPath 按子节点与后代逐段选择 JSON 数据，可读取指定成员、数组位置或满足条件的多项结果。
aliases:
  - JPath expression
  - JSONPath
  - JSON 路径表达式
  - JSON 取值
sources:
  - id: std
    title: RFC 9535 — JSONPath
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc9535.html
    language: en
    kind: standard
    locator: 第 1.1、2.1、2.3、2.5 节，节点列表与选择器
  - id: orig
    title: JSONPath — XPath for JSON
    publisher: Stefan Goessner
    url: https://goessner.net/articles/JsonPath/
    language: en
    kind: author-spec
    locator: 根、下标、通配和旧版过滤表达式
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: JPath expression，节点结果序列化与分隔符
---

## 介绍
<!-- sources: std, orig -->
JSONPath 把 JSON 文档看成节点树，从根节点沿路径选择值。根用 $ 表示，每一段根据当前节点的类型选择零个或多个子节点或后代。得到的是节点列表，调用方可把节点的值或路径显示出来。

## 属性与数组索引
<!-- sources: std, orig -->
对象成员可按名称选择，简单名称常写在点号之后。数组索引从零开始。[0] 取第一项，[1] 取第二项。路径中的中间段负责缩小当前的节点范围。

:::example 取第二条记录的代号
[输入]
{"a":[{"code":"A"},{"code":"B"}]}
$.a[1].code
[结果]
"B"
[说明]
根的 a 成员是数组，[1] 取第二个对象，末段读取该对象的 code。
:::

## 通配与缺失成员
<!-- sources: std, fixed -->
通配符 * 可以选中数组内的多项。下一段只在各项中继续寻找指定成员。成员缺失时不会自动补入 null。只有输入文档明确存在一个 null 值时，这个值才作为已选中的节点出现。

:::example 跨记录取字段
[输入]
{"a":[{"code":"A"},{"none":"B"},{"code":"C"}]}
$.a[*].code
[结果]
"A"
"C"
[说明]
中间记录没有 code 字段。按一项一行列出剩余两项，保持原数组中的先后顺序。
:::

## 特殊键名与比较条件
<!-- sources: std, orig -->
键名若含点号、空格等字符，可在方括号中用引号包住整个键名。过滤条件中的 @ 指向正在判断的节点，可据此对每条记录比较字段值。早期 JSONPath 实现与 RFC 有方言差异，复杂过滤式须结合实际版本判断。

:::example 键名中的点是字面字符
[输入]
{"a.b":1,"a":{"b":2}}
$['a.b']
[结果]
1
[说明]
带引号的键整体匹配名为 a.b 的成员。写成 $.a.b 会沿 a 再走到 b，值为 2。
:::

## 节点列表与结果呈现
<!-- sources: std, fixed -->
空节点列表、单个命中和多个命中都属于有效查询结果。输出采用数组或分行时，应区分被选中的值恰好是数组，还是很多个独立节点各有一个值。对象成员整体遍历时，标准未为这些成员指定统一的命中顺序。

## 常见误区
- JSONPath 的第一个数组元素索引是 0。
- 不存在的字段不等同于存在且值为 null 的字段。
- 用别的 JSONPath 实现运行复杂过滤器时，需留意版本和扩展语法。
