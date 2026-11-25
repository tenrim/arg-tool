---
capabilityId: native:code-kotlin
title: Kotlin
topicGroup: programming
summary: 说明 Kotlin 的值绑定、空安全和集合操作，核对短 JVM 程序的执行。
aliases:
  - Kotlin JVM
  - Elvis 运算符
  - 空安全
sources:
  - id: basic
    title: Basic syntax
    publisher: JetBrains
    url: https://kotlinlang.org/docs/basic-syntax.html
    language: en
    kind: official-doc
    locator: 入口、变量、集合与表达式
  - id: nulls
    title: Null safety
    publisher: JetBrains
    url: https://kotlinlang.org/docs/null-safety.html
    language: en
    kind: official-doc
    locator: 可空引用、安全调用和 Elvis
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: Kotlin JVM 与标准入口
---

## 介绍
<!-- sources: basic, local -->

Kotlin 可以将程序编译到 JVM 执行。控制台源码可提供顶层 main 函数。常见类型区分可空和非空，值绑定是否能重新赋值也在源程序中明确标明。

## 空值与安全调用
<!-- sources: nulls -->

允许 null 的类型在类型名后加问号。安全调用遇到 null 时不访问成员，把结果也设为空。随后可用 ?: 选择默认值。空字符串和 null 有不同含义。

:::example 无文本时提供备用长度
[输入]
val s: String? = null，计算 s?.length ?: 5。
[结果]
5。
[说明]
安全访问得 null，随后使用默认值。
:::

## val 与对象内部状态
<!-- sources: basic -->

val 使变量绑定不能重新指向别的对象。如果绑定的是一个允许修改的集合，集合项仍可更新。var 用于变量本身需要重新绑定的情况。

:::example 修改已绑定对象
[输入]
val items = mutableListOf(1,2)；执行 items.add(3)。
[结果]
items 仍指向该列表，内容为 1、2、3。
[说明]
修改的是列表内部，不是给 items 重新赋值。
:::

## 集合变换
<!-- sources: basic -->

filter 依条件保留项，map 对每个留下的值执行变换。读取两者串联的程序时，先列出过滤结果，再顺序应用映射。

:::example 筛选后平方
[输入]
listOf(1,2,3,4).filter { it % 2 == 0 }.map { it * it }
[结果]
[4, 16]
[说明]
通过过滤的是 2 和 4。
:::

## 程序输入
<!-- sources: basic, nulls, local -->

控制台输入通常来自标准输入，不是程序参数列表。已读取的行需要按对象语义解析。涉及输入结束时，应使用能表达缺失值的读取方式，并处理可空返回。

## 常见误区

- 空字符串有长度零，null 表示没有字符串。
- val 约束绑定，不保证引用的集合不能修改。
- filter 决定保留哪些元素，map 决定如何计算新元素。
