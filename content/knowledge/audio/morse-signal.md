---
capabilityId: native:morse-audio
title: 摩斯音频
topicGroup: audio
summary: 用音调识别与时序分类读出点划，从同一计时规则合成可听信号。
aliases:
  - GGMorse
  - CW
  - 摩斯音频识别
  - Farnsworth
sources:
  - id: itu
    title: 国际摩斯电码 M.1677-1
    publisher: 国际电信联盟
    url: https://www.itu.int/rec/R-REC-M.1677-1-200910-I/en
    language: en
    kind: standard
    locator: 点划和间隔比例
  - id: gg
    title: GGMorse 固定源码
    publisher: Georgi Gerganov
    url: https://github.com/ggerganov/ggmorse/blob/7b4822a8cfdbb1addfe497f3ae8186f142a4ee79/src/ggmorse.cpp
    language: en
    kind: implementation
    locator: 重采样、音调检测、Goertzel、编码
  - id: impl
    title: expansion/morse-engine.js
    publisher: 迷雾工具箱
    url: /expansion/morse-engine.js
    language: zh-CN
    kind: implementation
    locator: decodeMorse、encodeMorse 和诊断
---

## 介绍
<!-- sources: itu, impl -->

摩斯音频用一段段窄带声音表示点和划，用静音划分符号、字母及单词。音调频率决定哪一段谱带是信号，点长决定时间尺度。

## 标准计时和单词速度
<!-- sources: itu, gg -->

标准点为一单位、划为三单位。字母内部间隔一单位，字母边界三单位，单词边界七单位。按 PARIS 一词的 50 单位约定，点长约为 1.2/WPM 秒。

:::example 计算点划
[输入]
20 WPM，标准比例
[结果]
点 0.06 秒，划 0.18 秒，两词之间 0.42 秒
[说明]
分别乘 1、3 和 7。
:::

## 从 PCM 取得音调
<!-- sources: gg, impl -->

GGMorse 将 PCM 转为内部 4 kHz 的信号，进行短时频率分析，再用 Goertzel 追踪目标频率。随后根据能量与间隔时序拟合点、划、分隔符。

:::example 独立音频样本
[输入]
8000 Hz 采样，700 Hz 音调，20 WPM 的 SOS TEST
[结果]
识别 SOS TEST
[说明]
样本由标准点划和时长独立合成。
:::

## Farnsworth 和自定义字符
<!-- sources: gg, impl -->

Farnsworth 将字符速度和间隔速度分开。具体实现的低速间隔也可作用于字符内的间隔，复算应对照音频。自定义映射仍由点划和合法字符构成。

:::example 同文比较速度
[输入]
同为 SOS TEST，字符速度保持 20；间隔速度 20 与 10
[结果]
间隔速度 10 的样本更长
[说明]
音调可始终固定为 650 Hz。
:::

## 诊断和噪声
<!-- sources: gg, impl -->

估计音调、阈值轨迹、时序代价和分析耗时反映算法在信号上看到的状态。解码器会添加静音冲洗延迟；阈值比例或时序代价并不是识别正确率。

## 常见误区

- 点与划的区别是响声时长，用的是同一个音调。
- 准确定位点划后仍可能读错字母边界。
- 自动音调、速度与阈值只是估计，应结合原音和时间位置复核。

