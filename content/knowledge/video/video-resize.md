---
capabilityId: native:video-resize
title: 视频缩放
topicGroup: video
summary: 解释像素尺寸、显示宽高比和插值，核对改变输出宽度后的分辨率。
aliases:
  - 视频分辨率
  - scale 滤镜
  - 视频宽高比
sources:
  - id: filter
    title: FFmpeg Filters Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg-filters.html
    language: en
    kind: official-doc
    locator: scale 的自动高度、宽高比和采样
  - id: local
    title: 本地媒体处理入口
    publisher: 迷雾工具箱
    url: /video/commands.js
    language: zh-CN
    kind: implementation
    locator: resize 分支和 scale=width:-2
---

## 介绍
<!-- sources: filter, local -->

缩放把整张视频画面重新采样到另一网格。输出尺寸以像素计，减少宽高会压缩可存储的空间细节，增加宽高则需插值。音轨和视频时间轴是独立数据，不参与画面像素计算。

## 从宽度估算高度
<!-- sources: filter, local -->

保持矩形比例时，目标高度约为源高度乘目标宽度与源宽度的比。固定转码流程令滤镜选择能被 2 整除的高度，方便输出到常用像素格式。因此实际整数尺寸可能和比例值略有差异。

:::example 64×48 缩到半宽
[输入]
源 64×48，目标宽度 32。
[结果]
32×24。
[说明]
48×32÷64=24，正好满足偶数高度。
:::

## 像素比例与显示比例
<!-- sources: filter -->

可以把像素宽度与高度之比记为 SAR，把整幅画面显示宽高比记为 DAR。若存储尺寸为 W×H，则 DAR=(W/H)×SAR。视频在显示时可以根据 SAR 拉伸到正确比例。

:::example 非方形像素
[输入]
存储为 720×576，SAR 为 16:15。
[结果]
显示宽高比为 4:3。
[说明]
720÷576×16÷15=4÷3。
:::

## 插值与细节
<!-- sources: filter -->

缩小时每个输出像素通常综合附近输入值，大量细节会合并。放大时输出像素可以由最近点或多点估计，插值方法影响边缘和平滑程度。

:::example 放大面积的估算
[输入]
64×48 画面按宽与高同时放大两倍。
[结果]
128×96，像素数为原来的四倍。
[说明]
12288÷3072=4。增加的格点不能证明存在新拍摄细节。
:::

## 核对所需的画面
<!-- sources: filter, local -->

需要保住四周线索时，缩放更适合保留完整画面构图。只查看某一矩形时，可使用画面裁切。核对处理结果要同时看输出的尺寸、像素比例以及预览器最终显示的形状。

## 常见误区

- 视频文件大小和像素数没有固定倍数关系。
- 放大不能还原低分辨率文件未保存的细节。
- 宽高数值相同也可能因像素比例不同而显示成不同形状。
