---
capabilityId: native:units-electromagnetic
title: 电磁学单位
topicGroup: unit-conversion
summary: 由电流、时间与功的组合识别电荷、电势、电阻、电容及常用磁学单位。
aliases:
  - 单位换算
  - 电压
  - 电流
  - 电荷
  - 电阻
  - 电容
  - 电感
  - 磁场
  - 磁通量
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
电磁学以安培表示电流。电荷、电势、电阻、电容和磁通量等单位可用电流、时间和机械量组合定义。换算时保留所比较的是哪一种量。

## 电流与电荷
<!-- sources: si, qalc -->
一库仑等于一安培恒定电流在一秒内输运的电荷。以安时表示电池的电荷容量时，要乘每小时的 3600 秒才得到库仑。把容量进一步换成能量，需要引入电压等信息。

:::example 安时到库仑
[输入]
2 Ah to C
[结果]
7200 C
[说明]
2 A×3600 s＝7200 A·s。
:::

## 电压、电阻与前缀
<!-- sources: si, qalc -->
一伏等于一焦耳每库仑，也等于一瓦每安培。在欧姆关系 V＝IR 中，电阻单位 Ω 等于 V/A。毫前缀表示 10⁻³，千前缀表示 10³，大小写有区别。

:::example 毫伏与伏的十进制关系
[输入]
1 V to mV
[结果]
1000 mV
[说明]
1 mV＝0.001 V。
:::

:::example 千欧到欧姆
[输入]
3 kOhm to ohm
[结果]
3000 Ω
[说明]
k 表示千，3 乘 1000 得到 3000。
:::

## 电容、电感与磁通量
<!-- sources: si, qalc -->
电容单位法拉为 C/V。磁通量单位韦伯可写为 V·s，电感单位亨利为 Wb/A。磁通密度特斯拉为 Wb/m²，表示磁通量与面积的关系。磁场强度 H 的常用 SI 单位是 A/m。

:::example 特斯拉与高斯
[输入]
1 T to gauss
[结果]
10000 gauss
[说明]
1 G 是 10⁻⁴ T，两者表示磁通密度。
:::

## 电场强度与能量
<!-- sources: si, nist -->
均匀电场方向上，电位差除以距离可得该方向的电场强度。电能可用电功率随时间的积分表示。知道电流、电压或时间中的一项时，仍需其余信息才能确定功或能量。

## 常见误区

- mV 和 MV 相差 10⁹ 倍。
- 安时记录电荷量，从安时求能量还需电压等信息。
- 特斯拉表示磁通密度，韦伯表示磁通量，两者关系还涉及面积。
- 电场强度的 V/m 与单独的电压 V 维度不同。
