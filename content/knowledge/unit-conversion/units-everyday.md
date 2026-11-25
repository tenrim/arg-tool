---
capabilityId: native:units-everyday
title: 几何与日常单位
topicGroup: unit-conversion
summary: 按量纲处理长度、面积、体积、时间、频率与角度的换算。
aliases:
  - 单位换算
  - 长度
  - 面积
  - 体积
  - 容积
  - 时间
  - 频率
  - 平面角
  - 立体角
sources:
  - id: si
    title: SI Brochure
    publisher: BIPM
    url: https://www.bipm.org/en/publications/si-brochure
    language: en
    kind: standard
    locator: SI 基本单位、相干导出单位、前缀和并用单位
  - id: nist
    title: Guide to the SI Appendix B
    publisher: NIST
    url: https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors
    language: en
    kind: official-doc
    locator: 常用非 SI 单位的转换系数
  - id: qalc
    title: Unit List
    publisher: Qalculate!
    url: https://qalculate.github.io/manual/qalculate-definitions-units.html
    language: en
    kind: official-doc
    locator: 原计算内核单位目录及类别
---

## 介绍
<!-- sources: si, qalc -->
几何和日常计量单位把同一个物理量写成不同大小的刻度。例如一米和一百厘米是同一长度。换算时尺寸本身不变，变化的是数值和单位的组合。

## 长度因子与面积、体积
<!-- sources: si, qalc -->
长度单位缩放为原来的一百分之一，在同一长度上的数值变为一百倍。面积的单位含两个长度因子，体积含三个。因此平方米、立方米到对应厘米单位分别要乘 10⁴ 和 10⁶。

:::example 一平方米铺多少平方厘米
[输入]
1 m^2 to cm^2
[结果]
10000 cm²
[说明]
一米的两个长度因子各乘 100。
:::

## 容量与混合长度
<!-- sources: si, nist -->
一升为一立方分米，也就是 0.001 立方米。容积的美制和英制加仑使用不同定义。组合诸如英尺加英寸的尺寸时，可先把每项变为相同长度单位再相加。

:::example 五英尺两英寸
[输入]
5 ft + 2 in to cm
[结果]
157.48 cm
[说明]
总计 62 英寸，每英寸为 2.54 厘米。
:::

## 时间与频率
<!-- sources: si, qalc -->
一分等于 60 秒，一小时等于 3600 秒。频率单位赫兹为每秒一个周期。若重复过程的周期为 T 秒，频率为 1/T 赫兹，这一步是从周期求另一物理量。

## 平面角与立体角
<!-- sources: si, nist, qalc -->
平面角的弧度值等于圆弧长与半径之比，一整圈为 2π 弧度。立体角用球面截面积除以半径平方表示，完整球面为 4π 球面度。角度单位和球面度各对应不同的几何对象。

:::example 直角的弧度值
[输入]
90 deg to rad
[结果]
π/2 rad，约 1.5707963 rad
[说明]
90° 占一整圈的四分之一。
:::

## 常见误区

- 平方单位和立方单位的倍率要对长度倍率取相应次幂。
- 同名的一加仑在不同规格下体积可能不同。
- 秒和赫兹对应时间与频率，需给出周期关系才能相互推算。
- 度与弧度不宜在三角函数输入中混用。
