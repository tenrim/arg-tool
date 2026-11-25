---
capabilityId: native:byte-codecs
title: 扩展字节编码
topicGroup: encoding
summary: 以原始字节为单位比较位流、Unicode 字母表、传统文本封装和纠错编码。
aliases:
  - basE91
  - Base100
  - Base65536
  - Crockford
  - z-base-32
  - UUencode
  - XXencode
  - Bubble Babble
  - Manchester
  - AAencode
  - JJencode
sources:
  - id: bytes
    title: completion/bytes.js
    publisher: 迷雾工具箱
    url: /completion/bytes.js
    language: zh-CN
    kind: implementation
    locator: 所有字节编解码、输入格式和完整性校验
  - id: b91
    title: basE91
    publisher: Equim
    url: https://github.com/Equim-chan/base91
    language: en
    kind: author-spec
    locator: 位缓冲实现
  - id: b65536
    title: Base65536
    publisher: qntm
    url: https://github.com/qntm/base65536
    language: en
    kind: author-spec
    locator: 双字节码点和奇数尾部
  - id: crock
    title: Base32
    publisher: Douglas Crockford
    url: https://www.crockford.com/base32.html
    language: en
    kind: author-spec
    locator: 字母表、归一和校验
  - id: paper
    title: Error Detecting and Error Correcting Codes
    publisher: R. W. Hamming
    url: https://onlinelibrary.wiley.com/doi/10.1002/j.1538-7305.1950.tb00463.x
    language: en
    kind: author-spec
    locator: 单错纠正与总体校验
  - id: js
    title: completion/obfuscation.js
    publisher: 迷雾工具箱
    url: /completion/obfuscation.js
    language: zh-CN
    kind: implementation
    locator: 固定编码器及隔离还原
---

## 介绍
<!-- sources: bytes, b91, b65536 -->

此类编码把同一串原始字节表示成文本。给定字符集、分组和尾部规则，解码应恢复所有字节，包括开头或末尾的 00。输入文字时先转成 UTF-8。

## basE91 的可变位长
<!-- sources: b91, bytes -->

位缓冲的低 13 位大于 88 时消费 13 位，否则消费 14 位，然后各自写成两个 91 进制符号。编码末尾可能只有一个符号。反查要核对完整尾部。

:::example 实算短串
[输入]
UTF-8 test，即 74 65 73 74
[结果]
fPNKd
[说明]
大小写与标点都是字母表的一部分。
:::

## Unicode 作为二进制容器
<!-- sources: bytes, b65536 -->

Base100 将每字节 b 映到 U+1F3F7+b。Base65536 的两个字节对应一个固定安全范围内的码点，奇数尾部用独立码点区。Unicode 码点占多少 UTF-8 字节与原载荷无关。

:::example Base100 两个极值
[输入]
00 FF
[结果]
🏷📶
[说明]
分别是 U+1F3F7 与 U+1F4F6。
:::

## 两个字母表的五位组
<!-- sources: bytes, crock -->

Crockford 字节和 z-base-32 都从最高位切分五位组。两者字母表不同，尾部不足五位补零。Crockford 还容许反查中对 O、I、L 和连字符归一。

:::example Crockford 字节模式
[输入]
FF
[结果]
ZW
[说明]
组值为 31 和 28。
:::

:::example z-base-32 的文字样例
[输入]
UTF-8 foo
[结果]
c3zs6
[说明]
泛用的 Base32 字母表会写出不同字符串。
:::

## 传统封装和拟音格式
<!-- sources: bytes -->

UUencode、XXencode 每三字节拆出四个六位值，使用各自字表和行长字符。完整结构含 begin、权限、文件名、零行和 end。Bubble Babble 则用元辅音交替表达位域并按字节更新种子。

:::example UU 与 XX 的同一输入
[输入]
UTF-8 Cat
[结果]
UU 数据行 #0V%T；XX 数据行 1Eq3o
[说明]
实际六位值是 16、54、5、52。
:::

:::example Bubble Babble 已知串
[输入]
UTF-8 Pineapple
[结果]
xigak-nyryk-humil-bosek-sonax
[说明]
连字符和末端音节属于格式。
:::

## 位运算和信号标签
<!-- sources: bytes, paper -->

Gray 逐字节计算 b XOR (b≫1)。余 3 字节模式把八位整数写为三个十进制数字再分别加 3。Hamming(7,4) 用三个偶校验位保护每半字节。Manchester 为每位写两个电平，约定 0→01、1→10；差分 Manchester 每位中点翻转，0 在开头翻转。

:::example Gray 与 Manchester 对照
[输入]
Gray 的 03；Manchester 的 00
[结果]
00000010；0101010101010101
[说明]
前者每字节异或一次，后者把每个零写成 01。
:::

## 一元与 JavaScript 表示
<!-- sources: bytes, js -->

连续位段一元编码有明确的 7 位 ASCII 与 8 位字节两种版本。AAencode、JJencode 把文本表示为 JavaScript 符号表达式；还原结果是源文本，不需要运行还原出的程序。

:::example 七位一元编码
[输入]
ASCII C
[结果]
0 0 00 0000 0 00
[说明]
1000011 依次是一位 1、四位 0、两位 1。
:::

## 常见误区

- Crockford 的整数校验模式不能与字节模式混用。
- 显示为一枚 Unicode 符号时，底层字节数可能不同。
- Hamming(7,4) 的单错纠正能力不能保证正确处理双错。
- 编码字符串即使有校验或混淆，也不等同于加密。

