---
capabilityId: op:Extract%20RGBA
title: 提取 RGBA 像素
topicGroup: image-stego
summary: RGBA 提取将解码后的图像样本按像素顺序列为红、绿、蓝和 Alpha 数值。
aliases:
  - Extract RGBA
  - RGBA
  - 像素样本
  - 像素转数值
sources:
  - id: png
    title: Portable Network Graphics (PNG) Specification (Third Edition)
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 第 4、6、13 节，样本位深、扫描线、Alpha
  - id: canvas
    title: HTML Living Standard — The canvas element
    publisher: WHATWG
    url: https://html.spec.whatwg.org/multipage/canvas.html#pixel-manipulation
    language: en
    kind: standard
    locator: ImageData、通道值、像素位置与颜色空间
  - id: engine
    title: CyberChef 图像模块（固定实现）
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Extract RGBA，按行遍历、分量顺序和分隔方式
---

## 介绍
<!-- sources: png, canvas -->
RGBA 数值表示把图像中的每个像素拆为红、绿、蓝和不透明度。对通常的 8 位像素，每个分量范围为 0 至 255。提取可用来读取具体颜色、复算像素偏移，或检查完全透明处是否仍存有颜色样本。

## R、G、B、A 各自的含义
<!-- sources: png, canvas, engine -->
RGB 记录三种颜色强度，A 记录不透明度，0 对应完全透明，255 对应完全不透明。一个四元组中的最后一项不会直接表明某个 RGB 分量的强弱。全透明图像位置仍可能在文件里存下实际的颜色样本。

:::example 列出三个不同的不透明度
[输入]
三个像素均为红色，RGB 都是 255、0、0，Alpha 依次为 255、128、0。
[结果]
255 0 0 255  255 0 0 128  255 0 0 0
[说明]
前两项的颜色数值一致而透明度不同，最后一项虽然不可见，原始红色样本仍为 255。
:::

## 像素坐标与扁平序列
<!-- sources: canvas, engine -->
按行读取时，先从左到右处理第一行，再逐行向下。若横纵坐标为从零开始的 x 与 y，宽度为 W，像素序号为 y × W + x。四通道平铺序列中，该像素的首分量位置等于像素序号乘以 4。

:::example 找到第二行第一个像素
[输入]
宽 2、高 2 的图，逐行像素依次为 (129,42,10,255)、(2,128,50,128)、(242,100,1,255)、(7,180,240,0)。
[结果]
第二行第一个像素的 R 在序列偏移 8，R、G、B、A 分别是 242、100、1、255。
[说明]
坐标 (0,1) 的像素序号为 2。前两个像素共四项乘以二，得到 8。
:::

## 分隔符与每组长度
<!-- sources: engine, canvas -->
数值可用逗号、空格或换行分隔。省去 Alpha 时，每个像素输出三个分量。图像的宽、组长和逐行顺序共同决定如何还原坐标，不能只按换行符猜测图片转行位置。

:::example 仅列 RGB 的两个像素
[输入]
取上一例第一行的两个像素，不输出 Alpha，以换行分隔各值。
[结果]
129
42
10
2
128
50
[说明]
每三项是一组像素分量。该换行只分隔单个数值，这六行共同属于图像第一行。
:::

## 读数与原文件字节
<!-- sources: png, canvas, engine -->
PNG 等图像会压缩样本，也可能含调色板或不同位深。查看 RGBA 要先解码再得到样本序列。原文件的字节偏移一般无法直接替换成序列中的像素索引。

## 常见误区
- 黑色和透明度 0 是两个不同概念。
- 输出每个数值一行时，行数不等同于图片高度。
- 解码后的通道值与压缩文件原字节处在不同层次。
