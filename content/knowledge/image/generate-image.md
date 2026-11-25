---
capabilityId: op:Generate%20Image
title: 生成图片
topicGroup: image
summary: 把原始字节按规定的分量数和每行像素数排成图像，可还原外部没有文件头的像素数据。
aliases:
  - Generate Image
  - 字节生成图像
  - 图片栅格
  - 灰度与 RGBA
sources:
  - id: png
    title: Portable Network Graphics (PNG) Specification (Third Edition)
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 第 4、5、6 节，像素样本、数据流与颜色类型
  - id: pixel
    title: HTML Living Standard — Pixel manipulation
    publisher: WHATWG
    url: https://html.spec.whatwg.org/multipage/canvas.html#pixel-manipulation
    language: en
    kind: standard
    locator: 像素缓冲区、坐标与 ImageData 分量
  - id: engine
    title: CyberChef 图像模块（固定实现）
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Generate Image，灰度、RGB、RGBA 和位模式及像素放大
  - id: bit
    title: ECMAScript — Binary Bitwise Operators
    publisher: Ecma TC39
    url: https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-binary-bitwise-operators
    language: en
    kind: standard
    locator: 整数的按位读数
---

## 介绍
<!-- sources: png, pixel, engine -->
一份没有容器头的字节序列也可以解释为像素。每像素用几个字节、每行放几个像素，决定得到的图形。按选定约定生成图像后，可以观察文字、图案或原始素材排列。

## 灰度与分量分组
<!-- sources: png, pixel, engine -->
灰度通常用一个数值表达每个像素的亮度等级。RGB 则依次读取三个颜色分量，RGBA 还再读入一个不透明度。取普通八位灰度时，可以将同一等级映射到红、绿、蓝三个等值的分量。

:::example 四级灰度排成方格
[输入]
十进制字节 0、85、170、255。灰度，每行两像素。
[结果]
2×2 图。从左上起逐行分布为黑、深灰、浅灰、白。
[说明]
每字节代表一像素，灰度数值由低到高逐级变亮。每到两个像素切换至下一行。
:::

## 行宽与未填满的行
<!-- sources: pixel, engine -->
按行排列的字节每到指定宽度就开始下一行。若存在未填满的一行，输出仍须给出完整的矩形，未填写位置可以保留为透明。比较可能宽度时应同时检查实际数据量与结果的末尾。

:::example 三个 RGB 像素占两行
[输入]
FF 00 00 00 FF 00 00 00 FF
按 RGB 读，每行两像素。
[结果]
第一行红、绿，第二行蓝、透明。尺寸为 2×2。
[说明]
三组三字节按顺序填写前三个位置，最后一个位置没有像素数据。
:::

## 位模式与像素缩放
<!-- sources: bit, engine -->
位模式可把一个字节解释为八个黑白位置，位读取顺序和黑白映射需要先确定。缩放每个位置的显示面积时，输出宽高跟随缩放倍率改变，原始字节的分组不发生变化。

:::example 八个位画成两行
[输入]
A5（十六进制），位模式，每行四像素。
[结果]
第一行黑白黑白，第二行白黑白黑。
[说明]
A5 按最高位到最低位写为 10100101。模式使用黑表示 1，白表示 0。
:::

## 原始像素字节与图像容器
<!-- sources: png, engine -->
生成像素图是给字节指定栅格解释。已有 PNG 或 JPEG 则使用其格式描述宽高、通道与压缩数据，应先走格式解码。某个分组方式得到可读画面时，可记录宽度、采样顺序及倍率，以便反向复算。

## 常见误区
- 同一字节串改用 RGB 或 RGBA 会改变每个像素的边界。
- 每行分布由指定宽度决定，显示缩放只是改变每个像素的面积。
- 已压缩的图片文件不能直接当成已经展开的像素数组。
