---
capabilityId: native:video-animation
title: GIF 与 APNG 逐帧分析
topicGroup: video
summary: 依原始顺序解析局部画面、合成规则和延时，用完整帧与精灵图复核动画。
aliases:
  - GIF 逐帧
  - APNG 帧
  - 精灵图
  - 动画处置
sources:
  - id: gif
    title: Graphics Interchange Format Version 89a
    publisher: CompuServe
    url: https://www.w3.org/Graphics/GIF/spec-gif89a.txt
    language: en
    kind: standard
    locator: Image Descriptor、Color Table、Graphic Control Extension
  - id: png
    title: Portable Network Graphics (PNG) Specification (Third Edition)
    publisher: W3C
    url: https://www.w3.org/TR/png-3/#animation
    language: en
    kind: standard
    locator: 动画控制、帧控制、混合和处置
  - id: local
    title: 动画解析和导出入口
    publisher: 迷雾工具箱
    url: /animation/core.js
    language: zh-CN
    kind: implementation
    locator: 帧时间、画布合成、原始块与完整导出
---

## 介绍
<!-- sources: gif, png -->

GIF 与 APNG 都能给出一组依时显示的图像。帧数据可能只描述局部矩形。解码时要先恢复这些像素，再结合前一帧留下的画布，得到这一帧实际显示的完整图像。

## 局部图与完整帧
<!-- sources: gif, png, local -->

GIF 可用颜色表索引描述颜色，指定的透明索引不会覆盖画布已有像素。APNG 可规定直接替换局部区域或按透明度叠加。每张局部图有自己的位置和尺寸，完整合成帧的尺寸则等于整张画布。

:::example 两像素更新
[输入]
画布 2×1，第一帧均为红。下一帧仅在 x=1 放入蓝色，不清理原画布。
[结果]
合成帧左红右蓝，原始局部帧只有一个蓝像素。
[说明]
左侧继承前帧的红，只有 x=1 发生变化。
:::

## 处置和继承
<!-- sources: gif, png, local -->

处置操作发生在本帧显示之后，可以保留当前结果、清理覆盖区域，或恢复绘制本帧以前的状态。GIF 的恢复背景与 APNG 把区域清透明的定义不同。APNG 第一动画帧把上一状态处置视为恢复背景。

:::example APNG 清除局部画面
[输入]
一个 APNG 帧以不透明像素覆盖局部，并把处置标为 BACKGROUND。
[结果]
当前合成画面先显示这个像素，随后该矩形清为透明。
[说明]
若下一帧不覆盖那里，其合成画面相应部位保持透明。
:::

## 帧延时和循环
<!-- sources: gif, png, local -->

GIF 帧延时单位为百分之一秒。APNG 使用分子、分母记录秒数，分母为零时按 100 解释。零延时可以保留于导出参数，预览为了可观察可能延长极短帧。GIF 的常见循环扩展给的是重复次数，APNG 的字段记的是总播放次数。两者用零表示无限。

:::example APNG 的分母为零
[输入]
delay_num=5，delay_den=0。
[结果]
显示时间为 0.05 秒，即 50 毫秒。
[说明]
按规范用 100 代入计算，并记录原分母字段 0。
:::

## 精灵图、切片和归档
<!-- sources: png, local -->

精灵图平铺完整合成帧，按左到右、上到下排列，剩余格可保持透明。普通 PNG 不保存播放时序，所以应另存帧参数。切片网格也可从单图读出布局，尺寸除不尽时不能静默丢弃边缘。原帧导出可保留 16 位样本，屏幕预览和合成结果使用的 RGBA8 属于另一路表示。APNG 若有独立默认图像，归档时单列原图，不把它计入动画帧。

:::example 整图切片数量
[输入]
96×64 图，按 32×32 均匀切片，无边距和格间距。
[结果]
3 列 2 行，共六片。
[说明]
宽和高分别整除单片尺寸。若宽改为 30，剩余 6 列无法组成完整切片。
:::

## 常见误区

- 局部矩形不一定就是播放器实际显示的完整帧。
- 逐帧视觉预览可能触发最短播放延时，不能替代原时序记录。
- 精灵图只保存空间位置，额外清单可以保存时间与循环信息。
