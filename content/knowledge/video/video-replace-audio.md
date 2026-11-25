---
capabilityId: native:video-replace-audio
title: 替换视频音轨
topicGroup: video
summary: 将外部音轨映射到视频时间轴，理解补静音、循环和按较短轨结束。
aliases:
  - 换音轨
  - 外部音频
  - apad 与 atrim
sources:
  - id: ff
    title: ffmpeg Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg.html
    language: en
    kind: official-doc
    locator: 命令的输入顺序、-map、-stream_loop 与流复制
  - id: filter
    title: FFmpeg Filters Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg-filters.html
    language: en
    kind: official-doc
    locator: asetpts、apad 与 atrim
  - id: local
    title: 媒体编辑与检测命令
    publisher: 迷雾工具箱
    url: /video/editing.js
    language: zh-CN
    kind: implementation
    locator: replace-audio 的视频时长、来源与三种策略
---

## 介绍
<!-- sources: ff, local -->

换音轨把外部声音与指定视频流放入同一输出。原素材的声音不会一起叠加。输出画面仍来自第一个输入，而新音轨来自另一个输入。两个来源的持续时间需要按选定策略协调。

## 对齐时间零点
<!-- sources: filter, local -->

处理时将新音轨的时间基准归零。视频流在容器支持时可直接复制，音频根据长度策略补齐或截短。若原容器的剩余音轨更长，应尽量使用实际视频流的长度，而非把容器总长当作画面时长。

:::example 较短声音补齐
[输入]
4 秒视频，外部音轨为 1 秒，按视频长度输出。
[结果]
约 4 秒成片，后 3 秒的音轨以静音填补。
[说明]
实测第 2 秒处 PCM 近似为零。
:::

## 循环来源
<!-- sources: ff, filter, local -->

当需要重复较短音轨时，重复读取外部声音，再按照画面长度截断。原音轨自身的开头和尾部若有停顿，这些停顿也会随循环重现。循环不会自动加淡入淡出。

:::example 循环一秒测试音
[输入]
4 秒视频，外部一秒为连续测试音，启用循环。
[结果]
约 4 秒成片，第 2 秒附近仍可测到声音。
[说明]
重复的是外部音频，原视频声音不参与结果。
:::

## 由较短一方决定时长
<!-- sources: ff, local -->

选择最短长度时，将结果截到视频与新音轨长度的较小者。如果短的是音轨，输出视频也会较短。若计划保留完整画面，应选补静音或循环之类与视频长度一致的处理。

:::example 短音频决定结尾
[输入]
4 秒视频和 1 秒新音频，按较短一方结束。
[结果]
成片约 1 秒。
[说明]
min(4,1)=1。
:::

## 复核输出
<!-- sources: ff, local -->

检查音频来源、轨道数和画面结束位置，有助于发现选择了错误文件或错误的长度策略。替换声音本身未估计画面与声音的内容同步关系，仍需根据共同事件手动校准。

## 常见误区

- 替换音轨不会混入保留下来的原声。
- 循环不会因视频画面内容变化自动对齐节拍。
- 视频流复制保留编码数据，但输出容器不是原文件的字节副本。
