---
capabilityId: pair:Rison%20Encode
title: Rison 编码与解码
topicGroup: formats
summary: 用圆括号和短标记表示 JSON 类数据，区分 Rison 结构和 URI 的外层编码。
aliases:
  - Rison
  - Kibana URL
  - "!t"
sources:
  - id: spec
    title: Rison — compact URL object encoding
    publisher: Rison 项目
    url: https://github.com/w33ble/rison-node
    language: en
    kind: author-spec
    locator: 对象、数组、引号和语法
  - id: elastic
    title: Kibana routing, navigation and URL
    publisher: Elastic
    url: https://www.elastic.co/docs/extend/kibana/key-concepts/platform-architecture/routing-navigation-and-url
    language: en
    kind: official-doc
    locator: Syncing state with URL
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的处理规则和声明边界
---

## 介绍
<!-- sources: spec, elastic -->

Rison 用类似 JSON 的数据模型表示带类型的值，减少常见 URI 中需转义的标点。个别应用会用它记录过滤器、排序方式或视图状态。恢复时应保留原字符串的括号和惊叹号。

## 对象、布尔值及 null
<!-- sources: spec, chef -->

对象以圆括号包围，以冒号分隔键值。!t、!f、!n 分别表示真、假、null。简单名称可直接写，不需要包引号。

:::example 序列化带布尔值的对象
[输入]
{"a":1,"b":true}
[结果]
(a:1,b:!t)
[说明]
整数 1 和真值 !t 类型不同。
:::

## 数组与字符串
<!-- sources: spec, chef -->

数组由 !(...) 标出，使用逗号分隔元素。包含空格的文字使用单引号，感叹号承担该格式的转义职责。

:::example 混合类型的数组
[输入]
["hello world",null,false]
[结果]
!('hello world',!n,!f)
[说明]
从开头的 ! 和括号识别数组，分别读取文字、null 和假。
:::

:::example 逐字面解释感叹号
[输入]
it’s! 中的引号使用 ASCII 形式：{"x":"it's!"}
[结果]
(x:'it!'s!!')
[说明]
其中 !' 表示原单引号，!! 表示原感叹号。
:::

## URI 是外层传输
<!-- sources: spec, elastic -->

地址栏可以对 Rison 文本再应用 URI 编码。空格在某些场景写成加号，浏览器地址还会包含其它参数。读取时需要分开参数层和 Rison 数据层。

## 等价结构与文本比较
<!-- sources: spec, chef -->

某些编码器会固定对象键的输出顺序。因此，显式整理后字符串不同的两份对象仍可能具有同样的键和值。用于核对工具状态时，应比较解析后的结构。

## 常见误区

- 字面的括号不代表其中一定是 Rison。
- URI 编码与 Rison 的内部转义属于两个阶段。
- 数组前的感叹号不能随意去掉。

