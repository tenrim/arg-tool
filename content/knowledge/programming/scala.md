---
capabilityId: native:code-scala
title: Scala
topicGroup: programming
summary: 用 Scala 2.13 的集合操作、Option 和不可变函数入门，检查输出结果。
aliases:
  - Scala 2.13
  - Option
  - 不可变集合
sources:
  - id: collections
    title: Scala 2.13 Collections Introduction
    publisher: Scala Project
    url: https://docs.scala-lang.org/overviews/collections-2.13/introduction.html
    language: en
    kind: official-doc
    locator: 集合变换与持久不可变集合
  - id: option
    title: Scala 2.13 Option API
    publisher: Scala Project
    url: https://www.scala-lang.org/api/2.13.16/scala/Option.html
    language: en
    kind: official-doc
    locator: Some、None、map、getOrElse
  - id: main
    title: Hello World
    publisher: Scala Project
    url: https://docs.scala-lang.org/overviews/scala-book/hello-world-1.html
    language: en
    kind: official-doc
    locator: Scala 2 控制台入口示例
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: Scala 2.13 JVM 编译与启动
---

## 介绍
<!-- sources: main, local -->

Scala 结合对象与函数式编程。控制台短程序可声明一个使用 main 入口的对象。集合处理常通过一串返回新值的操作完成，读取时可以逐步列出每个中间集合。

## 不可变列表
<!-- sources: collections -->

不可变集合追加元素后得到新的集合值。之前的变量仍指向原来的数据意义，即使运行库在内部重用部分存储。保持旧引用可便于核对每次变换。

:::example 追加一项保留原值
[输入]
val a = List(1,2); val b = a :+ 3。
[结果]
a 为 List(1, 2)，b 为 List(1, 2, 3)。
[说明]
:+ 给出包含新末项的列表。
:::

## 映射与筛选次序
<!-- sources: collections -->

map 将每项变换成新项，filter 按条件保留若干项。链式程序的运算顺序从左到右，先变换与先筛选可以有不同结果。

:::example 过滤后加十
[输入]
List(1,2,3).filter(_ % 2 == 1).map(_ + 10)
[结果]
List(11, 13)
[说明]
1 和 3 通过过滤，结果分别加十。
:::

## Option 的两种形态
<!-- sources: option -->

Option 以 Some 表示有值、None 表示缺值。map 在 Some 上调用变换，在 None 上保留缺失。getOrElse 允许在缺值时选择备用结果。

:::example 分别处理存在和缺失
[输入]
计算 Some(3).map(_ * 2).getOrElse(9)，以及 Option.empty[Int].map(_ * 2).getOrElse(9)。
[结果]
6 和 9。
[说明]
有值的分支执行乘二，缺值的分支使用默认值。
:::

## 语言版本与运行
<!-- sources: main, local -->

Scala 2.13 与 Scala 3 的入口写法和部分语法不同，按编译器版本读资料可避免混用。标准集合表达式也要根据实际导入的可变或不可变集合判断是否改变原值。

## 常见误区

- val 只限制重新绑定，不能独立说明对象是否可变。
- Option 中的 None 不是包裹着数值 0。
- 先 map 后 filter 与先 filter 后 map 未必等价。
