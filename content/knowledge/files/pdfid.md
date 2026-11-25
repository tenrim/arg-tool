---
capabilityId: native:forensics-pdfid
title: PDF 结构与脚本标记检查
topicGroup: files
summary: 统计 PDF 的对象和相关标记，以只读文本结果辅助文档初筛。
aliases:
  - pdfid
  - AperiSolve
  - Aperi’Solve
sources:
  - id: didier
    title: PDF Tools：PDFiD
    publisher: Didier Stevens
    url: https://blog.didierstevens.com/programs/pdf-tools/
    language: en
    kind: author-spec
    locator: PDFiD 的关键字计数与范围
  - id: adapter
    title: AperiSolve 分析器源码：pdfid
    publisher: Zeecka / AperiSolve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/pdfid.py
    language: en
    kind: implementation
    locator: 扫描输出行
  - id: pdf
    title: ISO 32000 资源和 PDF 规范
    publisher: PDF Association
    url: https://pdfa.org/resource/iso-32000-pdf/
    language: en
    kind: official-doc
    locator: 文件结构、交叉引用、页面框和文档级动作
---

## 介绍
<!-- sources: didier, pdf -->

PDFiD 在文件字节中识别 PDF 头和一组结构关键字，记录各名称的出现次数。它服务于初筛，既不渲染页面也不执行文档动作。

## 对象和压缩流
<!-- sources: didier, pdf -->

PDF 间接对象可以存放页面描述、元数据和图像流。obj、endobj、stream 和 endstream 提供低层结构线索。对象的数量会受内容和序列化方式影响。

:::example 读单页样本的扫描项
[输入]
测试文件 document.pdf，由小尺寸 RGB 图片导出
[结果]
头部 %PDF-1.4；obj 与 endobj 各 6，stream 与 endstream 各 2
[说明]
图像流和页面指令可占不同对象，6 不表示 6 页。
:::

## 名称标记的意义
<!-- sources: didier, pdf -->

/JS 和 /JavaScript 可能出现在脚本相关对象，/OpenAction 与打开时动作有关，/AA 属于附加动作。出现次数是字节层线索，仍需结合对象位置和引用关系辨认实际用途。

:::example 在固定样本中查脚本相关项
[输入]
与前例相同的测试 PDF
[结果]
/JS、/JavaScript、/AA、/OpenAction 的计数均为 0
[说明]
扫描本身不告诉阅读器将怎样解释每个对象。
:::

## 加密与嵌入文件线索
<!-- sources: didier, pdf, adapter -->

/Encrypt 和 /EmbeddedFile 分别提示加密字典和嵌入文件对象类型。识别到名称后宜继续读文档结构，区分有效引用与文本中碰巧出现的名称。

:::example 核对普通样本的类型计数
[输入]
同一无加密、未附文件的 PDF 样本
[结果]
/Encrypt 0，/EmbeddedFile 0；/Page 1
[说明]
相互独立的计数，不把结果当作文档可信性判定。
:::

## 初筛后的下一层
<!-- sources: didier, adapter -->

对计数、压缩对象或结构关系有疑问时，可用 PDF 文档信息及专门的对象阅读工具交叉核对。在笔记中保留扫描输出和文件来源，避免把摘要标签当成原对象。

## 常见误区

- 标记计数不是脚本执行结果。
- 对象或流的数量不能直接用作页数。
- 全部重点标记为零也不构成安全保证。

