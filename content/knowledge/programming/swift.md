---
capabilityId: native:code-swift
title: Swift
topicGroup: programming
summary: 从 Optional、值语义和 Unicode 字符计数理解 Swift 控制台程序。
aliases:
  - Swift
  - Optional
  - Character
  - 值语义
sources:
  - id: basic
    title: The Basics
    publisher: Swift.org
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/thebasics/
    language: en
    kind: official-doc
    locator: 选项类型、常量、变量与空值
  - id: strings
    title: Strings and Characters
    publisher: Swift.org
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/stringsandcharacters/
    language: en
    kind: official-doc
    locator: 扩展字素簇与字符串视图
  - id: collections
    title: Collection Types
    publisher: Swift.org
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/collectiontypes/
    language: en
    kind: official-doc
    locator: 数组值语义及变更
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: Swift 命令行与 Linux 标准环境
---

## 介绍
<!-- sources: basic, local -->

Swift 使用静态类型描述数据，也以 Optional 明确表达可能不存在的值。命令行程序可从顶层语句执行，通过 readLine 等标准接口读取文本。桌面和移动图形框架由具体平台提供。

## Optional 与备用值
<!-- sources: basic -->

Optional 可以保存一个具体值或 nil。若尝试解析的文本不符合整数形式，某些构造函数会返回 Optional.none。空值合并运算符用右值补上缺失的结果。

:::example 解析失败的备用值
[输入]
print(Int("oops") ?? 7)
[结果]
7
[说明]
字符串 oops 未表示整数，Int 构造失败得到 nil。
:::

## 字符与存储单位
<!-- sources: strings -->

Swift 的 Character 可代表扩展字素簇。String 的 count 统计 Character，utf8.count 统计 UTF-8 字节。在组合附加符号存在的情况下，这两个单位可能有显著差异。

:::example 字母和组合重音
[输入]
一个字符串由 e 和组合重音 U+0301 构成。
[结果]
Character 计数为 1，UTF-8 字节数为 3。
[说明]
e 用一字节，组合重音用两字节。两者形成一个扩展字素簇。
:::

## 数组复制后的修改
<!-- sources: collections -->

标准 Array 是值类型，赋值副本应表现为独立值。实现可以共享底层存储直到写入发生，但这种优化不改变可观察的数组值语义。

:::example 副本独立增项
[输入]
let a = [1,2]; var b = a; b.append(3)
[结果]
a 仍为 [1,2]，b 为 [1,2,3]。
[说明]
修改 b 不会改变 a 中的元素数。
:::

## 平台特性
<!-- sources: basic, local -->

跨平台的简单算法、字符串和集合操作可用标准库核对。涉及特定操作系统模块时，需要另外确认平台。显示字符的宽度也取决于渲染环境，不能用 UTF-8 字节数直接代替。

## 常见误区

- Optional 有值和没有值是两种状态，强制解包失败可终止执行。
- String.count 不直接给出 UTF-8 字节数。
- 两个数组初始值相等并不意味着修改一个会改变另一个。
