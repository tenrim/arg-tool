---
capabilityId: native:code-python
title: Python 3.13
topicGroup: programming
summary: 说明对象、数值和标准输入如何参与 Python 程序，复算数值运算与序列。
aliases:
  - Python
  - Pyodide
  - Python 标准输入
sources:
  - id: builtin
    title: Python 3.13 Built-in Functions
    publisher: Python Software Foundation
    url: https://docs.python.org/3.13/library/functions.html
    language: en
    kind: official-doc
    locator: input、print、int、range
  - id: lang
    title: Python 3.13 Expressions
    publisher: Python Software Foundation
    url: https://docs.python.org/3.13/reference/expressions.html
    language: en
    kind: official-doc
    locator: 算术运算符、列表推导式
  - id: engine
    title: Pyodide Getting started
    publisher: Pyodide
    url: https://pyodide.org/en/stable/usage/quickstart.html
    language: en
    kind: official-doc
    locator: Python 与浏览器运行环境
  - id: local
    title: 代码执行 Worker
    publisher: 迷雾工具箱
    url: /coderunner/worker.js
    language: zh-CN
    kind: implementation
    locator: executePython 的标准输入、标准输出与错误流
---

## 介绍
<!-- sources: lang, engine -->

Python 程序由语句和表达式组成，值各有自己的类型。浏览器中的 Pyodide 启用 Python 解释器，普通算术、集合和内置函数遵循语言定义。程序从指定入口读入待处理内容，并通过标准输出打印结果。

## 文本和整数
<!-- sources: builtin, lang -->

input 会读取一整行并返回字符串，通常去掉行尾换行。即使文本内容看起来全是数字，它的类型仍是字符串。加号对两个字符串执行拼接，对整数执行加法，转换可用 int。

:::example 同一个字面内容的两种运算
[输入]
print("10" + "2", int("10")+2)
[结果]
102 12
[说明]
前一项拼接两段文本，后一项先将 10 转为整数后相加。
:::

## 三种除法相关运算
<!-- sources: lang -->

斜杠 / 表示除法，双斜杠 // 取向下的商，百分号 % 得到与该商一致的余数。对整数 a 和非零 b，关系为 a=(a//b)×b+a%b。这套定义对负数也保持向下取整。

:::example 正整数的商、余数和真除法
[输入]
print(7//2,7%2,7/2)
[结果]
3 1 3.5
[说明]
7=3×2+1。单斜杠的结果为 3.5。
:::

## 序列与表达式
<!-- sources: builtin, lang, local -->

range 的停止参数不纳入遍历。列表推导式从可迭代对象取得元素，并依次求值生成列表。调试时可对照每个输入元素和每个结果元素。

:::example 读取一行并生成平方
[输入]
代码为两行，依次是 print(input()) 和 print([n*n for n in range(1,4)])。标准输入是 clue。
[结果]
clue
[1, 4, 9]
[说明]
range 遍历 1、2、3，分别求其平方。
:::

## 语言标准与运行环境
<!-- sources: engine, local -->

内置函数和语言表达式可用规范核对。浏览器中的运行环境、库与主机可用功能取决于实际构建。对读取本地路径或启动桌面组件的桌面程序，需另查所依赖的环境，普通标准输入计算不需要这些外部条件。

## 常见误区

- input 返回字符串，不能从视觉上像数字就推定类型。
- // 对负值向下取整，不能统一按截去小数解释。
- range(a,b) 的 b 是截止边界，不参加结果。
