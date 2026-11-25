---
capabilityId: native:classical-adfgvx
title: ADFGVX 密码
topicGroup: classical
summary: 在 6×6 方阵中以六符号坐标表示字母与数字，再进行列换位。
aliases:
  - ADFGVX
  - 六符号坐标密码
sources:
  - id: py
    title: pycipher — adfgvx-cipher
    publisher: James Lyons
    url: https://pycipher.readthedocs.io/en/master/#adfgvx-cipher
    language: en
    kind: author-spec
    locator: 六阶方阵与标准示例
  - id: military
    title: General Solution for the ADFGVX Cipher System
    publisher: U.S. War Department
    url: https://www.nsa.gov/Portals/75/documents/news-features/declassified-documents/friedman-documents/publications/FOLDER_269/41784769082379.pdf
    language: en
    kind: official-doc
    locator: 引言与检验使用的方阵及换位结构
  - id: signals
    title: The Friedman Lectures on Cryptology
    publisher: William F. Friedman / NSA
    url: https://www.nsa.gov/Portals/75/documents/news-features/declassified-documents/friedman-documents/publications/ACC15281/41785109082412.pdf
    language: en
    kind: official-doc
    locator: ADFGX 的早期用法和 ADFGVX 发展
  - id: columns
    title: IncompleteColTransposition
    publisher: American Cryptogram Association
    url: https://www.cryptogram.org/downloads/aca.info/ciphers/IncompleteColTransposition.pdf
    language: en
    kind: author-spec
    locator: 不补齐方阵的列读顺序
  - id: code
    title: 原生古典密码实现
    publisher: 迷雾工具箱
    url: /expansion/classical-core.js
    language: zh-CN
    kind: implementation
    locator: 六码坐标、关键列序和不整齐末行
---

## 介绍
<!-- sources: military, signals -->
ADFGVX 扩大了 ADFGX 使用的坐标方案。行列都以 A、D、F、G、V、X 标记，六阶方阵共有 36 个位置，可同时容纳 26 个字母和十个十进制数字。

## 六阶坐标与数字
<!-- sources: py, military, code -->
每个明文字符定位到六阶方阵后，先取行标，再取列标。常用未加扰的表从 A 至 Z 后接 0 至 9，此时不必为 26 个字母合并 I 和 J。换了方阵排序后，同样的坐标会对应另一个字符。

:::example 字母与数字共有一张方阵
[输入]
默认方阵，明文 A9，列键 BA
[结果]
AXAX
[说明]
A 在左上角为 AA，9 在右下角为 XX。坐标串 AAXX 按两列写入后，每列均是 AX。
:::

## 用关键词改变读取次序
<!-- sources: military, columns, code -->
先把坐标串逐行写入列矩形。按关键词排序后从各列自上到下读出。同名列按原顺序处理，最后一行不足时，较靠左的列长度比其余列多一。

:::example 含重复键字母的数字串
[输入]
默认方阵，TEST42，列键 LETTER
[结果]
DDGVGGAVAXVA
[说明]
按字母排序的原始列次序为 2、5、1、6、3、4，两个 E 和两个 T 均按从左到右处理。
:::

## 方阵和列键须分别还原
<!-- sources: py, military, code -->
方阵打乱字符与双标签的映射，列键则打乱标签位置。解密先把密文按正确列长拆开还原，再按行读出双标签，逐一查回方阵。两把键及其不同作用都需保留。

:::example 与 pycipher 的完整往返
[输入]
明文 Hello world!，方阵 PH0QG64MEA1YL2NOFDXKR3CVS5ZW7BJ9UTI8，列键 GERMAN，移除标点
[结果]
FVFDAGXAFFFFGFAGADFG；解密得到 HELLOWORLD
[说明]
方阵落点决定坐标。换位不进一步改变有效坐标数，去掉格式后的原始空格和标点无法恢复。
:::

## 文献中的组合结构
<!-- sources: military, signals -->
历史分析文献将方阵替换与列换位视为两个独立层。单独观察最终密文上的双字符，往往不能判断它们是否来自同一明文字符。重复使用密钥使批量材料可互相比较。

## 常见误区

- V 是六种坐标的一员，能改变方阵维度。
- 密文出现十进制数字不符合这一标准的坐标输出，数字只在这里的明文方阵内。
- 先把密文成对解方阵会错过列换位这一层。
- 末行不整齐时不能把密文均分成等长列。
