---
capabilityId: op:GOST%20Sign
title: GOST 消息认证
topicGroup: authentication
summary: 根据对称密钥、分组算法及消息计算短认证码。
aliases:
  - GOST Sign
  - 本站实际生成对称 MAC
sources:
  - id: gost
    title: "RFC 5830：GOST 28147-89: Encryption, Decryption, and MAC Algorithms"
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc5830.html
    language: en
    kind: standard
    locator: 第 4–7 节，分组变换与 MAC
  - id: cp
    title: RFC 4357：Additional Cryptographic Algorithms for GOST
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc4357.html
    language: en
    kind: standard
    locator: 第 8、11 节，参数集标识及替换表
  - id: code
    title: GOSTSign 源代码
    publisher: GCHQ
    url: /vendor/knowledge/cyberchef/src/core/operations/GOSTSign.mjs
    upstreamUrl: https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/GOSTSign.mjs
    license: Apache-2.0
    licenseUrl: /vendor/knowledge/LICENSE.txt
    language: en
    kind: implementation
    locator: run 构造 MAC 算法并生成标签
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 相关操作的输入、输出和算法选项
---

## 介绍
<!-- sources: gost, code -->

消息认证码（MAC）是以共享密钥从消息字节计算的标签。这里的 GOST Sign 使用对称密钥调用分组密码的认证模式。验证者持有同样的秘密，可重复计算标签。

## 旧版 GOST 的分组链接
<!-- sources: gost, cp -->

GOST 28147-89 的认证处理对消息分块，更新链式状态并从末端取出指定长度的结果。RFC 4357 记录了可用的 S 盒参数集合。密钥、消息或表格改变时，结果可以随之变化。

## 消息字节的影响
<!-- sources: gost, code -->

字符编码属于 MAC 输入的一部分。ABC 的三个 ASCII 字节为 41 42 43。若以其他字符集保存，或在末尾增添换行，参加计算的就会是另一组字节。以下使用同一公开演示配置。

:::example 计算三字节的标签
[输入]
GOST 28147-89、E-A，密钥 000102030405060708090A0B0C0D0E0F 重复两次，8 字节全零 IV。
消息 41 42 43，标签 32 位。
[结果]
97 43 95 C2
[说明]
输出为 4 字节。
:::

:::example 修改一字节
[输入]
GOST 28147-89、E-A，密钥 000102030405060708090A0B0C0D0E0F 重复两次，8 字节全零 IV。
消息 41 42 44，标签 32 位。
[结果]
4F E5 64 66
[说明]
换末字节，结果随整个计算改变。
:::

## 截取长度的影响
<!-- sources: gost, code, chef -->

MAC 只保留规定长度的比特。较短标签提高偶然命中的概率。需要按材料规定的长度核验，不能为通过验证临时改短标签。

:::example 取前 16 位
[输入]
GOST 28147-89、E-A，密钥 000102030405060708090A0B0C0D0E0F 重复两次，8 字节全零 IV。
消息 41 42 43，标签 16 位。
[结果]
97 43
[说明]
同一计算的较短标签与 32 位例的开头相同。
:::

## 协议中的含义
<!-- sources: gost, cp, chef -->

MAC 证明消息和共享密钥产生的标签一致。它无法区分多位都知道同一密钥的人，也不提供明文保密。归档记录可能将标签放在字段末尾，保留确切边界才能重算。

## 常见误区

- GOST Sign 的操作名不能据以推断它使用公钥签名。
- 标签的长度不等于原始密钥长度。
- 更换字符编码会改变输入字节和验证结果。

