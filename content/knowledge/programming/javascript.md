---
capabilityId: native:code-javascript
title: JavaScript
topicGroup: programming
summary: 区分 ECMAScript 的数据类型与宿主接口，复算字符串、浮点数和 Promise 输出。
aliases:
  - ECMAScript
  - QuickJS
  - JavaScript 数值
sources:
  - id: spec
    title: ECMAScript Language Specification
    publisher: TC39
    url: https://tc39.es/ecma262/
    language: en
    kind: standard
    locator: Number、运算符与 Promise Jobs
  - id: engine
    title: quickjs-emscripten
    publisher: QuickJS Emscripten maintainers
    url: https://github.com/justjake/quickjs-emscripten
    language: en
    kind: official-doc
    locator: QuickJS 上下文及调度待处理任务
  - id: local
    title: 代码执行 Worker
    publisher: 迷雾工具箱
    url: /coderunner/worker.js
    language: zh-CN
    kind: implementation
    locator: executeJS 中的独立上下文、输入和显示函数
---

## 介绍
<!-- sources: spec, engine -->

JavaScript 的表达式、对象与异步操作由 ECMAScript 规范定义。控制台、网页 DOM 与文件接口来自具体宿主。浏览器内嵌的独立 QuickJS 上下文可以运行语言本身，外部能力由它暴露的接口决定。

## 字符串连接与加法
<!-- sources: spec -->

加号在将操作数转成原始值后，可能执行文本连接或数值相加。只要有一个操作数在此阶段为字符串，另一项也转成字符串并连接。若希望对输入文本做数学计算，可先显式转换。

:::example 将两个结果写成数组
[输入]
console.log(JSON.stringify([1+"2", 1+Number("2")]));
[结果]
["12",3]
[说明]
第一项含字符串，第二项显式转为 Number。
:::

## 浮点表示与任务队列
<!-- sources: spec, engine -->

Number 是二进制浮点格式，部分有限十进制小数无法精确表示。Promise 的 reaction 在相应任务被执行以后才输出，和立即调用打印函数有独立次序。

:::example 相等比较和后续任务
[输入]
console.log(0.1+0.2===0.3); Promise.resolve(42).then(print);
[结果]
false
42
[说明]
严格相等比较的是已经舍入的二进制值。下一行来自 Promise 的后续任务。
:::

## 逐行取标准输入
<!-- sources: engine, local -->

此嵌入上下文提供 readline、print 等函数，独立地读写测试文本。readline 调用一次只取一行。若要表现所有空格和换行，打印字面文本的可见边界或者用 JSON 表达会更清楚。

:::example 分别读取两行
[输入]
代码 print(readline(),readline());。两行程序输入依次为 red 和 blue。
[结果]
red blue
[说明]
两个 readline 先后消费一行，print 用空格组合显示。
:::

## 核对宿主差异
<!-- sources: spec, engine, local -->

同一段纯表达式可跨符合规范的引擎比较。和其相对的网络、文件或页面操作，需要检查各宿主实际提供的接口。程序的返回值也和主动打印的标准输出不同，结果面板展示的是程序写出的值。

## 常见误区

- 数值 2 和字符串 "2" 会改变加号的行为。
- 十进制小数文本易读，但二进制浮点近似未必精确。
- Promise 回调和当前同步语句不在同一执行阶段。
