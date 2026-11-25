---
capabilityId: op:Normalise%20Image
title: 图片归一化
topicGroup: image
summary: 依据各 RGB 通道实际出现的最小值和最大值，将样本拉伸到完整灰阶范围。
aliases:
  - Normalise Image
  - 归一化
  - 线性对比度拉伸
sources:
  - id: png
    title: PNG Specification 第三版
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: Truecolor sample values
  - id: pillow
    title: Pillow ImageOps 参考
    publisher: Pillow
    url: https://pillow.readthedocs.io/en/stable/reference/ImageOps.html#PIL.ImageOps.autocontrast
    language: en
    kind: official-doc
    locator: autocontrast 默认把端点映射到 0 和 255
  - id: engine
    title: CyberChef 11.5.0 图像模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Normalise Image；Jimp histogram、getBounds 和 normalizeValue
---

## 介绍
<!-- sources: png, pillow -->
一张图片可能只用到显示范围中的一小段，例如暗底上的数字仅在灰度 20 至 140 之间变化。线性归一化展开这段范围，让原本较小的差异变得更容易辨认。

## 按通道拉伸
<!-- sources: pillow, engine -->
设某通道的最小值为 m、最大值为 M，且 M 大于 m。原样本 x 对应 (x−m)×255/(M−m)，写入整数样本时截去小数。分别对 R、G、B 计算端点时，颜色比例也会随各通道的伸展幅度而变化。

## 恒定通道和极端像素
<!-- sources: engine -->
整条通道只有一个值时，区间宽度为零，本操作写回 0。若恰有一个极亮或极暗像素，那一个像素也可决定区间端点。扫描所读取的 RGB 包括透明像素的样本，因此仅看合成预览未必能推断计算范围。

## 端点实例
<!-- sources: engine -->
以下对照覆盖已占满区间、没有区间宽度，以及三个颜色通道取不同端点的情况。

:::example 已占满灰阶
[输入]
一行灰度 0、50、100、150、200、255
[结果]
0、50、100、150、200、255
[说明]
每个通道已经以 0 与 255 为端点，比例为 1。
:::

:::example 单色块
[输入]
整幅图片均为 RGB(35,120,220)，Alpha 为 255
[结果]
整幅图片变为 RGB(0,0,0)，Alpha 为 255
[说明]
每个通道的最大值等于最小值，输出三项都为 0。
:::

:::example 三个通道的伸展比例
[输入]
某样本为 (129,42,10)，三个通道的范围分别为 2～242、42～180、1～240
[结果]
(134,0,9)
[说明]
红色为 127×255/240 截成 134，绿色位于下端，蓝色为 9×255/239 截成 9。
:::

## 对比度与可辨细节
<!-- sources: pillow, engine -->
归一化强化图中已有差异。若两个像素在输入中已经同值，例如曝光导致一片高光都变成 255，拉伸仍会为它们给出同一值。它也可能一并放大噪声或因各通道独立拉伸而改变色相。

## 常见误区
- 线性拉伸以端点确定斜率，直方图均衡还依赖各样本出现的次数。
- 全图色调增强不等于恢复已合并的像素层次。
- 各颜色通道的拉伸比例可能不同，彩色图可出现偏色。
