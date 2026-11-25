---
capabilityId: native:hunt-constraints-drop
title: Drop Quote 落字
topicGroup: logic
summary: 按原列分配给定的字母多重集，通过横向阅读形成填字结果。
aliases:
  - 落字谜题
  - 固定列排列
  - 多重集填字
sources:
  - id: puzzle
    title: Drop Quotes
    publisher: Puzzle Baron
    url: https://dropquotes.puzzlebaron.com/
    language: en
    kind: author-spec
    locator: 题面列字母、黑白格与横读引文
  - id: parser
    title: 中文规则解析器
    publisher: philippica / cipher_machine
    url: https://github.com/philippica/cipher_machine/blob/29fa4ee1c60873484688c250b37c87d93f54cae4/src/sudoku/solverParser.js
    language: zh-CN
    kind: implementation
    locator: 区域、计数、排列、求和与连续段规则解析
  - id: local
    title: 约束预设与语句示例
    publisher: 迷雾工具箱
    url: /expansion/hunt-constraints-catalog.js
    language: zh-CN
    kind: implementation
    locator: CONSTRAINT_PRESETS 与 CONSTRAINT_RULE_REFERENCE
---

## 介绍
<!-- sources: puzzle -->

Drop Quote 把一段引文的字符打散后放在对应列的上方。每个字母只能下降到原列的空格。填好后按行阅读，还原引文。黑格分隔横向阅读位置，列顶字母给出各列可用的库存。

## 列内多重集
<!-- sources: puzzle, parser -->

同一列两个相同字母是两份库存。若列有三个空格和三个字母 A、A、B，就须填入两个 A 与一个 B。黑格本身不消耗库存。使用排列规则时，列中字母份数与可填格数必须相同。

:::example 重复字母与黑格
[输入]
依序为三个可填格和一个黑格，字母库存是 A、A、B。
[结果]
AAB、ABA、BAA 共三种排列，末格始终为黑。
[说明]
把 B 放到三个可填格的任一位置，两份 A 填余格。
:::

## 横向约束
<!-- sources: puzzle, local -->

列库存负责限制候选字母，横向规则负责约束这些字母组成的字词。计算模型可把明确的连续格组列为需匹配字典的词。若原题允许缩写或人名，相关表项必须能进入模型的允许集合才能留下候选。

:::example 两行交换
[输入]
2×3 空格盘，三列分别提供 C/D、A/O、T/G。仅允许 CAT、DOG 作为整行词。
[结果]
第一行 CAT、第二行 DOG，或两行交换，共两盘。
[说明]
每列各用尽一份库存，横向候选恰好是两个给定词。这是小字典示例。
:::

## 库存和词表的影响
<!-- sources: parser, local -->

尺寸和黑格决定每列的空格数。把上例第一列只留 C、仍保留两个可填格，模型无解。反过来，增加可接受的横向词可以保留原有填法，并增加新的候选。

:::example 增加两项人工许可词
[输入]
仍用 C/D、A/O、T/G 作列库存，允许横读 CAT、DOG、COT、DAG。
[结果]
四盘。除 CAT/DOG 的两种行序，还可填 COT/DAG 的两种行序。
[说明]
把 COT 与 DAG 对齐，三列仍分别用尽 C/D、O/A、T/G。DAG 在这里是人为给定候选。
:::

## 从填字到引文
<!-- sources: puzzle, parser -->

词表查询只验证特定分组是否出现在允许集合中。跨行断词、引号和标点要按原题排版处理。多份合规填字可能只有一份符合语境，引文是否通顺、属于何处，要用题目的额外线索或原始材料确认。

## 常见误区

- 列顶字母不能搬到别的列使用。
- 重复字母要按次数逐个核对，集合去重会改变谜题。
- 字典约束不能证明填出的整句是题目想要的引文。
