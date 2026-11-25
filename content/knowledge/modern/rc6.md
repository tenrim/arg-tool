---
capabilityId: pair:RC6%20Encrypt
title: RC6
topicGroup: modern
summary: 将四字寄存器的乘法结果变为旋转量，并交替更新状态。
aliases:
  - RC6 Encrypt
  - RC6 Decrypt
  - 四个可配置字与数据相关旋转
sources:
  - id: paper
    title: The RC6 Block Cipher, v1.1
    publisher: Rivest、Robshaw、Sidney、Yin
    url: https://people.csail.mit.edu/rivest/pubs/RRSY98.pdf
    language: en
    kind: author-spec
    locator: 第 2 节至第 4 节；附录实现
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

RC6 基于 RC5 的数据相关旋转，为 AES 竞争提出。记号 RC6-w/r/b 依次指定字长、轮数和密钥字节数。典型实例使用四个 32 位字处理一个 128 位分组。

## 乘法与数据相关旋转
<!-- sources: paper -->

32 位实例对两个状态字计算 x(2x+1) 的低 32 位，再旋转五位。所得两个量分别参与另两个字的异或和旋转。每一轮交换寄存器角色，处理顺序覆盖四个字。

## 密钥扩展与首尾加法
<!-- sources: paper, chef -->

子密钥来自按字打包的密钥材料和固定常量表。加密在主轮前后额外加子密钥，逆向按相反顺序减去并倒转旋转。以下例子用字长 32、20 轮、ECB 无填充。

:::example 128 位零密钥
[输入]
16 字节全零密钥和 16 字节全零明文
[结果]
8FC3A53656B1F778C129DF4E9848A41E
[说明]
初始全零仍会被预加密钥改变。
:::

:::example 顺序字节
[输入]
密钥与明文均为 000102030405060708090A0B0C0D0E0F
[结果]
3A96F9C7F6755CFE46F00E3DCD5D2A3C
[说明]
字节顺序参与把明文和密钥分别打包。
:::

## 分组大小与多块消息
<!-- sources: paper, modes, chef -->

分组为四倍字长。改变轮数或字长都属于改变算法实例。对多块消息还需要模式和填充；即使实例匹配，取错边界会造成输出长度或内容的差别。

## 不同长度的主密钥
<!-- sources: paper, chef -->

增加主密钥的字节数会改变扩展过程，分组仍由四个既定宽度的寄存器组成。

:::example 256 位零密钥
[输入]
32 字节全零密钥和 16 字节全零明文
[结果]
8F5FBD0510D15FA893FA3FDA6E857EC2
[说明]
与 128 位例相比，密钥长度改变，明文长度仍固定。
:::

## 常见误区

- RC6 的 128 位常指典型分组，密钥长度可另行选择。
- 算法中的旋转量会随状态变动。
- RC6 参加过 AES 评选，最终 AES 由 Rijndael 成为标准。

