---
capabilityId: op:Take%20bytes
title: 提取字节
topicGroup: files
summary: 选取给定偏移和长度的连续字节区间，说明倒数、负长度和换行边界。
aliases:
  - Take bytes
  - 连续提取
  - 字节区间
sources:
  - id: slice
    title: ECMA-262 ArrayBuffer.prototype.slice
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/structured-data.html#sec-arraybuffer.prototype.slice
    language: en
    kind: standard
    locator: 从起点复制到不含末端的区间及负索引解释
  - id: utf8
    title: RFC 3629 UTF-8
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc3629.txt
    language: en
    kind: standard
    locator: 第 3 节，一到四字节及各字节的排列
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Take bytes：Slice、倒数与逐行处理
---

## 介绍
<!-- sources: slice, engine -->
提取字节只复制输入的某个连续区间。文件头、消息负载或定宽记录可以按同一方法单独取出一段。起始位置和长度以字节计算，输出的位置从头重新开始。

## 连续区间和倒数
<!-- sources: slice, engine -->
从左到右的偏移为 0、1、2……。长度为正时包含起点而不含终点，超过末端会在输入末尾停止。负起点按输入长度从末端换算。长度为负且范围在输入内时取起点前面的字节，终点仍不包含在结果中。

## 行边界和文本编码
<!-- sources: utf8, engine -->
逐行时识别 LF（0A）并对每行重新计算偏移，结果之间重新加回 LF。若行尾是 CRLF，CR（0D）属于计算范围。UTF-8 字节可能切在一个字符内部，查看结果时宜读取十六进制。

## 坐标可复算的例子
<!-- sources: engine, slice -->
前两例是 ASCII 字节，最后一例用多字节 UTF-8 检查选择粒度。

:::example 提取中间三个字节
[输入]
ABCDEF，起点 2，长度 3
[结果]
CDE
[说明]
对应偏移 2、3、4，边界 5 为 F 所在位置但不进入选择。
:::

:::example 倒数第三个字节起取两个
[输入]
ABCDEF，起点 −3，长度 2
[结果]
DE
[说明]
将偏移换成 6−3=3，从 D 起读两个字节。
:::

:::example UTF-8 字符的一部分
[输入]
以 UTF-8 编码的 夏A，起点 0，长度 1
[结果]
E5
[说明]
夏的完整字节为 E5 A4 8F，只取第一个字节时不会得到完整字符。
:::

## 确定字段实际范围
<!-- sources: engine, slice -->
如果结构说明以起点和总长度描述字段，可先写出起点与末端再选取。逐行抽取时各行可能短于所需长度，因此保留原材料及实际输出的字节数有助于分清空值和越界。

## 常见误区
- 长度只表示要取几项，不是最后一项的偏移。
- 行处理使用 LF 分隔，CRLF 中的 CR 可能被读入。
- 一字节的选择可能只得到 UTF-8 字符的一部分。
