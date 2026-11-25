---
capabilityId: op:Change%20IP%20format
title: 转换 IP 地址格式
topicGroup: network
summary: 把 IPv4 的四个八位组按位合成整数，在点分十进制、十六进制、十进制和八进制之间转换。
aliases:
  - Change IP format
  - IPv4 整数
  - IP 点分十进制
sources:
  - id: ipv4
    title: RFC 791 Internet Protocol
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc791
    language: en
    kind: standard
    locator: 第 3 节，地址长四个八位组
  - id: sample
    title: RFC 5737 IPv4 Address Blocks Reserved for Documentation
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc5737
    language: en
    kind: standard
    locator: 第 3 节，测试用网段
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Change IP format：输入分支及使用的进制转换
---

## 介绍
<!-- sources: ipv4, engine -->
一个 IPv4 地址有 32 位。点分十进制把它分为四个八位整数，每个数从 0 到 255。例如 192.0.2.1 对应四个字节 C0 00 02 01。

## 合成与拆开
<!-- sources: ipv4, engine -->
设四段为 a、b、c、d，从左到右的权重分别为 256³、256²、256、1。加权和就是 32 位无符号数。反过来连续除以 256 并取余，可从低到高回收四段。十六进制每段用两位，写完恰好八位。

## 八进制与合法范围
<!-- sources: ipv4, engine -->
把同一个整数改写为八进制时，每个数字表示三个位，四个字节的分隔位置不必对应八进制各位。判断地址有效时仍应检查四段值及总位宽。当前转换有宽松输入路径，例如 256.1.2.3 会产出超过八位的十六进制数，该结果没有成为合法 IPv4。

## 四字节的实例
<!-- sources: ipv4, sample, engine -->
前两条采用 RFC 为文档预留的地址，不需要访问任何主机。

:::example 点分十进制到十六进制
[输入]
192.0.2.1，输出 Hex
[结果]
c0000201
[说明]
逐段得到 C0、00、02、01，按原顺序连接。
:::

:::example 点分十进制到整数
[输入]
203.0.113.5，输出 Decimal
[结果]
3405803781
[说明]
203×256³＋0×256²＋113×256＋5 即此值。
:::

:::example 最大无符号地址的八进制
[输入]
255.255.255.255，输出 Octal
[结果]
037777777777
[说明]
表示数值 2³²−1。最前的 0 用于标记八进制，不属于地址的额外位。
:::

## 地址值与网络用途
<!-- sources: ipv4, sample -->
同一个 32 位值可换写为多种进制。网段、掩码、回环或文档用途要用其他字段或地址范围判断。转换结果给出数字表示，对应主机是否存在或可访问，需要独立的网络信息。

## 常见误区
- 四段十进制文字不能靠字符串拼接得到正确的 32 位数。
- 某段大于 255 已超出点分十进制 IPv4 的定义。
- 合法地址的某一写法不能直接表明网络可达。
