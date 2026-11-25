---
capabilityId: native:function-plot
title: 函数绘图
topicGroup: maths
summary: 把函数、隐式方程、不等式与参数关系读成坐标平面上的图形。
aliases:
  - Desmos
  - 函数图像
  - 图形计算器
sources:
  - id: guide
    title: Desmos Graphing Calculator User Guide
    publisher: Desmos
    url: https://help.desmos.com/hc/en-us/articles/202529279
    language: en
    kind: official-doc
    locator: 图像、数据表、变量及滑块
  - id: regions
    title: Inequalities and Restrictions
    publisher: Desmos
    url: https://help.desmos.com/hc/en-us/articles/4407885334285
    language: en
    kind: official-doc
    locator: 不等式边界与范围限制
  - id: para
    title: Parametric Equations
    publisher: Desmos
    url: https://help.desmos.com/hc/en-us/articles/4406906208397
    language: en
    kind: official-doc
    locator: 有序对、参数 t 及其范围
  - id: functions
    title: Functions
    publisher: Desmos
    url: https://help.desmos.com/hc/en-us/articles/4405177116941
    language: en
    kind: official-doc
    locator: 函数的定义、复用和求值
---

## 介绍
<!-- sources: guide, functions -->
函数图像由所有满足 y＝f(x) 的点组成。将表达式写为 f(x) 可以进一步求指定输入的输出。坐标窗口只决定可见范围，公式和定义域决定实际点集。

## 显式函数与坐标检验
<!-- sources: guide, functions -->
算几个点就能核对坐标、比例和趋势。直线 y＝mx＋b 的 m 是每单位横向变化对应的纵向变化量，b 是纵轴截距。用同一界面绘制多条式子，可以对照交点与各自形状。

:::example 直线的三个点
[输入]
y=2x-1
[结果]
经过 (0,−1)、(1,1)、(2,3)
[说明]
逐一代入横坐标 0、1、2，纵坐标相邻相差 2。
:::

## 隐式方程与不等式
<!-- sources: guide, regions -->
隐式方程可以同时含 x、y，例如 x²＋y²＝4 是一个整圆。把等号改为严格小于号，得到圆内区域，圆周不在点集中，在图上用虚线标示。若包含等号，边界也满足条件。

:::example 圆内不含边界
[输入]
x^2+y^2<4
[结果]
半径 2 的开圆盘，边界使用虚线
[说明]
原点满足不等式，(2,0) 的平方和恰好为 4，不符合严格小于。
:::

## 范围限制和滑块
<!-- sources: guide, regions -->
在表达式末尾加花括号可对横坐标或纵坐标加条件。改变限制会真正改变所画点集。若将常数改为变量，则可利用滑块查看一族曲线中的不同成员。

:::example 保留抛物线的中段
[输入]
y=x^2{-2<=x<=2}
[结果]
从 (−2,4) 延伸到 (2,4) 的抛物线段，顶点为 (0,0)
[说明]
只有 −2 至 2 的横坐标满足附加条件，两端均包含。
:::

:::example 只改变截距
[输入]
y=mx+b，m=2，b 由 −1 改为 1
[结果]
纵轴交点由 (0,−1) 移到 (0,1)
[说明]
斜率保持为 2，所有纵坐标增加 2。
:::

## 参数曲线
<!-- sources: para, functions -->
图形还可由同一个参数同时定义 x 和 y。指定参数范围后，只画该范围内各组有序对构成的路径。这种写法可以表现回转曲线和绕行次序。

:::example 单位圆的四分之一
[输入]
(cos(t),sin(t))，t 从 0 到 π/2，使用弧度
[结果]
从 (1,0) 到 (0,1) 的第一象限圆弧
[说明]
每个点的坐标平方和等于 1，区间内两坐标均非负。
:::

## 常见误区

- 平移视窗只能改变可见位置，定义域限制会改变点集。
- 等式、严格不等式和非严格不等式对边界的处理不同。
- 一个隐式方程可能让相同横坐标对应多个纵坐标。
- 参数曲线只覆盖设定的参数范围，不能看到半段就推断已画出整条曲线。
