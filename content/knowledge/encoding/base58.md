---
capabilityId: pair:To%20Base58
title: Base58
topicGroup: encoding
summary: 说明全串进位转换、前导零、Bitcoin 与 XRP Ledger 字母表，以及校验封装。
aliases:
  - Bitcoin Base58
  - Ripple Base58
sources:
  - id: bitcoin
    title: Bitcoin Core — Base58 实现
    publisher: Bitcoin Core
    url: https://github.com/bitcoin/bitcoin/blob/master/src/base58.cpp
    language: en
    kind: implementation
    locator: 字符表、字节转换与 Base58Check
  - id: xrpl
    title: XRP Ledger — Base58 Encodings
    publisher: XRP Ledger
    url: https://xrpl.org/docs/references/protocol/data-types/base58-encodings
    language: en
    kind: official-doc
    locator: 字母表及类型前缀
  - id: pinned
    title: CyberChef 固定源码 operations/ToBase58.mjs
    publisher: GCHQ CyberChef
    url: /vendor/knowledge/cyberchef/src/core/operations/ToBase58.mjs
    language: en
    kind: implementation
    locator: 进位转换与保留前导 00
    license: Apache-2.0
    licenseUrl: /vendor/knowledge/LICENSE.txt
  - id: engine
    title: CyberChef 操作目录
    publisher: GCHQ CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To Base58 与 From Base58
---

## 介绍
<!-- sources: bitcoin, pinned -->

Base58 把一串字节视为大端整数，用有 58 项的表写成进位数字。Bitcoin 字母表避开 0、O、I、l 四个容易在抄写中混淆的字符。每个输出符号表示一个进位数字，无法单独换成固定数量的位。

## 进位关系
<!-- sources: bitcoin, pinned -->

从最前面的字节开始，把累计值乘 256，再加下一个字节。编码时反复除以 58，依次取余，最后将余数倒序查表。解码时对每个符号将累计值乘 58 再加本位数值。

:::example 单字节 FF
[输入]
FF，Bitcoin 字母表
[结果]
5Q
[说明]
255 = 4×58+23。两位从高到低查表，4 对应 5，23 对应 Q。
:::

## 前导零的保留
<!-- sources: bitcoin, pinned -->

若只转换数值，00 41 和 41 都等于 65。Bitcoin Base58 另外数出开头的零字节，每个开头的 00 在结果前写一个字母表首字符 1。解码时再按数量补回零字节。

:::example 零字节不合并
[输入]
00 41 与 00 00，Bitcoin 字母表
[结果]
00 41 → 128
00 00 → 11
[说明]
41 对应的 65 单独写成 28。两个零字节组成的输入只有前缀，没有需要另写的非零进位部分。
:::

## 两种表的顺序
<!-- sources: xrpl, pinned, engine -->

XRP Ledger 使用相同的数位范围和另一份排列，表首是 r。字符表的顺序属于格式定义。由于两种表共享符号集合，能成功读出一串字节仍不足以证明表选对了。

:::example 同一数值的不同外形
[输入]
00 41
[结果]
Bitcoin：128
XRP Ledger 字母表：rp3
[说明]
前导零在后者写 r。数位 1、7 在后者分别写成 p、3。
:::

## 校验封装
<!-- sources: bitcoin, xrpl -->

具体地址或标识格式可以在字节前增加类型标记，并在末尾加入校验信息，再把整个数据写成 Base58。Bitcoin Core 的 Base58Check 使用哈希结果的前四个字节做校验。识别这类地址时还要核对类型、长度和校验，读出任意字节只是基础步骤。

## 常见误区

- 首字符 1 的个数有意义。只有在 Bitcoin 字母表内，它才按这个约定表示前导零。
- 字母大小写是不同数位，整体转换大小写会损坏数据。
- 普通 Base58 本身没有地址校验。应用层校验来自额外封装。
