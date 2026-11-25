---
capabilityId: op:HTML%20To%20Text
title: HTML 转文本
topicGroup: formats
summary: 这项转换把 HTML 内容作为普通字符串传递，保留标签、实体写法和源码换行。
aliases:
  - HTML To Text
  - HTML 源码转字符串
  - 标记原样输出
  - HTML 类型转换
sources:
  - id: html
    title: HTML Living Standard — Parsing HTML documents
    publisher: WHATWG
    url: https://html.spec.whatwg.org/multipage/parsing.html
    language: en
    kind: standard
    locator: 词法状态、标签和字符引用
  - id: dom
    title: DOM Standard
    publisher: WHATWG
    url: https://dom.spec.whatwg.org/
    language: en
    kind: standard
    locator: 节点文字内容的定义及 textContent
  - id: source
    title: HTMLToText.mjs（CyberChef 固定源码）
    publisher: GCHQ
    url: /vendor/knowledge/cyberchef/src/core/operations/HTMLToText.mjs
    language: en
    kind: implementation
    locator: 输入和输出类型以及恒等传递的 run
---

## 介绍
<!-- sources: source, html -->
HTML 可作为待解析的标记，也可作为普通字符串处理。这项类型转换把原标记文本交给后续文字操作，字符串里的起止标签、注释和换行保留下来。用于读取源码本身时，标记的拼写和位置都可能是线索。

## 字符串原样传递
<!-- sources: source -->
转换只改变后续步骤理解数据的方式。输入含尖括号时，输出字符串仍含尖括号。字符串可继续按字符位置读取、比较或编码。

:::example 保留标签和字符引用
[输入]
\<p>A &amp; B\</p>
[结果]
\<p>A &amp; B\</p>
[说明]
标签、空格以及 &amp; 的五个字符均保留。
:::

## 源码换行与页面布局
<!-- sources: source, html -->
源码换行是字符串中的字符。浏览器按文档与样式规则呈现段落，两者的行数可以不同。原样转换保留源码中的现有换行，也不会因为遇到段落标签而自动另加换行。

:::example 原样保留两行
[输入]
\<p>A\</p>
\<p>B\</p>
[结果]
\<p>A\</p>
\<p>B\</p>
[说明]
两行之间仍只有输入中的那个换行。
:::

## 注释及其他标记
<!-- sources: html, source -->
注释属于源码的一部分。浏览器解析后会建立注释节点，读取元素的普通文字内容时通常不包含它。源码形式下可像处理其他文本一样检索注释及其位置。

:::example 在文本表示中保留注释
[输入]
\<!--note-->\<span>ABC\</span>
[结果]
\<!--note-->\<span>ABC\</span>
[说明]
连续的注释和元素标记均按原样传递，没有新增分隔字符。
:::

## 源码与节点文字
<!-- sources: dom, html, source -->
若要提取人读的正文，可从解析后的元素树中获取文本节点，字符引用也会按解析规则还原。若要检查原始符号、注释或元素标签，应保留源码字符串。同一份材料可有两种表示，分别适合查找显示文字和校对标记。

## 常见误区
- 转换后仍会出现标签和注释，原样保留正是该操作的用途。
- 字符引用保持原有写法，得到实际字符需要另行解析。
- 输入文本中的空白与浏览器最终的视觉换行是不同层次的信息。
