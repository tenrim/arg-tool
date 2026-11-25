---
capabilityId: op:JavaScript%20Beautify
title: 格式化 JavaScript
topicGroup: formats
summary: JavaScript 格式化按语法边界重排代码，使块、声明与表达式更容易阅读，同时要保留原语义。
aliases:
  - JavaScript Beautify
  - JS 美化
  - JavaScript 排版
  - 代码缩进
sources:
  - id: es
    title: "ECMAScript — ECMAScript Language: Lexical Grammar"
    publisher: Ecma TC39
    url: https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html
    language: en
    kind: standard
    locator: 词法记号、注释、字符串以及自动分号插入
  - id: esprima
    title: Esprima — Syntactic Analysis
    publisher: Esprima 项目
    url: https://docs.esprima.org/en/latest/syntactic-analysis.html
    language: en
    kind: official-doc
    locator: 语法分析、位置和范围、词法记号与注释
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: JavaScript Beautify，语法分析及代码生成
---

## 介绍
<!-- sources: es, esprima -->
JavaScript 格式化通过空格、换行和缩进展现语句层级。它可以让压成一行的函数更容易读，也可能统一引号或显式分号。原稿需要用于逐字比对或档案存证时，应另存排版前的版本。

## 语句、块和视觉层级
<!-- sources: es, esprima, fixed -->
能识别语法结构的排版器可把函数参数、块和运算符分别处理。花括号有时构成语句块，有时属于对象表达式，需要根据上下文决定层级。算法可以先解析结构，再根据统一规则重新输出。

:::example 展开一个求和函数
[输入]
function sum(a,b){return a+b}
[结果]
function sum(a, b) {
  return a + b;
}
[说明]
函数体增加一层缩进，参数之间与运算符两侧添加空格，语句末尾写出分号。
:::

## 换行与自动分号
<!-- sources: es, fixed -->
某些换行会改变 JavaScript 的解析。return 紧接换行时，后面的表达式并不成为它的返回参数。格式化应保留原有语法分段，以免移动换行后改变语义。

:::example 保留 return 后的分段
[输入]
function f(){return
{a:1}}
[结果]
function f() {
  return;
  {
    a:
      1;
  }
}
[说明]
return 未携带表达式。后面的花括号是语句块，其中 a 是标签。若把花括号接回 return 同一行，解析会改变。
:::

## 引号、转义与文字
<!-- sources: es, fixed -->
普通字符串可用单引号或双引号书写。若转换引号，应重新处理必要的转义并保持实际字符串内容。引号内部的空格属于值的一部分。模板字符串中的分行及插值也应依其语法识别。

:::example 统一引号并保留字面空格
[输入]
const label = "A  B";
[结果]
const label = 'A  B';
[说明]
引号变化属于源码表示，A 与 B 之间仍为两个空格。
:::

## 注释与语法支持
<!-- sources: es, esprima, fixed -->
注释可记录线索，也可能在特定构建工具中有附加作用。格式化时需确认是否保留注释。解析器支持的 JavaScript 版本也会影响能否排版，见到失败时应先检查输入语法和所用环境。

## 常见误区
- 将 return 后的换行随意移到其他位置可能改变含义。
- 引号中的空格与运算符之间用于排版的空格应分别看待。
- 能重新排版只说明相关语法已被处理，程序执行效果仍依赖值和运行环境。
