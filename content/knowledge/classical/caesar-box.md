---
capabilityId: op:Caesar%20Box%20Cipher
title: 凯撒方阵密码
topicGroup: classical
summary: 说明矩形换位的等距取位、长短列复原、方阵的自反条件以及两种常见网格方向。
aliases:
  - Caesar Box Cipher
  - 凯撒方阵
  - 等距取位
sources:
  - id: dcode
    title: Caesar Box Cipher
    publisher: dCode
    url: https://www.dcode.fr/caesar-box-cipher
    language: en
    kind: author-spec
    locator: 加密与解密说明
  - id: uri
    title: Transposition Cipher
    publisher: University of Rhode Island
    url: https://cs.uri.edu/cryptography/classical-ciphers/transposition/article.html
    language: en
    kind: official-doc
    locator: Description and Scytale Cipher
  - id: rail
    title: Rail Fence Cipher
    publisher: DenCode
    url: https://dencode.com/en/cipher/rail-fence
    language: en
    kind: author-spec
    locator: 折返轨迹示例
  - id: source
    title: CaesarBoxCipher 固定源码
    publisher: GCHQ CyberChef
    url: /vendor/knowledge/cyberchef/src/core/operations/CaesarBoxCipher.mjs
    upstreamUrl: https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/CaesarBoxCipher.mjs
    language: en
    kind: implementation
    locator: run 函数的跨度与空格处理
    license: Apache-2.0
    licenseUrl: /vendor/knowledge/LICENSE.txt
  - id: engine
    title: CyberChef 操作目录
    publisher: GCHQ CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: Caesar Box Cipher
---

## 介绍
<!-- sources: dcode, uri -->

凯撒方阵密码把字符写入网格，再沿另一方向读出。每个原字符都进入密文一次，发生变化的是字符的位置。矩形的形状、起笔位置和读写方向共同确定置换。

常见的表示方式是从左到右逐行填入，再从上到下逐列读出。一旦缺少末行字符，便需要约定是否补位，以及读出时如何处理空槽。

## 等距取位
<!-- sources: dcode, source, engine -->

把明文每 h 个字符放成一行，则第一列包含下标 0、h、2h 等字符，第二列包含 1、1+h、1+2h 等字符。逐列输出等价于按下标除以 h 的余数分组，同时保留每组内部的原始顺序。不同实现可能把这个跨度称为宽、列数或高度，因此用每行格数或明确的索引规则更易核对。

:::example 三乘三网格
[输入]
ABCDEFGHI，每行 3 格
[结果]
ADG / BEH / CFI
密文 ADGBEHCFI
[说明]
第一行是 ABC，第二行是 DEF，第三行是 GHI。竖读第一列取 A、D、G，其余两列以相同方式读取。斜线只分隔列。
:::

## 缺格与长短列
<!-- sources: dcode, source -->

设参与排列的字符数为 n，每行 h 格，写成 n = qh + r。若没有实际填充字符，前 r 列各有 q+1 个字符，其余列各有 q 个。解密时按这个长度顺序切分密文，再把各列填回去。

:::example 缺两格的末行
[输入]
ABCDEFG，每行 3 格，末行留空
[结果]
ADG / BE / CF
密文 ADGBECF
[说明]
7 = 2×3+1。密文切成 3、2、2 三段。将三段分别竖写后逐行读取，得到 ABC、DEF、G。
:::

## 矩形转置和逆向读取
<!-- sources: dcode, uri, source -->

填满的网格转置后，行和列的长度互换。在完整正方形上，交换两次行列可恢复原排列。在完整矩形上，第二次要按第一次的行数分行。含空槽的矩形则须按各列的真实长度复原。

:::example 完整矩形往返
[输入]
ABCDEFGH，每行 2 格
[结果]
ACEG / BDFH
密文 ACEGBDFH
按每行 4 格再次逐列读取，得到 ABCDEFGH。
[说明]
初始网格为 4 行 2 列，密文中两列各有 4 个字符。把它们写成两行后，逐列可读回 AB、CD、EF、GH。
:::

## 解谜应用
<!-- sources: uri, rail, source -->

网格、固定间隔和首列线索可用于识别这一规则。在三个格宽的矩形里，第一列每隔三个字符取一次。三栏折返栅栏的顶部每隔四个字符才返回一次，二者都保留字符频数，仍可凭间隔区别。

比较频数时须先确认参与换位的字符。例如某些写法移除普通空格，再排列剩余字符。原来空格的位置已经丢失，从密文只能恢复参与排列的字符序列。

## 常见误区

- 矩形的行数和列数各有含义。读取跨度应由排列方向确定。
- 解密不完整的矩形时，不能按平均值把密文切成等长段。分段长度取决于末行填了多少格。
- 方阵置换保留参与排列字符的字频。相似的频数不足以推断具体网格。
- 凯撒方阵采用位置重排。凯撒字母移位改变每个位置上的字母身份。
