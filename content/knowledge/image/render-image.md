---
capabilityId: op:Render%20Image
title: 显示图片
topicGroup: image
summary: 显示图片先按输入形式还原原始字节，再通过图片格式的解码器取得可视图像。
aliases:
  - Render Image
  - 显示二进制图片
  - Base64 图片
  - 十六进制图片
sources:
  - id: encoding
    title: RFC 4648 — Base-N Data Encodings
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4648.html
    language: en
    kind: standard
    locator: 第 4、8 节，Base64 和 Base16 与原始字节
  - id: png
    title: Portable Network Graphics (PNG) Specification (Third Edition)
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 第 4、5、6 节，像素样本、数据流与颜色类型
  - id: engine
    title: CyberChef 图像模块（固定实现）
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Render Image，原始数据、Base64 与 Hex 入参及格式探测
---

## 介绍
<!-- sources: encoding, png, engine -->
同一份图像文件可以直接保存为二进制，也可以用 Base64 或十六进制写成文字。显示时先按正确的表示方式得到文件字节，再识别图像格式与解码。这样可以检查从其他材料提取并还原的图像。

## Base64 表示
<!-- sources: encoding, png, engine -->
Base64 把二进制字节写成可传递的文本。还原时需要整个文字内容并保有正确字母表及边界。解出的图像尺寸来自文件的头部与格式结构，和 Base64 文本自身的行宽没有关系。

:::example 从 Base64 还原小图
[输入]
iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGklEQVR4nGNo1OL6z9Rg1MDwKYXxP/uWDwwAOnAG6izFO4IAAAAASUVORK5CYII=
[结果]
一个 2×2 PNG，可以显示三个可见像素和一个完全透明的像素。
[说明]
Base64 还原为 83 个文件字节，PNG 的 IHDR 给出宽 2、高 2。
:::

## 十六进制与原始字节
<!-- sources: encoding, png, engine -->
十六进制每两个数字写一个字节。还原后和读取同一文件的原始字节是同一个过程。格式识别应由还原后的字节完成，不宜仅凭文本的字符外观判断某一种图片。

:::example 从十六进制得到同一图像
[输入]
89504e470d0a1a0a0000000d494844520000000200000002080600000072b60d240000001a49444154789c6368d4e2facfd460d4c0f02985f13ffb960f0c003a7006ea2cc53b820000000049454e44ae426082
[结果]
与 Base64 示例表示相同的 PNG，解码尺寸同为 2×2。
[说明]
前八字节是 PNG 签名，后续文件字节均按十六进制两位一组还原。
:::

## 格式判断与可解码性
<!-- sources: png, engine -->
候选签名只能说明若干首字节符合约定。实际显示要求读到对应格式的头部、图像块和有效压缩数据。数据过短、文本中有无效字符或解码器不支持目标格式时，均可能无法显示。

:::example 非图像十六进制输入
[输入]
XYZ，按十六进制图像数据解释。
[结果]
未得到可显示的图片，返回无法识别文件类型。
[说明]
字母 X、Y、Z 不属于十六进制字母表，也没有得到可识别的图像签名。
:::

## 源文件与预览
<!-- sources: png, engine -->
预览会将像素与界面背景合成，并可能根据窗口大小缩放。有透明像素的区域可以透出背景。用于进一步分析的应是还原出的原文件字节，预览截图是另一份栅格内容。

## 常见误区
- Base64 和十六进制是字节的表示方式，不规定图片宽或高。
- 出现 PNG 签名不足以保证余下的内容可完整解码。
- 预览的像素大小与图像文件内部记录的原始尺寸可能不同。
