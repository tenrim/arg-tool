---
capabilityId: op:Strip%20HTML%20tags
title: 移除 HTML 标签
topicGroup: formats
summary: 去标签从标记源码中移除标签片段。标签间的空格、换行和字符引用有各自的来源，不能从标签名称自动恢复页面排版。
aliases:
  - Strip HTML tags
  - HTML 去标签
  - 去除标记
  - 提取原始文字
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
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Strip HTML tags 的标记查找与可选空白处理
---

## 介绍
<!-- sources: html, fixed -->
HTML 源码以标签描述元素，用文本节点记录许多可见文字。简单的去标签操作删除标记片段后拼接剩余字符，适用于结构明确、标签简单的文本片段。输出受到原始源码里的空白和字符引用书写影响。

## 标签边界与剩余文字
<!-- sources: html, fixed -->
开始标签和结束标签位于文字前后，属性则写在开始标签内。直接删除这些边界时，里面的普通文字继续保留。元素名称和属性值属于标记语法，在简单去除后不会出现在剩余文字里。

:::example 去掉包围文字的标签
[输入]
\<p>Go \<b>north\</b>\</p>
[结果]
Go north
[说明]
开始和结束标签都被移除。Go 后面的空格原本就在源码里，因而保留。
:::

## 段落边界与源文件换行
<!-- sources: dom, fixed -->
直接拼接剩余文字时，连续标签之间没有源文件空格就不会自动插入分隔字符。浏览器显示段落通常涉及元素对应的布局规则。两段文字有时会在去标签后连接成一行。

:::example 段落标记未留下分隔
[输入]
\<p>A\</p>\<p>B &amp; C\</p>
[结果]
AB &amp; C
[说明]
两个段落的标签之间没有原始换行。源文件里的空白若实际存在，则会由当前空白规则保留或清理。
:::

## 字符引用和属性边界
<!-- sources: html, fixed -->
字符引用写在文本里，形如 &amp;，浏览器解释时可产生 &。仅去标签通常会原样保留这串字符。完整 HTML 解析器还会跟踪引号内部的属性值，例如识别其中的大于号。只用文字模式寻找尖括号的处理可能误分标签。

:::example 带引号的属性触及简单规则的边界
[输入]
\<div data-name="A > B">T\</div>
[结果]
 B">T
[说明]
简单去除在属性值中的第一个大于号提前结束。按 HTML 语法完整解析后，元素的文字是 T。
:::

## 结构化提取与结果核对
<!-- sources: html, dom -->
文档解析后，可以从指定元素按树顺序读取它的文字后代，或按规则保留段落。含复杂属性、实体、缺失标签或嵌套结构时，这种方法更适合重建正文。提取结果也可与原始源码逐段对应，以说明丢弃哪些元素信息。

## 常见误区
- 清除标签后可能仍有 &amp; 等字符引用。
- 标签之间没有原始分隔字符时，相邻文字可能相连。
- 简单的去标签适合文字提取，不能作为保留标记的安全净化流程。
