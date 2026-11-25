---
capabilityId: op:Bcrypt%20parse
title: 解析 Bcrypt 哈希
topicGroup: authentication
summary: 从标准哈希记录拆出版本、成本、盐和派生部分，区分读字段与校验口令。
aliases:
  - Bcrypt parse
  - 解析 bcrypt 字段
  - bcrypt 记录
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
    locator: Bcrypt parse：getRounds、getSalt 与剩余字段显示
---

## 介绍
<!-- sources: paper, bsd -->
bcrypt 记录同时保存运行算法所需的元数据和验证值。解析只读取这些字段，便于核对版本或工作成本，也可发现长度或格式不合理的输入。

## 记录的四段
<!-- sources: bsd, engine -->
常见 $2b$ 记录总长 60 字符。版本及两位成本后，以同一段储存 22 字符的盐编码和 31 字符的派生值编码。它们使用 bcrypt 的编码表，编码不等同于通用 MIME Base64。

## 显示的盐前缀
<!-- sources: bsd, engine -->
此解析器显示的 Salt 字段包含版本、成本及 22 字符盐，算法可以整体使用这个前缀。密码字段是在该前缀之后剩下的 31 个字符，不是生成记录时输入的明文。

## 字段和长度示例
<!-- sources: bsd, engine -->
前两条来自低成本的独立样例。第三条展示长度不符合格式时的行为。

:::example 识别前缀与派生值
[输入]
$2b$04$gsF6caJuR4bieUoBYKS.zuUs2/pdOLGRn1lbs2a28Cf37VaPoU//6
[结果]
Rounds 4；Salt $2b$04$gsF6caJuR4bieUoBYKS.zu；Password hash Us2/pdOLGRn1lbs2a28Cf37VaPoU//6
[说明]
前缀共 29 字符，剩余段为 31 字符。
:::

:::example 识别另一个成本
[输入]
$2b$05$F351fVuEMwxoyA7FlJY/juAkTdaCdCBWc3wNn62COp7FsA6n8gmum
[结果]
Rounds 5；Salt $2b$05$F351fVuEMwxoyA7FlJY/ju；Password hash AkTdaCdCBWc3wNn62COp7FsA6n8gmum
[说明]
成本仍由 $2b$ 后的两位数字读出，与派生尾段无关。
:::

:::example 长度错误
[输入]
short
[结果]
报告哈希长度错误（5 与 60 不符）
[说明]
这段普通文字不能按完整 bcrypt 记录拆分。
:::

## 何时用到解析
<!-- sources: paper, bsd, engine -->
检查旧数据时可先查看版本、工作成本和记录长度是否符合系统配置。字段能读出来只能说明这条记录提供了对应字面形式，若要确认与给定样例口令一致，应使用校验操作。

## 常见误区
- 解析出的 Salt 展示包括算法和成本前缀，原始盐只占其中的 22 个编码字符。
- 派生字段不包含原始口令。
- 解析记录字段不等于已完成口令匹配。
