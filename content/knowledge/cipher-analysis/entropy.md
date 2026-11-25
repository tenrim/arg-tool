---
capabilityId: op:Entropy
title: 信息熵
topicGroup: cipher-analysis
summary: 介绍按字节分布计算的经验 Shannon 熵、样本上界和排列信息的缺失。
aliases:
  - Entropy
  - Shannon 熵
  - 字节经验熵
sources:
  - id: shannon
    title: A Mathematical Theory of Communication
    publisher: Claude E. Shannon
    url: https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf
    language: en
    kind: author-spec
    locator: 第 6 节，选择、不确定性与熵
  - id: utf
    title: RFC 3629 — UTF-8
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc3629.html
    language: en
    kind: standard
    locator: 第 3 节：序列组成
  - id: worker
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Entropy 的字节概率与 Shannon scale
---

## 介绍
<!-- sources: shannon, worker -->

信息熵描述某个概率分布里符号的不确定性。按字节统计时，先由样本频数形成概率，再计算经验熵。结果的单位为每字节的比特数，反映这次取样中的频数结构。

## 对数与权重
<!-- sources: shannon, worker -->

令 pᵢ 为第 i 个字节值的相对频率。经验熵 H = −Σ pᵢ log₂(pᵢ)。没有出现的值用零贡献处理。若 k 种值频数完全相同，H 就等于 log₂(k)。

:::example 两种值均匀出现
[输入]
AABB
[结果]
H = 1 比特/字节。
[说明]
A、B 的比例各为 1/2，各项贡献 1/2。调换字节顺序不会改变这两项。
:::

## 主导字节与低熵
<!-- sources: shannon, worker -->

同一种值占据大部分位置时，一次取样会更容易猜中这个值。若所有字节完全相同，唯一概率为 1，熵为 0。两种字节的分布只要不均匀，经验熵就低于 1。

:::example 四个字节中的偏斜
[输入]
AAAB
[结果]
约 0.811278 比特/字节。
[说明]
将 p = 3/4、1/4 分别代入 −p log₂p，再相加。
:::

## 字节数与字符数
<!-- sources: utf, worker, shannon -->

这项计算使用编码后的字节。即使文本重复同一个 Unicode 码点，多字节的编码也可能提供多种不同的字节值。在不同文本编码下比较熵前，必须先核对实际输入范围和单位。

:::example 重复相同表情符号
[输入]
😀😀，按 UTF-8 字节输入
[结果]
H = 2 比特/字节。
[说明]
F0、9F、98、80 各出现两次，其概率均为 1/4，于是经验熵为 log₂(4)。
:::

## 上界与解读
<!-- sources: shannon, worker -->

八位字节最多 256 种，均匀分布时经验熵为 8。长度不足 256 的样本不可能让全部类别出现，经验熵上界由实际占用类别数限制。熵也忽略相邻字节联系，例如规则交替的 00 FF 与同频的乱序样本可以得到相同结果。

## 常见误区

- 同一组频数只给出同一个经验熵，不包含排列信息。
- 高字节熵也会出现在压缩数据、加密数据或部分媒体格式中，单个数值不足以区分。
- 每字节熵上界为 8。计算另一种符号单位时，数值上界和含义随之改变。
