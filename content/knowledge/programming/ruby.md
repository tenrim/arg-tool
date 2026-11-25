---
capabilityId: native:code-ruby
title: Ruby
topicGroup: programming
summary: 理解 Ruby 的 block、可枚举操作和按行读写，从程序结果回查每步变化。
aliases:
  - Ruby
  - Enumerable
  - block
  - chomp
sources:
  - id: enum
    title: Ruby Enumerable
    publisher: Ruby
    url: https://docs.ruby-lang.org/en/3.3/Enumerable.html
    language: en
    kind: official-doc
    locator: map、select、tally
  - id: io
    title: Ruby IO
    publisher: Ruby
    url: https://docs.ruby-lang.org/en/3.3/IO.html
    language: en
    kind: official-doc
    locator: gets、puts 与行分隔符
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: Ruby 命令行和标准输入
---

## 介绍
<!-- sources: enum, local -->

Ruby 是动态类型语言，许多集合操作以 block 接收每一项的处理规则。可枚举对象可以逐个产生元素，map 转换各项，select 留下满足条件的项。控制台对象可从标准输入读取一行文本。

## 映射集合
<!-- sources: enum -->

map 将每次 block 的返回值组成新序列。读链式调用时，可先列出每个输入进入 block 的次序，再把每次结果按顺序写出。普通 map 不会就地替换原数组。

:::example 每个值放大三倍
[输入]
[2, 4, 6].map { |x| x * 3 }
[结果]
[6, 12, 18]
[说明]
每次 block 接收一项，映射后的个数与原项相同。
:::

## 统计出现次数
<!-- sources: enum -->

tally 为不同元素计数，返回元素到数量的 Hash。数组可以包含重复元素，统计保留其重复出现带来的计数。若只需要保留某类元素，可以先用 select。

:::example 重复的符号
[输入]
["p", "q", "p"].tally
[结果]
p 对应 2，q 对应 1。
[说明]
两次出现的 p 汇入同一个键。
:::

## 行读取和去行尾
<!-- sources: io, local -->

通过 STDIN.gets 可读取包含行终止符的一行，输入结束时返回 nil。可用 chomp 从已读字符串移除行分隔符。行内空格以及其它需要保留的内容应按任务要求处理。

:::example 输入中有空格
[输入]
标准输入为 red blue 加 LF，读取 STDIN.gets.chomp。
[结果]
得到字符串 red blue。
[说明]
末尾 LF 被 chomp 移除，中间的空格保持。
:::

## 输出文本与结构
<!-- sources: io, enum, local -->

puts 适合把字符串以行输出，调试集合时也可看对象的表示再解释元素顺序。输出显示方式可以改变可见内容，却不会把查询或统计方法的返回类型变成别的类型。

## 常见误区

- map 与 select 的返回项数规则不同。
- 读到空行与文件终结时返回 nil 是两种状态。
- chomp 的目标是行尾，不会删除所有行内空白。
