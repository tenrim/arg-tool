---
capabilityId: op:PGP%20Verify
title: PGP验签
topicGroup: authentication
summary: 从 OpenPGP 已署名消息中读取正文与签名，并以可信公钥核对。
aliases:
  - PGP Verify
  - OpenPGP 验签
  - 签名者指纹
  - 内联消息验签
sources:
  - id: std
    title: RFC 9580 — OpenPGP
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc9580.html
    language: en
    kind: standard
    locator: §§5.2、5.4、10.3–10.4 与 6.2，签名与消息封装
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
    locator: PGP Verify，匹配签名者公钥、输出签署信息和正文
---

## 介绍
<!-- sources: std, keybase -->

OpenPGP 验签核对消息中的签名与原字节是否匹配。验签需要签名者的公钥。固定工具可处理签名和正文一起携带的消息，在验证完成后显示原文与部分签名元数据。

## 校验签名数据
<!-- sources: std, engine -->

解析时先读取消息结构和签名包。如果消息外包有压缩层，则先展开。签名算法复用相应的数据及签名元数据计算摘要，再用给定的公钥检查算法关系。签名中的 Key ID 可以协助寻找候选，但最终仍需使用匹配的公钥材料。

## 结果与身份来源
<!-- sources: std, keybase, engine -->

验证成立表示签名可由所给公钥确认。姓名和邮箱属于密钥中的用户标识，任何人都可以创建同名标识。要确认已知组织或作者签发了消息，读者需将验签使用的钥匙与从可信渠道取得的完整指纹关联。输出简写的 Key ID 只能作查找线索。

## 正例与两类失败
<!-- sources: std, engine -->

由临时 Sample Sender 私钥签署 MIST 换行接 Layer 2，另生成无关的 Sample Other。三个测试分别检查对应公钥、错误公钥和变更后字面数据。

:::example 旧消息的真实正文
[输入]
提交原样的 PGP MESSAGE 和 Sample Sender 的公钥。
[结果]
验签完成，恢复 MIST 与 Layer 2，显示签名者及其完整指纹和签名时间。
[说明]
原样的消息内包含必要的数据包，无需把原文另行复制进输入。
:::

:::example 同一次验签改用无关公钥
[输入]
保持签署消息不变，使用 Sample Other 的公钥。
[结果]
缺少与签名匹配的公钥，未得到验证成功。
[说明]
这个错误目的是说明签名无法用给定材料确认，不能仅凭这一点判断正文改动了。
:::

:::example 改动内联正文但保留旧签名
[输入]
在自己生成的测试消息内，将字面数据中的 Layer 2 改为 Layer 3，保留签名包和其余字段，重新写出有效的外层封装。
[结果]
使用原 Sender 公钥验证，报告摘要不匹配。
[说明]
修复外层的格式或校验不会更新签名，被签署数据的实际字节已改变。
:::

## 验签成功能确认的范围
<!-- sources: std, keybase, engine -->

要确认实际身份，应结合可信指纹和密钥状态。显示的时间是签名包承载的字段，并不是第三方提供的可信时戳。若手头材料为分离签名，则还需同时有原文和能处理分离形式的入口。

## 常见误区

- 复制部分 PGP MESSAGE 往往破坏封装，失败未必发生在签名数学阶段。
- 名字相同的公钥不能替换为签名人的实际公钥。
- 文本封装的校验与 OpenPGP 数字签名校验是两项不同的检查。

