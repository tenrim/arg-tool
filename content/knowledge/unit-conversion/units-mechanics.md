---
capabilityId: native:units-mechanics
title: 力学单位
topicGroup: unit-conversion
summary: 按分子、分母和幂分别换算质量、速度、压强、密度、流量等力学量。
aliases:
  - 单位换算
  - 质量
  - 密度
  - 速度
  - 加速度
  - 力
  - 压强
  - 黏度
  - 流量
  - 角速度
  - 角加速度
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
力学的基本量包括长度、质量和时间。速度、力、压强等单位由基本单位组合而成。只要保持量纲，换算可以拆成一组基本单位的比例。

## 速度、加速度与角速度
<!-- sources: si, nist -->
速度为长度除以时间，加速度为长度除以时间平方。角速度以角度变化除以时间表示，转每分与弧度每秒之间要同时更换角度刻度和时间刻度。

:::example 行驶速度
[输入]
72 km/h to m/s
[结果]
20 m/s
[说明]
72×1000÷3600＝20，分母也要由小时换成秒。
:::

## 力、质量和压强
<!-- sources: si, nist -->
质量以 kg 为 SI 单位。力的牛顿定义为 kg·m/s²，帕斯卡为 N/m²。把物体质量换成重力还要给重力加速度。一个标准大气压规定为 101325 Pa。

:::example 标准大气压
[输入]
101325 Pa to atm
[结果]
1 atm
[说明]
标准大气压取的是约定值，当前位置气压可以与该值不同。
:::

## 密度和体积流量
<!-- sources: si, qalc -->
密度是单位体积中的质量，常用 kg/m³ 或 g/cm³。体积流量是每单位时间通过的体积，可用 m³/s 或 L/min 表示。比容以体积除以质量，和密度互为倒数。

:::example 密度的长度立方因子
[输入]
1000 kg/m^3 to g/cm^3
[结果]
1 g/cm³
[说明]
1000 kg 为 10⁶ g，一立方米为 10⁶ cm³。
:::

## 动力黏度与运动黏度
<!-- sources: si, nist, qalc -->
动力黏度采用 Pa·s。运动黏度为动力黏度除以流体密度，量纲是长度平方除以时间。在没有密度的情况下，两类黏度不能通过固定系数互换。

:::example 泊与毫帕秒
[输入]
1 Pa*s to cP
[结果]
1000 cP
[说明]
1 泊为 0.1 Pa·s，一厘泊为 0.001 Pa·s。
:::

## 常见误区

- 从 km/h 换成 m/s 要同时处理时间单位。
- 质量换算为重力需要额外给定加速度。
- 密度换算中的体积单位含长度的三次方。
- 运动黏度与动力黏度的数值关系依赖流体密度。
