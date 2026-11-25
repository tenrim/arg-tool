---
capabilityId: native:units-information
title: 信息与印刷单位
topicGroup: unit-conversion
summary: 区分十进制与二进制容量、不同排版点及对数比值的单位。
aliases:
  - 单位换算
  - 数据容量
  - 字节
  - 比特
  - KiB
  - kB
  - 分贝
  - 印刷
  - 磅
  - 字号
sources:
  - id: si
    title: SI Brochure
    publisher: BIPM
    url: https://www.bipm.org/en/publications/si-brochure
    language: en
    kind: standard
    locator: SI 基本单位、相干导出单位、前缀和并用单位
  - id: qalc
    title: Unit List
    publisher: Qalculate!
    url: https://qalculate.github.io/manual/qalculate-definitions-units.html
    language: en
    kind: official-doc
    locator: 原计算内核单位目录及类别
  - id: binary
    title: The binary prefixes
    publisher: NIST
    url: https://physics.nist.gov/cuu/Units/binary.html
    language: en
    kind: official-doc
    locator: 比特、字节、SI 和 IEC 容量示例
  - id: tex
    title: TeX for the Impatient
    publisher: TeX Users Group
    url: https://tug.ctan.org/info/impatient/book.pdf
    language: en
    kind: author-spec
    locator: Dimensions：pt 与 bp
  - id: bel
    title: Recommendation 1 (2001)
    publisher: BIPM
    url: https://www.bipm.org/en/committees/ci/cipm/90-2001/resolution-1
    language: en
    kind: standard
    locator: 贝尔、分贝和参考量
---

## 介绍
<!-- sources: binary, tex, bel -->
这组单位覆盖数据容量、印刷尺寸和对数比。数量的刻度分别依赖比特或字节、排版设备采用的点制，以及比值的对数底数。

## 字节与比特
<!-- sources: binary, qalc -->
一个现代字节由 8 个比特组成。字节容量换成比特数要乘 8。数据速率则还包含时间分母，例如 Mb/s 是每秒百万比特，换算为 MB/s 时要把分子变成字节。

:::example 十进制千字节换比特
[输入]
1 kB to bit
[结果]
8000 bits
[说明]
kB 的千表示 1000 个字节，每字节 8 比特。
:::

## 十进制和二进制前缀
<!-- sources: binary, si, qalc -->
k、M、G 一般按 10³、10⁶、10⁹ 表示。Ki、Mi、Gi 分别为 2¹⁰、2²⁰、2³⁰。保留字母的大小写与 i 能明确实际容量定义。

:::example 换算一 KiB
[输入]
1 KiB to byte
[结果]
1024 B
[说明]
一 KiB 的前缀倍率为 2¹⁰，容量基元是字节。
:::

## 排版点的两套尺度
<!-- sources: tex, qalc -->
PostScript 常用的点为 1/72 英寸，TeX 的传统点为 1/72.27 英寸。两套尺度在同一长度上的数值略有差别。字体中的 em 等相对量还依赖字号，不能直接视为固定厘米数。

:::example 同一英寸的两种点制
[输入]
1 in to pt
1 in to tex_pt
[结果]
72 pt
72.27 pt_TeX
[说明]
前者用每英寸 72 点的尺度，后者用每英寸 72.27 点的尺度。
:::

## 分贝与参考量
<!-- sources: si, bel, qalc -->
对功率比和其他相应的功率型量，L＝10 log₁₀(X/X₀) dB，十个分贝等于一个贝尔。对同阻抗下的电压幅值比，功率比是幅值比的平方，因而改写为 20 log₁₀。给出分贝值时要说明量的类型和参考值。

:::example 贝尔和分贝
[输入]
20 dB to bel
[结果]
2 B
[说明]
用十进制对数量单位之间的关系 1 B＝10 dB，可确认倍数。若进一步还原线性比值，应先确定是功率比还是幅值比。
:::

## 常见误区

- kB 与 KiB 含有不同的字节数。
- 大写 B 通常表示字节，容量和传输速率还需留意分母。
- PostScript 点与 TeX 点同名，物理尺寸不同。
- 用固定线性倍率把 dB 直接乘成物理量，会丢失对数和参考值的定义。
