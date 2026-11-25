---
capabilityId: op:Sharpen%20Image
title: 图片锐化
topicGroup: image
summary: 从原图与模糊副本的差异生成锐化遮罩，解释亮边增强和噪点放大。
aliases:
  - Sharpen Image
  - 非锐化遮罩
  - 边缘增强
sources:
  - id: w3c
    title: Filter Effects Module Level 1
    publisher: W3C
    url: https://www.w3.org/TR/filter-effects-1/#elementdef-feconvolvematrix
    language: en
    kind: standard
    locator: 基于邻域卷积的图像处理
  - id: pillow
    title: Pillow ImageFilter 文档
    publisher: Pillow
    url: https://pillow.readthedocs.io/en/stable/reference/ImageFilter.html#PIL.ImageFilter.UnsharpMask
    language: en
    kind: official-doc
    locator: UnsharpMask 的半径、增益、阈值
  - id: engine
    title: CyberChef 11.5.0 图像模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Sharpen Image；遮罩的限幅、加权阈值与结果叠加
---

## 介绍
<!-- sources: w3c, pillow -->
锐化增强邻近像素之间的差异，使边沿看起来更清楚。常用的非锐化遮罩先产生模糊副本，再根据原图和副本的差异改变局部样本，名称取自生成遮罩所用的模糊图。

## 由模糊副本得到遮罩
<!-- sources: pillow, engine -->
模糊副本包含较平滑的走势。在当前算法中，每个 RGB 先计算原值减去副本对应样本，负差变成零。提高叠加强度会加大正差带来的亮边，结果达到上限时停止在 255。

## 筛选参与叠加的像素
<!-- sources: engine -->
当前运算分别对遮罩 RGB 和原 RGB 求加权灰度，比较两者灰度差的绝对值，再除以 255 换成百分比例。达到阈值的像素才叠加遮罩。这种筛选与某些软件直接为原图、模糊图的色差设置阈值有所不同。

## 灰度条实测
<!-- sources: engine -->
以下用同一灰度条分别核对增益和阈值，横向样本包含由暗变亮的边缘。

:::example 强度为零
[输入]
一行灰度 20、20、40、140、180、180，半径 1，强度 0，阈值 0
[结果]
20、20、40、140、180、180
[说明]
遮罩乘以 0 后，叠加值为 0。
:::

:::example 保留可叠加的亮边
[输入]
同一灰度条，半径 1，强度 1，阈值 0
[结果]
20、20、40、149、207、203
[说明]
后三个样本加上正差，前三个没有增加。
:::

:::example 高阈值下的同一条纹
[输入]
同一灰度条，半径 1，强度 1，阈值 100
[结果]
20、20、40、140、180、180
[说明]
灰度条中没有通过阈值的像素，原值被保留。
:::

## 边缘、光晕和噪声
<!-- sources: pillow, engine -->
纯色块的原样本等于其模糊副本，没有正差可以叠加。孤立亮点和噪声却也能形成正差，与文字边缘一起被增强。判断细节是否原本存在时，需要对照未经锐化的图。

## 常见误区
- 锐化改变已有样本间的差异，丢失的文字笔画未必能恢复。
- 相同半径和强度可因遮罩及阈值定义不同产生不同图。
- 过强锐化可能同时强调噪声、光晕和原有边缘。
