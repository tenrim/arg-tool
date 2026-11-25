---
capabilityId: native:keyboard-ninekey
title: 手机九键序号
topicGroup: characters
summary: 用数字键号和键内一基位置组成两位代码。
aliases:
  - Multi-tap key index
  - 九键键号序号
  - 电话键盘
  - 键内序号
sources:
  - id: itu
    title: E.161 电话键盘的数字、字母和符号
    publisher: ITU-T
    url: https://www.itu.int/rec/T-REC-E.161
    language: en
    kind: standard
    locator: 按键对应字母
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
<!-- sources: itu, table -->

电话键的字母编排可作为坐标表。用键号作为第一位、键内顺序作为第二位，每个字母占两个数字。

## 键组与下标
<!-- sources: itu, core -->

2 至 9 依次为 ABC、DEF、GHI、JKL、MNO、PQRS、TUV、WXYZ。每组从第一位开始。7 与 9 有第四位。

:::example 比较三键
[输入]
a、s、z
[结果]
21 74 94
[说明]
a 是 2 上第一位，s 是 7 上第四位，z 是 9 上第四位。
:::

## 连写与单词边界
<!-- sources: core, table -->

没有空格的纯数字串可每两位一组读取。较长文本以空格隔开代码，斜线保存单词边界。默认反查字母使用小写。

:::example 读无空格数字
[输入]
21427494
[结果]
ahsz
[说明]
拆为 21、42、74、94。
:::

:::example 含单词边界
[输入]
Hello world!
[结果]
42 32 53 53 63 / 91 63 73 53 31 !
[说明]
反查为 hello world!，句尾保留。
:::

## 缺项与无效坐标
<!-- sources: core, itu -->

坐标必须同时存在键和键内位置。解谜时要识别相邻数字是同一个坐标的两位还是偶然连写。

:::example 越界示例
[输入]
严格反查 97
[结果]
拒绝，9 键没有第七个字母
[说明]
9 键只允许 1–4。
:::

## 和其他九键方法区分
<!-- sources: itu, core -->

多击用重复键号记次数，因此逻辑等价的 c 可写 222。T9 只保留键号，需要词库筛选。该工具中的 23 直接指向 c。

## 常见误区

- 只有偶数位数字不保证每对都有效。
- 两位坐标不携带大写信息。
- 相同键组的 T9 输出不唯一，不能按坐标表强行解码。

