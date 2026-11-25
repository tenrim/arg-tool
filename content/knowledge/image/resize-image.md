---
capabilityId: op:Resize%20Image
title: 调整图片尺寸
topicGroup: image
summary: 缩放为目标宽高重新采样。宽高比例和插值规则会影响形状、边缘及像素值。
aliases:
  - Resize Image
  - 图片缩放
  - 图像重采样
  - 最近邻
  - 双线性插值
sources:
  - id: pillow
    title: Pillow — Image module
    publisher: Pillow 项目
    url: https://pillow.readthedocs.io/en/stable/reference/Image.html#PIL.Image.Image.resize
    language: en
    kind: official-doc
    locator: 尺寸、近邻/双线性等重采样
  - id: engine
    title: CyberChef 图像模块（固定实现）
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Resize Image，像素与百分比单位、比例约束和不同插值
---

## 介绍
<!-- sources: pillow, engine -->
图片缩放把已知像素网格映射到新的宽高。目标比原图大时，一个原样本可影响多个新像素。目标比原图小时，多个输入位置可能合成或舍去。处理后的像素值由重采样规则决定。

## 由宽高或百分比确定结果
<!-- sources: pillow, engine -->
百分比可以分别与原有的宽高相乘。将一边设成 200% 表示该方向的像素数扩大为原来的两倍。若维持宽高比，两个方向使用一致的缩放系数，结果可能达不到给定矩形的某一边。

:::example 同时将两边变为两倍
[输入]
原图 4×2，横向与纵向皆为 200%。
[结果]
8×4。
[说明]
原宽为 4、原高为 2，分别乘以 2，得到 8 和 4。宽高比保持为 2:1。
:::

## 保持比例与独立缩放
<!-- sources: pillow, engine -->
一个横向较宽的矩形要放进正方形时，维持比例会让一边留下空间。也可以明确分别指定两边的像素数，使画面拉伸到完整矩形。两个结果对原像素的位置映射不同。

:::example 比较同一个尺寸目标
[输入]
4×2 图，以 4×4 为目标。
[结果]
保持比例时输出 4×2；关闭比例约束时输出 4×4。
[说明]
第一种保持 2:1 的比例。第二种横向像素数不变，纵向放大一倍。
:::

## 最近邻与双线性采样
<!-- sources: pillow, engine -->
最近邻为输出位置选择一个输入样本，因此适合保留有限颜色和清晰像素边。双线性依据周围样本和位置，对分量做插值，可以得到原图中没有的中间颜色。

:::example 黑白相邻像素放大
[输入]
一行两个像素，先黑后白。横向放到 4 个像素，高仍为 1。
[结果]
最近邻的灰度值为 0、0、255、255。所用双线性算法输出 0、128、255、255。
[说明]
在黑白之间取加权样本产生中灰 128。不同采样坐标公式可以改变插值位置。
:::

## 细节、色值与再处理
<!-- sources: pillow, engine -->
放大只能根据现有样本估计中间值。若素材中的像素边缘、二维码模块或颜色低位参与分析，应在缩放前留存原图。用于外观展示时可比较几种算法生成的清晰度与边缘过渡。

## 常见误区
- 100% 保持像素数，200% 表示该方向乘以 2。
- 指定目标的两个边长后，保持比例可能限制其中一边的实际长度。
- 新增像素来自插值或复制，不能当成已经恢复的原始细节。
