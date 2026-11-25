---
capabilityId: op:CSS%20selector
title: CSS 选择器
topicGroup: formats
summary: CSS 选择器描述要匹配的元素，能组合标签、类、属性和值以及元素之间的结构关系。
aliases:
  - CSS selector
  - CSS 查询
  - DOM 元素匹配
  - 属性选择器
sources:
  - id: selectors
    title: Selectors Level 4
    publisher: W3C
    url: https://www.w3.org/TR/selectors-4/
    language: en
    kind: standard
    locator: 第 6、14、17 节，属性、组合符和匹配
  - id: dom
    title: DOM Standard
    publisher: WHATWG
    url: https://dom.spec.whatwg.org/
    language: en
    kind: standard
    locator: 选择器匹配、后代文本内容和 textContent
  - id: fixed
    title: CyberChef 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: CSS selector，从解析所得节点返回匹配元素的标记文本
---

## 介绍
<!-- sources: selectors, dom -->
CSS 选择器可以从文档树中选出满足条件的元素。类型名匹配元素名称，类选择器检查 class，属性选择器检查属性。多个条件还可通过组合符描述元素之间的父子、后代或相邻关系。

## 直接子元素与后代
<!-- sources: selectors, dom -->
空白组合符可越过若干层后代。大于号组合符只接受直接父子。一段文档若包含多层容器，选用的组合符决定是否取得内层的元素。

:::example 只取 main 下一级的段落
[输入]
\<main>\<p id="a">A\</p>\<div>\<p id="b">B\</p>\</div>\</main>
main > p
[结果]
\<p id="a">A\</p>
[说明]
a 的直接父元素是 main。b 属于里面的 div，换用 main p 才会同时选中两项。
:::

## 同一元素上的组合条件
<!-- sources: selectors -->
多个简单选择器紧贴书写时，表示同一个元素必须同时满足这些条件。若在它们之间加空白，解释就变为两层元素的结构关系。类名在 class 的空白分隔词中逐项匹配。

:::example 同时具有两个类名
[输入]
\<p class="tag urgent">A\</p>\<p class="tag">B\</p>
p.tag.urgent
[结果]
\<p class="tag urgent">A\</p>
[说明]
首段同时具备 tag 和 urgent，第二段缺少 urgent。
:::

## 属性和值
<!-- sources: selectors, dom -->
方括号可测试属性是否存在，或按操作符比较其值。等号测试完整属性值，其他操作符能表达前缀、后缀或词匹配。大小写行为还取决于文档语言与属性具体规则。

:::example 按自定义属性选择
[输入]
\<p data-key="east">A\</p>\<p data-key="west">B\</p>
[data-key="east"]
[结果]
\<p data-key="east">A\</p>
[说明]
第一段的 data-key 完整值等于 east。
:::

## 节点和查询环境
<!-- sources: selectors, dom, fixed -->
选择器查询的是解析后的元素树。匹配的元素可以被序列化成标记文本，也可由调用方读取其中的属性或文字。交互状态与伪元素需要特定环境，静态文档查询时能否判断取决于查询引擎和输入。

## 常见误区
- main p 会匹配不同层级的后代，main > p 只匹配直接子元素。
- .tag.urgent 要求一个元素具备两个类；.tag .urgent 要求两个不同层级的元素。
- 匹配到一个元素后，返回的标记可能包含其后代，未必只有裸文字。
