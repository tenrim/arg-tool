---
capabilityId: pair:PGP%20Encrypt%20and%20Sign
title: PGP 加密签名与解密验签
topicGroup: modern
summary: 将发送者签名装入接收者可解密的 OpenPGP 消息，分别验证两层证据。
aliases:
  - PGP Encrypt and Sign
  - PGP Decrypt and Verify
  - OpenPGP 签名后加密
  - 加密验签
sources:
  - id: std
    title: RFC 9580 — OpenPGP
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc9580.html
    language: en
    kind: standard
    locator: §§2.1–2.2、5.1–5.2、5.4、10.3，混合加密和内联签名
  - id: keybase
    title: Keybase OpenPGP Library
    publisher: Keybase
    url: https://github.com/keybase/kbpgp
    language: en
    kind: official-doc
    locator: PGP 密钥、消息和签名实现说明
  - id: engine
    title: CyberChef 11.5.0 — PGP 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/PGP.js
    language: en
    kind: implementation
    locator: PGP Encrypt and Sign / PGP Decrypt and Verify，双角色所需密钥
---

## 介绍
<!-- sources: std, keybase -->

OpenPGP 可以将签名和加密组合。签名关联发送者的私钥与消息内容，加密限制能读取正文的接收者。要恢复并验证这样一份消息，需要接收者的私钥以及发送者的公钥。

## 签名与加密的先后
<!-- sources: std, engine -->

典型的签名后加密结构把消息与签名一起放进加密容器。正文由临时会话密钥处理，每个接收者用其公钥保护一份会话密钥副本。接收者打开容器后，再用签名者的公钥核验正文与签名的一致性。

## 两种密钥角色
<!-- sources: std, keybase, engine -->

签名者私钥用于签名。接收者公钥用于封装会话密钥。解密时以接收者私钥恢复会话密钥，再用原签名者公钥检查签名。这四份材料可以来自两个不同人，不必由同一人同时扮演发送者和接收者。

## 固定内容与临时测试身份
<!-- sources: std, keybase, engine -->

用各自独立生成的 Sample Sender（RSA-2048）、Sample Recipient（ECC-256）和 Sample Other（ECC-256）测试。由 Sender 签署原文 MIST 换行后接 Layer 2，再向 Recipient 加密。

:::example 正确的一对解密和验证密钥
[输入]
接收者 Recipient 的私钥及正确保护口令，签名者 Sender 的公钥，原加密签名消息。
[结果]
恢复 MIST 与 Layer 2 两行，并显示签名者姓名、指纹和签名时间。
[说明]
接收者私钥打开外层保护，发送者公钥验证加密容器内的签名。
:::

:::example 解开外层但缺少对应的签名公钥
[输入]
保留 Recipient 的正确私钥，将核验的公钥换成 Sample Other。
[结果]
验证失败，报告找不到对应的签名密钥。
[说明]
解密所需的秘密和验签公钥是两个独立输入，拥有其中一份没有完成另一个检查。
:::

:::example 换成非接收者的私钥
[输入]
保留 Sender 公钥，改用 Sample Other 的私钥执行解密验签。
[结果]
无法找到可用于解密该会话密钥的私有材料，未获得验签成功的正文。
[说明]
容器中的接收者记录以实际接收者的加密密钥建立，签名者公钥不能解开它。
:::

## 报告的证据边界
<!-- sources: std, keybase, engine -->

消息的加密容器通过完整性检查和发送者签名通过验证，各自回答不同问题。工具显示的签名者名字来自随钥匙保存的身份字段，归属应与从可信途径取得的公钥指纹对应。若只有密文与某一把候选钥匙，能否成功验证还取决于实际接收对象及签名结构。

## 常见误区

- 解密成功并不自动说明存在有效的发送者签名。
- 签名者的公钥可以用于验证，不能充当接收者的私钥。
- 外层 PGP MESSAGE 标签不会说明里面有没有签名。

