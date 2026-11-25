---
capabilityId: native:video-sync
title: 音画同步调整
topicGroup: video
summary: 以毫秒正负值移动声轨，区分固定时差与逐渐积累的时钟漂移。
aliases:
  - 声音提前
  - 声音延后
  - adelay
  - 音画对齐
sources:
  - id: filter
    title: FFmpeg Filters Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg-filters.html
    language: en
    kind: official-doc
    locator: adelay、atrim、asetpts 与 apad
  - id: local
    title: 媒体编辑与检测命令
    publisher: 迷雾工具箱
    url: /video/editing.js
    language: zh-CN
    kind: implementation
    locator: sync 的有符号毫秒偏移及画面时长保持
---

## 介绍
<!-- sources: filter, local -->

音画同步调整通过固定时间偏移移动一条音轨。正值将声事件放到更晚的时间，负值让它提前。画面仍在原时间轴，新增的空档可以用静音补齐。

## 正值延后声音
<!-- sources: filter, local -->

需要延后 d 毫秒时，先在音轨前面加 d 毫秒的静音。以视频长度为终点重新取样时，和源声音相比，最末一部分可能因超出视频而不再输出。

:::example 声音移动半秒
[输入]
4 秒视频，偏移 +500 毫秒，某声响原在第 1 秒。
[结果]
声响约在第 1.5 秒，最初约 0.5 秒为静音，成片仍约 4 秒。
[说明]
500 毫秒等于 0.5 秒，浏览器测试也从开头附近检验静音。
:::

## 负值提前声音
<!-- sources: filter, local -->

提前时从音轨开端去掉相应长度，再重设其起始时间戳。把输出维持到视频结尾所需的尾部时长，用静音填补。被裁去的音频不再出现在导出文件里。

:::example 尾部补静音
[输入]
4 秒音画，偏移 −500 毫秒，声响原在第 1 秒。
[结果]
声响约在第 0.5 秒，结尾约 0.5 秒为静音。
[说明]
从声音开头去掉半秒后，余下约 3.5 秒声音。
:::

## 从共同事件求偏移
<!-- sources: filter, local -->

可在音轨找尖锐脉冲，在画面找同一事件。令 t画与 t声为对应秒数，音频偏移毫秒数是 1000×(t画−t声)。记录两个相距较远的事件更容易区分固定偏差和速度不一致。

:::example 根据拍手求补偿
[输入]
拍手画面在 2.000 秒，响声在 2.250 秒。
[结果]
给音频 −250 毫秒。
[说明]
1000×(2.000−2.250)=−250。
:::

## 时钟漂移的情形
<!-- sources: filter -->

若开头需要 −50 毫秒，结尾却要 −400 毫秒，单个偏移无法同时对齐两处。这时声音速度或时基可能与画面不同。恒定偏移的功能只修正同一时间差。

## 常见误区

- 正值是把声音往后移，常用于源声音发生得太早的情况。
- 音频提前会裁掉开端素材。
- 固定时间差与全程逐步积累的时间偏差需要分别估计。
