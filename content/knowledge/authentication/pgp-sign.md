---
capabilityId: op:PGP%20Sign
title: PGP签名
topicGroup: authentication
summary: 由签名者私钥为原文生成包含正文与签名包的 OpenPGP 消息。
aliases:
  - PGP Sign
  - OpenPGP 消息签名
  - 内联签名
  - 签名包
sources:
  - id: std
    title: RFC 9580 — OpenPGP
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc9580.html
    language: en
    kind: standard
    locator: §§5.2、5.4、5.6、5.9、6、10.3–10.4，签名类型和消息结构
  - id: keybase
    title: Keybase OpenPGP Library
    publisher: Keybase
    url: https://github.com/keybase/kbpgp
    language: en
    kind: official-doc
    locator: PGP 密钥导入、消息签名和验签
  - id: engine
    title: CyberChef 11.5.0 — PGP 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/PGP.js
    language: en
    kind: implementation
    locator: PGP Sign，使用指定私钥生成可携带正文的消息
---

## 介绍
<!-- sources: std, keybase -->

OpenPGP 签名把一段正文与签名者的密钥关联起来。收到消息的人可以用签名者的公钥检查对应关系。正文可与签名放在一个 OpenPGP 消息里，也可以在协议规定的分离形式中另行保留。

## 签名包和正文结构
<!-- sources: std, engine -->

内联签名可由单遍签名包、字面数据包及其后的签名包组成。字面数据包可以承载文本与相关信息。签名包除了算法输出还记录版本、签名类型及与计算有关的元数据。格式可以在此结构外增加压缩封装，解析后再取得内部层次。

## 文本封装与加密的区别
<!-- sources: std, keybase, engine -->

ASCII Armor 中的 PGP MESSAGE 字样表示一种可传递的 OpenPGP 消息。同一标签可包载已签名、加密或压缩的二进制数据。此入口输出内联签名，不为接收者加密。没有签名者私钥的人仍可通过正确格式读取其中正文，并通过公钥验签。

## 签署后查看实际结构
<!-- sources: std, keybase, engine -->

使用临时 RSA-2048 测试身份 Sample Sender 和消息 MIST 换行接 Layer 2。下面将正文封装、验证和密钥口令分别核对。

:::example 签署两行文本
[输入]
用 Sample Sender 的私钥签署 MIST 和 Layer 2 两行。
[结果]
得到 PGP MESSAGE。测试样本的外层为类型 8 压缩包，展开后依次出现类型 4、11、2。
[说明]
三个包分别用于先告知将出现签名、携带明文以及携带实际签名。
:::

:::example 签名与原文一起携带
[输入]
直接以第一例生成的 PGP MESSAGE 给对应公钥做验签。
[结果]
通过验证，显示已关联的签名信息，并恢复原文 MIST 和 Layer 2。
[说明]
原文就在消息内，与分离签名只单独传签名包的工作方式不同。
:::

:::example 被口令保护的签署私钥
[输入]
生成一个由 TEST-ONLY-SENDER 保护的临时 PGP 私钥，签署同一条短消息时提供该测试口令。
[结果]
签署输出可由该密钥对中的公钥验证。
[说明]
生成阶段必须能打开私钥。验证过程使用公钥和签名的数据，不消费私钥口令。
:::

## 保留签署结果的原始字节
<!-- sources: std, engine -->

二进制消息与其文本封装应按实际格式完整保存。若交换压缩、字面数据与签名包，需要保持所有被签署的字节及对应元数据。签名不具有加密的保密效果，正文字段和生成时间也可能公开显示。

## 常见误区

- PGP MESSAGE 的标题不能提示该内容一定已加密。
- 该签署方式会携带正文，不能按只有分离签名的文件处理。
- 一段签名可以用公钥来验证，但公钥的身份仍要通过可信渠道确认。

