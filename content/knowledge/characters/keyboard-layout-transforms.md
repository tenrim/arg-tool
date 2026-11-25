---
capabilityId: native:keyboard-extra
title: 键盘位置与替换
topicGroup: characters
summary: 比较字母行坐标、行内变换、跨布局键位和电话多击。
aliases:
  - 键盘位置
  - Dvorak
  - AZERTY
  - 按键镜像
  - 多击
sources:
  - id: keys
    title: UI Events KeyboardEvent code Values
    publisher: W3C
    url: https://www.w3.org/TR/uievents-code/
    language: en
    kind: standard
    locator: 物理位置和键盘例图
  - id: itu
    title: E.161 电话键盘的数字、字母和符号
    publisher: ITU-T
    url: https://www.itu.int/rec/T-REC-E.161
    language: en
    kind: standard
    locator: 按键对应字母
  - id: layouts
    title: simple-keyboard-layouts
    publisher: simple-keyboard
    url: https://github.com/simple-keyboard/simple-keyboard-layouts
    language: en
    kind: author-spec
    locator: 各语言键位、层和候选
  - id: codes
    title: completion/codes.js
    publisher: 迷雾工具箱
    url: /completion/codes.js
    language: zh-CN
    kind: implementation
    locator: keyboardCode 与键行表
  - id: impl
    title: completion/keyboard-layout.js
    publisher: 迷雾工具箱
    url: /completion/keyboard-layout.js
    language: zh-CN
    kind: implementation
    locator: 真实布局行、键层和坐标起点
---

## 介绍
<!-- sources: keys, impl, codes -->

键盘类线索可以是一个字符在某张布局中的位置，也可以是同一位置两张布局的不同输出。从行列变换与布局换位中取哪种规则，取决于题目是否指定来源与目标键位。

## 字母行坐标与行内运算
<!-- sources: keys, codes -->

简化坐标只看三行字母键，从 1 标记行和列。也可交换列、行表示。向左右循环移动以单行长度取模，镜像将该行次序颠倒。

:::example 查第一行的字母
[输入]
简化 QWERTY 坐标；字母 w
[结果]
行列 1,2；列行 2,1
[说明]
第一行开头为 q、w。
:::

:::example 首键向左
[输入]
对 q 执行逐行左移一格
[结果]
p
[说明]
到达同一行末端，未进入下一行。
:::

## 换布局时保留同一按键位置
<!-- sources: keys, layouts, impl -->

完整布局使用声明的每一行和按键层。默认层和 Shift 层需独立选择。数字行和功能键计入坐标；对应无可输出文字的位置时会拒绝猜测。

:::example 英法同位对照
[输入]
English 默认层 q，换到 French 默认层
[结果]
a；来源完整坐标为 2,2
[说明]
完整布局的第一行在字母行上方，位置计数也包含功能键。
:::

## 标点和重复按键
<!-- sources: itu, codes -->

Dvorak 位置表包括部分标点。电话多击用重复同一个键号表达该组位置，空格隔字母，斜线隔词。

:::example 电话上的三个字母
[输入]
cat，多击模式
[结果]
222 2 8
[说明]
c 为同一键第三次，a 一次。
:::

## 多层选择和逆向验证
<!-- sources: layouts, impl -->

同一个字符在一张完整布局可能出现多次。复原应先锁定布局与层，核对对应实体位置。两套布局行长不一致时，有的字母没有对应按键。

## 常见误区

- 简化字母行坐标和完整设备坐标不能混用。
- 行内左移不是全字母表循环替换。
- 跨布局应记录来源层与目标层，不能只写两个语言名称。

