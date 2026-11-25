---
capabilityId: op:Crop%20Image
title: 裁剪图片
topicGroup: image
summary: 裁剪选出原图中的矩形区域，输出从该区域左上角重新编号。自动裁剪可依据边缘颜色移除画框。
aliases:
  - Crop Image
  - 图像裁剪
  - 自动裁边
  - 图片裁切
sources:
  - id: pillow
    title: Pillow — Image module
    publisher: Pillow 项目
    url: https://pillow.readthedocs.io/en/stable/reference/Image.html#PIL.Image.Image.crop
    language: en
    kind: official-doc
    locator: 左上、右下和保留矩形
  - id: engine
    title: CyberChef 图像模块（固定实现）
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Crop Image，矩形裁剪及同色边框识别
---

## 介绍
<!-- sources: pillow, engine -->
图像裁剪只保留输入图像的一块范围。常用的矩形裁剪由起点和宽高决定，输出图的原点移动到所选范围的左上。自动裁剪则通常尝试从四周去掉一致的边框。

## 坐标和保留范围
<!-- sources: pillow, engine -->
若左上角是 (x,y)，宽为 w、高为 h，通常保留从 x 至 x+w−1 的列和从 y 至 y+h−1 的行。右侧及下侧的结束位置不计入范围。输出坐标可用原坐标分别减去 x 和 y 得到。

:::example 选取中间两列
[输入]
4×2 图，第一行红绿蓝黄，第二行青品红黑白。
从 (1,0) 裁出 2×2。
[结果]
新图第一行绿蓝，第二行品红黑。
[说明]
选择的是原图第 1、2 列，横坐标从零开始。原来的第 1 列成为新图第 0 列。
:::

## 单个像素和超界
<!-- sources: pillow, engine -->
宽和高描述范围大小。当两者都为 1 时，结果只有起点处的像素。若矩形跨出图像，处理器可能报错、裁到实际边界或填补，这取决于裁剪方式。希望只取现有像素时，应先检查原图宽高。

:::example 读取一个像素的颜色
[输入]
同一 4×2 图，从 (1,1) 裁出 1×1。
[结果]
得到一个品红像素。
[说明]
保留的是第二行、第二列这一位置，其他像素都不在矩形内。
:::

## 自动裁边的依据
<!-- sources: engine -->
自动裁边可以对比外围像素是否和参考边缘颜色相近，再决定从某一侧删多少。容差越宽，越可能将颜色接近的真实画面纳入裁边。四周一致、保留外框和成对对称也会改变最终范围。

:::example 去除一像素纯色边
[输入]
4×4 图，外围一圈为白色，中间 2×2 为红绿 / 蓝黑。
[结果]
自动去掉整圈边框后，输出仅含红绿 / 蓝黑。
[说明]
上下左右各移除一排像素。原先的中央方块成为完整图像。
:::

## 裁剪之后的空间关系
<!-- sources: pillow, engine -->
裁剪后保留下来的像素不用重新插值。原图中的坐标、图案与框外内容仍可通过原文件核对。需要进一步旋转或缩放时，应记录每次使用的坐标所参照的版本。

## 常见误区
- 宽高是保留量，不是图中右下角已有的坐标。
- 裁剪没有把保留区域缩成另一种像素尺寸。
- 自动裁边主要依据边缘颜色，颜色接近的内容可能一起被裁掉。
