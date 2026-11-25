---
capabilityId: native:video-gif
title: 视频片段转 GIF
topicGroup: video
summary: 从采样、调色板、时间粒度和循环理解视频转 GIF 后的外观与信息变化。
aliases:
  - 视频转动图
  - palettegen
  - paletteuse
  - GIF 帧延时
sources:
  - id: filter
    title: FFmpeg Filters Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg-filters.html
    language: en
    kind: official-doc
    locator: fps、palettegen、paletteuse
  - id: local
    title: 本地媒体处理入口
    publisher: 迷雾工具箱
    url: /video/commands.js
    language: zh-CN
    kind: implementation
    locator: gif 分支的采样、调色板和循环输出
  - id: gif
    title: Graphics Interchange Format Version 89a
    publisher: CompuServe
    url: https://www.w3.org/Graphics/GIF/spec-gif89a.txt
    language: en
    kind: standard
    locator: 颜色表与 Graphic Control Extension 的时间单位
---

## 介绍
<!-- sources: filter, gif -->

视频片段转成 GIF 时，先解码源画面，再选取或重新采样一组图像。GIF 使用索引色显示帧，播放依赖帧的延时与循环信息。音频流不会写入 GIF。

## 采样与时长
<!-- sources: filter, gif, local -->

先设定目标帧率，从原时间戳重新排列输出画面。GIF 的延时单位为百分之一秒，目标采样间隔若不能被 0.01 秒整除，实际记录值需要以该单位表示。逐帧时间可用输出文件重新核对。

:::example 两秒低频动图
[输入]
64×48 测试片取两秒，每秒 1 帧，保持源尺寸。
[结果]
64×48 的 GIF，时长为 2 秒，探测到 1 帧每秒。
[说明]
此输出没有音轨。测试的等间隔延时可用 GIF 的时间单位精确表示。
:::

## 调色板生成
<!-- sources: filter, gif -->

调色板统计采样帧中的颜色，再选择有限的代表色。应用调色板时，实际颜色映射到最近或适当的索引，抖动可以用像素组合表现中间色。颜色表最多由 256 项组成。

:::example 颜色数超出调色板
[输入]
某一帧有 300 个不同的 RGB 值。
[结果]
一个 256 项颜色表不足以逐一保留 300 种原色。
[说明]
至少有一部分颜色需要共享索引或用抖动近似。
:::

## 循环与时间精度
<!-- sources: gif, local -->

GIF 的循环可以通过常见应用扩展表达，导出的动图设定持续循环。循环控制播放次数，不增加文件储存的独立帧数。解码器最终怎样处理极短延时还可能受到播放器策略影响。

:::example 延时字段单位
[输入]
GIF 帧控制记录延时字段为 7。
[结果]
该字段表示 0.07 秒。
[说明]
7×0.01 秒等于 70 毫秒。
:::

## 结果适合的用途
<!-- sources: filter, gif -->

GIF 适合分发简短的无声过程和画面线索。若需要保存原轨声音、准确原色或原始帧时间戳，可保留原视频，并把动图作为独立预览材料。

## 常见误区

- 循环播放不表示多保存了几份同一帧。
- 导出的 GIF 帧率可以与源视频不同。
- 调色板和抖动会影响画面颜色的逐像素比对。
