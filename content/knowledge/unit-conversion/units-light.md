---
capabilityId: native:units-light
title: 光学与辐射单位
topicGroup: unit-conversion
summary: 区分光度学、辐射度学、放射性活度和电离辐射剂量的计量单位。
aliases:
  - 单位换算
  - 光强
  - 照度
  - 亮度
  - 光通量
  - 辐射
  - 放射性
  - 吸收剂量
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
  - id: iaea
    title: Safety Glossary
    publisher: IAEA
    url: https://www.iaea.org/sites/default/files/17/11/iaea-safety-glossary-rev2016.pdf
    language: en
    kind: official-doc
    locator: activity、absorbed dose、equivalent dose
---

## 介绍
<!-- sources: si, iaea -->
照明用的光度量按人眼的标准光谱响应加权。辐射度量则描述辐射能量及其分布。放射性活度和电离辐射剂量另有定义，各组数字分别回答不同的测量问题。

## 从光强到光通量与照度
<!-- sources: si, qalc -->
坎德拉衡量给定方向的发光强度，乘以该方向上对应的立体角或在立体角内积分可得流明。落到表面的光通量除以面积是平均照度，一勒克斯等于一流明每平方米。

:::example 一坎德拉的一球面度
[输入]
1 cd*sr to lm
[结果]
1 lm
[说明]
若该立体角内发光强度恒为 1 cd，总光通量为 1 cd×1 sr。
:::

:::example 照度的两个面积基准
[输入]
1 lx to ph
[结果]
0.0001 ph
[说明]
1 phot 是 1 lm/cm²，1 lx 是 1 lm/m²。一平方米有 10000 平方厘米。
:::

## 方向、亮度与辐射功率
<!-- sources: si, nist -->
亮度以 cd/m² 表示，包含发光表面的投影面积和观测方向。辐射通量以瓦特表示。可见光的流明值随光谱而变，同等瓦数的两束光可能得到不同光通量。

## 放射性活度
<!-- sources: iaea, qalc -->
活度是给定时刻每单位时间的核跃迁数的期望值。一贝可勒尔对应平均每秒一次。居里是历史活度单位，其固定值是 3.7×10¹⁰ Bq。

:::example 居里到贝可勒尔
[输入]
1 Ci to Bq
[结果]
37000000000 Bq
[说明]
居里的定义给出固定换算倍数。
:::

## 吸收剂量与防护量
<!-- sources: si, iaea, qalc -->
戈瑞表示单位质量吸收的能量，一戈瑞为 1 J/kg。希沃特用于当量剂量、有效剂量等具体防护量，需要结合辐射类型与适用权重。在缺少照射、距离、体积、时间和辐射类型等情形信息时，活度无法直接换成剂量。

:::example 旧吸收剂量单位
[输入]
1 rad_radioactivity to Gy
[结果]
0.01 Gy
[说明]
这里的 rad 指吸收剂量。一 rad 为 0.01 J/kg。
:::

## 常见误区

- 流明描述光通量，照度还取决于接收面积。
- 不同光谱的辐射功率没有通用的瓦特到流明固定比例。
- 贝可勒尔和戈瑞描述不同的测量量，不能直接互换。
- 吸收剂量的 rad 与角度弧度的符号相同，读取时要确认量纲。
