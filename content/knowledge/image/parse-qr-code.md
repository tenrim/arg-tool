---
capabilityId: op:Parse%20QR%20Code
title: 识别二维码
topicGroup: image
summary: 从光栅定位 QR 图案、重建模块格并还原文本载荷。
aliases:
  - Parse QR Code
  - 从图片读取 QR
  - QR decode
sources:
  - id: structure
    title: About QR Code
    publisher: DENSO WAVE
    url: https://www.qrcode.com/en/about/index.html
    language: en
    kind: author-spec
    locator: 定位图案及读取方向
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
  - id: engine
    title: CyberChef 11.5.0 图像模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Parse QR Code 的图像解析、归一化选项和失败路径
---

## 介绍
<!-- sources: structure, version -->
识别二维码时，程序从图片找出具有特定结构的大定位块，由此估算方向和网格。载荷中可以记录文字、号码或网址，识别完成时得到的是被编码的信息。

## 方向与采样
<!-- sources: structure, engine -->
常见 QR 码的三个大定位块位于符号三个角。识别器找到它们后，可将旋转的码恢复到读取所用的方向。黑白模块的判定取决于色值、边界和采样，浅灰底或拍摄阴影可能增加难度。

## 从模块到文字
<!-- sources: correction, engine -->
读取网格后，解出格式信息，按规定去掩码，再把位组合为码字。纠错用于修复受损的码字，文字结果来自之后对载荷段的解释。预先尝试图像归一化可以改变色值范围，不能补出裁剪掉的模块。

## 照片方向和对比度示例
<!-- sources: engine -->
以下样本以已知文字 HELLO 生成的二维码为基准，再单独更换方向或像素色值。

:::example 标准黑白图
[输入]
145×145 像素的 HELLO 二维码，含四模块静区
[结果]
HELLO
[说明]
读码取得文字载荷，尺寸和边距不属于返回文本。
:::

:::example 旋转图
[输入]
将同一图片顺时针旋转 90°
[结果]
HELLO
[说明]
定位块仍能确定方向，旋转后的像素排布不改变数据。
:::

:::example 灰色码与背景
[输入]
将黑色改成灰度 90，白色改成灰度 175
[结果]
HELLO
[说明]
该样本用正常识别即可读出，说明模块并不要求恰好是 0 和 255。
:::

## 无法辨认时的区别
<!-- sources: structure, engine -->
在纯白图中没有可定位的码，识别会返回失败。图中能见到模块却无法还原文字，可能是符号局部被裁剪、严重变形，或需要保留更详细的模块与码字信息。人工修复适用于仍可重建模块网格的材料。

## 常见误区
- 二维码能被识别，不等于其中的网址已验证可访问。
- 归一化改善色差时也可能增强背景，效果取决于样本。
- 校验失败前应区分找不到图案和找到图案后仍无法纠错。
