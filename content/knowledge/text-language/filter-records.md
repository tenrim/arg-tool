---
capabilityId: op:Filter
title: 筛选
topicGroup: text-language
summary: 把文本按分隔符切开，为每项测试正则，保留匹配或不匹配的记录。
aliases:
  - Filter
  - 正则筛选
  - 保留匹配项
sources:
  - id: spec
    title: ECMA-262 Regular Expression Patterns
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-patterns
    language: en
    kind: standard
    locator: 正则断言、字符类和数量词
  - id: xre
    title: XRegExp Syntax and Flags
    publisher: XRegExp
    url: https://xregexp.com/
    language: en
    kind: author-spec
    locator: 扩展语法及模式内标志
  - id: engine
    title: CyberChef 11.5.0 正则模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Regex.js
    language: en
    kind: implementation
    locator: Filter：拆分、正则 test 与条件反转
---

## 介绍
<!-- sources: spec, engine -->
筛选逐条判断，从原列表选出符合某个正则表达式条件的记录。筛选不会改写被选中的内容，结果仍依原顺序排列。反向筛选可以得到剩下的记录。

## 以整条记录为范围
<!-- sources: spec, engine -->
程序先按所选分隔符切项，然后测试每个记录。正则没有锚点时，局部匹配就足以选中整项。加 ^ 和 $ 可约束开头与末尾，例如 ^red-\d+$ 会要求 red- 后面是一串数字。

## 大小写和模式错误
<!-- sources: spec, xre, engine -->
字面匹配可受大小写影响，扩展表达式可在开头写 (?i) 进行忽略大小写的判断。若模式无法编译，属于输入语法错误；它与一个合法模式对所有记录均不匹配有不同的结果。

## 条件分支的实例
<!-- sources: spec, xre, engine -->
以下三组分别核对匹配、取反和通过标志改变比较方式。

:::example 保留匹配项
[输入]
red-7
blue-42
red-A
[结果]
red-7
[说明]
逐行比较 ^red-\d+$，只选前缀和数字段同时满足的一行。
:::

:::example 反向保留
[输入]
同一列 red-7、blue-42、red-A，仍用 ^red-\d+$ 并反转条件
[结果]
blue-42
red-A
[说明]
这两条分别因前缀或末尾部分不匹配而被留下。
:::

:::example 采用大小写忽略标志
[输入]
RED
red
[结果]
RED
red
[说明]
逐行按 (?i)^red$ 筛选，两行都命中，但不会把文字本身统一成小写。
:::

## 筛选与提取的用途
<!-- sources: spec, engine -->
有些任务只需收集每条记录中匹配的局部字段。筛选提供的是包含该字段的整项，可用于保留上下文；抽取字段则需另外选择正则提取或解析记录的工具。

## 常见误区
- 筛选保留整条记录，不只返回命中的片段。
- 反转条件只改变选中范围，不颠倒显示顺序。
- 空结果和无效正则代表不同情况。
