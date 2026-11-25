---
capabilityId: native:code-bash
title: Bash
topicGroup: programming
summary: 说明 Bash 的引用、标准输入和退出状态，复算不访问外部资源的短命令。
aliases:
  - Bash 脚本
  - 引用
  - 标准输入
  - 退出状态
sources:
  - id: manual
    title: Bash Reference Manual
    publisher: GNU
    url: https://www.gnu.org/software/bash/manual/bash.html
    language: en
    kind: official-doc
    locator: Quoting、Shell Expansions、Bash Builtins 与 Exit Status
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: Bash 命令行执行与标准流
---

## 介绍
<!-- sources: manual, local -->

Bash 解释命令、变量和控制运算符。每条命令可以写入标准输出与标准错误，并返回退出状态。脚本中的引号决定展开后的文本如何作为参数交给命令。

## 双引号和字段边界
<!-- sources: manual -->

变量展开在双引号内保持一个参数。未加引号的展开还可能经过字段拆分和文件名展开。需要保持输入文本整体时，可以用双引号包住变量。

:::example 带空格的一个参数
[输入]
v="red blue"，执行 printf '[%s]' "$v"。
[结果]
[red blue]
[说明]
printf 收到一个字符串值用于替换。
:::

## 按行保留字符
<!-- sources: manual, local -->

read 可从标准输入读一行。设置 IFS 为空时不按默认空白拆分，使用 -r 保留反斜杠的普通含义。这对路径样例或待分析文本的原样读取有用。

:::example 反斜杠作为普通字符
[输入]
一行原始字符 a、反斜杠、b，交给 IFS= read -r line。
[结果]
line 保留三字符 a、反斜杠、b。
[说明]
-r 不将反斜杠用作转义标识。
:::

## 退出码的作用
<!-- sources: manual -->

Bash 使用命令状态决定 if 与条件连接表达式的方向。约定 0 表示成功，非零表示失败或其它特定结果。输出字符串与成功状态彼此独立。

:::example 根据非零退出分支
[输入]
if false; then printf yes; else printf no; fi
[结果]
no
[说明]
false 给出非零状态，执行 else 内的命令。
:::

## 脚本与操作系统
<!-- sources: manual, local -->

Bash 的内置功能可按手册复现，外部命令依赖实际环境。相同语句在不同的文件集合和本地设置下可能有不同结果，写短算例时应注明输入和依赖。

## 常见误区

- 命令打印出内容不表示退出状态为零。
- 双引号仍允许变量展开，但会限制字段拆分。
- 字面量中的反斜杠是否被保留依赖引用和读取方式。
