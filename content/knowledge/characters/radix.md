---
capabilityId: native:radix
title: 数字进制转换
topicGroup: characters
summary: 通过位权和连续整除余数，在不同基数之间写出同一个整数。
aliases:
  - 进制
  - radix
  - base36
  - 位权
sources:
  - id: base
    title: Converting with Base Systems
    publisher: OpenStax / Rice University
    url: https://openstax.org/books/contemporary-mathematics/pages/4-3-converting-with-base-systems
    language: en
    kind: official-doc
    locator: 以给定基数展开整数
  - id: big
    title: ECMAScript BigInt Type
    publisher: Ecma / TC39
    url: https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-bigint-type
    language: en
    kind: standard
    locator: 整数数值与运算
  - id: code
    title: 进制转换实现
    publisher: 迷雾工具箱
    url: /completion/codes.js
    language: zh-CN
    kind: implementation
    locator: radix 与 DIGITS
---

## 介绍
<!-- sources: base, code -->
进制是整数的表示方式。基数为 r 时，每位必须小于 r，从右往左的位权为 1、r、r²，继续向左递增。同一个数可有不同的进制串。

## 将各位按位权累加
<!-- sources: base, code -->
从最左一位扫描，把当前总值乘原基数，再加下一位的数值。处理有符号整数时将负号另外记录，从绝对值做进制换算，最后把负号放回。

:::example 十六进制负数
[输入]
原进制 16，目标进制 10，输入 ff -100
[结果]
255
−256
[说明]
ff 值为 15×16＋15；十六进制 100 代表 16²，符号保留为负。
:::

## 连续除取余数
<!-- sources: base, big, code -->
用目标基数整除整数，第一次余数是最低位。再对商重复同样操作，直至商为零。逆序连接所得到的余数即写出目标串。

:::example 255 的两种换算
[输入]
十进制 255
[结果]
转二进制为 11111111，转十六进制为 ff
[说明]
向 16 进制的两次余数都是 15。转二进制时，255 等于从 1 到 128 的八个二次幂之和。
:::

## 大基数下的数字集
<!-- sources: code -->
在 2 至 36 进制范围使用 0–9、A–Z，不区分输入的字母大小写。基数大于 36 时使用 0–9、A–Z、a–z、+、/ 的次序，大小写随值区分。数字集的次序属于编码约定。

:::example 64 进制的四个单字符
[输入]
基数 64 到 10，A a + /
[结果]
10、36、62、63
[说明]
A 与 a 在所用数字集中分开编号。+ 与 / 在基数 64 可表示数字。
:::

## 长整数与原串格式
<!-- sources: big, code -->
整数换算用 BigInt，不需要先近似成浮点。以空白分开的多个整数分别转换。数值转换不会保留输入前导零，也不会把转换后的整数自动切成字节流。

## 常见误区

- 有效数字必须严格小于原基数，例如八进制没有数字 8。
- 64 进制整数串与对字节流进行 Base64 编码是不同用途。
- 原有数字串的前导零没有数值影响。
- 进制转换输出数字，字符转码要另外指定字符编码。
