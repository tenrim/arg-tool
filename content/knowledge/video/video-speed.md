---
capabilityId: native:video-speed
title: 视频变速
topicGroup: video
summary: 把速度倍数换算为新时间戳与时长，并说明音频节奏和音高的区别。
aliases:
  - 视频加速
  - setpts
  - atempo
  - 时间轴缩放
sources:
  - id: filter
    title: FFmpeg Filters Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg-filters.html
    language: en
    kind: official-doc
    locator: setpts、asetpts、atempo 滤镜
  - id: local
    title: 本地媒体处理入口
    publisher: 迷雾工具箱
    url: /video/commands.js
    language: zh-CN
    kind: implementation
    locator: speed 分支的时间戳缩放与音频滤镜
---

## 介绍
<!-- sources: filter, local -->

视频变速让同一过程显示得更快或更慢。速度为原来 s 倍时，画面时间戳以起点为零后除以 s，声音另用节奏处理。变速可保持画面顺序，并改变两幅图像之间的播放间隔。

## 时间与时长
<!-- sources: filter, local -->

源时刻 t 对应输出 t/s，理想时长为 T/s。视频帧和音频样本以有限的时间单位保存，输出封装的完整时长可能有短小误差。

:::example 两秒片段二倍速
[输入]
两秒 2 fps 测试片，速度 2。
[结果]
理想约一秒。实际 MP4 的时长 1.008 秒，探测画面速率 4 fps。
[说明]
时戳按 1/2 缩放，音频包和封装舍入影响末端值。
:::

## 调整节奏与音高
<!-- sources: filter -->

直接提高音频采样的播放速度会同时提高音高。节奏滤镜通过对时间段进行匹配和拼接来改变速度，目标是尽量保持音高。快速或缓慢到较大倍数时可以阶梯组合节奏率。

:::example 串联节奏率
[输入]
先按 0.5 倍节奏处理，再按 0.5 倍处理。
[结果]
合成速度为 0.25，理想时长为原来的四倍。
[说明]
两次时间缩放率相乘，每步的速度仍在相应滤镜适用范围内。
:::

## 事件时刻的换算
<!-- sources: filter, local -->

线索出现时刻会随速度成比例变化。原视频起点若有时间偏移，计算前先扣除所选片段的基准。用经过变速的作品标注源文件线索时，应将输出时刻换回原轴。

:::example 将定位映射回原片
[输入]
片段从原视频第 10 秒开始，变速倍率 0.5，线索在导出后第 6 秒。
[结果]
源视频对应约第 13 秒。
[说明]
6×0.5=3，再加原片起点 10。
:::

## 保留帧率信息
<!-- sources: filter, local -->

原帧率、输出时间戳和容器统计的平均帧率应各自记录。倍速处理并不会创造更多不同的实拍帧。极短片段上包边界对时长比例的影响更容易看出来。

## 常见误区

- 0.5 倍表示时长增加，2 倍表示时长减少。
- 变速和补帧承担不同工作。
- 频率变化与节奏变化要由实际音频处理来区分。
