---
capabilityId: op:Sort
title: 排序
topicGroup: text-language
summary: 依文字、数值、IPv4 或长度重排记录，说明比较键与原记录的区别。
aliases:
  - Sort
  - 自然排序
  - 行排序
sources:
  - id: spec
    title: ECMA-262 Array.prototype.sort
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.sort
    language: en
    kind: standard
    locator: 字符串的默认比较、比较器与稳定性
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Sort 的各类型比较器、reverse 与分隔符
---

## 介绍
<!-- sources: spec, engine -->
排序按照同一规则比较记录，改变它们的相对位置。记录内容本身继续留用，源材料的排列次序则可能丢失。文本编号、数值以及地址可对应不同的规则。

## 文本顺序与数字段
<!-- sources: spec, engine -->
区分大小写的文字排序比较字符串。数字排序会拆出连续数字段，先按对应数值比较；因此 item2 可排在 item10 前。十六进制选项可把连续十六进制数字当作一段比较，点分 IPv4 可按四段组成的加权数比较。

## 长度与反排
<!-- sources: spec, engine -->
长度排序使用字符串单元数。相同长度的记录在正排时可保持相对次序；开启反向后会把排序后的整个列表倒过来，原先并列记录也可能换序。现有数据若需要保留源位次，可以额外保存行号。

## 同一清单的对照
<!-- sources: spec, engine -->
可对同一组数分别使用字符串和数字规则，再与带前缀的样本比较。

:::example 字符串次序
[输入]
10、2、11，分别占一行，区分大小写的字母排序
[结果]
10
11
2
[说明]
以 1 开头的字符串排在以 2 开头的字符串之前。
:::

:::example 比较数字
[输入]
同一列 10、2、11，数字排序
[结果]
2
10
11
[说明]
直接比较各项的数字段，2 小于 10。
:::

:::example 带共同前缀
[输入]
item10、item2、item1，分别占一行，数字排序
[结果]
item1
item2
item10
[说明]
共同的 item 不决定排列，再按后面的数字段比较。
:::

## 排序作为材料整理
<!-- sources: spec, engine -->
输入之间的空字段和前导空格可影响比较。选择数字模式处理带符号小数、单位或复杂版本号时，应先核对它是否只比较数字段。需要按整项实际数值排序时，可先解析统一的比较键。

## 常见误区
- 文本排序的 10 可以在 2 前。
- 数字段排序和通用数学表达式求值不同。
- 实际记录的原顺序需要单独保存。
