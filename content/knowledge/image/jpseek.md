---
capabilityId: native:forensics-jpseek
title: JPHide／JPSeek 隐写提取
topicGroup: image-stego
summary: 用原 JPEG 和相应口令恢复 JPHide 数据，保留完整或部分恢复状态。
aliases:
  - jpseek
  - AperiSolve
  - Aperi’Solve
sources:
  - id: src
    title: JPHide 与 JPSeek 固定源文件
    publisher: Allan Latham／h3xx 镜像
    url: https://github.com/h3xx/jphs/tree/33a11e1bad146f5e9c0d3fe6475812a1cedb9b7e
    language: en
    kind: implementation
    locator: jpseek.c、读取口令与部分恢复诊断
  - id: adapter
    title: AperiSolve 分析器源码：jpseek
    publisher: Zeecka / AperiSolve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/jpseek.py
    language: en
    kind: implementation
    locator: JPEG 读取与结果诊断
  - id: jpeg
    title: ITU-T T.81：Digital Compression and Coding of Continuous-tone Still Images
    publisher: ITU-T
    url: https://www.itu.int/rec/T-REC-T.81
    language: en
    kind: standard
    locator: DCT 变换、量化、熵编码和 JPEG 文件结构
---

## 介绍
<!-- sources: src, jpeg -->

JPHide 用 JPEG 装入数据，JPSeek 是相应的读取工具。读取与写入的版本和参数需要兼容。输入材料是原 JPEG，而不是网页预览图或截图。

## 口令与还原路径
<!-- sources: src, adapter -->

JPSeek 读取口令以重建对 JPEG 的处理顺序并恢复数据。若 JPEG 系数或读取顺序发生改变，结果可能不完整，即使输入口令正确。

:::example 复核已知材料
[输入]
jpseek.jpg；公开样例口令 test
[结果]
jpseek.out，24 字节
[说明]
由同一套 JPHide 跨到 JPSeek，恢复原样例。
:::

## 部分恢复的标记
<!-- sources: src, adapter -->

工具可能提示 File not completely recovered。这个状态可带着已读的片段返回，不能统一解释成完整还原。若已有原始哈希或预期长度，可进一步比较损失范围。

:::example 读诊断状态
[输入]
报告显示 File not completely recovered
[结果]
该结果需要作为部分恢复处理
[说明]
即使存在输出路径，也要将诊断与输出文件一并保留。
:::

## 按原始字节验证文件
<!-- sources: adapter, src -->

提取物的后缀只说明输出容器名，具体内容仍可用文件识别或字节查看。控制字节可能从视觉预览中消失，但属于已恢复的文件。

:::example 用末端四字节确认
[输入]
对完整样例 jpseek.out 查看末端
[结果]
00 FF 80 0A
[说明]
今后重新下载或解包时可以用末端与总长度做判断。
:::

## JPEG 重新保存的影响
<!-- sources: jpeg, src -->

即便显示尺寸和颜色相同，转码也会改变系数值或系数顺序。更换另一个隐写提取器不能自动修补这种变化。应保留收到的原文件、所用口令线索和报告字节。

## 常见误区

- JPHide 和 JPSeek 是相配的两端。
- 出现输出文件不代表原载荷被完全恢复。
- 改 JPEG 后缀不会改变压缩系数或隐写种类。

