---
capabilityId: native:code-rust
title: Rust
topicGroup: programming
summary: 以所有权与借用、UTF-8 字符串、Result 和标准输入解释 Rust 短程序。
aliases:
  - Rust 2021
  - 借用
  - Result
  - UTF-8
sources:
  - id: book
    title: The Rust Programming Language
    publisher: Rust Project
    url: https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html
    language: en
    kind: official-doc
    locator: 所有权、共享引用与可变引用
  - id: string
    title: Rust String standard library
    publisher: Rust Project
    url: https://doc.rust-lang.org/std/string/struct.String.html
    language: en
    kind: official-doc
    locator: UTF-8、len 与 chars
  - id: io
    title: Rust Stdin standard library
    publisher: Rust Project
    url: https://doc.rust-lang.org/std/io/struct.Stdin.html
    language: en
    kind: official-doc
    locator: read_line 的追加、返回字节数及 EOF
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: Rust 2021 edition 与标准库
---

## 介绍
<!-- sources: book, local -->

Rust 在编译时检查所有权和借用关系。控制台程序从 main 开始，通过标准库处理文本、数值和读写错误。变量能否继续访问数据取决于值传递还是引用传递。

## 移动和共享借用
<!-- sources: book -->

把 String 按值交给另一个所有者通常会移动其管理权。使用共享引用时，函数可以读取内容而不接管它。在共享借用期间，不能通过并存的可变借用改写同一数据。

:::example 读取后仍可使用原串
[输入]
let s = String::from("ARG"); let r = &s; println!("{} {}", r.len(), s);
[结果]
3 ARG
[说明]
r 只借用数据，原值 s 仍然拥有字符串。
:::

## UTF-8 字节和代码点
<!-- sources: string -->

Rust String 保证有效 UTF-8。len 返回字节数，chars 迭代 Unicode 标量值。代码点序列也不总等于屏幕上看到的用户感知字符数，尤其是结合符号或多代码点表情。

:::example 非 ASCII 的字节计数
[输入]
令 s 为 "éA"，分别取 s.len() 和 s.chars().count()。
[结果]
3 与 2。
[说明]
预组 é 使用两字节，A 使用一字节。
:::

## 每次读行可追加
<!-- sources: io, string -->

read_line 把读取内容追加到传给它的可变 String，通常保留读到的行尾分隔，并返回 Result。若连续读取且希望只获得下一行，应先清空已有字符串或用新缓冲区。

:::example 在缓冲区尾部加一行
[输入]
缓冲区已含 A，读入 ASCII B 加 LF 到同一个 String。
[结果]
缓冲区为 A、B、LF，读取字节数为 2。
[说明]
read_line 不会清空最初的 A，返回数只计算此次新增的字节。
:::

## 错误处理
<!-- sources: book, io, local -->

Result 会区分成功与错误。unwrap 适合能明确保证成功的短演算；面向不确定输入时可处理错误分支或传播错误。编译接受了可变性和借用关系后，也仍须处理实际输入的内容。

## 常见误区

- &s 给出共享借用，不会复制整个 String。
- 字符串的 len 返回字节数。
- 连续 read_line 到同一缓冲区会追加，不能默认替换旧内容。
