---
capabilityId: native:video-clip
title: 视频裁剪
topicGroup: video
summary: 按原时间轴起点和长度复制一段可独立播放的视频，辨别寻址和输出轨道。
aliases:
  - 剪视频
  - 视频片段
  - 时间区间
sources:
  - id: ff
    title: ffmpeg Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg.html
    language: en
    kind: official-doc
    locator: Main options 的 -ss、-t 与 -map
  - id: local
    title: 本地媒体处理入口
    publisher: 迷雾工具箱
    url: /video/commands.js
    language: zh-CN
    kind: implementation
    locator: clip 分支的时间校验、视频与音轨映射
---

## 介绍
<!-- sources: ff, local -->

视频裁剪从一条时间轴选取连续区间，输出一个短媒体。它按时间去掉前后内容。画面长宽和局部像素区域的处理属于画面裁切或缩放。

## 起点与片段长度
<!-- sources: ff, local -->

以秒标出的起点 t 和长度 d 对应目标范围 t 至 t+d。常见做法把区间右端理解为过了即不再读取。最后一帧是否出现仍取决于视频的离散显示时刻以及所用的读取规则。

:::example 末端的计算
[输入]
起点 3.5 秒，长度 2 秒。
[结果]
目标窗口从 3.5 秒到 5.5 秒。
[说明]
把 2 秒填成结束坐标会描述与这个窗口不同的请求。
:::

## 解码和重新编码
<!-- sources: ff, local -->

包含帧间预测的视频，准确选取一段通常要从可解码位置启动，然后重编码所需的内容。快速流复制有不同的寻址特性。时间边界应以可验证的输出内容与时戳复核。

:::example 生成短 MP4
[输入]
约 45 秒的测试媒体，从 0 秒取 2 秒。
[结果]
时长 2.000 秒的 MP4，含一条 H.264 视频轨和两条 AAC 音轨。
[说明]
测试片原先也有字幕，裁剪分支只映射第一视频轨和音轨。
:::

## 区间越界
<!-- sources: ff, local -->

当容器报告明确时长时，可在启动时检查请求能否落在有效范围。若视频和音频并不同步结束，需分别查看各流持续时间来解释输出末端的差异。

:::example 起点在结尾之后
[输入]
约 45 秒的测试媒体，请求从 50 秒开始取 2 秒。
[结果]
提示起点超出媒体时长。
[说明]
范围错误在解码前被拒绝。
:::

## 复查片段中的证据
<!-- sources: ff, local -->

旧片段可能携带与画面同步的多个声音，导出选项会影响哪些流被写入。用于引述时间线索时，记录片段在原文件中的起点。输出从自身零点开始计算的时间也应与源时间分开。

## 常见误区

- 裁剪长度与结束时刻是不同量。
- 裁剪时间范围不会自动缩小像素尺寸。
- 输出片段未必含原文件全部流。
