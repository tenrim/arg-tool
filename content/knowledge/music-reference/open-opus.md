---
capabilityId: native:classical-music
title: 古典音乐资料
topicGroup: language-reference
summary: 按作曲家、作品题名、目录号、时期与体裁查读 Open Opus 固定快照。
aliases:
  - Open Opus
  - Classical music
  - 作品目录
  - 作曲家
sources:
  - id: open
    title: "Open Opus: Open Metadata for Classical Music"
    publisher: Open Opus
    url: https://openopus.org/
    language: en
    kind: official-doc
    locator: Taxonomy、开放数据及 FAQ
  - id: dump
    title: Open Opus ALL DATA
    publisher: Open Opus
    url: https://github.com/openopus-org/openopus_api/blob/master/ALLDATA.md
    language: en
    kind: author-spec
    locator: work/dump.json 和 composers/works
  - id: data
    title: Open Opus 固定快照
    publisher: 迷雾工具箱
    url: /vendor/atlas-life-culture/music.json
    language: zh-CN
    kind: implementation
    locator: 作曲家、作品及 2026-10-17 原始快照字段
  - id: core
    title: 作品和作曲家的多字段检索
    publisher: 迷雾工具箱
    url: /atlas-life-culture/core.js
    language: zh-CN
    kind: implementation
    locator: queryMusic
---

## 介绍
<!-- sources: open, dump -->

Open Opus 是古典音乐元数据目录，组织作曲家和作品的关系。固定快照含 220 位作曲家和 24,975 部作品，可用作曲家名字、原作品名和检索词定位记录。

## 作曲家时期和作品体裁
<!-- sources: open, data, core -->

时期字段描述作曲家被归入的类别。作品体裁是记录自身的分类。例如 Classical 是作曲家时期，Orchestral 是作品体裁。即使同一作曲家也可有若干不同体裁。

:::example 莫扎特的交响曲
[输入]
作曲家 Mozart，编号 K.550
[结果]
Symphony no. 40 in G minor, K.550；Orchestral
[说明]
作曲家原始全名 Wolfgang Amadeus Mozart，时期为 Classical。
:::

## 目录号需要作曲家范围
<!-- sources: dump, data, core -->

不同学者建立的目录可以使用相似缩写和相同号码。孤立的 K.550 含的信息不足，应结合作者、体裁、调号和标题核对。

:::example 同号作品的区别
[输入]
搜索 K.550，限定 Baroque
[结果]
Domenico Scarlatti 的 Sonata in B flat major, K.550, L.S42；Keyboard
[说明]
这条与莫扎特记录的体裁、时期和调性均不同。
:::

## 原始拼写与本地匹配
<!-- sources: data, core -->

搜索入口可以接受简化检索词，但结果仍保留作品原题名和作曲家原字段。做书面记录时可并列中文译名与原始拼写，避免相似译名干扰。

:::example 变音符与搜索词
[输入]
在作曲家栏目搜索 Ades
[结果]
Thomas Adès，原索引名 Adès
[说明]
检索词可省重音符，引用时保留来源拼写。
:::

## 数据覆盖和日期精度
<!-- sources: open, dump, data -->

上游以 CC0 提供元数据，库内的热门和推荐位并非作品评价分数。只存到年而填入 01-01 的数据不能当作已证实生日。完整快照只说明该版数据齐全，不等同于作品全集、配器、录音或乐谱。

## 常见误区

- 一串目录号不能跨作曲家直接指向同一部作品。
- 标签 Classical 和 Orchestral 属于不同列。
- 公开的作品元数据许可不等于录音或乐谱的许可。

