---
capabilityId: native:it-formats
title: MIME 与字符集资料
topicGroup: technical
summary: 区分文件名后缀、可声明的媒体类型和文本字节编码。
aliases:
  - MIME
  - charset
  - UTF-8
  - application/json
  - text/plain
sources:
  - id: media
    title: Media Types
    publisher: IANA
    url: https://www.iana.org/assignments/media-types
    language: en
    kind: standard
    locator: 媒体类型登记
  - id: charsets
    title: Character Sets
    publisher: IANA
    url: https://www.iana.org/assignments/character-sets
    language: en
    kind: standard
    locator: 名称、MIBenum 和别名
  - id: json
    title: "RFC 8259: JSON"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc8259.html
    language: en
    kind: standard
    locator: 第 8.1 节编码及第 11 节类型登记
  - id: semantics
    title: "RFC 9110: HTTP Semantics"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc9110.html
    language: en
    kind: standard
    locator: 第 5、8、10、11、15 节
  - id: model
    title: IT 静态资料查询
    publisher: 迷雾工具箱
    url: /it-reference/model.js
    language: zh-CN
    kind: implementation
    locator: searchITRecords、normalizeDomainInput 和 matchPublicSuffix
---

## 介绍
<!-- sources: media, charsets -->
MIME 媒体类型描述内容格式。字符编码用于把一组文本字节还原为字符。文件扩展名是文件名中的约定，常用来提示前两者可能采用的标准。

## 类型、子类型和参数
<!-- sources: media, semantics -->
媒体类型在斜线前后分别给出类型和子类型，并可通过分号引出参数。字符编码通常在相关文本类型的 charset 参数中声明。

:::example 纯文本的编码声明
[输入]
Content-Type: text/plain; charset=utf-8
[结果]
类型 text，子类型 plain，charset 为 UTF-8
[说明]
前两段标记表示的格式，分号后的参数标记字符编码。
:::

## 字符编码的名称与别名
<!-- sources: charsets, model -->
登记的字符编码可能有规范名称、名称别名和一项数字编号。一种编码可以接受多种名称。读文本时应将使用的字符编码和实际字节对应起来。

:::example 查 UTF-8 的别名
[输入]
CSutf8
[结果]
命中 UTF-8，MIBenum 为 106
[说明]
IANA 列出的 csUTF8 是同一记录的别名，搜索匹配不区分大小写。
:::

## 文件名与格式解析
<!-- sources: media, json, model -->
扩展名可以同时指向多个候选类型。要验证内容，通常需检查签名或尝试解析。公共系统交换 JSON 时采用 UTF-8，application/json 的登记没有单独的 charset 参数定义。

:::example JSON 文件的命名线索
[输入]
.json
[结果]
查到 application/json
[说明]
登记工具归类名称线索，而文件的具体字节仍需用 JSON 解析器校验。
:::

## 内容编码所在的层次
<!-- sources: semantics, media -->
Content-Encoding 指出在表示上施加的编码，如 gzip 压缩。按 HTTP 指定的次序去掉压缩后，再以 Content-Type 所表示的媒体类型及字符集解析内容。

## 常见误区

- 改扩展名不转换内容。
- UTF-8 与 text/plain 的登记回答不同问题。
- gzip 压缩与文本字符编码可在一份响应中同时出现。
- 数据库匹配到的后缀不能证明所给文件可解析。
