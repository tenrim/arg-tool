---
capabilityId: native:score
title: 五线谱与节奏录入
topicGroup: audio
summary: 用统一的音高、时值和休止事件导出 ABC、时间表、乐谱及试听。
aliases:
  - ABC notation
  - 乐谱
  - 音符序列
  - 谱号
sources:
  - id: abc
    title: ABC Music Notation
    publisher: Paul Rosen／abcjs
    url: https://paulrosen.github.io/abcjs/overview/abc-notation.html
    language: en
    kind: official-doc
    locator: ABC 语法和绘制
  - id: score
    title: expansion/score-core.js
    publisher: 迷雾工具箱
    url: /expansion/score-core.js
    language: zh-CN
    kind: implementation
    locator: parseScore、staffPitch、scorePCM
  - id: midi
    title: Summary of MIDI 1.0 Messages
    publisher: MIDI Association
    url: https://midi.org/summary-of-midi-1-0-messages
    language: en
    kind: standard
    locator: Note On、Note Off、Program Change
  - id: notes
    title: Note names, MIDI numbers and frequencies
    publisher: John Smith／UNSW
    url: https://www.phys.unsw.edu.au/jw/notes.html
    language: en
    kind: author-spec
    locator: 音高、MIDI 编号及十二平均律的公式
---

## 介绍
<!-- sources: abc, score -->

记谱把音高和时值并列记录。当前事件模型是一条单声部音符序列，可用同一组事件绘谱、转换为 ABC、导出时间表与试听。

## 谱号、八度与升降
<!-- sources: abc, score, notes -->

相同线位在不同谱号下对应不同音名。升降号给出半音变化，八度决定音高跨越的频率范围。输入具体音符后，换谱号只更改书写位置。

:::example 第一线的两个读法
[输入]
谱线最下方第一线；高音谱号与低音谱号
[结果]
高音 E4；低音 G2
[说明]
同一位置随谱号解释。
:::

## 拍数与试听时间
<!-- sources: score -->

以四分音符为一拍，某事件秒数为拍数×60/BPM。休止占据时值，仍推进下一个音符的起点。

:::example 前两个音加休止
[输入]
C4:1 D4:0.5 R:0.5；120 BPM
[结果]
0–0.5 秒 C4，0.5–0.75 秒 D4，0.75–1 秒休止
[说明]
三个事件的总时值为两拍。
:::

## 拍号与 ABC
<!-- sources: abc, score -->

拍号的分母给出节拍字面单位。用 L:1/4 做 ABC 基准时，6/8 满小节合计 3 个四分音符时值。时值可用分数表示。

:::example 转换三个符号
[输入]
C4:1 D4:0.5 R:0.5，采用 L:1/4
[结果]
ABC 音符行为 =C1 =D1/2 z1/2
[说明]
等号是还原记号，z 是休止。
:::

## 导出的用途
<!-- sources: abc, score, midi -->

图形乐谱保留视读布局，ABC 和时间表可保留结构，PCM/WAV 是试听所需的样本。谱号、调号、速度和真实音高应一起保留，避免只靠截图或音色猜测原序列。

## 常见误区

- 看见同一条谱线不意味着两个谱号下是同一个音。
- 拍号并不自动规定每分钟拍数。
- 单声部试听无法从外部录音恢复完整复调谱。

