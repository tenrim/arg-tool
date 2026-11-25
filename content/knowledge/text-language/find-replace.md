---
capabilityId: op:Find%20%2F%20Replace
title: 查找与替换
topicGroup: text-language
summary: 按字面或正则找出符合条件的文本片段，再逐段替换，保留其他字符。
aliases:
  - Find / Replace
  - 文本替换
  - 捕获组替换
  - 正则替换
sources:
  - id: ecma
    title: ECMAScript — Text Processing
    publisher: Ecma TC39
    url: https://tc39.es/ecma262/multipage/text-processing.html
    language: en
    kind: standard
    locator: 字符串替换、GetSubstitution 与正则匹配
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Find / Replace，字面与正则模式、匹配标志及替换
---

## 介绍
<!-- sources: ecma, fixed -->
查找与替换把符合条件的一段文字改成另一个值。查找部分可以是按字面读取的字符，也可以是正则表达式描述的规则。替换时未被匹配的部分维持原有顺序。

## 字面模式与正则模式
<!-- sources: ecma, fixed -->
在字面模式下，点号、括号和其他符号按实际字符查找。正则中的同一符号可以承担特殊语法，例如点号匹配一定范围内的单个字符，括号可以记录子表达式匹配到的内容。

:::example 按字面替换点号
[输入]
A. A? a.
查找字面点号 .，全部替换为 !
[结果]
A! A? a!
[说明]
问号与普通字母不符合字面点号，两个实际的句点各被替换一次。
:::

## 首个匹配、全局与大小写
<!-- sources: ecma, fixed -->
从左向右查找时，可在首次匹配后结束，也可继续替换后续独立匹配。是否忽略大小写则会改变哪些片段进入匹配。这两项选择彼此独立。

:::example 同一原文的两种范围
[输入]
red RED red
查找字面 red，替换为 blue。
[结果]
只替换首个且区分大小写时为 blue RED red。
全部替换且忽略大小写时为 blue blue blue。
[说明]
两次查询的待替换范围不同。剩余原文只出现在首个匹配的做法里。
:::

## 捕获组与替换表达式
<!-- sources: ecma, fixed -->
正则可将匹配中的某些部分放进捕获组。替换串里的 $1、$2 分别指第 1、2 个捕获组。可以换掉分隔符、改写局部顺序，同时保留所捕获的文字。

:::example 从字母在前改为数字在前
[输入]
A-12 B-34
模式 ([A-Z])-([0-9]+)，替换为 $2:$1，全局匹配
[结果]
12:A 34:B
[说明]
组一分别捕获 A、B，组二捕获 12、34，改用冒号连接并交换顺序。
:::

## 多行匹配与结果复核
<!-- sources: ecma, fixed -->
多行规则影响 ^ 和 $ 能否在每一行开始或结束处匹配。点号是否匹配换行是另一条设置。处理材料时可记录实际模式和匹配范围，并用样本核对分隔符、空白和大小写在输出中的变化。

## 常见误区
- 字面点号与正则点号有不同匹配范围。
- 全局匹配控制继续查找的位置，忽略大小写控制可接受的字符。
- 替换文本含美元符号时，要检查目标语法是否将它视为捕获引用。
