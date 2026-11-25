---
capabilityId: native:pubchem
title: PubChem 物质查询
topicGroup: matter
summary: 识别 PubChem 的 CID、名称、分子式和结构标识，核对来源与质量字段。
aliases:
  - PubChem
  - CID
  - SMILES
  - InChI
sources:
  - id: pug
    title: PubChem PUG REST
    publisher: NCBI／PubChem
    url: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest
    language: en
    kind: official-doc
    locator: compound 查询、结构标识与属性
  - id: view
    title: PubChem PUG View
    publisher: NCBI／PubChem
    url: https://pubchem.ncbi.nlm.nih.gov/pug_view/
    language: en
    kind: official-doc
    locator: 记录注释和贡献者来源
  - id: cid
    title: Aspirin 记录，CID 2244
    publisher: NCBI／PubChem
    url: https://pubchem.ncbi.nlm.nih.gov/compound/2244
    language: en
    kind: official-doc
    locator: 分子式、计算属性和标识
  - id: core
    title: PubChem 数据读取
    publisher: 迷雾工具箱
    url: /online-query/reading-science.js
    language: zh-CN
    kind: implementation
    locator: 本次返回的内容、同义词、属性与结构显示
---

## 介绍
<!-- sources: pug, view -->

PubChem 的 Compound 库为归一化结构分配 CID。已知编号时可以定位具体记录；用名称、结构或式子检索时，候选集合依规则而定。不同提供者提交的资料可以分别挂接到同一记录。

## CID、名称与分子式
<!-- sources: pug, cid -->

一个名称可能有多个同义词和不同上下文，分子式也可能涵盖多种连接方式。CID 用于标识已建档的结构，不应拿 CID 推算属性。

:::example 直接查已知编号
[输入]
CID 2244
[结果]
Aspirin（阿司匹林），C9H8O4
[说明]
名称和式子是从这条记录读取的属性。
:::

## 平均分子量与精确质量
<!-- sources: cid, core -->

界面中的分子量与精确质量来自不同量的定义。前者体现常用原子量而通常保留较少位，后者用于指定同位素质量组合，不能在标定时直接替换。

:::example 比较两个质量值
[输入]
CID 2244
[结果]
分子量 180.16 g/mol；精确质量 180.04225873 Da
[说明]
数值精度和单位应跟随对应的原始字段显示。
:::

## 结构识别码和表述方式
<!-- sources: pug, cid, core -->

SMILES 记录连接和可写的立体关系，InChI 可依层编码结构信息。InChIKey 是固定长度的派生标识，适合做索引匹配，不能从它直接还原结构图。

:::example 对照编号和键
[输入]
读取 CID 2244 的标准 InChIKey
[结果]
BSYNRYMUTXBXSQ-UHFFFAOYSA-N
[说明]
可作为另一来源是否指同一归一化结构的核对线索。
:::

## 注释来源与使用语境
<!-- sources: view, core -->

同一记录可包含计算属性、提交者注释、测量资料和结构记录。二维图和三维构象分别有自己的坐标含义。阅读时保留贡献者、文献和条件，并按资料用途区分计算量与实验结论。

## 常见误区

- 分子式相同并不保证是同一化合物。
- SMILES 与 InChIKey 不能当作同一种结构文本使用。
- 出现数据库注释不等于检测或者鉴定了实际样品。

