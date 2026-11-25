---
capabilityId: native:classical-beaufort
title: Beaufort 密码
topicGroup: classical
summary: 沿循环密钥使用模减法的多表替换，并区分减数次序不同的变体。
aliases:
  - Beaufort
  - Variant Beaufort
  - 变体 Beaufort
sources:
  - id: aca
    title: Beaufort
    publisher: American Cryptogram Association
    url: https://www.cryptogram.org/downloads/aca.info/ciphers/Beaufort.pdf
    language: en
    kind: author-spec
    locator: 标准 C=K−P 与 RECIPROCAL 向量
  - id: variant
    title: Variant
    publisher: American Cryptogram Association
    url: https://www.cryptogram.org/downloads/aca.info/ciphers/Variant.pdf
    language: en
    kind: author-spec
    locator: C=P−K 与 APPLE 向量
  - id: py
    title: pycipher — beaufort-cipher
    publisher: James Lyons
    url: https://pycipher.readthedocs.io/en/master/#beaufort-cipher
    language: en
    kind: author-spec
    locator: 标准 Beaufort 与重复关键词
  - id: mtu
    title: The Vigenère Cipher Encryption and Decryption
    publisher: C.-K. Shene / Michigan Technological University
    url: https://pages.mtu.edu/~shene/NSF-4/Tutorial/VIG/Vig-Base.html
    language: en
    kind: official-doc
    locator: A=0 位值、模加减与普通循环密钥
  - id: code
    title: 原生古典密码实现
    publisher: 迷雾工具箱
    url: /expansion/classical-core.js
    language: zh-CN
    kind: implementation
    locator: polyalphabeticResult 中的模差与两方向
---

## 介绍
<!-- sources: aca, variant, py -->
Beaufort 与维吉尼亚同属多表替换。它按重复关键词逐位选择变换。标准写法以密钥值减明文值，Variant Beaufort 则交换相减的次序。

## 标准模减与自反
<!-- sources: aca, py, code -->
用 A＝0、Z＝25 给字母编号。标准加密 C＝(K−P) mod 26，解密 P＝(K−C) mod 26，两方向采用同一运算。差值为负时，折回 0 至 25。

:::example 一次逐位取差
[输入]
标准 Beaufort，明文 ABCDE，关键词 APPLE
[结果]
AONIA
[说明]
各位计算 0−0、15−1、15−2、11−3、4−4，得到 0、14、13、8、0。
:::

## 变体的方向差异
<!-- sources: variant, mtu, code -->
变体加密 C＝(P−K) mod 26，解密 P＝(C＋K) mod 26。与经典维吉尼亚的 P＋K 加密相比，变体相当于按密钥向同一字母表的反方向移动。

:::example 相同输入换用变体
[输入]
Variant Beaufort，明文 ABCDE，关键词 APPLE
[结果]
AMNSA
[说明]
第二位为 1−15＝−14，折回为 12，即 M。其余按相同次序逐位取差。
:::

## 重复短关键词和还原检查
<!-- sources: aca, variant, py -->
每个位置使用关键词中对应的字母；关键词走到末尾再回到开头。待处理的符号集须固定，才能保证密钥指针对齐。可用原密文、原密钥和明确方向作往返复算。

:::example ACA 的标准公开向量
[输入]
CEQUALSKMINUSP，关键词 RECIPROCAL
[结果]
PAMOPGWSODEKKT
[说明]
第一位由 R(17)−C(2) 得 15→P。标准 Beaufort 将所得密文再按同式计算即可恢复明文。
:::

## 线索中的模差与周期
<!-- sources: aca, variant, mtu -->
相同密钥位置上的映射关系并不随段落变化。使用短关键词时，可能按周期观察同类位置的字母分布。验证题目中的名称线索时，可对照公式，避免将共享的查表形式当成相同密码。

## 常见误区

- 标准 Beaufort 是 K−P，变体才是 P−K。
- 标准自反的性质不能用在变体上。
- 模 26 的负差须折回到符号编号范围。
- 重复密钥的位置与文本中空格是否推进密钥有关。
