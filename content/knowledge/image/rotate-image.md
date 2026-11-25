---
capabilityId: op:Rotate%20Image
title: 旋转图片
topicGroup: image
summary: 图片旋转绕轴改变像素方向。旋转角、旋转中心及输出边界决定结果的坐标和画布大小。
aliases:
  - Rotate Image
  - 图片旋转
  - 像素转向
  - 坐标变换
sources:
  - id: matrix
    title: CSS Transforms Module Level 1
    publisher: W3C
    url: https://www.w3.org/TR/css-transforms-1/#transform-functions
    language: en
    kind: standard
    locator: 平移、缩放、旋转功能与矩阵表示
  - id: pillow
    title: Pillow — Image module
    publisher: Pillow 项目
    url: https://pillow.readthedocs.io/en/stable/reference/Image.html#PIL.Image.Image.rotate
    language: en
    kind: official-doc
    locator: 逆时针角度、扩大画布与采样
  - id: engine
    title: CyberChef 图像模块（固定实现）
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Rotate Image，旋转方向、输出画布与像素重排
---

## 介绍
<!-- sources: matrix, pillow -->
旋转将图中各点绕指定中心转过一定角度。图像坐标通常以左上为原点，纵坐标向下。不同环境的正角方向和输出策略可以不同，复核时先记录使用的定义。

## 直角旋转重排网格
<!-- sources: pillow, engine -->
90° 的旋转可以把输入行变成输出列，宽和高互换。在逆时针方向读时，原图最右列成为输出首行。原图中的相邻像素在旋转后仍相邻，只是排列方向发生变化。

:::example 逆时针转 90°
[输入]
4×2 图，第一行红绿蓝黄，第二行青品红黑白。角度 90°。
[结果]
2×4 图，逐行为黄白、蓝黑、绿品红、红青。
[说明]
这里正 90° 表示逆时针。原来的最右一列由上到下是黄、白，成为结果首行。
:::

## 角度符号及 180°
<!-- sources: matrix, pillow, engine -->
在采用逆时针为正的表示里，负 90° 就按顺时针旋转。半圈旋转会同时将原行序和列序倒过来，输出宽和高仍与原图相同。

:::example 转半圈
[输入]
同一 4×2 图转 180°。
[结果]
第一行为白黑品红青，第二行为黄蓝绿红，尺寸仍为 4×2。
[说明]
原来的右下角白色移到左上角。原图的行、列顺序都翻转。
:::

## 非直角与边缘
<!-- sources: matrix, pillow, engine -->
旋转非整直角时，原始网格通常无法完全吻合目标网格。处理器须确定怎样计算输出边界，以及如何从原图取得各像素。扩大画布可容纳倾斜后的内容，并可能留下透明边缘。

:::example 45° 旋转的画布
[输入]
同一 4×2 图转 45°。
[结果]
此例输出 6×6，周围带未被原图覆盖的像素区域。
[说明]
倾斜后的原矩形需要新的像素包围区域，具体尺寸由旋转实现的边界取整决定。
:::

## 旋转后的坐标记录
<!-- sources: matrix, engine -->
需要用新图标注原坐标时，应同时记录旋转方向、参考中心和画布位移。直接从旋转图上读到的行列属于新布局。对于只想阅读倒转文字的操作，也应保存未变换的资料。

## 常见误区
- 同样写 90° 时，各工具以不同方向为正的约定可能不同。
- 转非直角可以增加画布范围，并在边缘引入新像素。
- 输出图能看到原内容不意味着它的原始坐标仍有效。
