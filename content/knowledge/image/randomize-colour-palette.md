---
capabilityId: op:Randomize%20Colour%20Palette
title: 随机重映射调色板
topicGroup: image
summary: 为图像原有 RGB 赋予新的伪随机颜色，保持同色分区的位置。
aliases:
  - Randomize Colour Palette
  - 种子换色
  - 随机伪彩
sources:
  - id: png
    title: PNG Specification 第三版
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: PLTE 色表及 RGB 样本
  - id: md5
    title: "RFC 1321: The MD5 Message-Digest Algorithm"
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc1321
    language: en
    kind: standard
    locator: 第 3 节，输入及摘要输出
  - id: engine
    title: CyberChef 11.5.0 图像模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Randomize Colour Palette 的种子、RGB 键和输出
---

## 介绍
<!-- sources: png, engine -->
随机重映射把每种原有颜色关联到一种新颜色。相邻像素只要原 RGB 相同，就会一起换色。因此，颜色交界跟着原图分区，原来的亮度关系和颜色含义则可能变化。

## 分区与索引
<!-- sources: png, engine -->
索引色 PNG 用像素索引指向文件中的 PLTE 调色板。重映射也可在图像解码后直接处理 RGB；这个做法可用于真彩色图片，也无需在结果文件保留原来的 PLTE 或索引编号。

## 由种子构造颜色
<!-- sources: md5, engine -->
设颜色为 R、G、B。当前算法将种子与十进制形式的 R.G.B 连接，取 MD5 摘要开头六个十六进制字符，作为输出 RGB。追加的 Alpha 为 255。摘要截断后只有 2²⁴ 个结果，不同的 RGB 可能映成同一种颜色。

## 三色图的结果
<!-- sources: engine -->
用同一张含重复色块的小图，可以分别比较种子、文件编码与像素 RGB 对结果的影响。

:::example 红绿蓝分区
[输入]
种子 mist
(R,G,B) 依次为 (255,0,0)、(0,255,0)、(0,0,255)
[结果]
C68629、26644B、0B7968
[说明]
三个摘要分别取六个十六进制字符。重复出现的红色使用同一个 C68629。
:::

:::example 种子作为映射条件
[输入]
红、绿、蓝三种 RGB，种子 mist2
[结果]
AA3BF9、60053C、D9B5E1
[说明]
改变种子会重新决定 RGB。坐标没有参与摘要计算。
:::

:::example 真彩色图
[输入]
真彩色 PNG 从左到右前三个像素为红、绿、蓝，种子 mist
[结果]
前三个像素仍依次变为 C68629、26644B、0B7968
[说明]
源文件是否使用 PLTE 不影响给定 RGB 的映射。
:::

## 伪彩的解读
<!-- sources: png, engine -->
伪彩适合让原本接近的色块更容易看出轮廓。两块在结果中恰好同色，可以对照原图的 RGB 核实。重做同一幅伪彩图时应记录种子；留空时运行过程会生成种子。

## 常见误区
- 种子决定颜色对应关系，像素位置不变。
- 同一源颜色复用同一结果，输出色数仍可能因碰撞下降。
- 变换根据 RGB 归类，并把结果 Alpha 写为 255。
