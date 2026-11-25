---
capabilityId: native:video-crop
title: 画面裁切
topicGroup: video
summary: 按显示坐标截取视频矩形，用像素和尺寸核对裁切与旋转元数据。
aliases:
  - 视频裁切
  - crop
  - 像素矩形
sources:
  - id: filter
    title: FFmpeg Filters Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg-filters.html
    language: en
    kind: official-doc
    locator: crop 的 w、h、x、y 与 exact
  - id: local
    title: 媒体编辑与检测命令
    publisher: 迷雾工具箱
    url: /video/editing.js
    language: zh-CN
    kind: implementation
    locator: crop 的显示宽高、边界和 H.264 偶数宽高
---

## 介绍
<!-- sources: filter, local -->

画面裁切选择每帧的一个矩形，框内像素进入结果，框外被舍弃。参数包括左边距 x、上边距 y、宽度 w 和高度 h。视频时间范围保持独立，可继续按原顺序播放。

## 矩形的有效边界
<!-- sources: filter, local -->

从左上角零点计坐标时，横坐标区间为 x 到 x+w−1，纵坐标同理。有效条件是 x、y 不小于零，矩形有正宽高，右边界 x+w 不超过源宽、下边界 y+h 不超过源高。

:::example 实际裁切区域
[输入]
64×48 源画面，x=8、y=6、w=32、h=24。
[结果]
输出 32×24，范围对应源画面列 8 至 39、行 6 至 29。
[说明]
测试以独立 FFmpeg 的裁切作为参照核对输出像素。
:::

## 色度采样和编码宽高
<!-- sources: filter, local -->

带色度子采样的画面可用 exact 选项阻止裁切几何自动向下对齐。之后的编码器与像素格式仍可能对宽高有独立要求。固定 H.264 输出流程以明确的偶数宽高约束避免隐式舍入。

:::example 两类不合法矩形
[输入]
在宽 64 的画面上，选择 x=40、w=32，或选择 w=31。
[结果]
前者超出画面，后者不满足该输出流程的偶数宽度条件。
[说明]
40+32=72，超过边界。31 则是奇数。
:::

## 旋转标记与选框方向
<!-- sources: filter, local -->

带显示旋转标记的视频可能以横向像素数据储存为竖向显示。涉及直角旋转时，先确定显示方向下的宽高，再应用裁切坐标，能使框的位置与视觉检查一致。

:::example 直角元数据
[输入]
存储维度 64×48，带九十度显示方向，裁切整幅。
[结果]
输出画面的宽高为 48×64。
[说明]
边界检查以转成显示方向后的尺寸为准。
:::

## 图像内容与空间尺度
<!-- sources: filter, local -->

裁切改变画布范围。保留下来的区域仍使用原素材坐标的像素范围，最后编码可能影响像素值。在比较细小标记时，记录源坐标，并将裁后像素的位置按边距偏移回原图。

## 常见误区

- 画面裁切不缩短播放时间。
- 像素范围的末端是 x+w−1 和 y+h−1，边界检查使用 x+w 与 y+h。
- 原始存储分辨率与旋转后的显示方向可能不同。
