---
capabilityId: native:forensics-pdfinfo
title: PDF 完整信息
topicGroup: files
summary: 读取 PDF 页数、页面框、加密、文件属性及可选元数据。
aliases:
  - pdfinfo
  - AperiSolve
  - Aperi’Solve
sources:
  - id: pop
    title: Poppler pdfinfo(1)
    publisher: Poppler 项目／Debian
    url: https://manpages.debian.org/bookworm/poppler-utils/pdfinfo.1.en.html
    language: en
    kind: official-doc
    locator: 默认报告、-box、-meta、-url 和打开密码
  - id: adapter
    title: AperiSolve 分析器源码：pdfinfo
    publisher: Zeecka / AperiSolve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/pdfinfo.py
    language: en
    kind: implementation
    locator: 从解析器读取文档字段及图像结果报告
  - id: pdf
    title: ISO 32000 资源和 PDF 规范
    publisher: PDF Association
    url: https://pdfa.org/resource/iso-32000-pdf/
    language: en
    kind: official-doc
    locator: 文件结构、交叉引用、页面框和文档级动作
---

## 介绍
<!-- sources: pop, pdf -->

pdfinfo 用 PDF 解析器读取文档级信息。它可给出页数、页面尺寸、加密状态和常见属性，也可按模式查看页面框、嵌入的元数据包与 URL 列表。

## 页数与页面尺寸
<!-- sources: pop, pdf -->

页数来自文档的页面结构。PDF 常用点（pt）表达尺寸，默认一英寸对应 72 点。图片像素数与 PDF 页面点数只在导出约定合适时相对应。

:::example 读一个已知页面
[输入]
测试图片导出的 document.pdf
[结果]
Pages: 1；Page size: 64 × 32 pts
[说明]
结果来自 PDF 页面；选中同名源 PNG 时的像素数应单独核对。
:::

## 页面框的区别
<!-- sources: pop, pdf -->

MediaBox 表示页面物理边界，CropBox 表示通常展示或打印时所用的裁取区域。BleedBox、TrimBox 和 ArtBox 常服务印制流程，可具有独立的坐标，也可能采用默认值。

:::example 核对边界框
[输入]
对同一文档读取页面框
[结果]
MediaBox 和 CropBox 均为 0.00 0.00 64.00 32.00
[说明]
四项依次为矩形的两角坐标。这个样本中各框相同。
:::

## 加密、版本与元数据
<!-- sources: pop, pdf, adapter -->

加密文档可能需要用户密码或所有者密码。报告未解析到信息时应展示失败，而不是用原文件名推断页数。标题等普通元数据可以由制作者自填，时间戳不必等于真实创作时间。

:::example 查看无需密码的样本
[输入]
同一 document.pdf 的概要
[结果]
PDF version 1.4；Encrypted: no；Metadata Stream: no
[说明]
元数据流缺失不妨碍普通数字字段或标题的显示。
:::

## 报告与正文不是同一内容
<!-- sources: pop, adapter -->

元数据模式显示文档所附的元数据流，链接列表反映解析器所识别的 URL。功能没有抽取、排印或打开每一页正文，保留报告时可同时记录具体模式。

## 常见误区

- 运行默认概要与读取原始 XMP 元数据并不是同一内容范围。
- 页面点数不能直接当成渲染图片的像素大小。
- 标题等文档属性不能用来证明出处。

