---
capabilityId: native:image-planes
title: 位平面与图层浏览
topicGroup: image-stego
summary: 将八位颜色样本拆成独立二值平面，查看空间分布及黑白显示差异。
aliases:
  - 位平面
  - bit plane
  - AperiSolve
  - StegOnline
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
  - id: pixels
    title: media.js
    publisher: 迷雾工具箱
    url: /media.js
    language: zh-CN
    kind: implementation
    locator: transformPixels、extractLSB
  - id: steg
    title: image-projects.js
    publisher: 迷雾工具箱
    url: /image-projects.js
    language: zh-CN
    kind: implementation
    locator: stegPlane、stegExtract、stegEmbed
  - id: aperi
    title: vendor/aperisolve/visual.js
    publisher: 迷雾工具箱
    url: /vendor/aperisolve/visual.js
    language: zh-CN
    kind: implementation
    locator: 颜色分量与二值渲染
---

## 介绍
<!-- sources: png, pixels -->

八位样本 q 可以写成八个二进制系数的加权和。位平面固定某个通道和位号，将该位在所有像素中的值画成二值图。

## 拆分和重组
<!-- sources: pixels, png -->

从最低位 k=0 开始，其权重为 2ᵏ。各平面只是 0 与 1；把同坐标八个系数按权重相加才还原样本。

:::example 拆分一个亮度值
[输入]
样本 129=0b10000001
[结果]
第 7 与第 0 位为 1，128+1=129
[说明]
其余六平面该点均为 0。
:::

## 黑白显示的约定
<!-- sources: steg, pixels, aperi -->

一些位图视图将 1 画成白色，StegOnline 对照视图采用相反显示。观察图层必须注明使用的视图和位号。

:::example 在两种视图下读低位
[输入]
透明像素 RGBA=(129,64,33,0)，查看红色第 0 位
[结果]
通用平面为白，StegOnline 平面为黑
[说明]
底层比特均为 1。
:::

## 把通道和透明度分开
<!-- sources: canvas, pixels -->

RGBA 的第 4 个分量是透明度，也可以被拆成平面。颜色分量需要读指定通路，处理透明像素时要区分原始解码与背景合成。

:::example 同像素的两条平面
[输入]
RGBA=(129,64,33,0)，第 0 位
[结果]
RGB 合成平面为 (255,0,255)，Alpha 位为 0
[说明]
奇数的第 0 位均为 1，偶数均为 0。
:::

## 从分布到线索
<!-- sources: png, steg -->

图层中的形状可能来自量化抖动、编码过程或人为写入。用相邻平面和原图核对重复规律；若要提取数据，还需决定遍历、通道顺序和字节内位序。

## 常见误区

- 位 0 指最低有效位，图层列表的显示顺序可能反过来。
- 黑白的约定不同不意味着数据不同。
- 看见结构后还得核对它是否构成可重复验证的载荷。

