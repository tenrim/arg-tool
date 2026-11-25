---
capabilityId: op:Bcrypt
title: Bcrypt 哈希
topicGroup: authentication
summary: 用随机盐与指数工作成本生成口令验证值，说明同一口令产生不同记录的原因。
aliases:
  - Bcrypt
  - Eksblowfish
  - bcrypt 成本
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
    locator: Bcrypt 调用 genSalt 和 hash，并使用 2b 标记及工作因子
---

## 介绍
<!-- sources: paper, bsd -->
bcrypt 为口令验证而设计。它把口令和每条记录的盐送入一个可增加计算成本的算法，将生成的验证值连同版本、成本和盐保存。以后可对候选输入重新计算。

## 盐与派生步骤
<!-- sources: paper, bsd, engine -->
先生成 128 位的随机盐，参与 Eksblowfish 的密钥扩展。相同的口令配不同盐，会得到不同的验证值。盐可随验证值储存，它的作用是让不同记录的计算彼此独立。

## 指数形式的工作成本
<!-- sources: paper, bsd -->
记成本字段为 c，核心扩展的迭代量按 2ᶜ 增长，增加一个单位大致使该部分工作量翻倍。实际用时还取决于实现和设备。bcrypt 的格式也有输入字节上限，UTF-8 的字符个数不能代替字节数。

## 三次生成的实例
<!-- sources: bsd, engine -->
以下使用无实际用途的样例输入与较低成本，只用于展示结构；每次随机结果可以不同。

:::example 第一次生成
[输入]
demo-one，成本 4
[结果]
$2b$04$gsF6caJuR4bieUoBYKS.zuUs2/pdOLGRn1lbs2a28Cf37VaPoU//6
[说明]
标记 04 后连接盐和验证值。该文本共 60 个字符。
:::

:::example 同一材料再次生成
[输入]
demo-one，成本仍是 4
[结果]
$2b$04$3Bel1mC.QpSHegTCJCRBuOYYAsqiXvlqIsu752wJX07zIAxnkd1P6
[说明]
虽然成本与口令未变，程序重新生成盐，整个记录与第一次不同。
:::

:::example 提高样例成本
[输入]
demo-one，成本 5
[结果]
$2b$05$F351fVuEMwxoyA7FlJY/juAkTdaCdCBWc3wNn62COp7FsA6n8gmum
[说明]
成本标记改为 05，2⁵=32，相对 2⁴=16 增加了一个倍增阶。
:::

## 生成记录的用途
<!-- sources: paper, bsd, engine -->
验证时应一并提供存下的完整记录。重新生成一条带不同盐的哈希再进行字符串比较，会把本来相同的输入判断为不同。测试阶段可以用样例验证生成、解析和比较这三个步骤。

## 常见误区
- bcrypt 验证值不可直接解码出原口令。
- 不同记录可由同一口令产生，因为随机盐可不同。
- 成本 5 和成本 4 的差别不是多做一次核心扩展。
