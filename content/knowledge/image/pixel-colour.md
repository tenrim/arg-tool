---
capabilityId: native:image-color
title: 像素取色与色值
topicGroup: image
summary: 在原图或处理视图的坐标读取 RGBA，了解多种颜色模型的关系。
aliases:
  - 取色
  - RGBA
  - 色值
  - 颜色坐标
sources:
  - id: css
    title: CSS Color Module Level 4
    publisher: W3C
    url: https://www.w3.org/TR/css-color-4/
    language: en
    kind: standard
    locator: sRGB、十六进制、RGB 与 HSL
  - id: canvas
    title: HTML Living Standard — Canvas
    publisher: WHATWG
    url: https://html.spec.whatwg.org/multipage/canvas.html
    language: en
    kind: standard
    locator: Drawing images、Pixel manipulation
  - id: impl
    title: round2/image-engine.js
    publisher: 迷雾工具箱
    url: /round2/image-engine.js
    language: zh-CN
    kind: implementation
    locator: compareImages、colorValues
  - id: chroma
    title: chroma.js
    publisher: Gregor Aisch 等
    url: https://gka.github.io/chroma.js/
    language: en
    kind: official-doc
    locator: hex、HSL、HSV、Lab、CMYK
  - id: comp
    title: Compositing and Blending Level 1
    publisher: W3C
    url: https://www.w3.org/TR/compositing-1/
    language: en
    kind: standard
    locator: source-over、difference
---

## 介绍
<!-- sources: canvas, impl -->

像素取色报告指定坐标的样本值。可以针对解码原图、当前处理视图或比较结果取样。读数也可表示为 HEX、HSL、HSV、Lab 或简化 CMYK。

## 从显示定位到样本
<!-- sources: canvas -->

像素坐标从零开始。指针先由图像显示矩形换算到实际阵列，再对 x、y 取整。屏幕视图采用插值时，屏幕过渡色不一定存在于源样本。

:::example 放大时的样本位置
[输入]
四像素宽的图片显示为 8 像素宽；指针距左边 5 像素
[结果]
样本列 x=2
[说明]
5×4/8=2.5，向下取整。
:::

## Alpha 与颜色分量
<!-- sources: impl, comp, css -->

通道字节分别为 R、G、B 和 Alpha。报告将最后一项除以 255 并取三位小数。屏幕与背景合成后，颜色还依赖背景。

:::example 读取半透明色
[输入]
RGBA=(51,102,153,128)
[结果]
HEX #336699；Alpha 0.502
[说明]
颜色字节分别为 33、66、99；HEX 这一栏仅显示 RGB。
:::

## HSL、HSV 与灰阶
<!-- sources: css, chroma, impl -->

HSL 的明度取最大和最小归一化通道的均值，HSV 的 V 取最大值。灰阶的三个通道相同，饱和度为零，色相没有定义。

:::example 中性灰
[输入]
RGB=(128,128,128)
[结果]
HSL 明度约 0.50，HSV V 约 0.50，色相无定义
[说明]
没有可用于确定色相的通道差。
:::

## Lab 与 CMYK 的读法
<!-- sources: chroma, css, impl -->

Lab 的三个分量有明度和两条对立色轴。程序提供的 CMYK 是转换模型的数值；印刷验收还要知道墨水、纸张及色彩配置文件。

:::example 红色对照
[输入]
RGB=(255,0,0)
[结果]
HSV=(0,1,1)，简化 CMYK=(0,1,1,0)
[说明]
HSV 的最大分量与通道跨度均为 1。
:::

## 常见误区

- 肉眼看到的颜色与透明图层的原样本可以不同。
- RGB 与 HSL 的数字量纲不通用。
- CMYK 四项数字本身不能预测任意印刷设备。

