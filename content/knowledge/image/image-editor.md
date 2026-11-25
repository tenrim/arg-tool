---
capabilityId: native:image
title: 图片预览与编辑
topicGroup: image
summary: 分别理解文件字节、解码像素、屏幕预览和新导出文件。
aliases:
  - 像素
  - 预览
  - 分辨率
  - 图片编辑
sources:
  - id: canvas
    title: HTML Living Standard — Canvas
    publisher: WHATWG
    url: https://html.spec.whatwg.org/multipage/canvas.html
    language: en
    kind: standard
    locator: Drawing images、Pixel manipulation
  - id: png
    title: Portable Network Graphics (PNG), Third Edition
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 调色板、透明度、块和 IEND
  - id: comp
    title: Compositing and Blending Level 1
    publisher: W3C
    url: https://www.w3.org/TR/compositing-1/
    language: en
    kind: standard
    locator: source-over、difference
  - id: pixels
    title: media.js
    publisher: 迷雾工具箱
    url: /media.js
    language: zh-CN
    kind: implementation
    locator: transformPixels、extractLSB
  - id: impl
    title: image-tools.js
    publisher: 迷雾工具箱
    url: /image-tools.js
    language: zh-CN
    kind: implementation
    locator: 载入、像素通路、转换和导出
---

## 介绍
<!-- sources: canvas, impl -->

数字位图解码后得到一个有宽高的像素阵列。放大查看、修改这份阵列和重新保存文件分别作用在显示、样本和封装三个层次。

## 尺寸与取样
<!-- sources: canvas -->

阵列的宽高表示样本数量。视图放大后可用多个屏幕像素显示同一样本。若实际重采样成新尺寸，插值会产生邻近颜色的组合。

:::example 区分放大与重采样
[输入]
4×2 图片显示放大 2 倍
[结果]
显示 8×4；原阵列仍有 8 个像素
[说明]
只有将输出栅格也设为 8×4 才会保存 32 个样本。
:::

## 通道运算
<!-- sources: pixels, canvas -->

RGB 反相将每个通道 q 映成 255−q；本例的灰度视图取 0.2126R+0.7152G+0.0722B 后四舍五入。两种变换在这条像素通路中保留 Alpha。

:::example 反相颜色
[输入]
RGBA (200,100,50,128)
[结果]
(55,155,205,128)
[说明]
三个变换相互独立。
:::

:::example 灰度呈现
[输入]
RGBA (200,100,50,128)
[结果]
(118,118,118,128)
[说明]
加权结果 117.65，取整为 118。
:::

## 显示 Alpha
<!-- sources: pixels, comp -->

通常用透明分量控制与背景的混合；Alpha 分离视图则把透明分量绘成不透明的灰度。后者可显示肉眼难以从背景上判断的差异。

:::example 将透明分量变成灰度
[输入]
RGBA (200,100,50,128)；观察 Alpha
[结果]
(128,128,128,255)
[说明]
灰度表示原 Alpha，输出自身采用全不透明。
:::

## 导出与证据
<!-- sources: canvas, png, impl -->

导出把像素按输出格式重新编码。PNG 的元数据和 IEND 后的尾随数据来自文件结构，不会因为显示相同而随画布输出自动保留。做图像线索时可保留原件，并单独记录编辑操作。

## 常见误区

- 屏幕插值不会增加原始图像的信息。
- 亮度反相本身不会反转透明度。
- 保存一张肉眼相同的图不能证明容器字节、元数据或尾随数据相同。

