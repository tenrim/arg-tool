---
capabilityId: op:ROT13
title: 凯撒移位（ROT13）
topicGroup: classical
summary: 用模 26 的循环移位解释 ROT13、一般凯撒移位的逆运算及其对文本留下的特征。
aliases:
  - ROT13
  - 凯撒密码
  - 模 26 字母移位
sources:
  - id: dencode
    title: ROT13 算法说明
    publisher: DenCode
    url: https://dencode.com/zh-cn/cipher/rot13
    language: zh-CN
    kind: author-spec
  - id: ascii
    title: RFC 20 — ASCII Format for Network Interchange
    publisher: RFC Editor
    url: https://www.rfc-editor.org/info/rfc20/
    language: en
    kind: standard
    locator: 第 2 节字码表
  - id: python
    title: Python codecs — Text Transforms
    publisher: Python Software Foundation
    url: https://docs.python.org/3/library/codecs.html#text-transforms
    language: en
    kind: official-doc
    locator: rot_13 条目
  - id: php
    title: PHP Manual — str_rot13
    publisher: PHP Documentation Group
    url: https://www.php.net/manual/en/function.str-rot13.php
    language: en
    kind: official-doc
    locator: Description
  - id: engine
    title: CyberChef 操作目录
    publisher: GCHQ CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: ROT13
---

## 介绍
<!-- sources: dencode, python -->

凯撒移位给有序字母表中的每个字母加上同一个位移，越过末尾时从开头继续。相邻字母在轮转后仍然相邻。ROT13 是使用 26 个英文字母并固定移动 13 位的情形。

同一个字母每次都换成同一个字母。字符的位置无需重排，处理的输入和输出都是文本。

## 字母编号与循环
<!-- sources: ascii, dencode, engine -->

将 A 到 Z 编为 0 到 25，位移为 k 时，结果编号是 (x + k) mod 26。取模使余数落在 0 至 25。大写和小写各自使用一套相同的序号，输出仍在相应字母表内。

:::example 越过字母表末尾
[输入]
AZaz
位移 13
[结果]
NMnm
[说明]
A 和 a 在各自字母表中编号都是 0，加 13 得到 N 或 n。Z 和 z 的编号是 25，加 13 后为 38，减 26 得 12，得到 M 或 m。
:::

## 移位的逆运算
<!-- sources: dencode, engine -->

一般凯撒移位用加 k 生成密文，用减 k 还原明文。对一张 26 字母的表，减 3 与加 23 等效。ROT13 是半圈移位，两次执行共移动 26 位，因此可用同一个变换还原。

:::example 一般移位往返
[输入]
XYZ 加 3，然后将结果加 23
[结果]
ABC → XYZ
[说明]
X、Y、Z 的编号分别为 23、24、25。加 3 后取模得到 0、1、2，再加 23 后回到原位。
:::

## 字母之外的字符
<!-- sources: ascii, php, dencode -->

标准 ROT13 只在英文字母表内轮转。数字、空格和标点留在原位置，保留了消息的外形。

:::example 保留词界和数字
[输入]
Meet at 09:00!
[结果]
Zrrg ng 09:00!
[说明]
变换发生在 M、e、e、t、a、t 六个位置。再次执行 ROT13 可还原原文。
:::

## 解谜应用
<!-- sources: dencode, php -->

在隐藏剧透或谜题线索时，ROT13 可以让一段仍可直接复制的文本暂时难以一眼读懂。单词长度、重字母与标点位置提供了识别线索。例如原词有连续两个相同字母，密文在相同位置也会出现一对相同字母。

即使把位移视为未知，26 个余数也足以列出所有字母表轮转。短密文可能有多个看似合理的结果，需与完整句意或题面约束相互印证。

## 常见误区

- 两次相同的凯撒移位仅在累计位移为 26 的倍数时还原原文。一般移位应改用相反方向。
- Z 的后继字母是 A。直接对字符编码加 13 会越出对应字母表。
- 数字的轮转需要另行约定数字表和周期。标准 ROT13 的轮转范围是英文字母。
