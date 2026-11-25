---
capabilityId: pair:To%20Charcode
title: 字符码转换
topicGroup: characters
summary: 以指定进制展示每个 Unicode 码点，并区分字符编号、代理码元和字节。
aliases:
  - charcode
  - 字符码
  - 码点转换
sources:
  - id: unicode
    title: Unicode 17 第 3 章
    publisher: Unicode 联盟
    url: https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-3/
    language: en
    kind: standard
    locator: 3.9 与 3.10，编码形式、代理对和字节序
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的输入和输出类型及选项
  - id: ecma
    title: ECMAScript String Objects
    publisher: Ecma International
    url: https://tc39.es/ecma262/#sec-string.prototype.codepointat
    language: en
    kind: standard
    locator: String.prototype.codePointAt 与 CodePointAt
---

## 介绍
<!-- sources: unicode, chef -->

字符码把字符写成数值串。通常以 U+ 和十六进制数字书写 Unicode 码点，转换工具也可以把同一数值显示为十进制。数字串中的分隔符用来划定每一项的边界。

## 进制只改变写法
<!-- sources: unicode, chef -->

以字符 あ 为例，十六进制 3042 等于 3×4096 + 4×16 + 2，也就是十进制 12354。这两个数字都指向 U+3042。用十六进制读入十进制的写法会指向别处。

:::example 两种进制
[输入]
あ，分别按十六进制和十进制转换
[结果]
十六进制：3042
十进制：12354
[说明]
进制改变数值的书写形式，码点本身未变。
:::

## 补充平面与代理对
<!-- sources: ecma, unicode, chef -->

UTF-16 字符串里，U+FFFF 以外的码点可以用一对代理码元存储。按码点读取时，两项合并成一个编号。结果前导零用于展示，不改变数值。

:::example 一个超过 FFFF 的码点
[输入]
😀，按十六进制转换
[结果]
01f600
[说明]
它是一个码点 U+1F600，UTF-16 里的 D83D 和 DE00 属于存储层。
:::

## 序列边界与组合文字
<!-- sources: unicode, chef -->

多字符输出依靠空格、逗号等分隔。一个视觉上的字形可能来自多个码点，例如字母后跟组合附加符。转为码点可以检查文字究竟是单一预组字符，还是由多个字符组合而成。

:::example 分隔两个字符
[输入]
Aé，十六进制，以空格分隔
[结果]
41 e9
[说明]
从左往右对应 U+0041 和 U+00E9。
:::

## 与字节流的区别
<!-- sources: unicode, chef -->

从字符码还原时，进制和分隔符应与原数字序列匹配。还原结果经文件或配方继续传输时还涉及字节表示。需要严格指定 UTF-8 或其他字符集的字节时，宜用字符集编码单独确认。

## 常见误区

- 把 UTF-8 字节各自视为码点会把多字节字符拆成无关符号。
- U+ 字样属于文档记号，数值输入通常只保留数字部分。
- 看起来相同的文字可能拥有不同的底层码点序列。

