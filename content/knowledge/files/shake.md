---
capabilityId: op:Shake
title: Shake 哈希
topicGroup: file-compression
summary: 说明 SHAKE 的可扩展输出、128 与 256 实例和长度前缀关系。
aliases:
  - SHAKE
  - SHAKE128
  - SHAKE256
  - XOF
sources:
  - id: nist
    title: FIPS 202
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf
    language: en
    kind: standard
    locator: 第 6.2 节，附录 A.1 与 A.2
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
    locator: Shake 的实例与输出位数
---

## 介绍
<!-- sources: nist -->

SHAKE128 与 SHAKE256 是标准化可扩展输出函数，英文简称 XOF。消息经吸收后可持续输出指定数量的位。两个名称中的数字区分实例及其目标安全强度，输出的实际长度还要另行指定。

## 实例和速率
<!-- sources: nist, design -->

两个实例都用 1600 位 Keccak 状态。SHAKE128 的容量 c 为 256，速率 r 为 1344。SHAKE256 的容量为 512，速率为 1088。输出前的吸收过程还使用 SHAKE 的域分隔，因而与相同速率的固定长度 SHA-3 不同。

:::example 同样取 128 位
[输入]
ASCII abc，分别运行 SHAKE128 与 SHAKE256，每种输出 128 位。
[结果]
SHAKE128 为 5881092dd818bf5cf8a3ddb793fbcba7。
SHAKE256 为 483366601360a8771c6863080cc4114d。
[说明]
两段各为 16 字节。名称和输出位数是两个不同的信息。
:::

## 挤出和前缀
<!-- sources: nist, engine -->

一次消息的吸收只进行一遍。挤出阶段从状态的速率区域取位，若该部分耗尽而输出还不足，就再执行一次置换继续读。对同一实例和消息，较长输出的开头与短输出相同。

:::example 同一实例延长输出
[输入]
ASCII abc，SHAKE128 输出 256 位。
[结果]
5881092dd818bf5cf8a3ddb793fbcba74097d5c526a6d35f97b83351940f2cc8
[说明]
前 32 个十六进制字符等于上一例的 128 位结果。
:::

## 位长与字节长
<!-- sources: nist, engine -->

标准以位给出目标长度。有些编程库在调用时以字节表示输出长度，因此同一请求可能写为 128 位或 16 字节。十六进制每字节占两个字符，按这三个单位核对可避免误把结果加长八倍。

:::example 零字节消息的短输出
[输入]
空消息，SHAKE256 请求 16 字节。
[结果]
46b9dd2b0ba88d13233b3feb743eeb24
[说明]
16 字节等于 128 位，输出显示为 32 个十六进制字符。
:::

## 输出用途和强度
<!-- sources: nist -->

附录 A 讨论输出长度对碰撞和原像性质的影响。即使使用 SHAKE256，短输出也会限制结果的碰撞抗性。需要多个不同用途或长度的结果时，协议还要考虑前缀关系，不能把同一输出的长短版本当作相互独立的结果。

## 常见误区

- SHAKE128 的名称不要求每次都输出 128 位。
- 同一消息同一实例延长输出，已有前缀保持相同。
- 即使输出长度一样，SHAKE256 与 SHA3-256 也使用不同域分隔。
