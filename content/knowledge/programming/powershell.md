---
capabilityId: native:code-powershell
title: PowerShell
topicGroup: programming
summary: 用对象管道、比较运算和标准流说明 PowerShell 控制台产物。
aliases:
  - pwsh
  - 对象管道
  - PowerShell 7
sources:
  - id: pipe
    title: about Pipelines
    publisher: Microsoft
    url: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_pipelines
    language: en
    kind: official-doc
    locator: 管道传递对象与枚举
  - id: compare
    title: about Comparison Operators
    publisher: Microsoft
    url: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_comparison_operators
    language: en
    kind: official-doc
    locator: 标量及集合比较
  - id: io
    title: Console.ReadLine Method
    publisher: Microsoft
    url: https://learn.microsoft.com/en-us/dotnet/api/system.console.readline
    language: en
    kind: official-doc
    locator: 从标准输入读行
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: PowerShell 7 命令行环境
---

## 介绍
<!-- sources: pipe, local -->

PowerShell 的管道可以传递对象，命令可使用对象的类型和属性继续筛选和变换。控制台显示只是对象处理后的呈现。写短脚本时可分别观察输入对象、管道输出和显示格式。

## 管道中的逐项处理
<!-- sources: pipe, compare -->

Where-Object 可用条件筛选输入。条件块中的当前对象可以通过 $_ 读取。后续命令看到的是通过筛选的对象，不一定是它们转换成的文本。

:::example 筛选偶数
[输入]
1..4 | Where-Object { $_ % 2 -eq 0 }
[结果]
依次输出 2 和 4。
[说明]
两个整数均通过余数为零的检查。
:::

## 比较标量和筛选集合
<!-- sources: compare -->

使用 -eq 比较时，左值是标量通常返回真假，左值为集合时则逐项筛选，返回所有符合项。需要计数时，应先明确结果是布尔值还是对象集合。

:::example 集合中的重复值
[输入]
@(1,2,2) -eq 2
[结果]
输出 2、2 两项。
[说明]
两个原始整数都匹配，结果不会合成一个 True。
:::

## 一行标准输入
<!-- sources: io, local -->

[Console]::ReadLine 可以读取程序的标准输入行，不把行分隔符附到返回值。读取完毕时返回空引用。输出时可再用 Write-Output 把文本放入正常输出。

:::example 保留中间空格
[输入]
$name = [Console]::ReadLine()，程序输入 red blue。
[结果]
$name 是 red blue。
[说明]
正常的整行读取保留两个词之间的空格。
:::

## 操作系统和输出边界
<!-- sources: pipe, local -->

PowerShell 7 可运行在不同操作系统上，某些命令、设备和模块由平台决定。使用纯表达式与管道时，查看对象成员比依赖打印后的列宽更可靠；需要固定文本时可再选择输出格式。

## 常见误区

- PowerShell 管道传递一般对象，输出看起来是一行文字不等于没有属性。
- 左侧为集合时，某些比较操作返回匹配元素。
- 标准输入包含空行时，仍可读出一条有效但为空的字符串行。
