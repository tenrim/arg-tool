---
capabilityId: native:escape-html
title: HTML 实体
topicGroup: encoding
summary: 介绍命名和数字字符引用、上下文差异以及一次字符引用解析的边界。
aliases:
  - HTML 字符引用
  - HTML entities
sources:
  - id: html
    title: HTML Living Standard — Character references
    publisher: WHATWG
    url: https://html.spec.whatwg.org/multipage/syntax.html#character-references
    language: en
    kind: standard
    locator: 第 13.1.4 节
  - id: parser
    title: HTML Living Standard — Parsing HTML documents
    publisher: WHATWG
    url: https://html.spec.whatwg.org/multipage/parsing.html#character-reference-state
    language: en
    kind: standard
    locator: 字符引用、命名与数字引用状态
  - id: names
    title: HTML Living Standard — Named character references
    publisher: WHATWG
    url: https://html.spec.whatwg.org/multipage/named-characters.html
    language: en
    kind: standard
    locator: 官方名称对照表
  - id: tool
    title: 转义格式与现有工具映射
    publisher: 迷雾工具箱
    url: /basics/foundation.js
    language: zh-CN
    kind: implementation
    locator: ESCAPES 与 foundationRecipe
---

## 介绍
<!-- sources: html, names -->

HTML 字符引用是标记文档中书写字符的办法。以与号开头、以分号结束的记号，可以引用具有名字的字符，也可以用十进制或十六进制写出 Unicode 码点。它在解析过程中形成文本数据。

## 命名、十进制和十六进制
<!-- sources: html, names -->

命名字符引用按官方表核对大小写。十进制数字引用使用 &# 作为前缀，十六进制引用在其后再加 x。命名引用表有少数名称对应一段码点序列，而非单个码点。

:::example 三种写法指向同一字符
[输入]
&lt;
&#60;
&#x3C;
[结果]
三个输入均得到 U+003C 小于号
[说明]
60 与十六进制 3C 是同一数值。命名表中的 lt 指向这个码点。
:::

## 数值范围与兼容处理
<!-- sources: html, parser -->

HTML 数字字符引用面向 Unicode 码点。解析器处理越界数值和代理区时会产生错误，并可能使用替换字符。规范还为部分控制区数值定义了历史兼容映射。

:::example 有效和超范围的引用
[输入]
&#x20AC; 与 &#x110000;
[结果]
第一个为 €
第二个在 HTML 解析时为 U+FFFD
[说明]
20AC 是欧元符号码点。110000 超出 Unicode 的编号空间。
:::

## 解析层与文字显示
<!-- sources: parser, names, tool -->

解析字符引用后，结果进入文本。当前层不会把刚刚生成的与号重新当成新引用的起点。若文本外还包着一层单独的标记，需要明确分开每层输入。

:::example 一次读取保留内层的转义拼写
[输入]
&amp;lt;
[结果]
&lt;
[说明]
第一层读取 amp 得到字面与号，后面的 lt; 仍是普通文字。只有后续另一次字符引用解析才能得到小于号。
:::

## 上下文与分号
<!-- sources: html, parser -->

普通正文与属性值中的旧式无分号写法有不同的接受条件。写出分号能够显式结束名称，避免因相邻字母、数字或等号而改变解析边界。脚本和某些原始文本状态也使用不同读取规则。

## 常见误区

- 数字引用写的是码点。一个多字节字符不需要把每个 UTF-8 字节分别写成引用。
- 外观可读的转义文本和解析后的文字是两层数据。比较时应说清在哪一层。
- 省略分号所依赖的兼容行为会随上下文变化，处理新文档时应写完整。
