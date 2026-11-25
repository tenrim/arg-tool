---
capabilityId: op:Dither%20Image
title: 图片抖动处理
topicGroup: image
summary: 用重复的二维偏移阵列改变 RGB 采样，解释有序抖动的纹理与限幅。
aliases:
  - Dither Image
  - 有序抖动
  - 4×4 抖动矩阵
sources:
  - id: png
    title: PNG Specification 第三版
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: Histograms and suggested palettes 的量化与抖动背景
  - id: jimp
    title: Jimp 图像处理接口
    publisher: Jimp
    url: https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#dither
    language: en
    kind: official-doc
    locator: dither 方法
  - id: engine
    title: CyberChef 11.5.0 图像模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Dither Image；Jimp 内置 4×4 偏移阵列及 255 限幅
---

## 介绍
<!-- sources: png, jimp -->
有序抖动让临近像素在规则的坐标阵列下产生细小差异。图像后续若被压到较少的灰阶，可借这些邻近像素的比例表现介于两个灰阶之间的色调。单独加入抖动本身也可产生周期纹理。

## 二维偏移阵列
<!-- sources: engine -->
当前方法有四行偏移值，依次为「1 9 3 11」、「13 5 15 7」、「4 12 2 10」、「16 8 14 6」。取 x、y 各自除以 4 的余数选出一项，将它分别加给 R、G、B。坐标从零开始，Alpha 留用原值。

## 高光处的限幅
<!-- sources: png, engine -->
每个新颜色分量的上界为 255。原值很亮时，来自不同偏移的多个结果都可能挤到 255。因此矩阵规则虽一致，产生的纹理在高光区域可以更淡。

## 横向像素样本
<!-- sources: engine -->
以下样本都取最上面一行，最左侧样本对应矩阵的第一项。

:::example 平灰上显出的周期
[输入]
第一行八个像素都是 RGB(100,100,100)
[结果]
各像素灰度依次为 101、109、103、111、101、109、103、111
[说明]
第一行按 1、9、3、11 加值，第五个像素开始重复。
:::

:::example 灰阶与上界
[输入]
第一行灰度 0、50、100、150、200、255
[结果]
1、59、103、161、201、255
[说明]
最后一个像素的 255＋9 超出上界，写回 255。
:::

:::example 固定灰阶边界
[输入]
第一行灰度 20、20、40、140、180、180
[结果]
21、29、43、151、181、189
[说明]
第一个 20 和第二个 20 获得不同结果，变化由位置产生。
:::

## 纹理和量化的关系
<!-- sources: png, engine -->
抖动后若进行量化，纹理会影响像素落在哪一档。直接保存此次处理生成的图时，仍可拥有大量不同的 RGB 值。重复规律由像素网格决定，因而可用灰色测试图识别固定四列周期。

## 常见误区
- 有序抖动的同一坐标偏移可重复计算。
- 这项处理增加 RGB 偏移，二值化需要另一步。
- 灰区输出中的重复斑点可由矩阵产生。
