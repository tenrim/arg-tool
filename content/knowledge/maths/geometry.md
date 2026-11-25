---
capabilityId: native:geometry
title: 几何面积与体积
topicGroup: maths
summary: 给定图形尺寸，计算周长、面积、侧面积、表面积和体积。
aliases:
  - 周长
  - 表面积
  - 三角形
  - 圆
  - 圆柱
  - 圆锥
  - 球
  - 几何计算
  - geometry
sources:
  - id: basic
    title: Geometric Formulas
    publisher: OpenStax / Rice University
    url: https://openstax.org/books/prealgebra-2e/pages/c-geometric-formulas
    language: en
    kind: official-doc
    locator: 二维与三维图形公式
  - id: heron
    title: "Non-right Triangles: Law of Cosines"
    publisher: OpenStax / Rice University
    url: https://openstax.org/books/precalculus/pages/8-2-non-right-triangles-law-of-cosines
    language: en
    kind: official-doc
    locator: Using Heron's Formula
  - id: area
    title: Area
    publisher: OpenStax / Rice University
    url: https://openstax.org/books/contemporary-mathematics/pages/10-6-area
    language: en
    kind: official-doc
    locator: Area of a Regular Polygon
  - id: sector
    title: Angles
    publisher: OpenStax / Rice University
    url: https://openstax.org/books/precalculus/pages/5-1-angles
    language: en
    kind: official-doc
    locator: 弧长、弧度和扇形面积
  - id: solid
    title: Volume and Surface Area
    publisher: OpenStax / Rice University
    url: https://openstax.org/books/prealgebra-2e/pages/9-6-solve-geometry-applications-volume-and-surface-area
    language: en
    kind: official-doc
    locator: Volume and Surface Area of Cones、Spheres
  - id: shapes
    title: 几何公式的表达式
    publisher: 迷雾工具箱
    url: /practical/geometry.js
    language: zh-CN
    kind: implementation
    locator: SHAPES、geometryExpressions 和 bmiExpression
---

## 介绍
<!-- sources: basic -->
周长度量闭合平面边界的长度，面积度量覆盖范围，表面积度量立体的外表，体积度量占据的空间。若输入尺寸以厘米计，长度、面积和体积分别以 cm、cm² 和 cm³ 表示。

## 三角形与四边形
<!-- sources: basic, heron, shapes -->
三角形面积为底乘对应的垂直高再除以二。只知道三边时，先检查任意两边之和大于第三边，再由半周长 s＝(a＋b＋c)/2 求面积 √[s(s−a)(s−b)(s−c)]。直角三角形可把两条直角边用作底和高。

长方形面积 lw，周长 2(l＋w)，正方形取 l＝w。平行四边形面积 bh，周长须再知道两条邻边。梯形面积为两底之和乘高再除以二。若明确等腰，用两底差的一半与高求腰长 √[h²＋(a−b)²/4]，才能由两底和两腰得周长。

:::example 三边三角形
[输入]
边长分别为 3 cm、4 cm、5 cm
[结果]
周长 12 cm，面积 6 cm²
[说明]
半周长 s＝6，根号内为 6×3×2×1＝36。
:::

## 圆、扇形与正多边形
<!-- sources: basic, sector, area, shapes -->
圆面积为 πr²，圆周长为 2πr。圆环面积是两圆面积之差 π(R²−r²)，内外边界长度合计 2π(R＋r)。扇形角度若以弧度 θ 表示，弧长为 rθ，面积为 r²θ/2。对于非整圆，周长为弧长加两条半径。

正 n 边形可从中心分成 n 个全等的等腰三角形。边长 a 对应内切圆半径 a/[2tan(π/n)]，所以周长为 na，面积为 na²/[4tan(π/n)]。

:::example 四分之一圆扇形
[输入]
r＝3 cm，夹角 90°
[结果]
面积 9π/4 cm²，弧长 3π/2 cm，周长 (6＋3π/2) cm
[说明]
取整圆的四分之一面积和弧长，再将两条 3 cm 半径计入外边界。
:::

## 棱柱、圆柱、圆锥与正四棱锥
<!-- sources: basic, solid, shapes -->
长方体体积 lwh，表面积 2(lw＋lh＋wh)。正方体边长 a 时体积 a³，表面积 6a²。圆柱体积 πr²h，侧面积 2πrh，两底另有 2πr²。将侧面展开可以看到它是以圆周长和高为两条边的矩形。

圆锥体积 πr²h/3，侧面积 πr√(r²＋h²)，计底时另加 πr²。底边 a 的正四棱锥体积为 a²h/3，侧面总面积为 2a√(h²＋a²/4)，底面积为 a²。

:::example 含两底的圆柱
[输入]
r＝3 cm，h＝4 cm
[结果]
体积 36π cm³，侧面积 24π cm²，表面积 42π cm²
[说明]
底面积为 9π cm²。两个底面一共贡献 18π cm²。
:::

## 球体与半球
<!-- sources: solid, shapes -->
球体积为 4πr³/3，表面积为 4πr²。半球的体积和曲面面积都是相应球值的一半。若半球闭合，平底面积 πr² 也算在表面积中。

:::example 半径为三的半球
[输入]
r＝3 cm
[结果]
体积 18π cm³，曲面 18π cm²，含平底表面积 27π cm²
[说明]
半球曲面取整球 36π cm² 的一半，另加 9π cm² 的底面。
:::

## 常见误区

- 三角形与梯形的高是到对应底或两底之间的垂直距离。
- 只给底和高通常不足以得到三角形或一般梯形的周长。
- 圆锥的母线用于算侧面积，垂直高用于算体积。
- 混合输入单位前先统一换算，面积和体积的换算因子分别要平方、成立方。
