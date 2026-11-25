---
capabilityId: native:color-codes
title: 色码与排列编码
topicGroup: communication
summary: 按器件色环、线对配色或给定符号顺序读出不同含义的编码。
aliases:
  - 电阻色环
  - 电容色码
  - 线缆色码
  - 排列排名
sources:
  - id: vishay
    title: Color Code and Standard Resistance Series
    publisher: Vishay
    url: https://www.vishay.com/docs/20143/colorcod.pdf
    language: en
    kind: official-doc
    locator: 电阻数字、倍率、容差及温度系数
  - id: poly
    title: Capacitor Color Code — 电容色码转换
    publisher: dCode
    url: https://www.dcode.fr/capacitor-color-code
    language: en
    kind: official-doc
    locator: 有效数字、倍率与 pF 换算
  - id: cable
    title: Colour Codes & Cable Make Up
    publisher: Caledonian Cables
    url: https://www.caledonian-cables.co.uk/telephone/order/Colour%20Codes.htm
    language: en
    kind: official-doc
    locator: 电话线对颜色
  - id: impl
    title: completion/codes.js
    publisher: 迷雾工具箱
    url: /completion/codes.js
    language: zh-CN
    kind: implementation
    locator: resistor、capacitor、cable、permutation
---

## 介绍
<!-- sources: vishay, cable, impl -->

色码可让器件或线缆用少量颜色标记数值和编号。排列排名则给一张事先规定顺序的符号表编号。读取前要先看载体和符号位置。

## 电阻的有效数字与倍率
<!-- sources: vishay, impl -->

三环和四环常用两个数字，五环和六环用三个。之后乘十进制倍率。色环还可给容差，第六环则可标温度系数。

:::example 反查四环值
[输入]
黄 紫 红 金
[结果]
4700 Ω、±5%；区间 4465–4935 Ω
[说明]
黄 4、紫 7、红倍率 100、金容差 5%。
:::

:::example 六环的额外字段
[输入]
棕 黑 黑 红 棕 红
[结果]
10000 Ω，±1%，50 ppm/K
[说明]
用三位有效数字；最后红色采用温度系数表。
:::

## 电容的系列与单位
<!-- sources: poly, impl -->

电容三环数值可按有效数字和 pF 倍率计算。若有容差与耐压，应依据所选器件系列的约定；反向上色需要数值能按有效位精确表示。

:::example 五环聚酯电容
[输入]
棕 黑 黄 黑 红
[结果]
100000 pF、±20%、250 V
[说明]
10×10⁴ pF，后两环使用示例所选聚酯色码表。
:::

## 线缆的主色和辅色
<!-- sources: cable, impl -->

25 对线以白、红、黑、黄、紫为主色，以蓝、橙、绿、棕、灰为辅色。主色每五对轮替，辅色每对变化。

:::example 读取组边界
[输入]
第 1、6、25 对
[结果]
白／蓝、红／蓝、紫／灰
[说明]
设主副色索引从零起，编号为 5i+j+1。
:::

## 排列的阶乘权重
<!-- sources: impl -->

从给定的有序符号池开始。在第一个位置，统计排在当前符号前且未被用过的个数，乘剩余位置的阶乘。移除该符号，依次计算并求和。

:::example 四个符号的排名
[输入]
顺序 A B C D；排列 B A C D
[结果]
从零开始的排名为 6
[说明]
第一位之前只有 A，贡献 3!。
:::

## 常见误区

- 容差与耐压等附加环不参与有效数字计算。
- 电阻与电容的同色环可能代表不同含义。
- 排列排名取决于符号顺序，并非固定按字典排序。

