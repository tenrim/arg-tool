---
capabilityId: op:Image%20Hue%2FSaturation%2FLightness
title: 图片色相、饱和度与明度
topicGroup: image
summary: 以 HSL 的角度与比例分开描述颜色种类、鲜艳度和明暗，并演示 RGB 输出。
aliases:
  - Image Hue/Saturation/Lightness
  - HSL 颜色模型
  - 旋转色相
sources:
  - id: hsl
    title: CSS Color Module Level 4
    publisher: W3C
    url: https://www.w3.org/TR/css-color-4/#the-hsl-notation
    language: en
    kind: standard
    locator: 第 7 节，HSL 的定义和 RGB 转换
  - id: jimp
    title: Jimp 图像处理接口
    publisher: Jimp
    url: https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#color
    language: en
    kind: official-doc
    locator: color 色彩动作
  - id: engine
    title: CyberChef 11.5.0 图像模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Image Hue/Saturation/Lightness；TinyColor 数值处理及 Jimp 色彩动作校验
---

## 介绍
<!-- sources: hsl -->
HSL 用三个量描述颜色。H 是色轮角度，S 描述离无彩灰的程度，L 描述模型中的明暗位置。RGB 的三个样本改成 HSL 表示后，可以沿某一方向调整颜色，再换成 RGB 保存。

## 色轮与角度
<!-- sources: hsl, engine -->
色相每转动 360° 回到原角度。0° 是红，120° 是绿，240° 是蓝。没有色度的灰色在数学上不依赖色相，仅旋转角度通常不会改变灰像素的可见颜色。

## 饱和度和明度的边界
<!-- sources: hsl, engine -->
提高饱和度可把像素推向更鲜艳的颜色，提高明度可使结果靠近白。当前运算按色相、饱和度、明度顺序处理。负角度可反向旋转；负的饱和度或明度在当前动作校验中会被拒绝，不能据此声称这些值已生成减淡或变暗的图片。

## 样本转换
<!-- sources: hsl, engine -->
用饱和原色观察色轮，用无彩样本观察明度，再以一个 RGB 三值皆不同的颜色核对饱和度。

:::example 原色色轮旋转
[输入]
纯红、纯绿、纯蓝，色相加 120°，其余不动
[结果]
纯绿、纯蓝、纯红
[说明]
0°→120°，120°→240°，240°→360°，最后一个折回 0°。
:::

:::example 黑、白、红提亮
[输入]
黑、白、纯红，明度加 25，其余不动
[结果]
(64,64,64)、(255,255,255)、(255,128,128)
[说明]
黑的明度到 25%，白已到上限，红的 HSL 明度由 50% 到 75%。
:::

:::example 增加饱和度
[输入]
RGB(129,42,10)，饱和度加 25，其余不动
[结果]
RGB(139,37,0)
[说明]
原像素的 HSL 饱和度已经较高，增加后触及上限，蓝分量落到 0。
:::

## 明度数值与可见对比
<!-- sources: hsl, jimp -->
HSL 明度不是人眼感知亮度的量表。例如纯蓝和纯黄的 HSL 明度均可为 50%，看起来却有明显差别。用色相或饱和度观察图案时，仍需结合原图的亮暗和通道样本判断。

## 常见误区
- 色相是循环角度，360° 和 0° 指向同一颜色方向。
- 提高饱和度并不等于提高明度。
- HSL 明度相同的颜色，在视觉上可以一明一暗。
