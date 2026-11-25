---
capabilityId: pair:Encode%20text
title: 字符集编码
topicGroup: characters
summary: 在 Unicode 文字和指定字符集的原始字节之间转换，并区分码点、字节和字节序。
aliases:
  - charset
  - 字符编码
  - GBK
  - UTF16
  - code page
sources:
  - id: unicode
    title: Unicode 17 第 3 章
    publisher: Unicode 联盟
    url: https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-3/
    language: en
    kind: standard
    locator: 3.9 与 3.10，编码形式、代理对和字节序
  - id: whatwg
    title: Encoding Standard
    publisher: WHATWG
    url: https://encoding.spec.whatwg.org/
    language: en
    kind: standard
    locator: 第 4、5、8、9 节
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的输入和输出类型及选项
---

## 介绍
<!-- sources: unicode, whatwg -->

字符编码规定文本怎样存为字节。Unicode 给字符分配码点，UTF-8、UTF-16 等编码把这些码点变成不同的字节序列。查看十六进制字节能直接看出存储或传输时采用了哪种表示。

## UTF-8 的位组
<!-- sources: unicode, chef -->

ASCII 区间 U+0000 到 U+007F 使用一个字节。后续区间使用两到四个字节，首字节给出长度，续字节以二进制 10 开头。U+00E9 需要两个字节，载荷填入 110xxxxx 和 10xxxxxx 后得到 C3 A9。

:::example 两字节往返
[输入]
é，按 UTF-8 编码
[结果]
C3 A9
[说明]
码点为 U+00E9；两字节合并可以解回 é。
:::

## UTF-16 的字节序
<!-- sources: unicode, chef -->

UTF-16 的基本单位是 16 位。低位在前的 LE 与高位在前的 BE 都保留码元数值，只交换每个码元内的两个字节。补充平面字符使用一对代理码元，字节序转换不交换两个码元的顺序。

:::example 小端与大端
[输入]
é，分别按 UTF-16LE 和 UTF-16BE 编码
[结果]
UTF-16LE：E9 00
UTF-16BE：00 E9
[说明]
两个结果都由码元 00E9 序列化得到，方向通过编码名称区分。
:::

:::example 补充平面的代理对
[输入]
😀，分别按 UTF-8 和 UTF-16LE 编码
[结果]
UTF-8：F0 9F 98 80
UTF-16LE：3D D8 00 DE
[说明]
U+1F600 的代理对是 D83D DE00，小端分别写出这两个码元。
:::

## 传统字符集的覆盖范围
<!-- sources: whatwg, unicode -->

传统代码页通常只覆盖部分文字。例如 Windows-1252 在一字节表中分配了欧元符号，却不能表示所有 Unicode 文字。编码前须确认目标系统的编码标签和覆盖范围，写入未覆盖字符可能报错、产生替代字符或丢失信息。

## 原始字节的交叉核对
<!-- sources: whatwg, chef -->

编码后的结果适合按十六进制查看，解码输入则应保留完整字节及其顺序。错误解码可能出现替代字符或乱码，也可能给出看似正常的另一段文字。把解出的字符重新编码并与原始字节比较，可以暴露截断或不可逆转换。

## 常见误区

- U+00E9 是码点，UTF-8 的 C3 A9 是字节，两者属于不同层。
- 界面显示的字符数量无法直接推得文件字节数。
- 字节翻转必须考虑码元边界，整串倒序会改变文字顺序。

