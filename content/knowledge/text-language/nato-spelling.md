---
capabilityId: op:Convert%20to%20NATO%20alphabet
title: 转换为北约拼读字母
topicGroup: text-language
summary: 解释逐字查表、约定拼写以及字母之外的文本读法。
aliases:
  - Convert to NATO alphabet
  - NATO 拼读
  - Alfa Bravo Charlie
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
  - id: worker
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Convert to NATO alphabet 的字符替换表
---

## 介绍
<!-- sources: icao, history -->

无线电拼读字母表把单个字母换成约定单词。B 和 D 的字母名称尾音相近，Bravo 与 Delta 则提供了更长的声音线索。在嘈杂或失真的通话里，接收方可以凭完整词辨认原字母。

## 逐字查表
<!-- sources: icao, worker -->

转换保持输入字母的先后，每个标准拼读词承载一个字母。书面结果可以在拼读词之间留空格，读者据此找到每个条目的边界。

:::example 三字母标识
[输入]
ARG
[结果]
Alfa Romeo Golf
[说明]
A、R、G 依次对应三个约定词。结果若有末尾空格，它属于分隔。
:::

## 约定拼写
<!-- sources: icao, history, worker -->

Alfa 使用 f，Juliett 以双 t 结尾。国际民航组织记录了这两种拼法的选择，用于帮助不同母语的使用者接近预期发音。

:::example 大小写与词表条目
[输入]
Aj
[结果]
Alfa Juliett
[说明]
小写 j 仍指向 J 的同一条目。输出的标准拼读词没有编码输入大小写。
:::

## 字母之外的符号
<!-- sources: icao, worker -->

民航无线电通信对数字另有发音规定。文本转换也可为数字和标点提供词面提示，但这些文本提示需要与真实通话中的发音和分组规则区分。

:::example 数字和标点的词面表示
[输入]
A/2.
[结果]
Alfa Fraction bar Two Full stop
[说明]
Alfa 属于拼读字母表。其余是这个文本转换选用的数字词与符号名。
:::

## 识别拼读序列
<!-- sources: icao, history -->

成串出现固定拼读词、紧邻呼号或编号，是比首字母相符更有力的线索。旧录音还可能采用另一版本的拼读表，判断时须核对各个完整词能否在同一套表中解释。

## 常见误区

- 拼读词只承载对应字母的身份。自由翻译词义不会得到原字母序列。
- Alfa、Juliett 是约定拼写。遇到 Alpha、Juliet 等拼法时，应核对转录来源。
- 文本转换的数字输出不覆盖真实航空通话中的全部数字规则。
