---
capabilityId: native:birds
title: 鸟类名录
topicGroup: matter
summary: 用分类等级、学名、版本及关联标识查读 AviList 鸟类分类记录。
aliases:
  - AviList
  - 鸟类分类
  - Bird taxonomy
sources:
  - id: av
    title: AviList v2025b Extended
    publisher: AviList Core Team
    url: https://www.avilist.org/checklist/v2025b/
    language: en
    kind: author-spec
    locator: Extended 版本、引用与许可
  - id: doc
    title: Components of the AviList Checklist
    publisher: AviList Core Team
    url: https://www.avilist.org/checklist/components-of-the-avilist-checklist/
    language: en
    kind: official-doc
    locator: 名称、分类序号、分布和命名文献
  - id: data
    title: AviList v2025b Extended 固定原表
    publisher: 迷雾工具箱
    url: /vendor/atlas-life-culture/AviList-v2025b-10Jun2026-extended.xlsx
    language: zh-CN
    kind: implementation
    locator: 26 列主表及六张工作表
  - id: core
    title: 分类原字段和辅助表查询
    publisher: 迷雾工具箱
    url: /atlas-life-culture/core.js
    language: zh-CN
    kind: implementation
    locator: queryBirds 与 queryBirdMetadata
---

## 介绍
<!-- sources: av, doc -->

AviList 是按版本维护的全球鸟类分类名录。它逐行记录分类单元，可以用学名和分类层级来辨认对象，也提供多套普通名称、命名文献与分布参考。

## 从分类等级读记录
<!-- sources: doc, data -->

名录的一行可以是目、科、属、种或亚种。标准学名常在不同级别间共享词段，依据 Taxon_rank 才能确认等级。固定 v2025b Extended 的 33,684 行包含 11,131 个物种行，其他行不可计入鸟种数。

:::example 区分属和种
[输入]
按种筛选后查 Struthio camelus
[结果]
非洲鸵鸟；Common Ostrich；Sequence 5
[说明]
Struthio 是另有记录的属，下面的亚种也与种不合为一项。
:::

## 顺序编号与来源标识
<!-- sources: doc, data, core -->

Sequence 标记该版名录中的排列顺序。AvibaseID 等外部编号用于对应另一资料系统，不能拿序号计算进化远近。分类决策可能随新资料更改，引用时需同时保留版本。

:::example 按外部标识复核
[输入]
avibase-2247CB05
[结果]
本地记录 bird:5，学名 Struthio camelus
[说明]
它与上一样例是同一记录，输入字段却属于不同的标识系统。
:::

## 分布及命名信息
<!-- sources: doc, core -->

Range 列出文献整理出的分布，空白仅表示该行未提供该项。Authority、Protonym 和 Type_locality 有助于追溯名称如何建立。IUCN 保护等级与名录其它灭绝说明是各自的数据。

:::example 辨别同属物种
[输入]
在种筛选中查询 Struthio molybdophanes
[结果]
灰颈鸵鸟；Sequence 4
[说明]
与 Sequence 5 共享属名但代表不同种。
:::

## 固定版本及辅助资料
<!-- sources: av, data, core -->

Extended 同时保存参考文献、决定依据、说明和版本变化。固定快照用于复核具体版，网页上最新的 AviList 统计可能不同。中文名称来自另外标注的匹配资料，不能把附加字段归为原表提供。

## 常见误区

- 主表行数不是种数。
- 单个鸟名可能在不同分类出版物中对应不同界定。
- 名录记录的分布不能说明某日某处一定能见到该鸟。

