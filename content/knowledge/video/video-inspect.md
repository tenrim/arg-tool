---
capabilityId: native:video-inspect
title: 媒体信息与轨道
topicGroup: video
summary: 区别容器字段和流字段，核对媒体中的视频、音轨、字幕及其数据类型。
aliases:
  - ffprobe
  - 媒体轨道
  - 媒体信息 JSON
sources:
  - id: probe
    title: ffprobe Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffprobe.html
    language: en
    kind: official-doc
    locator: Description、-show_format、-show_streams 和 JSON writer
  - id: local
    title: 浏览器媒体运行模块
    publisher: 迷雾工具箱
    url: /video/runtime.js
    language: zh-CN
    kind: implementation
    locator: 文件检测与自包含媒体报告
  - id: commands
    title: 本地媒体处理入口
    publisher: 迷雾工具箱
    url: /video/commands.js
    language: zh-CN
    kind: implementation
    locator: mediaSummary 使用的摘要字段
---

## 介绍
<!-- sources: probe, local -->

媒体信息检查读取容器结构和各条轨道描述。报告将容器与轨道单独列出，便于了解文件整体格式，以及其中视频、音频或字幕使用的编码。媒体时长与轨道时长也分属不同层。

## 容器与编码
<!-- sources: probe, local -->

容器负责组织流、时间戳和索引。一份 Matroska 可以包含 H.264 视频、AAC 音轨和文字字幕。文件扩展名只是提示，探测器根据实际文件内容判断结构。

:::example 多轨素材
[输入]
合成的 Matroska 测试片。
[结果]
流 0 为 H.264 视频，流 1、2 为 AAC 音频，流 3 为 SubRip 字幕。
[说明]
视频尺寸为 64×48，两条音轨采样率均为 16000 Hz。
:::

## 不同字段的单位
<!-- sources: probe, local, commands -->

视频分辨率通常按像素表示，音频采样率按每秒采样点计，容器时长按秒。轨道的时间基可以是分数。字段缺失有时只表示容器或该次探测没有提供该值，不能自动换成零。

:::example 容器比片段略长
[输入]
测试文件画面素材标称 45 秒。
[结果]
容器报告 45.064 秒。
[说明]
容器报告参考组合后的流时间戳，AAC 等分帧结构可能影响尾端。
:::

## 轨道编号与提取序号
<!-- sources: probe, local -->

报告里的 index 是容器中该流的编号。用户界面的音轨或字幕序号可能按同一类型重新顺序编号。只有看清编号的含义，才能从含多个流的文件准确选取所需内容。

:::example 两种编号读法
[输入]
流 0 为视频，流 1、2 为声音，流 3 为字幕。
[结果]
第二音轨对应流 2，第一字幕轨对应流 3。
[说明]
类型内序号只数对应类型，流编号对全部流计数。
:::

## 探测的有效性
<!-- sources: probe, local -->

能解析到结构可以证明探测器识别了文件中的某些部分，不能证明每个包都能解码。有损坏或不受支持的数据时，探测可能报错，也可能只在后续完整播放或解码中发现问题。

## 常见误区

- MP4、Matroska 等容器名称不唯一确定内部音视频编码。
- 声道数和音轨数属于不同层。
- 格式报告中的一项时长不能代替各流的实际时间线。
