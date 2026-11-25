---
capabilityId: native:stopping-distance
title: 反应与制动距离
topicGroup: maths
summary: 按直线恒减速度运动分开计算反应距离和制动距离，说明模型假设。
aliases:
  - 停车距离
  - 制动运动
  - 恒定减速度
sources:
  - id: motion
    title: Motion Equations for Constant Acceleration in One Dimension
    publisher: OpenStax
    url: https://openstax.org/books/college-physics-2e/pages/2-5-motion-equations-for-constant-acceleration-in-one-dimension
    language: en
    kind: author-spec
    locator: 第 2.5 节 v² 关系和 Example 2.12
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
<!-- sources: motion -->

停车过程可作两段理想化分析。先按初速度继续移动一段反应时间，再按恒定减速度减到零。这个模型说的是指定假设下的运动学结果，不能由此推定任意车辆在道路上的实测制动能力。

## 反应阶段
<!-- sources: speed, motion, model -->

用 v 表示米每秒，给的是 km/h 时除以 3.6。反应开始到制动动作生效的时间记作 tᵣ 秒，简化为速率不变，距离 dᵣ=v tᵣ。

:::example 两段速度先换单位
[输入]
108 km/h，反应时间 0.5 秒。
[结果]
初速度 30 m/s，反应距离 15 m。
[说明]
108÷3.6=30，30×0.5=15。
:::

## 制动阶段
<!-- sources: motion, model -->

由 v终²=v初²+2a实际Δx，代入终速零、a实际为负的减速度。令其正值大小为 a，则 d制动=v²/(2a)，制动时间 t制动=v/a。把制动距离与反应距离相加得到总距。

:::example 教材情形
[输入]
速率 30 m/s，反应 0.5 秒，减速度 7 m/s²。
[结果]
制动约 64.2857 m，总距离约 79.2857 m。
[说明]
平方速率得 900，除以 14 得制动段，再加反应段 15。
:::

## 速度变化的影响
<!-- sources: motion, speed, model -->

相同反应时间下，反应距离与速度成正比。相同减速度下，制动距离与速度平方成正比。因此若速度减半，两段距离分别减为一半和四分之一，合计没有固定的同一倍率。

:::example 将初速度减半
[输入]
54 km/h，反应 0.5 秒，减速度仍为 7 m/s²。
[结果]
反应 7.5 m，制动约 16.0714 m，总距约 23.5714 m。
[说明]
15 m/s 为上一算例速度的一半。
:::

## 模型与道路情况
<!-- sources: motion, model -->

减速度可随坡度、地面、制动系统和轮胎状态变化。驾驶者的反应时间也不能从单一数字推定。比较模型输出时，应记录假设条件和单位。

## 常见误区

- 把 km/h 数字直接代入米和秒的等式会改变数量级。
- 只算制动阶段会遗漏反应距离。
- 倍速改变的反应距离与制动距离遵循不同关系。
