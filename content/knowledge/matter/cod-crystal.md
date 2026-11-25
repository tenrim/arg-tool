---
capabilityId: native:cod
title: COD 晶体查询
topicGroup: matter
summary: 用化学式、空间群和 COD ID 定位晶体记录，解读晶胞和原始 CIF。
aliases:
  - COD
  - CIF
  - 晶体
  - 空间群
sources:
  - id: api
    title: COD RESTful API
    publisher: Crystallography Open Database
    url: https://wiki.crystallography.net/RESTful_API/
    language: en
    kind: author-spec
    locator: Search、Entry access、Hill 格式
  - id: cite
    title: Citing the Crystallography Open Database
    publisher: COD
    url: https://wiki.crystallography.net/cod/citing/
    language: en
    kind: official-doc
    locator: 来源作者与记录引用
  - id: cif
    title: CIF 1.1 Working Specification
    publisher: IUCr
    url: https://www.iucr.org/what-we-do/digital-standards/cif/cif1
    language: en
    kind: standard
    locator: 数据块、标签与数值语法
  - id: reading
    title: COD 记录与 CIF 阅读
    publisher: 迷雾工具箱
    url: /online-query/reading-science.js
    language: zh-CN
    kind: implementation
    locator: COD JSON、CIF 数据块和重复记录字段
---

## 介绍
<!-- sources: api, cif -->

COD 是开放晶体结构资料库。每个编号识别一项记录，记录可能给出组成、空间群、晶格、测量条件、文献及 CIF。结构不是由一个化学式单独确定的。

## 按组成与空间群找候选
<!-- sources: api -->

检索可使用 Hill 化学式的空格分列写法，也可限定包括或排除的元素。空间群和发表年份可以进一步缩小范围。同一化学式可能出现于不同结构、多种实验或各自记录的重复样本。

:::example 查硅和氧
[输入]
Hill 公式 Si O2
[结果]
查询目标为 Si、O 组成式，不指定唯一 COD ID
[说明]
空间群、晶体条件、文献仍需要进一步核对。
:::

## 晶胞数值与不确定度
<!-- sources: cif, reading -->

a、b、c 是晶胞边长，通常以 Å 表示，α、β、γ 是相应方向之间的夹角。带括号的值一般记录末位上的标准不确定度。分数坐标需结合晶胞基矢解释。

:::example 读取数值语法
[输入]
CIF 字段 _cell_length_a 4.123(4)
[结果]
a = 4.123 Å，末位不确定度 0.004 Å
[说明]
括号内容不是原数的百分数；该文本是语法示例。
:::

## ID、论文和重复标记
<!-- sources: api, cite, reading -->

COD 编号用来回到具体记录。重复标记提示另有对应记录，不能直接把两份数据覆盖成同一文本，尤其需保留原始发表来源和测量字段。

:::example 核对固定返回记录
[输入]
COD 1000000 的历史返回
[结果]
重复记录对应 2011331；DOI 10.1107/S0108270100008532
[说明]
编号和值来自一次固定记录；一般查询应看本次返回。
:::

## 原始 CIF 的结构和可追溯性
<!-- sources: api, cif, cite -->

CIF 可能含多个数据块、循环表及多行值。复制一个可见摘要不保有这些结构。记录来源时可连同 COD ID、原始论文、时间和 CIF 保存。在线访问失败时不应被解释为记录不存在。

## 常见误区

- 同一化学式不证明晶体空间群相同。
- 分数坐标的数值不是以 Å 为单位的距离。
- CIF 里的问号或缺项不能默认为零。

