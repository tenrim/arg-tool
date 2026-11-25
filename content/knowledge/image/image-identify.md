---
capabilityId: native:forensics-identify
title: 图片详细属性与通道统计
topicGroup: image-stego
summary: 读取格式、尺寸、帧和各通道统计，区分像素结构与描述性元数据。
aliases:
  - identify
  - AperiSolve
  - Aperi’Solve
sources:
  - id: adapter
    title: AperiSolve 分析器源码：identify
    publisher: Zeecka / AperiSolve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/identify.py
    language: en
    kind: implementation
    locator: GraphicsMagick identify -verbose 的原始输出
  - id: gm
    title: GraphicsMagick identify
    publisher: GraphicsMagick
    url: https://www.graphicsmagick.org/identify.html
    language: en
    kind: official-doc
    locator: verbose、尺寸、颜色、帧和统计
  - id: png
    title: Portable Network Graphics (PNG) Specification
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: PNG 签名、颜色类型、位深、IHDR 与 IEND
---

## 介绍
<!-- sources: gm, adapter -->

图像详细属性报告说明读取器如何识别一张图片。典型字段有格式、几何尺寸、颜色空间、深度、帧数和统计。某些字段来自解析后的像素，文件标题、注释则可能来自独立的元数据。

## 尺寸来自图像结构
<!-- sources: png, gm -->

对于 PNG，IHDR 记录宽高、位深和颜色类型。图片同宽高时也可使用不同颜色类型或通道深度。显示器上的缩放尺寸不是文件的原始尺寸。

:::example 按尺寸确认样本
[输入]
纯色 RGB PNG，宽 64 像素、高 32 像素
[结果]
几何尺寸 64×32，共 2048 个像素
[说明]
报告像素尺寸与文件头记录一致。
:::

## 通道最小值、最大值与均值
<!-- sources: gm, adapter -->

通道统计把每个像素在该通道的样本纳入计算。纯色图中同一通道各点都相同，最小值、最大值和均值必重合。显示单位可能采用原值或归一化形式。

:::example 真彩样本的统计关系
[输入]
这张 64×32 图全填 RGB(84,142,60)
[结果]
三个通道的均值分别等于 84、142、60（8 位标度）
[说明]
相同输入的极差和标准差均为 0。
:::

## 位深与颜色空间
<!-- sources: png, gm -->

颜色类型决定通道组合，位深通常描述每个样本的位数。RGB 每个通道为 8 位时，一个不带 Alpha 的未压缩像素通常用三个字节。这个值与整份 PNG 的压缩尺寸不直接对应。

:::example 算原始颜色样本数
[输入]
64×32 像素，8 位 RGB，无透明通道
[结果]
6144 字节的未压缩 RGB 样本
[说明]
2048 个像素乘每像素 3 字节，不包括 PNG 结构和扫描线过滤。
:::

## 如何读缺失或多帧信息
<!-- sources: gm, adapter -->

文档可能没有某些描述字段，未提供时不能自动解释成零。多帧图片的每一帧尺寸和统计可有差异，复核时应同时记录帧位置。颜色统计本身不足以说明是否含隐藏内容。

## 常见误区

- 文件名后缀和解码识别结果可以不同。
- RGB 的 8 位深度通常属于单通道精度。
- 均值相同的两张图片也可能有完全不同的分布与排列。

