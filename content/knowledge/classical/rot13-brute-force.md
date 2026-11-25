---
capabilityId: op:ROT13%20Brute%20Force
title: 穷举凯撒移位
topicGroup: classical
summary: 列出 26 字母表的旋转候选，说明位移方向、已知片段和密文样本怎样影响结果。
aliases:
  - ROT13 Brute Force
  - 枚举凯撒步长
sources:
  - id: shift
    title: ROT13 算法说明
    publisher: DenCode
    url: https://dencode.com/zh-cn/cipher/rot13
    language: zh-CN
    kind: author-spec
    locator: 字符环与半圈位移
  - id: ascii
    title: RFC 20 — ASCII Format for Network Interchange
    publisher: RFC Editor
    url: https://www.rfc-editor.org/info/rfc20/
    language: en
    kind: standard
    locator: 第 2 节字码表
  - id: companion
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
    locator: ROT13 Brute Force
  - id: worker
    title: CyberChef 固定版本的 Ciphers 模块
    publisher: GCHQ CyberChef
    url: /vendor/cyberchef/modules/Ciphers.js
    language: en
    kind: implementation
    locator: ROT13 Brute Force 候选生成与筛选
---

## 介绍
<!-- sources: shift, companion -->

凯撒移位在同一字母表上反复使用固定步长。若密钥只有这个步长，解密时可对同一段密文尝试每个可能的位移，得到一组有明确对应关系的候选。读者可以再用语言、题面给出的固定前缀或已知单词辨别结果。

## 候选空间
<!-- sources: shift, ascii, engine -->

英文字母表只有 26 个余数类。位移 0 是原文，所以把原文单独留作对照后，只需尝试 1 至 25。大小写共享同一位移量，各自在其字母表内循环。按纯字母的约定，数字、空白与标点保持原位置。

:::example 两字母密文的候选
[输入]
BC
[结果]
加 1 得到 CD
加 24 得到 ZA
加 25 得到 AB
[说明]
加 25 等价于减 1。不同方向写出的步长可以代表同一个还原操作。
:::

## 加密位移和解密位移
<!-- sources: shift, worker -->

候选列表上的数值若表示对密文施加的正向位移，它就是还原时所用的位移。若明文加 3 得到密文，列表会在加 23 的位置复原，因为 3+23 正好是一个整圈。

:::example 利用已知词筛选
[输入]
KHOOR ZRUOG
已知包含 HELLO
[结果]
加 23 → HELLO WORLD
[说明]
以 K 为例，其序号 10 加 23 后取模得到 7，查回 H。
:::

## 样本位置和已知片段
<!-- sources: engine, worker -->

可以先截取密文的一部分计算候选。字母移位不改变字符顺序或位置，因此样本起点可以按原文本定位。已知词筛选比较的是已解开的样本。若取样漏掉目标单词，正确位移也可能从筛选结果消失。

:::example 目标在样本之外
[输入]
密文 KHOOR ZRUOG，筛选词 WORLD
分别取开头 5 字符与从零计数第 6 位起的 5 字符
[结果]
前一段：空结果
后一段：加 23 得到 WORLD
[说明]
开头截到的是 KHOOR，后段截到的是 ZRUOG。样本筛选只对当前片段负责。
:::

## 解谜应用
<!-- sources: shift, companion, worker -->

短密文常有歧义。例如两三个字母旋转后可能偶然拼成缩写。更长的上下文能帮助判断候选，因为一个正确的固定步长应当同时解释整句。若字母及数字都被移位，还要确认它们使用独立的字符环，才能解释数字为何落在相应位置。

## 常见误区

- 穷举的候选编号是本次加到密文上的位移，加密所用的正向位移通常是它的模 26 相反数。
- 样本起点按原文本位置确定，词间空格也占用位置。
- 已知词无匹配只说明当前样本和匹配条件没有命中。结论受样本长度、位置及文字形式限制。
