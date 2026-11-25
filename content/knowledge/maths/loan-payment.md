---
capabilityId: native:loan-payment
title: 贷款还款计算
topicGroup: maths
summary: 解释固定利率等额本息的月供公式、逐期本金与利息以及分币取整。
aliases:
  - 等额本息
  - 还款表
  - 月供
  - 固定利率
sources:
  - id: math
    title: The Basics of Loans
    publisher: OpenStax
    url: https://openstax.org/books/contemporary-mathematics/pages/6-8-the-basics-of-loans
    language: en
    kind: author-spec
    locator: 第 6.8 节，月供公式和 Example 6.78
  - id: cfpb
    title: How does paying down a mortgage work?
    publisher: U.S. Consumer Financial Protection Bureau
    url: https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/
    language: en
    kind: official-doc
    locator: 本金、利息与逐期减少的余额
  - id: model
    title: 行程和财务计算公式实现
    publisher: 迷雾工具箱
    url: /practical/travel-finance-model.js
    language: zh-CN
    kind: implementation
    locator: calculateTravelFinance 与 loanSchedule 的运算口径
---

## 介绍
<!-- sources: math, cfpb -->

固定利率等额本息是在约定期限内按期支付本金和利息的计算模型。每期先按剩余本金计利息，其余付款用于减少本金。随着余额下降，同样期款中利息比例通常减少。

## 理论月供
<!-- sources: math, model -->

初始本金记作 P，名义年利率 r 取小数，月利率 i=r/12，期数 N。当 i 大于零，月供 M=Pi/[1−(1+i)^(−N)]。式子等价于把 N 期付款按月折现后与初始本金相等。零利率时用 M=P/N。

:::example 六十期的理论值
[输入]
本金 28500 元，名义年利率 3.99%，60 期。
[结果]
不取整的理论值约 524.742275 元。
[说明]
将 i=0.0399/12 与 N=60 代入。
:::

## 从余额递推
<!-- sources: math, cfpb, model -->

设期初余额 B，理论当期利息为 Bi。用实际付款减去当期利息得到归还的本金，再从 B 扣除。输出若要求精确到分，还需先明确定义在哪一步、向哪个方向取整。

:::example 两期还款逐行核对
[输入]
本金 1000 元，年利率 12%，两个月。月供向上取整到分，每期利息四舍五入到分。
[结果]
首期付 507.52 元，其中利息 10.00 元，余本金 502.48 元。末期付 507.50 元。
[说明]
末期利息为 502.48×1%，取到分后为 5.02 元，再加余额。
:::

## 分币与最后一期
<!-- sources: math, model -->

期款向上取到分、逐期利息四舍五入以及末期按剩余金额结清，是示例的计算口径。理论月供即使同样，合同使用不同付息天数和舍入办法也可能生成不同还款表。

:::example 零利率仍有分币差
[输入]
本金 100.00 元，零利率，3 期，常规期款向上到分。
[结果]
33.34、33.34、33.32 元，合计 100.00 元。
[说明]
理论月供是循环小数。最后一期只付剩余本金。
:::

## 计算结果涵盖的金额
<!-- sources: cfpb, model -->

这类表用于理解按固定利率与固定期次偿还本金和利息。实际合同还可能有手续费、险费、逾期条件和提前还款安排。月供与整份合同总成本应根据相应项目分别核对。

## 常见误区

- 每个月应从当时的剩余本金出发计算利息。
- 整个还款期间的本金部分通常不会每期一样。
- 理论公式保留的小数与实际逐期取整后的末期付款可能不同。
