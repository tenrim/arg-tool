---
capabilityId: native:hunt-constraints-sudoku
title: 中文规则数独
topicGroup: logic
summary: 用取值、行列宫互异和附加条件表达数独，区分约束模型、候选盘及唯一解。
aliases:
  - 数独规则脚本
  - 行列宫
  - AllDifferent
sources:
  - id: nikoli
    title: Sudoku
    publisher: Nikoli
    url: https://www.nikoli.co.jp/en/puzzles/sudoku/
    language: en
    kind: official-doc
    locator: Rules 与 History
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
<!-- sources: nikoli -->

标准数独是 9×9 的填数题，每行、每列和每个 3×3 宫都恰好含数字 1 至 9 各一次。Nikoli 在 1984 年把美国杂志里的 Number Place 介绍给日本读者，后来将名称缩短为 Sudoku。标准规则只依赖取值和位置关系，数字本身无需参与算术。

## 取值与互异
<!-- sources: nikoli, parser -->

给每格分配一个变量，初始候选是 1 至 9。预填数字把候选限制为一个值。一行的九格候选都来自 1 至 9，再要求互异，就得到每个数字恰好出现一次。四宫的小型变体同理，取值改为 1 至 4。

:::example 一行缺一个数
[输入]
1 2 3 □
[结果]
1 2 3 4
[说明]
互异排除了 1、2、3，且本行的候选上界是 4。
:::

## 宫约束
<!-- sources: nikoli, local -->

规则脚本可按格号列出不连续的区域。4×4 格从左到右、从上到下连续编号，左上 2×2 宫由第 1、2、5、6 格组成。9×9 的第一宫包括第 1、2、3、10、11、12、19、20、21 格。

:::example 行列有效的反例
[输入]
1 2 3 4
2 3 4 1
3 4 1 2
4 1 2 3
[结果]
行和列均互异，左上宫不成立。
[说明]
左上宫的数字为 1、2、2、3，重复了 2。
:::

## 附加线索的求交
<!-- sources: parser, local -->

和、大小、线性组合或条件都可以缩小已有候选。不同的规则作用在同一格时，格值必须同时满足。条件式只在前提成立时施加后件，前提不成立时无需强制后件的反面。

:::example 线性组合确定数值
[输入]
第 1 格是 1。第 1、2 格的系数分别是 2、3，线性组合为 8。
[结果]
第 2 格为 2。
[说明]
代入 2×1+3×x=8，得到 x=2，再核查 x 在取值域内。
:::

## 候选盘与唯一性
<!-- sources: nikoli, parser -->

逐个数字检查候选盘是否满足规则，可以确认这一盘可行。唯一性还要求找不到另一盘；如果搜索在找到第一盘时就停止，所得证据只够确认存在解。重号给出的直接矛盾则可以立即排除相关局面。

## 常见误区

- 逐行和逐列检查无法替代宫互异。
- 互异只排除重复，取值域恰好有同样多的候选时才蕴含每个值都出现。
- 第一份解只证明题面有解，唯一性还取决于约束与搜索状态。
