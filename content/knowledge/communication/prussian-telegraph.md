---
capabilityId: native:prussian
title: 普鲁士光学电报
topicGroup: communication
summary: 用三层六臂的姿态编码，按带点号的公布报码和原始德文码本识读。
aliases:
  - Prussian telegraph
  - 六臂电报
  - 光学报码
  - GC Wizard
sources:
  - id: museum
    title: 普鲁士光学电报原始翼臂
    publisher: 德国邮政与电信博物馆基金会
    url: https://onlinesammlung.museumsstiftung.de/detail/collection/e9728b10-c3af-45d8-8a6e-03c049f8307c
    language: de
    kind: official-doc
    locator: 原物 3.0.1807
  - id: network
    title: 普鲁士光学电报站屋图
    publisher: 德国邮政与电信博物馆基金会
    url: https://onlinesammlung.museumsstiftung.de/detail/collection/f79b8ba6-b26e-4e85-8a19-8859455a89fc
    language: de
    kind: official-doc
    locator: 柏林至科布伦茨光学中继站
  - id: book
    title: Prussian telegraph codebook
    publisher: GC Wizard
    url: https://github.com/GCWizard/GCWizard/blob/0ead04f8b626357e0e8fd649771c793f81ffbe68/lib/tools/science_and_technology/telegraphs/prussia_telegraph/logic/prussian_telegraph.dart
    language: en
    kind: author-spec
    locator: 固定码本、点号及站号文字
  - id: impl
    title: completion/prussian.js
    publisher: 迷雾工具箱
    url: /completion/prussian.js
    language: zh-CN
    kind: implementation
    locator: prussianSegments、prussianCode、prussianSVG
---

## 介绍
<!-- sources: museum, network -->

普鲁士光学电报用站塔上可动的臂表示信号，由相邻站观察并逐站转发。柏林至科布伦茨线路是这种通信的实例。

## 六条臂的层与位置
<!-- sources: museum, impl -->

姿态从下到上可写 a、b、c。每层右侧 1–3 依次为上斜、水平、下斜；左侧 4–6 依次为下斜、水平、上斜。一层同一侧的活动臂只能取一个方向。

:::example 检测同侧冲突
[输入]
a1a2
[结果]
拒绝
[说明]
同一根右臂不能同时上斜和水平。
:::

## 各层报码的组合
<!-- sources: book, impl -->

每层空置记 0。通常两个不同侧位置依约定合为带点号的数字；若左臂是位置 6，可与右臂用 7、8 或 9 合记。各层的结果依次连接。

:::example 接收信号姿态
[输入]
a1a5
[结果]
5.100
[说明]
下层为左水平及右上斜，中层和上层均空。
:::

:::example 三层各有动作
[输入]
a1a6b2c3
[结果]
723
[说明]
下层 1 和 6 合记 7，中层写 2，上层写 3。
:::

## 码本与站号
<!-- sources: book -->

固定码本按完整报码查询，原德文、点号、空值均保留。带站号的定义应沿用码本的占位符约定。

:::example 核对固定条目
[输入]
5.100
[结果]
EMPFANGSZEICHEN
[说明]
是码本标示的接收信号。
:::

## 从图到可比对记录
<!-- sources: impl, book, museum -->

观察照片时先确认正面及左右方向，从下至上记录三层。相反方向拍摄会造成镜像，合法图形也可能没有对应文本。绘图和码本查询可分别核对。

## 常见误区

- 句点是报码的一部分，应随数字保留。
- 六臂图形合法也可能没有登记含义。
- 已经存在的一条德文译义不保证反查只有一个报码。

