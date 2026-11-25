---
capabilityId: pair:To%20Modhex
title: Modhex
topicGroup: encoding
summary: 用另一套 16 字符代替常规十六进制字母，按两个半字节可逆地表示字节。
aliases:
  - Modhex
  - YubiKey
  - modified hexadecimal
sources:
  - id: yb
    title: Modified hexadecimal encoding
    publisher: Yubico
    url: https://developers.yubico.com/OTP/Modhex_Converter.html
    language: en
    kind: author-spec
    locator: 选择字符集的键盘布局动机
  - id: table
    title: Class ModHex
    publisher: Yubico
    url: https://docs.yubico.com/yesdk/core-api/Yubico.Core.Buffers.ModHex.html
    language: en
    kind: official-doc
    locator: 参考字母顺序 cbdefghijklnrtuv
  - id: chef
    title: CyberChef 11.5.0 To Modhex / From Modhex
    publisher: GCHQ / CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To Modhex / From Modhex 输入、输出及参数
---

## 介绍
<!-- sources: yb, table -->
Modhex 表示每字节的方式与十六进制相同，仍用两个符号表示高、低半字节。它另选一组在若干常见键盘布局下较稳定的字母，减少硬件作为键盘设备输出时的错位。

## 两套字母表的逐位对应
<!-- sources: table, chef -->
常规的 0123456789ABCDEF 逐位对应 cbdefghijklnrtuv。两套表的顺序均代表 0 至 15。由普通十六进制逐字符找同一位置，可独立于文本编码换写 Modhex。

:::example 把 16 个半字节全部换到对应字符
[输入]
十六进制 01 23 45 67 89 AB CD EF，不加分隔
[结果]
cbdefghijklnrtuv
[说明]
每一位按数值从 0 到 15 依次映射。
:::

## 还原为原始字节
<!-- sources: table, chef -->
每两个字符代表一个字节。先按字母表求得高位 h 与低位 l，再算 16h＋l。仅看原始回转字节时，无需确定这些字节是否表示文字。

:::example 两字节的还原
[输入]
ccbb
[结果]
00 11
[说明]
c 为 0，b 为 1。cc 即 00，bb 即 11。
:::

:::example 换写字节 3F
[输入]
十六进制 3f
[结果]
ev
[说明]
e 对应 3，v 对应 15。
:::

## 分隔符和位置
<!-- sources: chef, table -->
表示时可在两字符的字节组之间放空格或其他分隔符。分隔方式本身不抵消组内的半字节顺序。解谜材料缺一字符或一对次序颠倒时，要对照原材料的字节边界检查。

## 用于传输的字母而非安全属性
<!-- sources: yb, table -->
Modhex 只改写字节。Yubico 的一些 OTP 输出使用它作外层表示。读出字节并不等于已验证某个一次性口令的真实性或用途。遇到题面内的相似字母串，应结合长度、来源和解码结果。

## 常见误区

- c 代表零，字母的自然排序不能用来代替编码表。
- 输出由两个半字节组成，每对的高低顺序固定。
- Modhex 看起来像一串字母，却不一定对应自然文字。
- Modhex 只作表示，不增加密钥或提供认证。
