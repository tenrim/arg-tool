---
capabilityId: native:escape-url
title: URL 百分号编码
topicGroup: encoding
summary: 解释 URI 中按字节书写的百分号编码、保留字符、表单空格和转义层次。
aliases:
  - Percent encoding
  - URL encode
  - URL decode
sources:
  - id: uri
    title: RFC 3986 — URI Generic Syntax
    publisher: IETF（南京大学镜像）
    url: https://mirrors.nju.edu.cn/rfc/rfc3986.html
    language: en
    kind: standard
    locator: 第 2.1–2.5 节
  - id: form
    title: WHATWG URL Standard
    publisher: WHATWG
    url: https://url.spec.whatwg.org/#application/x-www-form-urlencoded
    language: en
    kind: standard
    locator: 百分号编码和表单序列化
  - id: tool
    title: 转义格式与现有工具映射
    publisher: 迷雾工具箱
    url: /basics/foundation.js
    language: zh-CN
    kind: implementation
    locator: ESCAPES 与 foundationRecipe
---

## 介绍
<!-- sources: uri, form -->

百分号编码用 % 和两个十六进制数字记录一个字节。URL 的相应组件需要表达空格、非 ASCII 文本或可能与结构分隔符冲突的字节时，可以使用这种记法。百分号后的两位始终按十六进制计算。

## 从字符到字节
<!-- sources: uri, form, tool -->

使用 UTF-8 的场景中，先把文本变成字节，再对需要转义的字节写出 %HH。用百分号直接接一个完整的 Unicode 编号会占用错误的字节数。

:::example 多字节符号
[输入]
€，码点 U+20AC
[结果]
%E2%82%AC
[说明]
€ 的 UTF-8 表示是 E2 82 AC。输出中的三个百分号记号分别记录这三个字节。
:::

## 保留字符的语法位置
<!-- sources: uri, form -->

斜线、问号、井号、与号在不同 URL 组件中可能承担分隔作用。将它们作为组件内部的数据传送时，要结合所在位置转义。按组件解析以后再解码，有助于区分原来的分隔符与字段值。

:::example 同一值里的分隔符
[输入]
参数值 a&b=c
[结果]
a%26b%3Dc
[说明]
在查询串中，未转义的与号通常会分隔参数。这里让与号和等号都作为单个参数值里的数据。
:::

## URL 表单中的空格
<!-- sources: uri, form -->

普通的百分号解码将 %20 还原为空格，字面加号仍是加号。application/x-www-form-urlencoded 另规定以加号表示空格，字面加号本身则用 %2B。

:::example 同一字段的两种约定
[输入]
字段 q 的值为 A+B C
[结果]
按组件转义：A%2BB%20C
按 URL 表单序列化：q=A%2BB+C
[说明]
两种形式都保留原本的加号。只有表单序列化用加号代替空格。
:::

## 嵌套转义
<!-- sources: uri, form -->

%25 表示百分号本身。遇到 %252F 时，第一层解码得到 %2F。是否再将其解释为斜线取决于解出的内容是否明确承载第二层 URL 数据，随意重复解码会改变字段意义。

## 常见误区

- 每个 %HH 表示一个字节。字符要先按正确编码拆成字节。
- 加号只在相应表单规则下表示空格，普通百分号解码没有这一步。
- 在区分路径、查询和片段之前，把所有保留符号的转义都解开，可能改变 URL 的结构。
