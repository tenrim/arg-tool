---
capabilityId: native:video-frames
title: 视频连续帧提取
topicGroup: video
summary: 理解按输出帧率采样、时间戳舍入与预估帧数，避免把帧序列当作原始全部帧。
aliases:
  - 连续抽帧
  - PNG 序列
  - fps 滤镜
sources:
  - id: filter
    title: FFmpeg Filters Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg-filters.html
    language: en
    kind: official-doc
    locator: fps、scale 滤镜
  - id: local
    title: 本地媒体处理入口
    publisher: 迷雾工具箱
    url: /video/commands.js
    language: zh-CN
    kind: implementation
    locator: frames 的预计数量、缩放与 PNG 命名
---

## 介绍
<!-- sources: filter, local -->

连续帧提取把一段视频变成按序编号的图像。FFmpeg 的 fps 滤镜以指定的输出帧率重新安排时间轴。输出因此既可能丢掉部分原帧，也可能在缺少相应时刻的画面时重复已有帧。

## 输入帧率与采样帧率
<!-- sources: filter -->

以每秒 1 帧采样比每秒 10 帧产生更稀疏的画面。低频抽帧适合快速浏览，有时会漏掉只出现很短时间的图案。可变帧率视频按时间戳采样，不能简单假定每个原帧之间相隔固定时长。

:::example 理想匀速素材的下采样
[输入]
4 秒视频，原每秒 10 个画面，等间隔输出 2 帧每秒。
[结果]
一般按 4×2 估计为 8 个输出画面。
[说明]
40 个输入画面不会全部写出。具体边界仍随时戳舍入。
:::

## 帧数估计和完成状态
<!-- sources: filter, local -->

规划先对选中时长乘采样率并向上取整，使用预估数量校验用户设置的上限。实际输出由时间戳、舍入和末尾规则决定。预估不合格时，工具报告原因，不把部分结果当作全部。

:::example 预估超过上限
[输入]
约 45 秒的素材，每秒采样 1 帧，最多 30 帧。
[结果]
报出预计数量超过上限。
[说明]
即便尾部舍入影响最终数量，预估也已超过所选限制。
:::

## 图像序列与源尺寸
<!-- sources: local, filter -->

输出文件的连续编号代表采样顺序。没有设置缩放时可以保留解码画面的宽度和高度。每张 PNG 都是可独立打开的采样结果，文件名不记录实际视频帧上的所有时间戳信息。

:::example 完整抽取测试序列
[输入]
约 45 秒的 64×48 测试片，每秒采 1 帧，保持源尺寸，上限足够。
[结果]
取得至少 45 张编号 PNG，首张为 64×48。
[说明]
以实际文件数和探测到的 PNG 尺寸核对。
:::

## 复查短时事件
<!-- sources: filter, local -->

需要定位极短事件时，可先用低频取帧缩小范围，再提高采样率检查对应片段。即便采样率超过原显示更新速度，也不能凭新增的重复画面获得原来不存在的细节。

## 常见误区

- 连续编号来自输出序列，不等于原视频帧号。
- 采样率升高可能增加重复帧。
- 自动估算数量不是从媒体元数据读出的原始帧总数。
