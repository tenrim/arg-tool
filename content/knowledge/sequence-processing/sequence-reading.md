---
capabilityId: native:sequence-processing
title: 蛋白质与核酸序列转换
topicGroup: maths
summary: 区分互补、反向互补、编码链转写与标准表的逐密码子翻译。
aliases:
  - DNA
  - RNA
  - 密码子
  - 阅读框
  - 反向互补
  - FASTA
sources:
  - id: ncbi
    title: The Genetic Codes
    publisher: NCBI
    url: https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi
    language: en
    kind: official-doc
    locator: The Standard Code，表 1
  - id: insdc
    title: IUPAC Nucleotide Codes
    publisher: INSDC／DDBJ
    url: https://www.ddbj.nig.ac.jp/ddbj/code-e.html
    language: en
    kind: official-doc
    locator: 核苷酸模糊符号与氨基酸码
  - id: model
    title: science/core.js
    publisher: 迷雾工具箱
    url: /science/core.js
    language: zh-CN
    kind: implementation
    locator: sequence 与六个阅读框
  - id: seqviz
    title: vendor/science/seqviz/README.md
    publisher: 迷雾工具箱
    url: /vendor/science/seqviz/README.md
    language: zh-CN
    kind: implementation
    locator: 线性、环形、范围和注释
---

## 介绍
<!-- sources: ncbi, insdc, model -->

核酸以碱基符号记录，蛋白质常以单字母或三字母氨基酸代码表示。这里使用短人工样本说明序列约定和查表规则。

## 配对与方向
<!-- sources: insdc, model -->

DNA 标准碱基按 A↔T、C↔G 互补。对齐互补链的方向与输入相反；若要求用 5′→3′ 书写互补链，还需反转次序。RNA 对应使用 U。

:::example 同一输入的两种互补写法
[输入]
DNA 5′-ATGGCTTAA-3′
[结果]
对齐互补 TACCGAATT；反向互补 TTAAGCCAT
[说明]
把对齐互补的九个字符反转即得第二个表示。
:::

## 阅读框与停止位
<!-- sources: ncbi, model -->

给定一条链和起始偏移后，每三碱基构成一个密码子。两条链各有三个偏移。标准查表的翻译不自动猜应从哪个起点开始。

:::example 按首位查标准表
[输入]
人工序列 ATGGCTTAA，+1 阅读框
[结果]
ATG/GCT/TAA → M/A/停止
[说明]
末尾停止也作为一个完整密码子显示。
:::

:::example 起点偏移
[输入]
人工序列 ATGGCTTAA，+2 阅读框
[结果]
TGG/CTT → W/L；尾部 AA 不完整
[说明]
从第二个字符开始每三位分一组。
:::

## 范围与符号的表示
<!-- sources: insdc, seqviz, model -->

查看器的选择界面用从 1 开始的闭区间；底层用从 0 开始且不含右端点的区间。线性与环形只是布局。包含 `N` 的密码子可能显示未知结果。

:::example 选择九个碱基
[输入]
人工序列 ATGAAATAG；选择第 1–9 位
[结果]
内部范围 [0,9)，+1 查表得 M、K、终止
[说明]
三段各有三个碱基。
:::

## 代码和生物解释
<!-- sources: ncbi, model, seqviz -->

遗传密码有简并性，多种密码子可对应同一氨基酸。符号转换和常规可视化适合核对文本，序列文件的原始注释、记录边界和遗传密码表仍要单独保留。

## 常见误区

- T 替换为 U 的编码链表示与互补变换含义各异。
- 同一蛋白序列不唯一确定原核酸。
- 六个候选框只是枚举分组，不构成对天然序列功能的判断。

