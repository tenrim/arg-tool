---
capabilityId: native:it-ports
title: 端口与网络协议资料
topicGroup: technical
summary: 按 IANA 登记区别传输层端口、编号范围与 IP 协议号。
aliases:
  - TCP
  - UDP
  - 端口
  - 协议号
  - IANA
sources:
  - id: ports
    title: Service Name and Transport Protocol Port Number Registry
    publisher: IANA
    url: https://www.iana.org/assignments/service-names-port-numbers
    language: en
    kind: standard
    locator: 传输协议、服务名、端口范围
  - id: protocol
    title: Protocol Numbers
    publisher: IANA
    url: https://www.iana.org/assignments/protocol-numbers
    language: en
    kind: standard
    locator: 登记号 6 与 17
  - id: rfc
    title: "RFC 6335: Service Name and Port Number Registry"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc6335.html
    language: en
    kind: standard
    locator: 第 6 节 端口范围
  - id: model
    title: IT 静态资料查询
    publisher: 迷雾工具箱
    url: /it-reference/model.js
    language: zh-CN
    kind: implementation
    locator: searchITRecords、normalizeDomainInput 和 matchPublicSuffix
---

## 介绍
<!-- sources: ports, protocol -->
IANA 维护 IP 协议号和服务端口两个登记表。前者标识网络层接下来的协议，后者按传输方式登记服务名称和端口。

## 报文中的两层编号
<!-- sources: rfc, protocol -->
IPv4 的协议字段与 IPv6 的下一首部字段使用协议号空间，例如 TCP 为 6，UDP 为 17。TCP 与 UDP 又各有 16 位的源端口和目的端口字段。

:::example 连接到常用 HTTPS 端口
[输入]
建立指向 TCP 目的端口 443 的连接
[结果]
IP 协议号 6，TCP 目的端口 443
[说明]
同一报文两处数字分别说明接下来的协议与目的端点。
:::

## 端口分段与保留范围
<!-- sources: ports, rfc, model -->
系统端口为 0 至 1023，用户端口为 1024 至 49151，动态或私有端口为 49152 至 65535。最后一段不按特定服务分配。查表时单个数字也可能落在一条范围记录中。

:::example 端口落入保留条目
[输入]
226
[结果]
命中 225–241 的保留范围
[说明]
226 位于该闭区间内，且这个范围属于系统端口。
:::

## 服务的多个传输方式
<!-- sources: ports, protocol -->
同一服务可以同时登记相同数字的 TCP 与 UDP 端口。也可能仅在某个传输协议下登记。在记录服务地址时，传输方式应和数字一起保存。

:::example 域名查询服务
[输入]
端口 53 或服务名 domain
[结果]
可找到 53/TCP 与 53/UDP 的登记
[说明]
两条记录按传输协议区分；53 并非 TCP 或 UDP 的 IP 协议号。
:::

## 登记值与现场观察
<!-- sources: ports, model -->
静态资料回答已分配的用途和记录来源。主机的端口是否开放、实际连接到哪个应用及报文的具体内容，需要独立证据。

## 常见误区

- 协议号 6 不会要求 TCP 监听端口 6。
- 记录数字端口的同时应保留传输协议。
- 系统端口区间仍可能含保留条目。
- 常用端口上的流量可能采用不同应用协议。
