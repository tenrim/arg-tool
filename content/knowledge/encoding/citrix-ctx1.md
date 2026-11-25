---
capabilityId: pair:Citrix%20CTX1%20Encode
title: Citrix CTX1
topicGroup: encoding
summary: 理解旧格式中 UTF-16LE 字节、链式异或与 A–P 半字节表示的关系。
aliases:
  - Citrix
  - CTX1
  - 链式异或
sources:
  - id: source
    title: 固定 CitrixCTX1Encode 源码
    publisher: GCHQ / CyberChef
    url: /vendor/knowledge/cyberchef/src/core/operations/CitrixCTX1Encode.mjs
    language: en
    kind: implementation
    locator: run 的 CP1200、0xA5 链式异或与 A–P 映射
    upstreamUrl: https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/CitrixCTX1Encode.mjs
    license: Apache-2.0
    licenseUrl: /vendor/knowledge/LICENSE.txt
  - id: chef
    title: CyberChef 11.5.0 Citrix CTX1 Encode / Decode
    publisher: GCHQ / CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: Citrix CTX1 Encode / Decode 输入、输出及参数
  - id: utf
    title: Unicode 17.0 Chapter 3
    publisher: Unicode Consortium
    url: https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-3/
    language: en
    kind: standard
    locator: UTF-16LE 字节顺序和码元
---

## 介绍
<!-- sources: source, chef -->
CTX1 是一种旧式可逆格式。这里的编码先把文字转换为 UTF-16LE 字节，然后做链式异或，最后把每个生成的字节转换成 A 至 P 的两个字符。

## 编码字节与先低位
<!-- sources: utf, source -->
UTF-16LE 在每个 16 位码元内先写低位字节。合成的补充平面字符可能使用两个码元。可复算时应先列出准确的字节，不能拿文本的外观长度取代字节长度。

:::example 单个大写 A
[输入]
A
[结果]
OEEB
[说明]
UTF-16LE 字节是 41 00。初始前值 00，首个变换值为 41 XOR A5 XOR 00＝E4，再得到 00 XOR A5 XOR E4＝41。E4 与 41 映射成 OE 和 EB。
:::

## 链式异或与半字节
<!-- sources: source, chef -->
设输入字节为 x，前一步生成值为 p，当前输出字节 y＝x XOR A5 XOR p。然后将 y 的高四位和低四位各自映射到对应的 A–P 字母。下一步将 y 作为前值。

:::example 两个字母的链接
[输入]
AB
[结果]
OEEBKGAD
[说明]
前两个输出字节是 E4、41，后续 42 00 生成 A6、03，映射为 KG、AD。
:::

## 反查与相同公式
<!-- sources: source, chef, utf -->
解码先把字母对还原成字节，按 y XOR A5 XOR p 得原字节。这里使用的 p 是上一项已编码的字节。最后按 UTF-16LE 将码元还原成文字。

:::example 读取小写字母
[输入]
MEGB
[结果]
a
[说明]
ME 和 GB 分别还原 C4 和 61。依公式得到原字节 61 00，对应小写 a。
:::

## 格式识别与保护边界
<!-- sources: source, chef -->
编码中没有随机盐或秘密密钥。A–P 的外观也出现在其他半字节表示中；验证这种格式时应核对编码长度与解码后的码元结构。这类转换主要用于阅读已知的旧格式。

## 常见误区

- A–P 字符表本身不足以确认是 CTX1。
- 反向计算使用上一个已编码字节。
- 应在字节还原之后按 UTF-16LE 解释文字。
- 可逆格式不能当成现代密码散列保护。
