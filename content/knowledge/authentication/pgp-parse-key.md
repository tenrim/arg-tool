---
capabilityId: op:Parse%20PGP%20Key
title: 解析 PGP 密钥
topicGroup: authentication
summary: 读取 OpenPGP 主密钥的创建时间、算法、完整指纹和 Key ID。
aliases:
  - Parse PGP Key
  - OpenPGP 指纹
  - Key ID
  - PGP 密钥信息
sources:
  - id: std
    title: RFC 9580 — OpenPGP
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc9580.html
    language: en
    kind: standard
    locator: §§3.3、5.5.4、6.2、10.1 及附录 A.1、A.3，密钥指纹及公开向量
  - id: openpgp
    title: OpenPGP.js API Documentation
    publisher: OpenPGP.js / Proton
    url: https://docs.openpgpjs.org/
    language: en
    kind: official-doc
    locator: OpenPGP key reader 与 key properties
  - id: engine
    title: CyberChef 11.5.0 — PGP 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/PGP.js
    language: en
    kind: implementation
    locator: Parse PGP Key，显示首个读入密钥的公开属性
---

## 介绍
<!-- sources: std, openpgp, engine -->

OpenPGP 密钥解析读取密钥材料的公开信息，例如密钥包版本、创建日期、公钥算法和指纹。完整的可转移密钥还可能含有子密钥和用户标识，逐包读出的信息范围通常大于单一主密钥报告。

## v4 和 v6 的指纹规则
<!-- sources: std -->

v4 主密钥指纹为 SHA-1 的 20 字节结果。将字节 99、2 字节大端包体长度和主公钥包体依次拼接后哈希，取指纹低端 64 位作为 Key ID。v6 在包体前使用字节 9B 和 4 字节大端长度，通过 SHA-256 生成 32 字节指纹，Key ID 取指纹高端 64 位。

## 解析公开字段
<!-- sources: std, openpgp, engine -->

私钥包也包含公开字段，正常情况下可从公钥块和配对私钥块读到相同主钥指纹。工具当前显示主密钥的公开详情。把多个独立密钥块串接成一段文字时，报告中可只出现第一个识别到的密钥，核对其他密钥可逐块处理。

## 对照版本和指纹的实例
<!-- sources: std, engine -->

前两例来自标准的公开向量。解析后可以直接使用 RFC 的包体重新计算哈希。第三例检查固定入口与输入中实际块的关系。

:::example v4 示例的 Key ID
[输入]
RFC 9580 附录 A.1 的公开 Ed25519Legacy 密钥。
[结果]
指纹 C959BDBAFA32A2F89A153B678CFDE12197965A9A，Key ID 为 8CFDE12197965A9A。
[说明]
最后 16 个十六进制字符对应 64 位 Key ID。主公钥包体长 51 字节，哈希材料的前缀为 99 00 33。
:::

:::example v6 示例的 Key ID
[输入]
RFC 9580 附录 A.3 的公开 Ed25519 证书，主公钥包体长 42 字节。
[结果]
指纹 CB186C4F0609A697E4D52DFA6C722B0C1F1E27C18A56708F6525EC27BAD9ACC9，Key ID 为 CB186C4F0609A697。
[说明]
首 16 个十六进制字符对应 Key ID。输入哈希的前缀为 9B 00 00 00 2A。
:::

:::example 同一测试密钥的公私两块
[输入]
将生成的 RSA-2048 测试公钥块和对应私钥块分别解析。
[结果]
两次都显示 v4、RSA、2048 位、相同的主密钥指纹与 Key ID。
[说明]
报告用公开部分计算。公开字段相同不意味着私钥块可以公开。
:::

## 用报告核对外部密钥
<!-- sources: std, engine -->

验证一份陌生公钥时，完整指纹适合与可信来源给出的值逐字符比对。短 Key ID 可帮助定位候选，但不能给出对身份和用途的全部判断。预测签名或加密会用哪条子密钥时，还需要查找该子钥及其绑定信息。

## 常见误区

- v4 与 v6 的 Key ID 从指纹中取的方向不同。
- 用户 ID 命名相同不能替代比较完整公钥指纹。
- 只显示主密钥不代表没有子密钥或签名包。

