---
capabilityId: op:SHA3
title: SHA3 哈希
topicGroup: file-compression
summary: 说明标准 SHA-3 的海绵吸收、域分隔与四种输出，辨清它与 SHA-2 及旧 Keccak 的差异。
aliases:
  - SHA-3
  - SHA3-256
  - FIPS 202
sources:
  - id: nist
    title: FIPS 202
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf
    language: en
    kind: standard
    locator: 第 4 至 6 节，特别是 6.1
  - id: design
    title: Keccak specifications summary
    publisher: Team Keccak
    url: https://keccak.team/keccak_specs_summary.html
    language: en
    kind: author-spec
    locator: 海绵、置换、各实例的速率和后缀
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: SHA3
---

## 介绍
<!-- sources: nist, design -->

SHA-3 是 FIPS 202 定义的四种固定长度哈希，输出分别为 224、256、384 和 512 位。它用 Keccak 置换组成海绵构造。SHA3-256 与 SHA-256 长度相同，采用不同计算结构。

## 吸收与置换
<!-- sources: nist, design -->

状态共 1600 位，由 25 个 64 位通道组成。海绵把状态划分为速率 r 与容量 c，吸收时每个填充过的 r 位输入块异或进速率区域，随后对整个状态置换。SHA3-256 的 r 是 1088，c 是 512。

:::example 块长换算
[输入]
SHA3-256 的速率 r 为 1088 位。
[结果]
每次吸收的块为 136 字节。
[说明]
1088÷8=136。余下 512 位属于容量部分，仍参与整个状态的置换。
:::

## 标准后缀
<!-- sources: nist, design, engine -->

SHA-3 消息进入海绵前加入域分隔位 01，再使用多速率补齐。对整字节消息并按 Keccak 的位序编码时，包含补齐首位的标界字节为 06。旧 Keccak-256 常用原始补齐，其边界不同，结果也不同。

:::example 空消息区分两种边界
[输入]
空字节串，SHA3-256。
[结果]
a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a
[说明]
固定实现的旧 Keccak-256 对同样输入反而以 c5d24601 开头。
:::

## 从状态读出摘要
<!-- sources: nist, engine -->

吸收结束开始挤出输出，从速率区域取位。标准的四种固定长度实例都只需读取该阶段的最初一段。选择不同实例时，长度和速率都会改变，相同输入的短实例一般不是长实例的前缀。

:::example 三字节向量
[输入]
ASCII abc，字节 61 62 63，SHA3-256。
[结果]
3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532
[说明]
完整输出 32 字节。以 ba7816bf 开头的同长度摘要属于 SHA-256。
:::

## 摘要长度与协议
<!-- sources: nist, design -->

应用可以在协议中明确指定 SHA3-224 等算法名称。仅写 SHA3 或记下十六进制宽度容易留下歧义。若协议需要任意长度输出，FIPS 202 还单独规定了 SHAKE，其域后缀与固定算法不同。

## 常见误区

- NIST SHA3-256 与旧 Keccak-256 的字节边界不同。
- SHA3-256 不是 SHA-256 的第三版或直接替代名称。
- SHA3-224 通常不是 SHA3-256 的开头 224 位。
