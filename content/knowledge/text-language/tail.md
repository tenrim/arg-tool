---
capabilityId: op:Tail
title: 保留结尾
topicGroup: text-language
summary: 按分隔后的位置保留末尾记录，区分负数量与末尾空行。
aliases:
  - Tail
  - 取后 N 行
  - 行尾截取
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
    locator: Tail：拆分、正负条数、重新连接
---

## 介绍
<!-- sources: spec, engine -->
保留结尾从已分隔的记录中留下靠后的部分。可用于查看记录列表最后几项或从一组材料里去掉固定长度的行首内容。

## 正负数量
<!-- sources: spec, engine -->
输入拆为 m 条，数量 n 为正时输出最后 min(m,n) 条，仍按原顺序排列。n 为负时丢掉最前面的 |n| 条，输出其余记录。n 为零时没有记录进入结果。

## 末尾空项的影响
<!-- sources: spec, engine -->
末尾有分隔符时，分隔后常多一个空项。若只取最后一条，可能恰好选中它。结果为空时应先根据源文确定它到底没有任何选中记录，还是选中的记录没有可见字符。

## 尾部截取的例子
<!-- sources: spec, engine -->
下列输入刻意保留分隔边界，便于数清记录。

:::example 最后两行
[输入]
a
b
c
[结果]
b
c
[说明]
以 LF 分隔，数量 2，依原顺序保留最后两条。
:::

:::example 跳过前两项
[输入]
A,B,C,D，按逗号分隔，数量 −2
[结果]
C,D
[说明]
丢掉前两条 A 与 B。
:::

:::example 最后是空记录
[输入]
a、b 两行后还有一个 LF，数量 1
[结果]
空字符串
[说明]
末尾 LF 之后形成一个空记录，最后一项不是 b。
:::

## 与查看日志的关联
<!-- sources: spec, engine -->
若输入已经截断，所取结尾仍只是在已给数据中的最后部分。对有时间戳的日志，行序也未必等于事件时序。需要按时刻判断时，可先检查原时间字段与记录分隔。

## 常见误区
- 数量为负时跳过开头，不能用它指定倒数起点的前一段。
- 没有回读到文本时，先检查末尾分隔符。
- 保留结尾不会重新按时间或字母排序。
