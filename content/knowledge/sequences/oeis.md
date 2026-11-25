---
capabilityId: native:oeis
title: OEIS 数列查询
topicGroup: technical
summary: 用连续项、精确 A 编号、偏移和递推式复核整数数列候选。
aliases:
  - OEIS
  - 整数序列
  - 数列
  - A编号
  - A000045
  - Fibonacci
  - 斐波那契
  - integer sequences
sources:
  - id: hints
    title: Hints for Using OEIS
    publisher: OEIS Foundation 与各条目贡献者
    url: https://oeis.org/hints.html
    language: en
    kind: official-doc
    locator: 连续项匹配、逗号与检索
  - id: json
    title: OEIS JSON Format
    publisher: OEIS Foundation 与各条目贡献者
    url: https://oeis.org/wiki/JSON_Format
    language: en
    kind: official-doc
    locator: fmt=json、记录内容和 id 查询
  - id: offset
    title: OEIS Offsets
    publisher: OEIS Foundation 与各条目贡献者
    url: https://oeis.org/wiki/Offsets
    language: en
    kind: official-doc
    locator: 两个 offset 数字的含义
  - id: fib
    title: A000045 — Fibonacci numbers
    publisher: OEIS Foundation 与各条目贡献者
    url: https://oeis.org/A000045
    language: en
    kind: official-doc
    locator: DATA、OFFSET、FORMULA
  - id: rev
    title: A001129 — Iccanobif numbers
    publisher: OEIS Foundation 与各条目贡献者
    url: https://oeis.org/A001129
    language: en
    kind: official-doc
    locator: DATA 与逐位逆序后相加的定义
  - id: license
    title: The OEIS End-User License Agreement
    publisher: OEIS Foundation 与各条目贡献者
    url: https://oeis.org/wiki/The_OEIS_End-User_License_Agreement
    language: en
    kind: official-doc
    locator: CC BY-SA 4.0 与归属
---

## 介绍
<!-- sources: hints, json -->

OEIS 为整数数列记录定义、数值、文献和程序。查询连续项时，逗号分隔的数字应保持先后和相邻关系，不必从首项开始。命中只提供和现有数字相合的候选。

## 同一前缀可以有两个规则
<!-- sources: hints, fib, rev -->

一小段数值通常不足以断定整条规则。A000045 与 A001129 起头相同，但从两位数开始后者先颠倒十进制数字再相加。继续核对后续项比仅凭首条候选更可靠。

:::example 两种延续
[输入]
0,1,1,2,3,5,8,13
[结果]
A000045 下一项 21；A001129 下一项 39
[说明]
普通相加是 8+13，按另一条目逐位逆序是 8+31。
:::

## 精确编号和字段
<!-- sources: json, fib -->

A 编号用作条目标识。普通全文搜索也可能匹配到别的条目中的引用。使用 id:A000045 可精确指定 Fibonacci 条目。完整记录包括这次接口回传的公式、注释、文献等，附图和 b-file 需要从原站另读。

:::example 从同名词查到确切对象
[输入]
A000045
[结果]
以 id:A000045 请求 Fibonacci numbers
[说明]
用定义、项及下标判断是否选对记录，公式和程序显示为文字。
:::

## 两个偏移字段
<!-- sources: offset, fib -->

第一个 offset 是列出第一项对应的下标。第二个数是第一个绝对值大于 1 的项在列表中的位置，从 1 计数。两者相差的数值没有固定关系。

:::example 读懂起始下标和位置
[输入]
F(0)=0，F(1)=1，后续项为前两项的和
[结果]
0,1,1,2,3,5,8；offset=0,4
[说明]
首项下标为 0，第四个列出项 2 的下标为 3。
:::

## 查询记录和材料引用
<!-- sources: json, hints, license -->

提交和翻页须经本站服务器访问 OEIS，按本站每 10 秒的上游请求保护限制调度。无候选与接口错误应分开判断。查询模块不持久保存内容，用户主动保存后可保留 A 编号、结果与时间。转载须依 OEIS 的 CC BY-SA 4.0 保留署名与出处。

## 常见误区

- 同一个数字前缀可以有多个延续。
- offset 的第二项不是第一项的下标。
- 返回完整记录不表示本机拥有全部索引与关联文件。

