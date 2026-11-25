---
capabilityId: op:XPath%20expression
title: XPath 表达式
topicGroup: formats
summary: XPath 在 XML 节点树中按轴、节点测试和谓词选出元素、属性或文本。
aliases:
  - XPath expression
  - XML 查询
  - XPath 谓词
  - XML 节点树
sources:
  - id: xpath
    title: XML Path Language (XPath) Version 1.0
    publisher: W3C
    url: https://www.w3.org/TR/1999/REC-xpath-19991116/
    language: en
    kind: standard
    locator: 第 2、3、5 节，位置路径、谓词和结果类型
  - id: xml
    title: Extensible Markup Language (XML) 1.0
    publisher: W3C
    url: https://www.w3.org/TR/xml/
    language: en
    kind: standard
    locator: 第 2.6、2.10、3 节，处理指令、空白和元素
  - id: ns
    title: Namespaces in XML 1.0 (Third Edition)
    publisher: W3C
    url: https://www.w3.org/TR/xml-names/
    language: en
    kind: standard
    locator: 第 6 节，命名空间的作用域与默认值
  - id: fixed
    title: CyberChef 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: XPath expression，节点集选择与序列化
---

## 介绍
<!-- sources: xpath, xml -->
XPath 用表达式识别 XML 文档里的位置和节点。文档根、元素、属性及文本在节点模型中各有定义。路径从某个上下文节点开始，经由若干步缩小范围，最后可选出一项或多项。

## 根、子元素和位置
<!-- sources: xpath -->
以 / 开头的绝对位置路径从文档根出发。每步可按名称寻找子元素，再用方括号里的谓词筛选。数字谓词 [1] 表示取当前位置序列中的第一项。在最常见的子元素轴上，位置按文档顺序从 1 开始。

:::example 选择第一条记录的文字
[输入]
\<notes>\<entry id="a">North\</entry>\<entry id="b">East\</entry>\</notes>
/notes/entry[1]/text()
[结果]
North
[说明]
从文档根选中 notes，再从它的 entry 子元素中取第一项，最后选取该元素的文本节点。
:::

## 属性与条件谓词
<!-- sources: xpath -->
@id 是属性轴的一种简写，表示当前元素的 id 属性。把它写进谓词，可以按属性条件筛选元素。末尾的 text() 选取直接文本子节点。需要元素及所有后代文字组成的字符串时，可在支持该返回类型的 XPath 环境中另做值转换。

:::example 通过属性精确定位记录
[输入]
\<notes>\<entry id="a">North\</entry>\<entry id="b">East\</entry>\</notes>
/notes/entry[@id="b"]/text()
[结果]
East
[说明]
谓词保留 id 为 b 的元素，text() 再取文本节点。
:::

## 后代查询与位置范围
<!-- sources: xpath -->
// 可跨越多层。谓词在路径中的位置决定参与过滤的节点范围。//i[1] 在各父节点下分别取首项，(//i)[1] 则先取得全部匹配，再选整体顺序中的第一项。

:::example 对各组分别编号
[输入]
\<r>\<g>\<i>A\</i>\<i>B\</i>\</g>\<g>\<i>C\</i>\<i>D\</i>\</g>\</r>
//i[1]/text()
(//i)[1]/text()
[结果]
第一条得到 A 和 C，第二条只得到 A。
[说明]
两个 g 各有一项满足第一条谓词。第二条的括号先合并所有 i，再应用位置条件。
:::

## 命名空间与返回类型
<!-- sources: xpath, ns, fixed -->
XML 元素和属性的名称可涉及命名空间 URI。查找带命名空间的元素时，表达式使用的前缀需要绑定到该 URI。XPath 1.0 的位置路径产生节点集，完整表达式还可能产生数字、布尔值或字符串。接收端若只接受节点集，即使 count(...) 语法有效，也无法直接以节点列出该数值。

## 常见误区
- XPath 的位置谓词与 JSONPath 数组下标的起点不同。
- text() 取得当前元素的直接文本节点，嵌套元素中的文字还需继续遍历或做值转换。
- 选择同名元素时，命名空间 URI 是判断名称的重要部分。
