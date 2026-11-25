---
capabilityId: op:Remove%20EXIF
title: 移除 EXIF 元数据
topicGroup: image
summary: 移除 EXIF 在图片文件中定位相应元数据段。图片像素、显示方向和其他元数据需要分别核对。
aliases:
  - Remove EXIF
  - 删除 EXIF
  - 元数据清理
  - JPEG APP1
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
    locator: Remove EXIF，JPEG 段识别与 Exif 移除
---

## 介绍
<!-- sources: cipa, xmp -->
JPEG 可在图像压缩数据以外附带元数据。仅移除 EXIF 的操作处理目标段，像素内容仍由图像编码部分保存。交付清理后的文件时，应核对目标标签与其他元数据，并确认显示方向是否仍合适。

## 从 JPEG 应用段识别 EXIF
<!-- sources: cipa, xmp, engine -->
JPEG 的 APP1 应用段可以承载 EXIF，也可以承载 XMP。区分两者需要读段内的标识，不能仅按 APP1 号一律删除。找到 Exif 标识后，可依据段长跳过其目录和数据。

:::example 删除一个 EXIF 段
[输入]
合成 3×2 JPEG，EXIF 记录 Make、Model、Orientation、ModifyDate、Artist。
[结果]
处理后的副本没有该组 EXIF 标签，解码像素仍逐项一致。
[说明]
样本原有 785 字节，处理后 651 字节，两个副本的解码尺寸均为 3×2。
:::

## 方向与像素变化的判断
<!-- sources: cipa, orientation, engine -->
删除 Orientation 后，查看器可能直接用存储顺序呈现图片。若需要同时保留原视觉方向，就须区分将变换应用到像素和删除标签这两个动作。前一个动作可能重新编码图像，后一个可以只改元数据段。

:::example 方向标签删除后的显示
[输入]
存储宽 3、高 2，Orientation = 6 的合成 JPEG。
[结果]
删除后存储尺寸仍为 3×2。使用原标签显示时为 2×3，删除标签后的常规显示为 3×2。
[说明]
原始像素序列未改变，缺失的是指导显示旋转的标签。
:::

## XMP 共存时检查文件结果
<!-- sources: xmp, cipa, engine -->
一个文件可以同时有多个应用段。某些简化处理依赖段顺序，即使保存完成也可能保留 EXIF。检查时可重新读取输出的标签，同时检查 XMP 和 IPTC 是否仍存在。仅删除一种结构不会自动清掉其他类型。

:::example 在 EXIF 后另有 XMP
[输入]
合成 1092 字节 JPEG，具有位于前面的 EXIF 段与位于其后的 XMP 应用段。
[结果]
处理后为 958 字节，EXIF 段移除，XMP 仍在。
[说明]
实际删除了 134 字节的 EXIF 段，XMP 使用独立的段内标识。
:::

## 清理范围与核对
<!-- sources: cipa, xmp, engine -->
对公开副本有清理需求时，可把处理前后的读数并列检查。判断依据是实际剩余的字段和文件结构。即使多个元数据族均已清理，画面本身仍可能出现可读文字、地点或其他信息。

## 常见误区
- 移除 EXIF 不代表 XMP 等其他元数据也被移除。
- 显示方向改变时，像素数据可能仍与原始文件一致。
- 成功导出只是得到输出文件，重新读取能确认标签是否按预期消失。
