---
capabilityId: pair:TEA%20Encrypt
title: TEA
topicGroup: modern
summary: 用两组 32 位状态、模加、位移和异或执行固定轮数的 64 位分组变换。
aliases:
  - TEA Encrypt
  - TEA Decrypt
  - 两字 Feistel 与黄金比常量
sources:
  - id: paper
    title: TEA, a Tiny Encryption Algorithm
    publisher: David Wheeler、Roger Needham
    url: https://www.cl.cam.ac.uk/ftp/papers/djw-rmn/djw-rmn-tea.html
    language: en
    kind: author-spec
    locator: 原始加密例程、字宽及 32 个循环
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

TEA 是 Tiny Encryption Algorithm 的缩写。它使用 128 位密钥和 64 位数据块，设计目标是用短小代码实现分组变换。原始描述的一个循环更新两次状态。

## 模加与移位混合
<!-- sources: paper -->

输入拆成两个 32 位字。每次先把 9E3779B9 加入累计量，然后更新一侧，另一侧接着用更新后的值计算。计算利用左移 4、右移 5、模加和异或混合数据与四个密钥字。

:::example 常见的全零例
[输入]
16 字节全零密钥，8 字节全零明文；ECB，无填充
[结果]
41EA3A0A94BAA940
[说明]
加密使用 32 个双更新循环。
:::

## 密钥字与回退
<!-- sources: paper, vectors -->

成对的密钥字按固定位置进入两个更新。解密从加密结束时的累计量开始，先回退后更新的状态，再回退先更新的状态，并减少累计量。

:::example 改变密钥仍保持明文为零
[输入]
密钥 000102030405060708090A0B0C0D0E0F，明文 0000000000000000；ECB，无填充
[结果]
F7536548D0013AED
[说明]
将输入密钥写成四个 32 位字参与更新。
:::

## 字节序和分组
<!-- sources: vectors, chef, modes -->

算法论文以机器字描述操作。交换二进制材料时，必须知道每个 32 位字采用的序列化顺序。多块消息的输入模式与填充也独立于 TEA 核心。

:::example 非零单块
[输入]
密钥 000102030405060708090A0B0C0D0E0F，明文 4142434445464748；ECB，无填充
[结果]
DF25FC4279B8F929
[说明]
明文是八个原始字节 A 到 H。
:::

## 与后续变体的关系
<!-- sources: paper, vectors, chef -->

XTEA 调整了状态与密钥字组合方式，XXTEA 又对多字数组进行不同更新。历史工具名称相近时先用可核对的单块实验识别变体。

## 常见误区

- 32 个双更新循环与 64 个半轮是不同计数方式。
- TEA 的字宽是 32 位，每块仍为 64 位。
- 十六进制写法、文本写法和字序会影响同名算法之间的互通。

