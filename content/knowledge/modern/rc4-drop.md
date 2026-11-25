---
capabilityId: op:RC4%20Drop
title: RC4 Drop
topicGroup: modern
summary: 跳过指定长度的 RC4 密钥流前缀，再使用后续流处理消息。
aliases:
  - RC4 Drop
  - RC4-drop
  - Arcfour Drop
  - 跳过密钥流
sources:
  - id: vectors
    title: RFC 6229 — Test Vectors for the Stream Cipher RC4
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc6229.html
    language: en
    kind: official-doc
    locator: §2，公开密钥及多个流偏移的核对数据
  - id: historic
    title: RFC 4345 — Improved Arcfour Modes for SSH
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc4345.html
    language: en
    kind: official-doc
    locator: §4，历史模式采用 1536 字节前缀跳过
  - id: ssh
    title: RFC 8758 — Deprecating RC4 in Secure Shell
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc8758.html
    language: en
    kind: official-doc
    locator: §§1–2，SSH 弃用及 RFC 4345 的历史状态
  - id: engine
    title: CyberChef 11.5.0 — Ciphers 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Ciphers.js
    language: en
    kind: implementation
    locator: RC4 Drop，一字为 4 字节
---

## 介绍
<!-- sources: vectors, historic, engine -->

RC4 Drop 与普通 RC4 用同一套调度与流生成。它在处理消息前让状态继续运行一段，并丢弃最初生成的流字节。第一字节消息因此不是与最初的流字节相异或，而是从指定偏移使用密钥流。

## 跳过长度的表示
<!-- sources: vectors, historic, engine -->

同一份材料可以按字节或按机器字写出偏移。固定实现中的一个 dword 是 4 字节。192 个 dword 等于 768 字节，384 个则等于 1536 字节。若说明写“跳过 768 字节”，填入的字数应为 192。

## 状态前移与结果长度
<!-- sources: vectors, historic, engine -->

跳过阶段只更新内部状态，不取走消息的任何部分。经过偏移 D 后，消息第 i 字节与完整流的第 D + i 字节异或。使用同样的 D 和密钥重复处理，密文字节即可还原为原输入。

## 同一个密钥的三个偏移
<!-- sources: vectors, historic, engine -->

以 RFC 6229 的十六进制密钥 01 02 03 04 05 和 16 个 00 为输入。下面每组结果只改变流的起始位置，长度保持 16 字节。

:::example 不跳过
[输入]
密钥 01 02 03 04 05，16 个 00，跳过 0 个 dword。
[结果]
B2 39 63 05 F0 3D C0 27 CC C3 52 4A 0A 11 18 A8
[说明]
从字节偏移 0 开始，与普通 RC4 的第一段相同。
:::

:::example 跳过 768 字节
[输入]
相同密钥及 16 个 00，跳过 192 个 dword。
[结果]
EB 62 63 8D 4F 0B A1 FE 9F CA 20 E0 5B F8 FF 2B
[说明]
192 × 4 = 768，十六进制为 0x300，与 RFC 6229 该偏移的公开向量一致。
:::

:::example 跳过 1536 字节
[输入]
相同密钥及 16 个 00，跳过 384 个 dword。
[结果]
D8 72 9D B4 18 82 25 9B EE 4F 82 53 25 F5 A1 30
[说明]
384 × 4 = 1536，十六进制为 0x600。这是 RFC 4345 历史模式使用的前缀长度。
:::

## 兼容性和历史协议
<!-- sources: historic, ssh, engine -->

历史上的 SSH 模式使用特定偏移缓解流起始部分存在的偏差。RFC 8758 已将 RFC 4345 的这些用法列为历史并明确弃用。读取旧实验记录时，可用公开向量对齐流位置。真实消息的完整性仍要由协议另行保证。

## 常见误区

- 参数写成 768 个 dword 会跳 3072 字节，不是 768 字节。
- 跳过流的字节不会缩短输出，删除密文前缀则会丢失消息。
- 使用历史上的 1536 字节偏移也不会让 RC4 Drop 获得现代消息认证能力。

