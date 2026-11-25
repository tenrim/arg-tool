---
capabilityId: op:Contain%20Image
title: 缩放图片以完整容纳
topicGroup: image
summary: 完整容纳以等比缩放将全部图像放入目标画布，剩余空间按对齐和背景规则填充。
aliases:
  - Contain Image
  - 完整容纳
  - 等比留边
  - 画布适配
sources:
  - id: fit
    title: CSS Images Module Level 3
    publisher: W3C
    url: https://www.w3.org/TR/css-images-3/#the-object-fit
    language: en
    kind: standard
    locator: 第 4.3、4.5、4.6 节，cover / contain 约束以及定位对齐
  - id: engine
    title: CyberChef 图像模块（固定实现）
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Contain Image，等比缩放、对齐及透明/不透明背景
---

## 介绍
<!-- sources: fit, engine -->
完整容纳把整张图片放进目标矩形，原图边缘也保留在画布内。比例不同时，画布的一个方向会留下空白。输出通常仍按目标宽高组织文件，并用背景或透明度表示剩余位置。

## 以较窄的比例为限
<!-- sources: fit, engine -->
目标宽除以原宽，目标高除以原高，较小者限制可用的统一缩放比例。使用该比例后，两个方向的实际图像尺寸都不会超出目标。这样可同时保持原比例和完整范围。

:::example 横图片贴在方形画布顶部
[输入]
4×2 原图，放入 4×4 的画布，顶部对齐，剩余区域透明。
[结果]
图像仍为 4×2，占上面两行。画布下方两行透明。
[说明]
宽度比例为 1，高度比例为 2，统一使用 1。因此剩余高度为 2。
:::

## 对齐和背景
<!-- sources: fit, engine -->
对齐控制把图像放在空余空间的哪一部分。居中时，剩余宽或高分配到两侧。背景决定这些新增位置看起来是某种颜色、还是可以透出底色的透明区域。

:::example 居中并用黑色不透明背景
[输入]
4×2 原图放入 4×4 画布，水平和垂直居中，同时使用不透明背景。
[结果]
中间两行为原图，上下各有一行不透明黑色。
[说明]
垂直余量为 2 像素，居中后平分。左右没有额外空间。
:::

## 竖图放入方形
<!-- sources: fit, engine -->
竖幅素材高度较大，方图约束往往由高度方向决定。缩完后，剩余间隔在水平两侧。图像贴右时，水平方向的留空都位于左侧。

:::example 竖幅图右对齐
[输入]
2×4 竖图放入 4×4，水平贴右，剩余区域透明。
[结果]
左侧两列透明，右侧两列保留图像。
[说明]
高度比例是 1，宽度比例是 2。选 1 后，留下 2 列空间。
:::

## 尺寸与背景的验证
<!-- sources: fit, engine -->
画布宽高与实际内容占据的矩形应分别记录。若目标格式不支持背景 Alpha，透明边缘可能在保存或显示时变为颜色。用像素读数复核，可以确认空白位置和真实透明度。

## 常见误区
- 画布的宽高与图像在其中实际占的宽高可以不同。
- 背景透明和看起来像黑色的背景可能来自不同的 RGBA 值。
- 保持比例时，余量通常只发生在长宽比差异较大的方向。
