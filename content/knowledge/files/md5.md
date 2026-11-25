---
capabilityId: op:MD5
title: MD5 哈希
topicGroup: file-compression
summary: 解释 MD5 的小端分块、四轮迭代和摘要字节顺序，以公开向量核对旧格式。
aliases:
  - MD5
  - Message Digest 5
  - 128 位摘要
sources:
  - id: rfc
    title: RFC 1321 The MD5 Message-Digest Algorithm
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc1321.txt
    language: en
    kind: standard
    locator: 第 3 节与附录 A.5
  - id: security
    title: RFC 6151 Updated Security Considerations for MD5 and HMAC-MD5
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc6151.txt
    language: en
    kind: standard
    locator: 第 2.1 节碰撞抗性
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: MD5
---

## 介绍
<!-- sources: rfc -->

MD5 是一个 128 位消息摘要函数，读取任意长的字节序列并输出固定 16 字节。消息先补齐成 512 位块，每一块参与更新四个 32 位状态字。原始说明将它描述为对 MD4 的修订。

## 填充和长度字段
<!-- sources: rfc -->

输入追加一个 1 位和若干零，直到离下一个 512 位边界差 64 位。最后的 64 位是原始位长的低位部分，以小端字节序保存。原长度恰好 448 位时也要附上 1 位，此时需要再多一块容纳填充和长度。

:::example 填充边界
[输入]
56 字节消息。
[结果]
补齐后为 128 字节。
[说明]
56 字节等于 448 位。新增的 1 位使本块无法再留出完整的 64 位长度域。
:::

## 四轮更新
<!-- sources: rfc, engine -->

每块有 16 个小端消息字。四轮各含 16 步，分别使用布尔混合函数、消息字、常数和循环移位。计算完成后按 32 位模加法将工作字加回原状态，再进入下一块。

:::example 常用三字节向量
[输入]
ASCII abc，字节 61 62 63。
[结果]
900150983cd24fb0d6963f7d28e17f72
[说明]
RFC 1321 附录给出同一结果，末尾没有换行。
:::

## 输出及空消息
<!-- sources: rfc, engine -->

状态的四个字各按小端写为四字节，再依次拼接。空消息也要经过补齐、压缩和输出，不会得到空串。十六进制的字母大小写只影响展示。

:::example 空消息向量
[输入]
零字节。
[结果]
d41d8cd98f00b204e9800998ecf8427e
[说明]
消息填充成一个块，长度域的八字节全为零。
:::

## 碰撞和旧清单
<!-- sources: security -->

公开研究已能构造不同输入而获得相同 MD5。RFC 6151 明确指出，依赖碰撞抗性的场景如数字签名不适合使用 MD5。可信旧清单可按其原算法核对，但不应把这一结果单独用作来源证明。

## 常见误区

- MD5 的十六进制输出不会随输入变长。
- 旧清单里同样的 32 字符也可能由其他摘要算法产生。
- 压缩状态的加法与散列输入的编码是两件事，文本末尾换行属于输入。
