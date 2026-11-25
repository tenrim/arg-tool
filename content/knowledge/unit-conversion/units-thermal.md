---
capabilityId: native:units-thermal
title: 热学与能量单位
topicGroup: unit-conversion
summary: 区分绝对温度与温差、能量与功率，并识别各种热学派生单位。
aliases:
  - 单位换算
  - 温度
  - 摄氏度
  - 华氏度
  - 热量
  - 能量
  - 功率
  - 熵
  - 导热系数
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
热学量包括温度、能量、功率、熵和导热系数。温度刻度可以有不同零点，能量和热学派生量则常由焦耳、时间、长度与温差组合。

## 绝对温度的刻度与零点
<!-- sources: si, nist, qalc -->
摄氏度到开尔文用 T(K)＝t(°C)＋273.15。摄氏度到华氏度用 t(°F)＝1.8 t(°C)＋32。前者的间隔单位相同，华氏度的刻度在同一温差上是摄氏度的 1.8 倍。

:::example 20 摄氏度
[输入]
20 celsius to fahrenheit
[结果]
68 °F
[说明]
20×1.8＋32＝68，使用的是绝对温度对应关系。
:::

:::example 摄氏零度
[输入]
0 celsius to K
[结果]
273.15 K
[说明]
开尔文和摄氏温标的零点偏移为 273.15。
:::

## 温差只换间隔
<!-- sources: si, nist -->
两个温度读数的差值会将零点偏移抵消。升温 20 °C 相当于升温 20 K 或 36 °F。表达温差时应保留“差”或“变化量”的含义，避免被解析成温度刻度上的一个点。

## 焦耳、千瓦时与卡路里
<!-- sources: si, nist, qalc -->
一瓦等于每秒一焦耳，能量是功率对时间的累积。千瓦时是能量单位，表示一千瓦持续一小时。不同定义的卡略有区别，热化学卡约定为 4.184 J。

:::example 一千瓦时
[输入]
1 kWh to MJ
[结果]
3.6 MJ
[说明]
1000 J/s 持续 3600 s，共 3600000 J。
:::

:::example 热化学卡
[输入]
1 cal_th to J
[结果]
4.184 J
[说明]
这里选择热化学卡的定义，不能据此代换其他历史卡定义。
:::

## 熵、比热与导热
<!-- sources: si, qalc -->
熵常以 J/K 表示，比热容每单位质量计量，单位为 J/(kg·K)。导热系数用 W/(m·K) 表示，还牵涉传热长度。三者的单位都含开尔文，但分子和其余因子不同。

## 常见误区

- 按读数换温标要计入零点，换温差时应去掉零点偏移。
- kW 是功率单位，kWh 是能量单位。
- 温标符号为 K，无需附加度号。
- 卡路里换算应确认使用的完整定义。
