---
capabilityId: pair:LZString%20Compress
title: LZString 压缩与解压
topicGroup: file-compression
summary: 利用字符串字典压缩文本，区分默认、UTF16 与 Base64 输出形式。
aliases:
  - LZString Compress
  - LZString Decompress
  - LZ-String
sources:
  - id: author
    title: LZ-string JavaScript compression
    publisher: Pieroxy
    url: https://pieroxy.net/blog/pages/lz-string/index.html
    language: en
    kind: author-spec
    locator: compress、compressToUTF16、compressToBase64 的区分
  - id: engine
    title: CyberChef 11.5.0 压缩模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Compression.js
    language: en
    kind: implementation
    locator: LZString Compress / Decompress 的三对函数映射
---

## 介绍
<!-- sources: author, engine -->
LZ-String 是面向 JavaScript 字符串的压缩方案。它根据输入中已看到的字符组合建立字典，借字典码表达重复，再将位流装入适合不同场景的字符串。

## 字典与位宽
<!-- sources: author, engine -->
编码器逐步加入新的词条，解码器按同一顺序建回对应字典。词条数量增长时编码位数会按规则扩展。处理的基本输入是字符串中的代码单元，保留输入的完整 Unicode 序列需要用匹配的解码方向。

## 输出包装形式
<!-- sources: author, engine -->
默认输出可直接出现普通文本渠道不易保存的代码单元。UTF16 形式面向适合保存字符串的环境，并有尾随空格；Base64 形式通过指定字母表产生可打印字符。三种都应使用各自对应的解压方式。

## 结果与回读对照
<!-- sources: author, engine -->
样例中的 U+XXXX 表示实际输出单元的十六进制码值。

:::example 文本适合复制的形式
[输入]
HELLO，Base64 模式
[结果]
BIUQMmDyQ===
[说明]
用解压的 Base64 模式回读 HELLO。末尾填充是这个包装的实际结果。
:::

:::example UTF16 输出的尾部
[输入]
HELLO，UTF16 模式
[结果]
U+0262 U+442C U+4C3E U+2420 U+0020
[说明]
最后一个普通空格是固定输出的一部分，解压时应保留原样。
:::

:::example 处理包含复合平面码点的文本
[输入]
迷雾🧩，Base64 模式
[结果]
u/xj+0x8G4l7tA==
[说明]
原始字符串由对应模式完整还原，包含最后的拼图字符。
:::

## 字符串形式的传递
<!-- sources: author, engine -->
需要跨环境复制时，可优先选择接收方支持的可打印形式，并核对尾部空格或等号是否被清理。这里的 Base64 名称指 LZ-String 的文本包装，不会将其变成 gzip 或别的压缩格式。

## 常见误区
- 必须用对应包装形式的 LZ-String 解压器。
- 默认和 UTF16 输出具有不同的代码单元布局。
- LZ-String 文本形式不能用通用 ZIP 解压读取。
