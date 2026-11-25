---
capabilityId: native:text-steganography
title: 零宽文本隐写与水印
topicGroup: encoding
summary: 用不可见码点承载字节，并区分 StegCloak 与郭飞水印的格式和验证能力。
aliases:
  - 零宽字符
  - StegCloak
  - 郭飞水印
  - 不可见字符
sources:
  - id: unicode
    title: The Unicode Standard — Conformance
    publisher: Unicode Consortium
    url: https://www.unicode.org/versions/latest/core-spec/chapter-3/
    language: en
    kind: standard
    locator: UTF-8、UTF-16 与代理对
  - id: steg
    title: KuroLabs/stegcloak
    publisher: KuroLabs
    url: https://github.com/KuroLabs/stegcloak
    language: en
    kind: author-spec
    locator: 压缩、零宽表示和完整性选项
  - id: wm
    title: guofei9987/hidden_watermark
    publisher: guofei9987
    url: https://github.com/guofei9987/hidden_watermark
    language: en
    kind: author-spec
    locator: text_wm.rs
  - id: crypt
    title: guofei9987/CryptTool
    publisher: guofei9987
    url: https://github.com/guofei9987/CryptTool
    language: en
    kind: author-spec
    locator: LCG 与二进制转换
  - id: impl
    title: fun-tools/text-engine.js
    publisher: 迷雾工具箱
    url: /fun-tools/text-engine.js
    language: zh-CN
    kind: implementation
    locator: watermark、textTransform
---

## 介绍
<!-- sources: unicode, steg, wm -->

零宽文本隐写在可见字符串中插入通常没有字形宽度的码点。掩护文本负责显示，隐藏字符承担载荷。两者在文件中仍是同一个字符串。

## StegCloak 的封装
<!-- sources: steg, impl -->

StegCloak 先压缩秘密，可以再加密并选择 HMAC。随后用零宽字符表示，并藏在含空格的掩护文本中。解码按载荷的格式标志处理；加密关闭时 HMAC 也关闭。

:::example 兼容测试样例
[输入]
掩护文本 cover text；秘密 Secret 中文😀；口令 password；启用加密和 HMAC
[结果]
原实现与工具箱双向提取均得到 Secret 中文😀
[说明]
密文识读用完整原串。启用 HMAC 时错误口令会被拒绝。
:::

## 郭飞水印的字节
<!-- sources: wm, crypt, impl -->

种子逐字节按 seed=31×seed+byte 模 2³² 更新；伪随机状态按 (1664525×state+1013904223) mod 2³¹ 推进。状态低八位与秘密 UTF-8 字节异或，再按高位至低位输出 U+2060（0）和 U+FEFF（1）。

:::example 一个可手算的字节
[输入]
空口令；秘密 A（0x41）
[结果]
掩码 0x5F；存入 0x1E，即 00011110
[说明]
0x41 XOR 0x5F=0x1E。
:::

## 位置、提取与移除
<!-- sources: wm, impl, unicode -->

水印提取读取第一个连续的水印字符段，位数须构成完整字节。移除会去掉所有选作水印符号的码点。插入位置按 Unicode 码点计数。

:::example 检查补充平面码点的位置
[输入]
掩护文本 甲😀乙，插入位置索引 1
[结果]
水印在甲与 😀 之间；移除得到 甲😀乙
[说明]
😀 是一个码点。
:::

## 复制与损坏
<!-- sources: unicode, steg, wm -->

文本编辑器或发送平台可能过滤格式控制符。需要核验时保存原串并观察精确码点。没有认证标签的郭飞格式，能被 UTF-8 解码并不能证明口令正确或内容未改。

## 常见误区

- 两个方案的口令、字符集和负载结构不能互换。
- 删除水印符号也可能删除掩护文本原有的同码点。
- 看见完全相同的文字无法判断零宽序列是否保留。

