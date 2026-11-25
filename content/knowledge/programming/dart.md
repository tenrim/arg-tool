---
capabilityId: native:code-dart
title: Dart
topicGroup: programming
summary: 理解 Dart 的空安全、整数除法和命令行读取，将核心语义与 Flutter 环境区分。
aliases:
  - Dart CLI
  - ~/
  - Dart Null Safety
sources:
  - id: ops
    title: Dart Operators
    publisher: Dart Project
    url: https://dart.dev/language/operators
    language: en
    kind: official-doc
    locator: 算术与空值合并
  - id: vars
    title: Dart Variables
    publisher: Dart Project
    url: https://dart.dev/language/variables
    language: en
    kind: official-doc
    locator: final、const 与可空类型
  - id: read
    title: Stdin.readLineSync
    publisher: Dart Project
    url: https://api.dart.dev/dart-io/Stdin/readLineSync.html
    language: en
    kind: official-doc
    locator: 行尾、编码和 EOF
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: Dart 命令行与 dart:io
---

## 介绍
<!-- sources: vars, local -->

Dart 控制台程序以 main 为入口。可空性属于类型信息，常量和只能赋值一次的绑定也有独立语义。用 dart:io 可以读取标准输入，这类小程序不依赖图形框架。

## 普通除法和截断除法
<!-- sources: ops -->

斜杠 / 计算浮点商，~/ 的结果向零取整。负数尤其能区分向零截断和向下取整。选用整数结果时，应根据题目需要选择合适的取整方式。

:::example 负数的整数商
[输入]
-7 / 2 与 -7 ~/ 2。
[结果]
-3.5 与 -3。
[说明]
后者舍去负商的小数部分，趋向零。
:::

## final 与容器对象
<!-- sources: vars -->

final 变量只能赋值一次。若它指向可增长列表，调用 add 可以改变列表内容。const 则要求常量表达式，其生成的常量容器不能按这种方式修改。

:::example 变更可修改列表
[输入]
final xs = [1,2]; xs.add(3); print(xs);
[结果]
[1, 2, 3]
[说明]
xs 的绑定未被替换，只增加了列表元素。
:::

## 行读取与空行
<!-- sources: read, ops -->

stdin.readLineSync 的返回类型可空。正常读到一行，默认丢掉行分隔符。读到空行得到空字符串，流已结束且未读到数据时返回 null。可用空值合并处理真正缺失的行。

:::example 两次调用的不同值
[输入]
标准输入只有一个 LF，连续调用两次 readLineSync()。
[结果]
先得到空字符串，再得到 null。
[说明]
第一回读到内容为空的一行，第二回到达文件结束。
:::

## 平台接口与文本编码
<!-- sources: read, local -->

readLineSync 使用所配置的字符编码解释原始输入字节。为了复现含非 ASCII 文本的程序，可以明确数据的编码。调用界面框架特有的函数需要另一个运行条件，与 Dart 的语言语义分开。

## 常见误区

- 整数除法 ~/ 对负数向零截断，不是向负无穷取整。
- final 并不让绑定的所有对象内容变成常量。
- 空行与没有可以再读的行有不同返回值。
