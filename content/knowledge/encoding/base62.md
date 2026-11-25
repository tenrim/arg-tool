---
capabilityId: pair:To%20Base62
title: Base62
topicGroup: encoding
summary: 解释 62 进制数位、大小写顺序和无额外封装时丢失前导零的原因。
aliases:
  - To Base62
  - From Base62
  - 62 进制字母表
sources:
  - id: pinned
    title: CyberChef 固定源码 operations/ToBase62.mjs
    publisher: GCHQ CyberChef
    url: /vendor/knowledge/cyberchef/src/core/operations/ToBase62.mjs
    language: en
    kind: implementation
    locator: 从原始字节到十六进制整数再转换 Base62
    license: Apache-2.0
    licenseUrl: /vendor/knowledge/LICENSE.txt
  - id: big
    title: BigNumber.js API
    publisher: Mike McLaughlin
    url: https://mikemcl.github.io/bignumber.js/#alphabet
    language: en
    kind: author-spec
    locator: ALPHABET 与任意进制换算
  - id: engine
    title: CyberChef 操作目录
    publisher: GCHQ CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To Base62 与 From Base62
  - id: comparison
    title: Bitcoin Core — Base58 实现
    publisher: Bitcoin Core
    url: https://github.com/bitcoin/bitcoin/blob/master/src/base58.cpp
    language: en
    kind: implementation
    locator: 用于比较的前导零保留方法
---

## 介绍
<!-- sources: pinned, big -->

Base62 用 62 个符号表示非负整数。常见字母表是数字、26 个大写字母和 26 个小写字母。字节编码可以将输入当成一个大端整数，再用这张表输出。若传输协议还要求保留原始长度，需要另行定义字节的封装方式。

## 数位与跨进位
<!-- sources: pinned, big -->

采用 0–9、A–Z、a–z 的顺序时，0 到 9 的数位不变，A 对应 10，Z 对应 35，a 对应 36，z 对应 61。一个数位写满后向左进一位。

:::example 单字节的临界点
[输入]
十进制字节 61、62 和 255，分别独立编码
[结果]
61 → z
62 → 10
255 → 47
[说明]
255 = 4×62+7。写成 47 后，两位分别表示 4 和 7。
:::

## 字母表的顺序
<!-- sources: big, engine -->

字符集相同的两种约定也可以赋予字母不同数值。0–9、a–z、A–Z 会交换大小写字母所处的数值范围。读到同一个词形时，应使用协议规定的排列计算。

:::example 区分两张表中的大写 A
[输入]
读取两个符号 1A
[结果]
0–9、A–Z、a–z：72
0–9、a–z、A–Z：98
[说明]
两张表都把 1 读作 1。A 分别取 10 或 36，因此计算结果是 62+10 或 62+36。
:::

## 前导零和长度
<!-- sources: pinned, comparison -->

只序列化整数字面量时，输入起始处的零并未改变数值。若格式未另行记录零字节，解码只能给出这个数值的某一种字节表示。Bitcoin Base58 的前缀规则显示了另一种设计，Base62 的普通整数转换并不自动采用它。

:::example 两个字节串的相同编码
[输入]
41 和 00 41，以大端整数换算
[结果]
两者的编码均为 13
[说明]
两组都代表 65，即 1×62+3。从 13 可得 65，却无法判断原来是一个字节还是两个字节。
:::

## 载体与校验
<!-- sources: pinned, big -->

Base62 的字符可直接放入许多只允许字母数字的字段。读到疑似编码时，先确定字母表和原始长度是否由协议给出，再核对解码字节中的结构。未发现等号不会帮助确定使用的是哪一种 Base62 约定。

## 常见误区

- 任意给文本切成固定长度再解码，会改变整串整数的高低位关系。
- 大写与小写分别占用数位，统一大小写会失去区分。
- 原始字节数不能由整数值唯一确定。需要固定长度、记录长度或专门的前导零规则。
