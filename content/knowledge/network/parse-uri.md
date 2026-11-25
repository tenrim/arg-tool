---
capabilityId: op:Parse%20URI
title: 解析 URI
topicGroup: network
summary: 分开读取 URI 的方案、主机、端口、路径、查询与片段，保持组件间的边界。
aliases:
  - Parse URI
  - URL 解析
  - 统一资源标识符
sources:
  - id: uri
    title: "RFC 3986 Uniform Resource Identifier (URI): Generic Syntax"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc3986
    language: en
    kind: standard
    locator: 第 2、3、4、5 节，保留符号、组件、相对引用
  - id: engine
    title: CyberChef 11.5.0 URL 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/URL.js
    language: en
    kind: implementation
    locator: Parse URI 的字段与查询参数输出
---

## 介绍
<!-- sources: uri, engine -->
URI 用一串字符标识资源。常见网页地址可以包含方案、权威部分、路径、查询和片段；并非每种 URI 都具备这些组件。解析将各字段拆开以便阅读。

## 通用组件的边界
<!-- sources: uri -->
方案后跟冒号。具有权威部分的 URI 用双斜杠引出这一段，可能包含主机和端口。斜杠常划分路径的段，问号引出查询，井号引出片段。相对引用没有完整的方案和主机，需要基准 URI 才能得到目标。

## 百分号和重复的查询键
<!-- sources: uri, engine -->
百分号后两位十六进制表示一个字节。若保留符号被编码成像 %2F 一样的形式，贸然解码再拆分可能把数据斜杠变成路径的分隔符。查询里的键和值采用应用自己的约定，重复键可表示多个值。本工具的展示会把同名值列在同一字段内。

## 典型组件实例
<!-- sources: uri, engine -->
以下均为结构例子，域名使用示例用途。解析时可以逐一核对字段。

:::example 带端口、查询和片段
[输入]
https://example.org:8443/docs?q=red%20blue&lang=fr#intro
[结果]
方案 https，主机 example.org，端口 8443，路径 /docs，查询 q 为 red blue、lang 为 fr，片段 #intro
[说明]
%20 在查询值中表示空格，#intro 位于查询之后。
:::

:::example 路径中的保留符号和重复键
[输入]
https://example.org/a%2Fb?x=1&x=2#part
[结果]
路径 /a%2Fb，x 显示为 1,2，片段 #part
[说明]
路径保留已编码的斜杠，查询值按同名键并列，原始字符串仍能区分各次出现。
:::

:::example 不含主机的相对引用
[输入]
../img/icon.png?size=2#top
[结果]
路径 ../img/icon.png，参数 size=2，片段 #top
[说明]
引用没有给出方案或主机，需由使用它的文档提供基准。
:::

## 标识、解析与访问
<!-- sources: uri, engine -->
按结构拆分适用于查看文本里的链接；输入中标明某个方案，不代表资源已经访问到。不同方案可规定专门的解释方式，分析带地区、域名或端口的材料时应保留原始字符串。

## 常见误区
- 相对引用单独出现时不能确定完整目标。
- 查询和片段是两部分，井号之后的内容不属于查询。
- URI 的通用语法没有规定所有查询键的业务含义。
