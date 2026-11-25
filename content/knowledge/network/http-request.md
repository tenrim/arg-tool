---
capabilityId: op:HTTP%20request
title: HTTP 请求
topicGroup: network
summary: 在浏览器中发送 HTTP 请求，读取可访问的响应状态、字段与正文。
aliases:
  - HTTP request
  - HTTP 请求
  - GET
  - POST
  - CORS
sources:
  - id: semantics
    title: "RFC 9110: HTTP Semantics"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc9110.html
    language: en
    kind: standard
    locator: 第 5、8、10、11、15 节
  - id: fetch
    title: Fetch Standard
    publisher: WHATWG
    url: https://fetch.spec.whatwg.org/#http-cors-protocol
    language: en
    kind: standard
    locator: CORS、过滤的响应和请求方法
  - id: chef
    title: CyberChef · HTTP request
    publisher: GCHQ / CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 方法、目标 URL、字段与响应元数据
---

## 介绍
<!-- sources: semantics, fetch -->
HTTP 请求由方法、目标、字段和方法允许时的内容组成。接收方将处理结果写成状态码及相应的字段和内容。工具通过浏览器连接目标网址并返回能访问的响应。

## 方法定义处理意图
<!-- sources: semantics, chef -->
GET 一般用于取得表示，HEAD 请求与 GET 对应的元数据而没有正文，POST 表示把请求内容提交给目标来处理。发送内容前要确定方法允许正文以及服务如何解释它。

:::example 读取一个文本响应
[输入]
GET https://message.test/ok（模拟服务）
[结果]
OK
[说明]
模拟服务返回 200 与正文 OK。只看正文模式时显示 OK。
:::

:::example 读取无正文的响应
[输入]
HEAD https://message.test/ok（模拟服务），显示响应元数据
[结果]
状态 200，可见头含 content-type: text/plain，正文为空
[说明]
HEAD 成功仍可保留元数据。
:::

## 正文与响应状态
<!-- sources: semantics, chef -->
无论状态表示成功还是错误，服务端都可能发送文本。解读时应把状态和正文放在一起，避免把错误页面或说明文本当成目标表示。

:::example 404 可以附有内容
[输入]
GET https://message.test/notfound（模拟服务），显示响应元数据
[结果]
状态 404，正文 Missing
[说明]
404 表明服务端不能提供所找表示，仍可返回解释。
:::

## 跨域读取和可见字段
<!-- sources: fetch, chef -->
跨域资源共享（CORS）用响应字段决定页面可访问哪些跨域结果。部分字段被允许读取，其他字段可由服务端显式公开。不透明响应只向脚本暴露有限的状态，跨域采用 No CORS 模式时通常无法读取原始内容。

:::example 不透明的跨域响应
[输入]
GET https://message.test/ok（模拟服务），选择 No CORS
[结果]
操作报告 Null response
[说明]
网络请求取得响应与脚本可以读取内容是两件事。
:::

## 传输结果的判断
<!-- sources: semantics, fetch -->
网络、URL 协议、浏览器安全策略和应用返回的状态处在不同层次。排查时可先确认浏览器是否取得可读响应，再解释 HTTP 状态及正文。请求确实可能将输入发送给服务端。

## 常见误区

- 返回文本不表示状态码必定为 200。
- HEAD 的空正文通常符合命令语义。
- 不透明响应不会公开目标返回的完整正文。
- 目标网址、字段及允许的正文都是发给目标服务的信息。
