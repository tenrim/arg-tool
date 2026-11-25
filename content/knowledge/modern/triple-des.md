---
capabilityId: pair:Triple%20DES%20Encrypt
title: Triple DES
topicGroup: modern
summary: 依次执行 DES 加密、解密和加密，保持 64 位分组。
aliases:
  - Triple DES Encrypt
  - Triple DES Decrypt
  - 加密—解密—加密的三段组合
sources:
  - id: fips
    title: FIPS 46-3：Data Encryption Standard
    publisher: NIST
    url: https://csrc.nist.gov/pubs/fips/46-3/final
    language: en
    kind: standard
    locator: TDEA 组合、密钥选项；FIPS 状态
  - id: tda
    title: SP 800-67 Rev. 2：Recommendation for the TDEA Block Cipher
    publisher: NIST
    url: https://csrc.nist.gov/pubs/sp/800/67/r2/final
    language: en
    kind: standard
    locator: 三重 DES 密钥组合、撤回及遗留处理
  - id: modes
    title: NIST SP 800-38A：Block Cipher Modes
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf
    language: en
    kind: standard
    locator: 6.1、6.2，ECB 和 CBC
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作和输入输出定义
---

## 介绍
<!-- sources: fips, tda -->

Triple DES 又称 TDEA，依次把同一个数据块送入三个 DES 变换。分组保持 64 位，密钥组合可包含三段 DES 密钥。该规范现已撤回，适用于理解历史系统数据。

## EDE 的执行顺序
<!-- sources: fips -->

加密先用 K1 做 DES 加密，再用 K2 做 DES 解密，最后用 K3 做 DES 加密。解密采用 K3、K2、K1 的逆过程。中间的解密步骤属于加密定义的一部分。

:::example 三段相同退回单 DES
[输入]
三段均为 133457799BBCDFF1，明文 0123456789ABCDEF，ECB
[结果]
首块 85E813540F0AB405
[说明]
中间相邻的逆变换抵消，结果恰好与单 DES 示例一致。
:::

## 三把密钥与两把密钥
<!-- sources: tda, fips -->

三段不同的钥匙对应三钥情形。历史上也使用 K3 等于 K1 的两钥构造。每段仍含 DES 的奇偶校验位。归档中的 16 或 24 字节记录应按容器确认实际扩展。

:::example 三段不同
[输入]
K1 0123456789ABCDEF，K2 23456789ABCDEF01，K3 456789ABCDEF0123，明文 FEDCBA9876543210，ECB
[结果]
首块 0737F6C53750D4A4
[说明]
完整含填充的密文多一块，核对 EDE 核心只读首块。
:::

:::example 首末相同
[输入]
沿用前例，K3 改成 0123456789ABCDEF
[结果]
首块 B08CCAEFCF225860
[说明]
明确列出 K3，避免把前两段当作整个算法。
:::

## 模式与块边界
<!-- sources: modes, chef -->

CBC 等模式可将前一密文块带入下一次 EDE。填充由模式调用方处理，整个 EDE 底层仍每次将 8 字节变成 8 字节。

## 历史数据的解读
<!-- sources: tda, chef -->

旧的自动柜员机记录、备份格式或密钥包装可能提到 TDEA 算法标识。完整解读还需要模式、IV、密钥组合和填充，这些信息来自协议。

## 常见误区

- 三重运算不会把分组长度改成 192 位。
- 三段 DES 密钥字节数不直接等于协议的有效安全强度。
- EDE 的中间是解密，三个加密顺序属于另一种组合。

