---
capabilityId: op:Generate%20PGP%20Key%20Pair
title: 生成 PGP 密钥对
topicGroup: modern
summary: 创建带主密钥、身份与用途信息的 OpenPGP 密钥块。
aliases:
  - Generate PGP Key Pair
  - OpenPGP 密钥对
  - 主密钥和子密钥
  - PGP 密钥生成
sources:
  - id: std
    title: RFC 9580 — OpenPGP
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc9580.html
    language: en
    kind: standard
    locator: §§3.7、5.5、5.11、10.1–10.2，私钥保护及可转移密钥
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
    locator: Generate PGP Key Pair，RSA 与 EC 测试类型及文本封装
---

## 介绍
<!-- sources: std, keybase -->

OpenPGP 的公钥通常作为多种数据包的组合发布，包含主密钥，也可以带用户标识、自签名及子密钥。配对私钥包含须保密的值，可以另用口令保护。生成密钥对负责创建这些对应材料，公钥可用来加密给持有者或验证他签署的消息。

## 主密钥、子密钥和身份
<!-- sources: std, engine -->

主密钥是可转移密钥的核心。附加的用户名、邮件地址与用户 ID 相关，自签名把它们与该主密钥关联。子密钥可以有自己适用的用途和期限，由绑定签名记录其与主密钥的关系。一份有姓名和邮箱的公钥也需要独立途径来证实真实归属。

## 私有部分及口令保护
<!-- sources: std, keybase, engine -->

OpenPGP 私钥包附有对应的公开参数和秘密参数。密钥文件设口令时，口令通过规范允许的 S2K 机制导出保护所需的信息，主要用于保护静态保存的秘密材料。公开密钥块本身不因私钥口令而需要解锁。

## 用生成的测试材料核对
<!-- sources: std, keybase, engine -->

下列输入仅为工具内生成的测试身份。生成内容会变化，核对的是包的关联、版本、口令使用及输出边界。

:::example 生成 RSA 公钥和私钥
[输入]
RSA-2048，公开测试身份 Sample Sender，邮箱 sender@example.org。
[结果]
生成 PGP PRIVATE KEY BLOCK 与 PGP PUBLIC KEY BLOCK。独立解析公钥可见 v4 主公钥包、用户 ID、自签名及子密钥。
[说明]
RSA 主模数为 2048 位。公开部分的指纹可取主公钥包的 v4 哈希得到，与私钥块中对应公钥指纹相同。
:::

:::example 同名身份重新生成
[输入]
保持测试身份内容和曲线选择，新生成另一对 ECC-256 密钥。
[结果]
新公钥仍带相同的身份字段，主公钥指纹不同。
[说明]
标识文字与密钥材料独立，指纹由公钥包的字节决定。
:::

:::example 私钥口令保护
[输入]
生成有测试口令 TEST-ONLY-SENDER 的 RSA 密钥，用它签署文本 MIST。
[结果]
用原口令可完成签署。公开块可单独用于验签。
[说明]
口令用于解锁本地秘密材料。公钥本身供验证者独立读取。
:::

## 保存可转移密钥
<!-- sources: std, keybase -->

文本保护头中的 PUBLIC 和 PRIVATE 表示不同用途。分享测试公钥前可先核对完整指纹。正式应用的密钥生成、口令保护、备份和撤销属于独立的密钥管理过程，教学工具的生成结果不宜直接用作生产密钥。

## 常见误区

- 两份公钥显示相同邮箱，并不能证明是同一把钥匙。
- 用户 ID 改变不必然改变主密钥材料，需按主密钥包核对指纹。
- 私钥的口令可保护私钥保存形式，不能取代公钥加密所用的接收者身份。

