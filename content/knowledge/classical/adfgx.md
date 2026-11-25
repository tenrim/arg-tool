---
capabilityId: native:classical-adfgx
title: ADFGX 密码
topicGroup: classical
summary: 用五种标签表示方阵坐标，再对坐标串做列换位。
aliases:
  - ADFGX
  - 五符号坐标密码
sources:
  - id: py
    title: pycipher — adfgx-cipher
    publisher: James Lyons
    url: https://pycipher.readthedocs.io/en/master/#adfgx-cipher
    language: en
    kind: author-spec
    locator: 5×5 方阵及列密钥
  - id: signals
    title: The Friedman Lectures on Cryptology
    publisher: William F. Friedman / NSA
    url: https://www.nsa.gov/Portals/75/documents/news-features/declassified-documents/friedman-documents/publications/ACC15281/41785109082412.pdf
    language: en
    kind: official-doc
    locator: ADFGX 的早期用法和 ADFGVX 发展
  - id: military
    title: Military Cryptanalysis Part IV
    publisher: William F. Friedman / U.S. War Department
    url: https://www.nsa.gov/Portals/75/documents/news-features/declassified-documents/friedman-documents/publications/FOLDER_452/41749819078904.pdf
    language: en
    kind: official-doc
    locator: Transposition and Fractionating Systems
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
    locator: adfgResult、columnarTransform
---

## 介绍
<!-- sources: signals, military -->
ADFGX 是一战德国使用的古典组合密码。它先将 25 个方阵字符变成五种坐标标签的双字符，再对得到的坐标序列作列换位。

## 方阵双字符与先行后列
<!-- sources: py, code -->
将 A、D、F、G、X 分别用于行和列。明文在表中的行标在前、列标在后。常用 25 字母表包含 I 而不含 J，选择这一口径后 J 并入 I。若采用另一份方阵，须按同样的顺序确认表中实际字符。

:::example 固定方阵的两个坐标
[输入]
默认 5×5 排列，明文 AB，列键 BA
[结果]
坐标 A A A D，最终 ADAA
[说明]
A 位于第 1 行第 1 列，B 位于第 1 行第 2 列，故先得到 AAAD。
:::

## 第二步的列序与长度
<!-- sources: military, columns, code -->
将坐标字符逐行填入由关键词长度确定的矩形。再按关键词的排序逐列读下去，关键词中同字母按原位置从左到右。没有填满的末行只给最靠左的若干列增加一个位置。

:::example 三列的读取次序
[输入]
默认方阵，明文 CIA，列键 CAB
[结果]
FADAAG
[说明]
C 为 AF、I 为 DG、A 为 AA，坐标串 AFDGAA。矩形行 AFD / GAA，按第 2、第 3、第 1 列读 FA、DA、AG。
:::

## 从密文拆列并重组成对
<!-- sources: py, columns, code -->
用密文长度与列数求整行数和末行余数。按录入时各列原有长度切分密文，再把列放回原位，逐行读出成对坐标。处理有效输入时密文长度为明文符号数的两倍。

:::example 含 J 的往返
[输入]
默认方阵，JIGSAW，列键 BALLOON
[结果]
加密 GADFDAGXGDDD，按相同方阵和列键解回复原为 IIGSAW
[说明]
J 在第一次入方阵时映射为 I，换位逆转只能恢复被编码的方阵字符。
:::

## 识别线索和密码边界
<!-- sources: signals, military, py -->
五符号字母表能提示这种方案，但也可能是人为设计的其他编码。长度为偶数只说明需考虑成对结构。验证是否吻合还要检查方阵、列键与解回的具体文本。

## 常见误区

- 密文应先逆换位，再从两个标签恢复一个字符。
- 关键词有重复字母不会自动合并列。
- 行标和列标共用同一字符集，顺序仍不能交换。
- 合并的 I/J 无法从解密结果直接区分。
