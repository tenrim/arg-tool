---
capabilityId: op:Extract%20EXIF
title: 提取 EXIF 元数据
topicGroup: image
summary: 提取 EXIF 从支持的图片格式中读取标签，常用于观察存储方向、设备、曝光、时间与 GPS 等值。
aliases:
  - Extract EXIF
  - Exif 标签
  - EXIF 提取
  - 拍摄参数
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
  - id: orientation
    title: Pillow — ImageOps.exif_transpose
    publisher: Pillow 项目
    url: https://pillow.readthedocs.io/en/stable/_modules/PIL/ImageOps.html#exif_transpose
    language: en
    kind: implementation
    locator: EXIF Orientation 数值及像素变换映射
  - id: engine
    title: CyberChef 图像模块（固定实现）
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Extract EXIF，Exif 标签解析与可读值输出
---

## 介绍
<!-- sources: cipa, engine -->
EXIF 是数字图像文件中的元数据格式。它的标签可指明设备、图像方向、曝光过程、修改时间或位置。提取 EXIF 得到的是文件中的标签信息，不会改变图片像素。

## 标签编号、类型与可读名称
<!-- sources: cipa, engine -->
EXIF 目录项记录标签编号、数据类型和项数。相机制造商 Make 和型号 Model 属于两个标签。可读报告用名称显示它们，字段不在文件里时，读取器不会自动生成正确的替代值。

:::example 读取合成相机标签
[输入]
JPEG 的 EXIF 主目录中写入 Make = LOT A、Model = SimpleCam。
[结果]
可读取 Make: LOT A 和 Model: SimpleCam。
[说明]
这是写入文件的字符串，仅凭这两项无法判断图片是否由某一台真实设备拍摄。
:::

## 方向与像素排列
<!-- sources: cipa, orientation, engine -->
Orientation 记录存储像素到预期显示的变换。方向值 1 表示通常的显示排列，值 6 表示预期顺时针旋转 90°。解释尺寸时要区分解码后的存储宽高与应用是否已应用方向。

:::example 保留方向的数字值
[输入]
存储宽度 3、高度 2 的 JPEG，Orientation = 6。
[结果]
Exif 标签报告为 Orientation: 6，按该方向呈现时宽高对调。
[说明]
宽高出自图像数据结构，方向是另存的标签。
:::

## 相邻的元数据格式
<!-- sources: cipa, xmp, engine -->
JPEG 可以同时有 EXIF 和 XMP。虽然两者都能写入应用段，也可记录含义相近的属性，但各自前缀、数据模型和解析方法不同。检查 EXIF 时，不能据未显示某个 XMP 属性断定原图没有它。

:::example 两类标签并存时的报告
[输入]
合成 JPEG 的 EXIF Artist 为 Sample Author，XMP creator 为 Clue Author。
[结果]
EXIF 提取列出 Artist: Sample Author，不列出该 XMP creator。
[说明]
读取范围由 EXIF 格式决定。检查 XMP 时须读取相应的元数据区。
:::

## 时间与 GPS 的约定
<!-- sources: cipa, engine -->
Exif 中的时间字段有不同含义，可指拍摄、数字化或修改。较新的结构可以另存时区偏移。GPS 的坐标与参考方向也分别记录。报告为某一显示形式时，还应保留文件中各字段用于精确复查。

## 常见误区
- 方向值为 6 不表示文件已把像素物理旋转。
- 只读 EXIF 无法覆盖所有其他元数据格式。
- 相机名、时间与位置标签是文件的记录，可被后续工具改写。
