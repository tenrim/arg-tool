---
capabilityId: op:Swap%20case
title: 交换大小写
topicGroup: text-language
summary: 区分逐位置的大小写交换、字符扩展和整串大小写映射。
aliases:
  - Swap case
  - 反转大小写
sources:
  - id: unicode
    title: The Unicode Standard 16.0 — Conformance
    publisher: Unicode Consortium
    url: https://www.unicode.org/versions/Unicode16.0.0/core-spec/chapter-3/
    language: en
    kind: standard
    locator: 第 3.13 节，默认大小写算法
  - id: special
    title: Unicode 16.0.0 SpecialCasing.txt
    publisher: Unicode Consortium
    url: https://www.unicode.org/Public/16.0.0/ucd/SpecialCasing.txt
    language: en
    kind: standard
    locator: 特殊映射与语言／上下文条件
  - id: worker
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Swap case 的 run 方法
---

## 介绍
<!-- sources: unicode, worker -->

交换大小写要根据每个原字符的大小写映射选择输出。大写转换成小写，小写转换成大写。数字和多数标点没有大小写映射，因而保持原值。

## 逐位置的取值规则
<!-- sources: unicode, worker -->

一种交换方法先计算当前单元的大写形式。如果已有变化，就使用大写结果。若大写结果等于原单元，则计算其小写形式。这样可以在同一输入里同时完成两个方向的转换。

:::example 大小写成对交换
[输入]
Ωω Ää
[结果]
ωΩ äÄ
[说明]
Ω 和 ω 分别变成小写与大写，带分音符的 Ä、ä 也分别交换，空格不变。
:::

## 一个字符产生多个码点
<!-- sources: special, worker -->

Unicode 的完整映射可能输出多个码点。因此交换操作不保证保持码点数，也不保证总能通过再交换一次来逆转。

:::example 交换两次仍无法还原
[输入]
ß
[结果]
第一次得到 SS，第二次得到 ss。
[说明]
大写映射的两个 S 在下一次被分别处理，已经没有信息指明原来是一个 ß。
:::

## 局部转换与整串转换
<!-- sources: unicode, special, worker -->

某些文字的完整大小写映射会参考前后字符。逐单元检查只能看到当前位置，可能给出不同结果。若实现按 UTF-16 码元取单元，还应复核补充平面字母是否作为一个完整码点参加。

:::example 希腊词末的 Sigma
[输入]
ΟΣ
[结果]
逐位置交换得到 οσ；整串默认转小写得到 ος。
[说明]
整串转小写使用词末上下文。逐单元时 Σ 独立转换，没有所需的前文。
:::

## 保留轨迹
<!-- sources: unicode, worker -->

对仅包含基本拉丁字母且没有一对多映射的输入，交换可当作固定的二态替换。若任务需要记录原大小写，应以原始字符序列为准，并在遇到其他文字时核对预期映射。

## 常见误区

- 大小写交换并非统一转大写或统一转小写。
- 有些字符的映射产生多个码点，交换两次也可能无法还原。
- 同一内容逐单元交换与整串大小写转换可能触发不同的上下文规则。
