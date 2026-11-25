---
capabilityId: native:image-compare
title: 图片比较与差值
topicGroup: image
summary: 在相同坐标上比较颜色，用叠加、逐通道差值、XOR 或感知标记呈现变化。
aliases:
  - 差分
  - 像素差值
  - diff
  - Pixelmatch
sources:
  - id: canvas
    title: HTML Living Standard — Canvas
    publisher: WHATWG
    url: https://html.spec.whatwg.org/multipage/canvas.html
    language: en
    kind: standard
    locator: Drawing images、Pixel manipulation
  - id: comp
    title: Compositing and Blending Level 1
    publisher: W3C
    url: https://www.w3.org/TR/compositing-1/
    language: en
    kind: standard
    locator: source-over、difference
  - id: impl
    title: round2/image-engine.js
    publisher: 迷雾工具箱
    url: /round2/image-engine.js
    language: zh-CN
    kind: implementation
    locator: compareImages、colorValues
  - id: pm
    title: pixelmatch
    publisher: Mapbox
    url: https://github.com/mapbox/pixelmatch
    language: en
    kind: author-spec
    locator: 感知阈值、像素尺寸与抗锯齿
---

## 介绍
<!-- sources: canvas, impl -->

双图比较的基本单位是同坐标的一对像素。两张图需要尺寸和位置对应。叠加适合查错位，数值差和感知标记分别体现通道改动与颜色距离。

## 透明度和背景
<!-- sources: comp, impl -->

此比较算法在普通数值模式中把半透明像素先合成到白底，分量为 round(C×A/255+255−A)。两个完全透明但保存了不同 RGB 的像素会合成成相同的白色。

:::example 背景归一化
[输入]
红色 (255,0,0,0) 与蓝色 (0,0,255,0)
[结果]
白底上均为 (255,255,255)
[说明]
如果要研究不可见 RGB，使用原通道读取。
:::

## 绝对差与异或
<!-- sources: impl -->

绝对差分别求 |a−b|。XOR 比较对应比特，位不同才置 1。两者在数据相同的通道都给零，但数值没有相同含义。

:::example 同像素的两种比较
[输入]
A=(200,30,12)，B=(100,50,12)，均不透明
[结果]
绝对差 (100,20,0)；XOR (172,44,0)
[说明]
200 与 100 的十六进制 C8、64 异或为 AC。
:::

## 叠加与变化计数
<!-- sources: impl, comp -->

叠加比例 p 控制 A(1−p)+Bp，两图有边缘偏移时会留下重影。叠加图并不显示每点偏差大小；变化计数逐像素检查其白底合成分量是否相同。

:::example 中点叠加
[输入]
A=(200,30,12)，B=(100,50,12)，p=0.5
[结果]
(150,40,12)；变化像素数为 1
[说明]
第三分量相同，其他分量有变化。
:::

## 阈值与复查
<!-- sources: pm, impl -->

Pixelmatch 将颜色差与阈值比较；压缩噪点、抗锯齿、色彩转换和几何错位均能产生差异。适合先对齐，再用变化位置和原图交叉核验。

## 常见误区

- 亮的 XOR 值不等于肉眼变化更大。
- 同尺寸不保证同一对象对齐。
- 感知差异计数随阈值变化，结果为零不能证明文件逐字节相同。

