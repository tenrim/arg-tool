---
capabilityId: native:integer-codecs
title: 通用整数编码
topicGroup: encoding
summary: 按进位、递归长度或不相邻权重对任意精度整数编码，并区分块纠错。
aliases:
  - Elias Gamma
  - Elias Delta
  - Fibonacci
  - NegaFibonacci
  - 整数 Gray
  - Shadoks
  - Hamming
  - Base26
  - Base37
sources:
  - id: elias
    title: Universal codeword sets and representations of the integers
    publisher: Peter Elias
    url: https://ieeexplore.ieee.org/abstract/document/1055349
    language: en
    kind: author-spec
    locator: 正整数的长度编码
  - id: fib
    title: Robust Transmission of Unbounded Strings Using Fibonacci Representations
    publisher: Alberto Apostolico、Aviezri Fraenkel
    url: https://docs.lib.purdue.edu/cstech/464/
    language: en
    kind: author-spec
    locator: Fibonacci 表示与自定界码
  - id: paper
    title: Error Detecting and Error Correcting Codes
    publisher: R. W. Hamming
    url: https://onlinelibrary.wiley.com/doi/10.1002/j.1538-7305.1950.tb00463.x
    language: en
    kind: author-spec
    locator: 单错纠正与总体校验
  - id: crock
    title: Base32
    publisher: Douglas Crockford
    url: https://www.crockford.com/base32.html
    language: en
    kind: author-spec
    locator: 字母表、归一和校验
  - id: basic
    title: completion/codes.js
    publisher: 迷雾工具箱
    url: /completion/codes.js
    language: zh-CN
    kind: implementation
    locator: radix、integerCode
  - id: ext
    title: completion/numerals.js
    publisher: 迷雾工具箱
    url: /completion/numerals.js
    language: zh-CN
    kind: implementation
    locator: NegaFibonacci、各进位规则、Crockford 和 Gray
  - id: block
    title: completion/hamming.js
    publisher: 迷雾工具箱
    url: /completion/hamming.js
    language: zh-CN
    kind: implementation
    locator: 综合征与扩展 SECDED
---

## 介绍
<!-- sources: elias, fib, basic -->

通用整数编码用位或字符描述整数。自定界码可以连续连接，读取者通过长度规则或特定终止找到下一个整数。一般进位制则给每位固定权重。

## Gamma、Delta 与正 Fibonacci
<!-- sources: elias, fib, basic -->

Gamma 先写 L−1 个 0，接长度为 L 的二进制原数。Delta 先用 Gamma 编码 L，再接原数去掉首位 1 的后缀。Fibonacci 取 1、2、3、5… 中不相邻的权重，低权重先写，追加 1 形成终止 11。

:::example Gamma 小数列
[输入]
1，2，3
[结果]
1 010 011
[说明]
二进制分别为 1、10、11。
:::

## 有符号的交替权重
<!-- sources: ext, fib -->

NegaFibonacci 采用 1、−1、2、−3、5、−8…，低权重先写后再追加 1。该实现处理非零整数，不能把未定义的全零码用作零。

:::example 两个可查的有符号码字
[输入]
−1 与 +2
[结果]
011 与 0011
[说明]
分别取第二权重、第三权重，随后加终止位。
:::

## 约定不同的进位制
<!-- sources: basic, ext -->

Base26 的 A=0 把 A–Z 作为 0–25；A=1 是双射位值，除法前减一。Base37 可调整数字、字母和分隔符三组次序；空格与下划线等价。Shadoks 则以 Ga、Bu、Zo、Meu 表示四进制的 0–3。

:::example 双射进位边界
[输入]
1、26、27、702、703
[结果]
A Z AA ZZ AAA
[说明]
这一约定不使用前导零位。
:::

:::example 两种进位
[输入]
Base37 的 B37；Shadoks 里的 4
[结果]
15177；Bu Ga
[说明]
B37=11×37²+3×37+7；4=1×4。
:::

## 逐位表示与内置校验
<!-- sources: crock, ext -->

Crockford 校验将原整数模 37 追加为一个字符，可归一 O/I/L 并忽略连字符。余 3 对十进制各位独立编码并保留前导零。Gray 整数以整个非负数计算 n XOR (n≫1)。

:::example 整数的两种表示
[输入]
Crockford 带校验的 32；Gray 的十进制 29
[结果]
10*；19
[说明]
校验余数 32 对应 *；11101 异或 01110 得 10011。
:::

## 整块 Hamming 与 SECDED
<!-- sources: paper, block -->

r 个校验位给出 2ʳ−1 的基本码长，二次幂位置保存偶校验；综合征定位单错。扩展总体偶校验可以检测双错。

:::example 半字节装进码块
[输入]
Hamming(7,4) 输入 1100
[结果]
0111100
[说明]
数据放到 3、5、6、7 位；1、2、4 位为 0、1、1。
:::

## 常见误区

- Elias Gamma 与 Delta 在这里接受正整数。
- Base26 A=0 带前导零字母时会损失原有宽度。
- 整数 Gray 的运算不能逐字节重新开始。
- 检出扩展 Hamming 双错意味着需要重传或保留错误，不能直接纠正。

