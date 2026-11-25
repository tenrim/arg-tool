---
capabilityId: op:Generic%20Code%20Beautify
title: 通用代码格式化
topicGroup: formats
summary: 按花括号、分号和常见字词边界改善 C 风格文本的可读性。
aliases:
  - 通用美化
  - C 风格
sources:
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的处理规则和声明边界
  - id: impl
    title: GenericCodeBeautify 源码
    publisher: GCHQ
    url: https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/GenericCodeBeautify.mjs
    language: en
    kind: implementation
    locator: run 的通用排版算法与已知限制
  - id: js
    title: ECMAScript Lexical Grammar
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html
    language: en
    kind: standard
    locator: 字符串、注释、换行和自动分号插入
---

## 介绍
<!-- sources: chef, impl -->

通用代码格式化用常见的标点和词边界拆分一行代码。JavaScript、C、Java 等语言共享花括号和分号的外观，同时各有额外语法。这个入口适合辅助阅读来历不明的 C 风格片段。

## 换行与块层次
<!-- sources: impl, chef -->

成对花括号可提示块的起止，分号常表明语句结束。格式器按发现的层次调整后续行缩进，对简单语句可以直观地标出所在块。

:::example 分开两条调用
[输入]
if(x){a();b();}
[结果]
if (x)  {
    a();
    b();
}
[说明]
两条调用放入同一花括号块。
:::

## 引号内外的符号
<!-- sources: js, impl -->

同一个分号可能落在字符串内容中，也可分隔语句。引号内原有字符必须结合语言张贴的词法规则解释。

:::example 保留字符串的分号
[输入]
const s="a;b";const x=1;
[结果]
const s = "a;b";
const x = 1;
[说明]
本例中只在字符串外的语句边界换行。
:::

## 控制结构的排版限制
<!-- sources: impl, chef, js -->

for 头部、模板字面量、正则字面量等都可能使用和普通分隔相同的符号。通用格式规则不能准确反推每一种语法，必要时应交由对应语言解析器核对。

:::example for 头部也可能被拆开
[输入]
for(let i=0;i<2;i++){f(i);}
[结果]
for(let i = 0;
i < 2;
i++) {
    f(i);
}
[说明]
示例反映分号启发式，不应把这种排版当作语言标准。
:::

## 排版后的验证
<!-- sources: js, chef -->

对结果做逐行对照可以找出原片段中的字符串、括号和注释。需要把结果用于工程时，应由原语言验证语法和运行预期，特别留意换行敏感的结构。

## 常见误区

- 可读性改善不证明代码语义相同。
- 通用格式化不能代替编译或安全分析。
- 共同的括号形式不意味着语言兼容。

