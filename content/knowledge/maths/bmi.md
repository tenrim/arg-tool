---
capabilityId: native:bmi
title: BMI 计算
topicGroup: maths
summary: 以千克和米表示体重、身高，求体重除以身高平方所得的体质指数。
aliases:
  - 体质指数
  - 身高体重
  - 身体质量指数
  - body mass index
sources:
  - id: cdc
    title: Calculating BMI
    publisher: Centers for Disease Control and Prevention
    url: https://www.cdc.gov/growth-chart-training/hcp/using-bmi/calculating-bmi.html
    language: en
    kind: official-doc
    locator: 公制和英制 BMI 公式
  - id: context
    title: About Body Mass Index (BMI)
    publisher: Centers for Disease Control and Prevention
    url: https://www.cdc.gov/bmi/about/index.html
    language: en
    kind: official-doc
    locator: BMI 的用途、局限与儿童青少年解释
  - id: qalc
    title: Function List
    publisher: Qalculate!
    url: https://qalculate.github.io/manual/qalculate-definitions-functions.html
    language: en
    kind: official-doc
    locator: bmi 函数
  - id: shapes
    title: 几何公式的表达式
    publisher: 迷雾工具箱
    url: /practical/geometry.js
    language: zh-CN
    kind: implementation
    locator: SHAPES、geometryExpressions 和 bmiExpression
---

## 介绍
<!-- sources: cdc, context -->
体质指数的英文缩写为 BMI，是以体重除以身高平方得到的数值。常用单位为 kg/m²，可用于人群筛查或健康评估中的一项资料。

## 公制公式与量纲
<!-- sources: cdc, shapes -->
以 m 表示体重（千克），h 表示身高（米），BMI＝m/h²。若量的是厘米数，先除以 100 再平方。体重和身高都须为正数。身高相同时，体重的变化按比例反映在指数上。

:::example 70 千克与 175 厘米
[输入]
体重 70 kg，身高 175 cm
[结果]
约 22.86 kg/m²
[说明]
身高为 1.75 m，分母 1.75²＝3.0625，70÷3.0625≈22.85714。
:::

## 英制与公制的换算
<!-- sources: cdc, shapes, qalc -->
一磅为 0.45359237 kg，一英寸为 0.0254 m，一英尺为十二英寸。英制常用的系数 703 是将两个单位换成公制后合并系数的约数。统一单位后再平方可以保留换算精度。

:::example 英磅与英寸
[输入]
154 lb，70 in
[结果]
约 22.10 kg/m²
[说明]
体重约 69.8532 kg，身高 1.778 m，69.8532÷1.778²≈22.10。用 703 的近似系数四舍五入到两位也得到同一结果。
:::

## 比例相同的不同身高体重
<!-- sources: cdc, qalc -->
为了保持相同指数，身高变为原来的 k 倍，体重须变为原来的 k² 倍。因此单从某个指数无法恢复唯一的身高和体重。

:::example 相同指数的两组读数
[输入]
81 kg、180 cm 与 64 kg、160 cm
[结果]
两组均为 25 kg/m²
[说明]
81÷1.80²＝81÷3.24，64÷1.60²＝64÷2.56，两式均等于 25。
:::

## 筛查的用途与边界
<!-- sources: context -->
BMI 公式只使用身高和体重，无法区分肌肉、脂肪和骨量，也无法显示脂肪分布。儿童与青少年仍可计算指数，解释时要参照年龄和性别对应的生长资料。单独一个指数不足以作诊断。

## 常见误区

- 厘米应先换成米再平方，否则结果会缩小一万倍。
- 英尺与英寸混合表达应先展开，例如 5 英尺 10 英寸是 70 英寸而不是 5.10 英尺。
- 相同 BMI 可以对应多种身高与体重组合。
- 儿童青少年的数值需要年龄和性别资料来解释。
