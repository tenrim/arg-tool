---
capabilityId: op:Image%20Filter
title: 图片滤镜
topicGroup: image
summary: 利用灰度或复古色调变换重新表示像素，说明灰度权重与不同复古算法的差异。
aliases:
  - Image Filter
  - 灰度滤镜
  - Sepia 复古色调
sources:
  - id: w3c
    title: Filter Effects Module Level 1
    publisher: W3C
    url: https://www.w3.org/TR/filter-effects-1/#elementdef-fecolormatrix
    language: en
    kind: standard
    locator: feColorMatrix 的矩阵及饱和度模型
  - id: pillow
    title: Pillow ImageOps 文档
    publisher: Pillow
    url: https://pillow.readthedocs.io/en/stable/reference/ImageOps.html#PIL.ImageOps.grayscale
    language: en
    kind: official-doc
    locator: grayscale 与 colorize 的不同输出
  - id: engine
    title: CyberChef 11.5.0 图像模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Image Filter；Jimp greyscale 与 sepia 写入次序
---

## 介绍
<!-- sources: w3c, pillow, engine -->
灰度滤镜把彩色像素写成等量的 R、G、B，复古色调则让三分量仍可不同。它们都可在单个像素上计算，图像几何位置不受影响。

## 灰度的权重
<!-- sources: w3c, engine -->
把样本按 0.2126R＋0.7152G＋0.0722B 加权，可得到灰度。等强的纯绿比纯红亮，两者又比纯蓝亮。实现将同一计算结果写入三个 8 位颜色分量，小数随写入被截去。

## 复古色调的通道变换
<!-- sources: w3c, engine -->
Sepia 是一类模拟旧式照片色调的变换。色彩矩阵可对三个通道作不同的线性组合；当前滤镜逐通道写回，中间值可能参与下个通道计算，因此与浏览器标准矩阵的结果会有差异。

## 原色、灰阶与复古样本
<!-- sources: engine -->
原色样本用于比较各通道的权重，中灰样本用于辨认新生成的色调。

:::example 同强度的三种原色
[输入]
纯红、纯绿、纯蓝，选择 Greyscale
[结果]
(54,54,54)、(182,182,182)、(18,18,18)
[说明]
分别计算 255×0.2126、255×0.7152、255×0.0722，截去小数。
:::

:::example 中灰的复古色调
[输入]
RGB(100,100,100)，选择 Sepia
[结果]
RGB(135,132,120)
[说明]
三个输出通道有各自的权重，中灰在此例变为略暖的颜色。
:::

:::example 原色转换的实际差别
[输入]
纯红、纯绿、纯蓝，选择 Sepia
[结果]
(100,34,45)、(196,243,183)、(48,59,78)
[说明]
对比三组 RGB 可以看出，Sepia 并非给所有颜色叠加同一层浅棕色。
:::

## 滤镜后的信息
<!-- sources: w3c, pillow -->
单一灰度可能对应多个原色，分量减少后无法反推出唯一的彩色像素。图中的标记若只靠色相区分，转灰后可能变得难辨。因此使用滤镜观察纹理时，也可对照原图的各颜色通道。

## 常见误区
- 灰度样本采用加权组合，纯红、纯绿、纯蓝不会普遍转成相同灰度。
- 同名 Sepia 的实现可有不同的系数、限幅与写回次序。
- 灰度滤镜保留像素位置，其输出仍可储存在 RGB 文件里。
