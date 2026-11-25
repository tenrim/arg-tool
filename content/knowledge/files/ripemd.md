---
capabilityId: op:RIPEMD
title: RIPEMD 哈希
topicGroup: file-compression
summary: 比较 RIPEMD-128、160、256、320 的双支路设计、输出和家族关系。
aliases:
  - RIPEMD-128
  - RIPEMD-160
  - RIPEMD-256
  - RIPEMD-320
sources:
  - id: authors
    title: The hash function RIPEMD-160
    publisher: Bosselaers / KU Leuven
    url: https://homes.esat.kuleuven.be/~bosselae/ripemd160.html
    language: en
    kind: author-spec
    locator: 参考实现、示例和 256、320 位扩展
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: RIPEMD
---

## 介绍
<!-- sources: authors -->

RIPEMD-160 是 Dobbertin、Bosselaers 与 Preneel 设计的密码哈希，旨在针对早期的 128 位 RIPEMD 等算法加以改进。单独的 RIPEMD-128 也属于后来重新设计的家族。还存在 256 与 320 位的扩展。

## 消息分块与并行支路
<!-- sources: authors, engine -->

RIPEMD-160 的填充追加一个高置位并在末尾写入低字节在前的 64 位长度。每个 512 位块分成十六个小端 32 位字。两条支路读取同一块，以不同的字顺序、逻辑函数、轮常量和旋转量更新工作值。

:::example 160 位公开样例
[输入]
ASCII abc，RIPEMD-160。
[结果]
8eb208f7e05d987a9b044a8e98c6b087f15a0bfc
[说明]
二进制结果为 20 字节。SHA-1 也有同样的宽度，计算规则不同。
:::

## 变体之间的关系
<!-- sources: authors -->

RIPEMD-128 与 RIPEMD-160 的链值宽度、支路步数及末尾组合不同。RIPEMD-256 是从 RIPEMD-128 扩展的算法，RIPEMD-320 基于 RIPEMD-160。设计者指出，这些扩展主要给出更长的结果，并未声称安全等级按输出尺寸等比例提升。

:::example 128 位版本
[输入]
ASCII abc，RIPEMD-128。
[结果]
c14a12199c66e4ba84636b0f69144c77
[说明]
这 16 字节与前一例的开头不同。
:::

## 输出宽度与合并方式
<!-- sources: authors, engine -->

RIPEMD-160 在两条支路运算后按规范交叉组合成下一链值。较长变体在计算中按固定时机跨支路交换工作字，并保存较长的链值。直接把两个短摘要拼接不能得到这些长变体。

:::example 320 位扩展示例
[输入]
ASCII abc，RIPEMD-320。
[结果]
de4c01b3054f8930a79d09ae738e92301e5a17085beffdc1b8d116713e74f82fa942d64cdbc4682d
[说明]
输出长度为四十字节，十六进制展示有八十个字符。
:::

## 准确记录算法名
<!-- sources: authors, engine -->

复算记录应写 RIPEMD-160 等全名，避免把 1990 年代初的原始 RIPEMD 与后来同宽度的 RIPEMD-128 混淆。若规范还要求对其他摘要的输出再做 RIPEMD-160，第二次的输入通常是前一段原始摘要字节。

## 常见误区

- 原始 RIPEMD 与后来的 RIPEMD-128 属于不同设计。
- RIPEMD-160 的 40 个十六进制字符不能独立标识算法。
- RIPEMD-256 或 320 的结果不等于短成员重复拼接。
