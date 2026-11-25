---
capabilityId: native:video-reverse
title: 视频片段倒放
topicGroup: video
summary: 解释画面与音频倒序的处理层次、时长和缓存开销。
aliases:
  - 视频倒放
  - 音轨倒放
  - reverse 与 areverse
sources:
  - id: filter
    title: FFmpeg Filters Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg-filters.html
    language: en
    kind: official-doc
    locator: reverse、areverse 的输入缓存和帧样本倒序
  - id: local
    title: 本地媒体处理入口
    publisher: 迷雾工具箱
    url: /video/commands.js
    language: zh-CN
    kind: implementation
    locator: reverse 分支的先取片段、视频滤镜及可选音轨
---

## 介绍
<!-- sources: filter, local -->

片段倒放让最后的画面先出现，把开头置于结尾。压缩视频通常需要依赖其他帧来解码，因此倒放先获得画面再改变其输出顺序。输出时间仍从前向后递增。

## 视频帧的反向顺序
<!-- sources: filter -->

将一组正常显示顺序的画面缓存后，从后往前读出。对等间隔画面，逆序保持画面数量和原时间间隔。若需要分析原始可变帧率时间线，应分开保留源时间戳和倒放成片。

:::example 四幅等距画面
[输入]
显示次序 A、B、C、D 的四帧，等间隔。
[结果]
D、C、B、A。
[说明]
第二张输出是原来的第三张，每张图像的左右位置保持不变。
:::

## 声音也有独立的次序
<!-- sources: filter, local -->

反向音频需要逆序样本，相当于沿时间轴回放。只启用反向画面不会自动改动音频。如果导出不带声音，输出可以只有一个视频轨道。反向声音的听感也不同于把声道互换。

:::example 两个音轨随画面倒放
[输入]
具有两条音轨的 64×48 测试片，选取两秒并保留反向音频。
[结果]
输出一条 64×48 视频轨和两条音轨。
[说明]
固定流程对所选视频轨用 reverse，对音轨用 areverse，然后重编码。
:::

## 取样区段与缓存
<!-- sources: filter, local -->

reverse 与 areverse 需要缓存整个输入片段，等待末尾数据才能输出开头。先限制区段可以缩小缓存与计算范围。较长的媒体即使压缩文件很小，逐帧解码后的工作数据也可能很大。

:::example 简化的帧数与缓存
[输入]
5 秒、每秒 10 帧的固定帧率片段，每帧的未压缩数据按 1 MiB 估算。
[结果]
约 50 帧，对应约 50 MiB 的画面数据。
[说明]
实际运算另有内部像素格式、音频和编码缓冲的成本。
:::

## 线索出现的位置
<!-- sources: filter, local -->

若等速片段有 n 幅画面，原序号 k 从零开始，则新序号为 n−1−k。线索与画面之间可按此关系核对，输出文件与原片段的起止位置仍应分别记录。

## 常见误区

- 倒放交换时间顺序，翻转改变单帧的空间位置。
- 声音只有在选择并处理音轨时才反向。
- 压缩输入文件的字节数不能代表倒放所需内存。
