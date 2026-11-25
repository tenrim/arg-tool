---
capabilityId: native:audio-spectrum
title: 声音频谱与线索分析
topicGroup: audio
summary: 短时频谱将音频按窗分开，把所选声道和频率范围显示为随时间展开的图。
aliases:
  - 频谱
  - 声谱图
  - 频率
  - 傅里叶
  - FFT
sources:
  - id: stft
    title: SciPy ShortTimeFFT
    publisher: SciPy 项目
    url: https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.ShortTimeFFT.html
    language: en
    kind: official-doc
    locator: 时间步长、窗长、频率间隔与单边频谱
  - id: web
    title: Web Audio API
    publisher: W3C
    url: https://www.w3.org/TR/2021/REC-webaudio-20210617/#fft-windowing-and-smoothing-over-time
    language: en
    kind: standard
    locator: FFT 窗、采样率和频率表示
  - id: engine
    title: 本地频谱算法
    publisher: 迷雾工具箱
    url: /media.js
    language: zh-CN
    kind: implementation
    locator: spectrogram 的窗函数、频率映射和强度显示
  - id: ui
    title: 音频工作区的输入与频谱执行
    publisher: 迷雾工具箱
    url: /media-workspace/audio.js
    language: zh-CN
    kind: implementation
    locator: currentChannel、倒放和频谱结果
---

## 介绍
<!-- sources: stft, web, engine -->
声谱图以时间和频率为两个坐标，把信号的幅值画成颜色。持续的纯音通常形成一条水平亮带，开始或结束时亮带出现或消失。多段由不同音高构成的材料，可以按频段和时间顺序观察。

## 分窗和频率分辨率
<!-- sources: stft, web, engine -->
频谱按短窗口计算。以采样率 Fs、FFT 长度 N 计算，频率格距为 Fs÷N。当采样率不变时，较长的窗口通常能分开更接近的频率，但会用更长的时间范围表示突发信号。Hann 等窗用于减小截断窗口造成的频谱泄漏。

:::example 纯音在频率格中的位置
[输入]
以 16000 Hz 采样，FFT 长度 2048，生成连续 437.5 Hz 单声道正弦。显示范围 0 至 2000 Hz。
[结果]
主亮带对应第 56 个频率格。
[说明]
格距为 16000÷2048=7.8125 Hz。437.5÷7.8125=56。
:::

## 频率范围和图像读数
<!-- sources: stft, web, engine -->
常规实信号的单边频谱只需到采样率的一半。把显示频率范围缩到某一段，可在图上细看该频带。显示多少行与 FFT 有多少格是两回事，一条频率格可对应屏幕上的一行或多行。

:::example 从采样率推出显示上限
[输入]
素材的采样率为 16000 Hz，尝试设置显示范围 0 至 9000 Hz。
[结果]
这一上限不在可显示范围内，最高可设到 8000 Hz。
[说明]
16000÷2=8000。改变图形高度不会增大原采样能够表示的频率范围。
:::

## 声道、方向和时间定位
<!-- sources: stft, engine, ui -->
音频工作区可按当前选定的声道分析，并按正放或倒放的顺序使用样本。倒放会改变不同频率事件在时间轴上的先后。选择其他声道前后也可观察亮带是否实际属于各自轨道。

:::example 两段纯音倒换时间顺序
[输入]
前半段为 437.5 Hz，后半段为 875 Hz 的合成音频。
[结果]
正放时低频亮带在前，高频在后。倒放时高频在前，低频在后。
[说明]
时间次序反向。两段的基本频率仍保持各自的位置。
:::

## 按时间和频带还原线索
<!-- sources: stft, engine, ui -->
查看线索时可先找到目标时段及其频带，再用对应的声音和原始数据复核。周期、谐波、窗间重叠及声道混合都能影响图形。绘图结果是频率随时间的观察表示，若频率外观相近还需要其它证据定性。

## 常见误区
- 最高可解释频率受采样率限制，放大图像并不会产生新的频率信息。
- 最亮的峰可能是基频，也可能是其他谐波或窄带干扰。
- 正放和倒放的时间顺序不同，引用时间位置前宜记录分析方向。
