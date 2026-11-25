---
capabilityId: op:Parse%20IPv6%20address
title: 解析 IPv6 地址
topicGroup: network
summary: 将 IPv6 的压缩写法展开为八组 16 位数，并核对回环、文档或映射等特殊形式。
aliases:
  - Parse IPv6 address
  - IPv6 零压缩
  - IPv4 映射地址
sources:
  - id: address
    title: RFC 4291 IP Version 6 Addressing Architecture
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4291
    language: en
    kind: standard
    locator: 第 2.2、2.5 节，IPv6 表示、回环与 IPv4 映射
  - id: canonical
    title: RFC 5952 A Recommendation for IPv6 Address Text Representation
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc5952
    language: en
    kind: standard
    locator: 第 4 节，去前导零、最长零串和同长优先
  - id: sample
    title: RFC 3849 IPv6 Address Prefix Reserved for Documentation
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc3849
    language: en
    kind: standard
    locator: 第 2 节，2001:db8::/32
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Parse IPv6 address：长短写法、地址范围和 IPv4 映射
---

## 介绍
<!-- sources: address, canonical -->
IPv6 有 128 位，可写成八组由冒号分隔的 16 位十六进制数。组内的前导零可以省略。连续零字段还可合并为双冒号，按缺少的组数展开即可恢复同一地址。

## 规范简写
<!-- sources: address, canonical -->
一个地址至多写一次双冒号，否则无法分辨哪段补几个零。建议的规范输出压缩最长且至少有两组的零串，遇到多个同长候选时取最左侧，并使用小写十六进制。

## 特殊前缀与混合写法
<!-- sources: address, sample, engine -->
回环地址是 ::1，文档专用前缀是 2001:db8::/32。RFC 另外允许用点分十进制写出末尾 IPv4 部分。在当前识别器中，::ffff:192.0.2.33 的点分形式不能得到正确映射，用等价纯十六进制形式 ::ffff:c000:221 则可读出原 IPv4。每个八位组分别换十六进制再成对编组，即可复核末尾四个字节。

## 展开与缩写实例
<!-- sources: address, canonical, sample, engine -->
文档前缀可用来演示格式选择，两种写法应保留原有位模式。

:::example 同长零串取左侧
[输入]
2001:db8:0:0:1:0:0:1
[结果]
2001:db8::1:0:0:1
[说明]
第 3～4 组与第 6～7 组都是两个零，规范简写选择前一个。
:::

:::example 回环地址
[输入]
::1
[结果]
0000:0000:0000:0000:0000:0000:0000:0001
[说明]
末组是 0001，省略的是左边七组零。
:::

:::example 映射到 IPv4 文档地址
[输入]
::ffff:c000:221
[结果]
映射的 IPv4 为 192.0.2.33
[说明]
取末两组 C000 与 0221 共四字节，依次是 C0、00、02、21。
:::

## 文本与网络判断
<!-- sources: address, canonical, sample -->
地址的表示转换只改变写法。相同文本也可因作用域或设备上下文指向不同接口。网络范围需要前缀长度，网络可达性需要路由及现场状态。链接中含 IPv6 时通常用方括号把地址与端口分开。

## 常见误区
- 双冒号可以省略多组零，但不能在一个地址里写两次。
- 省略前导零仍保留每组的十六进制含义。
- IPv4 映射地址的底层 IPv4 位与其十进制文本的字面样式不同。
