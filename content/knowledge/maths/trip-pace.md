---
capabilityId: native:trip-pace
title: 行程与配速
topicGroup: maths
summary: 根据实际路程、移动时间和停留计算平均速率及每公里配速。
aliases:
  - 每公里配速
  - 平均速度
  - 行程时间
sources:
  - id: speed
    title: Time, Velocity, and Speed
    publisher: OpenStax
    url: https://openstax.org/books/college-physics-2e/pages/2-3-time-velocity-and-speed
    language: en
    kind: author-spec
    locator: 第 2.3 节平均速率
  - id: model
    title: 行程和财务计算公式实现
    publisher: 迷雾工具箱
    url: /practical/travel-finance-model.js
    language: zh-CN
    kind: implementation
    locator: calculateTravelFinance 与 loanSchedule 的运算口径
---

## 介绍
<!-- sources: speed -->

行程可以用总路程、时间和平均速率描述。运动训练也常用配速，即走或跑一公里所需的时长。统计时还要约定时间是否包含停留，才能比较两项结果。

## 路程、速率和时间
<!-- sources: speed, model -->

路程 s 用 km，移动时间 t 用小时，移动平均速率 v=s/t。可改写成 t=s/v 或 s=vt。秒和分钟需要先换成小时，或在计算后统一显示为分钟。

:::example 十公里的移动用时
[输入]
路程 10 km，移动平均速率 12 km/h。
[结果]
移动时间 50 分钟。
[说明]
10÷12 小时，再乘 60 得 50 分钟。
:::

## 配速的倒数关系
<!-- sources: speed, model -->

每公里秒数 p=3600/v。配速越小，平均速率越快。若输入 m 分 s 秒每公里，先得到总秒数 60m+s，再用 3600 除以这个值。

:::example 八公里配速
[输入]
8 km，配速每公里 6 分 15 秒。
[结果]
速率 9.6 km/h，累计移动 50 分钟。
[说明]
每公里 375 秒。3600÷375=9.6，8×375=3000 秒。
:::

## 将停留另行计入
<!-- sources: speed, model -->

总时长是移动时间与停留时长之和。统计全程速率时以总时长作分母；统计移动速率仅用移动时长。路程分子不因停留而增加。

:::example 中途停留的步行
[输入]
移动平均 4 km/h，行走 90 分钟，停留 30 分钟。
[结果]
路程 6 km，总计 120 分钟，全程平均 3 km/h。
[说明]
4×1.5=6 km，6÷2=3 km/h。
:::

## 选用哪种路程
<!-- sources: speed, model -->

公式使用实际移动的路程，不是两点直线距离或地图上的大圆距离。对于折线路线或多个阶段，应先加总每段长度与相应时间，再计算整段平均速率。

## 常见误区

- 配速 6 分 15 秒不等于 6.15 分钟。
- 加入停留后，总时长和平均移动时长要分开。
- 不等时长的几段速度不能直接求简单平均。
