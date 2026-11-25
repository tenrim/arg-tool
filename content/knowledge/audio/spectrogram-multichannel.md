---
capabilityId: native:forensics-spectrogram
title: 多声道音频频谱图
topicGroup: audio
summary: 对各声道分别做短时傅里叶分析，展示每轨的频率成分随时间变化，并可另看混合的幅度波形。
aliases:
  - 多声道频谱
  - 音频声谱图
  - 分声道 STFT
  - 立体声频谱
sources:
  - id: stft
    title: SciPy ShortTimeFFT
    publisher: SciPy 项目
    url: https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.ShortTimeFFT.html
    language: en
    kind: official-doc
    locator: 时间步长、窗长、频率间隔与单边频谱
  - id: ffmpeg
    title: FFmpeg Filters Documentation — showspectrumpic
    publisher: FFmpeg 项目
    url: https://ffmpeg.org/ffmpeg-filters.html#showspectrumpic
    language: en
    kind: official-doc
    locator: 独立及合并声道、色阶与坐标展示
  - id: engine
    title: Aperi’Solve 声谱图分析器固定源码
    publisher: Aperi’Solve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/spectrogram.py
    language: en
    kind: implementation
    locator: _compute_stft、逐声道频谱与单轨混合波形
---

## 介绍
<!-- sources: stft, ffmpeg, engine -->
声谱图将一段时间里的频率变化画成二维图。横轴是时间，纵轴是频率，色阶显示各位置的能量或幅值强弱。多声道素材分别作图时，可以追踪仅出现在某一轨的成分。

## 分窗与声道
<!-- sources: stft, engine -->
声道分离需要保留每个采样时刻的轨道顺序。每条轨道分别用窗口截取信号，再经过快速傅里叶变换形成一列。窗口逐步滑动得到连续的时间视图。若一个音高只在右轨出现，左轨的图中不一定会有同样的亮带。

:::example 左右声道具有不同频率
[输入]
采样率 16000 Hz，左轨连续正弦 437.5 Hz，右轨连续正弦 875 Hz。FFT 长度 2048。
[结果]
左图的峰位于第 56 个频率格，右图位于第 112 个，格距 7.8125 Hz。
[说明]
格号从 0 开始。16000 除以 2048 得 7.8125，两轨分别乘回 56 和 112。
:::

## 窗口和时间步长
<!-- sources: stft, engine -->
窗口长度决定一列复用的样本范围，步长决定相邻窗口起点的间隔。相邻分析窗可以重叠。例如窗长 2048、步长 512 时，两个相邻窗口有四分之三的样本位置重叠。

:::example 将样本步长换算为秒
[输入]
采样率 16000 Hz、总样本数 8192，窗长 2048、步长 512。
[结果]
连续完整窗口共 13 个，相邻窗口起点相隔 0.032 秒。
[说明]
最后一个窗口从样本 6144 开始，之后刚好有 2048 个样本。从 0 到 6144 每隔 512 启动一个窗口。512÷16000 等于 0.032。
:::

## 按轨归一化和颜色
<!-- sources: ffmpeg, engine -->
有的频谱图分别以各自最强值为参照，再将幅值换算成分贝并映射至同一色阶。这样有助于看出弱声道里各频率的相对强弱，但跨轨比较绝对音量时，须先确认两幅图是否使用了相同参照。

## 合成波形与分轨频谱
<!-- sources: stft, engine -->
单条波形可由各声道同时刻的样本平均后得到。若两声道同频却反相，混合幅度可能减小，单独各轨依然有信号。分析时把混合波形、分轨频谱与试听结合，能区分混合导致的消失。

:::example 反相轨道在混合时抵消
[输入]
两轨均为 437.5 Hz、幅值相同的正弦，右轨取左轨波形的相反数。
[结果]
等权混合后的波形为零，两张分轨频谱仍都在 437.5 Hz 附近出现峰值。
[说明]
同一时刻的样本为 x 和 −x，平均值为零。每条轨道作为独立序列时都有相应的周期。
:::

## 常见误区
- 声道单图的颜色强弱不能在未核对参照时当作跨轨音量比。
- 采样率和分析窗长度影响频率格距，图像尺寸只影响显示。
- 混合波形相抵消时，各声道仍可能存有明显的音调。
