---
capabilityId: native:chemistry
title: 元素周期表与化学线索
topicGroup: matter
summary: 用原子序数定位元素，以规范符号区分候选，再核对周期与族。
aliases:
  - 元素
  - 周期表
  - 原子序数
  - Fe
  - 化学
sources:
  - id: weights
    title: Standard Atomic Weights
    publisher: CIAAW
    url: https://www.ciaaw.org/atomic-weights.htm
    language: en
    kind: standard
    locator: 现行表中的 Z、元素符号、代表值与区间
  - id: ccs
    title: 元素周期表中文版
    publisher: 中国化学会
    url: https://img.chemsoc.org.cn/web/2019/01/%E5%85%83%E7%B4%A0%E5%91%A8%E6%9C%9F%E8%A1%A8%E4%B8%AD%E6%96%87%E7%89%8820190123%E6%9C%80%E6%96%B0(1).pdf
    language: zh-CN
    kind: official-doc
    locator: 周期与族、元素符号及中文名
  - id: core
    title: 元素与化学式计算
    publisher: 迷雾工具箱
    url: /science/core.js
    language: zh-CN
    kind: implementation
    locator: splitElements、formula、元素表积分
  - id: table
    title: 118 种元素参考记录
    publisher: 迷雾工具箱
    url: /vendor/science/elements.json
    language: zh-CN
    kind: implementation
    locator: 原子序数、符号、中文名和原子量
---

## 介绍
<!-- sources: weights, ccs -->

元素按原子核的质子数区分，这个数称为原子序数，以 Z 表示。周期表按 Z 排列，将性质相关的元素归到若干纵列。在解读编号线索时，先辨别给的是原子序数、原子量还是周期坐标。

## 元素符号与原子序数
<!-- sources: ccs, weights, table -->

元素符号首字母大写，双字母符号的第二个字母小写。原子序数是整数，无需将旁边的相对原子质量四舍五入后查表。

:::example 查整数序号
[输入]
26、29、79
[结果]
Fe（铁）、Cu（铜）、Au（金）
[说明]
以原子序数查表。这些元素的原子量并非 26、29、79。
:::

## 周期和族
<!-- sources: ccs, weights -->

横排称为周期，竖列称为族。现行常见表采用 1 至 18 族编号。为避免表格过宽，镧系和锕系经常另外排在下方，元素序号依实际顺序连续。

:::example 以表格位置交叉确认
[输入]
第 4 周期、第 9 族
[结果]
Co（钴），原子序数 27
[说明]
由周期和族可核对同一元素，不能将 4、9 直接拼成原子序数。
:::

## 元素拼字有多种切分
<!-- sources: core, table -->

若一段字母只需按读音或大小写无关地拆作符号，搜索可在每个位置尝试所有符号长度。匹配完整字符串的切分可能不唯一，输出按标准大小写排版便于区别。

:::example 一串字母的三个切分
[输入]
bacon
[结果]
B · Ac · O · N → 5、89、8、7
Ba · C · O · N → 56、6、8、7
Ba · Co · N → 56、27、7
[说明]
每种都覆盖原字母，需要其他线索决定哪一个是出题依据。
:::

## 质量与同位素
<!-- sources: weights, table -->

同一元素可以有多个中子数不同的同位素。常见原子量来自材料同位素组成，可能给出区间或不确定度。有些元素无标准原子量时，资料表可能另用一个核素的质量数示意。

## 常见误区

- 原子序数是质子数，和样品的平均质量不同。
- 拼字可匹配元素符号，不代表构成一个稳定化学式。
- 镧系、锕系另排只是表格安排。

