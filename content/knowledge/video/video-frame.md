---
capabilityId: native:video
title: 指定时刻视频帧
topicGroup: video
summary: 解释视频时间戳、准确寻址和单张 PNG，辨别目标时刻与帧序。
aliases:
  - 视频截图
  - FFmpeg 单帧
  - 视频时间戳
sources:
  - id: ff
    title: ffmpeg Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg.html
    language: en
    kind: official-doc
    locator: Main options 的 -ss、-frames 与准确寻址
  - id: local
    title: 本地媒体处理入口
    publisher: 迷雾工具箱
    url: /video/commands.js
    language: zh-CN
    kind: implementation
    locator: frame 分支选择第一视频轨并输出一张 PNG
  - id: png
    title: PNG Specification, Third Edition
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: PNG 数据流与 IHDR 宽高
---

## 介绍
<!-- sources: ff, local -->

指定时刻视频帧是从视频的显示时间轴选出一幅画面，解码后写为独立 PNG。视频中的画面不必是一个个完整储存的图片，很多帧的解码需要参考附近的已编码帧。

## 关键帧与显示时刻
<!-- sources: ff -->

读取文件时通常先寻址到接近目标的可解码位置，再从那里解码到目标附近。转码模式的准确寻址可以丢弃寻址点到目标之间的画面。帧的显示时刻用时间戳表示，文件存储的包顺序不总等同于显示顺序。

:::example 理想的百毫秒间隔
[输入]
从 0 秒起每 0.1 秒显示一帧的素材，目标时刻为 0.3 秒。
[结果]
目标对应从 0 算的第 3 帧，即第四幅画面。
[说明]
这是等间隔算例。可变帧率素材应读取实际时间戳。
:::

## 单张输出尺寸
<!-- sources: png, local -->

没有缩放时，输出 PNG 的像素宽高对应解码出的画面。PNG 独立保存像素及图像尺寸，通常无需原文件中先前的帧来显示。该图片也不会携带原来伴随画面的全部音轨和时间轴。

:::example 64×48 的截图
[输入]
测试片段的 0 秒，视频轨分辨率为 64×48。
[结果]
一张 64×48 的 PNG。
[说明]
用独立探测器读取输出为 PNG，尺寸与选中的视频流一致。
:::

## 越界与短片段
<!-- sources: ff, local -->

有效时间轴受素材长度限制。有明确时长时，起点到达或超过结束时刻会报错。若容器时长比实际视频轨长，能否取到该时刻还要看所选轨道是否有可解码画面。

:::example 时间超出素材
[输入]
约 45 秒的测试素材，目标起点 90 秒。
[结果]
提示起点超出媒体时长。
[说明]
90 秒落在可用素材之后，没有可从该位置产生的画面。
:::

## 帧位置的记录
<!-- sources: ff, local -->

逐帧线索可同时记录文件名、视频轨道、期待时刻及截图。不规则帧率下，单写第几帧会受解码或抽样方法影响。筛查短暂出现的图案时，连续帧更适合展示相邻变化。

## 常见误区

- 目标帧可以由关键帧之后的依赖帧解码得到。
- 分数秒和帧编号只有在时基、起点和采样规则明确时才可互换。
- PNG 截图不包含原视频的声音或其它帧。
