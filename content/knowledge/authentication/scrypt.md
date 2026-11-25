---
capabilityId: op:Scrypt
title: Scrypt 哈希
topicGroup: authentication
summary: 用内存困难派生计算从口令和盐形成指定长度的字节串。
aliases:
  - Scrypt
  - scrypt KDF
  - ROMix
sources:
  - id: spec
    title: RFC 7914 The scrypt Password-Based Key Derivation Function
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc7914
    language: en
    kind: standard
    locator: 第 5～6 节算法及第 12 节公开向量
  - id: engine
    title: CyberChef 11.5.0 加密模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Scrypt：UTF-8 输入字节、N、r、p 和 Key length
---

## 介绍
<!-- sources: spec, engine -->
scrypt 是面向口令的密钥派生函数。它在计算中存下许多块，随后以这些块为数据源反复混合。通过内存和时间的组合成本，可以增加每次推导的资源消耗。

## 成本参数
<!-- sources: spec -->
N 是核心工作量参数，应为大于 1 的 2 的幂。r 表示内部块大小，p 是并行化参数。单个 ROMix 实例的主要块数组约占 128×r×N 字节，实际运行还需要额外的内存和控制数据。

## 派生的阶段
<!-- sources: spec, engine -->
先按规范用 PBKDF2-HMAC-SHA-256 建立初始数据块，分给 p 个实例。各实例执行 ROMix，从填满的块中读取并混合。再以此阶段输出作盐执行一次末端 PBKDF2，得到指定字节数。

## 三项完整测试值
<!-- sources: spec, engine -->
以下源自 RFC 7914，输出为 64 字节，折行便于阅读。参数是用于复核不同测试分支的固定输入。

:::example 空口令和空盐
[输入]
空口令、空盐，N=16，r=1，p=1
[结果]
77d6576238657b203b19ca42c18a0497f16b4844e3074ae8dfdffa3fede21442f
cd0069ded0948f8326a753a0fc81f17e8d3e0fb2e0d3628cf35e20c38d18906
[说明]
第一个 RFC 向量验证零字节输入和最小的一组测试配置。
:::

:::example 有较多并行单元的公开向量
[输入]
口令 password，盐 NaCl，N=1024，r=8，p=16
[结果]
fdbabe1c9d3472007856e7190d01e9fe7c6ad7cbc8237830e77376634b3731622
eaf30d92e22a3886ff109279d9830dac727afb94a83ee6d8360cbdfa2cc0640
[说明]
N、r、p 都是作用独立的参数，不可把它们合并成一个迭代数。
:::

:::example 增加 N 的公开向量
[输入]
口令 pleaseletmein，盐 SodiumChloride，N=16384，r=8，p=1
[结果]
7023bdcb3afd7348461c06cd81fd38ebfda8fbba904f8e3ea9b543f6545da1f2d5
432955613f0fcf62d49705242a9af9e61e85dc0d651e40dfcf017b45575887
[说明]
保持 r 为 8、改变 N 和 p，还更换口令与盐，所得输出仍恰为 64 字节。
:::

## 保存信息与复算
<!-- sources: spec, engine -->
标签依赖口令、盐、三项成本参数和长度。把长度写成字节数可以避免同把 64 当成位数的情况。输出十六进制本身只表达派生字节，复算其他输入还需保留参数和盐。

## 常见误区
- 迭代参数 N 不接受任意正整数。
- 64 作为输出长度时指 64 字节。
- KDF 输出不能单独说明使用了哪套盐和参数。
