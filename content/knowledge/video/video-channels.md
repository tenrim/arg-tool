---
capabilityId: native:video-channels
title: 声道拆分与重组
topicGroup: video
summary: 从同一音轨取出独立声道、按顺序组回多声道，并核对频率与时长。
aliases:
  - 声道拆分
  - 声道互换
  - pan
  - amerge
sources:
  - id: filter
    title: FFmpeg Filters Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg-filters.html
    language: en
    kind: official-doc
    locator: pan、amerge、aresample 与 apad
  - id: local
    title: 媒体编辑与检测命令
    publisher: 迷雾工具箱
    url: /video/editing.js
    language: zh-CN
    kind: implementation
    locator: channels 的独立单声道、映射、补齐和布局
---

## 介绍
<!-- sources: filter, local -->

音轨是容器中的一条音频流，单条流可能包含左、右或更多声道。拆分把每一维样本取出为独立单声道文件。重组将按指定顺序取得的声道放回同一个多维音轨。

## 取一个声道
<!-- sources: filter, local -->

若某时刻的立体声样本写作 (L,R)，拆分选择 L 或 R，各输出一条单声道时间序列。把两个值相加或求平均属于混音，会让独立的左右内容合到一个样本。

:::example 两种音高独立分离
[输入]
左声道为 440 Hz，右声道为 880 Hz，采样率 8000 Hz。
[结果]
得到两条 8000 Hz 单声道，主要频率分别是 440 Hz、880 Hz。
[说明]
测试对每个结果核对 PCM 信号强度和频率位置。
:::

## 映射顺序和声道编号
<!-- sources: filter, local -->

映射表的每项指出来源文件和声道位置，列中前一项成为更靠前的输出声道。编号顺序应先根据来源流选择核对。把同一来源位置填写两次会复制该声道到两个位置。

:::example 同一个文件左右互换
[输入]
一条由 440 Hz、880 Hz 构成的立体声，映射为 1:2,1:1。
[结果]
输出第一声道 880 Hz，第二声道 440 Hz。
[说明]
每份音频仍在对应时间点，只有声道位置交换。
:::

## 不同来源的时长
<!-- sources: filter, local -->

重组可以从几个文件选择不同的声道，通常需要先重采样到统一采样率并统一时间起点。若某一声道先结束，可给它补静音，使其他较长声道仍然保留。

:::example 一长一短的重组
[输入]
一个 4 秒和一个 1 秒的单声道文件，依次作为输出两声道。
[结果]
约 4 秒立体声，第二声道在超过其原时长后为静音。
[说明]
这一处理用较长声道决定整体结束时刻。
:::

## 核对布局
<!-- sources: filter, local -->

环绕声按布局定义输出声道角色，多声道数量并不独立说明每个位置。分析差分线索时，可先将每个声道导出，再比较波形、频率或静音区间，来源按播放设备上的扬声器位置另行核对。

## 常见误区

- 选择第几音轨和选择轨内第几声道是两次不同操作。
- 拆其中一个声道会保留该声道本来的声音，混成单声道涉及两个或更多来源。
- 采样率较高的输出不会补出原输入缺少的频率信息。
