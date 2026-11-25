---
capabilityId: native:classical-playfair
title: Playfair 密码
topicGroup: classical
summary: 按字母对在方阵上移动或交换列坐标的古典替换密码。
aliases:
  - Playfair
  - 双字母密码
sources:
  - id: aca
    title: Playfair
    publisher: American Cryptogram Association
    url: https://www.cryptogram.org/downloads/aca.info/ciphers/Playfair.pdf
    language: en
    kind: author-spec
    locator: 同行、同列、矩形及填充样例
  - id: py
    title: pycipher — playfair-cipher
    publisher: James Lyons
    url: https://pycipher.readthedocs.io/en/master/#playfair-cipher
    language: en
    kind: author-spec
    locator: 25 字符方阵的互操作定义
  - id: iet
    title: "Sir Charles Wheatstone: The Playfair Cipher"
    publisher: IET Archives
    url: https://ietarchivesblog.org/2020/02/17/sir-charles-wheatstone-1802-1875-the-playfair-cipher/
    language: en
    kind: official-doc
    locator: 馆藏 Wheatstone 和 Playfair 记录
  - id: old
    title: Military Cryptanalysis, Parts I and II
    publisher: William F. Friedman / U.S. War Department
    url: https://www.nsa.gov/portals/75/documents/news-features/declassified-documents/friedman-documents/publications/FOLDER_247/41748699078793.pdf
    language: en
    kind: official-doc
    locator: Playfair 二字母替换与历史实例
  - id: code
    title: 原生古典密码实现
    publisher: 迷雾工具箱
    url: /expansion/classical-core.js
    language: zh-CN
    kind: implementation
    locator: keyedSquare、playfairResult 的三条位置规则
---

## 介绍
<!-- sources: iet, old -->
Playfair 是 Charles Wheatstone 提出、因 Lyon Playfair 推广而得名的古典密码。它以两个字母为一个替换单位，在约定好的方阵内按相对位置选择新的两个字母。

## 方阵与字母对的准备
<!-- sources: aca, py, code -->
经典 5×5 方阵容纳 25 个符号。常见做法把 I/J 合并，再把关键词按首次出现保留并放在方阵开头，补齐剩余字母。顺读明文时，同一对出现相同字母就插入填充并从留下的第二个原字母重新开始。末尾单个字符也需补齐。

## 同行、同列与矩形
<!-- sources: aca, old, code -->
同行各向右移动一格，同列各向下移动一格，在末列或末行回绕。其余两个位置构成矩形，保持各自的行而交换两者的列。在解密中反向移动同行与同列，矩形交换规则不变。

:::example 用三组位置关系复算
[输入]
方阵 ABCDE / FGHIK / LMNOP / QRSTU / VWXYZ
分别加密 AB、AF、AG
[结果]
BC、FL、BF
[说明]
AB 同行，AF 同列；AG 取各自行中对方列上的 B 与 F。
:::

## 重复字符与填充
<!-- sources: aca, code -->
若原字符本身等于常用填充字符，须另选备用字符来分开重复。例如使用 X 填充、Q 备用时，双 X 会重复产生 XQ 的字对。

:::example 处理双 X
[输入]
默认 5×5 方阵，明文 XX
[结果]
预处理为 XQXQ，密文 VSVS
[说明]
XQ 跨行列，交换两者列坐标得到 VS。由于还剩一个 X，补 Q 再加密一次。
:::

## 解密、重建与信息丢失
<!-- sources: aca, old, code -->
解出的是预处理字对。相同结果可能来自原本存在填充字符的明文，或后来自动补齐的明文。I/J 合并与去除空白也会丢失原始写法，须靠载体语境判断。

:::example 由密文还原补过的文本
[输入]
方阵 LOGAR / ITHMB / CDEFK / NPQSU / VWXYZ
密文 DLHFSNCNCRZXCQQGFEEQON
[结果]
COMEQUICKLYWENEXEDHELP
[说明]
在语境中可读为 COME QUICKLY WE NEED HELP，NE 与 ED 之间的 X 是对应字对的填充记录。
:::

## 常见误区

- 解密不可将所有 X 一律删掉。
- 5×5 方阵常见 I/J 合并，无法由密文恢复每个原字母的选取。
- 矩形替换需保留各字母的行和字对顺序。
- Playfair 能改变单字母频率表现，仍属于可分析的历史密码。
