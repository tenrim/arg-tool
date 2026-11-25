---
capabilityId: pair:XXTEA%20Encrypt
title: XXTEA
topicGroup: modern
summary: 更正 Block TEA 通过邻字更新处理可变长度的 32 位字数组。
aliases:
  - XXTEA Encrypt
  - XXTEA Decrypt
  - 变长字数组与相邻双向扩散
sources:
  - id: paper
    title: Correction to XTEA：Corrected Block TEA
    publisher: David Wheeler、Roger Needham
    url: https://www.cix.co.uk/~klockstone/xxtea.pdf
    language: en
    kind: author-spec
    locator: 更正算法、相邻项和循环公式
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作和输入输出定义
---

## 介绍
<!-- sources: paper -->

XXTEA 是更正 Block TEA 的通用名称。算法把至少两个 32 位字视为一个整体，密钥占四个 32 位字。相较于逐个处理八字节分组，消息长度会改变数组的词数。

## 邻字和轮次数
<!-- sources: paper -->

更新当前字时读取前后邻字，并混入累计量与从四个密钥字中选出的项。数组首尾相连。原始例程完整遍历的次数为 6 加上 52 除以数组字数再取整数部分。

## 字节打包后的长度
<!-- sources: paper, chef -->

将任意长度字节串交给该算法前，需要打包成完整的 32 位字。算法本身不规定跨应用的字节打包协议。下列包装样例使用相同的十六进制密钥 000102030405060708090A0B0C0D0E0F。

:::example 一字节的封装
[输入]
01
[结果]
E8 21 B4 61 25 E9 96 B2
[说明]
密文按两个完整字输出，超过输入的一字节。
:::

:::example 四字节的封装
[输入]
00 01 02 03
[结果]
96 62 47 79 A2 83 D8 9C
[说明]
四字节也会得到八字节输出；长度相同，内容不同。
:::

## 扩展阵列与还原
<!-- sources: paper, chef -->

较长的输入被打包成更多字并整体变换。解密由相反方向逐字处理，恢复包装数据后还要还原原始长度。固定密钥和明确的包装规则可以重复核对。

:::example 八字节跨到三个字
[输入]
00 01 02 03 04 05 06 07
[结果]
A1 8E 99 E3 48 1B 69 AB 04 DB 5C FF
[说明]
长度为 12 字节，不能用两个独立的 XTEA 八字节分组来解释。
:::

## 旧实现的兼容性
<!-- sources: paper, chef -->

归档材料常以 TEA、XTEA 或 Block TEA 的名字随意标记。核对时需区分早期 Block TEA 与更正版，并确认字序、是否包含原长度以及输出采用的二进制表示。

## 常见误区

- 相邻字更新属于 XXTEA 核心；字节封装由调用方定义。
- 密文长度增加不一定意味着采用 PKCS#7。
- XXTEA 不产生独立的消息认证标签。

