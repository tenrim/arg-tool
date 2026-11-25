---
capabilityId: native:baudot
title: 波多码与打孔纸带
topicGroup: communication
summary: 以五位码字和字母／数字状态表示电传信息，并读出纸带的孔位顺序。
aliases:
  - Baudot
  - ITA2
  - ITA1
  - US TTY
  - 五孔纸带
  - LTRS
  - FIGS
sources:
  - id: itu
    title: ITU-T S.1 国际电报字母表第 2 号
    publisher: 国际电信联盟
    url: https://www.itu.int/rec/T-REC-S.1/en
    language: en
    kind: standard
    locator: 五单位表、字母和数字移位
  - id: codec
    title: 固定 Baudot 字母表和移位算法
    publisher: 迷雾工具箱随包上游
    url: /vendor/basics/baudot.js
    language: en
    kind: implementation
    locator: ITA1、ITA2、US_TTY 和移位状态
  - id: model
    title: 五位码字格式及纸带图
    publisher: 迷雾工具箱
    url: /basics/model.js
    language: zh-CN
    kind: implementation
    locator: parseWords、formatWords、tapeSVG
---

## 介绍
<!-- sources: itu, codec -->
波多码通常指一族电报五单位字符代码。每个码字有五位，能表达 32 种组合。字母状态和数字或符号状态复用部分组合，由移位码字指示如何解释随后的代码。

## 字母和数字状态的转换
<!-- sources: itu, codec -->
在 ITA2 中，FIGS 切入数字和符号状态，LTRS 切回字母状态。检测到移位后，仍按五位读取码字，只切换使用的查表列。ITA1、ITA2 和 US TTY 的映射并非全部相同。

:::example ITA2 的 A1A
[输入]
A1A，使用 ITA2
[结果]
00011 11011 10111 11111 00011
[说明]
A 是 3，FIGS 是 27。数字状态下 23 表示 1。31 切回字母状态，末项 3 再次表示 A。
:::

## 二进制、十进制和十六进制表示
<!-- sources: itu, model -->
二进制、十进制或十六进制只改变五位码字的外在写法。二进制组应恰有五位，十进制在 0 至 31，十六进制最多为 1F。每个码字的边界应保留。

:::example US TTY 的两位十六进制写法
[输入]
A1A，使用 US TTY，输出十六进制
[结果]
03 1B 17 1F 03
[说明]
码字 3、27、23、31、3 依序写成两位十六进制。此短串与 ITA2 的数字映射恰好相同。
:::

## 纸带孔位和取向
<!-- sources: model, itu -->
纸带图以一列标记一个码字的五位。每行从左到右读取各列。图中排列从 bit4 到 bit0，底部另有小标记作位置辅助，小点不属于数据位。实际扫描的纸带需要来自材料的方向线索。

:::example 从位图回读两个码字
[输入]
纸带两列自上而下为 00011 与 00011
[结果]
ITA2 字母状态下读作 AA
[说明]
每列最低两位为 1，即十进制 3，两列之间没有 FIGS 移位。
:::

## 无法可靠还原的材料
<!-- sources: itu, codec, model -->
纸带从中间截断后，起始的字母／数字状态可能不明。错一列还可能让随后部分处于另一个状态。应先确定变体、方向和分组，从可识别的换挡或文本对照证据复查。

## 常见误区

- 字母和数字状态可以给相同码字不同解释。
- 移位码通常改变状态而不打印对应字符。
- 纸带的小定位标记不计入五位数据。
- ITA1 和 ITA2 不能仅因同为五位就互换。
