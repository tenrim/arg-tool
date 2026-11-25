---
capabilityId: native:marine-signals
title: 海事组合旗语
topicGroup: characters-reference
summary: 按旗别和出现位置展开代用旗，说明组合绘制、应答旗和数字小数点。
aliases:
  - 海事代用旗
  - 旗语组合
  - ICS substitute flag
sources:
  - id: pub
    title: Pub. 102 International Code of Signals
    publisher: NGA
    url: /vendor/completion/marine/Pub102bk.pdf
    language: en
    kind: official-doc
    locator: 1969 年版、2020 年修订，第 1 章及第 2 章；PDF 第 14、26、70 页
  - id: rules
    title: Pub. 102 第 1 章
    publisher: NGA
    url: https://msi.nga.mil/api/publications/download?key=16694273%2FSFH00000%2FChapter1.pdf&type=view
    language: en
    kind: official-doc
    locator: 第 5 节升旗、代用旗与应答旗
  - id: engine
    title: 海事组合旗语
    publisher: 迷雾工具箱
    url: /completion/marine.js
    language: zh-CN
    kind: implementation
    locator: flagGroups 的代用旗和 CODE 规则、marine 矢量绘图
---

## 介绍
<!-- sources: pub, rules -->
一艘船可能只有一套旗。某一升旗组需要重复同一旗号时，可用第一、第二或第三代用旗指向上面已经出现的同类旗，使有限旗具仍能表达重复字符。

## 同类旗的位置
<!-- sources: rules, engine -->
代用旗以前面最近一面所属的类别为准，可以指向字母旗序列或数字旗序列。第一代用旗指该类第一项，第二指第二项，第三指第三项。按上至下展开时，一个代用旗在同一组最多使用一次。换组后另行计数。

## 应答旗在数字中的作用
<!-- sources: pub, rules, engine -->
应答旗具有通联用途，也可在十进数字中表示小数点。数字组的代用旗计数忽略它。文本中的 CODE 是这面旗的记号之一，是否读成小数点要结合它在数字组中的位置。

## 代用旗与小数的例子
<!-- sources: rules, engine -->
以下以 R1、R2、R3 记三个代用旗，CODE 记应答旗。前两个组合可与《国际信号规则》第 1 章的例子相互对照。

:::example 重复两个数字
[输入]
编码 1100
[结果]
1 R1 0 R3
[说明]
第二项重复该类第一位的 1；第四项重复数字第三位的 0。
:::

:::example 字母旗与数字旗混用
[输入]
解码 L 2 3 R2 0
[结果]
L2330
[说明]
R2 跟随数字旗 3，所以复用数字中的第二项 3，不参考字母 L。
:::

:::example 数字中的小数点
[输入]
解码 1 2 CODE 5
[结果]
12.5
[说明]
本组中的 CODE 对应小数点，数字序列保留 1、2、5。
:::

## 组界和碰到缺失旗帜
<!-- sources: rules, engine -->
同一组合中的代用旗使用情况应完整记录。若后半组缺失，不能把相邻组的旗号借过来填空。绘制多个合成组合时可用换行或斜杠分组，例如 AAB / AAB 得到两组相同的 A R1 B。

## 常见误区
- R2 代表该类旗的第二项，未必就是从上往下数的第二面旗。
- 同一组不可重复使用同一面代用旗。分开的组各自计数。
- 标成 CODE 的旗在不同通信阶段承担不同作用。
