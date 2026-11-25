---
capabilityId: native:hunt-constraints-mine
title: 扫雷约束
topicGroup: logic
summary: 将已翻开的数字写成八邻域计数，区分确定雷、安全格与多个局面共存。
aliases:
  - 扫雷推理
  - 八邻域
  - 布尔计数
sources:
  - id: mines
    title: Mines
    publisher: Simon Tatham
    url: https://www.chiark.greenend.org.uk/~sgtatham/puzzles/java/mines.html
    language: en
    kind: author-spec
    locator: 已开格数字、角邻接、总雷数
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
<!-- sources: mines -->

方格扫雷中的已开数字格表示附近地雷数，附近包含共享边或角的格。格子的显示状态提供线索，雷的位置仍是未知量。这类题可以表达为一组只取 0、1 的格变量与局部加法等式。

## 邻域与棋盘边界
<!-- sources: mines, parser -->

中央格最多有八个相邻格，边上非角落最多五个，角落最多三个。超出棋盘的坐标没有格。若写规则时把数字格本格也列进计数集合，须同时确保该格为白，使它的贡献为 0。

:::example 角落的三种位置
[输入]
3×3 盘左上格显示 1，左右下方之外的其余非邻格已知安全。
[结果]
雷可在第 2、4、5 格之一，共三盘。
[说明]
按行编号后，左上仅与右、下、右下相邻。这三个变量之和为 1。
:::

## 局部计数的极值
<!-- sources: mines, local -->

相邻已知雷先从数字中扣除。若余数为零，其余未知邻格全部安全。若余数等于未知邻格数量，这些格全部为雷。余数为负或大于未知邻格数量时，当前已知状态与数字冲突。

:::example 已标雷耗尽计数
[输入]
数字 2 的邻域中已有两个确认雷，另有三个未定格。
[结果]
三个未定格均安全。
[说明]
三个 0 或 1 变量之和是 2−2=0。
:::

## 重叠邻域
<!-- sources: mines, parser -->

不同数字使用相同的格变量，所以它们的约束可联立。若第一个数字的未知邻格是 A、B，第二个的未知邻格是 A、B、C，两者的剩余额都为 1，相减立即得到 C=0。

:::example 无法确定雷的位置
[输入]
3×3 盘只有中央格已开，显示 1，其余八格未知。
[结果]
完整搜索得到八盘，雷可在每个邻格上。
[说明]
这八格之和为 1。每盘恰有一个雷，但没有共同的雷位。
:::

## 全局计数与未知格
<!-- sources: mines, local -->

题面若提供总雷数，它是作用于整盘的另一条等式。有些局部未知不能靠相邻数字区分，加上总量后才可排除一部分候选。未翻开的格缺少数字信息，只有确实看到零线索时才应写成零约束。

## 常见误区

- 默认方格扫雷把对角邻居也计入。
- 未翻开的空白格与已打开的零格传达不同信息。
- 手动旗标是对雷位置的判断，只有确认或题面给出的雷位适合固定入模型。
