---
capabilityId: op:Head
title: 保留开头
topicGroup: text-language
summary: 按给定分隔符取前若干条记录，说明负数量和空记录的读法。
aliases:
  - Head
  - 取前 N 行
  - 行首截取
sources:
  - id: spec
    title: ECMA-262 String.prototype.split
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.split
    language: en
    kind: standard
    locator: 分隔字符串、空项与空分隔符
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Head：拆分、正负条数、重新连接
---

## 介绍
<!-- sources: spec, engine -->
保留开头按分隔符切出记录，再复制列表前面的部分。记录可以是按换行写成的行，也可以是逗号分开的简短字段。该过程维持输入顺序。

## 按记录数建立范围
<!-- sources: spec, engine -->
设拆成 m 条，数量 n 为正时取前 n 条，输入不足时只取已有记录。n 为零时输出为空。当前运算以负 n 表示忽略末尾的 |n| 条，留下第一条到第 m−|n| 条。

## 分隔符与空条目
<!-- sources: spec, engine -->
连续两个分隔符之间有一条空记录。最后一个分隔符也可能新增一个空项。若材料实际用 CRLF，每个换行是两个代码单元，选择按 CRLF 切分可避免把 CR 留在记录尾。

## 前缀截取的例子
<!-- sources: spec, engine -->
以下分别展示取前、除去末尾和保留开头的空记录。

:::example 保留前两行
[输入]
a
b
c
[结果]
a
b
[说明]
以 LF 分隔，数量为 2。
:::

:::example 去掉末尾两项
[输入]
A,B,C,D，分隔为逗号，数量为 −2
[结果]
A,B
[说明]
四项减去末两项，保留前两项。
:::

:::example 第二条为空
[输入]
alpha、空行、beta，三条以 CRLF 分隔，数量为 2
[结果]
alpha 后跟一个 CRLF
[说明]
第二条虽无字符，依然占一个记录位置。
:::

## 检查记录是否有效
<!-- sources: spec, engine -->
直接按逗号分割适合无嵌套的材料。完整 CSV 的引号内可能也有逗号或换行，先解析记录结构才能得到真正的表格行。保留开头操作不会剔除表头或跳过空行。

## 常见误区
- 负数量是去掉尾项后保留开头，不是取结尾。
- 截取数量按分隔后的记录计数。
- 空行可能占一个记录位置。
