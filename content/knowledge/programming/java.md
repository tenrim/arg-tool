---
capabilityId: native:code-java
title: Java
topicGroup: programming
summary: 从 Java 的编译入口、整数规则和字符串比较读出短控制台程序的结果。
aliases:
  - JVM
  - javac
  - Java 控制台
sources:
  - id: spec
    title: Java Language Specification, Java SE 21
    publisher: Oracle
    url: https://docs.oracle.com/javase/specs/jls/se21/html/index.html
    language: en
    kind: official-doc
    locator: 第 4、12、15 章，类型、运行入口及表达式
  - id: start
    title: Getting Started with Java
    publisher: OpenJDK Community
    url: https://dev.java/learn/getting-started/
    language: en
    kind: official-doc
    locator: 编译、main 入口和执行
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: 运行类名 Main 与标准输入输出
---

## 介绍
<!-- sources: spec, start, local -->

Java 控制台程序通常先由 javac 编译，再交给 JVM。常见入口是类中的 public static void main(String[] args)。编译前的类型规则和执行时的类库行为共同决定程序输出。

## 整数运算规则
<!-- sources: spec -->

Java 的 int 是固定 32 位有符号整数。普通整数加法的溢出结果按模 2³² 读取低位。若需要检测溢出，可将结果提升到 long 或使用标准库的检查算术。

:::example 32 位上界
[输入]
int n = Integer.MAX_VALUE; 输出 n+1。
[结果]
-2147483648
[说明]
Int32 最高正数加一，得到符号位为 1、其余位为 0 的结果。
:::

## 字符串值与对象身份
<!-- sources: spec -->

对象引用之间的 == 比较身份。字符串的 equals 比较内容。有些相同字面量共享同一对象，若只用这些常量验证，会掩盖引用值与文本值的区别。

:::example 两个相同内容的字符串对象
[输入]
String a = new String("ARG"); String b = new String("ARG"); 输出 a==b 与 a.equals(b)。
[结果]
false 和 true。
[说明]
两个独立构造出的字符串对象含相同字符。
:::

## 程序读取和打印
<!-- sources: start, local -->

程序可从 System.in 读取字节流，通过 Scanner 等标准库把输入解释为文本或数字。System.out 用于正常输出，System.err 用于独立诊断。

:::example 两个整数
[输入]
用 Scanner 从 System.in 调用 nextInt 两次，程序输入 19 23，随后用 System.out.println 打印和。
[结果]
42
[说明]
两个空白分隔的输入被直接解析为整数，求和得到 42。
:::

## 编译与运行阶段
<!-- sources: spec, start, local -->

入口类名、源文件名和包组织会决定启动方式。找不到入口类和程序执行中抛出异常是不同阶段。此类单文件例子可在约定的 Main 入口下复查逻辑。

## 常见误区

- Java 的 int 并非任意精度。
- 对 Java 字符串使用 ==，只能判断是否为同一引用。
- 通过编译并不表示所有运行时输入都能被正确解析。
