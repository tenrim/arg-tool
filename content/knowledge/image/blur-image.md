---
capabilityId: op:Blur%20Image
title: 图片模糊
topicGroup: image
summary: 以邻域像素的平均或加权和降低局部变化，说明模糊核与边缘处理。
aliases:
  - Blur Image
  - 快速模糊
  - 高斯模糊
sources:
  - id: w3c
    title: Filter Effects Module Level 1
    publisher: W3C
    url: https://www.w3.org/TR/filter-effects-1/#elementdef-fegaussianblur
    language: en
    kind: standard
    locator: feGaussianBlur 的权重、标准差与边界
  - id: pillow
    title: Pillow ImageFilter 文档
    publisher: Pillow
    url: https://pillow.readthedocs.io/en/stable/reference/ImageFilter.html#PIL.ImageFilter.BoxBlur
    language: en
    kind: official-doc
    locator: BoxBlur 及 GaussianBlur
  - id: engine
    title: CyberChef 11.5.0 图像模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Blur Image；Jimp blur 与 gaussian
---

## 介绍
<!-- sources: w3c, pillow -->
图像模糊把一处像素替换为附近样本的加权组合。突兀的亮点会向周围摊开，边界过渡变得平缓，小纹理的起伏变弱。参与的邻域越大，影响通常会传播得越远。

## 均匀权重与高斯权重
<!-- sources: w3c, pillow -->
方框模糊把邻域样本近似等权平均。高斯模糊的理论权重随距离衰减，离中心近的样本权重大。实际程序可使用不同逼近方法和整数化规则，同样的标称数值不保证产生同样的离散坐标结果。

## 图边与有限样本
<!-- sources: w3c, engine -->
核接近图像边界时，邻域会越出画面。常见处理包括延用边缘样本、将外部视作透明，或在运算中对坐标重新取界。在很小的图里，边界和扫描次序甚至会影响整张输出。

## 小图对比
<!-- sources: engine, pillow -->
在只有九个像素的图上，单亮点和纯色块可分别检查扩散与平均的效果。

:::example 快速模糊的单亮点
[输入]
3×3 灰度图，中心像素为 255，其余为 0，Fast 1
[结果]
九个灰度均为 28
[说明]
此测试图的每个结果约为 255/9，写回整数为 28。
:::

:::example 同一亮点的 Gaussian 结果
[输入]
同一张 3×3 单亮点图，Gaussian 1
[结果]
15 30 28
36 16 19
21 17 20
[说明]
这里是固定实现对极小图的光栅输出。不能用理想的无限、对称高斯卷积推断这组值。
:::

:::example 恒定颜色块
[输入]
3×3 像素均为 RGB(35,120,220)，Fast 1
[结果]
九个像素仍为 RGB(35,120,220)
[说明]
邻域中的样本原本相同，均值仍为原值。
:::

## 降噪与信息丢失
<!-- sources: w3c, pillow -->
模糊可以削弱离散噪点，但点状线索、细字和密集条纹也会变弱。两个不同输入可以得到相同或近似结果，从模糊后的图反推原先的每个样本通常不唯一。

## 常见误区
- 模糊依据像素邻域计算，显示时单纯缩小图片是另一种过程。
- Fast 与 Gaussian 的同一数值无法用一个对应关系解释。
- 降噪和弱化细节可以同时发生。
