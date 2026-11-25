---
capabilityId: native:video-detect
title: 异常片段检测
topicGroup: video
summary: 用阈值和最短持续时间标记黑屏、冻结与静音，理解时间戳和无事件报告。
aliases:
  - blackdetect
  - freezedetect
  - silencedetect
  - 媒体异常时间戳
sources:
  - id: filter
    title: FFmpeg Filters Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg-filters.html
    language: en
    kind: official-doc
    locator: blackdetect、freezedetect、silencedetect 的事件阈值
  - id: local
    title: 媒体编辑与检测命令
    publisher: 迷雾工具箱
    url: /video/editing.js
    language: zh-CN
    kind: implementation
    locator: detect 以及 detectionReport 的起止和文件末端
---

## 介绍
<!-- sources: filter, local -->

异常片段检测扫描视频画面或音频，按照预设的条件列出时间段。黑屏检查连续画面中低亮度像素所占比例，冻结检查画面差异，静音检查声音幅度。结果适合标出可回看区段。

## 黑屏的两个条件
<!-- sources: filter -->

像素黑阈值先决定哪些像素算黑；整帧黑色像素比例再决定该帧是否满足条件。连续达到最短时长才形成一个可报告事件。光线很暗的内容也可能符合规则。

:::example 一段全黑
[输入]
合成样例开头 2 秒为黑，最短持续时间为 0.5 秒。
[结果]
报告接近 0 至 2 秒的黑屏区段。
[说明]
样例的持续长度明显超过 0.5 秒。
:::

## 静音阈值与时间基准
<!-- sources: filter, local -->

静音滤镜使用分贝或振幅阈值描述低声条件。绝对零在数字合成中容易识别，录音中的环境噪声则可能接近阈值。音轨有延后起点时，事件时间需要保留相对媒体轴的位置。

:::example 原音轨缺失
[输入]
只有画面的素材，选择全部可用检测。
[结果]
检查黑屏与画面冻结，没有静音检查结果。
[说明]
没有任何音频样本供静音滤镜判断。
:::

## 冻结直至结尾
<!-- sources: filter, local -->

冻结判断连续画面的变化是否低于限制，往往会把刻意静止的图卡一并标出。如果一直没有看到结束帧，报告可用已知轨道结束时间闭合事件，并记录它一直延续至末端。

:::example 末尾静止画面
[输入]
一个 6 秒测试片，最后约 2 秒持续同一张红色画面，其间没有更换。
[结果]
冻结事件约从第 4 秒持续到结尾。
[说明]
固定浏览器测试检查起点不早于 3.8 秒、终点不早于 5.8 秒。
:::

## 结果为何出现或缺失
<!-- sources: filter, local -->

阈值、持续时间、检测轨道与缺失媒体共同影响报告。没有事件也可能因为片段过短或声音略高于阈值。需保留检测项与范围，回看候选前后，确认它是有意义的变化还是正常剪辑。

## 常见误区

- 黑屏事件是基于可测条件的报告，不能直接证明文件损坏。
- 静音阈值低到排除背景噪声时，轻微底噪可能使检测为空。
- 没有对应轨道与有轨道但没有符合条件的区段是两种状态。
