---
capabilityId: op:Render%20PDF
title: 显示 PDF
topicGroup: files
summary: 将原始或 Base64 形式的 PDF 还原成文档字节，供下载后用阅读器查看。
aliases:
  - PDF
  - 页面渲染
sources:
  - id: pdf
    title: Adobe PDF 32000-1:2008
    publisher: Adobe Systems
    url: https://opensource.adobe.com/dc-acrobat-sdk-docs/standards/pdfstandards/pdf/PDF32000_2008.pdf
    language: en
    kind: standard
    locator: 文件结构、页面树和内容流
  - id: rfc
    title: RFC 4648：Base-N Encodings
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4648.html
    language: en
    kind: standard
    locator: 第 3、4 节，Base64 字母表与规范填充
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的输入输出与模式
  - id: guide
    title: PDF 结果说明与原文件输出
    publisher: 迷雾工具箱
    url: /chef-tools/guidance.js
    language: zh-CN
    kind: implementation
    locator: Render PDF 验证与导出，不内嵌额外阅读窗口
---

## 介绍
<!-- sources: pdf, guide -->

PDF 是由页面树、内容流、字体、图像等对象组成的固定版式容器。此入口的上游名称为 Render PDF，当前页面将识别到的 PDF 字节作为文件结果。显示排版使用适当的阅读器。

## 二进制和 Base64 输入
<!-- sources: rfc, chef -->

Base64 用可打印字符包装二进制。遇到 Base64 输入先还原成字节，再检查能否作为 PDF。原始字节模式适用于直接读取文件。

:::example 从首段文字还原字节
[输入]
JVBERi0xLjQK，Base64
[结果]
25 50 44 46 2D 31 2E 34 0A，即 %PDF-1.4 后跟 LF
[说明]
这段只有版本头，不能作为完整可打开文件。
:::

## 页面树和内容流
<!-- sources: pdf -->

页面在 PDF 内由页面对象和资源组合，内容流里的指令控制绘图和文本。资源中的图像与文本对象显示时可以很相似，只有底层确实保存了文本，才可能直接复制。

:::example 扫描页中的文字形状
[输入]
一页只包含扫描图像，没有文字层
[结果]
阅读器可以显示图中笔画，却没有可选的字符序列
[说明]
图像层和可搜索文字层是两种数据对象。
:::

## 识别失败与后续核对
<!-- sources: chef, guide, pdf -->

检查数据开头能够区分许多非 PDF 输入，无法保证原文档无损。打开文档还需读取其页面树、引用和流。若文件未解析成功，优先检查输入模式和数据是否只有片段。

:::example 拒绝无效候选
[输入]
%%% 作为 Base64 交给该操作
[结果]
报告输入未识别为 PDF
[说明]
显示文件名无助于改变实际字节。
:::

## 版面和附件的区别
<!-- sources: pdf, guide -->

从画面看到的是页面渲染结果，文档仍可能有元数据、表单或附件等其它对象。针对这些材料，需使用结构化 PDF 信息入口另行核对。

## 常见误区

- 检测到 PDF 标志不等于文件完整。
- 图像里的字样与 PDF 可提取文字不同。
- 文本包装无损还原不表示页面渲染已完成。

