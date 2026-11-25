---
capabilityId: op:Fuzzy%20Match
title: 模糊匹配
topicGroup: text-language
summary: 有序模糊匹配允许查询字符之间存在间隔，并按相邻性、边界和位置给候选匹配打分。
aliases:
  - Fuzzy Match
  - 有序子序列
  - 模糊搜索
  - 匹配权重
sources:
  - id: smith
    title: Fuzzy Match — algorithm documentation
    publisher: Forrest Smith
    url: https://github.com/forrestthewoods/lib_fts/blob/master/docs/fuzzy_match.md
    language: en
    kind: author-spec
    locator: 有序子序列与分数计算
  - id: blog
    title: Reverse Engineering Sublime Text’s Fuzzy Match
    publisher: Forrest Smith
    url: https://www.forrestthewoods.com/blog/reverse_engineering_sublime_texts_fuzzy_match/
    language: en
    kind: author-spec
    locator: 相邻、分隔和驼峰边界的评分来由
  - id: cyberchef
    title: Fuzzy Match（固定版本源码）
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/lib/FuzzyMatch.mjs
    language: en
    kind: implementation
    locator: 有序匹配、递归备选位置及评分
  - id: wf
    title: The String-to-String Correction Problem
    publisher: Robert A. Wagner 与 Michael J. Fischer
    url: https://computingbiology.github.io/docs/wagner1974.pdf
    language: en
    kind: author-spec
    locator: 第 2 至 4 节，编辑操作、递推和回溯
---

## 介绍
<!-- sources: smith, cyberchef -->
模糊匹配是一类近似搜索方法。用于文件名、标识符和谜题缩写的一种方法要求查询字符按顺序出现，允许字符之间隔开。满足条件后，评分再反映哪些位置更像有意缩写出的部分。

## 有序子序列
<!-- sources: smith, cyberchef -->
匹配从左到右寻找查询的每一项。找到一项后，后续查询项须在更靠右的位置匹配。匹配可忽略字母大小写，但大小写变化仍可在某些评分规则中形成单词边界。

:::example 跨过中间字符的缩写
[输入]
查询 rl，文本 Red Lamp
[结果]
匹配 R 和 L，位于第 1 和第 5 个字符
[说明]
其间的 e、d 和空格可以跳过，匹配点仍保持从左向右。
:::

## 相邻和边界的权重
<!-- sources: smith, blog, cyberchef -->
评分可奖励相邻的查询命中、词头、分隔符之后的位置或驼峰写法中的大写起点。另一些项会惩罚首个命中前的间隔和未命中的字符。分数根据给定查询和规则产生，适合将同一查询的多个候选放在一起比较。

:::example 连续命中与起始位置
[输入]
文本 Lamp，分别查询 la 与 amp
[结果]
la 命中 La；amp 命中 amp
[说明]
两组命中都连续。La 另从开头命中，amp 从第 2 位开始。因查询不同，这里只有位置可直接对照，分数不直接横比。
:::

## 同一查询的多个候选位置
<!-- sources: blog, cyberchef -->
文字内部可能有多个符合顺序的匹配。选择位置时可比较各组命中的边界和连贯程度。相同的查询字符串在不同评分规则下，有时会突出同一文本里的不同位置。

:::example 逆序字符无法命中
[输入]
查询 pa，文本 Lamp
[结果]
无匹配
[说明]
p 能在最后一位找到，但之后没有 a。有序匹配不会回头使用第 2 位。
:::

## 与编辑距离的用途区别
<!-- sources: smith, cyberchef, wf -->
有序匹配适合从较长名称中查找保留顺序的缩写。编辑距离着眼于整段转换需要多少次插入、删除或替换，常用来处理错别字和近似拼写。两种方法可以针对同一份文字回答不同的检索问题。

## 常见误区
- 有序匹配允许跳过输入字符，匹配顺序仍须保持。
- 匹配分数依赖权重和查询长度，不能当作通用百分比。
- 有序匹配可能命中词义无关的文字。结果说明字符及位置满足规则。
