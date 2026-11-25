---
capabilityId: native:audio-sstv
title: SSTV
topicGroup: audio
summary: 用相应的慢扫描制式从像素音调、同步段和最初的 VIS 复原静止图片。
aliases:
  - 慢扫描电视
  - Slow Scan Television
  - Martin
  - Scottie
  - Robot
  - VIS
sources:
  - id: crac
    title: CRAC SSTV 图像传送演练规则
    publisher: 中国无线电协会业余无线电分会
    url: https://www.crac.org.cn/?p=1088
    language: zh-CN
    kind: official-doc
    locator: 业余无线电的 SSTV 制式与实践
  - id: batc
    title: Slow Scan Television Explained
    publisher: 英国业余电视俱乐部
    url: https://batc.org.uk/wp-content/uploads/Slow-Scan-Television-Explained.pdf
    language: en
    kind: author-spec
    locator: Modes and Systems，印刷页 15–22
  - id: spec
    title: vendor/hunt/sstv/spec.js
    publisher: 迷雾工具箱
    url: /vendor/hunt/sstv/spec.js
    language: zh-CN
    kind: implementation
    locator: VIS_MAP 与各模式行时序
---

## 介绍
<!-- sources: crac, batc -->

SSTV 即慢扫描电视，向接收端传递静止图片。它把扫描线和颜色分量串行排进音频，不同音调描述亮度、色差或控制段。接收端需要同时辨别频率与时刻。

## 像素音调和控制音
<!-- sources: batc, spec -->

常见模拟模式的像素分量以 1500–2300 Hz 表示，1200 Hz 用于行同步。对线性视频分量，可以用 q=(f−1500)/800 计算归一化强度。

:::example 分量中点
[输入]
视频通道的频率为 1900 Hz
[结果]
q=0.5
[说明]
换成八位约为 128。
:::

## VIS 标识
<!-- sources: batc, spec -->

导入头有同步和领导音。VIS 按 7 个数据位表示模式，再带奇偶校验位；不同二进制位使用约 1100 Hz 和 1300 Hz。选错模式会改变每行像素时刻甚至通道顺序。

:::example 两个同名系列模式
[输入]
VIS 数据值 44 和 40
[结果]
Martin 1 与 Martin 2
[说明]
Martin 1 的格式为 320×256，依 G、B、R 扫描。
:::

## 时序和扫描长度
<!-- sources: spec, batc -->

以 Martin 1 为例，一行同步脉冲 4.862 ms、起始过渡 0.572 ms，三个分量各有 146.432 ms 扫描和 0.572 ms 分隔。

:::example 累加行时间
[输入]
4.862+0.572+3×(146.432+0.572) ms
[结果]
一行为 446.446 ms；256 行约 114.290 s
[说明]
不含开始的模式头。
:::

## 制式差异和录音判读
<!-- sources: spec, batc -->

本实现的模式表列有 Robot 36/72、Martin 1/2、Scottie 1/2 和 Scottie DX。Robot 的亮度和色差时序不同于 Martin。检查截断录音时应保留同步证据；表中没有 PD120。

## 常见误区

- 声谱图是分析音频的视图，不会依 SSTV 扫描时序重新画像。
- 录音变速会同时改动音调与扫描时间。
- VIS 命中仍须核对行同步，不能独立证明图像恢复正确。

