---
capabilityId: native:classical-nihilist
title: Nihilist 数字替换密码
topicGroup: classical
summary: 用两位方阵坐标和循环数值密钥做逐项加减，可选完整和或模 100 记法。
aliases:
  - Nihilist
  - Nihilist substitution
  - 虚无主义者密码
  - 虚无主义密码
  - Polybius 加法
sources:
  - id: aca
    title: NihilistSubstitution
    publisher: American Cryptogram Association
    url: https://www.cryptogram.org/downloads/aca.info/ciphers/NihilistSubstitution.pdf
    language: en
    kind: author-spec
    locator: SIMPLE 方阵、EASY 数字键及两位表示
  - id: military
    title: Military Cryptanalytics, Part II
    publisher: Lambros Callimahos / William F. Friedman · NSA
    url: https://www.nsa.gov/Portals/75/documents/news-features/declassified-documents/friedman-documents/publications/FOLDER_257/41751589079090.pdf
    language: en
    kind: official-doc
    locator: 第 XI 章第 81 节，图 90、91
  - id: grid
    title: Bifid
    publisher: American Cryptogram Association
    url: https://www.cryptogram.org/downloads/aca.info/ciphers/Bifid.pdf
    language: en
    kind: author-spec
    locator: 5×5 Polybius 坐标的另一应用
  - id: poly
    title: The Histories, Book 10
    publisher: Polybius / Loeb Classical Library
    url: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Polybius/10%2A.html
    language: en
    kind: author-spec
    locator: 第 45–47 节，分组与两组火炬传信
  - id: code
    title: 原生古典密码实现
    publisher: 迷雾工具箱
    url: /expansion/classical-core.js
    language: zh-CN
    kind: implementation
    locator: nihilistResult 的带进位加法、模 100 和坐标合法性
---

## 介绍
<!-- sources: military, aca -->
Nihilist 数字替换密码先把明文字母写成两位方阵坐标，再加上周期数字密钥。传统记载中还存在同名的换位密码，所以识别这种方法时应以数字坐标和逐项加法为依据。

## 方阵的两位坐标
<!-- sources: poly, grid, aca, code -->
Polybius 方阵以 1 至 5 同时标记行和列，坐标按先行后列写为两位数 10×行＋列。常见表合并 I/J。方阵关键词改变符号在表里的位置，第二个关键词的各字符也在同一张表中查出坐标。

## 逐项整数加法
<!-- sources: military, aca, code -->
将明文坐标和对应的密钥坐标相加，密钥短于明文时循环。使用普通十进制带进位加法，例如 55＋55＝110。另一种写法以 100 取模，将 100 至 110 的值记作 00 至 10。

:::example 最大坐标及回绕
[输入]
默认方阵，明文 ZZ，密钥 Z，按模 100 两位表示
[结果]
10 10
[说明]
Z 是第 5 行第 5 列，两项都把 55＋55 的 110 写成 10。完整和方式则写成 110 110。
:::

## ACA 样例中的前导零
<!-- sources: aca, code -->
密文数字应按项分隔。两位模式要保留前导零以清楚表示格式。取模可能改变数字外观，但明文坐标的合法范围不会改变。

:::example 重复密钥与 08
[输入]
明文 THEEARLYBIRD，方阵关键词 SIMPLE，循环密钥 EASY
[结果]
65 55 32 75 43 65 26 08 44 34 54 79
[说明]
EASY 查表是 21、22、11、54。明文第八位 Y 的坐标为 54，得 108，按模 100 写作 08。
:::

## 解密减法及坐标合法性
<!-- sources: aca, military, code -->
解密先根据格式取差。对两位密文，计算 (密文−密钥) mod 100，恢复后的十位与个位都须在 1 至 5。完整和则直接作整数减法。任何不合法格位都意味着表、密钥、格式或材料至少有一项需复查。

:::example 从末两位恢复坐标
[输入]
密文 08，当前密钥字符 Y，使用 SIMPLE 方阵与模 100 形式
[结果]
明文字符 Y
[说明]
Y 的密钥坐标为 54。08−54＝−46，按模 100 折回为 54，对应 Y。
:::

## 常见误区

- 两个关键字的功能不同，方阵关键字与数字密钥不能互换。
- 加法保留十进制进位，两位模式只在最终按 100 取模。
- 解回的每个坐标的行、列都必须是 1 至 5。
- 08 和 108 在不同的输出记法中可以描述同一个加法结果。
