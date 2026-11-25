---
capabilityId: op:Remove%20Diacritics
title: 移除变音符号
topicGroup: text-language
summary: 先规范分解再删除指定的组合符号，并说明会留下或丢失哪些信息。
aliases:
  - Remove Diacritics
  - 重音符号清理
  - 组合附加符删除
sources:
  - id: uax15
    title: Unicode Normalization Forms（UAX #15）
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr15/
    language: en
    kind: standard
    locator: 第 1.1、1.2 节，等价性与四种形式
  - id: combining
    title: Characters and Combining Marks
    publisher: Unicode Consortium
    url: https://www.unicode.org/faq/char_combmark.html
    language: en
    kind: official-doc
    locator: Combining Marks and Combining Character Sequences
  - id: marks
    title: Combining Diacritical Marks（U+0300–U+036F）
    publisher: Unicode Consortium
    url: https://www.unicode.org/charts/PDF/U0300.pdf
    language: en
    kind: standard
    locator: 码表及字符名称
  - id: worker
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Remove Diacritics 的 run 方法
---

## 介绍
<!-- sources: combining, uax15 -->

变音符号可作为基字母的一部分，或作为单独码点附在基字母后。移除这些符号前，常先将 Unicode 文本规范分解，让两种写法进入可对照的形式。删去符号可能改变读音、词义或符号的排版效果。

## 分解与删除
<!-- sources: uax15, marks, worker -->

这个操作先应用 NFD，再删除 U+0300 至 U+036F 范围内的字符。预组字符能分解出在区间内的附加符时，附加信息才会被移除。

:::example 两种重音写法
[输入]
café 和 café，第二种以 e 加 U+0301 结尾
[结果]
两种输入都得到 cafe
[说明]
两种末尾表示在 NFD 后均为 U+0065 U+0301，删除 U+0301 后只剩 e。
:::

## 码表的适用边界
<!-- sources: uax15, combining, worker -->

一些带线条或特殊形状的字母是独立字符，规范分解不会拆成基础字母与区间内的附加符。其他文字体系也有自己的组合字符区块。固定区间的删除不能覆盖所有文字或所有变音标记。

:::example 无法由这条规则拆开的字母
[输入]
Łß ø Æ
[结果]
Łß ø Æ
[说明]
这些字符没有在 NFD 后产生 U+0300–U+036F 范围的附加符。将它们转写成更简单的字母需要另定规则。
:::

## 排版符号也可能被删除
<!-- sources: marks, worker -->

U+0332 组合低线和 U+0336 组合长划叠符都在删除区间内，即使它们用于视觉样式而非读音，也会被去掉。其他区块的叠加符仍可留下。

:::example 检查三个叠加字符
[输入]
a⃝ A̶ x̲
[结果]
a⃝ A x
[说明]
删除横划和低线对应的 U+0336、U+0332，保留 U+20DD 组合围圈。
:::

## 信息保留与比较
<!-- sources: uax15, combining -->

去除重音可以形成一种宽松的比较键。若要显示或审校原文，应保留原字符串。因为有符号和无符号的形式可能汇合到相同结果，清理后的比较键不能再恢复每一处原始标记。

## 常见误区

- NFD 本身只做规范分解和排序，移除标记发生在另一步。
- 该删除范围并不包含所有文字体系的组合符号。
- 去除附加符可能影响词义或显示样式，不能把清理输出当作原字符串。
