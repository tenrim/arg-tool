---
capabilityId: native:keyboard-qwerty
title: QWERTY 键盘替换
topicGroup: characters
summary: 按索引将字母表对应到 QWERTY 键盘行序，通过反向映射复原。
aliases:
  - ABC QWERTY
  - 键盘密码
  - 键盘行序
  - 自定义替换表
sources:
  - id: keys
    title: UI Events KeyboardEvent code Values
    publisher: W3C
    url: https://www.w3.org/TR/uievents-code/
    language: en
    kind: standard
    locator: 物理位置和键盘例图
  - id: core
    title: expansion/keyboard-core.js
    publisher: 迷雾工具箱
    url: /expansion/keyboard-core.js
    language: zh-CN
    kind: implementation
    locator: runKeyboard、映射与反查
  - id: table
    title: vendor/expansion/keyboard/UPSTREAM.json
    publisher: 迷雾工具箱
    url: /vendor/expansion/keyboard/UPSTREAM.json
    language: zh-CN
    kind: implementation
    locator: 固定提交 29fa4ee 与原 12 行映射
---

## 介绍
<!-- sources: keys, table -->

QWERTY 取键盘上方字母行的前六键为名。作为替换规则时，将普通字母表从 A 至 Z 与键盘三个字母行依序并列，按相同位置配对。

## 读三行并连接
<!-- sources: keys, table -->

按上、中、下三行各自从左到右连接，得到 QWERTYUIOPASDFGHJKLZXCVBNM。顺序需要完整且无重复，一边的选定字母在另一边取同下标。

:::example 前三位
[输入]
ABC
[结果]
QWE
[说明]
第一位 A→Q，第二位 B→W，第三位 C→E。
:::

## 恢复方向和表外文字
<!-- sources: core, table -->

反查先在键盘行序表中找到输入，再用索引查字母表。默认规则保留大小写形态与表外符号。

:::example 保留大小写和标点
[输入]
Abc, xyz!
[结果]
Qwe, bnm!；反查恢复 Abc, xyz!
[说明]
逗号、空格和感叹号保留。
:::

## 同页其他表与最长匹配
<!-- sources: table, core -->

此工具保存多种原始映射，包括有重复值的表。自定义若给多个不同长度的符号，读取时采用最长匹配；目标值重复、分隔损坏都会丢掉信息。

:::example 自定义表的前缀交叠
[输入]
源 a ab abc，目标 x y z；输入 abcaba
[结果]
zyx
[说明]
依序取最长有效片段 abc、ab、a。
:::

## 识别相邻键线索
<!-- sources: keys, core -->

若题面暗示把手放偏一格，应考虑逐行左移或右移。若强调从 A 至 Z 排在第二行键盘文本上，才符合这张全局配对表。

## 常见误区

- 反向查表并非再次按同方向加密。
- 系统切换输入法不会改动这套固定配对。
- 自定义映射即使能编码，仍须另行核对反查是否唯一。

