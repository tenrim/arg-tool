---
capabilityId: op:Derive%20EVP%20key
title: 派生 EVP 密钥
topicGroup: authentication
summary: 复刻传统 EVP_BytesToKey 的摘要链，说明旧格式对盐、算法和长度的约定。
aliases:
  - Derive EVP key
  - EVP_BytesToKey
  - 传统 OpenSSL 密钥派生
sources:
  - id: openssl
    title: EVP_BytesToKey
    publisher: OpenSSL
    url: https://docs.openssl.org/3.0/man3/EVP_BytesToKey/
    language: en
    kind: official-doc
    locator: 键与 IV 的分配、摘要链定义及八字节盐
  - id: cryptojs
    title: CryptoJS EvpKDF
    publisher: CryptoJS
    url: https://github.com/brix/crypto-js/blob/develop/src/evpkdf.js
    language: en
    kind: implementation
    locator: 计算连续的摘要块、iterations、keySize 的字数计量
  - id: engine
    title: CyberChef 11.5.0 密码模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Ciphers.js
    language: en
    kind: implementation
    locator: Derive EVP key：CryptoJS EvpKDF 参数、盐解释与十六进制输出
---

## 介绍
<!-- sources: openssl, cryptojs -->
EVP_BytesToKey 是一种传统的口令派生方法。在一些旧软件格式里，口令与盐通过摘要链形成足够长的字节串，供算法取出密钥乃至初始化向量。复核旧数据时需先确认原格式采用的派生方法。

## 摘要链和重复计算
<!-- sources: openssl, cryptojs -->
设 D₀ 为空，第 i 块的输入为 Dᵢ₋₁∥口令∥盐。对它做一次摘要，再把中间结果逐次做摘要，直到达到迭代次数 c，形成 Dᵢ。最后连接 D₁、D₂……，再从开头取所需字节。

## 密钥、IV 和盐
<!-- sources: openssl, engine -->
传统 OpenSSL 接口按密码算法申请密钥和 IV，然后从同一连接序列依次分配。这个操作按要求的总长度输出十六进制，并不替材料决定应拆成哪两段。经典 OpenSSL 格式的盐为 8 字节。

## 传统摘要链的例子
<!-- sources: openssl, cryptojs, engine -->
以下使用口令 demo-one，盐为 00 01 02 03 04 05 06 07，摘要为 MD5，仅对照旧规则。

:::example 输出首块
[输入]
迭代 1，输出 128 位
[结果]
25db02190271224e9345a20c136b749f
[说明]
MD5 输出 16 字节，所需长度等于 D₁。
:::

:::example 请求两块
[输入]
同一口令、盐，迭代 1，输出 256 位
[结果]
25db02190271224e9345a20c136b749fa60aaf728248433e5e6d0947e5e5d6ee
[说明]
前 16 字节为 D₁，后 16 字节由 D₁ 与同一口令和盐推导。
:::

:::example 每块做两次摘要
[输入]
仍输出 128 位，迭代改为 2
[结果]
33d6a9124d53dbcd0e276d229d689fa6
[说明]
在本例第一次 MD5 的 16 字节输出上再做一次 MD5。
:::

## 复核历史记录
<!-- sources: openssl, cryptojs, engine -->
历史文件可能采用不同摘要、盐和迭代值。读取对应资料时要先确定这些输入，再按格式约定分离结果的密钥段和 IV 段。OpenSSL 文档还注明新应用可采用 PBKDF2 等标准口令派生方案。

## 常见误区
- 生成的结果属于派生字节，不能直接当作旧文件中的密文。
- 必须按格式核对盐字节，不可随意使用十六进制字符本身。
- 复用同一个口令不能保证不同旧格式使用相同的摘要链条件。
