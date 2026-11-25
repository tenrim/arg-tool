---
capabilityId: native:code-csharp
title: C#
topicGroup: programming
summary: 说明 C# 控制台程序的常用数值类型、输入行与可变或缺失结果。
aliases:
  - CSharp
  - .NET 8
  - Console
sources:
  - id: lang
    title: C# arithmetic operators
    publisher: Microsoft
    url: https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/arithmetic-operators
    language: en
    kind: official-doc
    locator: 整数与浮点运算
  - id: read
    title: Console.ReadLine Method
    publisher: Microsoft
    url: https://learn.microsoft.com/en-us/dotnet/api/system.console.readline?view=net-8.0
    language: en
    kind: official-doc
    locator: 返回当前行及 EOF
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: C# 在 .NET 8 中编译并运行
---

## 介绍
<!-- sources: lang, local -->

C# 控制台程序可定义 Main，也能用顶级语句组织短程序。编译把源程序转换为 .NET 运行环境执行的程序集。标准输入和输出通过 Console 访问，类型检查在编译阶段识别一部分误用。

## 两种除法读法
<!-- sources: lang -->

对两个整数做除法，结果仍采用整数商并向零截断。若包含 double 等浮点值，先将运算数提升到相应类型。转换的位置决定有没有先发生整数截断。

:::example 在除法前提升类型
[输入]
分别计算 7/2 和 7/2.0。
[结果]
第一个结果为 3，第二个为 3.5。
[说明]
第一个表达式的两侧都是整数，第二个包含 double。
:::

## 标准输入行
<!-- sources: read, local -->

Console.ReadLine 消耗一行输入而不包含行终止符。输入流读完时返回 null，空行则是长度为零的字符串。处理多行前，可用这一区别判断是否还应继续读取。

:::example 空行与结束
[输入]
输入只有一行换行，连续调用两次 Console.ReadLine。
[结果]
第一次得空串，第二次得 null。
[说明]
第一次仍读到一条有效但为空的行，之后才到流的末尾。
:::

## 无符号和检查环境
<!-- sources: lang -->

整型有有限取值范围。用 checked 执行需要检查的整型运算时，越界可触发 OverflowException。unchecked 环境下的某些运行时整型运算保留低位，从而出现回绕。

:::example 检查加法边界
[输入]
int n = int.MaxValue; 计算 checked(n + 1)。
[结果]
发生 OverflowException。
[说明]
2147483647 再加一超过 Int32 的可表示上界。
:::

## 控制台与框架
<!-- sources: read, local -->

程序可以用标准库读写数据。它运行的是控制台入口，第三方包和桌面 UI 需要另外的项目条件。检查失败时应分别读取编译诊断、运行期异常和已经打印的输出。

## 常见误区

- Console.ReadLine 返回文本，读取数字还要解析。
- 空行与读不到下一行对应不同值。
- 变量用 double 接收结果，不保证右侧计算已采用浮点数。
