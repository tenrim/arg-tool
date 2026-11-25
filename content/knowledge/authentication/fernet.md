---
capabilityId: pair:Fernet%20Encrypt
title: Fernet
topicGroup: authentication
summary: 用 AES-CBC 和 HMAC-SHA256 生成带时间戳、IV 与认证标签的令牌。
aliases:
  - Fernet Encrypt
  - Fernet Decrypt
  - AES-CBC 加密与 HMAC 认证封装
sources:
  - id: spec
    title: Fernet Spec
    publisher: Fernet 项目
    url: https://raw.githubusercontent.com/fernet/spec/master/Spec.md
    language: en
    kind: author-spec
    locator: Key Format、Token Fields、Generating、Verifying
  - id: test
    title: Fernet verify.json
    publisher: Fernet 项目
    url: https://raw.githubusercontent.com/fernet/spec/master/verify.json
    language: en
    kind: implementation
    locator: 公开 hello 验证向量
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 相关操作的输入、输出和算法选项
---

## 介绍
<!-- sources: spec -->

Fernet 定义经过认证加密的令牌格式。输入是字节和一个共享密钥，结果用可放入 URL 的 Base64url 表示。封装版本目前以首字节 80（十六进制）表示。

## 同一密钥材料的两部分
<!-- sources: spec -->

密钥经 Base64url 解出 32 字节。前 16 字节用于 HMAC-SHA256，后 16 字节用于 AES-128-CBC。明文进入 CBC 前填充到 16 字节的倍数，每个令牌选择新的 IV。

## 头部和字节边界
<!-- sources: spec, test -->

解掉外层编码可分成版本、8 字节大端时间戳、16 字节 IV、若干加密块和 32 字节认证标签。时间戳表示自 UTC 纪元起经过的秒。读到这些字段不需要密钥，确认它们未被改变需要验证。

:::example 观察公开向量的头部
[输入]
gAAAAAAdwJ6wAAECAwQFBgcICQoLDA0ODy021cpGVWKZ_eEwCGM4BLLF_5CV9dOPmrhuVUPgJobwOz7JcbmrR64jVmpU4IwqDA==
[结果]
版本 80
时间字节 00 00 00 00 1D C0 9E B0
IV 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F
[说明]
解开 Base64url 后依次切出 1、8、16 字节。
:::

## 验证与明文恢复
<!-- sources: spec, test, chef -->

HMAC 覆盖认证字段之前的整段原始字节。检查版本和认证后，才用密钥后半段解密并去填充。某些 API 还能按时间上限拒绝旧令牌。

:::example 用公开密钥验证
[输入]
gAAAAAAdwJ6wAAECAwQFBgcICQoLDA0ODy021cpGVWKZ_eEwCGM4BLLF_5CV9dOPmrhuVUPgJobwOz7JcbmrR64jVmpU4IwqDA==
密钥 cw_0x689RpI-jtRR7oE8h_eQsKImvJapLeSbXpwF4e4=
[结果]
hello
[说明]
规范库提供了固定令牌、共享密钥以及可能使用的时间检查条件。
:::

## 损坏与错误密钥
<!-- sources: spec, chef -->

编码可以成功还原出字节，但认证仍可能失败。修改任一受认证字段应得到错误，而不是部分明文。

:::example 修改公开向量
[输入]
将该令牌中的 Dy021 改成 Dy121，以原密钥解密
[结果]
HMAC 无效，拒绝解密
[说明]
六位组仍可解码，底层令牌与其签注不匹配。
:::

## 常见误区

- 密钥整体长 32 字节，但加密使用的 AES 密钥为 16 字节。
- Base64url 只负责文本包装，不提供保密。
- Fernet 的 HMAC 是共享密钥认证，双方都能生成令牌。

