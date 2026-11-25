---
capabilityId: op:Extract%20IP%20addresses
title: 提取 IP 地址
topicGroup: text-language
summary: 从文本提取 IPv4 和 IPv6 候选，区分地址、前缀长度与可达性。
aliases:
  - Extract IP addresses
  - IPv4 提取
  - IPv6 提取
  - 日志 IP
sources:
  - id: syntax
    title: RFC 3986 — URI Generic Syntax
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc3986.html
    language: en
    kind: official-doc
    locator: §3.2.2，IPv4 十进制地址
  - id: ipv6
    title: RFC 4291 — IPv6 Addressing Architecture
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc4291.html
    language: en
    kind: official-doc
    locator: §2.2–2.3，文本和前缀表示
  - id: private
    title: RFC 1918 — Address Allocation for Private Internets
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc1918.html
    language: en
    kind: official-doc
    locator: §3，IPv4 私有地址块
  - id: engine
    title: CyberChef Regex 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Regex.js
    language: en
    kind: implementation
    locator: Extract IP addresses，族选择与本地地址过滤
---

## 介绍
<!-- sources: syntax, ipv6, engine -->

IP 地址提取从一段文本中找出与 IPv4 或 IPv6 形式匹配的片段。访问日志、配置文件及解谜材料可能把地址与端口、前缀长度或注释混写，结果列表可用来从原记录中定位这些字段。

## IPv4 四段与 IPv6 压缩
<!-- sources: syntax, ipv6 -->

通常的 IPv4 文本由四段十进制八位组以点连接，每段数值在 0 到 255 之间。IPv6 的常用形式有八个十六进制组，可用一次双冒号缩写一段连续的零组。两种不同写法可能描述相同的 IPv6 值。

## 文本边界与本地范围
<!-- sources: ipv6, private, engine -->

IPv6 的斜线后数字表示前缀长度，IPv4 的 CIDR 也使用这个分隔符。在网址和配置中，方括号常用来分隔 IPv6 地址和端口。过滤本地 IPv4 时，私有地址范围包括 10.0.0.0/8、172.16.0.0/12 与 192.168.0.0/16。固定提取器还排除常见回环地址，但会保留链路本地样本和文档地址。

## 从日志片段得到候选
<!-- sources: syntax, ipv6, private, engine -->

下面保留结果中的原始拼法。第三例应对照 RFC 4291 的混合写法，说明文本提取器对它的已核对限制。

:::example IPv4 片段和前缀
[输入]
192.0.2.7/24 256.0.2.7 192.0.2.007
[结果]
192.0.2.7
[说明]
输出省去 /24。第二项首段超出 255。第三项的前导零写法不在此模式接受的四段形式内。
:::

:::example 只要 IPv6
[输入]
v6 [2001:db8::1] [2001:0db8:0000:0000:0000:0000:0000:0001]
[结果]
2001:db8::1
2001:0db8:0000:0000:0000:0000:0001
[说明]
两条结果逐字符不同，但展开后为同一个 IPv6 地址。
:::

:::example 混合写法的截断
[输入]
只提取 IPv6，输入 [::ffff:192.0.2.7]。
[结果]
::ffff:192
[说明]
规范中的完整值是 ::ffff:192.0.2.7。固定匹配规则停在第一个点前，因此不能用这个候选代替输入中的地址。
:::

:::example 过滤私有与回环地址
[输入]
127.0.0.1 10.0.0.5 172.16.0.6 172.32.0.8 192.168.1.5 169.254.1.1 192.0.2.7
[结果]
172.32.0.8
169.254.1.1
192.0.2.7
[说明]
172.32 不属于 172.16–172.31。剩余结果还包含特殊用途地址，保留它们并不表示公网可达。
:::

## 候选的语义核验
<!-- sources: syntax, ipv6, engine -->

同一个地址在日志中出现多次可有不同端口和时间。提取列表可用于定位，却不会保全行内上下文。核对地址时应取回原字段，用支持相应地址族的完整解析对比数值，另行记录前缀与端口。

## 常见误区

- 出现的地址字符串可以是文档示例、内部地址或不可达地址。
- 按文字去重无法自动合并 IPv6 的不同拼写。
- 提取结果的最后一段之后仍可能有原地址的一部分，例如混合形式的 IPv4 尾部。

