---
capabilityId: native:pigpen
title: 猪圈密码
topicGroup: communication
summary: 按网格边线、叉形区域和点号将图案反查为字母。
aliases:
  - Pigpen
  - Masonic cipher
  - 共济会密码
  - 猪圈
sources:
  - id: nist
    title: The Pig Pen Cipher
    publisher: NIST / NICE
    url: https://www.nist.gov/system/files/documents/2021/06/25/ccaw_pig_pen_cipher.pdf
    language: en
    kind: official-doc
    locator: 井字格与叉形格示例
  - id: symbols
    title: 原生符号面板
    publisher: 迷雾工具箱
    url: /round1/symbols.js
    language: zh-CN
    kind: implementation
    locator: 26 字母图案的路径和有点变体
---

## 介绍
<!-- sources: nist, symbols -->
猪圈密码用网格的部分边线或叉形分区表示字母。附加圆点可在同样的外框上区分另一套符号。纸面常见的表由两个井字格和两个叉形格组成。

## 井字格的边线
<!-- sources: nist, symbols -->
用井字线分九个位置。左上角格的边界由右边和下边组成，中间格有上下左右四边。空心方框可映射到无点井字格的中心；带点方框对应另一张井字格的中心。

:::example 同一方框的两套读法
[输入]
空心方框；中心带一点的方框
[结果]
E；N
[说明]
两者同为中心格，无点用于 A 至 I，有点用于 J 至 R。
:::

## 边角格的方向
<!-- sources: nist, symbols -->
同一基本角形旋转后，会指向网格的不同位置。需要区分实际画出的边与空位的朝向。比如左上角的网格区域只有右、下两道内部边。

:::example 第一位置的点标记
[输入]
一段底边加一段右边；同样边线且格内有一点
[结果]
A；J
[说明]
两个图案的几何位置相同，点号决定选用哪套井字格。
:::

## 叉形分区
<!-- sources: nist, symbols -->
叉形格有上、右、下、左四个区域，常用来容纳剩余八个字母。这里依上、右、下、左顺序，无点对应 S、T、U、V，有点对应 W、X、Y、Z。

:::example 向上敞开的叉形
[输入]
两条斜边组成向上敞开的 V 形；同形且内部有一点
[结果]
S；W
[说明]
所表示的区域在叉形的上方，点号将无点与带点两套符号区分开。
:::

## 识读材料的完整线索
<!-- sources: nist, symbols -->
边界线可能因裁剪丢失，点也可能来自污点或标注。核对时应识别整张图是否镜像、旋转，检查点是否在区域内部，并尽可能找题面给的对应表。不同材料可重新排列字母。

## 常见误区

- 同一个外框带点与不带点可以是不同字母。
- 角形旋转或反射后可能换成另一栏。
- 猪圈密码有不同的字母排列版本。
- 无法确认线条和点号时，解读结果需要保留候选。
