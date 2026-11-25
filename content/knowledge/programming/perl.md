---
capabilityId: native:code-perl
title: Perl
topicGroup: programming
summary: 从标量与列表上下文、文本切片和编码理解 Perl 的命令行处理。
aliases:
  - Perl
  - scalar context
  - split
  - chomp
sources:
  - id: data
    title: Perl data types
    publisher: Perl Project
    url: https://perldoc.perl.org/perldata
    language: en
    kind: official-doc
    locator: 标量、数组与上下文
  - id: split
    title: Perl split
    publisher: Perl Project
    url: https://perldoc.perl.org/functions/split
    language: en
    kind: official-doc
    locator: LIMIT 与空字段
  - id: chomp
    title: Perl chomp
    publisher: Perl Project
    url: https://perldoc.perl.org/functions/chomp
    language: en
    kind: official-doc
    locator: 输入记录结束符
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: Perl 的 UTF-8 与标准流
---

## 介绍
<!-- sources: data, local -->

Perl 的文本脚本经常处理按行或按字段输入。标量、数组和哈希具有不同的数据组织方式。某些表达式会根据需要显示为一个值还是一列值，返回不同形式的结果。

## 上下文与数组
<!-- sources: data -->

在列表上下文中读取数组会取得元素序列，在普通标量上下文中则可取得数组的元素数量。显式使用 scalar 有助于读者判断程序需要哪个结果。

:::example 取数量而非末项
[输入]
my @items = ("red","green","blue"); 求 scalar @items。
[结果]
3。
[说明]
所求是数组元素个数。
:::

## 按分隔符拆字段
<!-- sources: split -->

split 用模式拆分文本。省略 LIMIT 或使用 0 时通常丢弃尾端空字段。若末尾分隔符意味着仍有一个空字段，要选择保留尾端空值的 LIMIT。

:::example 两个连续逗号
[输入]
split /,/, "x,,", -1
[结果]
三个字段，依次是 x、空串、空串。
[说明]
负的 LIMIT 保留尾端空字段。
:::

## 输入记录结束符
<!-- sources: chomp, data -->

读取一行通常返回包含记录分隔符的字符串。chomp 删掉末尾匹配的记录分隔符。若要再进行索引或正则匹配，先确认换行是否参与这些位置计算。

:::example 保持尾端普通空格
[输入]
$text 含 x、一个空格和 LF。使用默认记录分隔符执行 chomp $text。
[结果]
$text 余下 x 和一个空格。
[说明]
chomp 消耗记录分隔符，但保留它之前的普通空格。
:::

## 文本编码和程序输入
<!-- sources: data, local -->

源程序里的字符串编码与标准流解码可以分别声明。当输入是 UTF-8，明确流编码可避免后续字符串操作把字符拆在字节中间。若要分析原始字节文件，则应按字节而不是已解码的文本读取。

## 常见误区

- 数组在标量上下文中的结果不是它的最后一个元素。
- split 的默认条件可能省去尾端空字段。
- chomp 只处理记录分隔符，不等于清理所有空白。
