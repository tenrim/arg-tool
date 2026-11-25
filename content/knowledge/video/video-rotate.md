---
capabilityId: native:video-rotate
title: 视频旋转与翻转
topicGroup: video
summary: 用坐标变换说明旋转、水平及垂直翻转，区分像素变化和显示方向标记。
aliases:
  - 视频旋转
  - transpose
  - hflip
  - vflip
sources:
  - id: filter
    title: FFmpeg Filters Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg-filters.html
    language: en
    kind: official-doc
    locator: transpose、hflip 与 vflip
  - id: local
    title: 本地媒体处理入口
    publisher: 迷雾工具箱
    url: /video/commands.js
    language: zh-CN
    kind: implementation
    locator: rotate 分支映射与输出尺寸
  - id: ff
    title: ffmpeg Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg.html
    language: en
    kind: official-doc
    locator: autorotate 与显示旋转元数据
---

## 介绍
<!-- sources: filter, ff -->

旋转和翻转在单帧内部改变像素坐标。九十度旋转会交换宽高。左右翻转以垂直中线作镜像，上下翻转以水平中线作镜像，两者的空间结果各有区别。

## 顺时针四分之一转
<!-- sources: filter, local -->

令图像高 H，像素坐标从左上角零点算，顺时针九十度把原来的 (x,y) 移到 (H−1−y,x)。变换后宽度为 H，高度为原宽 W。

:::example 测试视频尺寸
[输入]
64×48，顺时针旋转九十度。
[结果]
48×64。
[说明]
原左上像素 (0,0) 移到结果的右上角 (47,0)。
:::

## 左右镜像
<!-- sources: filter -->

水平翻转保持 y 坐标，将 x 变为 W−1−x。上下翻转保持 x，改变 y。无论只做一次哪种翻转，输出尺寸都和输入相同。

:::example 标记点左右互换
[输入]
宽度 6，红点在 (1,2)，做水平翻转。
[结果]
红点到 (4,2)。
[说明]
6−1−1=4，行号保持 2。
:::

## 双向翻转与时间
<!-- sources: filter, local -->

先水平后垂直翻转把点移动为 (W−1−x,H−1−y)，与旋转一百八十度相同。操作应用在每张帧图像，帧之间的显示顺序保持不变。

:::example 对角位置交换
[输入]
宽 6、高 4，左上角 (0,0)，双向翻转。
[结果]
右下角 (5,3)。
[说明]
横纵坐标都按自己的边界反射。
:::

## 显示方向与像素方向
<!-- sources: ff, local -->

视频容器可用旋转信息要求解码器旋转后播放。导出旋转视频时还会在解码后的画面上应用指定变换。追踪某个角落时，要区分源文件存储方向、播放器显示方向和最终导出的像素方向。

## 常见误区

- 水平翻转会反转文字的笔画左右关系，九十度旋转不会产生这种镜像。
- 旋转画面的方向与倒放时间轴是两类处理。
- 同一素材在处理旋转标记的不同播放器中，预览方向可能不同。
