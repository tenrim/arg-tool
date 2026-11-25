---
capabilityId: pair:RSA%20Encrypt
title: RSA
topicGroup: modern
summary: 通过 RSA 非对称密钥和正确的编码方式加解密较短消息。
aliases:
  - RSA Encrypt
  - RSA Decrypt
  - RSA-OAEP
  - PKCS #1 加解密
sources:
  - id: rsa
    title: RFC 8017 — PKCS #1 RSA Cryptography Specifications
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc8017.html
    language: en
    kind: official-doc
    locator: §§3–5、7–9 与附录 A，密钥、原语、加密、签名和结构
  - id: fips
    title: FIPS 186-5 — Digital Signature Standard
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5.pdf
    language: en
    kind: standard
    locator: §5 RSA 与附录 A.1 IFC 密钥生成
  - id: engine
    title: CyberChef 11.5.0 — Ciphers 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Ciphers.js
    language: en
    kind: implementation
    locator: RSA Encrypt / RSA Decrypt，OAEP、PKCS #1 v1.5 与原始操作
---

## 介绍
<!-- sources: rsa -->

RSA 是公钥密码体系。加密使用接收者的公钥，解密使用对应私钥。对实际字节串使用 RSA 时，需要先根据选定的加密方案将短消息编码成满足格式要求的整数，再执行 RSA 原语。

## 模指数与正反运算
<!-- sources: rsa, fips -->

两素数形式的模数 n 为 p × q，公开指数 e 与私有指数 d 由密钥生成规则配对。若消息代表值 m 处于 0 至 n−1，RSA 加密原语把它转换为 mᵉ mod n，解密原语用 d 对密文代表值求模幂后还原原整数。加解密方案会在整数运算前后处理字节次序、长度和消息格式。

## OAEP 及消息长度
<!-- sources: rsa, engine -->

RSA-OAEP 使用哈希、掩码生成函数和随机种子编码消息。设模数的字节长度为 k，哈希输出长为 hLen，那么消息最长为 k − 2hLen − 2 字节。RSAES-PKCS1-v1_5 使用另一种填充和长度规则，无法拿同一密文直接切换方案解开。实际加密系统常用 RSA 保护短的会话密钥，对长消息使用对称加密。

## 计算及加解密例子
<!-- sources: rsa, engine -->

第一例只演示整数部分。第二到第四例使用独立生成的 2048 位测试密钥和 OAEP，核对字节长度、随机性与输出能否恢复。

:::example 小整数的正反模幂
[输入]
n = 3233，e = 17，d = 2753，消息整数 65。
[结果]
65¹⁷ mod 3233 = 2790，2790²⁷⁵³ mod 3233 = 65。
[说明]
这是一组教学用小整数，无随机化和填充，不具备实际的保密强度。
:::

:::example OAEP 往返
[输入]
同一对 2048 位测试密钥，加密 UTF-8 文本 MIST，采用 OAEP、SHA-256 和同样的掩码算法。
[结果]
两次加密各输出 256 字节，密文字节不同。各自用配对私钥及原参数解密，均恢复 MIST。
[说明]
密文长度由模数决定。OAEP 的随机种子可使同一条消息的不同加密结果不相同。
:::

:::example 核对 190 字节边界
[输入]
同一 2048 位公钥，OAEP 采用 SHA-256。分别加密 190 个和 191 个 ASCII A。
[结果]
190 字节输入可加密并输出 256 字节。191 字节输入超出最大长度。
[说明]
k = 256，hLen = 32，256 − 64 − 2 = 190。
:::

:::example 摘要约定不匹配
[输入]
取第二例的一个密文，先用原 SHA-256 设定解密，再改用 SHA-1。
[结果]
按原设定得到 MIST，改用 SHA-1 时报告 OAEP 填充检查失败。
[说明]
密钥相同仍不足以解释正确的填充，哈希与掩码生成约定也须匹配。
:::

## 材料中携带的表示
<!-- sources: rsa, engine -->

十六进制或 Base64 常用于将二进制 RSA 密文带在题文中。这些编码需要先还原为恰好与模数字节数一致的原密文。核对旧记录还要识别 OAEP、早期 v1.5 填充或纯整数示例。若材料写出标签或不同的 MGF 哈希，两端还要使用相同约定。

## 常见误区

- 2048 位模数表示 256 字节密文，不能据此认为 OAEP 可加密 256 字节明文。
- 同一条明文的两份 OAEP 密文可能不同，两份都能正常解密。
- 用私钥生成 RSA 数字签名包含专门的消息编码，不能拿这里的公钥加密流程代替。

