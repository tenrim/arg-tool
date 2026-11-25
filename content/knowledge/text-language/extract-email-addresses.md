---
capabilityId: op:Extract%20email%20addresses
title: 提取邮箱地址
topicGroup: text-language
summary: 从原文匹配邮箱地址候选，并核对本地部分和域部分的范围。
aliases:
  - Extract email addresses
  - 邮箱提取
  - 电子邮件地址
  - addr-spec
sources:
  - id: mail
    title: RFC 5322 — Internet Message Format
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc5322.html
    language: en
    kind: official-doc
    locator: §3.4.1，addr-spec、本地部分、引号与域字面量
  - id: eai
    title: RFC 6531 — SMTP Extension for Internationalized Email
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc6531.html
    language: en
    kind: official-doc
    locator: §3.3，国际化邮箱的语法扩展
  - id: engine
    title: CyberChef Regex 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Regex.js
    language: en
    kind: implementation
    locator: Extract email addresses，大小写保留与地址模式
---

## 介绍
<!-- sources: mail, engine -->

邮箱提取在文字中查找符合邮件地址模式的片段。一个普通地址由 @ 两侧的本地部分和域构成。在邮件头里，还可能有显示名、注释以及包含邮箱的括号，这些外围内容与邮箱地址本身分开表示。

## 本地部分与域部分
<!-- sources: mail, eai -->

常见本地部分使用一个或多个以点分隔的原子，部分系统使用加号附加分类标记。邮件语法还容纳带引号的本地部分和方括号包围的域字面量。采用国际化扩展时，协议也可以接受满足条件的非 ASCII 地址。

## 匹配范围和语义判断
<!-- sources: mail, eai, engine -->

固定模式从长文本连续寻找可能的子串。若不合法的原字段中恰好有后缀符合模式，仍可能拿到部分地址。保存原行便于区别完整地址和规则截取的短串。邮件地址是否接受投递还取决于域和服务器实际配置。

## 地址样例
<!-- sources: mail, engine -->

下面的地址只作实例。逐例核对原文前后的标点、空格及连续点号，可以确认提取匹配哪些部分。

:::example 加号和句末点
[输入]
Contact demo+tag@example.org; demo@example.org.
[结果]
demo+tag@example.org
demo@example.org
[说明]
加号连同后面的 tag 属于本地部分。第二项的尾点在这个输入中被保留在候选之外。
:::

:::example 大小写与引号
[输入]
demo@example.org DEMO@EXAMPLE.ORG "a b"@example.org
[结果]
demo@example.org
DEMO@EXAMPLE.ORG
[说明]
两项的原大小写均保留。带空格的引号样例有邮件语法依据，但未被这一提取器返回。
:::

:::example 连续点和域字面量
[输入]
a..b@example.org a@[192.0.2.5] not@localhost demo@example.org.cn
[结果]
b@example.org
a@[192.0.2.5]
demo@example.org.cn
[说明]
第一项只匹配到了后缀。后一项的域字面量保留方括号，单标签 localhost 未获得匹配。
:::

## 线索清单中的保真
<!-- sources: mail, eai, engine -->

提取列表有助于按域或文档出现顺序整理记录。若对地址进行统一大小写或删除加号标签，应先确认哪部分允许这样处理。地址规范和服务商规则各有边界，原始拼法与整理后的写法适合同时保存以便核对。

## 常见误区

- 候选在语法上可读，也可能不存在对应邮箱。
- 加号标签的效果由收信系统决定，不能自动把所有带标签的地址合并。
- 带引号的地址和国际化邮箱可能超出普通文字提取器的覆盖范围。

