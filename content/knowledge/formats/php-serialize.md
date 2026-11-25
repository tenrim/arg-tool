---
capabilityId: pair:PHP%20Serialize
title: PHP 序列化
topicGroup: formats
summary: 辨认 PHP 序列化中的类型、字符串长度和关联数组，了解与 JSON 的转接边界。
aliases:
  - PHP serialize
  - PHP 反序列化
sources:
  - id: php
    title: PHP Manual：serialize
    publisher: PHP Documentation Group
    url: https://www.php.net/manual/en/function.serialize.php
    language: en
    kind: official-doc
    locator: 二进制字节串、类型及保存边界
  - id: array
    title: PHP Manual：Arrays
    publisher: PHP Documentation Group
    url: https://www.php.net/manual/en/language.types.array.php
    language: en
    kind: official-doc
    locator: 数组是带整数或字符串键的有序映射
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的处理规则和声明边界
---

## 介绍
<!-- sources: php, array -->

PHP 序列化为值生成可恢复的二进制表示。常见的标记有 i 表整数、d 表浮点数、b 表布尔值、s 表字符串、a 表数组，N 表 null。

## 类型和长度
<!-- sources: php, chef -->

整数、布尔值与字符串可以含相同的可见数字，却使用不同标签。字符串项携带声明长度。原生 PHP 字符串长度按字节，UTF-8 的一个字符可能占多个字节。

:::example 读取简单标量
[输入]
null
[结果]
N;
[说明]
标记 N 后直接用分号封住空值。
:::

## 键值对和次序
<!-- sources: array, chef -->

PHP 数组由一组键和值组成。无论输入在 JSON 中是对象还是列表，转换都需要给 PHP 元素提供键。反向输出可能保留整数键的映射样式，未必重建输入的 JSON 数组形状。

:::example 序列化三个列表项
[输入]
[5,"abc",true]
[结果]
a:3:{i:0;i:5;i:1;s:3:"abc";i:2;b:1;}
[说明]
三个键为 0、1、2，按顺序保存整数、字符串和布尔值。
:::

## 带非 ASCII 字符的兼容差异
<!-- sources: php, chef -->

一部分面向 JavaScript 文字的旧转换器用字符串长度读取或写入 s 字段。与原生 PHP 交换非 ASCII 数据时，必须按字节核对，不能只看页面是否显示正确字形。

:::example 同一 é 的两个长度
[输入]
把 JSON 字符串 "é" 转成序列化文字，并与 UTF-8 原生 PHP 格式比较
[结果]
当前转换结果 s:1:"é";；按 UTF-8 字节的 PHP 格式长度应为 2
[说明]
é 的 UTF-8 字节是 C3 A9。此入口也可能拒绝直接反查带 s:2 的对应文字。
:::

## 读取数据和运行 PHP
<!-- sources: array, php, chef -->

这个转换入口面向数据表示，未提供 PHP 对象标签的完整支持。不需要在服务器执行获得的序列化内容，读出结构即可核对数据。原程序对对象、资源等类型的行为另有规范。

## 常见误区

- a 后的数字代表键值对数。
- 原生 PHP 的字符串长度不能按 Unicode 字形数计算。
- 往返成对象样式的 JSON 不等于丢失全部数组元素。

