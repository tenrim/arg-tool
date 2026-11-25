---
capabilityId: op:SHA2
title: SHA2 哈希
topicGroup: file-compression
summary: 按字长和初始状态区分 SHA-2 各变体，用同一消息核对三个不同摘要。
aliases:
  - SHA-2
  - SHA-256
  - SHA-512
  - SHA-512/256
sources:
  - id: nist
    title: FIPS 180-4
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
    language: en
    kind: standard
    locator: 第 5.1、5.3、6.2 至 6.7 节
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: SHA2 及 SHA-512/t 分支
---

## 介绍
<!-- sources: nist -->

SHA-2 是一组共享分块压缩结构的密码哈希。SHA-224 与 SHA-256 使用 32 位字、512 位块，SHA-384、SHA-512、SHA-512/224 和 SHA-512/256 使用 64 位字、1024 位块。正式算法名既区分输出长度，也区分状态和压缩结构。

## 填充与消息字
<!-- sources: nist -->

在原消息后加一个 1 位、若干个零和原始位长。512 位分块分支保存 64 位长度，1024 位分块分支保存 128 位长度。每块先读成 16 个大端字，再由移位、旋转和加法生成后续调度字。

:::example 一块 32 位字分支
[输入]
字节 61 62 63，使用 SHA-256。
[结果]
填充块首字为 0x61626380，末尾长度为 24 位。SHA-256 摘要是 ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad。
[说明]
大端首字把输入的三个字节放在开头，80 的最高位是追加的 1。
:::

## 压缩更新
<!-- sources: nist, engine -->

工作状态有八个字。每一步结合消息调度字、常数和工作状态，计算选择函数、多数函数与循环移位后的组合。SHA-256 和 SHA-224 每块执行 64 步，SHA-512 分支执行 80 步。块结束后工作状态回加到进入该块的状态。

:::example 64 位字分支
[输入]
相同的 61 62 63，使用 SHA-512。
[结果]
ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f
[说明]
输出为 512 位，第一块按 64 位消息字划分。
:::

## SHA-512/t 的初始状态
<!-- sources: nist, engine -->

SHA-512/t 先用规定过程从算法名称推导专用初始状态，再用 SHA-512 的压缩结构计算，并截取前 t 位。普通 SHA-512 的初始状态不同，因此直接截短普通 SHA-512 摘要会得到另一串值。

:::example 同长度也有不同算法
[输入]
ASCII abc，计算 SHA-512/256。
[结果]
53048e2681941ef99b2e29b76b4c7dabe4c2d0c634fc6d46e0e2f13107e7af23
[说明]
它与 SHA-256 同为 256 位，也与普通 SHA-512 的前 256 位不同。
:::

## 摘要复核
<!-- sources: nist, engine -->

复算时需要记录准确名称、原始字节和输出编码。比较来自两个软件的摘要时，可以先用零字节或固定 ASCII 样例验证算法一致，再核对文件末尾、文本换行以及是否误对十六进制文本本身做了散列。

## 常见误区

- 64 个十六进制字符可能对应 SHA-256，也可能对应 SHA-512/256。
- SHA-224 与简单截去 SHA-256 后 32 位不同，标准使用不同初始值。
- 测试减轮得到的值不能作为正式 SHA-2 摘要比较。
