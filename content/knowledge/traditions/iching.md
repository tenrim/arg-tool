---
capabilityId: native:iching
title: 八卦与六十四卦
topicGroup: language-reference
summary: 按从下往上的爻位识别上下卦，区分卦序、方位与位串。
aliases:
  - 八卦
  - 六十四卦
  - 爻
  - 乾
  - 坤
  - 二进制
sources:
  - id: text
    title: 《周易》传世文本
    publisher: 识典古籍
    url: https://www.shidianguji.com/mid-page/7418256532158021659
    language: zh-CN
    kind: author-spec
    locator: 经文及《说卦》方位记载
  - id: table
    title: 八卦与六十四卦资料记录
    publisher: 迷雾工具箱
    url: /vendor/reference/iching.json
    language: zh-CN
    kind: implementation
    locator: trigrams、hexagrams 的卦序及上下卦
  - id: order
    title: 先天与后天八卦方位配置
    publisher: 迷雾工具箱
    url: /reference/visual-core.js
    language: zh-CN
    kind: implementation
    locator: BAGUA_ORDERS 与 BAGUA_DIRECTIONS
---

## 介绍
<!-- sources: text, table -->

八卦用三个位置的阴、阳爻构成八种组合，六十四卦由两组三爻上下相叠构成。实线表示阳，断线表示阴。在《周易》条目阅读中，一般从下往上给爻定位。

## 三爻、六爻和二值记录
<!-- sources: text, table -->

将阳记作 1、阴记作 0，可以把图形写成观察记录。记录顺序须单独注明。若选择从下往上写，前三位是下卦，后三位是上卦。

:::example 统一方向的全阳卦
[输入]
从下往上记录 111111
[结果]
下乾上乾，乾卦，通行卦序第 1
[说明]
每条都是阳爻，上下各三条。
:::

## 同样两卦，上下不同
<!-- sources: text, table -->

上下卦的组合有位置。交换两卦不改变每组六爻中阴阳线的总数，却可能换成语义和序号完全不同的卦。

:::example 下乾上坤
[输入]
由下到上记 111000
[结果]
泰卦，通行卦序第 11
[说明]
前三位乾，后三位坤，也写作地天泰。
:::

:::example 下坤上乾
[输入]
由下到上记 000111
[结果]
否卦，通行卦序第 12
[说明]
上下颠倒成天地否。
:::

## 先天与后天方位
<!-- sources: text, order -->

方位图把八个三爻卦配到八个方向，不同传承安排不同。先天图常以乾在南、坤在北，后天图通常以离在南、坎在北。方位表和六十四卦通行序属于不同资料。

## 图形和编号的交叉确认
<!-- sources: table, order -->

卦图可以从不同方向摆放，阅读前核对是否把南方画在上面，位串是从哪端起数。卦序号属于指定的排序传统，不能把通行卦序直接看作位串的十进制值。

## 常见误区

- 卦的第一爻在下，不在印刷图最上面。
- 上下卦交换通常得到另一卦。
- 二值记法用来记录爻形，卦名和卦序仍需按采用的表核对。

