---
capabilityId: op:XML%20Beautify
title: 格式化 XML
topicGroup: formats
summary: XML 排版用缩进显示元素的嵌套关系。排版前须区分标记间空白、元素中的字符数据与验证规则。
aliases:
  - XML Beautify
  - XML 美化
  - XML 缩进
  - XML 元素排版
sources:
  - id: xml
    title: Extensible Markup Language (XML) 1.0
    publisher: W3C
    url: https://www.w3.org/TR/xml/
    language: en
    kind: standard
    locator: 第 2.6、2.10、3 节，处理指令、空白和元素
  - id: infoset
    title: XML Information Set
    publisher: W3C
    url: https://www.w3.org/TR/xml-infoset/
    language: en
    kind: standard
    locator: 第 2.2、2.6、2.8 节，元素、字符和注释信息项
  - id: fixed
    title: CyberChef 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: XML Beautify，标签边界与缩进处理
---

## 介绍
<!-- sources: xml, infoset -->
XML 文档用开始标签、结束标签和空元素标签表示结构。缩进能帮读者辨识根元素、同级元素和子元素。能排成多行并不足以证明文档满足 XML 的结构或所有业务规则。

## 元素层级与缩进
<!-- sources: xml, fixed -->
成对的标签界定元素范围。元素进入下一层时通常加一层缩进，离开该元素时回到上层。只有单段文字的简单元素可在同一行保留起止标签，避免把新空白写进文字内部。

:::example 展开两个同级元素
[输入]
\<notes>\<entry>North\</entry>\<entry>East\</entry>\</notes>
[结果]
\<notes>
  \<entry>North\</entry>
  \<entry>East\</entry>
\</notes>
[说明]
两个 entry 都直接属于 notes，所以采用同一缩进。
:::

## 声明、空元素和注释
<!-- sources: xml, infoset, fixed -->
XML 声明说明版本等文档信息，注释放在文档允许的位置，空元素标签本身就结束该元素。编排材料时，可以把这三种结构分行，方便区分它们和普通开始、结束标签。

:::example 展开含声明和注释的片段
[输入]
\<?xml version="1.0"?>\<r>\<x id="a"/>\<!--note-->\<y />\</r>
[结果]
\<?xml version="1.0"?>
\<r>
  \<x id="a"/>
  \<!--note-->
  \<y />
\</r>
[说明]
x 和 y 都是 r 中的空元素，注释按原有位置保留。
:::

## 混合内容中的有效空白
<!-- sources: xml, infoset -->
一段文字中插有行内子元素时，前后空白可能参与句子内容。xml:space 可表示期望保留空白。对这些元素添加新行或缩进，可能改变后续程序读到的文本。CDATA 与字符引用也须按它们各自的语法辨认。

:::example 字符引用与字面文本
[输入]
\<r>Tom &amp; Ada\</r>
[结果]
排版仍写作 \<r>Tom &amp; Ada\</r>，解析出的元素文本为 Tom & Ada。
[说明]
&amp; 需要在 XML 文本中表示 &，正确排版会保留字符引用的字面形式。
:::

## 结构验证与原件保存
<!-- sources: xml, fixed -->
良构检查要求标签正确嵌套，并要求开始与结束名称相符。业务格式还可要求特定字段及其属性。个别排版器仍可能为有错配的字符串生成缩进，因此排版结果应和解析或验证结果分别使用。

## 常见误区
- 对齐良好的缩进不能证实标签良构，也不能证实结构满足业务格式。
- 插入新的空白可能改变混合内容的文字。
- 注释、声明和空元素可分别出现在同级位置，它们的语法作用不同。
