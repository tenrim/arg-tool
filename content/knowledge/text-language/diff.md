---
capabilityId: op:Diff
title: 比较差异
topicGroup: text-language
summary: 差异比较先把两份材料拆成相同单位，再找出共同部分及需要插入、删除的位置。
aliases:
  - Diff
  - 文本差异
  - 逐行比较
  - 最长公共子序列
sources:
  - id: myers
    title: An O(ND) Difference Algorithm and Its Variations
    publisher: Eugene W. Myers
    url: https://neil.fraser.name/writing/diff/myers.pdf
    language: en
    kind: author-spec
    locator: 第 1、2 节，最长公共子序列与最短编辑脚本
  - id: jsdiff
    title: jsdiff — Text differencing implementation
    publisher: Kevin Decker 与 jsdiff 贡献者
    url: https://github.com/kpdecker/jsdiff
    language: en
    kind: official-doc
    locator: diffChars、diffWords、diffLines 及空白处理
  - id: cyberchef
    title: Diff（固定版本源码）
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/Diff.mjs
    language: en
    kind: implementation
    locator: 比较粒度、空白选项与新增、删除标记
---

## 介绍
<!-- sources: myers, jsdiff -->
文本差异比较把两份文本视为有序序列，用保留、删除和插入解释它们的变化。结果给出变化的位置和内容，可用于查出谜面修订中改动的字母、行或者标点。

## 公共子序列与编辑脚本
<!-- sources: myers -->
公共子序列保持元素先后顺序，允许跳过中间元素。允许的变更只有插入和删除时，保留一条最长公共子序列能使总变更数最少。若两份序列的长度为 m 与 n，最长公共子序列长度为 L，需删 m − L 项，再添 n − L 项。

:::example 单个字符被替换
[输入]
原文 AXC
新文 ABC
[结果]
保留 A、C，删除 X，插入 B
[说明]
公共子序列 AC 长 2，变更数为 3 + 3 − 2 × 2 = 2。比较中的一次替换可显示成删除和插入两段。
:::

## 字符、词和行
<!-- sources: jsdiff, cyberchef -->
比较之前要形成元素序列。按行时整行参与匹配，按字符时能指出一行内部的变化。按词时，同一行中的多个修改可分别显示。报告对文字变化的粒度取决于选用的分割方式。

:::example 按行定位替换
[输入]
原文三行分别是 a、b、c
新文三行分别是 a、x、c
[结果]
保留第 1、3 行，移除 b 行，加入 x 行
[说明]
两份文本里的 a 行与 c 行可分别对齐，所以变化集中在原来第 2 行的位置。
:::

## 空白与比较结果
<!-- sources: jsdiff, cyberchef -->
空格、制表符和换行可以是资料本身，也可以只是排版。某些按词或按行的比较允许忽略一部分空白差异。若正在寻找隐蔽线索，应保留原始比较作为对照，避免把有效字符扔进空白处理。

:::example 两个空格并成一个
[输入]
原文 alpha  beta
新文 alpha beta
[结果]
严格比较多出一个空格的删除；忽略相应空白的按词比较中，无改动的词有 alpha、beta
[说明]
字母顺序及各词拼写相同。可见差异取决于空白是否参与当前比较。
:::

## 并列的对齐方式
<!-- sources: myers, jsdiff -->
最少改动的对齐可能不唯一。例如原文有两个紧邻的相同字符，新文只留下一个时，删除其中任意一个都可复原新文。差异视图展示一种对齐方式，可与上下文或时间记录一并阅读。

## 常见误区
- 在旧文和新文互换时，插入与删除的方向也随之互换。
- 忽略空白后相同的两份文本仍可能具有不同字节。
- 重复行出现时，差异报告中的一个删除位置未必能唯一指认原作者删除了哪一行。
