---
capabilityId: native:life
title: 生命游戏
topicGroup: simulation
summary: 按 B3/S23 同步更新八邻域，辨认静物、振荡器与 RLE 图案。
aliases:
  - 生命游戏
  - Conway
  - B3/S23
  - 元胞自动机
  - 闪烁器
sources:
  - id: gardner
    title: The fantastic combinations of John Conway’s new solitaire game life
    publisher: Martin Gardner
    url: https://ibiblio.org/lifepatterns/october1970.html
    language: en
    kind: author-spec
    locator: 1970 年原刊关于算法规则和早期图案的说明
  - id: rle
    title: "Golly Help: File Formats"
    publisher: Golly 项目
    url: https://golly.sourceforge.io/Help/formats.html
    language: en
    kind: official-doc
    locator: Extended RLE format；o、b、$ 和 !
  - id: core
    title: 生命游戏的 RLE 与迭代入口
    publisher: 迷雾工具箱
    url: /round4/life.js
    language: zh-CN
    kind: implementation
    locator: parseRLE 与工作区一代推进
---

## 介绍
<!-- sources: gardner -->

生命游戏是一种二维元胞自动机。每格只有死和活两种状态，每一代只由上一代的邻居状态决定。它可出现不变的图案、反复变化的图案和移动的图案。

## 八邻域与同步计算
<!-- sources: gardner, core -->

一格的八个邻居含四个正邻和四个斜邻。B3 表示死格恰有三个活邻居时出生，S23 表示活格有两个或三个活邻居时存活。所有判断读取同一代，最后一起写入下一代。

:::example 单个活格
[输入]
x = 1, y = 1, rule = B3/S23
o!
[结果]
一代之后没有活格
[说明]
这格无邻居，相邻死格也无法凑够三个活邻居。
:::

## 不变的方块
<!-- sources: gardner, rle -->

2×2 活格方块中每格恰有另外三个活邻格。方块外围死格最多有两个活邻居，所以不产生变化。这种图案称为静物。

:::example 两代保持原样
[输入]
x = 2, y = 2, rule = B3/S23
2o$2o!
[结果]
每一代仍是 2×2 方块
[说明]
行之间以 $ 分隔，o 表示活格。
:::

## 振荡器的周期
<!-- sources: gardner, core -->

三个连续活格横排时，两端只剩一个邻居而死亡，中间活格存活。中点正上和正下的死格各有三个邻居，从而出现纵排。下一代同理回到横排。

:::example 三格闪烁器
[输入]
x = 3, y = 1, rule = B3/S23
3o!
[结果]
横三格 → 纵三格 → 横三格
[说明]
同一位置两代复原，周期为 2。
:::

## 保存与可见范围
<!-- sources: rle, core -->

RLE 用次数简写一串 o 或 b，$ 换行，! 终止。RLE 的表头声明初始图案的宽高，不限制下一代的生长。导出可见区域时，屏幕外的细胞不会写入当前快照。

## 常见误区

- 斜对角的四格也计入邻域。
- 同步更新不允许用本代刚更新的格子影响相邻格。
- RLE 初始盒的边界不等于演化边界。

