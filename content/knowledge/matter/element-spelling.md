---
capabilityId: native:element-spelling
title: 元素符号拼词
topicGroup: matter
summary: 用正式元素符号覆盖整个字母串，计算每条分法的原子序数及候选总数。
aliases:
  - Element spelling
  - 周期表拼字
  - 元素符号拆分
  - 原子序数
sources:
  - id: iupac
    title: Periodic Table of Elements
    publisher: IUPAC
    url: https://iupac.org/what-we-do/periodic-table-of-elements/
    language: en
    kind: official-doc
    locator: 最新版正式元素名称、符号与原子序数
  - id: new
    title: Names and Symbols of the Elements 113, 115, 117 and 118
    publisher: IUPAC
    url: https://iupac.org/recommendation/names-and-symbols-of-the-elements-with-atomic-numbers-113-115-117-and-118/
    language: en
    kind: standard
    locator: Nh、Mc、Ts、Og 最新正式命名建议
  - id: engine
    title: 迷雾工具箱元素符号分解实现
    publisher: 迷雾工具箱
    url: /expansion/element-core.js
    language: zh-CN
    kind: implementation
    locator: elementDecompositions，精确计数、大小写、排名与分页
---

## 介绍
<!-- sources: iupac, new -->

元素符号拼词把一段字母拆成周期表中的正式符号。每个符号对应一种元素，可进一步读出原子序数或名称。任务的结果是符号序列，通常用作谜题中的表示转换，例如将符号串转换成一组数字。

## 符号与原子序数
<!-- sources: iupac, new -->

现行 118 个正式元素符号各使用一个或两个字母。双字母符号以大写字母开头并接小写字母。比如 Co 是钴，原子序数 27。C 和 O 则分别为碳与氧，原子序数为 6 与 8。对历史材料还需留意当时的名称和符号版本，现行表使用正式命名的 Ts 与 Og。

## 用完整路径计数
<!-- sources: iupac, engine -->

把字符串的每个起点至终点看成位置图。若某处一个或两个相邻字母匹配符号，便连到下一个位置。设 C(i) 是从位置 i 到末尾的分法数，C(末尾)=1，其他位置的 C(i) 等于其所有可达下一位置的 C(j) 之和。一个局部前缀如果不能到达末尾，该路径贡献为 0。

## 大小写和等价选择的核对
<!-- sources: iupac, new, engine -->

例子同时核对符号、原子序数和路径数量。顺序按当前枚举先检查单字母、再检查双字母取得。路径数量用整数精确存储，因此大候选集也可以单独查看指定位置。

:::example 同一拼写的两种读法
[输入]
Co，先忽略大小写，再开启严格大小写。
[结果]
忽略时为 C + O（6、8）和 Co（27）两条。严格时只剩 Co。
[说明]
忽略时 c、o 可以各自匹配一个符号。严格时单独的氧符号须大写 O，因此原来的小写 o 不能开一段。
:::

:::example 三条完整路径
[输入]
BaCoN，忽略大小写。
[结果]
B + Ac + O + N：5、89、8、7。
Ba + C + O + N：56、6、8、7。
Ba + Co + N：56、27、7。
[说明]
第一个位置可先走 B 或 Ba。两支后续的可达路径数分别为 1 和 2。
:::

:::example 使用较新的正式符号
[输入]
OgTs，严格匹配大小写。
[结果]
Og + Ts，原子序数为 118、117。
[说明]
Og 与 Ts 均为 IUPAC 正式符号。在这组输入中其他切法不能完整覆盖。
:::

:::example 指数增长的候选
[输入]
将 CO 连续拼接 60 次，选择忽略大小写。
[结果]
共 1152921504606846976 种，最后一条由 60 个 Co 组成。
[说明]
每对 CO 可独立选单一符号 Co 或 C + O。相邻两对之间的 OC 不能成为正式符号，所以总数恰为 2⁶⁰。
:::

## 用结果回应线索
<!-- sources: iupac, engine -->

看到一个可拆分的串之后，还要根据材料确定使用哪条路径和哪一个字段。符号长度、结果个数、数字范围都可帮助限定候选。分页只是按顺序展示路径，剩余候选仍在精确计数内。

## 常见误区

- 符号序列用于拼字，不证明这些写法都表示有效化合物。
- 原子序数是质子数，和元素的相对原子质量是不同数据。
- 遇到多个可行前缀应检查走到末尾的各条分法，最长的前缀未必能完成全串。

