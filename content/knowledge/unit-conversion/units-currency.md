---
capabilityId: native:units-currency
title: 货币单位
topicGroup: unit-conversion
summary: 区分货币子单位、历史固定比率与随报价时点变化的跨币种换算。
aliases:
  - 单位换算
  - 汇率
  - 欧元
  - 美元
  - 人民币
  - 欧分
sources:
  - id: qalc
    title: Unit List
    publisher: Qalculate!
    url: https://qalculate.github.io/manual/qalculate-definitions-units.html
    language: en
    kind: official-doc
    locator: 原计算内核单位目录及类别
  - id: eur
    title: Types of euro coins
    publisher: European Commission
    url: https://economy-finance.ec.europa.eu/euro/euro-coins-and-notes/euro-coins/types-euro-coins_en
    language: en
    kind: official-doc
    locator: 1 欧元等于 100 欧分
  - id: ref
    title: Euro foreign exchange reference rates
    publisher: European Central Bank
    url: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html
    language: en
    kind: official-doc
    locator: 报价基准和信息用途
  - id: dem
    title: Exchanging DEM for Euro
    publisher: Deutsche Bundesbank
    url: https://www.bundesbank.de/en/tasks/cash-management/dem-banknotes-and-dem-coins/-/exchanging-dem-for-euro-616928
    language: en
    kind: official-doc
    locator: 1 EUR＝1.95583 DEM
  - id: worker
    title: 浏览器计算入口
    publisher: 迷雾工具箱
    url: /qalculate/worker.js
    language: zh-CN
    kind: implementation
    locator: 固定内核初始化与表达式计算
---

## 介绍
<!-- sources: eur, ref, qalc -->
货币单位可以指同一货币的主单位与子单位，也可以指不同货币。前一种关系由法定面值确定，后一种关系可能来自带日期的市场参考价或法定的历史转换表。

## 同一币种的子单位
<!-- sources: eur, qalc -->
一欧元等于一百欧分。欧元换为欧分时将数字乘一百，由欧分换为欧元时除以一百。这种换算只改变金额写法。

:::example 欧分到欧元
[输入]
100 eurocent to EUR
[结果]
€1
[说明]
100÷100＝1。
:::

:::example 合并欧元和欧分
[输入]
(3 EUR + 45 eurocent) to eurocent
[结果]
345 欧分
[说明]
把 3 欧元写成 300 欧分，加 45 欧分即得 345 欧分。
:::

## 带方向的报价
<!-- sources: ref, qalc -->
设 1 A 可换 q B。在相同报价条件下，把 a A 折成 B 乘 q，把 b B 折成 A 除 q。若多个币种均以同一种基准货币报价，可先回到基准，再按第二笔比率换过去。

## 历史固定比率
<!-- sources: dem, qalc -->
欧元转换时，历史货币和欧元之间可以有制度规定的固定比例。例如德国马克的比率为 1 EUR 对 1.95583 DEM。公式应从完整比率推导，过早舍入倒数会累积误差。

:::example 德国马克的历史等值
[输入]
1.95583 DEM to EUR
[结果]
€1
[说明]
以固定比率 1.95583 DEM/EUR 作除数，得到 1 EUR。这是一条历史换算关系。
:::

## 参考价与可用数据
<!-- sources: ref, worker, qalc -->
参考汇率通常附日期和报价基准，实际交易还会涉及买卖方向及费用。这里的浏览器内核运行随包单位定义，不查询实时行情。缺少有效比率时，没有依据从单位名称推出另一币种金额。可用的历史比率也不代表相应货币仍流通。

## 常见误区

- 欧分与欧元的比例不会随汇率行情变化。
- 读取外币报价时应保留分子、分母及基准日期。
- 信息用途的参考价与实际交易价格可以不同。
- 历史固定换算和现行币种的市场报价有不同的来源与时间含义。
