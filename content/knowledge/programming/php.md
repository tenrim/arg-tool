---
capabilityId: native:code-php
title: PHP
topicGroup: programming
summary: 说明 PHP 命令行的字符串拼接、键值数组和标准流读取。
aliases:
  - PHP CLI
  - STDIN
  - PHP 数组
sources:
  - id: strings
    title: PHP String Operators
    publisher: PHP
    url: https://www.php.net/manual/en/language.operators.string.php
    language: en
    kind: official-doc
    locator: 串接运算符
  - id: arrays
    title: PHP Arrays
    publisher: PHP
    url: https://www.php.net/manual/en/language.types.array.php
    language: en
    kind: official-doc
    locator: 有序键值映射与追加整数键
  - id: io
    title: PHP fgets
    publisher: PHP
    url: https://www.php.net/manual/en/function.fgets.php
    language: en
    kind: official-doc
    locator: 行尾、读取边界和 false
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: PHP CLI 的入口和标准流
---

## 介绍
<!-- sources: strings, local -->

PHP 能在命令行直接运行文本处理或计算程序。源码通常以 PHP 开始标记进入代码区域。可用标准流接收输入、输出字符串，程序本身与 Web 请求的会话和请求参数是不同来源。

## 字符串拼接
<!-- sources: strings -->

点号用于把两个字符串连起来，加号执行加法。即使两个操作数写成可解析的数字文本，这两个运算仍分别执行连接和数值运算。

:::example 一组输入的两种运算
[输入]
对 "10" 和 "2" 分别使用点号与加号。
[结果]
文本 102 与数值 12。
[说明]
点号直接连字符，加号按数字值计算。
:::

## 有序键值数组
<!-- sources: arrays -->

PHP 数组可同时使用整数和字符串键，迭代默认保留其元素顺序。省略键的追加会选出适当的自动整数键，不能假定所有数组都从 0 开始连续编号。

:::example 有整数间隔的数组
[输入]
$a = [2 => "red", 5 => "blue"]; $a[] = "green";
[结果]
键依次为 2、5、6。
[说明]
显式最大整数键原是 5，接着追加到 6。
:::

## 读取一行
<!-- sources: io, local -->

fgets 给定输入流后读取到行尾、指定长度或结束标记。读到的换行可留在返回文本中。输入耗尽且没有新数据时返回 false，可用严格比较把它与内容不同的有效字符串分开。

:::example 空行与流结束
[输入]
输入只含一个 LF。连续两次调用 fgets(STDIN)。
[结果]
先得到一个换行字符，第二次得到 false。
[说明]
空行是一条真实的记录，读取边界区别于文件已结束。
:::

## 命令行输出
<!-- sources: strings, local -->

echo 可写字符串到标准输出，放入输出的行尾取决于表达式包含的内容。要保存原有空格或换行，应明确选择移除哪些字符，避免把有效空白和读取分隔符一起丢掉。

## 常见误区

- PHP 的字符串连接符为点号。
- PHP 数组可能同时有多种键形态及不连续索引。
- fgets 返回 false 要与空文本、字符 0 或换行记录分别处理。
