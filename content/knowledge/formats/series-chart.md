---
capabilityId: op:Series%20chart
title: 序列图
topicGroup: formats
summary: 按系列名和首次出现的 X 标签绘制数值序列，解释等距分类轴与重复记录。
aliases:
  - Series chart
  - 序列折线
  - 系列标签
sources:
  - id: d3
    title: D3 Point scales
    publisher: D3
    url: https://d3js.org/d3-scale/point
    language: en
    kind: official-doc
    locator: 按标签的离散域、范围与等距位置
  - id: engine
    title: CyberChef 11.5.0 图表模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Charts.js
    language: en
    kind: implementation
    locator: Series chart；JR 解析、首次出现标签、覆写重复值与多系列绘制
---

## 介绍
<!-- sources: d3, engine -->
序列图用一条或多条折线显示观测的先后变化。本图从三列数据读取系列名、X 标签和数值。X 标签可以是编号或时刻的文字；画面按标签槽位连接记录。

## 标签顺序和间距
<!-- sources: d3, engine -->
横轴以标签第一次出现的顺序建立离散域。若有 n 个不同标签且 n 大于 1，第 i 个在横轴范围中的位置相差固定步长。标签 10、20、50 可以等距；日期字符串也不会自动换算成相隔多少小时。

## 数值关联与重复
<!-- sources: engine -->
系列名和 X 标签一起唯一标出一个槽位。同一系列的同一标签若出现多次，后读到的记录会更新那个值。不同系列共用横向标签，数据里缺少的槽位不自动填零。

## 读入顺序的例子
<!-- sources: d3, engine -->
以下各行都按「系列、标签、数值」输入，作为数据行直接读取。

:::example 数字标签的等距槽位
[输入]
A,10,2
A,20,4
A,50,8
[结果]
A 有三个点，标签依次 10、20、50，相邻横向间距相同
[说明]
20 到 50 的数值间隔更大，但标签仍占一个槽位。
:::

:::example 同一槽位写入两次
[输入]
A,1,7
A,1,11
A,2,2
[结果]
A 在标签 1 的值为 11，标签 2 的值为 2
[说明]
后读的 11 替换同系列同标签的 7。
:::

:::example 两个系列首次出现标签的顺序
[输入]
A,T1,2
A,T3,8
B,T2,4
[结果]
横轴域按 T1、T3、T2 排列；A 有两点，B 有一点
[说明]
顺序取决于输入行，不按标签名称排序，缺失值没有补零。
:::

## 读图时的尺度
<!-- sources: d3, engine -->
序列图可辨认涨落或异常点。若样本间隔不等，折线的视觉坡度不能当成单位时间的变化率。需要对照实际间隔时，可同时存下原时间戳，并用按数值比例映射的轴另画。

## 常见误区
- 把时间写成标签不自动生成连续时间轴。
- 同一系列内重复标签不是独立观测点的储存方式。
- 缺测应与数值为零区分，二者会影响对走势的理解。
