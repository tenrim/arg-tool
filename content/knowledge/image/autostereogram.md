---
capabilityId: native:image-stereo
title: 立体图隐藏轮廓
topicGroup: image
summary: 比较重复纹理的水平视差，并从局部匹配和差值中观察轮廓。
aliases:
  - Magic Eye
  - 立体图
  - 视差
  - 随机点立体图
sources:
  - id: tyler
    title: The Autostereogram
    publisher: C. Tyler、M. Clarke
    url: https://christophertyler.org/CWTyler/TylerPDFs/TylerClarkeAutosterSPIE1979.pdf
    language: en
    kind: author-spec
    locator: 单幅立体图的周期与视差
  - id: sirds
    title: Displaying 3D Images
    publisher: H. Thimbleby、S. Inglis、I. Witten
    url: https://harold.thimbleby.net/sirds/ieee3d.pdf
    language: en
    kind: author-spec
    locator: 重复约束与遮挡
  - id: vision
    title: 双眼立体视觉可塑性的实验研究
    publisher: 《心理学报》
    url: https://journal.psych.ac.cn/xlxb/CN/Y1992/V24/I2/32
    language: zh-CN
    kind: author-spec
    locator: 双眼视差实验
  - id: worker
    title: stereo-worker.js
    publisher: 迷雾工具箱
    url: /stereo-worker.js
    language: zh-CN
    kind: implementation
    locator: 水平平移与 difference 合成
  - id: comp
    title: Compositing and Blending Level 1
    publisher: W3C
    url: https://www.w3.org/TR/compositing-1/
    language: en
    kind: standard
    locator: source-over、difference
---

## 介绍
<!-- sources: tyler, vision -->

单幅随机点立体图把同一纹理重复画在水平不同位置。两眼可将相隔一定距离的点融合；近处与远处采用不同的对应间距，视系统据此感知轮廓。

## 比较同一行的两个位置
<!-- sources: tyler, worker, comp -->

对不透明灰度图，在重叠范围计算 D(x,y)=|I(x,y)−I(x−s,y)|，s 为水平平移量。当 s 接近背景周期，重复背景相消，非该周期的区域较易显出。

:::example 周期两个像素
[输入]
一行 0,255,0,255,0,255；s=2
[结果]
重叠的 4 个位置均为 0
[说明]
每个值等于右边相隔 2 的值。
:::

:::example 错一个像素
[输入]
同一行；s=1
[结果]
重叠的 5 个位置均为 255
[说明]
高对比度来自错配，而不是隐藏图形。
:::

## 自动估计与多个偏移
<!-- sources: worker, sirds -->

自动估计主要寻找重复背景的基准距离。局部对象、周期倍数和遮挡可产生其他相似间距。可以比较邻近几个偏移，寻找位置稳定的部分。

:::example 局部破坏周期
[输入]
一行 0,255,0,0,0,255；s=2
[结果]
重叠差值 0,255,0,255
[说明]
同一改动可同时影响它与左邻和右邻的比较。
:::

## 边界与遮挡
<!-- sources: worker, comp, sirds -->

平移后未被第二层覆盖的边缘没有像素对可比较。深度断层常有被遮挡的像素，对这些位置不能据一次差值直接确定真实深度。

## 解谜材料的复核
<!-- sources: tyler, sirds, worker -->

规则背景中显出的垂直边缘、文字和轮廓可作为候选。核对原图的重复间距、裁剪和是否被二次缩放，能判断差值中的形状来自图案还是处理误差。

## 常见误区

- 差值黑色只表明当前两点相同，不能直接赋予实际距离。
- 背景周期的倍数也可能得到大量匹配。
- 单一偏移不会恢复完整三维几何。

