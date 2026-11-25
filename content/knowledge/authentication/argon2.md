---
capabilityId: op:Argon2
title: Argon2 哈希
topicGroup: authentication
summary: 结合盐、内存、遍历次数和平行通道生成固定长度的口令验证值。
aliases:
  - Argon2id
  - Argon2i
  - Argon2d
  - 内存困难口令哈希
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
    locator: Argon2：盐位转换和配置传递，encoded、hashHex 和 hash
---

## 介绍
<!-- sources: rfc, phc -->
Argon2 处理口令或其他输入时需要分配一片内存并反复计算各块。其设计让每次推导都承担显式的内存和时间成本。输出称作标签，可单独表示，也可同参数和盐一起存入验证记录。

## 内存块与参数
<!-- sources: rfc -->
内存参数 m 以 KiB 表示，内部有 1 KiB 的计算块。并行参数 p 决定独立演进的通道数量，t 决定处理的遍数。口令、盐、类型、参数及标签长度等共同参与初值计算。换任何一项都可能改变输出。

## 类型和编码记录
<!-- sources: rfc, phc, engine -->
Argon2d 主要用与数据有关的寻址，Argon2i 用与数据无关的寻址，Argon2id 将两者结合。PHC 字符串写明算法、版本、内存、遍数、并行度、盐和标签。十六进制输出只显示标签，后续校验仍需其他字段。

## 同一短输入的例子
<!-- sources: rfc, phc, engine -->
以下使用演示参数 m=64 KiB、t=2、p=1，标签 16 字节。这组小参数仅便于复算结构。盐按文字的 UTF-8 字节读取。

:::example Argon2id 编码输出
[输入]
demo-one，盐 somesalt，Argon2id
[结果]
$argon2id$v=19$m=64,t=2,p=1$c29tZXNhbHQ$7xVCmV3iseUk4MwwpunnMQ
[说明]
v=19 即十六进制 0x13，记录中的盐字段 c29tZXNhbHQ 解回 somesalt。
:::

:::example 同一标签写成十六进制
[输入]
同一参数与盐，输出 Hex hash
[结果]
ef1542995de2b1e524e0cc30a6e9e731
[说明]
这是完整记录末段所包含的 16 个标签字节。
:::

:::example 仅改盐
[输入]
仍为 demo-one，盐换成 somesalt2，Argon2id，输出十六进制
[结果]
6c8cc4c338c608e962884733f89765cd
[说明]
其余参数一致，变化来自盐的字节。
:::

## 保存时要保留的条件
<!-- sources: rfc, phc, engine -->
相同原文和全部算法条件会导出相同标签，记录应保存足以复算的盐、版本等字段。标签的表示方式可转换；缺少盐和参数时，单独保存十六进制无法恢复这些条件。

## 常见误区
- KiB 表示 1024 字节，不是标签长度或遍历次数。
- 更改类型会改变标签，即使盐、口令未变。
- PHC 完整记录与裸摘要可以包含同一标签，但字段范围不同。
