---
capabilityId: native:forensics-exiftool
title: 完整文件元数据
topicGroup: files
summary: ExifTool 按文件格式读取多类标签。报告可保留原始描述与分组结果，便于区分容器、同名字段和推导值。
aliases:
  - ExifTool
  - 文件元数据
  - 元数据分组
  - 未知标签
sources:
  - id: tool
    title: ExifTool Application Documentation
    publisher: Phil Harvey
    url: https://www.exiftool.org/exiftool_pod.pdf
    language: en
    kind: official-doc
    locator: -a、-u、-g1 及重复标签示例
  - id: upstream
    title: Aperi’Solve — ExifTool 分析器
    publisher: Aperi’Solve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/exiftool.py
    language: en
    kind: implementation
    locator: 调用 exiftool -a -u -g1
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
---

## 介绍
<!-- sources: tool, upstream -->
ExifTool 读取文件结构中的技术字段和描述信息。格式决定文件支持哪些标签。报告中有的值来自原始字段，另有文件大小、类型等观察值或按已有项目算出的组合信息。对具体字段应确认报告归组和命名。

## 元数据分组与来源
<!-- sources: tool, upstream, cipa -->
图像中可有不同分组，例如 EXIF 的主图目录、GPS 目录及 XMP 各命名空间。按实际存储位置分组可以把外观相近的标签放回对应上下文。原始报告中的分组名对于回看证据尤为重要。

:::example 从不同位置读取创作者说明
[输入]
合成 JPEG 同时写入 EXIF Artist = Sample Author 和 XMP dc:creator = Clue Author。
[结果]
原数据有两个独立字段，一个来自 IFD0 的 Artist，另一个来自 XMP 的 Dublin Core creator。
[说明]
同一图片中的两个说明值有各自的名称和存放位置，不应合并成一个未经说明的作者值。
:::

## 重复、未知和原始值
<!-- sources: tool, upstream -->
一个字段名称可以在多个分组中重复出现。允许重复的文本报告能把这些内容逐条记录。若把结果再存成只用标题作键的映射，同键值可能互相覆盖。需要保留全部记录时，可同时查看带分组的原始文本。

:::example 两条同名记录的复核
[输入]
一处标签来自图像主目录，另一处同名标签来自内嵌缩略图目录。
[结果]
分组报告应可区分两条记录。用单一键名导入普通映射时可能只剩一条。
[说明]
缩略图目录与主图目录有不同的结构位置。判断哪条适用于主图时应回看分组。
:::

## 文件属性和写入标签
<!-- sources: tool, cipa, xmp -->
文件可以声明一个拍摄或修改时间，也可以由处理环境另行统计当前文件系统时间。两者不一定相同。设备名、版权、地点等内容同样可由文件制作方写入或更改。它们有助于理解文件，但单独不能确认来源事实。

:::example 用两套属性核对最简图片
[输入]
一张未写入 EXIF 或 XMP 的 3×2 JPEG。
[结果]
格式和存储尺寸仍可从文件结构读到，不会自动出现相机型号与作者。
[说明]
图像结构字段独立于描述性标签。缺少设备字段时应照实留空。
:::

## 能力范围与资料保留
<!-- sources: tool, cipa, xmp -->
广谱读取器可以检查多个格式与字段族，实际可读程度仍取决于输入完整性、压缩、私有数据以及规则覆盖。若结果需复查，应同时保存原文件、分组输出，以及用于解释字段的格式定义。

## 常见误区
- 看到同名值时应先检查分组来源和是否有多条记录。
- 报告中的技术尺寸与创作者说明来自不同的证据层。
- 工具未显示某个标签时，可能是字段缺失、无法读取或不受支持。
