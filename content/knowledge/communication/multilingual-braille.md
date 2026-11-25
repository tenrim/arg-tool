---
capabilityId: native:braille-languages
title: 多语言盲文
topicGroup: communication
summary: 根据语言及缩写等级选择翻译表，区分 Unicode 点阵与带上下文的盲文翻译。
aliases:
  - Liblouis
  - 缩写盲文
  - 盲文翻译规则
sources:
  - id: unicode
    title: Unicode 17.0 第 21.1 节 Braille
    publisher: Unicode 联盟
    url: https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-21/
    language: en
    kind: standard
    locator: Braille Patterns、点序及不规定语言含义的编码边界
  - id: lib
    title: Liblouis Braille Translator and Back-Translator
    publisher: Liblouis
    url: https://github.com/liblouis/liblouis
    language: en
    kind: official-doc
    locator: 翻译、反向翻译、语言/规则表和测试文件
  - id: de
    title: 德语低缩写和高缩写规则表
    publisher: Liblouis / SBS
    url: /vendor/completion/liblouis/tables/de-g2.ctb
    language: de
    kind: implementation
    locator: 德语缩写规则与 include 的规则文件
  - id: worker
    title: 浏览器中的 Liblouis 翻译
    publisher: 迷雾工具箱
    url: /completion/braille-worker.js
    language: zh-CN
    kind: implementation
    locator: 选择固定规则表与 Unicode 点阵、翻译及反向翻译
---

## 介绍
<!-- sources: unicode, lib -->
多语言盲文翻译同时处理单元的点阵和该语言的书写规则。规定了凸点形状的 Unicode 码点并不赋予点阵固定的读音或字母。规则表还可规定数字、大小写、标点和缩写。

## 规则表与缩写等级
<!-- sources: lib, de, worker -->
同一语言常有完整拼写和不同程度的缩写。有些缩写只在词界或特定词形中出现，也可能用一个单元表示整个词。选择具体规则表比只标记语言更精确，某些表还会区分常规阅读与电脑盲文格式。

## 正向与反向
<!-- sources: unicode, lib, worker -->
正向翻译从源文字及上下文决定点阵。反向翻译结合所选表推定文字。多个文字可以产生相同点阵，规则因而未必能完全复原原文；保留译前文字和原点阵有助于核对。

## 三种语言的转换
<!-- sources: lib, de, worker -->
下面列出每项所用的规则表。在同样的表下，可复读转写结果并检查去空格后的单元数。

:::example 法语中带重音的文本
[输入]
été，表 fr-bfu-comp6.utb
[结果]
⠿⠞⠿
[说明]
两个 é 使用相同点阵，t 使用另一点阵。按原表回读得到 été。
:::

:::example 德语完整拼写与整词缩写
[输入]
für，分别选择 de-g0.utb 和 de-g2.ctb
[结果]
⠋⠳⠗；⠋
[说明]
前者逐字符表示，后者在这个词位用整词缩写。两份结果各用原表回读都得到 für。
:::

:::example 俄语文本
[输入]
мир，表 ru-litbrl.ctb
[结果]
⠍⠊⠗
[说明]
按这份俄语规则回读得到 мир。点阵可以与其他文字里的符号形状相同。
:::

## 材料类型和规则选择
<!-- sources: unicode, lib, de -->
资料中的语言、用途、数字标记和词界可帮助判断表。遇到一段只知语言却不知缩写等级的点阵，可以比较候选读法及未解释的符号，再结合原材料的版式和语境查证。

## 常见误区
- 点阵码点告诉读者点位布局，不能自动给出语言。
- 同一语言的缩写表和完整拼写表可能输出长度完全不同的结果。
- 反向翻译依赖上下文和表中的默认规则，有时不能精确复原原字符串。
