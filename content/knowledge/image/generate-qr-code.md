---
capabilityId: op:Generate%20QR%20Code
title: 生成二维码
topicGroup: image
summary: 把文字载荷写成 QR 码字与矩阵，按模块宽度、静区与输出格式生成图形。
aliases:
  - Generate QR Code
  - 二维码生成
  - QR 编码
sources:
  - id: version
    title: Information Capacity and Versions of QR Code
    publisher: DENSO WAVE
    url: https://www.qrcode.com/en/about/version.html
    language: en
    kind: author-spec
    locator: 版本 1～40、矩阵宽度和各类型数据容量
  - id: correction
    title: Error Correction Feature
    publisher: DENSO WAVE
    url: https://www.qrcode.com/en/about/error_correction.html
    language: en
    kind: author-spec
    locator: 纠错等级与代码字恢复率
  - id: margin
    title: Securing the Margin
    publisher: DENSO WAVE
    url: https://www.qrcode.com/en/howto/code.html
    language: en
    kind: author-spec
    locator: 空白边界为四个模块
  - id: engine
    title: CyberChef 11.5.0 图像模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Generate QR Code；PNG、SVG、EPS、PDF 的输出
---

## 介绍
<!-- sources: version, margin -->
QR 编码把载荷表示成黑白模块组成的方阵。用于定位和对齐的图案、数据及纠错信息都占据模块。矩阵外还留有静区，读码器可据此把符号和边上的文字或图案分开。

## 载荷、模式和版本
<!-- sources: version, correction -->
输入先按数字、字母数字或字节模式等解释，再组装数据码字。不同模式的编码密度不同。版本 1 的矩阵边长为 21，版本号每加 1，边长增加 4。数据更长或纠错占用更多时，编码往往要采用更大的版本。

## 图形尺寸
<!-- sources: version, margin, engine -->
若矩阵每边 n 个模块，四周各保留 q 个模块的边距，每个模块宽 s 像素，则光栅图宽高均为 (n＋2q)×s。常用静区为四个模块。SVG、PDF、EPS 也可表达同样的模块关系；它们的坐标和页面单位与 PNG 像素不同。

## 短载荷示例
<!-- sources: version, margin, engine -->
以下三项均可用版本 1，并保留四个模块的边距。回读结果显示载荷的文字或 UTF-8 字节。

:::example 简短字母载荷
[输入]
HELLO，PNG，每模块 5 像素，中等纠错
[结果]
145×145 像素，回读 HELLO
[说明]
(21＋2×4)×5=145。
:::

:::example 数字串
[输入]
1234567890，PNG，每模块 2 像素，低纠错
[结果]
58×58 像素，回读 1234567890
[说明]
相同矩阵的模块宽变为 2，结果像素边长为 (21＋8)×2。
:::

:::example UTF-8 载荷
[输入]
迷雾，PNG，每模块 4 像素，中等纠错
[结果]
116×116 像素，回读文字迷雾，字节 E8 BF B7 E9 9B BE
[说明]
两个汉字各使用三个 UTF-8 字节，不能按两个 ASCII 字节估算容量。
:::

## 生成到可读的条件
<!-- sources: margin, correction, engine -->
图中模块需要保有清楚的边界和静区。低分辨率导出再缩放，可能令基本模块变得不易采样。若需改变打印大小，矢量生成物可以重新选取目标物理尺寸或再渲染为光栅。

## 常见误区
- 模块数与像素数是两个尺度，留白也占输出像素。
- 提高纠错级别会占用容量，输入内容保持原样。
- 颜色和外观可定制时仍需要可检测的定位图案和边界。
