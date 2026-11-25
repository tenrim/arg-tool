---
capabilityId: op:Bcrypt%20compare
title: 校验 Bcrypt 哈希
topicGroup: authentication
summary: 用记录所带的盐和成本重算单个候选，辨认匹配结果。
aliases:
  - Bcrypt compare
  - bcrypt 验证
  - 校验候选文本
sources:
  - id: paper
    title: A Future-Adaptable Password Scheme
    publisher: Niels Provos / David Mazières · USENIX
    url: https://www.usenix.org/legacy/events/usenix99/provos/provos_html/
    language: en
    kind: author-spec
    locator: Eksblowfish、盐和可增长的指数成本
  - id: bsd
    title: crypt(3) OpenBSD
    publisher: OpenBSD
    url: https://man.openbsd.org/crypt.3
    language: en
    kind: official-doc
    locator: $2b$、工作因子、128 位盐和长度限制
  - id: engine
    title: CyberChef 11.5.0 加密模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Bcrypt compare 调用 bcrypt compare 并返回 Match 或 No match
---

## 介绍
<!-- sources: paper, bsd -->
bcrypt 校验接收一条完整记录和一个候选口令。它按记录保存的版本、盐和成本对候选重算，再与储存验证值比较。这样可以检查给定口令，不需要提取记录生成时输入的原文。

## 用原记录的盐重新计算
<!-- sources: paper, bsd, engine -->
哈希生成中盐通常为随机值。校验必须采用这条记录原先的盐，否则相同内容也会生成别的结果。完整记录还提供可识别的版本和工作成本，只有派生尾段不足以校验。

## 文本和字节限制
<!-- sources: bsd, engine -->
候选在进入算法前要转换为对应字节。一个字符可能使用多个 UTF-8 字节。bcrypt 的口令长度限制按字节计，超长输入的具体行为还取决于调用程序和引擎。各端要遵守相同的输入规则。

## 样例口令校验
<!-- sources: bsd, engine -->
以下使用独立生成的低成本样例哈希 $2b$04$gsF6caJuR4bieUoBYKS.zuUs2/pdOLGRn1lbs2a28Cf37VaPoU//6。没有实际账户或真实口令。

:::example 对应的候选
[输入]
demo-one，完整样例记录
[结果]
Match: demo-one
[说明]
使用样例的原盐和成本计算，得到同一个派生值。
:::

:::example 更换候选
[输入]
demo-two，完整样例记录
[结果]
No match
[说明]
记录、盐和成本都未变，仅更换了候选输入。
:::

:::example 缺少完整记录
[输入]
demo-one，把验证值栏填成 short
[结果]
No match
[说明]
当前界面在这个长度错误样本中也返回未匹配。可用解析先核对格式。
:::

## 错误与匹配状态
<!-- sources: bsd, engine -->
比较结果是对提交内容和记录的一次判断。某些格式错误会和普通不匹配表现相同，需通过解析或验证记录来源另行确认。成功输出会显示候选文本，为了核对存储，不必在其他文档中保存口令。

## 常见误区
- 需要提供完整记录，单有盐或派生段不够。
- 校验采用一个给定候选。
- No match 可以由无效记录引起，不能仅凭这句话定位具体原因。
