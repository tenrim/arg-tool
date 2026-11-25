---
capabilityId: native:audio-play
title: 乐器弹奏与 MIDI
topicGroup: audio
summary: 理解按键、音色、拍数、力度及 MIDI 事件和可听声波的区别。
aliases:
  - 拍数
  - BPM
  - MIDI
  - Note On
  - Note Off
sources:
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
  - id: impl
    title: round1/instruments.js
    publisher: 迷雾工具箱
    url: /round1/instruments.js
    language: zh-CN
    kind: implementation
    locator: parseMelody、排程与音色选择
  - id: audio
    title: Web Audio API
    publisher: W3C
    url: https://www.w3.org/TR/webaudio/
    language: en
    kind: standard
    locator: 振荡器、增益和事件排程
---

## 介绍
<!-- sources: midi, audio -->

乐器弹奏可把时间安排和发声分开。乐器的键确定音高，旋律记录音符和时值。MIDI 使用事件描述演奏，具体音色由播放端生成。

## 音符和拍数
<!-- sources: impl, notes -->

旋律可以用 C4:2 表示两个拍单位的中央 C，R:1 表示一拍休止。BPM 是每分钟拍数，每拍为 60/BPM 秒。

:::example 把三项换算为时间
[输入]
C4:2 R:1 F#4:0.5，120 BPM
[结果]
C4 1 秒，休止 0.5 秒，F#4 0.25 秒；共 1.75 秒
[说明]
半拍为 0.25 秒。
:::

## MIDI 字段
<!-- sources: midi -->

Note On 至少指明通道、音符编号与力度，Note Off 结束该音符。一份 MIDI 也可记录调制、音色变化和时间事件。数据字节的数值依据消息类别解释。

:::example 解析一个 Note On
[输入]
十六进制 90 3C 40
[结果]
第 1 通道，音符 60，力度 64
[说明]
状态低四位为 0；3C 和 40 是十进制 60 和 64。
:::

## 音色与记录的边界
<!-- sources: audio, impl, midi -->

波形合成可调整振荡、包络和增益。更换音色能改变听感，但保留音符及拍数时，旋律的音高和节奏不变。声波采样不是标准 MIDI 音符事件。

:::example 同旋律不同速度
[输入]
C4:2 R:1，先用 120 BPM，再用 60 BPM
[结果]
全长由 1.5 秒变成 3 秒
[说明]
BPM 减半，每拍时间翻倍。
:::

## 解谜中的音符核对
<!-- sources: midi, impl -->

可分别核对音高、绝对开始时间和轨道事件。若同时有两条轨或力度变化，不能由文件总字节数推断节拍；试听与事件表应一起看。

## 常见误区

- 力度 64 是控制值，不代表固定 64 dB。
- 休止有时长但不会新增音高事件。
- MIDI 改用另一种音源后依旧可以是同一份演奏事件。

