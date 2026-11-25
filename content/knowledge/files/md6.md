---
capabilityId: op:MD6
title: MD6 哈希
topicGroup: file-compression
summary: 从四叉树和链式模式说明 MD6 的压缩、位长与轮数，核对模式变化的影响。
aliases:
  - MD6
  - MD6-256
  - MD6 树模式
sources:
  - id: paper
    title: The MD6 Hash Function – A Proposal to NIST for SHA-3
    publisher: Rivest 等 / MIT
    url: https://people.csail.mit.edu/rivest/pubs/RABCx08.pdf
    language: en
    kind: author-spec
    locator: 第 2 章模式和第 8 章参数与实现
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: MD6
---

## 介绍
<!-- sources: paper -->

MD6 是作为 SHA-3 竞赛提案提交的密码哈希设计。消息可以按四叉树处理，摘要宽度 d 由实例确定。它与 MD5 的四个状态字分块过程不同，处理大消息时可以同时压缩独立节点。

## 叶块与父节点
<!-- sources: paper -->

规范以 64 位字组织压缩。树模式的叶块可使用 64 个数据字，每次节点压缩输出 16 个字，父节点可以接收四个完整子节点的结果。节点标识、层次、补齐长度与控制信息也参与压缩。

:::example 树模式短消息
[输入]
ASCII abc，无钥，d=256，树模式 L=64。
[结果]
230637d4e6845cf0d092b558e87625f03881dd53a7439da34cf3b94ed0d8b2c5
[说明]
三个字节在一个叶块中，补齐信息随节点进入压缩。
:::

## 树深与顺序计算
<!-- sources: paper, engine -->

层级参数 L 控制树形计算与顺序计算的取舍。L=0 使用链式模式，L=64 表示实际计算不会切换到顺序模式。改变 L 会影响计算规范，即使短消息也应保持原模式复算。

:::example 改用顺序模式
[输入]
ASCII abc，无钥，d=256，L=0。
[结果]
93c70c8d38e1d0b583024a3f17c95fe23b3a19bfad96d567f1e522b89ec7b365
[说明]
仍为相同消息与摘要位数，模式变化已足以改变输出。
:::

## 摘要长度和推荐轮数
<!-- sources: paper, engine -->

根的压缩输出按规定取最后 d 位。原始设计的无钥默认轮数是 40+⌊d/4⌋，有钥时另要求默认不少于 80 轮。摘要位数参与控制字，也会影响轮数，因此换宽度再计算和直接截短不同。

:::example 128 位结果
[输入]
ASCII abc，无钥，d=128，L=64。
[结果]
8db50d79cf42fe7d1807ebaa15329c61
[说明]
原设计对应的默认轮数为 72，完整结果为 16 字节。
:::

## 记录复算条件
<!-- sources: paper -->

MD6-d 的简写按原提案表示无钥、完整树模式及该 d 的默认轮数。用其他模式、密钥或轮数复现旧资料时，需要把这些条件一同记录。SHA-3 竞赛提案身份也不能把 MD6 称为 FIPS 202 的 SHA-3。

## 常见误区

- MD6 的短名不表示由 MD5 直接升级或得到同类输出。
- 层级限制会改变实际计算，不能只把它当作性能开关。
- 修改 d 后重新计算与截短旧结果处理的是不同请求。
