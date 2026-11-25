---
capabilityId: pair:To%20Hex%20Content
title: Snort 十六进制内容
topicGroup: characters
summary: Snort 内容字串可将可打印文字与由竖线包围的十六进制字节写在同一字段中。
aliases:
  - To Hex Content
  - From Hex Content
  - 管道十六进制字节
sources:
  - id: snort
    title: Snort 3 Rule Writing Guide — content
    publisher: Cisco Talos
    url: https://docs.snort.org/rules/options/payload/content
    language: en
    kind: official-doc
    locator: 用竖线标出十六进制字节以及带语法意义的字符
  - id: ascii
    title: RFC 20 — ASCII Format for Network Interchange
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc20.txt
    language: en
    kind: standard
    locator: 第 2、3 节，字符表及八位字节中的表示
  - id: fixed
    title: CyberChef Worker（固定构建）
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: 可打印字符与竖线中的十六进制写法
---

## 介绍
<!-- sources: snort -->
Snort 的 content 字串按原始字节表达一段待比较内容。书写时，可打印字符可直接出现，其他位置可用一对竖线包住十六进制字节。两类写法在同一字串中按先后顺序拼接。

## 文字与字节混排
<!-- sources: snort, ascii -->
在竖线外，示例中的 ASCII 文字按字符各占一个字节。在竖线内，一组两位十六进制数字表示一个原始字节，组间的空格只负责分隔。竖线外的普通空格则是实际的 20 字节。

:::example 文字后接两个控制字节
[输入]
50 4B 03 04
[结果]
PK|03 04|
[说明]
50 和 4B 分别对应 P 和 K，03 与 04 保持为十六进制字节组。结果仍表示原来的四个字节。
:::

## 有语法意义的字符
<!-- sources: snort, fixed -->
竖线在 content 字串中参与语法解析。原始数据中如有字面竖线，写成十六进制 7c 可把它明确标为一个字节。其他标点也能用十六进制写法，只要逐个换回原值即可。

:::example 表示字面竖线
[输入]
A=B | C
[结果]
A|3d|B |7c| C
[说明]
3d 对应等号，7c 对应原文字中的竖线。套在它们外面的竖线才是记号，另外两个空格仍分别表示 20。
:::

## 等价写法
<!-- sources: snort, ascii -->
同一字节既能用可打印字符表示，也能写在十六进制区段中。检验两种写法是否等价时，先逐段展开为字节，然后比较长度与位置。

:::example 全十六进制表示
[输入]
ABC
[结果]
|41 42 43|
[说明]
ASCII 中 A、B、C 分别是 41、42、43，竖线中的两个排版空格均不增加字节。
:::

## 从混排字串还原数据
<!-- sources: snort, ascii -->
还原时分清竖线内外，并按原顺序连接文字的字节与每组十六进制数。对非 ASCII 文字，还须先知道其编码。同一个汉字可由多种字符编码表示，字节内容依赖选定编码。

## 常见误区
- 竖线包住的 41 表示一个 A 字节，竖线外的 41 表示两个数字字符。
- 把竖线外的空格删掉会改变内容；在十六进制区段内，分隔空格不占数据位置。
- 一段混排字串只描述字节内容，完整 Snort 规则另有结构。
