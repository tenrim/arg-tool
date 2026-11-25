---
capabilityId: native:fragments
title: 碎片拼接台
topicGroup: image
summary: 用独立图层管理碎片的几何变换、观察比例和前后遮盖关系。
aliases:
  - 拼图
  - 仿射变换
  - 碎片
  - 图层
sources:
  - id: konva
    title: Konva Overview
    publisher: Konva
    url: https://konvajs.org/docs/overview.html
    language: en
    kind: official-doc
    locator: Stage、Layer、拖动与变换
  - id: canvas
    title: HTML Living Standard — Canvas
    publisher: WHATWG
    url: https://html.spec.whatwg.org/multipage/canvas.html
    language: en
    kind: standard
    locator: Drawing images、Pixel manipulation
  - id: comp
    title: Compositing and Blending Level 1
    publisher: W3C
    url: https://www.w3.org/TR/compositing-1/
    language: en
    kind: standard
    locator: source-over、difference
  - id: geom
    title: round4/fragment-geometry.js
    publisher: 迷雾工具箱
    url: /round4/fragment-geometry.js
    language: zh-CN
    kind: implementation
    locator: zoomAt、pinchView
  - id: impl
    title: round4/fragments.js
    publisher: 迷雾工具箱
    url: /round4/fragments.js
    language: zh-CN
    kind: implementation
    locator: 中心保持、透明度与导出
---

## 介绍
<!-- sources: konva, impl -->

碎片拼接以独立对象保存各片图像。平移和旋转用于对齐断边、纹理或文字，图层次序处理重叠。画布视图放大用于观察小细节。

## 旋转中心与局部位置
<!-- sources: konva, impl -->

平面旋转改变对象的方向。绕中心调整时，局部坐标转换应保持原中心对应画布位置。碎片的边界可以越过另一片，而其原始像素仍保留。

:::example 绕中心转动
[输入]
屏幕坐标中，距中心向右 10 px 的点顺时针转 90°
[结果]
变为距中心向下 10 px
[说明]
中心自身不动。
:::

## 视图缩放的锚点
<!-- sources: geom, konva -->

若在屏幕点 p 缩放，原视图平移 t、比例 s，放大到 s′ 后，新平移为 p−(p−t)s′/s。这样锚点下的画布位置不随比例变化。

:::example 缩放保持锚点
[输入]
t=(20,10)，s=1，在 p=(100,50) 放大到 2
[结果]
t′=(−60,−30)
[说明]
横纵两个分量分别运算。
:::

:::example 双指居中
[输入]
比例 1，两指横向从 (0,0)、(100,0) 变为 (0,0)、(200,0)
[结果]
比例变为 2，平移仍为 (0,0)
[说明]
双指中点也向右移动 50，合并后抵消锚点位移。
:::

## 遮盖与出图
<!-- sources: comp, canvas, impl -->

重叠处由图层顺序和透明度共同决定。临时降低上层不透明度可看到两边是否吻合。导出平面图时将这些图层合成，图片不能再直接恢复被完全遮挡的样本。

## 拼接的交叉验证
<!-- sources: impl, konva -->

相似颜色的两条边可以偶然贴合。更可靠的拼接要同时比对多处交界、连续图案、文字行距和总轮廓，并保留原碎片供后续修改。

## 常见误区

- 放大画布和把碎片对象放大是两种独立操作。
- 重叠处看不见下层，不代表原下层数据已丢失。
- 一条看似匹配的边不足以确定全体碎片排列。

