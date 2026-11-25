---
capabilityId: op:Shuffle
title: 随机打乱
topicGroup: text-language
summary: 在不改变记录内容和出现次数的前提下随机排列，说明可复核的排列性质。
aliases:
  - Shuffle
  - 随机排列
  - Fisher–Yates
sources:
  - id: algo
    title: Fisher–Yates Shuffle
    publisher: NIST Dictionary of Algorithms and Data Structures
    url: https://xlinux.nist.gov/dads/HTML/fisherYatesShuffle.html
    language: en
    kind: official-doc
    locator: 逐位置交换得到随机排列的算法
  - id: rng
    title: Web Cryptography API
    publisher: W3C
    url: https://www.w3.org/TR/webcrypto/#Crypto-method-getRandomValues
    language: en
    kind: standard
    locator: Crypto.getRandomValues
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Shuffle：使用随机索引自尾往前交换
---

## 介绍
<!-- sources: algo, engine -->
随机打乱改变记录先后，内容和出现次数保持。输入有两条完全相同的记录时，输出仍保留两条。一次结果偶然与原顺序一样，也满足排列定义。

## 逐位置交换
<!-- sources: algo, engine -->
Fisher–Yates 的一种写法从最后一项开始。取当前位置之前含自身的范围，随机选一项，与当前位置交换。接着处理前一位置，直至尚未放定的范围只剩一项。

## 随机来源与验证
<!-- sources: rng, engine -->
当前运算在平台支持时通过 getRandomValues 获得随机数，另有通用随机数来源作为回退。校验单次结果时可比较记录总数和每项的出现次数；重复运行也不要求每次的顺序不同。

## 可验证的置换例子
<!-- sources: algo, engine -->
以下示例给出合法结果或必须出现的性质，随机结果顺序可能变化。

:::example 含相同记录
[输入]
A,A,B,C，使用逗号
[结果]
例如 C,B,A,A
[说明]
总数仍为 4，两个 A 和各一个 B、C 均保留。
:::

:::example 只有一条记录
[输入]
only，按 LF 分隔
[结果]
only
[说明]
只有一条记录时没有其他位置可交换。
:::

:::example 空记录也参与
[输入]
A、空行、B，以 LF 分隔
[结果]
仍有 A、B 和一条空记录，空行位置可以改变
[说明]
例如 A 和 B 先后排在前两行时，末尾的 LF 表示最后的空记录。
:::

## 需要重现排序的情况
<!-- sources: algo, engine -->
输入和分隔方式可重现记录集合，不能重现这次具体的随机顺序。若要复核某次抽样或给展演安排顺序，可保存结果本身。希望保留原来信息时应另存源记录和原位次。

## 常见误区
- 随机打乱不会先去重。
- 当前输入无种子时，无法从参数指定某个随机排列。
- 输出偶然保持原顺序也可以发生。
