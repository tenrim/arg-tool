---
capabilityId: op:DNS%20over%20HTTPS
title: 通过 HTTPS 查询 DNS
topicGroup: network
summary: 在 HTTPS 传输中查询 DNS，并分别读取传输结果、记录类型和域名应答。
aliases:
  - DNS over HTTPS
  - DoH
  - DNS 解析
sources:
  - id: doh
    title: "RFC 8484: DNS Queries over HTTPS"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc8484.html
    language: en
    kind: standard
    locator: 第 4 节 HTTP 交换和 HTTP 响应
  - id: dns
    title: "RFC 1035: Domain Names"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc1035.html
    language: en
    kind: standard
    locator: 第 4.1 节 RCODE、TYPE 与 TTL
  - id: google
    title: JSON API for DNS over HTTPS
    publisher: Google Public DNS
    url: https://developers.google.com/speed/public-dns/docs/doh/json
    language: en
    kind: official-doc
    locator: 请求 name、type 和 JSON 应答字段
  - id: chef
    title: CyberChef · DNS over HTTPS
    publisher: GCHQ / CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 解析器、记录种类和 data 输出
---

## 介绍
<!-- sources: doh, dns -->
DoH 将 DNS 查询应答放在 HTTPS 交换中。DNS 消息描述问题与资源记录，HTTPS 负责双方间的传输。应用需要分别判断 HTTP 交换与 DNS 内容。

## 标准消息与 JSON 接口
<!-- sources: doh, google, chef -->
RFC 8484 的消息格式使用 application/dns-message。部分解析服务也提供以 name 和 type 查询的 JSON 接口。CyberChef 的这项操作使用后者，可读回解析服务返回的结构，或只取应答中的 data。

## 记录类型和有效时间
<!-- sources: dns, google, chef -->
A 记录的地址是 IPv4，AAAA 记录地址是 IPv6。域名还可有 CNAME 等记录，只有在理解类型后才能解释 data。TTL 是记录可保存在缓存中的时长，按秒表示。

:::example 从 A 记录读取 IPv4
[输入]
在模拟解析服务查询 test.example.test 的 A 记录
[结果]
HTTP 成功，DNS Status 为 0，Answer 含 type 1、TTL 300 和 192.0.2.5
[说明]
type 1 是 A；该应答记录的 TTL 为 300 秒，地址使用保留文档网段。
:::

:::example 只取 AAAA 的数据
[输入]
在模拟解析服务查询 test.example.test 的 AAAA 记录，只返回应答数据
[结果]
["2001:db8::5"]
[说明]
type 28 是 AAAA，data 为 IPv6 地址。
:::

## HTTP 成功与 DNS 否定应答
<!-- sources: doh, dns, google -->
HTTP 成功说明交换取得了符合应用协议的响应。DNS Status 仍可表示名称不存在或解析失败。域名存在但没有所选记录时也可能没有 Answer，需要查看 DNS 状态码而不是仅看数组是否为空。

:::example DNS 否定应答仍能返回
[输入]
在模拟解析服务查询 absent.example.test 的 A 记录
[结果]
HTTP 200，DNS Status 3，无 Answer
[说明]
DNS 的 3 表示 NXDOMAIN，HTTP 已送达否定应答。
:::

## 传输加密保护的范围
<!-- sources: doh, google -->
TLS 保护客户端与选定解析服务之间的通道。解析服务仍需读取作为查询输入的域名和记录类型。是否完整校验 DNSSEC 数据、是否使用缓存，还需结合解析服务的具体应答和配置解读。

## 常见误区

- HTTP 成功不保证 DNS 查到目标记录。
- A 与 AAAA 要分别读取，CNAME 的 data 也有独立含义。
- HTTPS 只保护传输通道，解析者仍会接收域名。
- TTL 是缓存期限，不能直接预测权威区何时更新。
