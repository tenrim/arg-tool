---
capabilityId: native:audio-music
title: 音高与乐理
topicGroup: audio
summary: 用十二平均律连接频率、音名与 MIDI 编号，按音程理解和弦和移调。
aliases:
  - 十二平均律
  - 基频
  - 音程
  - 和弦
  - Tonal
sources:
  - id: notes
    title: Note names, MIDI numbers and frequencies
    publisher: John Smith／UNSW
    url: https://www.phys.unsw.edu.au/jw/notes.html
    language: en
    kind: author-spec
    locator: 音高、MIDI 编号及十二平均律的公式
  - id: iso
    title: ISO 16:1975 标准音高
    publisher: ISO
    url: https://www.iso.org/standard/3601.html
    language: en
    kind: standard
    locator: A 的 440 Hz 基准
  - id: engine
    title: round2/music-engine.js
    publisher: 迷雾工具箱
    url: /round2/music-engine.js
    language: zh-CN
    kind: implementation
    locator: detectPitch 与 theory
  - id: tonal
    title: vendor/round2/tonal-full.js
    publisher: 迷雾工具箱
    url: /vendor/round2/tonal-full.js
    language: zh-CN
    kind: implementation
    locator: 音名、和弦、音阶和音程
---

## 介绍
<!-- sources: notes, iso -->

音高与声音的周期有关。十二平均律把八度分为 12 个固定频率比的半音。音名、升降和八度用于记谱，MIDI 用整数表示音高位置。

## 编号和频率
<!-- sources: notes, iso -->

A4 取 440 Hz 为参考时，编号 n 的频率 f=440×2^((n−69)/12)。倒算 n=69+12log₂(f/440)，找最近音名时再对编号取整。

:::example 相隔一八度
[输入]
MIDI 69 和 81
[结果]
A4=440 Hz，A5=880 Hz
[说明]
编号差 12，频率翻倍。
:::

:::example 中央 C
[输入]
MIDI 60
[结果]
C4≈261.626 Hz
[说明]
距参考 A4 低 9 个半音。
:::

## 识别声音的基频
<!-- sources: engine -->

音高识别根据波形估计周期。多个谐波可同时存在；如果音乐中有和弦、噪声或多种音源，单音估计可能将某个谐波或混合周期解释成音高。

## 音阶、和弦和移调
<!-- sources: notes, tonal, engine -->

音程描述音级跨度及半音数。等音的频率可相同，记谱仍依调性采用不同拼写。移调将音符按同一半音距离整体搬动。

:::example 纯五度
[输入]
C4 上移 7 个半音
[结果]
G4，纯五度 5P
[说明]
C 到 G 共跨五个音名级，距离七半音。
:::

:::example 大三和弦
[输入]
和弦记号 C
[结果]
C、E、G
[说明]
相对根音为 0、4、7 个半音。
:::

## 听辨候选的复核
<!-- sources: engine, tonal -->

可先从稳定片段确定音高，再比较相邻音程、八度和速度。和弦检测给出的候选还依赖音的集合和低音，短片段可能不能确定调式。

## 常见误区

- 声音最大谱峰不一定是基频。
- 同一频率的等音可以按不同音名拼写。
- 频率参考改变时，相同编号换算出的绝对 Hz 也会改变。

