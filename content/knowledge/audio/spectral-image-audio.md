---
capabilityId: native:spectral-images
title: 图片与声音互转
topicGroup: audio
summary: 区分按图合成声谱与用图片保存真实声音的短时傅里叶数据。
aliases:
  - SpectroTrace
  - Spectrum
  - 幅度
  - 相位
  - 声谱图
sources:
  - id: trace
    title: j-about/SpectroTrace
    publisher: j-about
    url: https://github.com/j-about/SpectroTrace
    language: en
    kind: author-spec
    locator: 频率映射、振幅和相位推进
  - id: spect
    title: HK-SHAO/atools
    publisher: HK-SHAO
    url: https://github.com/HK-SHAO/atools
    language: en
    kind: author-spec
    locator: Compact / Exact、重建与审计
  - id: tracejs
    title: vendor/fun-tools/spectrotrace.js
    publisher: 迷雾工具箱
    url: /vendor/fun-tools/spectrotrace.js
    language: zh-CN
    kind: implementation
    locator: generatePCM
  - id: engine
    title: vendor/fun-tools/spectrum-worker.js
    publisher: 迷雾工具箱
    url: /vendor/fun-tools/spectrum-worker.js
    language: zh-CN
    kind: implementation
    locator: 短时变换和编解码消息
  - id: png
    title: PNG 规范
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 像素表示与可逆压缩
---

## 介绍
<!-- sources: trace, spect -->

声谱图横向表示时间，纵向表示频率，颜色或亮度表现强度。把图画成声音的目标频谱，和把真实声音的分析结果存成图片，解决的是两个不同问题。

## 加法合成的声音
<!-- sources: trace, tracejs -->

对每个图像行赋予频率 f。以随时间变化的亮度控制振幅 A(t)，叠加各行的 A(t)sin(2πft+φ)。图像先转成灰阶，平滑和反相会改变振幅包络。

:::example 无亮度的输入
[输入]
纯黑灰度图；关闭反相；1 秒、8000 Hz
[结果]
8000 个零值样本
[说明]
没有频率行获得非零振幅。
:::

## 纵轴选用哪一种刻度
<!-- sources: trace, tracejs -->

线性映射按频率差均分行距；对数映射按频率比均分。给定相同最高和最低频率时，中间行可以对应不同声音。

:::example 三行的频率
[输入]
从上到下覆盖 1600 至 100 Hz
[结果]
线性 1600、850、100；对数 1600、400、100
[说明]
线性中点是算术平均，对数中点是几何平均。
:::

## 短时傅里叶变换
<!-- sources: spect, engine -->

Spectrum 先把输入变为单声道，按窗口分析。给定采样率 Fₛ 和长 N，频率格距为 Fₛ/N；输入向前推进 N/4 个样本形成下一帧。

:::example 读频率格与帧移
[输入]
Fₛ=16000 Hz，N=1024
[结果]
格距 15.625 Hz，帧移 256 样本，即 16 ms
[说明]
频率格距与相邻分析时刻是两种量。
:::

## 幅度、相位和图片变形
<!-- sources: spect, engine, png -->

Compact 存量化幅度，缺少相位会用迭代估计；Exact 另存相位，但量化误差仍存在。PNG 可带恢复元数据，截图、JPEG 或缩放会破坏原来参数和像素。

## 比较恢复质量
<!-- sources: spect, engine -->

重建可以比较信噪比、相关性和对数谱距离。它们分别考察不同误差，不能用一项概括全部听感。用原声、原 PNG 以及变化后的图片对照，便于定位变形来源。

## 常见误区

- 一条亮线对应持续窄带信号，但不能单独确定声波相位。
- Exact 表示增加相位信息，不保证逐样本无损。
- 大于采样率一半的目标频率无法按原频率表示。

