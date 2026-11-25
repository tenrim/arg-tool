---
capabilityId: native:sequence
title: 氨基酸与密码子对照
topicGroup: matter
summary: 用标准遗传密码读核酸三联体，并区分阅读框、链方向和蛋白代码。
aliases:
  - 蛋白质
  - DNA
  - RNA
  - 密码子
  - AUG
  - Met
  - FASTA
sources:
  - id: ncbi
    title: The Genetic Codes
    publisher: NCBI
    url: https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi
    language: en
    kind: standard
    locator: 表 1、表 2，起始表及标准翻译表
  - id: insdc
    title: The DDBJ/ENA/GenBank Feature Table Definition
    publisher: INSDC
    url: https://www.insdc.org/submitting-standards/feature-table/
    language: en
    kind: standard
    locator: 附录 IV，核苷酸符号、氨基酸和遗传密码表
  - id: core
    title: 标准序列与翻译行
    publisher: 迷雾工具箱
    url: /science/core.js
    language: zh-CN
    kind: implementation
    locator: sequence 的类型归一和阅读框
  - id: table
    title: 随附序列转换表
    publisher: 迷雾工具箱
    url: /vendor/science/sequence.js
    language: zh-CN
    kind: implementation
    locator: translate、complement、reverseComplement
---

## 介绍
<!-- sources: ncbi, insdc -->

翻译把三个相邻核苷酸组成的密码子，转换为一种氨基酸的名称或终止记号。资料表中常见标准密码和其它密码表，选择依据是已知的生物材料来源。这里的演示序列由少量人工书写的三联体组成。

## 密码子的固定方向
<!-- sources: ncbi, core -->

蛋白翻译按所选序列从 5′ 到 3′ 读，每次跨过三位。DNA 编码链与相应 RNA 的表示通常用 T 或 U 区分。标准密码 AUG 对应 Met，GCU 对应 Ala，UGA 表示终止。

:::example RNA 三词组
[输入]
AUG GCU UGA，从第一位开始分组
[结果]
MA*（Met、Ala、终止）
[说明]
三个三联体独立查标准码表，星号表示终止信号。
:::

## 换位起读与反向链
<!-- sources: core, insdc, table -->

从同一正链的第一、第二、第三位开始可形成三个阅读框，反向互补序列同理。最后不满三位的字符无法组成完整密码子。自动列出阅读框帮助比较，不会指定唯一实际蛋白。

:::example 比较两个正向框
[输入]
DNA ATGGCTGGT
[结果]
+1：MAG；+2：WL；另有反向互补链 ACCAGCCAT
[说明]
第一个读 ATG、GCT、GGT；第二个读 TGG、CTG，剩两位。
:::

## 蛋白的两套记号
<!-- sources: insdc, core -->

氨基酸常用三字母简称或一字母代码。例如 Met 与 M、Ala 与 A、Gly 与 G 分别是同一类残基的两种书写。代码串不保留它来自哪一套可能的原始三联体。

:::example 三字母简称转写
[输入]
Met Ala Gly
[结果]
MAG
[说明]
依照缩写表逐项替换，不需要建立核酸序列。
:::

## 不确定位和不同码表
<!-- sources: ncbi, insdc, table -->

N 可表示未指定的一位核苷酸。无法确定的三联体应保留为未知项。不同遗传密码表的映射可以不同，例如标准表和脊椎动物线粒体表对 UGA 的解释不同。

## 常见误区

- 阅读框变化会重新划分整段三联体。
- 含终止号的显示结果不能直接解释成一条完整蛋白。
- 从氨基酸简称无法唯一反推原核酸字符串。

