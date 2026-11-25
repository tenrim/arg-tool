---
capabilityId: native:code-c
title: C
topicGroup: programming
summary: 理解 C 的数组、字符串终止符和整数运算，核对有界标准输入。
aliases:
  - C17
  - stdio
  - fgets
sources:
  - id: spec
    title: C Committee Draft N1570
    publisher: ISO WG14
    url: https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf
    language: en
    kind: official-doc
    locator: 5.1.2.2、6.5.5 和 7.21.7.2 中沿用的核心规则
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: C17 与标准流
---

## 介绍
<!-- sources: spec, local -->

C 控制台程序从 main 开始。有限数组、显式类型和库函数共同决定标准输入如何进入内存。数值计算与字节处理在题目里经常交叉出现，需要知道表达式的类型以及缓冲区剩余空间。

## 整数除法
<!-- sources: spec -->

两个整数相除时，商的分数部分被舍去，向零截断。余数满足 (a/b)×b+a%b=a。若两个表达式要使用小数，需要在除法进行之前改变相应操作数的类型。

:::example 负整数的商和余数
[输入]
-7 / 3 与 -7 % 3。
[结果]
-2 与 -1。
[说明]
(-2)×3+(-1)=-7。
:::

## 字符串与数组容量
<!-- sources: spec -->

C 的窄字符串用一个值为零的字节结束。字符数组的容量必须同时容纳内容和这个结束字节。文本的字节数还依赖编码，例如 UTF-8 中一些字符占几个字节。

:::example 字符串字面量的数组长度
[输入]
char s[] = "ARG"; 求 sizeof s。
[结果]
4。
[说明]
三个字符后还存有一个零终止字节。
:::

## 有界读取
<!-- sources: spec, local -->

fgets 对容量为 n 的字符区域最多读取 n−1 字节，并在成功读取后加入零终止符。若在这之前读到换行，换行可以保留在数组中。用返回值判断读取是否成功。

:::example 显式的缓冲区边界
[输入]
char s[4]，用 fgets(s, sizeof s, stdin) 从 abcdef 开始读。
[结果]
s 含 a、b、c、零字节，剩余内容留在输入流。
[说明]
四个可写字节中有一个留给结束标记。
:::

## 编译与输出
<!-- sources: spec, local -->

编译期诊断定位类型、声明和翻译问题，标准输出来自已经执行的程序。printf 的转换说明应与实际实参类型对应。在程序示例里将输出的数字、字节和换行分开记录，可以核对结果是否按预期生成。

## 常见误区

- 两个整数相除即使保存到 double，截断仍可能先发生。
- 字符数组的全部容量不能都用作普通文本内容。
- fgets 成功读到的行可能保留换行。
