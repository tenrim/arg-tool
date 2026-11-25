---
capabilityId: op:SHA0
title: SHA0 哈希
topicGroup: file-compression
summary: 读取 1993 年 FIPS 180 的原始 SHA 调度规则与附录样例，区分它与 SHA-1。
aliases:
  - SHA-0
  - 原始 SHA
  - FIPS 180
sources:
  - id: original
    title: FIPS PUB 180, Secure Hash Standard
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/Legacy/FIPS/NIST.FIPS.180.pdf
    language: en
    kind: standard
    locator: 第 7 节与附录 A、B
  - id: revision
    title: FIPS PUB 180-1, Secure Hash Standard
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/Legacy/FIPS/fipspub180-1.pdf
    language: en
    kind: standard
    locator: SHA-1 的调度字循环左移
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: SHA0
---

## 介绍
<!-- sources: original, revision -->

SHA-0 是后来的惯称，指 1993 年 FIPS 180 中当时简称 SHA 的算法。它输出 160 位摘要，使用 512 位的消息块。修订版 FIPS 180-1 将算法标为 SHA-1，保留整体构形但修改消息扩展。

## 补齐和字序
<!-- sources: original -->

原始 SHA 对输入追加一个 1 和必要的零，使剩余恰好可写入 64 位原始长度。每块按大端解释为十六个 32 位字。输入长度为 448 位时，也必须增添 1 位和足够的零，计算会占用第二块。

:::example 附录的第一块
[输入]
ASCII abc，十六进制 61 62 63。
[结果]
第一个消息字为 0x61626380，最后一个字为 0x00000018。
[说明]
最高置位 80 来自补齐，原始三字节共 24 位。
:::

## 由十六个字扩展到八十个字
<!-- sources: original, revision -->

迭代 t 从 16 开始，SHA-0 将 t−3、t−8、t−14、t−16 的既有字异或，直接作为 Wt。SHA-1 又把这个异或值向左旋转一位。两者摘要宽度一致，这一循环移位改动已经足以让同一消息产生不同结果。

:::example 相同输入区分版本
[输入]
ASCII abc，按 FIPS 180 的原始算法计算。
[结果]
0164b8a914cd2a5e74c4f7ff082c4d97f1edf880
[说明]
该值来自 FIPS 180 附录 A。按 SHA-1 则得到 a9993e364706816aba3e25717850c26c9cd0d89d。
:::

## 分块压缩与回加
<!-- sources: original, engine -->

五个工作字在每块中迭代 80 步，按阶段使用不同的逻辑函数与常量。处理一块后把工作值按 32 位模加到旧链值，再处理下一块。最终串接五个状态字。

:::example 附录 B 的双块向量
[输入]
abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq
[结果]
d2516ee1acfa5baf33dfc1c471e438449ef134c8
[说明]
56 字节输入触发双块填充，可同时检验链值如何传到下一块。
:::

## 历史文档识别
<!-- sources: original, revision -->

旧资料仅标 SHA 时，发布日期、规范号与已知样例很有用。若需要兼容读取已有摘要，应先核对 FIPS 180 或 FIPS 180-1 的出处。重新设计有安全要求的协议时，应参考当前所采用的散列标准。

## 常见误区

- SHA-0 的字扩展异或后无需再左旋一位，SHA-1 才有这个步骤。
- 两者都是 160 位摘要，不能按宽度分辨。
- FIPS 180 与 FIPS 180-1 是不同版本。
