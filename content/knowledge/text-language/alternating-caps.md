---
capabilityId: op:Alternating%20Caps
title: 交替大小写
topicGroup: text-language
summary: 说明大小写交替的计位规则、跳过符号和不区分大小写的字母怎样影响节奏。
aliases:
  - Alternating Caps
  - 交替字母大小写
sources:
  - id: unicode
    title: The Unicode Standard 16.0 — Conformance
    publisher: Unicode Consortium
    url: https://www.unicode.org/versions/Unicode16.0.0/core-spec/chapter-3/
    language: en
    kind: standard
    locator: 第 3.13 节，默认大小写算法
  - id: worker
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Alternating Caps 的 run 方法
---

## 介绍
<!-- sources: unicode, worker -->

交替大小写按位置轮流应用小写和大写映射。它依靠一个随输入更新的状态。同一个原字符出现在不同位置，可以得到两种不同的结果。

## 按字母推进
<!-- sources: worker, unicode -->

在从小写开始的规则下，第一个参与的字母转小写，第二个转大写，再重复这一对。空格、标点和数字原样保留，不消耗大小写位置。

:::example 跨过数字和标点
[输入]
AB C-D 4 E
[结果]
aB c-D 4 e
[说明]
参与的字母是 A、B、C、D、E。其余字符保留原位，交替序列只数这五个字母。
:::

## 跨行接续
<!-- sources: worker -->

换行本身没有大小写。连续处理一段输入时，状态可以跨过换行继续。另一种约定可在每行重新计数，两种结果只有在某些行长下恰好一致。

:::example 连续两行
[输入]
A
BC
[结果]
a
Bc
[说明]
第一行已消耗小写位置。第二行首字因此使用大写，下一位恢复小写。
:::

## 字母和有大小写的字母
<!-- sources: unicode, worker -->

有些文字里的字符属于 Unicode 字母，却没有大小写映射。若规则用字母类别计位，这些字符会消耗位置，但本身保持原形。有些实现还按 UTF-16 码元遍历，补充平面字符是否计入需以实际规则为准。

:::example 视觉不变的计位字符
[输入]
甲ab
[结果]
甲Ab
[说明]
甲不发生大小写变化，却消耗第一个小写位置。所以后面的 a 落在大写位置。
:::

## 结果的可逆性
<!-- sources: unicode, worker -->

交替大小写按位置设置大小写，不保存输入原来选择的大小写。在题目里将大写、小写用于承载二态信息时，应先提取原有状态。重新交替后看到的节奏是新规则产生的。

## 常见误区

- 是否按非字母推进会改变后续所有位置，需要明确计数规则。
- 视觉不变的字母仍可能参与计位。
- 交替大小写覆写原有模式，无法据结果还原原来每个字母的大小写。
