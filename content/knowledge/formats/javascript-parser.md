---
capabilityId: op:JavaScript%20Parser
title: 解析 JavaScript
topicGroup: formats
summary: JavaScript 解析将源码组织成抽象语法树，可同时记录每个节点的范围、行列、注释和词法记号。
aliases:
  - JavaScript Parser
  - AST
  - 抽象语法树
  - Esprima
  - 源码行列
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
  - id: estree
    title: ESTree — ES5 Node Types
    publisher: ESTree 项目
    url: https://github.com/estree/estree/blob/master/es5.md
    language: en
    kind: author-spec
    locator: Program、VariableDeclaration、BinaryExpression 及 ReturnStatement
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: JavaScript Parser，结构、行列、范围及注释输出
---

## 介绍
<!-- sources: esprima, estree -->
JavaScript 解析器读取源码，再按语法将组成部分组织成抽象语法树（AST）。声明、表达式、函数和语句块通常有不同的节点类型。树形关系帮助读者理解源码的组成，也可给后续代码检查提供位置。

## 声明及其元素
<!-- sources: esprima, estree, fixed -->
语法树常以 Program 作为根。变量声明可包含一个或多个声明项。每个声明项分别记录标识符和值的初始化表达式，在后续遍历时可以独立分析。

:::example 定位一个常量的值
[输入]
const n = 7;
[结果]
Program → VariableDeclaration → VariableDeclarator
id：Identifier，name 为 n
init：Literal，value 为 7
[说明]
树把声明项的名称和初始值分别记录在 id 和 init。
:::

## 位置、范围与词法记号
<!-- sources: esprima, fixed -->
range 记录从零开始的偏移，终点不计入范围。loc 则记录行列，行号从 1 开始，列从 0 开始。此外，词法记号列表可列出源码中的关键字、标点、标识符和字面量，注释可保存在单独列表。

:::example 同时读位置和运算结构
[输入]
// clue
n+2*3;
[结果]
标识符 n 的 range 为 [8,9]，起点为第 2 行第 0 列。
表达式的根运算符是 +，右子树运算符是 *。
[说明]
第一行含换行共占 8 个字符。乘法优先结合，所以 2*3 是加法的右子树。
:::

## 换行在语法中的作用
<!-- sources: es, estree, fixed -->
JavaScript 在若干特殊位置使用行终止符判定语句边界。理解这些边界时，可直接查看语法树是否把表达式接到前一条语句中，而不只看源码视觉缩进。

:::example return 后换行
[输入]
function f(){return
4}
[结果]
函数体先有 ReturnStatement，argument 为 null，随后有单独的 ExpressionStatement。
[说明]
换行使 4 成为单独的表达式语句，解析器据此生成两个相邻节点。
:::

## 语法版本、容错和运行
<!-- sources: esprima, es -->
脚本和模块有部分不同的入口规则。解析器也只能识别其所支持版本的语法。容错选项可能返回部分结构及错误列表，不能据此认定程序有效。语法树描述的是静态结构，运行时的值与副作用需结合其他信息判断。

## 常见误区
- AST 节点保存语法角色，通常不会计算程序的最终运行结果。
- 偏移范围的末端不包含在节点内，计算宽度可用末端减起点。
- 注释和词法记号属于可附加的记录，树中缺少它们不代表原文件没有相应内容。
