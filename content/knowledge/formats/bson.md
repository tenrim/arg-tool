---
capabilityId: pair:BSON%20serialise
title: BSON
topicGroup: formats
summary: BSON 文档由带类型的键值元素组成。文档长度和许多数值采用小端序，文档以单个零字节结束。
aliases:
  - BSON serialise
  - BSON deserialise
  - Binary JSON
  - BSON 文档
sources:
  - id: spec
    title: BSON Specification Version 1.1
    publisher: BSON 项目
    url: https://bsonspec.org/spec.html
    language: en
    kind: author-spec
    locator: document、element、e_name、string 及端序
  - id: mongodb
    title: BSON 类型
    publisher: MongoDB
    url: https://www.mongodb.com/zh-cn/docs/manual/reference/bson-types/
    language: zh-CN
    kind: official-doc
    locator: 类型编号、日期、整数和二进制
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: BSON serialise 与 BSON deserialise，BSON 文档与结构化文本互转
---

## 介绍
<!-- sources: spec, mongodb -->
BSON 将有序键值元素存成二进制文档。字段元素各有类型字节、以零结束的键名和由类型确定的值域。BSON 有普通 JSON 中的对象、字符串、布尔值，也有另外定义的整数宽度、日期、二进制和 ObjectId。

## 总长度与终止字节
<!-- sources: spec, fixed -->
文档开头 4 字节为小端 int32 总长度，计入长度字段本身和文档末尾的零字节。读取器可据此判断消息范围。元素的最后一个字节未必为零，但整个文档仍要以零结束。

:::example 空对象的最短 BSON 文档
[输入]
{}
[结果]
05 00 00 00 00
[说明]
前四字节写出长度 5。无任何元素，最后一字节就是文档终止符。
:::

## 类型、键名与整数数据
<!-- sources: spec, mongodb, fixed -->
类型字节决定后续值的读取方式。键名写成 UTF-8 字节并以零结尾。类型 10（十六进制）对应 32 位整数，数值用小端排列，不额外给 int32 自身加长度字段。

:::example 一个 int32 值
[输入]
{"x":1}（x 编码为 int32）
[结果]
0C 00 00 00 10 78 00 01 00 00 00 00
[说明]
0C 是整个 12 字节文档的长度。10 是类型，78 00 是键 x，01 00 00 00 是数值，最后另有一个 00。
:::

## 字符串与嵌套结构
<!-- sources: spec, fixed -->
类型 02 对应字符串。其值先记录 UTF-8 字节数，长度含结尾的零字节。嵌套文档使用自己的长度和终止符，数组以带数字索引键的文档方式存放，还原时再解释为有序元素。

:::example 逐字节读出字符串 A
[输入]
0E 00 00 00 02 73 00 02 00 00 00 41 00 00
[结果]
{"s":"A"}
[说明]
文档长度为 14。类型 02，键名 s。字符串长度字段为 2，含 41 与字符串终止 00。最后的 00 终止整个文档。
:::

## JSON 表示与长度核对
<!-- sources: spec, mongodb -->
二进制数据、日期和具有特定位宽的数值在 BSON 中有明确类型。普通 JSON 不一定能表达这些类型的全部信息。复原时应继续保留原字节与类型，尤其要核实文件实际长度与文档头宣告的长度是否吻合。

## 常见误区
- BSON 的总长度含头部字段和结尾终止符。
- 字符串值的长度含自己的终止符，键名则靠零字节定位结束。
- JSON 输出里的两个数字相同，也可能来自宽度不同的 BSON 类型。
