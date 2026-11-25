---
capabilityId: native:code-go
title: Go
topicGroup: programming
summary: 理解 Go 的入口包、字符串字节与 rune、切片和按行扫描。
aliases:
  - Golang
  - rune
  - 切片
  - bufio Scanner
sources:
  - id: spec
    title: The Go Programming Language Specification
    publisher: Go authors
    url: https://go.dev/ref/spec
    language: en
    kind: official-doc
    locator: 程序执行、字符串与切片
  - id: bufio
    title: Package bufio
    publisher: Go authors
    url: https://pkg.go.dev/bufio
    language: en
    kind: official-doc
    locator: Scanner、ScanLines
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: Go 单文件入口及标准库
---

## 介绍
<!-- sources: spec, local -->

Go 可执行程序从 main 包的 main 函数进入。基础类型、切片和显式错误返回值适合表述短文本与数值处理。读取、解析和输出可由标准库直接完成。

## 字节数与字符值
<!-- sources: spec -->

Go 的 string 是不可变字节序列，len 对字符串报告字节数。按 range 遍历时会解码 UTF-8，得到 rune 及其起始字节位置。含非 ASCII 字符的文本可借这两个结果区分字节与 Unicode 代码点。

:::example 一段混合文本
[输入]
字符串 "éA"，其中 é 是单个 U+00E9。
[结果]
len 为 3，range 遍历 2 项，起始字节位置是 0 和 2。
[说明]
预组 é 用两字节，A 用一字节。
:::

## 切片是数组的一段视图
<!-- sources: spec -->

切片保存底层数组中一段区间的视图。创建普通子切片不会复制其中的值，给仍共享底层存储的位置赋值也能在原切片中观察到。扩容时，有些操作会改为引用新数组。

:::example 共享元素
[输入]
a := []int{1,2,3}; b := a[1:3]; b[0]=9。
[结果]
a 变为 [1,9,3]，b 为 [9,3]。
[说明]
b 的第 0 项对应 a 的第 1 项。
:::

## 缓冲扫描
<!-- sources: bufio, local -->

bufio.Scanner 默认按行分词，扫描成功后 Text 返回当前文本，不包含行终止符。Scan 为假可能是输入结束或发生读取错误；可另外检查 Err。

:::example 保持一个行内空格
[输入]
Scanner 从标准输入读取一行 red blue。
[结果]
Text 返回 red blue。
[说明]
ScanLines 不是按空格分词，行内空格保留。
:::

## 源码和标准包
<!-- sources: spec, local -->

单文件程序使用标准库时，可按 import 声明查阅具体包行为。变量类型、未使用的声明或缺少依赖引起的错误通常出现在编译阶段，输入解析错误则要按程序运行时的条件处理。

## 常见误区

- Go 的 len 对字符串给出字节数。
- 两段切片可能共享同一底层数组。
- Scanner.Scan 返回 false 后应按需要检查 Err，而非直接认定输入正常结束。
