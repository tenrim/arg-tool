---
capabilityId: native:marine
title: 海事信号旗
topicGroup: characters-reference
summary: 按旗面图案、旗形和出现方式辨认国际信号旗，区分单旗含义与整组代码。
aliases:
  - 国际信号旗
  - 船旗
  - ICS 单旗
sources:
  - id: pub
    title: Pub. 102 International Code of Signals
    publisher: NGA
    url: /vendor/completion/marine/Pub102bk.pdf
    language: en
    kind: official-doc
    locator: 1969 年版、2020 年修订，第 1 章及第 2 章；PDF 第 14、26、70 页
  - id: imo
    title: International Code of Signals
    publisher: IMO
    url: https://doi.org/10.62454/KB994E
    language: en
    kind: author-spec
    locator: 规则的用途及完整信号
  - id: lookup
    title: 旗图检索和规则正文检索
    publisher: 迷雾工具箱
    url: /discovery/reference-core.js
    language: zh-CN
    kind: implementation
    locator: queryMarine、queryMarineBook
---

## 介绍
<!-- sources: pub, imo -->
《国际信号规则》为跨语言的海上通信提供固定含义。旗上颜色和几何形状识别出某个旗号。一个旗号既可作为字符出现，也可在规则规定的单独用法中表达完整消息。

## 字母旗与数字旗
<!-- sources: pub, lookup -->
字母旗用 A～Z 标识，数字旗用 0～9 标识。旗号 O 的旗面由红与黄斜分。旗号对应的识别读音是 Oscar。数字旗可参与时间、方位或其他数字字段；其单位与含义由所属信号决定。

## 单旗与整个信号的语境
<!-- sources: imo, pub -->
单独悬挂 O 可表示有人落水。悬挂多旗时，需要对照信号组本身的定义。NC 是求助信号，两字母的单旗释义逐条拼合不会得到这项定义。照片上的图案也可能作为装饰或拼写材料。

## 旗号与规则查询示例
<!-- sources: pub, lookup -->
同一套材料可以按单个旗号查看，也可以到规则原文按整组检索并查看匹配页。

:::example 单独的 Oscar
[输入]
在旗图中查询 O
[结果]
O · Oscar；单旗含义为有人落水
[说明]
规则的单字母信号表在 PDF 第 26 页列出该用法。
:::

:::example 展开字母数字序列
[输入]
在旗图序列中输入 J G 5
[结果]
依序显示 Juliett、Golf、Pantafive 三个旗图
[说明]
结果说明各符号的身份，整组是否构成规则中的某个信号要另查。
:::

:::example 查询 NC 的规定含义
[输入]
在国际信号规则原文检索 NC
[结果]
PDF 第 70 页定义为遇险并需要立即救助
[说明]
查整组代码，保留两面旗的书写顺序。
:::

## 图像材料中的旗号识别
<!-- sources: pub, lookup -->
旗帜可能在照片中遮住一角、被风翻转，或受灯光影响。辨认时应同时参考旗形、颜色分区及排列顺序。无法看清的旗号可记作未定，待查到另一张图或规则上下文再判断。

## 常见误区
- 旗号的识别读音与单旗的航海含义属于不同层次。
- 同一组旗帜上的字符，只有在对应使用条件下才能解释为某条规定信号。
- 竖排信号需要保留原有次序，随意重排会改变读法。
