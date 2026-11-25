---
capabilityId: op:CMAC
title: 分组密码消息认证码
topicGroup: authentication
summary: 用分组密码与末块子密钥生成固定长度的认证标签，解释完整末块和填充末块。
aliases:
  - CMAC
  - AES-CMAC
  - 分组认证
sources:
  - id: rfc
    title: RFC 4493 The AES-CMAC Algorithm
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4493
    language: en
    kind: standard
    locator: 第 2、4 节，子密钥、末块与示例
  - id: engine
    title: CyberChef 11.5.0 加密模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: CMAC：AES 和 Triple DES 密钥与分组分支
---

## 介绍
<!-- sources: rfc, engine -->
CMAC 用共享密钥和分组密码计算消息认证码。发送方可以把标签连同明文送出，接收方用同一密钥与原消息字节独立计算标签进行核对。

## 子密钥的导出
<!-- sources: rfc, engine -->
AES-CMAC 先用密钥加密全零块，得到 L。在二元域中将 L 加倍得到 K₁，再加倍得到 K₂：每次按位左移，若最高位原为 1，再异或约化常量。对 128 位 AES 分组，常量的最低字节是 87（十六进制）。

## 链式处理的最后一块
<!-- sources: rfc, engine -->
消息按分组依次与链值异或后加密。最后一块若刚好填满，用 K₁ 异或它。若未填满或消息为空，则补一个置位位和若干零，用 K₂ 异或后再进入加密链。全零链值是起点。

## 公开测试向量
<!-- sources: rfc, engine -->
下列使用 RFC 4493 中的 AES 公开测试密钥 2b7e151628aed2a6abf7158809cf4f3c。样本全部以真正的十六进制字节解析。

:::example 空消息
[输入]
零字节消息
[结果]
bb1d6929e95937287fa37d129b756746
[说明]
空消息仍有填充末块，采用 K₂。
:::

:::example 恰好一块
[输入]
6bc1bee22e409f96e93d7e117393172a
[结果]
070a16b46b4d4144f79bdd9dd04a287c
[说明]
这里是 16 字节完整末块，采用 K₁。
:::

:::example 40 字节消息
[输入]
6bc1bee22e409f96e93d7e117393172a
ae2d8a571e03ac9c9eb76fac45af8e51
30c81c46a35ce411
[结果]
dfa66747de9ae63030ca32611497c827
[说明]
前两块各 16 字节，末块只有 8 字节，填充后使用 K₂。
:::

## 同一协议里的标签
<!-- sources: rfc, engine -->
具体协议会规定首次参与计算的消息字节、所用分组密码及标签长度。本站 AES 分支直接给出 16 字节标签，Triple DES 分支使用另一分组宽度。两端要对规则和密钥达成一致。

## 常见误区
- 空消息仍可以有认证标签。
- 标签不携带可逆的消息内容。
- 手工填充消息再交给完整 CMAC 过程，可能会改变末块规则。
