---
capabilityId: native:image-exif
title: 图片 EXIF / XMP / IPTC 信息
topicGroup: image
summary: 图像文件的拍摄参数、显示方向和作者说明可存于不同元数据结构。读取图片时，需要区分各字段的来源与解释。
aliases:
  - 图片元数据
  - EXIF
  - XMP
  - IPTC
  - Exif 方向
sources:
  - id: cipa
    title: CIPA DC-008-Translation-2026 — Exif Version 3.1
    publisher: CIPA 与 JEITA
    url: https://www.cipa.jp/std/documents/download_e.html?CIPA_DC-008-2026-E=
    language: en
    kind: standard
    locator: JPEG 应用段、图像文件目录与标签定义
  - id: xmp
    title: XMP Specifications
    publisher: Adobe
    url: https://developer.adobe.com/xmp/docs/xmp-specifications/
    language: en
    kind: author-spec
    locator: Part 2 属性与命名空间；Part 3 JPEG 文件中的存储
  - id: iptc
    title: IPTC Photo Metadata Standard 2025.1
    publisher: IPTC
    url: https://www.iptc.org/std/photometadata/specification/IPTC-PhotoMetadata-2025.1.html
    language: en
    kind: standard
    locator: 第 7、11 节，图像内容、署名等字段
  - id: orientation
    title: Pillow — ImageOps.exif_transpose
    publisher: Pillow 项目
    url: https://pillow.readthedocs.io/en/stable/_modules/PIL/ImageOps.html#exif_transpose
    language: en
    kind: implementation
    locator: EXIF Orientation 数值及像素变换映射
  - id: engine
    title: 图像原文件读取器
    publisher: 迷雾工具箱
    url: /image-inspect.js
    language: zh-CN
    kind: implementation
    locator: ImageInspector 调用固定 exifr，启用 TIFF、Exif、GPS、XMP 和 IPTC
---

## 介绍
<!-- sources: cipa, xmp, iptc -->
元数据是存放在图片文件里的说明及技术属性。EXIF 常记录相机和拍摄相关值，XMP 以命名空间组织结构化属性，IPTC 照片元数据规定了署名、描述、版权等编辑信息。在一份素材中，这些结构可同时存在。

## EXIF 目录与方向
<!-- sources: cipa, orientation, engine -->
EXIF 通常用类似 TIFF 目录的记录表示数据，每条有标签编号、类型和数值。显示方向是图片解读约定之一。原始像素按存储顺序读取，支持方向信息的查看器还会按标签调整呈现。

:::example 读出方向为 6 的原图
[输入]
合成 JPEG，像素尺寸为 3×2，EXIF 的 Make 为 LOT A，Model 为 SimpleCam，Orientation 为 6。
[结果]
读取到设备名称，方向解释为顺时针旋转 90°。
[说明]
支持该方向标签的显示器会按 2×3 方向呈现，原始像素仍是 3×2。
:::

## XMP 组件与内容字段
<!-- sources: xmp, iptc, engine -->
XMP 通过命名空间标识属性，允许同一文件存储若干组说明。例如创作者可以写在 Dublin Core 的 creator。图片还有可能在 EXIF 使用 Artist，或通过 IPTC 数据记录署名。字段相近时应保留来源区别。

:::example 区分两个署名字段
[输入]
同一份合成 JPEG：EXIF Artist 为 Sample Author，XMP creator 为 Clue Author。
[结果]
可读到 Artist = Sample Author，同时读到 creator = Clue Author。
[说明]
这两个值来自不同标签位置。输出里并存的署名可能由不同环节写入。
:::

## 位置与时间的解读
<!-- sources: cipa, xmp -->
GPS 坐标可用度、分、秒并结合半球等字段表示。时间标签应核对字段名称和是否有时区信息。相机、软件或后续转换可以修改这些值，读取时只得到文件所声明的信息。

## 缺失标签与结果边界
<!-- sources: cipa, engine -->
容器即使能显示图像，也可以不携带可读的 EXIF、XMP 或 IPTC 条目。应从待核对的原文件读取；若另存或经过平台转码，得到的副本可能采用不同的容器结构或留有不同字段。

:::example 有效图片没有可读元数据
[输入]
另存一张合成 3×2 JPEG，不写 EXIF、XMP、IPTC。
[结果]
没有读取到支持的 EXIF / XMP / IPTC 元数据。
[说明]
图片仍可解码。像素尺寸存在不代表文件带有这几种标签。
:::

## 常见误区
- EXIF 相机字段和创作者标签可以由软件写入。
- 没读到 GPS 不能证明图片从未包含位置字段。
- 图像方向标签可能影响呈现，尺寸资料还应注明是存储尺寸还是显示尺寸。
