---
capabilityId: native:interest-growth
title: 利息与本息增长
topicGroup: maths
summary: 从本金、名义利率和计息频率推导单利与复利，区分名义利率和有效年利率。
aliases:
  - 单利
  - 复利
  - 有效年利率
sources:
  - id: simple
    title: Simple Interest
    publisher: OpenStax
    url: https://openstax.org/books/contemporary-mathematics/pages/6-3-simple-interest
    language: en
    kind: author-spec
    locator: 第 6.3 节 I=Prt
  - id: comp
    title: Compound Interest
    publisher: OpenStax
    url: https://openstax.org/books/contemporary-mathematics/pages/6-4-compound-interest
    language: en
    kind: author-spec
    locator: 第 6.4 节终值与有效年利率
  - id: model
    title: 行程和财务计算公式实现
    publisher: 迷雾工具箱
    url: /practical/travel-finance-model.js
    language: zh-CN
    kind: implementation
    locator: calculateTravelFinance 与 loanSchedule 的运算口径
---

## 介绍
<!-- sources: simple, comp -->

单利和复利是两种不同的累计方式。单利按最初本金计息，复利将已计的利息归入下一期的计算基数。下列计算假设利率固定、无中途投入和取出，也未扣除税费。

## 单利在本金上计息
<!-- sources: simple, model -->

设本金为 P，年利率 r 写成小数，经过 t 年时，利息 I=Prt，本息 A=P+I。若计息期不足一年，需要按指定的年数口径换算。

:::example 两年单利
[输入]
本金 1000 元，固定年利率 5%，两年。
[结果]
利息 100 元，本息 1100 元。
[说明]
1000×0.05×2=100。
:::

## 复利逐期增长
<!-- sources: comp, model -->

若每年计息 n 次，期利率 i=r/n。每过一期，余额乘 1+i，完成 N 期时 A=P(1+i)^N。复利利息是 A−P，此口径的年数为 N/n。

:::example 五年按月复利
[输入]
本金 5000 元，名义年利率 3.8%，每年 12 期，共 60 期。
[结果]
本息约 6044.43 元，利息约 1044.43 元。
[说明]
5000×(1+0.038/12)^60 约为 6044.4332。
:::

## 有效年利率
<!-- sources: comp, model -->

有效年利率是按当前期利率经过全年计息的净增长比例，即 (1+r/n)^n−1。它和直接声明的名义年利率不同，按年仅计一次时两者才在此固定模型内相等。

:::example 12% 名义年利率每月一次
[输入]
本金 1000 元，名义年利率 12%，按月复利 12 期。
[结果]
本息约 1126.83 元，有效年利率约 12.6825%。
[说明]
月利率 1%，全年系数为 1.01^12。
:::

## 年数与计息条款
<!-- sources: simple, comp, model -->

实际产品可规定工作日、有效付息日期、日数规则、资金进出和结息取整。计算公式示范的是固定期长与单次本金，实际核对需要把合同条件的每个量转换成相同的口径。

## 常见误区

- 百分数须先换成小数，如 5% 是 0.05。
- 60 个按月计息期等于 5 年。
- 名义利率、有税费后的收益和有效年利率各有定义。
