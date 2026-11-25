---
capabilityId: pair:CipherSaber2%20Encrypt
title: CipherSaber2
topicGroup: modern
summary: 把 10 字节随机 IV 与 RC4 派生密钥流组合成可往返的历史格式。
aliases:
  - CipherSaber2 Encrypt
  - CipherSaber2 Decrypt
  - 10 字节 IV 与多轮 RC4 调度
sources:
  - id: code
    title: CipherSaber2Encrypt 的随机 IV 和封装
    publisher: GCHQ
    url: /vendor/knowledge/cyberchef/src/core/operations/CipherSaber2Encrypt.mjs
    upstreamUrl: https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/CipherSaber2Encrypt.mjs
    license: Apache-2.0
    licenseUrl: /vendor/knowledge/LICENSE.txt
    language: en
    kind: implementation
    locator: run，10 字节 IV 与二进制输出
  - id: core
    title: CipherSaber2 调度源码
    publisher: GCHQ
    url: https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/lib/CipherSaber2.mjs
    language: en
    kind: implementation
    locator: 密钥调度、IV 拼接与异或
  - id: rc4
    title: RFC 6229：Test Vectors for the Stream Cipher RC4
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc6229.html
    language: en
    kind: standard
    locator: 第 2 节的 RC4 向量及第 4 节的安全考虑
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 相关操作的输入、输出和算法选项
---

## 介绍
<!-- sources: code, core -->

CipherSaber2 把源于 RC4 的流密码与一个公开随机 IV 组合成消息格式。发送端和接收端共享密钥。格式开头保存 IV，后面跟等长于原消息的异或结果。

## IV 与状态准备
<!-- sources: code, core -->

每次加密产生 10 个随机字节，并在输出中原样保留它们。调度把这些字节安排在用户密钥字节之后，作用于同一个 256 项状态数组。

:::example 拆分捕获到的样本
[输入]
34 C7 73 36 D5 D6 2B D9 79 41 33 30 96
[结果]
IV：34 C7 73 36 D5 D6 2B D9 79 41
密文主体：33 30 96
[说明]
前 10 字节划给 IV，剩下 3 字节与消息一一对应。
:::

## 多次调度与异或
<!-- sources: core, rc4 -->

CipherSaber2 重复执行初始化置换，轮之间保留调度状态。随后像 RC4 一样生成密钥流并与输入异或。不能把普通 RC4 公开测试向量直接用作 CipherSaber2 带 IV 的完整向量。

:::example 还原三字节消息
[输入]
34 C7 73 36 D5 D6 2B D9 79 41 33 30 96
密钥 000102030405060708090A0B0C0D0E0F，调度 20 次
[结果]
41 42 43
[说明]
保留捕获的 IV 后重复计算同一掩码。
:::

## 轮数不一致的结果
<!-- sources: core, chef -->

解密从保存的 IV 重建状态。轮数没有另行放在密文前缀中，双方须从协议或题面获知。调度不匹配时仍可能得到一段随机样的字节，因为格式本身未带认证标签。

:::example 只调度一次
[输入]
34 C7 73 36 D5 D6 2B D9 79 41 33 30 96
密钥不变，仅调度一次
[结果]
81 07 E8
[说明]
字节数量仍是 3，长度正确不能作为验证。
:::

## 历史材料的核对边界
<!-- sources: rc4, chef, code -->

收到这类文件时可以先核对前缀长度，再比较剩余字节与预期消息。再次执行随机加密会选择新 IV，验证时应固定已有样本或做解密往返。已公布的 RC4 安全局限也适用于理解这一历史方案的用途边界。

## 常见误区

- 前十字节是公开 IV，不是加密密码。
- 同一消息重复加密通常会产生不同前缀。
- 没有认证标签时，错误参数可能正常输出无意义字节。

