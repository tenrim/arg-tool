---
capabilityId: native:buddha-codec
title: 佛又曰 V2
topicGroup: encoding
summary: 在 CryptoJS 的口令密文外叠加佛语字符表和格式标记。
aliases:
  - 佛语编码
  - Takuron V2
  - AES 口令密文
sources:
  - id: buddha
    title: takuron/talk-with-buddha
    publisher: takuron
    url: https://github.com/takuron/talk-with-buddha
    language: en
    kind: author-spec
    locator: V2 字符表与加解密流程
  - id: aes
    title: brix/crypto-js
    publisher: brix
    url: https://github.com/brix/crypto-js
    language: en
    kind: author-spec
    locator: AES、口令接口及 OpenSSL formatter
  - id: maps
    title: vendor/fun-tools/buddha-map.js
    publisher: 迷雾工具箱
    url: /vendor/fun-tools/buddha-map.js
    language: zh-CN
    kind: implementation
    locator: 65 个替换项
  - id: impl
    title: fun-tools/text-engine.js
    publisher: 迷雾工具箱
    url: /fun-tools/text-engine.js
    language: zh-CN
    kind: implementation
    locator: 编码前缀、口令和逆表
---

## 介绍
<!-- sources: buddha, aes -->

Takuron 的佛又曰 V2 使用 CryptoJS 口令加密，然后把原本的 Base64 文本改写成一套佛语字符。中文外观与内部密码容器是两层。

## 先加密再编码
<!-- sources: aes, buddha -->

口令接口使用随机盐派生密钥和初始向量。OpenSSL 格式的密文开头带固定 Salted__ 标记，Base64 开头因而包含 U2FsdGVkX1。

## 替换表与解码
<!-- sources: buddha, maps, impl -->

V2 移去 Base64 的固定前十个字符，将其余符号替换为 65 项中的对应字符，再加佛又曰：。接收端先逆替换，补回十个字符，再以同一口令解密。

:::example 回读 ASCII
[输入]
佛又曰：楞输婆室罚哆蒙地夜婆沙无婆阇唎啰夜佛迦卢娑俱哆阿南舍陀醯俱陀摩娑他漫；口令留空
[结果]
A
[说明]
留空走原约定口令 takuron.top。
:::

:::example 回读中文例
[输入]
佛又曰：栗娑帝菩唵娑数楞罚南悉喝摩陀耶哆婆伽醯吉谨皤菩利尼罚尼耶萨唎度遮穆漫；口令留空
[结果]
迷雾
[说明]
这里复用一条已生成的固定密文。
:::

## 盐、口令与可复现性
<!-- sources: aes, impl -->

同一明文和口令通常生成不同密文。核对输出时要使用记录下来的完整密文，或者比较解密后的明文。

:::example 指定口令的往返
[输入]
佛又曰：楞婆唵孕罚写曳俱罚摩怛度夜那沙帝皤数室喝尼怛无唎谨度南栗摩怛悉夜羯漫；口令 demo
[结果]
ABC
[说明]
这是另一套口令和盐的固定接收样本。
:::

## 版本与完整性
<!-- sources: buddha, aes, impl -->

同名或相似的佛语编码可能使用完全不同的字表或密文格式。这个封装不带消息认证标签；得到可读文本只说明当前解码路径给出了候选。

## 常见误区

- 同样内容产生不同密文是随机盐的正常结果。
- 字表转换本身没有密码学强度。
- 佛论禅、佛又曰以及第三方变体之间需先确认版本。

