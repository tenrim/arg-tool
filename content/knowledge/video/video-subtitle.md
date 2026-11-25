---
capabilityId: native:video-subtitle
title: 提取文字字幕
topicGroup: video
summary: 分清文字流、位图字幕与烧录字幕，理解 SRT 条目、时戳和样式损失。
aliases:
  - 字幕轨
  - SRT 导出
  - 烧录字幕
sources:
  - id: ff
    title: ffmpeg Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg.html
    language: en
    kind: official-doc
    locator: Stream selection 的字幕轨映射和编码
  - id: local
    title: 本地媒体处理入口
    publisher: 迷雾工具箱
    url: /video/commands.js
    language: zh-CN
    kind: implementation
    locator: subtitle 分支的图像字幕保护与 SRT 导出
  - id: probe
    title: ffprobe Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffprobe.html
    language: en
    kind: official-doc
    locator: 识别 subtitle 轨及 codec_name
---

## 介绍
<!-- sources: ff, probe -->

字幕可作为容器中的独立流保存，也可与画面像素混在一起。文字字幕轨记录显示文本和时段。提取时可以把已编码文字转换到独立的 SRT 文件供核对。

## 文字条目的时间
<!-- sources: ff, local -->

SRT 每个条目包含序号、起止时间和一段文字，时间用小时、分钟、秒和毫秒表示。导出沿用媒体和字幕流的时间戳，来源带起点偏移时，生成的时间和另存为素材之前的 SRT 文本可能存在差别。

:::example 条目时长核算
[输入]
一条字幕的 SRT 时间范围为 00:00:01,000 到 00:00:03,000。
[结果]
条目显示时长约两秒。
[说明]
3000 毫秒减 1000 毫秒是 2000 毫秒。
:::

## 轨道与字幕类型
<!-- sources: ff, probe, local -->

容器可存放不同语言、字幕说明或不同制作方式的多条轨道。先查看编号及类型。PGS 等轨道保存的是位图，常规文本导出缺少把帧内字形识别为字符的一步。

:::example 选中的文字轨
[输入]
合成媒体中包含一条文字字幕，内容 Puzzle subtitle。
[结果]
导出 SRT 中可读到 Puzzle subtitle。
[说明]
运行使用该字幕流的独立数据，未使用图像识别。
:::

## 烧录字幕的边界
<!-- sources: probe, local -->

烧录字幕已成为视频帧的一部分，媒体轨道表中可能没有任何 subtitle 项。对这类画面需从图像另行识别文字和出现时间。单纯列出和选择字幕轨道无法取得它。

:::example 没有内嵌字幕流
[输入]
每帧自带字幕，但媒体只含视频和音频流。
[结果]
字幕提取入口提示没有内嵌字幕轨。
[说明]
视频像素可以有文字，流结构中仍然没有可直接导出的文字。
:::

## 样式与原文件
<!-- sources: ff, local -->

复杂字幕格式可能有样式、层级、位置和动态效果。SRT 表达重点是按时出现的文字。需要考证字体与排版线索时，同时保留原字幕轨和原视频画面。

## 常见误区

- 能在画面看见字幕不保证容器有文字字幕流。
- 字幕流可能是位图，选择轨道不等于识字。
- 导出 SRT 可能只保留文字及时间，需要另外保管原样式。
