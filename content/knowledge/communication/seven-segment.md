---
capabilityId: native:seven-segment
title: 七段数码管
topicGroup: communication
summary: 用七个可点亮线段的集合识读十进制数码。
aliases:
  - seven segment
  - 七段显示
  - 数码管
sources:
  - id: ti
    title: SN74LS47 BCD-to-Seven-Segment Decoder
    publisher: Texas Instruments
    url: https://www.ti.com/product/SN74LS47
    language: en
    kind: official-doc
    locator: 显示译码器、线段字母和显示例图
  - id: symbols
    title: 原生符号面板
    publisher: 迷雾工具箱
    url: /round1/symbols.js
    language: zh-CN
    kind: implementation
    locator: patterns 中的十个十进制数字及 a–g 段
---

## 介绍
<!-- sources: ti, symbols -->
七段显示器将七根能分别发光的线段排成近似数字 8 的外形。不同线段组合能表示十进制 0 至 9。元件还可另外带一个小数点，通常作为独立部件处理。

## 七条线段的命名
<!-- sources: ti, symbols -->
顶边叫 a，右上与右下依次为 b、c，底边为 d，左下和左上分别为 e、f，中横为 g。描述图形可列出发亮段集合，不要求抄写时按固定先后点亮。

:::example 右竖两段
[输入]
只亮右上 b 与右下 c
[结果]
1
[说明]
二者形成右侧竖线，默认数码表的 1 没有其他段。
:::

## 区分相近数字
<!-- sources: ti, symbols -->
在常见表中，0 亮周围六段而不亮中间，8 亮全部七段。选完整段集合比单纯数有几个段可靠，因为多个数字会有相同段数。

:::example 只差中间一段
[输入]
abcdef 和 abcdefg
[结果]
0 和 8
[说明]
这两个图形只在 g 段的开关上不同。
:::

## 由段集合还原数字
<!-- sources: ti, symbols -->
比较相同段数的候选时，可以核对左右竖线。例如 2 和 3 的三条横线相同，且都亮右上 b。2 的另一竖段在左下，3 的另一竖段在右下。

:::example 两个五段数字
[输入]
abdeg 和 abcdg
[结果]
2 和 3
[说明]
前者有 e、无 c，后者有 c、无 e。
:::

## 器件电平与画面取向
<!-- sources: ti, symbols -->
若材料记录的是芯片输出电平，应先确定译码器采用高有效还是低有效。SN74LS47 是低有效的一个例子。对扫描图或照片，应先判断显示器朝向再对应 a 至 g。不同硬件或字型可能用不同的细节形状。

## 常见误区

- 点亮线路的顺序不会改变段集合。
- 0 和 8 的区别在中间的 g。
- 相同的点亮段数不保证是相同数字。
- 小数点和七段译码器的高低电平不能直接当作额外一段。
