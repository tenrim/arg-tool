---
capabilityId: op:Split%20Colour%20Channels
title: 分离颜色通道
topicGroup: image-stego
summary: RGB 分离让红、绿和蓝的空间强度各自成图，以便独立观察它们在图像中的分布。
aliases:
  - Split Colour Channels
  - RGB 分量
  - 颜色分离
  - 通道图
sources:
  - id: png
    title: Portable Network Graphics (PNG) Specification (Third Edition)
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 第 4、6、13 节，样本位深、扫描线、Alpha
  - id: canvas
    title: HTML Living Standard — The canvas element
    publisher: WHATWG
    url: https://html.spec.whatwg.org/multipage/canvas.html#pixel-manipulation
    language: en
    kind: standard
    locator: ImageData、通道值、像素位置与颜色空间
  - id: engine
    title: CyberChef 图像模块（固定实现）
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Split Colour Channels，分量过滤、透明度与各通道输出
---

## 介绍
<!-- sources: png, canvas -->
一个 RGB 彩色像素由红、绿、蓝三个分量组成。把每种分量单独保留下来，就可比较它们在各位置上的强度，而不用凭完整合成颜色反推。Alpha 通道在需要时独立表达透明度。

## 选择一个通道形成图像
<!-- sources: png, engine -->
一种通道图做法是保留目标分量，把另外两种颜色置零。红通道图以红色亮度显示该分量，绿、蓝同理。有的图像软件会用灰度表现强度，数值含义一致，颜色画法须分别识别。

:::example 一个像素在三幅图中的值
[输入]
原像素 R=129、G=42、B=10、A=255。
[结果]
红图为 (129,0,0,255)，绿图为 (0,42,0,255)，蓝图为 (0,0,10,255)。
[说明]
每幅图只保留一种颜色，位置和不透明度延用同一个输入像素。
:::

## 光强分量与不透明度
<!-- sources: png, canvas, engine -->
不透明度用于把像素与背景组合，影响同样的颜色样本最后会有多亮。通道图若保留输入 Alpha，一个满强度分量仍可半透明。要读精确样本时，应区分图层颜色与显示背景混合后的值。

:::example 半透明红色与全透明红色
[输入]
三个原样本的 RGB 都是 (255,0,0)，Alpha 依次为 255、128、0。
[结果]
红图依次呈现不透明红色、半透明红色、全透明。
[说明]
保留了三个 Alpha 的区别。全透明像素的显示不提供可见红色。
:::

## 空间位置保持一致
<!-- sources: canvas, engine -->
通道分离前后的对应坐标一致。若一个图案只出现在其中一种颜色上，可在该通道图中找到它在原图的位置。提取的多个分量图也可作为并列材料观察。

:::example 在三个通道中分别找最强位置
[输入]
同一行相邻的两像素，左像素为 (129,42,10,255)，右像素为 (2,128,50,128)。
[结果]
红通道左侧样本较大，绿、蓝通道右侧样本较大。
[说明]
分别比较红色的 129 与 2、绿色的 42 与 128、蓝色的 10 与 50。这里比较样本值，呈现仍受 Alpha 影响。
:::

## 标准化、合成与分量数值
<!-- sources: png, canvas, engine -->
图像读入不同颜色空间或处理环境时，分量可能经历转换；带透明度的图层也可能在显示时与背景合成。需要保留精确值时，应记录读入条件，并对照解码取得的通道数据。

## 常见误区
- RGB 三图各表示一种分量，仍然可以带透明度。
- 红通道分离与计算整张图的灰度亮度属于不同过程。
- 通道图的颜色与位平面黑白图具有不同含义，前者可保留分量的完整强度。
