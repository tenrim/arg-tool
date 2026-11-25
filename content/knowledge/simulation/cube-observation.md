---
capabilityId: native:cube
title: 魔方观察
topicGroup: simulation
summary: 认识魔方面转动和逆序撤销，用模型对照公式对应的实际状态。
aliases:
  - 魔方
  - R
  - U
  - F
  - 转动记号
  - 逆公式
sources:
  - id: wca
    title: WCA Regulations
    publisher: World Cube Association
    url: https://www.worldcubeassociation.org/regulations/
    language: en
    kind: standard
    locator: Article 12：Notation
  - id: cubing
    title: cubing.js
    publisher: cubing.js 项目
    url: https://github.com/cubing/cubing.js
    language: en
    kind: official-doc
    locator: 算法记号和可视化组件
  - id: core
    title: 基本面转动解析与多形状展示
    publisher: 迷雾工具箱
    url: /round1/cube.js
    language: zh-CN
    kind: implementation
    locator: parseCubeMoves、三阶兼容状态
---

## 介绍
<!-- sources: wca, cubing -->

魔方公式依次记录若干层或整体转动，帮助重现状态。对三阶魔方，最常见的六个字母分别表示上、右、前、下、左、后。观看时需要先确定哪个颜色面朝前、朝上。

## 外层的角度和方向
<!-- sources: wca, core -->

面转方向按直接面向被转动那一面的视角理解。单字母表示顺时针 90°，撇号表示逆时针 90°，数字 2 表示 180°。从正面观看右面时，应避免用相机视角代替右面正对视角。

:::example 检查第四次四分之一转
[输入]
在还原态依次执行 R R R R
[结果]
回到还原态
[说明]
同一面四次 90° 合计一周。
:::

## 次序与逆运算
<!-- sources: wca, cubing -->

撤销一串操作时，从末步向前逐一执行逆动作。两面转动一般不可交换，不应只把撇号切换而保持原顺序。

:::example 撤销两面操作
[输入]
先执行 R U，再执行 U′ R′（输入时用 ASCII 撇号）
[结果]
回到还原态
[说明]
先撤销 U，再撤销 R；总体变换是恒等。
:::

## 半圈和其他转动记号
<!-- sources: wca, core -->

半圈转动的逆操作是同一半圈。竞赛还用宽层转动、整块旋转等记号。三阶普通面模型和不同形状采用的动作集合并不总相同，读取公式要同时知道所选形状。

:::example 半圈的逆
[输入]
从还原态执行 R2 R2
[结果]
回到还原态
[说明]
两个半圈合成 360°。
:::

## 面片排列的核对
<!-- sources: cubing, core -->

同一公式的状态可显示为三维模型或展开图。改变观察角度不会改变状态。对照图片时，应使用已知的初态朝向和转动顺序，不宜只核对镜头正对的一面。

## 常见误区

- R 与 L 的顺时针分别从各自外侧观察。
- 撤销动作需要反转步骤次序。
- 更换渲染视角不会自动执行实体转动。

