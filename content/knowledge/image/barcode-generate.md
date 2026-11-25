---
capabilityId: native:barcode-generate
title: 条码完整生成
topicGroup: image
summary: 按所选条码制式生成 SVG，区分文本载荷、原始字节、校验数字与输出图形。
aliases:
  - barcode generate
  - BWIPP
  - Code 128
  - 二进制条码
  - EAN-13
sources:
  - id: bwipp
    title: Barcode Writer in Pure PostScript 制式参考
    publisher: BWIPP
    url: https://github.com/bwipp/postscriptbarcode/wiki/Barcode-Reference
    language: en
    kind: official-doc
    locator: EAN-13、Code 128 和 QR Code 制式
  - id: gs1
    title: GS1 General Specifications
    publisher: GS1
    url: https://ref.gs1.org/standards/genspecs/
    language: en
    kind: standard
    locator: 第 5 节 EAN/UPC 符号，第 7 节校验数字
  - id: worker
    title: 条码生成工作线程
    publisher: 迷雾工具箱
    url: /completion/worker.js
    language: zh-CN
    kind: implementation
    locator: 普通文字、原始字节十进制转义与矢量导出
---

## 介绍
<!-- sources: bwipp, gs1 -->
条码制式规定什么数据可以编码、图案如何排列以及读码时如何校验。EAN-13 常装载商品编号；Code 128 可装载字母和数字；QR Code 在二维模块中还能记录字节。生成前需根据载荷和使用场景选择制式。

## 数据约束与校验
<!-- sources: bwipp, gs1 -->
EAN-13 用固定长度的数字组合，最后是校验数字。给前 12 位时，编码器可根据交替的 1、3 权重补上它。Code 128 的校验符号由其自身规则决定，普通扫码结果返回文字载荷而不加一个外显的 EAN 校验数字。

## 文字与原始字节
<!-- sources: bwipp, worker -->
普通文本依照制式接受的字符编码。选择十六进制等字节表示时，转换器先还原原字节，再逐个写成 BWIPP 的三位十进制转义。例如 00、FF 和 41 转为 ^000、^255 和 ^065。字节模式仍受选定制式的容量和输入限制。

## 生成与回读
<!-- sources: gs1, bwipp, worker -->
可将输出 SVG 渲染到有白色静区的图像上再读取，核对图形实际装载的内容。

:::example 自动计算 EAN-13 校验位
[输入]
EAN-13，输入 400638133393
[结果]
生成可读作 4006381333931 的条码
[说明]
前十二位交替加权得到 89，第十三位为 1。
:::

:::example 保留 Code 128 字符
[输入]
Code 128，输入 MIST-42
[结果]
读回 MIST-42
[说明]
短横线与字母数字同属载荷，生成器还会计算内部校验符号。
:::

:::example QR 二进制载荷
[输入]
QR Code，按十六进制输入 00 ff 41
[结果]
回读原字节 00 FF 41
[说明]
首字节是数值 0，第二个为 255。文本识别器可能把它们显示为占位符或其他字符。
:::

## 图形大小与使用
<!-- sources: bwipp, gs1 -->
SVG 保存图形和尺寸信息，打印前还要保证最窄单位与留白符合所需场景。能成功绘出含校验位的图，并不自动取得某个号码的分配权，也不能验证实际打印机和扫描设备间的可读性。

## 常见误区
- 同一串数字可由不同制式承载，印成的图案可能完全不同。
- 十六进制字节模式中的 41 是一个字节，输入字符 4 和 1 是两个字符。
- 生成器的校验位只验证编码结构，不查询编号归属。
