---
capabilityId: native:video-concat
title: 音视频拼接
topicGroup: video
summary: 按相邻片段建立统一时间轴，处理尺寸、采样率与缺失音轨。
aliases:
  - 多视频拼接
  - 音频串接
  - concat 滤镜
sources:
  - id: filter
    title: FFmpeg Filters Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg-filters.html
    language: en
    kind: official-doc
    locator: concat、scale、pad、aresample 和 apad
  - id: local
    title: 媒体编辑与检测命令
    publisher: 迷雾工具箱
    url: /video/editing.js
    language: zh-CN
    kind: implementation
    locator: concat 的流布局、补空音轨与输出顺序
---

## 介绍
<!-- sources: filter, local -->

拼接将多个音频或视频片段按指定次序放入同一时间轴。后一个片段的播放起点在前一段结束之后。处理画面和声音时，往往需要先把不同尺寸、速率和声道布局归一化。

## 尺寸归一与留边
<!-- sources: filter, local -->

按第一段的画布确定结果画面大小，后续视频等比例缩放，剩余区域用边框填补。对于不同的宽高比，这种处理会保留四边内容。先将各段的显示起点归零，再连接到输出时间轴。

:::example 方形片段接在横向片后
[输入]
第一段 64×48、4 秒，第二段 32×32、2 秒。
[结果]
输出约 6 秒，宽 64 像素，末段可识别为第二段的红色画面。
[说明]
方形画面约放大到 48×48，左右各有约 8 像素留边。
:::

## 没有音轨的片段
<!-- sources: filter, local -->

音视频联合拼接要求每段都有对应的连接位置。缺少声音的一段可以补等时长的静音流。原带声片段的音频也可补齐或裁去多出的样本，让它与该段画面的时长一致。

:::example 后段无声
[输入]
有声音的 4 秒视频后接无音轨的 2 秒片段。
[结果]
约第 4 秒之后的一段保留画面，声音接近静音。
[说明]
测试在约 4.5 秒读取 PCM，能量小于 0.00001。
:::

## 纯音频的统一采样
<!-- sources: filter, local -->

纯音频处理可以直接选取各文件中的音轨，即使其中某个输入本身是视频容器。统一采样率与布局后，把声波片段首尾接起来。由哪一段排在前面决定事件的顺序。

:::example 两段声音总时长
[输入]
一秒独立音频，后接四秒视频中的音轨。
[结果]
约五秒 WAV，采样率为 48000 Hz。
[说明]
输入格式不同，拼接后的音频样本遵循同一采样率。
:::

## 与混音和转场的关系
<!-- sources: filter, local -->

顺序拼接把片段前后排列。混音叠加同一时间的声音，转场可让画面在交界处重叠，因而会改变时间关系。追踪线索时最好记录各段输入次序和输出中的切换时刻。

## 常见误区

- 文件列表次序影响成片，不会自动按拍摄时间排序。
- 等比例留边与强行拉伸会得到不同空间形状。
- 拼接后统一编码，不代表输入文件的编码和尺寸都保持原样。
