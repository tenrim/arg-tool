---
capabilityId: op:Invert%20Image
title: 图片反色
topicGroup: image
summary: 对每个 8 位颜色分量做 255 减原值的映射，并保持 Alpha。
aliases:
  - Invert Image
  - 图像负片
  - RGB 反相
sources:
  - id: png
    title: PNG Specification 第三版
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: Truecolor、Alpha representation
  - id: pillow
    title: Pillow ImageOps 参考
    publisher: Pillow
    url: https://pillow.readthedocs.io/en/stable/reference/ImageOps.html#PIL.ImageOps.invert
    language: en
    kind: official-doc
    locator: invert 与负片描述
  - id: engine
    title: CyberChef 11.5.0 图像模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Invert Image 逐一处理 R、G、B
---

## 介绍
<!-- sources: png, pillow -->
数字图像反色将各个颜色分量映射到另一端：原样本越大，变换后的值越小。在 8 位真彩色图像中，每个 R、G、B 的取值都介于 0 与 255。

## 补值运算
<!-- sources: pillow, engine -->
对每个分量 x 计算 255−x，三个分量独立处理。连续应用两次得到 255−(255−x)=x。反色维持像素排列，8 位灰阶中的 127 与 128 刚好互换。

## 透明像素
<!-- sources: png, engine -->
Alpha 与 RGB 分开保存。反色时 RGB 仍按补值替换，原来半透明的像素保持半透明，完全透明的像素也保持透明。预览上看到的颜色取决于该图与预览背景的合成。

## 对照样本
<!-- sources: engine -->
以下颜色用八位样本表示。对于不透明灰阶，三个颜色分量相等，只列出一个灰度。

:::example 三个原色
[输入]
(255,0,0)、(0,255,0)、(0,0,255)
[结果]
(0,255,255)、(255,0,255)、(255,255,0)
[说明]
红、绿、蓝分别变为青、品红、黄。每个通道单独取补值。
:::

:::example 普通彩色像素
[输入]
RGBA(129,42,10,255)
[结果]
RGBA(126,213,245,255)
[说明]
三项减法互不影响，不透明度继续为 255。
:::

:::example 一行灰阶
[输入]
灰度 0、50、100、150、200、255，依次反色两次
[结果]
第一次 255、205、155、105、55、0
第二次 0、50、100、150、200、255
[说明]
无损保存中间结果时，样本值可还原。
:::

## 反色图的阅读
<!-- sources: png, pillow -->
原图上暗的标记可在反色后变亮，明暗边界仍位于原来的位置。相差 5 的两个样本反色后仍相差 5，因此很淡的字迹不会仅靠反色获得数值上的对比度增强。

## 常见误区
- 反色只改变样本值，像素左右和上下位置不变。
- 原图的透明区域反色后仍透明。
- 两次反色能还原样本，重新编码后的文件字节可以不同。
