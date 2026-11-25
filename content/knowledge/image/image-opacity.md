---
capabilityId: op:Image%20Opacity
title: 图片不透明度
topicGroup: image
summary: 将每个像素原有的 Alpha 乘以同一比例，调整整张图的覆盖程度。
aliases:
  - Image Opacity
  - 整体透明度
  - 缩放 Alpha
sources:
  - id: png
    title: PNG Specification 第三版
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: Alpha representation
  - id: blend
    title: Compositing and Blending Level 1
    publisher: W3C
    url: https://www.w3.org/TR/compositing-1/#simplealphacompositing
    language: en
    kind: standard
    locator: 第 5.1 节，Alpha 合成公式
  - id: engine
    title: CyberChef 11.5.0 图像模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Image Opacity 将百分比换算为 Jimp opacity 因子
---

## 介绍
<!-- sources: png, blend -->
不透明度控制前景在合成时遮住背景的程度。8 位 Alpha 中，0 表示完全透明，255 表示完全不透明，中间值表示局部覆盖，常见于抗锯齿边缘和半透明阴影。

## 原有透明度的比例缩放
<!-- sources: png, engine -->
将每个原有 Alpha 乘以同一比例。新值写回 8 位样本，有小数时去掉小数部分。原来为 0 的样本仍为 0，原来只有一半覆盖的像素会在原有基础上进一步变淡。

## 与背景合成
<!-- sources: blend -->
在同一个通道空间里，前景放在完全不透明的背景上时，颜色为 α×前景颜色＋(1−α)×背景颜色。以同一张半透明图分别覆盖黑底和白底，显示的颜色便会不同。

## 透明与半透明样本
<!-- sources: engine, blend -->
以下三组都使用同一行像素，便于分清原透明度和施加于整张图的比例。

:::example 不同初始覆盖程度
[输入]
四个像素的 Alpha 依次为 255、128、255、0，比例 50%
[结果]
127、64、127、0
[说明]
255×0.5=127.5，写入 8 位整数后为 127。128×0.5 刚好为 64。
:::

:::example 完全隐去
[输入]
Alpha 为 255、128、255、0，比例 0%
[结果]
0、0、0、0
[说明]
所有像素都变为不可见。透明区仍可保有像素坐标与颜色样本。
:::

:::example 保留原透明度
[输入]
Alpha 为 255、128、255、0，比例 100%
[结果]
255、128、255、0
[说明]
乘以 1 保持现有 Alpha，包括第二个像素的半透明程度。
:::

## 导出后的检查
<!-- sources: png, blend -->
棋盘底常用于显示透明区，本身不属于图片像素。核对结果时可读取 Alpha 或将图片叠在实色背景上。若后续编码不保留 Alpha，透明度可能在转换时被合成进指定背景。

## 常见误区
- 调到 50% 后，只有原本完全不透明的区域接近 50% 覆盖。
- 把前景颜色改深与降低不透明度有不同的合成结果。
- 预览底色改变时，Alpha 样本本身可保持不变。
