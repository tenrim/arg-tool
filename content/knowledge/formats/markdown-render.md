---
capabilityId: op:Render%20Markdown
title: 渲染 Markdown
topicGroup: formats
summary: 将标题、列表和行内标记转换为页面结构，区分文本、代码与 HTML 显示。
aliases:
  - Markdown
  - CommonMark
sources:
  - id: spec
    title: CommonMark Spec 0.31.2
    publisher: John MacFarlane／CommonMark
    url: https://spec.commonmark.org/0.31.2/
    language: en
    kind: standard
    locator: 第 4、5、6 节段落、列表、强调及代码
  - id: md
    title: markdown-it README
    publisher: markdown-it 项目
    url: https://github.com/markdown-it/markdown-it
    language: en
    kind: official-doc
    locator: CommonMark、html、linkify 和 highlight
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的处理规则和声明边界
---

## 介绍
<!-- sources: spec, md -->

Markdown 用平文本中的短标记描述排版，转换时先将行按结构分成标题、列表和段落，再处理每个块内部的强调、链接和代码跨度。

## 块结构和空行
<!-- sources: spec, chef -->

行首井号后跟空格可以形成标题。空行划开后续独立的段落。块和行内标记一起确定渲染层次。

:::example 标题与强调并存
[输入]
# Example

**strong**
[结果]
一级标题 Example，下一段用加粗显示 strong
[说明]
标题和强调分别属于块级与行内解析。
:::

## 列表与嵌套
<!-- sources: spec, md -->

减号等行首标记可开启项目，缩进和空白决定后续行是否属于同一项目或更深一层列表。逐字符替换减号不能得到可靠结构。

:::example 两条列表项
[输入]
- A
- B
[结果]
一个无序列表，包含 A 与 B 两项
[说明]
各行都符合项目起始标记。
:::

## 代码与原始标签
<!-- sources: spec, md, chef -->

行内反引号界定代码文本，普通标记在其中不会被解析为强调或链接。对应操作关闭输入 HTML 的渲染，原始标签作为可见字符显示。

:::example 将标签当作文本
[输入]
\\<b>bold?\\</b>
[结果]
显示原样的开标签、bold? 和闭标签
[说明]
不会启动浏览器的加粗标签。
:::

## 不同方言和发布环境
<!-- sources: spec, md, chef -->

自动链接和高亮属于可改变显示的选项。表格等扩展并非所有 Markdown 规则都定义一致；正式发布时需要确认目标平台的解释，不要只比对网页颜色。

## 常见误区

- 文本有 Markdown 外观不一定能形成有效块。
- 代码跨度里的符号通常按内容显示。
- CommonMark 和所有扩展写法的覆盖范围不完全相同。

