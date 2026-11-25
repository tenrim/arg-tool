---
capabilityId: pair:To%20Octal
title: 八进制字节
topicGroup: characters
summary: 按八进制位权逐字节读写，说明边界、分组和与权限位的区别。
aliases:
  - To Octal
  - From Octal
  - 字节的八进制表示
sources:
  - id: radix
    title: ECMAScript — Number::toString 与 BigInt::toString
    publisher: Ecma TC39
    url: https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-numeric-types-number-tostring
    language: en
    kind: standard
    locator: 按进位基数表示数值
  - id: ascii
    title: RFC 20 — ASCII Format for Network Interchange
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc20.txt
    language: en
    kind: standard
    locator: 第 2、3 节，字符表及八位字节中的表示
  - id: engine
    title: CyberChef 固定操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To Octal 与 From Octal
---

## 介绍
<!-- sources: radix, engine -->

八进制以 8 为基数，使用数字 0 至 7。用于字节展示时，每个数只代表序列中的一个字节，其数值在十进制 0 至 255 之间。输出依次列出每个字节各自的八进制写法。

## 位权与边界
<!-- sources: radix, engine -->

八进制从右起的三个位权为 1、8 和 64。八位字节可先在最高位左侧补一个零，再每三位分一组；三组组合后的最大八进制值为 377。

:::example 十六进制字节换算
[输入]
字节 00、FF、41
[结果]
0 377 101
[说明]
FF 为十进制 255，即 3×64 + 7×8 + 7。41 为十进制 65，即 1×64 + 0×8 + 1。
:::

## 进位发生的位置
<!-- sources: radix, engine -->

在八进制中，7 加 1 得到 10，77 加 1 得到 100。较小的字节值可以只写一位或两位，此时由分隔符标明各字节的边界。

:::example 连续观察两次进位
[输入]
十进制字节 0、7、8、63、64
[结果]
0,7,10,77,100
[说明]
八进制 10 对应 8，100 对应 8²。逗号不计入数据。
:::

## 解码与分组
<!-- sources: ascii, radix, engine -->

解码时先按约定的分隔符读取每个数，再换算为单个字节。若没有分隔符，只能在资料明确给出固定宽度时切分。不同文件格式可以对前导零有不同的展示约定。

:::example 按逗号读回原字节
[输入]
377,000,012
[结果]
字节 FF 00 0A
[说明]
八进制 012 即十进制 10，ASCII 对应 LF。000 仍代表一整个 00 字节。
:::

## 和其他八进制记法区分
<!-- sources: radix, ascii -->

八进制也可用来紧凑地表示按三位分组的掩码。读到一串八进制数字时，要判断它表示一个整数、按字节分组的数组，还是由协议赋予额外含义的标记。字节序列必须保存原有的位置关系。

## 常见误区

- 8 和 9 不是八进制数位。
- 377 是一个字节的上限。400 表示十进制 256，需要更宽的表示。
- 省略八进制组的前导零不改变该字节的值，省略整个 0 组会丢掉一个字节。
