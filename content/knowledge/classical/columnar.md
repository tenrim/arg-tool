---
capabilityId: native:classical-columnar
title: 列移位置换
topicGroup: classical
summary: 按约定列次序读取逐行写入的字符矩形，并逆向复原不满的末行。
aliases:
  - 列换位
  - 列置换
  - Columnar Transposition
  - 不完整列换位
sources:
  - id: columns
    title: IncompleteColTransposition
    publisher: American Cryptogram Association
    url: https://www.cryptogram.org/downloads/aca.info/ciphers/IncompleteColTransposition.pdf
    language: en
    kind: author-spec
    locator: 不补齐方阵的列读顺序
  - id: full
    title: CompleteColTransposition
    publisher: American Cryptogram Association
    url: https://www.cryptogram.org/downloads/aca.info/ciphers/CompleteColTransposition.pdf
    language: en
    kind: author-spec
    locator: 矩形填充及 ACA 向量
  - id: py
    title: pycipher — columnar-transposition-cipher
    publisher: James Lyons
    url: https://pycipher.readthedocs.io/en/master/#columnar-transposition-cipher
    language: en
    kind: author-spec
    locator: 关键词列换位及移除空白的变体
  - id: military
    title: Military Cryptanalysis Part IV
    publisher: William F. Friedman / U.S. War Department
    url: https://www.nsa.gov/Portals/75/documents/news-features/declassified-documents/friedman-documents/publications/FOLDER_452/41749819078904.pdf
    language: en
    kind: official-doc
    locator: Transposition and Fractionating Systems
  - id: code
    title: 原生古典密码实现
    publisher: 迷雾工具箱
    url: /expansion/classical-core.js
    language: zh-CN
    kind: implementation
    locator: columnOrder、columnarTransform、columnarResult
---

## 介绍
<!-- sources: military, columns, full -->
列移位置换把文本逐行写入若干列，再以预先约定的顺序整列读出。它以重新排列字符位置改变文本，字母表的符号无需替换。

## 列数、排名和同名列
<!-- sources: py, columns, code -->
列数由密钥长度决定。数字列键表示各物理列的名次，例如 3 1 2 的读序为物理列 2、3、1。使用关键词时按字符排序，也可以规定相同字符按原位置从左到右读取。

:::example 重复字母的稳定列序
[输入]
明文 ABCDEFZ，关键词 ABA，不填充
[结果]
ADZCFBE
[说明]
三行依次为 ABC、DEF、Z。先读第一列 ADZ，再读第三列 CF，最后读第二列 BE。
:::

## 完整矩形的填充与读取
<!-- sources: full, code -->
若约定用填充补足最后一行，所有列具有相同长度。解密保留补齐内容，因为末尾字符可能也出自原文。选择填充和还原方式应符合样例的可逆范围。

:::example 补齐至四行三列
[输入]
FILLEDBLOCK，数字列键 3 1 2，以 X 填充
[结果]
IELKLDOXFLBC
[说明]
物理列为 FLBC、IELK、LDOX。读序按名次为第二列、第三列、第一列。
:::

## 不完整矩形的列长反算
<!-- sources: columns, military, code -->
对长度 n、列数 k，整行数为 ⌊n/k⌋，余数 r＝n mod k。物理位置最靠左的 r 列多一个格。按读序切片时，先确定那一段来自哪一物理列，再决定片段长度。

:::example 不补齐的 ACA 例子
[输入]
密文 NLDOFLBCUIELK，数字列键 3 1 2，不填充
[结果]
UNFILLEDBLOCK
[说明]
前两段各有四个字母，为第二列 NLDO、第三列 FLBC。末段 UIELK 属第一列，有五个字母，逐行交错还原。
:::

## 保持符号与复核
<!-- sources: military, code, py -->
只要位置定义一致，原则上任何字元都可放进矩阵。当前原生实现以 Unicode 码点计位置，空格和换行也可以占位。部分历史或兼容实现先删除空白与标点，两者的密文不一定相同。

## 常见误区

- 数字列键的排名顺序和物理列的书写顺序不同。
- 末行未填满时不能一律把密文均分。
- 重复关键词字母不表示两列成为同一列。
- 解密结果末尾出现填充符号时，要根据原始文本长度或语境判断。
