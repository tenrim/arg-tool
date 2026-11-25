---
capabilityId: op:Count%20occurrences
title: 统计出现次数
topicGroup: text-language
summary: 统计出现次数要确定计数单位、允许的匹配方式以及是否把重叠位置纳入。
aliases:
  - Count occurrences
  - 模式计数
  - 匹配次数
  - 重叠匹配
sources:
  - id: ecma
    title: ECMAScript — Text Processing
    publisher: Ecma TC39
    url: https://tc39.es/ecma262/multipage/text-processing.html
    language: en
    kind: standard
    locator: 字符串替换、GetSubstitution 与正则匹配
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Count occurrences，字面查找、全局正则和空查询行为
---

## 介绍
<!-- sources: ecma, fixed -->
出现次数按匹配事件计数。模式若能匹配多种写法，符合模式的片段都可计入。一个匹配可能覆盖多个字符，计数值本身并不表示匹配文字的总长度。

## 字面查询与大小写
<!-- sources: ecma, fixed -->
字面查询把输入视为同一串字符逐个比较。默认区分大小写的字面计数中，大写和小写会按各自原样比较。若输入包含点号等标点，只统计实际出现的标点。

:::example 统计实际的句点
[输入]
a.b.a
按字面查找 .
[结果]
2
[说明]
两个点分别出现在第 2 和第 4 个位置，三个字母不计入。
:::

## 非重叠计数
<!-- sources: ecma, fixed -->
常见的全局匹配找到一个长度大于零的片段后，从这个片段的尾部之后继续。即便另一条可能匹配从它内部开始，也不会重复占用已匹配的那些位置。

:::example banana 中的 ana
[输入]
banana
按字面查找 ana
[结果]
1
[说明]
从第 2 个字符开始的一处先被计入。另一处从第 4 个字符开始，与第一处共享一个字符，普通非重叠计数不会再计。
:::

## 用位置计入重叠
<!-- sources: ecma, fixed -->
正向前瞻可以检查当前位置之后是否紧接某段内容，又不消耗这段字符。若使用零宽模式查每一个可匹配的起点，就可以计入原本重叠的片段。计数对象是符合条件的起点。

:::example 查询重叠的两个起点
[输入]
banana
正则 (?=(ana))
[结果]
2
[说明]
第 2 和第 4 个字符前的位置均满足前瞻条件。两条匹配的区间本身长度为零。
:::

## 解释输出计数
<!-- sources: ecma, fixed -->
待查文本与模式相同仍可能因字面或正则而产生不同计数。正则的空匹配可占据字符之间的多个位置，空查询也可能被界面视为无任务。报告次数时应说明匹配语义，尤其要区分匹配数、按行计数和去重后的值数。

## 常见误区
- 下一个匹配可以按上一个匹配的结束位置开始，重叠内容不会自动重新计入。
- 正则点号通常不表示字面句点。
- 零宽匹配有位置却没有匹配长度，计数与字符数可不相同。
