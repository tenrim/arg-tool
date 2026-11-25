---
capabilityId: op:MD2
title: MD2 哈希
topicGroup: file-compression
summary: 按字节说明 MD2 的补齐、校验块和置换混合，并对照原始 RFC 的完整摘要。
aliases:
  - MD2
  - Message-Digest 2
  - MD2 校验块
sources:
  - id: rfc
    title: RFC 1319 The MD2 Message-Digest Algorithm
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc1319.txt
    language: en
    kind: standard
    locator: 第 3 节与附录 A.5
  - id: security
    title: RFC 6149 MD2 to Historic Status
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc6149.txt
    language: en
    kind: standard
    locator: 摘要与第 2 节
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: MD2
---

## 介绍
<!-- sources: rfc -->

MD2 是一种输出 128 位的消息摘要算法，按字节处理输入，以 16 字节为一组。它在消息后补齐一组字节，再附加一个 16 字节校验块。MD2 的校验块属于计算中间数据，最终摘要来自另一个状态数组。

## 分块与补齐
<!-- sources: rfc, engine -->

增加 p 个值都为 p 的字节，使补齐后长度为 16 的倍数，其中 p 等于 16 减原长度对 16 的余数。即使原长已经整除 16，包括空输入，也加一整块。算法继续处理所得的至少一个补齐块。

:::example 空消息
[输入]
零字节。
[结果]
8350e5a3e24c153df2275c9f80692773
[说明]
补齐块的 16 个字节都是十六进制 10，随后再附加校验块参与混合。
:::

## 附加校验块
<!-- sources: rfc -->

16 个校验槽初始为零。扫描补齐后的各块时，算法将当前消息字节和上一次得到的校验值异或，经固定置换表得到新分量，再把它异或进对应校验槽。最终把这 16 个槽接在补齐消息后。

:::example 一个字符
[输入]
ASCII a，字节 61。
[结果]
32ec01ec4a6dac72c0ab96fb34c0b5d1
[说明]
首块是 61 后跟十五个 0f。校验块依照 RFC 的置换表另算。
:::

## 状态数组和摘要
<!-- sources: rfc, engine -->

每块进入一个 48 字节数组。中间 16 字节保存本块，末尾 16 字节是本块与先前状态的异或。标准流程对数组进行 18 轮查表混合，全部块处理完才取数组最前 16 字节。

:::example 三字符公开向量
[输入]
ASCII abc，仅 61 62 63。
[结果]
da853b0d3f88d99b30283a69e6ded6bb
[说明]
先补十三个 0d。RFC 附录的向量可核对混合步骤与最终字节次序。
:::

## 历史资料核对
<!-- sources: security, rfc -->

MD2 的原始说明已经转为历史状态。旧清单中的 32 个十六进制字符也可能来自 MD4、MD5 或其他 128 位算法，文件格式或清单说明才是识别算法的直接证据。

## 常见误区

- 补齐后的长度已经对齐时仍需增加完整补齐块。
- 附加的校验块不等于最终 MD2 摘要。
- 相同的十六进制字符数不能区分 MD2 和 MD5。
