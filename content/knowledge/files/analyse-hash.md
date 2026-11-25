---
capabilityId: op:Analyse%20hash
title: 分析哈希类型
topicGroup: file-compression
summary: 将可读的十六进制形式换算为位长，提出摘要候选并用文件格式和固定向量排查。
aliases:
  - Analyse hash
  - 摘要长度识别
  - 哈希类型候选
sources:
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Analyse hash 的十六进制校验和长度候选表
  - id: nist
    title: FIPS 180-4 Secure Hash Standard
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
    language: en
    kind: standard
    locator: SHA-1 和 SHA-2 的输出位数
  - id: md5
    title: RFC 1321 The MD5 Message-Digest Algorithm
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc1321.txt
    language: en
    kind: standard
    locator: 附录 A.5 标准摘要样例
---

## 介绍
<!-- sources: engine, nist -->

哈希类型的长度分析根据待识别的一段可见字符，给出若干可能使用的算法。长度只是外部格式证据。同样的位数可以来自不同算法、截断摘要或与摘要无关的数据。

## 从字符换算位长
<!-- sources: engine, md5 -->

对十六进制输入，一个字符代表四位，两个字符代表一字节。分析实现允许输入中有分隔空白，去掉空白后统计十六进制字符。奇数个字符能表示半字节序列，作为整字节摘要时还要核对是否发生过删节。

:::example 分隔不改变 128 位长度
[输入]
9001 5098 3cd2 4fb0 d696 3f7d 28e1 7f72
[结果]
32 个十六进制字符、16 字节、128 位。候选包括 MD5、MD4、MD2。
[说明]
去掉空白后得到 RFC 1321 的 abc 样例，但长度分析本身并未使用对应原文。
:::

## 同位长候选
<!-- sources: engine, nist -->

长度档案列的是一组候选，并非所有历史和现有实现的穷尽目录。比如一个 160 位值除了 SHA-1 还可能来自 SHA-0、HAS-160、RIPEMD-160。其内部是否看起来随机，通常也不能独立分清候选算法。

:::example 能提出 SHA-1 候选
[输入]
a9993e364706816aba3e25717850c26c9cd0d89d
[结果]
40 个十六进制字符、20 字节、160 位。SHA-1 是候选之一。
[说明]
若题目另外提供原始 abc，并指定标准 SHA-1，复算可以增加一项直接核对证据。
:::

## 显示格式与异常输入
<!-- sources: engine -->

十六进制之外，摘要还可能表示成 Base64、带前缀字符串或者更长的结构字段。先按协议提取并解析实际摘要。固定实现拒绝含非十六进制字母的文本，也不把 0x 作为可忽略前缀。

:::example 非法十六进制输入
[输入]
0x1a
[结果]
Invalid hash。
[说明]
x 不属于十六进制字符。若资料明确表明开头 0x 是显示前缀，实际可提取的字节是 1a。
:::

## 从候选到确认
<!-- sources: nist, md5, engine -->

有可核查的上下文时，先找描述算法和消息范围的字段。若又有允许复算的短消息，可以对照多个已知向量，逐步排除字节顺序、截断和算法变体。没有原文或协议标识时，结果只能保持为候选。

## 常见误区

- MD5 正好是一个 128 位候选，32 个十六进制字符不独属于 MD5。
- 半字节换算只是长度解释，不能证明输入是完整的摘要。
- 长度分析不会把十六进制摘要逆向还原成原文。
