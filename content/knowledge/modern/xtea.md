---
capabilityId: pair:XTEA%20Encrypt
title: XTEA
topicGroup: modern
summary: 在两字分组上使用重新组织的异或、移位和轮密钥索引。
aliases:
  - XTEA Encrypt
  - XTEA Decrypt
  - 改进的移位组合与轮密钥选择
sources:
  - id: paper
    title: Tea extensions
    publisher: Roger Needham、David Wheeler
    url: https://www.cix.co.uk/~klockstone/xtea.pdf
    language: en
    kind: author-spec
    locator: XTEA 更新与字索引
  - id: vectors
    title: TEA and XTEA Test Vectors
    publisher: Andrew Haley
    url: https://www.cix.co.uk/~klockstone/teavect.htm
    language: en
    kind: author-spec
    locator: 原始测试序列，TEA 与 XTEA 的初始零向量
  - id: modes
    title: NIST SP 800-38A：Block Cipher Modes
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf
    language: en
    kind: standard
    locator: 6.1、6.2，ECB 和 CBC
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

XTEA 是 TEA 的延伸。两者都使用 64 位分组和 128 位密钥，XTEA 重新组合数据字、累计量与被选中的密钥字。两者使用相同的分组长度，却会产生不同密文。

## 状态更新与轮密钥索引
<!-- sources: paper -->

更新第一侧时，以累计量低两位选择密钥字。改变累计量后，更新另一侧时选用累计量右移 11 位后的低两位。原始变换在两个 32 位状态字之间交替。

:::example 同样全零得到不同结果
[输入]
16 字节全零密钥，8 字节全零明文；ECB，无填充、32 个双更新循环
[结果]
DEE9D4D8F7131ED9
[说明]
同配置下 TEA 的结果是 41EA3A0A94BAA940。
:::

## 循环次数与逆向
<!-- sources: paper, chef -->

一个循环包含两个状态更新。加密从零累计量出发，解密在相反位置开始并把操作倒序。不同轮数不能共享同一匹配的解密设置。

:::example 非零密钥试验
[输入]
密钥 000102030405060708090A0B0C0D0E0F，明文 0000000000000000；ECB，无填充、32 个双更新循环
[结果]
E4CF21F8AAE13F64
[说明]
索引访问的密钥字数值与全零例不同。
:::

## 分组字的原始字节
<!-- sources: vectors, modes, chef -->

两字分组需要对齐字节序及填充。复算旧材料可提取一个完整分组，固定 CBC 的 IV 或用独立单块向量核对核心步骤。

:::example 原始八字节的转换
[输入]
全零 16 字节密钥，明文 4142434445464748；ECB，无填充、32 个双更新循环
[结果]
A0390589F8B8EFA5
[说明]
同钥更换分组内容，结果改变。
:::

## 辨别 XTEA 与 XXTEA
<!-- sources: paper, chef -->

历史公开材料中存在拼写近似的算法。XTEA 的算法核心始终接受两个字。名为 XXTEA 的更正 Block TEA 使用整段多字数组及相邻字更新，不能使用 XTEA 的固定分组向量互换。

## 常见误区

- 相同密钥和明文不使 XTEA 与 TEA 互通。
- 轮数约定要区分两次单更新和一次双更新。
- 源文件前缀和尾部补齐方式属于数据协议层。

