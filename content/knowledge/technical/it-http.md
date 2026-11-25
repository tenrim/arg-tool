---
capabilityId: native:it-http
title: HTTP 状态与字段资料
topicGroup: technical
summary: 按状态码类别、字段语义和消息上下文解读 HTTP 响应。
aliases:
  - HTTP
  - 404
  - 200
  - Content-Type
  - Location
  - 标头
sources:
  - id: semantics
    title: "RFC 9110: HTTP Semantics"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc9110.html
    language: en
    kind: standard
    locator: 第 5、8、10、11、15 节
  - id: codes
    title: HTTP Status Code Registry
    publisher: IANA
    url: https://www.iana.org/assignments/http-status-codes
    language: en
    kind: standard
    locator: 已分配状态码及引用规范
  - id: fields
    title: HTTP Field Name Registry
    publisher: IANA
    url: https://www.iana.org/assignments/http-fields
    language: en
    kind: standard
    locator: HTTP 字段状态及引用规范
  - id: model
    title: IT 静态资料查询
    publisher: 迷雾工具箱
    url: /it-reference/model.js
    language: zh-CN
    kind: implementation
    locator: searchITRecords、normalizeDomainInput 和 matchPublicSuffix
---

## 介绍
<!-- sources: semantics, codes, fields -->
HTTP 消息由请求或响应的控制数据、字段及可能存在的内容组成。响应的三位状态码表示处理结果，字段提供媒体类型、位置、缓存等信息。

## 类别与具体状态
<!-- sources: semantics, codes -->
状态码首位区分信息、成功、重定向、客户端错误和服务端错误。具体码之间仍有差别。204 是成功且没有内容，404 表示没有目标的当前表示，或服务端不愿透露它存在。

:::example 成功而无内容
[输入]
HTTP/1.1 204 No Content
[结果]
请求已成功处理，响应没有内容
[说明]
204 属于 2xx 成功类。
:::

## 字段的名称与用法
<!-- sources: semantics, fields -->
字段名不区分大小写。字段值的解析规则由字段各自规定。Content-Type 描述媒体类型，Location 在部分响应中指明重定向目标或刚创建的资源位置。

:::example 读临时跳转的地址
[输入]
HTTP/1.1 302 Found
Location: /next
[结果]
临时重定向，目标为相对于原地址的 /next
[说明]
状态码提供重定向含义，字段提供目的地址。
:::

## 条件请求和缓存
<!-- sources: semantics, fields -->
客户端可带上已有表示的验证信息，例如 ETag。若条件请求验证资源仍可使用，服务器可能返回 304，客户端可按缓存规则更新元数据并继续读已有表示。

:::example 缓存验证
[输入]
有本地副本的条件 GET 收到 304 Not Modified
[结果]
没有新正文，可验证使用缓存副本
[说明]
304 表示验证结果，这份响应不会另带一份表示正文。
:::

## 查询登记与读取现场响应
<!-- sources: semantics, codes, model -->
搜索状态码或字段名可得到协议语义及登记来源。分析实际消息时还应记录方法、字段值、是否带内容和请求上下文。固定登记中的临时状态也要核对有效期。

## 常见误区

- 同属于成功类的 200 和 204 可以有不同的正文规则。
- 字段名的大小写规则不等同于字段值的规则。
- Location 还可用于指明新建资源的位置。
- 单凭 404 无法判断资源过去是否存在。
