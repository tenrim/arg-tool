---
capabilityId: native:nato
title: 无线电拼读字母
topicGroup: communication
summary: 从完整拼读词恢复字母，区分文字记录里的词界、大小写和未知词。
aliases:
  - International Radiotelephony Spelling Alphabet
  - NATO 双向拼读
sources:
  - id: icao
    title: ICAO Annex 10 — Aeronautical Telecommunications, Volume II
    publisher: 国际民用航空组织
    url: https://www.icao.int/Meetings/anconf12/Document%20Archive/AN10_V2_cons%5B1%5D.pdf
    language: en
    kind: standard
    locator: 图 5-1，无线电拼读字母表与第 5.2.1.4 节数字
  - id: history
    title: Annex 10 — Aeronautical Telecommunications
    publisher: 国际民用航空组织
    url: https://www.icao.int/sites/default/files/postalhistory/annex_10_aeronautical_telecommunications.htm
    language: en
    kind: official-doc
    locator: International Radiotelephony Spelling Alphabet
  - id: conversion
    title: 拼读字母词表和双向转换
    publisher: 迷雾工具箱
    url: /completion/codes.js
    language: zh-CN
    kind: implementation
    locator: NATO、nato
---

## 介绍
<!-- sources: icao, history -->

国际无线电拼读字母表为 26 个基本拉丁字母各分配一个词。发送者按顺序读出拼读词，接收者再用同一张表恢复字母。这是一种传送字母身份的办法。

## 从词恢复字母
<!-- sources: icao, conversion -->

反向读取要匹配完整拼读词。Tango 可换成 T，Table 虽然同样以 T 开头，却不属于这张词表。书面记录中可按空白划分候选词。

:::example 还原一串标识
[输入]
Alfa Romeo Golf
[结果]
ARG
[说明]
三个词分别在表中查得 A、R、G，按原顺序连接。
:::

## 表示原来的空格
<!-- sources: conversion -->

用于分开拼读词的空格不能同时代表所有原文空格。一种明确的书面约定是以独立的斜线标出原文词界，解码时只在斜线位置补入空格。

:::example 保留一个词界
[输入]
Alfa / Juliett
[结果]
A J
[说明]
两个词各恢复一个字母，中间的斜线标记恢复成原来的空格。
:::

## 拼写与断词
<!-- sources: icao, history, conversion -->

识别书面拼读词时可以忽略大小写。词内连字符仍是名字的一部分。收到未登记的词时，应回看原材料或记为不确定，避免把误拼当作原字母。

:::example 小写形式的转录
[输入]
x-ray yankee
[结果]
XY
[说明]
忽略大小写匹配 X-ray 和 Yankee。连字符不切分第一个词。
:::

## 交叉核对
<!-- sources: icao, history -->

可把候选字母重新按同一张表拼读，检查是否遗漏一个词、颠倒两个符号或丢掉词界。真实语音中若仍有几个候选，应结合标识长度与原录音记录其不确定性。

## 常见误区

- 取所有普通单词的首字母属于首字提取。只有完整词表匹配才能据此识读约定拼读词。
- 书面数据里用于标注词界的斜线，不是原内容的普通字母。
- 国际音标记录语音，拼读表分配的是用于传送字母的约定词。
