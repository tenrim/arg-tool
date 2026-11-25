---
capabilityId: native:image-barcode
title: 二维码与条形码识别
topicGroup: image
summary: 按制式识别图像中的一维或二维条码，分别读出制式与载荷。
aliases:
  - barcode read
  - 多制式扫码
  - EAN-13 与 Code 128
sources:
  - id: zxing
    title: ZXing-C++ 读取器
    publisher: ZXing-C++
    url: https://github.com/zxing-cpp/zxing-cpp
    language: en
    kind: official-doc
    locator: Supported Formats 与图像读取
  - id: gs1
    title: GS1 General Specifications
    publisher: GS1
    url: https://ref.gs1.org/standards/genspecs/
    language: en
    kind: standard
    locator: 第 5 节 EAN/UPC 符号，第 7 节校验数字
  - id: reader
    title: 多制式条码识别
    publisher: 迷雾工具箱
    url: /hunt-media.js
    language: zh-CN
    kind: implementation
    locator: readBarcodes、像素来源与 format/text 输出
---

## 介绍
<!-- sources: zxing, gs1 -->
条码把数据排成可读的图案。一维码沿横向或纵向记录连续条空，二维制式还利用另一轴的模块。识别结果包含命中的制式和其中记录的内容。数字可作为某个登记系统中的编号，其商品名称需要另查对应信息。

## 条空与网格
<!-- sources: zxing, gs1 -->
EAN-13 的读码依据条、空和护栏图案，条宽可表示为基本模块宽度的倍数。QR Code 等矩阵码则需建立二维网格。拍摄歪斜、过暗、较低的分辨率或空白边界被裁掉，都可能影响这些估计。

## 校验数字和解码结果
<!-- sources: gs1, reader -->
EAN-13 最后一位是校验数字。前 12 位从左至右交替乘 1 和 3 后求和，取使总和成为 10 的倍数的一位。多制式读取器可以扫描原图或经过查看调整的图，并在同一幅图中返回多项命中；每项按制式和文本分开显示。

## 合成条码对照
<!-- sources: gs1, zxing, reader -->
以下样本都是合成光栅，条码周围留有白边。对照载荷可分清编号、制式和结果状态。

:::example 读 EAN-13
[输入]
一张由 400638133393 生成的 EAN-13 图
[结果]
EAN-13
4006381333931
[说明]
前 12 位的加权和为 89，校验数字是 1。
:::

:::example 读 Code 128
[输入]
一张载荷为 MIST-42 的 Code 128 图
[结果]
Code128
MIST-42
[说明]
字母、连字符和数字一起返回，不能按只有数字的 EAN-13 理解。
:::

:::example 一幅图中排两种条码
[输入]
将上面两个条码竖向排在同一张白底图中，中间留空
[结果]
同时得到 EAN-13 的 4006381333931 和 Code128 的 MIST-42
[说明]
两项独立检测，文本不会合并成一个编号。
:::

## 识别与解释
<!-- sources: zxing, reader -->
纯白图没有条码图案，结果应为空。某张材料读不出时，可比较原图采样与调整后的画面。有些二维载荷含不可打印字节，屏幕上的字符串表示不足以证明那组原字节。

## 常见误区
- EAN-13 的数字有效，只说明校验关系成立，商品归属仍需凭登记资料确认。
- 视觉上相似的线条可能属于不同制式，先读结果中的格式字段。
- 图片中能出现多个条码，逐项保留各自的载荷。
