---
capabilityId: native:image-steg
title: 图片隐写提取
topicGroup: image-stego
summary: 从像素位、通道遍历和文件结构三方面识别、提取或验证藏入的数据。
aliases:
  - 隐写
  - LSB
  - 最低有效位
  - StegOnline
  - 位平面嵌入
sources:
  - id: png
    title: Portable Network Graphics (PNG), Third Edition
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 调色板、透明度、块和 IEND
  - id: canvas
    title: HTML Living Standard — Canvas
    publisher: WHATWG
    url: https://html.spec.whatwg.org/multipage/canvas.html
    language: en
    kind: standard
    locator: Drawing images、Pixel manipulation
  - id: steg
    title: image-projects.js
    publisher: 迷雾工具箱
    url: /image-projects.js
    language: zh-CN
    kind: implementation
    locator: stegPlane、stegExtract、stegEmbed
  - id: pixels
    title: media.js
    publisher: 迷雾工具箱
    url: /media.js
    language: zh-CN
    kind: implementation
    locator: transformPixels、extractLSB
  - id: embed
    title: StegOnline 数据嵌入服务
    publisher: StegOnline
    url: /vendor/stegonline/embed-data.service.js
    language: en
    kind: implementation
    locator: 逐通道写入与既定遍历顺序
---

## 介绍
<!-- sources: png, canvas, steg -->

图片隐写可把附加信息放进像素位，也可利用容器块或文件末尾。像素提取读取解码样本，文件扫描读取原字节；两种观察分别能回答不同问题。

## 读一个通道位
<!-- sources: pixels, steg -->

八位通道 q 的第 k 位是 (q≫k)&1。低位变动较小，因此常被选作载体。先确定通道及位号，再依像素顺序配组，第一位作为最高位或最低位会给出不同结果。

:::example 读成字节
[输入]
红通道低位依行读到 01000001；首位为最高位
[结果]
0x41，即 ASCII A
[说明]
权重 64 与 1 相加。
:::

## 行列扫描和容量
<!-- sources: steg, pixels -->

逐行先遍历同一行，逐列先遍历同一列。每像素选择 n 个可写位时，W×H 的图最多容纳 ⌊WHn/8⌋ 个完整字节；起始字节会进一步减少可读长度。

:::example 同图换遍历
[输入]
2×4 图的行优先低位为 01000001
[结果]
列优先 00001001，即 0x09
[说明]
按左列四项、右列四项重新串接。
:::

## 嵌入与一致性
<!-- sources: embed, steg -->

写某一位时先用掩码清零，再将载荷位移到位置 k 并按位或。数据嵌入的 RGB 通路有容量校验，不能把 Alpha 当成该通路的可写位置。提取要复用相同遍历规则。

:::example 写最低位
[输入]
红通道 100，写入最低位 1
[结果]
101；二进制由 01100100 变为 01100101
[说明]
其余七个比特不动。
:::

## 调色板、透明度与文件结尾
<!-- sources: png, canvas -->

索引色 PNG 的 PLTE 来自原文件；tRNS 可增加透明度信息。解码后的 RGBA 是像素样本，不能反推原文件一定使用调色板。IEND 后的尾部信息也须从原文件查找。

:::example 索引色与真彩色
[输入]
两图都只有黑白像素；一张有 PLTE，一张真彩色且无 PLTE
[结果]
两者可显示相同；容器结构不同
[说明]
颜色种类不证明文件采用索引色。
:::

## 核对提取物
<!-- sources: png, steg -->

短可打印串和几个魔数字节可能偶然出现。识别候选后，以长度、结构和能否独立打开验证。要保留隐写证据时，从原件开始，避免让重编码先改变最低位。

## 常见误区

- 黑白轮廓只显示一个样本层，不能证明已经抽出文件。
- 透明区域的颜色取决于解码和画布通路，应按所用数据源实测。
- 字节序、通道次序和空间遍历是三套约定。
- 扫描尾随字节与提取 RGBA 数据针对的是不同数据。

