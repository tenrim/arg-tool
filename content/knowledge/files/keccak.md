---
capabilityId: op:Keccak
title: Keccak 哈希
topicGroup: file-compression
summary: 从 Keccak 置换与原始海绵补齐解释常见 Keccak-256，核对它和标准 SHA3-256 的差异。
aliases:
  - Keccak-256
  - Keccak sponge
  - 原始 Keccak
sources:
  - id: design
    title: Keccak specifications summary
    publisher: Team Keccak
    url: https://keccak.team/keccak_specs_summary.html
    language: en
    kind: author-spec
    locator: 海绵、置换、各实例的速率和后缀
  - id: nist
    title: FIPS 202
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf
    language: en
    kind: standard
    locator: 第 3 至 6 节，海绵构造、补齐和 SHA-3 定义
  - id: evm
    title: Understanding the Yellow Paper’s EVM Specifications
    publisher: Ethereum.org
    url: https://ethereum.org/developers/tutorials/yellow-paper-evm/
    language: en
    kind: official-doc
    locator: KECCAK256 操作码
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Keccak
---

## 介绍
<!-- sources: design, nist -->

Keccak 是一族基于置换的海绵设计。许多旧系统中的 Keccak-256 指使用原始 Keccak 补齐、速率 1088 位、输出 256 位的具体实例。以太坊虚拟机的 KECCAK256 也采用这个名称与实例。

## 置换轮
<!-- sources: design, nist -->

Keccak-f[1600] 将 1600 位状态表示为 5×5 个 64 位通道。θ 在列之间扩散，ρ 对各通道循环移位，π 重排通道，χ 混合同行通道，ι 加入轮常量。完整置换执行 24 轮，吸收和挤出过程调用这一置换。

:::example 状态和速率
[输入]
Keccak-256 的状态宽度为 1600 位，速率为 1088 位。
[结果]
容量为 512 位，可吸收段为 136 字节。
[说明]
1600−1088=512，1088÷8=136。
:::

## 原始补齐与 SHA-3 后缀
<!-- sources: design, nist, engine -->

原始 Keccak 的多速率补齐使用一个 1、若干个 0 和另一个 1，对整字节消息起始标界字节常表示为 01。FIPS 202 的 SHA3-256 另在补齐前加入域分隔位，起始标界字节为 06。两者经过不同的输入块，虽然底层置换和结果宽度相同。

:::example 空消息已分流
[输入]
空字节串，原始 Keccak-256。
[结果]
c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
[说明]
相同输入用 SHA3-256 的结果以 a7ffc6f8 开头。
:::

## 三字节核对
<!-- sources: design, engine -->

核对旧系统摘要时，先明确输入指的是原始字节还是它们的展示字符串。字节 61 62 63 等于 ASCII abc，把字符 6、1、6、2、6、3 逐个读入则形成六个不同字节。

:::example 原始家族向量
[输入]
ASCII abc，仅三个字节，Keccak-256。
[结果]
4e03657aea45a94fc7d47ba826c8d667c0d1e6e33a64a036ec44f58fa12d6c45
[说明]
FIPS SHA3-256 对同一输入以 3a985da7 开头。
:::

## 协议中的命名
<!-- sources: design, evm -->

协议可能直接写出 Keccak-256，或历史上使用较含糊的 SHA3 命名。以太坊的规范操作码是 KECCAK256。遇到含糊文档，可以用协议公布的字节向量区分算法。

## 常见误区

- Keccak-f 是置换，完整摘要还取决于海绵构造的具体参数。
- 将旧 Keccak 的名字替换为 SHA3-256 会破坏现有结果兼容性。
- ASCII 十六进制文本与其表示的原始字节应分别处理。
