---
capabilityId: op:Add%20Text%20To%20Image
title: 添加图片文字
topicGroup: image
summary: 图片文字由字体决定字形和边界，再按坐标、对齐规则和不透明度合成到像素中。
aliases:
  - Add Text To Image
  - 图片加字
  - 图像标注
  - 字形合成
sources:
  - id: draw
    title: HTML Living Standard — Drawing text to the bitmap
    publisher: WHATWG
    url: https://html.spec.whatwg.org/multipage/canvas.html#drawing-text-to-the-bitmap
    language: en
    kind: standard
    locator: 坐标、文字绘制及字体测量模型
  - id: comp
    title: Compositing and Blending Level 1
    publisher: W3C
    url: https://www.w3.org/TR/compositing-1/
    language: en
    kind: standard
    locator: 第 5、9.1.4 节，透明度合成
  - id: engine
    title: CyberChef 图像模块（固定实现）
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Add Text To Image，字体、对齐、绘制坐标及 Alpha
---

## 介绍
<!-- sources: draw, comp, engine -->
把文字写进图片需要先以字体绘出字形，再与图像的原有像素合成。操作后的文字会成为图像像素的一部分，适合标注位置、展示短句或制作说明图。单独的字串仍可另行保存，便于后续重做。

## 坐标与可见字形边界
<!-- sources: draw, engine -->
坐标选择文字的摆放起点。字形的实际可见部分还取决于字体留白、上沿和行度量。同一个坐标，较细的字形和占满宽度的字形可有不同的着色边界。

:::example 手工设置字形位置
[输入]
80×45 黑底，白色 I，Roboto 12 像素，手工位置 x=37、y=19。
[结果]
图像尺寸仍为 80×45，白字显示在指定位置附近。
[说明]
实际着色范围在横向 38 至 39、纵向 21 至 30。给定坐标与可见字形边缘之间有字体留白。
:::

## 按绘制区域对齐
<!-- sources: draw, engine -->
水平和垂直对齐可分别确定。对齐的是能够容纳文字的区域及字体度量中的位置，字形最亮的几点不一定精确落在像素中心。文字若靠近边缘，还需要核对是否有一部分落在图外。

:::example 左对齐和居中对齐
[输入]
同一 80×45 黑底，白色 Roboto 12 像素的 I。
先使用左侧、顶部对齐，再使用水平、垂直居中。
[结果]
第一幅的字形在左上方，第二幅移到靠近中部。两幅图的尺寸相同。
[说明]
相同文字及字号使用不同版面起点，改变的是图中位置。
:::

## 不透明度和背景合成
<!-- sources: comp, engine -->
文字颜色和不透明度一起决定合成结果。采用常见的源覆盖方式时，透明度为零的文字不贡献可见颜色。半透明文字会与背景共同形成输出值。即使文字的 RGB 已设成白色，其可见程度仍受 Alpha 控制。

:::example 完全透明的白字
[输入]
80×45 黑底，加入白色 I，文字 Alpha 设为 0。
[结果]
输出的可见像素仍全为黑色。
[说明]
字形采用完全透明状态，未给输出图像增加白色像素。
:::

## 栅格化的核验
<!-- sources: draw, comp, engine -->
导出后可检查尺寸、字符是否完整、背景与文字是否有足够区别。更换字体或尺寸会产生不同像素，即使显示的是同样的内容。图像中读到的文字，如需作为可搜索文本，还应保留原有字串。

## 常见误区
- 起点坐标与可见字形的最外像素之间可有留白。
- 文字 Alpha 为零时，即使颜色与背景反差很大也看不见。
- 保存后的标注属于像素，通常无法直接选择或修改其中的字串。
