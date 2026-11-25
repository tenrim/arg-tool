---
capabilityId: op:RC4
title: RC4
topicGroup: modern
summary: 由密钥置换 256 个字节值并产生密钥流，用于解释旧流密码材料。
aliases:
  - RC4
  - Arcfour
  - 流密码
  - 密钥调度
sources:
  - id: vectors
    title: RFC 6229 — Test Vectors for the Stream Cipher RC4
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc6229.html
    language: en
    kind: official-doc
    locator: §2，公开密钥及多个流偏移的核对数据
  - id: tls
    title: RFC 7465 — Prohibiting RC4 Cipher Suites
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc7465.html
    language: en
    kind: official-doc
    locator: §2–3，TLS 禁用与统计偏差
  - id: engine
    title: CyberChef 11.5.0 — Ciphers 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Ciphers.js
    language: en
    kind: implementation
    locator: RC4 与 CryptoJS 置换表、计数器及字节输出
---

## 介绍
<!-- sources: vectors, tls, engine -->

RC4 是一种早期的对称流密码，也称 Arcfour。它先从密钥得到内部状态，再持续生成字节，按位置与消息相异或。教学资料和旧格式仍可能使用 RC4 测试向量，TLS 已禁用这类密码套件。

## 密钥调度和置换表
<!-- sources: vectors, engine -->

初始表 S 依次填入 0 到 255。调度阶段逐项处理 i，将 j 更新为 (j + S[i] + K[i mod m]) mod 256，再交换 S[i] 和 S[j]，其中 m 是密钥的字节数。处理完 256 项，表中仍是这 256 个不同的值，但顺序已经由密钥决定。

## 流生成和往返
<!-- sources: vectors, engine -->

生成阶段每次将 i 加 1 对 256 取模，再把 j 更新为 (j + S[i]) mod 256 并交换相应表项。接下来用新的 S[i] 与 S[j] 的和对 256 取模，以此为索引取得一个密钥流字节。消息字节与它异或，使用相同密钥和从同一状态生成的流，再异或一次可还原消息。

## 公开数据的核对
<!-- sources: vectors, engine -->

使用十六进制密钥和输入验证时，每两位十六进制数字才是一字节。全零输入将密钥流原样显示，用普通文字或其他非零输入可以另行检查异或过程。

:::example 40 位密钥的首 16 字节
[输入]
密钥 01 02 03 04 05，消息为 16 个 00。
[结果]
B2 39 63 05 F0 3D C0 27 CC C3 52 4A 0A 11 18 A8
[说明]
结果等于 RFC 6229 中该密钥在偏移 0 的流。零输入使这段流的原有字节直接出现在输出。
:::

:::example 64 位密钥的首 16 字节
[输入]
密钥 01 02 03 04 05 06 07 08，消息为 16 个 00。
[结果]
97 AB 8A 1B F0 AF B9 61 32 F2 F6 72 58 DA 15 A8
[说明]
变更密钥字节序列后查询同一偏移，应与对应的另一条公开向量匹配。
:::

:::example 非零消息往返
[输入]
密钥 01 02 03 04 05，消息 41 42 43 44。
[结果]
F3 7B 20 41。以相同密钥重新从偏移 0 处理这四字节，可得 41 42 43 44。
[说明]
首字节 41⊕B2=F3，之后分别使用 39、63 和 05。
:::

## 历史材料的判读
<!-- sources: vectors, tls, engine -->

核验旧谜题时，应明确密钥的实际字节、加密流从何处开始，以及输出采用十六进制或其他形式。相同输入长度只保证能够逐字节异或。RC4 的统计偏差和缺少认证决定它适合历史资料复现与算法教学。

## 常见误区

- 密钥写作十六进制 0102030405 时，引擎收到五字节，直接当文本则收到十个字符。
- 普通 RC4 与 RC4 Drop 相差一个密钥流偏移，不能直接交换。
- 解出可读内容并不等于通过消息认证。

