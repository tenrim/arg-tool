---
capabilityId: op:Remove%20line%20numbers
title: 移除行号
topicGroup: text-language
summary: 匹配并删除行开头的数字前缀，说明可匹配的格式和与真实数据重叠的边界。
aliases:
  - Remove line numbers
  - 清理行首编号
  - 去行号
sources:
  - id: spec
    title: ECMA-262 Regular Expression Patterns
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-patterns
    language: en
    kind: standard
    locator: 正则断言、字符类和数量词
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Remove line numbers：多行锚点、前导空白、数字及单个分隔字符
---

## 介绍
<!-- sources: spec, engine -->
移除行号在每行开头查找像编号的前缀，并删除匹配到的一段。它适合清理由编辑器或文档导出的行号；未匹配的开头按原样保留。

## 前缀的匹配范围
<!-- sources: spec, engine -->
现有正则查找行首的零至五个空格或制表符，接着是一串十进制数字和一个允许的分隔字符。允许的分隔包括空白、冒号、竖线、短横、逗号、句点、右括号或右方括号。负号不是编号的一部分。

## 空白与正文的边界
<!-- sources: spec, engine -->
删除只消耗一个编号后的分隔字符。例如 8) beta 去掉 8) 后，beta 前的空格继续保留。正则里的空白类也包含换行，因此一行若仅有数字，该行后的 LF 可能同时被去掉。

## 白空格与数字材料
<!-- sources: spec, engine -->
以下 ␠ 表示可见化的一个空格，用来核对开头是否还有缩进。

:::example 普通数字前缀
[输入]
1 alpha
2 beta
[结果]
alpha
beta
[说明]
每行分别移除行首数字和紧随的一个空格。
:::

:::example 右括号之后还有空格
[输入]
8) beta
[结果]
␠beta
[说明]
删除 8 和右括号，第二个分隔样式的空格仍留在结果。
:::

:::example 日期也可能命中
[输入]
2024-01-01
plain
[结果]
01-01
plain
[说明]
2024- 符合行首数字加短横的模式，即使它实际属于日期。
:::

## 移除前检查源格式
<!-- sources: spec, engine -->
若文本同时包含编号、日期、坐标或独立数字，需要先确认哪种前缀属于行号。材料格式更严格时，可改用只匹配特定分隔方式的表达式，并保留源文本用于比对。

## 常见误区
- 行首数字可能是正文数据，也会满足本规则。
- 多个连续分隔字符不会都被删除。
- 只含数字的行可能连后一个换行一起被消耗。
