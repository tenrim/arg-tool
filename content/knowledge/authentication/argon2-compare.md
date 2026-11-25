---
capabilityId: op:Argon2%20compare
title: 校验 Argon2 哈希
topicGroup: authentication
summary: 从编码记录读取 Argon2 类型、参数与盐，判断给定文本是否得到同一标签。
aliases:
  - Argon2 compare
  - PHC 记录校验
  - 验证 Argon2
sources:
  - id: rfc
    title: RFC 9106 Argon2 Memory-Hard Function
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc9106
    language: en
    kind: standard
    locator: 第 3 节类型、输入、内存组织、标签
  - id: phc
    title: PHC String Format Specification
    publisher: Password Hashing Competition
    url: https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md
    language: en
    kind: author-spec
    locator: 算法、版本、参数、盐与结果字段
  - id: engine
    title: CyberChef 11.5.0 加密模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Argon2 compare：verify、Match 文本及失败 No match
---

## 介绍
<!-- sources: rfc, phc -->
Argon2 校验输入一个候选和一条完整编码记录。读取记录后，以相同的算法及参数推导候选的标签，再确认标签是否匹配。

## 从记录中读出算法条件
<!-- sources: rfc, phc, engine -->
PHC 字符串开头是 Argon2 变体名，v 字段表示版本，m、t、p 是内存、遍数、并行度。后面两段分别编码盐及储存标签。校验还要采用相同的标签长度。

## 匹配状态和读入错误
<!-- sources: phc, engine -->
候选不同会产生不匹配。记录缺掉了算法参数或盐也无法按原规则重算。当前实现将 verify 的失败都显示为 No match，因此可先按记录格式检查输入，再判断是哪一类失败。

## 校验例子
<!-- sources: rfc, phc, engine -->
前两项使用演示记录 $argon2id$v=19$m=64,t=2,p=1$c29tZXNhbHQ$7xVCmV3iseUk4MwwpunnMQ。这些样例从人工输入生成，仅用于对照。

:::example 与原样例匹配
[输入]
demo-one，完整记录
[结果]
Match: demo-one
[说明]
按相同盐和算法参数推导，标签与存储值相同。
:::

:::example 同一记录下换候选
[输入]
demo-two，完整记录
[结果]
No match
[说明]
参数仍在记录中，变化的是候选文字。
:::

:::example 记录不是 PHC 字符串
[输入]
demo-one，编码记录填写 not-phc
[结果]
No match
[说明]
缺少算法、参数、盐和标签字段。界面和候选不匹配使用相同文字。
:::

## 核对标签编码
<!-- sources: phc, engine -->
单独标签可用十六进制传输，但对照原记录时仍要确认盐、参数、标签字节数和版本。正常情况下对一条存储记录只校验所提交的候选。成功时界面还会显示候选文本。

## 常见误区
- 裸标签没有校验所需的其他条件，不能代替完整记录。
- No match 也可能因为记录无法被读取。
- 校验输入与输出都没有提供恢复原口令的步骤。
