---
capabilityId: native:video-audio
title: 视频音轨提取
topicGroup: video
summary: 解释容器音轨拆分、重新封装与转码，核对完整时长、轨道序号和采样率。
aliases:
  - 视频转音频
  - 多音轨提取
  - 音频流复制
sources:
  - id: ff
    title: ffmpeg Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg.html
    language: en
    kind: official-doc
    locator: Streamcopy、Transcoding、手动选流
  - id: local
    title: 本地媒体处理入口
    publisher: 迷雾工具箱
    url: /video/commands.js
    language: zh-CN
    kind: implementation
    locator: audio 分支选择轨道及 WAV、MP3、M4A、FLAC、MKA
---

## 介绍
<!-- sources: ff, local -->

音轨提取从媒体容器选出一条或多条音频流，分别保存为音频文件。原视频可能有配音、导演解说或其他语言的声音，某条声音的内容由选择的轨道决定。完整音轨和时间片段都属于可明确选择的范围。

## 轨道与声道
<!-- sources: ff, local -->

容器中的流编号也包括视频、字幕等类型。音轨列表的第一项不必是流编号 0。一条立体声音轨里有两个声道，仍是一个流；选择全部音轨时会按流分别导出。

:::example 两个音轨独立输出
[输入]
约 45 秒的测试素材包含两条 16000 Hz 音轨。选择全部轨道和 WAV。
[结果]
得到两个独立 WAV，每个时长超过 44.9 秒，均为 16000 Hz。
[说明]
两文件由不同音频流各自解码，与双声道拆分是不同处理。
:::

## 原编码与转码
<!-- sources: ff, local -->

复制音频流并重新封装时，压缩包本身不需重新编码，输出容器仍可能改变索引和时间基。转成 PCM、FLAC、MP3 或 AAC 时则按目标编码处理。带损压缩的源音轨转成无损格式，也不能恢复原来已经丢失的数据。

:::example AAC 封装到 MKA
[输入]
含 AAC 的视频文件，选择原音轨 MKA。
[结果]
MKA 中的音频编码器类型仍显示 AAC。
[说明]
这里变化的是容器，没有再次把 AAC 压缩到其他编码。
:::

## 保留时长与取片段
<!-- sources: ff, local -->

整段处理读取选中流的全部内容。取片段时按起点与持续时间计算，不能把持续时间误当成结束时刻。编码帧边界与容器计时也可能使探测时长出现微小差异。

:::example 较长的取样片段
[输入]
约 45 秒的测试素材，从 3 秒开始取 35 秒，导出 PCM WAV。
[结果]
音频约 35 秒。
[说明]
请求的时间范围是从 3 秒至约 38 秒。
:::

## 校验文件和音轨
<!-- sources: ff, local -->

复查导出时可检查音频格式、采样率、时长与所选的流。没有音轨时无法从画面推导出原来的声音。有附加说明或字幕的媒体，也应核对它们是否属于另一种流。

## 常见误区

- 音轨是容器里的流，声道是该流内部的声音分量。
- 选择原音轨只保留编码数据，不生成与原媒体逐字节一致的文件。
- WAV 和 FLAC 不会还原源 AAC 在早先压缩时丢失的细节。
