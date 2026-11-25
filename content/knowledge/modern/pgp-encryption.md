---
capabilityId: pair:PGP%20Encrypt
title: PGP
topicGroup: modern
summary: 利用接收者公钥封装会话密钥，再用对称加密保护消息。
aliases:
  - PGP Encrypt
  - PGP Decrypt
  - OpenPGP 混合加密
  - PGP MESSAGE
sources:
  - id: std
    title: RFC 9580 — OpenPGP
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc9580.html
    language: en
    kind: standard
    locator: §§2.1、5.1、5.13、6.2、10.3，消息和会话密钥包
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
    locator: PGP Encrypt / PGP Decrypt，接收者公钥、私钥与口令
---

## 介绍
<!-- sources: std, keybase -->

OpenPGP 的公钥加密将公钥密码和对称加密组合使用。消息内容用新生成的会话密钥保护，该密钥再通过接收者的公钥封装。使用正确的私钥取回会话密钥后，可以还原消息。

## 加密会话密钥和消息包
<!-- sources: std, engine -->

会话密钥由公钥加密会话密钥包记录，包类型为 1。当前常用的受完整性保护加密容器为类型 18。若同一条消息面向多名接收者，规范可在容器前放多份会话密钥记录。下例的固定工具入口只选择一位接收者。

## 文本封装及口令
<!-- sources: std, keybase, engine -->

OpenPGP 二进制结果可以用 ASCII Armor 封装，软件通常用 PGP MESSAGE 边界行标出消息。若收件人的私钥设置了保存口令，解密首先需要能够解锁该私钥。这个口令保护接收者已有的私钥，区别于消息本身另外使用口令的加密形式。

## 加密和还原样例
<!-- sources: std, keybase, engine -->

下列样例使用独立生成的 ECC-256 测试接收者 Sample Recipient，其私钥用公开测试口令 TEST-ONLY-RECIPIENT 保护。输入为 MIST 换行后接 Layer 2。

:::example 从公开密钥加密到私钥解密
[输入]
用 Sample Recipient 的公钥加密上述两行，再用同一接收者的私钥和正确保护口令解密。
[结果]
密文具有 PGP MESSAGE 边界，解密返回原来的两行。
[说明]
读取密文包可见类型 1 的会话密钥记录及类型 18 的受完整性保护数据。
:::

:::example 同文重复加密
[输入]
使用同一接收者公钥，两次分别加密完全相同的原文。
[结果]
两份密文不同，使用对应私钥均能还原相同的 MIST 和 Layer 2。
[说明]
会话密钥与随机化材料由加密过程产生。密文字面差异不必对应原文差异。
:::

:::example 试验错误的私钥保护口令
[输入]
使用该接收者的正确私钥文件，但提供错误的保护口令。
[结果]
导入或解锁私钥失败，未返回可读消息。
[说明]
口令错误发生于打开密钥材料的阶段，区别于用不匹配的接收者密钥或读取损坏的密文。
:::

## 解读携带 PGP 的材料
<!-- sources: std, engine -->

识别出 PGP MESSAGE 后，应根据包类型判断是否经过加密及采用哪一代格式。仅依靠文字边界无法确定收件人或作者。加密可保护内容的机密性，作者身份验证要另看是否带签名以及是否有可信公钥。

## 常见误区

- 从头到尾用接收者公钥处理整篇消息并非这里的工作方式。
- 私钥文件的保护口令通常不能独自解开消息。
- 经过加密的文件不一定有发送者签名。

