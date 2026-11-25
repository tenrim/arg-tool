---
capabilityId: op:Snefru
title: Snefru 哈希
topicGroup: file-compression
summary: 说明 Snefru 的宽状态置换和多次遍历，对照 128 位与 256 位输出向量。
aliases:
  - Snefru
  - Snefru-128
  - Snefru-256
sources:
  - id: paper
    title: A Fast Software One-Way Hash Function
    publisher: Ralph C. Merkle
    url: https://doi.org/10.1007/BF00203968
    language: en
    kind: author-spec
    locator: 原始设计与 512 位压缩
  - id: study
    title: New Techniques for Cryptanalysis of Hash Functions and Improved Attacks on Snefru
    publisher: Eli Biham / IACR
    url: https://www.iacr.org/archive/fse2008/50860452/50860452.pdf
    language: en
    kind: author-spec
    locator: 第 2 节的设计描述与遍历数区分
  - id: vectors
    title: RHash regression vectors
    publisher: RHash
    url: https://raw.githubusercontent.com/rhash/RHash/v1.4.6/librhash/test_lib.c
    language: en
    kind: implementation
    locator: snefru128_tests 与 snefru256_tests
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Snefru 输出宽度和遍历数
---

## 介绍
<!-- sources: paper, study -->

Snefru 是 Ralph Merkle 设计的历史密码哈希。它以 512 位内部置换为核心。128 位及 256 位两种长度使用不同宽度的链值，128 位版每块可注入 384 位消息，256 位版每块可注入 256 位消息。

## 表替换和扩散
<!-- sources: paper, study -->

工作块分为十六个 32 位字。更新使用一个字的部分位查找替换表，把查到的值异或到相邻字中，并通过旋转将不同字节带到查表位置。经过多次遍历后，把置换的部分结果反馈到链值。

:::example 128 位八遍历
[输入]
ASCII abc，八次遍历，输出 128 位。
[结果]
553d0648928299a0f22a275a02c83b10
[说明]
128 位是 16 字节，结果和 RHash 的公开样例相同。
:::

## 两种摘要宽度
<!-- sources: study, vectors, engine -->

256 位版本的状态和消息分配与 128 位版本不同。对同一消息生成长结果后简单截去后半，不能保证得到短版本。这可以用三个字节的公开例子直接区分。

:::example 256 位八遍历
[输入]
同样的 ASCII abc，八次遍历，输出 256 位。
[结果]
7d033205647a2af3dc8339f6cb25643c33ebc622d32979c4b612b02c4903031b
[说明]
它的前 128 位同上一例不同。
:::

## 收尾和空消息
<!-- sources: study, vectors, engine -->

最后处理不足一块的消息及长度信息。短输入可能在某些向量上偶然显示相同的前缀，仍需用完整输出和更多测试语料核对变体。

:::example 空消息的八遍历结果
[输入]
空字节串，256 位版本。
[结果]
8617f366566a011837f4fb4ba5bedea2b892f3ed8b894023d16ae344b2be5881
[说明]
其前半恰好与 128 位空消息结果相同，但前面 abc 的两例已经给出反例。
:::

## 历史版本
<!-- sources: paper, study, engine -->

旧文献和代码有二次、四次、八次等遍历版本。公开密码分析对不同遍历数的结论不同，旧短轮攻击不能笼统等同于八遍历版本。要复现历史摘要，需同时确认输出位数和遍历数。

## 常见误区

- 512 位内部状态不等于 512 位摘要。
- 单个空消息向量的前缀一致不能推导一般的截短关系。
- 不同遍历数属于不同的计算条件。
