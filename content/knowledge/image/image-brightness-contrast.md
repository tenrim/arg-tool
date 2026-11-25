---
capabilityId: op:Image%20Brightness%20%2F%20Contrast
title: 图片亮度与对比度
topicGroup: image
summary: 用分量缩放与以 127 为中心的映射调整图像色调，区分亮度增益、对比度与限幅。
aliases:
  - Image Brightness / Contrast
  - 亮度增益
  - 对比度枢轴
sources:
  - id: w3c
    title: Filter Effects Module Level 1
    publisher: W3C
    url: https://www.w3.org/TR/filter-effects-1/#funcdef-filter-contrast
    language: en
    kind: standard
    locator: brightness() 和 contrast() 的概念
  - id: pillow
    title: Pillow ImageEnhance 文档
    publisher: Pillow
    url: https://pillow.readthedocs.io/en/stable/reference/ImageEnhance.html#PIL.ImageEnhance.Contrast
    language: en
    kind: official-doc
    locator: Brightness 与 Contrast 的不同作用
  - id: engine
    title: CyberChef 11.5.0 图像模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Image Brightness / Contrast；Jimp brightness 及 contrast 函数
---

## 介绍
<!-- sources: w3c, pillow -->
亮度调整改变样本的总体强度。对比度调整改变不同亮度之间的间距。在一张有灰字的图片上，改变前者主要让画面整体变暗或变亮，改变后者可使文字和底色分得更开，或向中灰靠拢。

## 亮度与缩放
<!-- sources: w3c, engine -->
可以给每个 RGB 样本乘以同一增益，再限制到 0 至 255。增益为 1 时保留原值。当前处理中的中性亮度值 0 会跳过这一步，其他数值除以 100 后作为乘数。因此 50 实际将样本乘 0.5，负数乘积则会落在下限。

## 围绕中灰调整间距
<!-- sources: w3c, engine -->
用 x 表示亮度步骤后的样本、c 表示对比度输入除以 100。对 −1 至 1 之间、且 c 小于 1 的值，处理结果为 127＋(x−127)×(1＋c)/(1−c)，向下取整并限制到 0～255。系数小于 1 时样本靠近 127，系数大于 1 时远离 127。

## 灰阶条对照
<!-- sources: engine -->
使用同一条灰阶带分别改变亮度和对比度，可从各结果判断范围的变化。

:::example 亮度输入 50
[输入]
灰度 0、50、100、150、200、255，亮度 50，对比度 0
[结果]
0、25、50、75、100、127
[说明]
每个样本乘 0.5，255 得到 127.5 后截成 127。
:::

:::example 增大对比度
[输入]
同一灰阶条，亮度 0，对比度 50
[结果]
0、0、46、196、255、255
[说明]
(1＋0.5)/(1−0.5)=3。100 映为 127＋3×(100−127)=46。
:::

:::example 压缩对比度
[输入]
同一灰阶条，亮度 0，对比度 −50
[结果]
84、101、118、134、151、169
[说明]
斜率为 1/3。范围由 0～255 收缩到 84～169。
:::

## 处理顺序和剪切
<!-- sources: engine, pillow -->
依次进行亮度和对比度调整时，后者收到的是已写回的 RGB。先变暗再提高对比度，可能把本来不同的暗部一起剪切为 0。靠近上下限的字迹可回到原图，采用幅度较小的处理对照。

## 常见误区
- 当前处理的亮度 50 是半倍增益，数字为正并不保证画面变亮。
- 对比度升高会拉开中间值，也可能把端点压成纯黑或纯白。
- 两步之间包含整数化和限幅，调换先后可能得到不同样本。
