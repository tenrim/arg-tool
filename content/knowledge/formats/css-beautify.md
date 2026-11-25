---
capabilityId: op:CSS%20Beautify
title: 格式化 CSS
topicGroup: formats
summary: CSS 排版根据规则和声明的结构安排换行、缩进。格式化需要保护字符串、函数值和选择器中的有效字符。
aliases:
  - CSS Beautify
  - CSS 美化
  - 样式表排版
  - CSS 缩进
sources:
  - id: syntax
    title: CSS Syntax Module Level 3
    publisher: W3C
    url: https://www.w3.org/TR/css-syntax-3/
    language: en
    kind: standard
    locator: 第 4、5、9 节，词法记号、声明及序列化
  - id: selectors
    title: Selectors Level 4
    publisher: W3C
    url: https://www.w3.org/TR/selectors-4/
    language: en
    kind: standard
    locator: 第 6、14、17 节，属性、组合符和匹配
  - id: values
    title: CSS Values and Units Module Level 4
    publisher: W3C
    url: https://www.w3.org/TR/css-values-4/
    language: en
    kind: standard
    locator: 数学函数的语法及加减号周围的空白
  - id: fixed
    title: CyberChef 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: CSS Beautify，花括号、分号与换行处理
---

## 介绍
<!-- sources: syntax, selectors -->
CSS 样式表由规则组成。典型规则先给出选择器，再在花括号中列出声明。排版器可以把多条声明分行，并按规则嵌套增加缩进，让结构更易检查。

## 声明边界
<!-- sources: syntax, fixed -->
一条普通声明由属性名与值组成。规则块内的顶层分号可分隔声明。格式化时在真正的边界换行，含有多个值或函数的声明仍要保持完整。

:::example 把两条声明分行
[输入]
p{color:red;font-size:14px}
[结果]
p{
  color:red;
  font-size:14px
}
[说明]
两条声明都属于同一 p 选择器，分号界定两者。
:::

## 条件规则及其内层
<!-- sources: syntax, fixed -->
以 @ 开头的规则可带条件和规则块。一条 @media 可以包含多条普通规则，其选择器和声明分别处于不同缩进层次。排版后的内层仍受原条件约束。

:::example 展开媒体查询
[输入]
@media (min-width:600px){p{color:blue}}
[结果]
@media (min-width:600px){
  p{
    color:blue
  }
}
[说明]
媒体条件是外层，p 的规则块是内层。颜色声明的适用条件保持原样。
:::

## 字符串与函数参数
<!-- sources: syntax, values, fixed -->
分号可能出现在带引号的字符串里。按 CSS 词法分析时，引号内的分号属于字符串。简单分隔文本的排版器可能错误地在此插入换行。数学函数中的空白同样值得保留，例如 calc 表达式的减号两边使用空格。

:::example 保留计算表达式
[输入]
p{width:calc(100% - 2rem)}
[结果]
p{
  width:calc(100% - 2rem)
}
[说明]
格式化只展开规则块，calc 括号内的各符号和分隔空格保持原样。
:::

## 选择器中的空白
<!-- sources: syntax, selectors -->
空白可表示后代关系。例如 article a 匹配 article 内部的 a 元素。删除该空白可能把两个名称拼成一个标识符。在有效选择器和字符串中保留必要字符，是排版保持含义的条件。

## 常见误区
- 排版后的样式表仍需按 CSS 语法和目标环境验证。
- 字符串中的分号不能作为一条声明的切分依据。
- 规则选择器中的某些空白会改变匹配范围。
