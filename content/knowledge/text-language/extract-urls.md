---
capabilityId: op:Extract%20URLs
title: 提取网址
topicGroup: text-language
summary: 从文本定位带协议的常见网址，保留可用的原始字符与边界。
aliases:
  - Extract URLs
  - 网址提取
  - URL 候选
  - 链接整理
sources:
  - id: uri
    title: RFC 3986 — URI Generic Syntax
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc3986.html
    language: en
    kind: official-doc
    locator: §§2.1、3，百分号编码及五类字段
  - id: url
    title: URL Living Standard
    publisher: WHATWG
    url: https://url.spec.whatwg.org/
    language: en
    kind: standard
    locator: URL parsing，host、path、query 和 fragment
  - id: engine
    title: CyberChef Regex 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Regex.js
    language: en
    kind: implementation
    locator: Extract URLs，协议、域名、端口与路径
---

## 介绍
<!-- sources: uri, url, engine -->

网址提取阅览一段文字，找出在其中出现的完整链接或看似链接的片段。常见 HTTP 地址由方案、主机以及可选端口、路径、查询和片段组成。提取为字面值，便于和材料上记载的实际链接逐个比较。

## 路径、查询和片段
<!-- sources: uri, url -->

`https://example.org/a?part=2#clue` 的主机为 example.org，路径为 /a，查询为 part=2，片段为 clue。百分号编码表示某个字节，例如 `%20` 是十六进制 20。分隔符在某个字段里可能具备特别语义，识别网址边界和解码各字段应分别处理。

## 文本匹配与解析范围
<!-- sources: uri, url, engine -->

规范可表示 IPv6 主机、没有显式路径的查询和多种方案。固定提取规则偏向有方案、有点分主机的链接，其路径分支需从斜线开始。这使它适合从普通文字读一批链接，同时会漏掉部分规范有效的网址或只返回前缀。

## 内嵌链接的例子
<!-- sources: uri, url, engine -->

结果保持原文的百分号写法和大小写。逐个比较匹配范围可以看出标点、查询和端口如何影响提取。

:::example 正文中的链接和句末标点
[输入]
Go https://example.com/a?x=1#note, then https://example.org/path.
[结果]
https://example.com/a?x=1#note
https://example.org/path
[说明]
查询和片段均在路径之后。末尾逗号、句点在这个输入中没有进入链接候选。
:::

:::example 同样查询有无斜线
[输入]
https://example.com?x=1 https://example.com/?x=1 https://[2001:db8::1]/a
[结果]
https://example.com
https://example.com/?x=1
[说明]
无斜线路径时规则停在主机末尾。方括号中的 IPv6 主机符合规范，但这组输入里未被提取。
:::

:::example 编码文本与端口
[输入]
https://example.com/a%20b https://example.com:8080/path bare.example.com
[结果]
https://example.com/a%20b
https://example.com:8080/path
[说明]
百分号转义保持原样，冒号后的 8080 属于端口。没有方案的第三项未返回。
:::

## 结果的后续核对
<!-- sources: uri, url, engine -->

若链接后面的变量、片段编号或路径末尾符号也是线索，应复查原文中紧邻链接的内容。识别到网址只说明文字具有可解释的结构。判断资源是否存在、已跳转或者需要鉴权属于后续单独的检查。

## 常见误区

- 提取出主机时，原输入中的查询未必被完整保留。
- 原文中的句点可能是标点，也可能属于路径，应结合上下文判断。
- 片段属于 URL 的一部分，保留在文本里不保证它作为请求路径发送。

