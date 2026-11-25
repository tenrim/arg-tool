---
capabilityId: native:video-native
title: 媒体格式转换
topicGroup: video
summary: 以容器、编码和轨道映射解释重新封装与转码，使用实际输出验证兼容范围。
aliases:
  - FFmpeg 转码
  - 媒体封装
  - 音视频编码
  - 轨道映射
sources:
  - id: ff
    title: ffmpeg Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg.html
    language: en
    kind: official-doc
    locator: Streamcopy、Transcoding、选流和参数顺序
  - id: formats
    title: FFmpeg Formats Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg-formats.html
    language: en
    kind: official-doc
    locator: Demuxers 与 Muxers
  - id: local
    title: 媒体格式转换规划
    publisher: 迷雾工具箱
    url: /video/commands.js
    language: zh-CN
    kind: implementation
    locator: native 分支、封装与编解码配置
---

## 介绍
<!-- sources: ff, formats -->

媒体格式转换可以只更换容器，也可以把已有轨道解码后用新编码压缩。扩展名通常与容器关联，格式转换需要处理实际数据结构。两种方案对画质、可用轨道和播放器兼容性的影响不同。

## 重新封装
<!-- sources: ff, formats, local -->

重新封装把输入流中已编码的包复制到目标容器。前提是容器接受所选编码和轨道类型。复制不会重新压缩画面，但目标容器负责自己的索引、时间戳和元数据表示。

:::example 写成另一个 Matroska
[输入]
有 H.264、两条 AAC 与一条文字字幕的测试素材，按流复制生成 MKV。
[结果]
输出仍显示 H.264、两条 AAC 与一条 SubRip 字幕。
[说明]
所有输入流被映射，容器重新写入而编码类型保留。
:::

## 解码与重编码
<!-- sources: ff, local -->

滤镜、改变像素格式、提高播放兼容性等操作可能需要解码、处理和重编码。MP4 与 WebM 可使用不同的常见编码。实际支持范围取决于运行时编译的编码器和目标容器。

:::example WebM 容器的编码
[输入]
测试素材转 WebM。
[结果]
视频探测为 VP8，音频探测为 Vorbis。
[说明]
这份输出不同于源 H.264 与 AAC 的编码组合。
:::

## 保留什么流
<!-- sources: ff, local -->

手动选流可精确规定复制或转码的轨道，自动选流则按 FFmpeg 规则决定。对多配音和字幕素材，应查看输出轨道表。音频格式转换会去掉视频流，保存选到的音频。

:::example 两音轨转普通 MP4
[输入]
同一有两条 AAC 的测试素材，使用常见 MP4 转码选择。
[结果]
测试结果包含一条 H.264 视频轨和一条 AAC 音轨。
[说明]
该路径自动选择可用流，没有像 MKV 流复制路径那样映射全部。
:::

## 参数顺序与输出核对
<!-- sources: ff, local, formats -->

高级命令的参数先后会影响选项作用于输入还是输出。可以按容器和流编码检查转换后是否达到目标，通过播放探测时长，并用轨道表确认是否保留所有需要的声音与字幕。

## 常见误区

- 修改扩展名不会重新封装已有数据。
- 无损封装不会修复源编码中的有损变化。
- 目标容器的兼容范围和自动选择的轨道范围是不同问题。
