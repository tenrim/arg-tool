---
capabilityId: native:virtual-keyboard
title: 多语言键盘
topicGroup: text-language
summary: 用实际语言布局、键层与光标选区输入并保留 Unicode 字符。
aliases:
  - 多语言输入
  - 虚拟键盘
  - Shift 层
  - 布局切换
sources:
  - id: keys
    title: UI Events KeyboardEvent code Values
    publisher: W3C
    url: https://www.w3.org/TR/uievents-code/
    language: en
    kind: standard
    locator: 物理位置和键盘例图
  - id: layouts
    title: simple-keyboard-layouts
    publisher: simple-keyboard
    url: https://github.com/simple-keyboard/simple-keyboard-layouts
    language: en
    kind: author-spec
    locator: 各语言键位、层和候选
  - id: lib
    title: simple-keyboard 文档
    publisher: Francisco Hodge
    url: https://hodgef.com/simple-keyboard/documentation/
    language: en
    kind: official-doc
    locator: layoutName、候选和输入状态
  - id: impl
    title: completion/keyboard.js
    publisher: 迷雾工具箱
    url: /completion/keyboard.js
    language: zh-CN
    kind: implementation
    locator: 语言布局载入、键层与选区插入
---

## 介绍
<!-- sources: layouts, lib -->

多语言虚拟键盘把布局中定义的按键画成可点击的输入面。它适合没有相应实体键盘时输入可见符号，并保留可编辑文字。

## 位置、语言和键层
<!-- sources: keys, layouts, impl -->

同一个键的位置可以在不同语言键盘上产生不同字符。在某个布局内部，默认层、Shift 层和该布局声明的其他层各自有完整的键位序列。

:::example 默认布局的首字母键
[输入]
English 与 French 的默认层字母行第一个文字键
[结果]
分别为 q 与 a
[说明]
来自两份布局定义。
:::

:::example 切换层再继续录入
[输入]
先按 English 默认层 a；末尾切换 Shift 层按 A
[结果]
aA
[说明]
切换层保留当前文本。
:::

## 光标和选区
<!-- sources: lib, impl -->

虚拟键盘在光标位置插入文本，选有文本时以新输入取代选区。浮动入口能够将编辑结果送回原先选中的文字输入框。

:::example 在中间插入
[输入]
文本 A中，光标置在两字之间，输入 a
[结果]
Aa中
[说明]
字符位置在原文本中保留。
:::

## 候选与符号核对
<!-- sources: layouts, lib -->

有些上游布局带少量候选数组。候选属于那套布局声明，不覆盖该语言所有词语，也不改变编码方式。

## 保存字符资料
<!-- sources: keys, lib, impl -->

如果需要查验异国语言题面，可记录精确字符和所用层。外形相似的符号可以有不同码点，外形记录和文本记录都能为后续核对提供线索。

## 常见误区

- 某种语言有键位布局不意味着有完整词典和预测输入。
- 切换 Shift 只改变键输出选项。
- 相似字形未必是同一 Unicode 字符。

