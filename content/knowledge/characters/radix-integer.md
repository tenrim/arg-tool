---
capabilityId: pair:To%20Base
title: 任意进制整数
topicGroup: characters
summary: 从位权与除基取余理解进制转换，并核对带符号整数和大数精度。
aliases:
  - To Base
  - From Base
  - Base 2–36
  - 进制换算
sources:
  - id: radix
    title: ECMAScript — Number::toString 与 BigInt::toString
    publisher: Ecma TC39
    url: https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-numeric-types-number-tostring
    language: en
    kind: standard
    locator: 按进位基数表示数值
  - id: engine
    title: CyberChef 固定操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To Base 与 From Base
  - id: big
    title: BigNumber.js API
    publisher: Mike McLaughlin
    url: https://mikemcl.github.io/bignumber.js/
    language: en
    kind: author-spec
    locator: 任意基数输入和任意精度整数输出
---

## 介绍
<!-- sources: radix, big -->

进制转换改变一个数的书写方式。基数为 b 时，每个位置有 b 种数位，越向左权值越高。本文以 2 至 36 的整数进制为例，超过 9 的数位使用按顺序排列的拉丁字母。

## 按位权读数
<!-- sources: radix, engine -->

从右到左，指数依次是 0、1、2 等。把每个数位乘以其位置的基数幂，再把所有结果相加，可以还原十进制数值。

:::example 三十六进制的两个末位
[输入]
zz（基数 36）
[结果]
十进制 1295
[说明]
z 的数位值为 35，所以结果为 35×36+35。
:::

## 除基取余
<!-- sources: radix, big -->

将整数的绝对值除以目标基数，记录每次的余数并用商继续除。第一个余数对应最低位，输出时应逆序。负号在常规带符号记法中不参与进位换算。

:::example 负整数的十六进制写法
[输入]
十进制 −255
[结果]
-ff
[说明]
255 除以 16 得商 15、余 15，所以数位为 ff。符号单独写在前面。
:::

## 大整数的精确性
<!-- sources: radix, big, engine -->

数值作为定精度浮点数存储时，较大的整数可能在转换前已经舍入。要精确换算大整数，应按数字文本构造任意精度整数，并使用同一规则输出。

:::example 超过常用双精度安全整数范围
[输入]
十进制 9007199254740993
[结果]
十六进制 20000000000001
[说明]
该整数为 2⁵³+1。按十六进制展开，最高非零位为 2×16¹³，最低位是 1。
:::

## 整数和原格式
<!-- sources: radix, engine -->

进制换算以数值为主体。十进制 00065 与 65 是同一个数，但它们的字符串形式不同。若前导零表明字段宽度、字节数或标识符规范，应另行保留。

## 常见误区

- 数位必须小于进制基数。字母在不同进制里也可能不合法。
- 普通负整数写法不会隐含固定字长或二补码。写成字节前仍需定义宽度。
- 将 65 换成十六进制 41 只是改写数值。将字节 41 解释为字符 A 还需使用字符表。
