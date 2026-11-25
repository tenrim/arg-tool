---
capabilityId: pair:To%20Float
title: IEEE 754 浮点数
topicGroup: characters
summary: IEEE 754 把浮点数编码为符号位、指数域和小数域。字段位宽决定数值范围和精度，字节序决定这些位在原始字节中的排列。
aliases:
  - To Float
  - From Float
  - binary32
  - binary64
  - 浮点数字节
sources:
  - id: ieee
    title: IEEE 754-2019 — Standard for Floating-Point Arithmetic
    publisher: IEEE
    url: https://standards.ieee.org/ieee/754/6210/
    language: en
    kind: standard
    locator: 二进制交换格式及舍入规则
  - id: oracle
    title: Numerical Computation Guide — IEEE Arithmetic
    publisher: Oracle
    url: https://docs.oracle.com/cd/E19957-01/806-3568/ncg_math.html
    language: en
    kind: official-doc
    locator: Single Format 与 Double Format
  - id: struct
    title: struct — 将字节串解读为打包的二进制数据
    publisher: Python Software Foundation
    url: https://docs.python.org/zh-cn/3/library/struct.html
    language: zh-CN
    kind: official-doc
    locator: 字节顺序、大小和对齐，格式字符 f 和 d
  - id: fixed
    title: ToFloat（CyberChef 固定源码）
    publisher: GCHQ
    url: /vendor/knowledge/cyberchef/src/core/operations/ToFloat.mjs
    language: en
    kind: implementation
    locator: 32 位与 64 位读取及字节分组
---

## 介绍
<!-- sources: ieee, oracle -->
IEEE 754 规定浮点数的格式与运算。binary32 和 binary64 分别使用 32 位与 64 位，常见于二进制文件、数值数组和网络消息。两种格式都用有限位数表示数值，因此只能精确表示有限的一组实数。

## 符号、指数与有效数
<!-- sources: ieee, oracle -->
从最高位开始，binary32 的符号、指数、小数域分别占 1、8、23 位，binary64 则占 1、11、52 位。对规格化数，符号位为 s，指数域整数为 e，小数域整数为 f，小数域位宽为 m，数值是 (−1)ˢ × (1 + f / 2ᵐ) × 2ᵉ⁻ᵇⁱᵃˢ。两种格式的指数偏置分别是 127 和 1023。

:::example 还原 32 位的 1.5
[输入]
3F C0 00 00（binary32，大端）
[结果]
1.5
[说明]
符号位为 0，指数域为 127，小数域最高位为 1。因此有效数为 1 + 1/2，指数为 127 − 127 = 0。
:::

## 位布局与字节顺序
<!-- sources: struct, fixed -->
字段的位置由浮点格式规定。把位串按字节存放时，大端顺序把最高有效字节放在前面，小端顺序把最低有效字节放在前面。连续读取一组浮点数时，每个值以 4 字节或 8 字节为单位分别判读。

:::example 小端存放同一位型
[输入]
00 00 C0 3F（binary32，小端）
[结果]
1.5
[说明]
这 4 字节按小端解释得到同一个 32 位位型 0x3FC00000。字节内部的八个位保持各自的位置。
:::

## 舍入和十进制显示
<!-- sources: ieee, oracle -->
分母约分后仍含 5 的十进制分数，无法用有限长度的二进制小数精确表示。编码时须根据舍入规则选择可表示值。显示时则可采用最短可往返的十进制写法，所以屏幕上的短写法可能与存储值的精确十进制展开不同。

:::example 0.1 的 binary32 近似
[输入]
0.1（binary32，按最近值舍入，大端）
[结果]
3D CC CC CD
[说明]
位型 0x3DCCCCCD 的值恰好为 0.100000001490116119384765625。常见显示保留到 0.10000000149011612，两种写法对应同一位型。
:::

## 次正规数和特殊值
<!-- sources: ieee, oracle -->
指数域为零时，小数域为零表示带符号的零，小数域非零则表示次正规数，有效数的首位为 0。指数域全为 1 时，小数域为零表示带符号的无穷，小数域非零属于 NaN 编码。同类 NaN 可有多个不同的位型。

## 常见误区
- 十进制界面显示 0.1 时，浮点位型仍可能保存它的近似值。
- 同一组 4 字节可能是整数、binary32，或较长结构的一部分，须先确定字段类型。
- 端序描述同一值所占字节的顺序，解读连续记录时以各字段为单位。
