---
capabilityId: op:RAKE
title: RAKE 关键词提取
topicGroup: text-language
summary: 按分隔规则生成候选短语，并依据词语共现频率为各候选打分。
aliases:
  - RAKE
  - Rapid Automatic Keyword Extraction
  - 关键词提取
  - 共现打分
sources:
  - id: paper
    title: Automatic Keyword Extraction from Individual Documents
    publisher: Stuart Rose、Dave Engel、Nick Cramer、Wendy Cowley / Wiley
    url: https://catalogimages.wiley.com/images/db/pdf/9780470749821.excerpt.pdf
    language: en
    kind: author-spec
    locator: §1.2.1–1.2.3，候选短语、共现度和评分
  - id: engine
    title: CyberChef 11.5.0 — RAKE
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/RAKE.mjs
    language: en
    kind: implementation
    locator: run()，停用词、候选去重、共现度与短语求和
---

## 介绍
<!-- sources: paper -->

RAKE 是 Rapid Automatic Keyword Extraction 的缩写。算法从单篇材料中提取连续词语构成的候选短语，以词频和共现信息计算得分。它不需要事先标注训练集，得分来自文本中实际出现的短语。

## 如何形成候选
<!-- sources: paper, engine -->

分句和分词规则决定词语的位置。停用词用作候选边界，候选由边界之间相邻的词组成。单篇材料换用不同分词或停用词表，会改变候选集合，也会改变后续共现关系。对没有空格分词的材料，空白分隔规则不会自动切出其中的词。

## 词的共现分与短语分
<!-- sources: paper, engine -->

一种计分令每个词的得分为共现度除以词频，短语得分为其词分之和。固定实现先在文本中统计词频，再对候选短语去重。共现矩阵以去重后的短语构造，并为短语中的词记录与自身的共现。这使重复出现的整条短语也可改变分数。

## 用小样本核对得分
<!-- sources: paper, engine -->

样例使用空白分词。含空格的输入已经手工给出词边界，可以直接数词频、算同一短语中的共现次数，再检查输出的候选与得分。

:::example 两个短语共享一个词
[输入]
red fox and blue fox，and 为停用词。
[结果]
red fox 得 4，blue fox 得 4。
[说明]
red 和 blue 各在二词短语出现一次，共现度 2。fox 出现两次，共现度 4。三个词得分均为 2。
:::

:::example 完全相同的短语重复
[输入]
red fox and red fox，and 为停用词。
[结果]
只列出一条 red fox，得 2。
[说明]
去重后共现矩阵中只有一条二词短语，每个词共现度为 2。文本中各出现两次，词分为 1，短语分为 2。
:::

:::example 分词决定候选粒度
[输入]
红色 狐狸 和 蓝色 鸟，使用空白分词，和 为停用词。
[结果]
红色 狐狸 得 4，蓝色 鸟 得 4。
[说明]
若改成不留空格的 红色狐狸和蓝色鸟，则同样的空白分词只得到一整个词，得分为 1。停用词按完整词匹配。
:::

## 关键词列表的用途
<!-- sources: paper, engine -->

候选得分适合初步整理一段材料的重复主题和术语组合。较高的得分体现特定分词与共现计算下的统计特征。它不会推断短语一定是全文主旨，横向比较不同文本前也需要考虑各自的切分规则和词频。

## 常见误区

- 候选通常由已在原文中相邻出现的词组成，算法不会自由创造新术语。
- 得分不像概率那样限定在 0 到 1。
- 无空格文本需要明确的分词规则，停用词表本身无法完成分词。

