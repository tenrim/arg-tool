---
capabilityId: native:morse
title: 摩斯录入
topicGroup: communication
summary: 按边界抄录点划，通过符号表逐字辨认并追加结果。
aliases:
  - Morse input
  - CW
  - 点划
  - 摩斯录入
sources:
  - id: itu
    title: ITU-R M.1677-1 国际摩尔斯电码
    publisher: 国际电信联盟
    url: https://www.itu.int/dms_pubrec/itu-r/rec/m/R-REC-M.1677-1-200910-I!!PDF-C.pdf
    language: zh-CN
    kind: standard
    locator: 附件一字母、数字、时长和呼叫
  - id: map
    title: 国际摩斯对应表
    publisher: 迷雾工具箱
    url: /engine.js
    language: zh-CN
    kind: implementation
    locator: morseMap 的来源和查表方式
  - id: symbols
    title: 符号录入面板
    publisher: 迷雾工具箱
    url: /round1/symbols.js
    language: zh-CN
    kind: implementation
    locator: morseLetter、morseView 与追加操作
  - id: sos
    title: SOS 救难信号史
    publisher: ITU News
    url: https://www.itu.int/itunews/manager/display.asp?ext=html&ipage=pioneers&issue=06&lang=en&year=2006
    language: en
    kind: official-doc
    locator: 连续九个点划的历史约定
---

## 介绍
<!-- sources: itu, map -->
摩斯录入用短点与长划的组合表示字符。本入口手工接收逐个点划，给出当前完整组合的查表结果。录音要先识别其中的信号和停顿。

## 从持续时间记下点划
<!-- sources: itu -->
相对同一个点的长度，划长三倍。同一字内的点划间隔为一倍，字符间隔为三倍，词间隔为七倍。抄录时应同时标记点划先后和在哪些位置结束一个字符。

:::example 一个点与一个划
[输入]
同组内依次录入 .-
[结果]
A
[说明]
A 是先点后划，同组的两次发声之间只有字符内停顿。
:::

## 组合可匹配与字符结束
<!-- sources: itu, map, symbols -->
一个点本身匹配 E，但也可以是 A 或 I 的开头。是否结束本组要由线索的停顿确定。录入器在明确追加后清空该组，便于继续处理下一个字符。

:::example 两点的两种分法
[输入]
同一组 ..，或者 . 与 . 各加为一组
[结果]
I，或者 EE
[说明]
点序列相同，字符边界决定不同的查表结果。
:::

## 抄录字母和数字
<!-- sources: itu, symbols, map -->
国际摩斯字母可用一到若干个点划表示，十进制数字的标准码均长五次。可以将看见的线段先转写为点划序列，再按同一方向和单位逐格核对。

:::example 数字五
[输入]
同组输入 .....
[结果]
5
[说明]
连续五点组成一个数字字符，这里没有中间的字符间隔。
:::

## SOS 字母与程序信号
<!-- sources: itu, sos, symbols -->
按三组录入 ...、---、... 会得到字母 SOS。历史求救程序信号可将同样的九个点划作为连续组合发送，字母位置之间不留三单位停顿。保留这种区别可读出发信者实际采用的方式。

:::example 三个独立字母
[输入]
依次录入 ...、---、...，每完成一组后追加
[结果]
SOS
[说明]
按国际表分别查得 S、O、S。
:::

## 常见误区

- 一个可匹配前缀不保证本组已结束。
- 丢掉字符边界会造成另一种读法。
- 手工录入只能处理已有的转写，不能自动在音频中分割点划。
- 历史连续求救程序信号的内部停顿与逐字母拼写不同。
