---
capabilityId: op:BLAKE3
title: BLAKE3 哈希
topicGroup: file-compression
summary: 说明 BLAKE3 的分块树与可扩展输出，区分普通、加钥和派生密钥三种工作模式。
aliases:
  - BLAKE3
  - 树形摘要
  - XOF
sources:
  - id: design
    title: BLAKE3 specifications
    publisher: BLAKE3 Team
    url: https://github.com/BLAKE3-team/BLAKE3-specs
    language: en
    kind: author-spec
    locator: 算法规格、树和输出模式
  - id: cases
    title: BLAKE3 test vectors
    publisher: BLAKE3 Team
    url: https://raw.githubusercontent.com/BLAKE3-team/BLAKE3/master/test_vectors/test_vectors.json
    language: en
    kind: implementation
    locator: 0、1、2 字节样例与三种模式
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Hashing.js
    language: en
    kind: implementation
    locator: BLAKE3 的 UTF-8 输入、输出字节数与加钥
---

## 介绍
<!-- sources: design -->

BLAKE3 是树形密码哈希，能输出约定长度的摘要。大消息先分成各自编号的块，再通过父节点逐层合并。独立子树可以并行计算，合并顺序仍由消息原来的块序决定。

## 块、链值和树
<!-- sources: design -->

消息以 1024 字节为一块，每块内部以 64 字节为单位压缩。块压缩包含序号和开始、结束标志。父节点用前后两个子节点的链值作为输入。根节点标志使最终输出与普通子节点链值区分开。

:::example 单字节官方向量
[输入]
一字节 00，普通模式，输出 32 字节。
[结果]
2d3adedff11b61f14c886e35afa036736dcd87a74d27b5c1510225d0f592e213
[说明]
公开测试消息是一个零字节，和字符 0 或空消息都不同。
:::

## 根输出的长度
<!-- sources: design, cases -->

根输出用输出块计数器产生可读的序列。对同一消息和模式，前 32 字节在读取更长结果时不会改变。长度要和协议约定一致，比较时可检查十六进制字符数是否为目标字节数的二倍。

:::example 空消息的前缀
[输入]
空消息，普通模式。
[结果]
32 字节为 af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262。
64 字节结果随后接上 e00f03e7b69af26b7faaf09fcd333050338ddfe085b8cc869ca98b206c08243a。
[说明]
公开向量保留了更长的根输出序列。
:::

## 加钥和派生模式
<!-- sources: design, cases, engine -->

算法规格区分普通散列、使用恰好 32 字节密钥的加钥散列，以及采用上下文字符串的派生密钥。三种模式有明确的域标志。直接输入密钥的散列操作对应加钥计算，不能代替派生模式。

:::example 官方公开试验密钥
[输入]
空消息，密钥字面量 whats the Elvish word for friend，读取 32 字节。
[结果]
92b2b75604ed3c761f9d6f62392c8a9227ad0ea3f09573e783f1498a4ed60d26
[说明]
该公开 ASCII 密钥恰好为 32 字节，仅用于检验模式。
:::

## 文本编码和大块验证
<!-- sources: design, cases, engine -->

工具的字符串入口按 UTF-8 产生消息字节，能够复现 ASCII 和与其对应的二进制样例。比较任意原始文件摘要时，要确保所用入口确实接受原始文件的字节。检查树形实现时，跨越 1024 字节的测试向量能覆盖仅用短消息检验不到的父节点处理。

## 常见误区

- 可扩展输出的短前缀和长结果并非互相独立。
- 显示字符数不等于密钥字节数，特别是非 ASCII 密钥。
- 根节点输出和中间块的链值承担不同角色。
