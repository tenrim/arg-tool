---
capabilityId: pair:To%20Hex
title: 十六进制字节
topicGroup: characters
summary: 按高低半字节读写两个十六进制位，区分数据、分隔、前缀与字符编码。
aliases:
  - To Hex
  - From Hex
  - Base16
  - 十六进制字节串
sources:
  - id: base16
    title: RFC 4648 — Base-N Data Encodings
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4648.html#section-8
    language: en
    kind: standard
    locator: 第 8 节，Base16 高低四位
  - id: utf
    title: RFC 3629 — UTF-8
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc3629.html
    language: en
    kind: standard
    locator: 第 3 节，标量到字节的映射
  - id: engine
    title: CyberChef 固定操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To Hex 与 From Hex
---

## 介绍
<!-- sources: base16, engine -->

十六进制每个数位承载四位二进制信息。两个十六进制位正好表示一个八位字节。将许多字节连续写出时，大小写可不同，但必须维持偶数个数据位和正确的字节边界。

## 高位与低位
<!-- sources: base16 -->

设高位数值为 h，低位为 l，则字节值为 16h+l。0 至 9 以数字表示，A 到 F 表示 10 到 15。写一个字节时，即使高半字节全为零也要保留其位置。

:::example 两位定长
[输入]
十进制字节 0、15、16、255
[结果]
00 0f 10 ff
[说明]
15 对应 0F，16 对应 10。用 0f 和 0F 表示的字节相同。
:::

## 标记和分隔
<!-- sources: base16, engine -->

许多格式为字节增加空格、逗号或 0x 前缀。它们帮助确定边界，通常不属于解码后的字节。读取时必须根据实际语法去掉这些标记，而不是无条件丢弃所有非数位的字符。

:::example 带前缀的字节列表
[输入]
字节 00 0F 10 FF
[结果]
0x00,0x0f,0x10,0xff
[说明]
字符串中的 0x 表示记法。每组的后两位才组成一个原始字节。
:::

## 字符编码先决定字节
<!-- sources: utf, base16 -->

同一字符在不同编码下能产生不同字节。用十六进制展示它时，转换对象是已经编码的字节序列。U+ 后面的编号则指定字符身份，两者不能当成同一格式。

:::example 欧元符号先经 UTF-8
[输入]
€（U+20AC）
[结果]
UTF-8 字节 E2 82 AC
[说明]
RFC 3629 的三字节编码保留三组高、低半字节。20 AC 只是拆开了码位编号，不能当作 UTF-8。
:::

## 复原需要完整边界
<!-- sources: base16, engine -->

紧凑字节串可以每两位还原成一个字节。示例 000f10ff 有八个数位，得到四字节。若只有奇数个数位，应该从文件定义或传输记录中找出丢失位置，而不是擅自猜测一个零应放在哪里。

## 常见误区

- 单个 0 数位与完整的 00 字节有不同的长度。
- 逗号、0x 和百分号必须按约定解释。十六进制数值本身只由数据位决定。
- 看见 41 能得到数值 65，但它是否显示 A 取决于数据的字符编码和用途。
