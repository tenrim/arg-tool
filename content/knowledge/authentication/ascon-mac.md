---
capabilityId: op:Ascon%20MAC
title: Ascon 消息认证码
topicGroup: authentication
summary: 介绍 Ascon 置换的独立 MAC 扩展，明确固定引擎的标签、密钥和字节约定。
aliases:
  - Ascon MAC
  - Ascon-Mac
  - 轻量级消息认证
sources:
  - id: authors
    title: Ascon MAC, PRF, and Short-Input PRF
    publisher: Ascon 作者 · CT-RSA
    url: https://eprint.iacr.org/2021/1574
    language: en
    kind: author-spec
    locator: 第 3 节，带密钥置换的 MAC 和 PRF 构造
  - id: nist
    title: NIST Lightweight Cryptography
    publisher: NIST
    url: https://csrc.nist.gov/Projects/lightweight-cryptography/
    language: en
    kind: official-doc
    locator: SP 800-232 已纳入的四种算法及额外 MAC 工作
  - id: engine
    title: CyberChef 11.5.0 加密模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Ascon MAC：小端载入、32 字节吸收、128 位密钥与标签
---

## 介绍
<!-- sources: authors, engine -->
Ascon-Mac 是 Ascon 家族的一种带密钥认证方案。它先将密钥引入内部状态，再吸收消息，最后提取定长标签。消息原文与认证标签分别存在。

## 状态、数据吸收和分域
<!-- sources: authors, engine -->
Ascon 的核心是由五个 64 位字组成的置换状态。固定引擎将 16 字节密钥按小端加载到状态，初始化后以 32 字节为一段吸收消息。消息尾加标记与零填充，再施加最终置换，输出最前两个状态字的 16 字节表示。

## 标准范围和版本
<!-- sources: authors, nist, engine -->
SP 800-232 当前收入 Ascon 的认证加密、固定哈希和可扩展输出函数。独立 Ascon-Mac 由设计者的扩展论文介绍，不属于该文件列出的标准算法。交互实现的初始化常量和端序也要一致，不能只凭 Ascon 这个名称期望同一标签。

## 固定样例
<!-- sources: authors, engine -->
下列样例均使用 16 字节测试密钥 000102030405060708090a0b0c0d0e0f。标签由固定运行实现得到。

:::example 空消息的认证标签
[输入]
零字节消息
[结果]
eac9d74bbedf8bf1eba2862b26aa6d39
[说明]
即使没有正文，初始化和末尾填充仍然进入运算。
:::

:::example 一个值为零的字节
[输入]
单字节 00
[结果]
1df2e1044d7a5a35044770c19d47f1a2
[说明]
00 是一个实际字节，和零字节消息的填充位置不同。
:::

:::example 恰好一个吸收块
[输入]
从 00 到 1F 严格递增的 32 个字节
[结果]
bc47252e6d9b537ac7ff67525aa9964e
[说明]
先吸收完整数据块，另需吸收末尾标记，输出仍为 16 字节。
:::

## 认证范围与使用
<!-- sources: authors, nist, engine -->
用于校对的两端应确认密钥长度、同一消息字节和同一变体。认证码提供有密钥的核对关系。若任务需同时隐去消息内容，应采用明确的认证加密协议，并识别其中的密文和标签字段。

## 常见误区
- 16 字节密钥和 16 字节标签是两个不同值。
- 空消息和单个 NUL 字节可得到不同标签。
- 不同 Ascon 构造或端序不保证测试向量可互换。
