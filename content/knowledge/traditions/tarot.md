---
capabilityId: native:tarot
title: 塔罗牌
topicGroup: language-reference
summary: 结合牌组版本、花色与牌阶识别塔罗牌，注意同一张牌在不同牌组中的编号。
aliases:
  - 塔罗
  - 大阿尔卡那
  - 小阿尔卡那
  - RWS
  - 牌组
sources:
  - id: met
    title: The tarot, then and now
    publisher: 大都会艺术博物馆
    url: https://www.metmuseum.org/perspectives/tarot-2
    language: en
    kind: official-doc
    locator: 早期塔罗、游戏用途和现代图像的馆藏说明
  - id: waite
    title: The Pictorial Key to the Tarot
    publisher: Arthur Edward Waite
    url: https://kloss.sourcelibrary.org/book/the-pictorial-key-to-the-tarot-being-fragments-of-a-secret-waite
    language: en
    kind: author-spec
    locator: 大牌的图像与编号，小牌四种花色
  - id: art
    title: 收录牌组的图像与编号
    publisher: 迷雾工具箱
    url: /reference/tarot-art.js
    language: zh-CN
    kind: implementation
    locator: TAROT_DECKS 与 tarotCardArt 的版本索引
---

## 介绍
<!-- sources: met, waite -->

塔罗牌最初用于纸牌游戏，在欧洲历史上出现过不同图像和组合。许多现代牌组成 78 张，包括 22 张专门的牌和四组各 14 张花色牌。图像、排序和名称都可能因牌组版本而变化。

## 大牌编号不是通用索引
<!-- sources: met, waite, art -->

同名的大阿尔卡那在不同传统中可以占用不同编号。Rider–Waite–Smith（RWS）与这里收录的 Gearberry 版本在正义与力量的 VIII、XI 位置上对调。

:::example 正义的两种编号
[输入]
牌名：正义
[结果]
RWS：XI；Gearberry：VIII
[说明]
辨认后还要核对牌组，单凭数字不能判断是哪张牌。
:::

## 用图案核对牌名
<!-- sources: waite, art -->

牌的题名、中央人物、手持物和编号可以共同识别。同一题材在不同绘师手中可能采用不同构图。老资料的罗马数字经抄录后也可能缺少最后一划。

:::example 力量的对应编号
[输入]
牌名：力量
[结果]
RWS：VIII；Gearberry：XI
[说明]
选择图像版本后，其编号随对应牌面记录。
:::

## 四类花色与牌阶
<!-- sources: waite, art -->

这两个版本的小牌分别用权杖、圣杯、宝剑、钱币四种花色。数牌和宫廷牌要结合花色识别，一张“二”并不唯一。

:::example 同名小牌的牌阶
[输入]
圣杯二
[结果]
两版的圣杯二均为数字 2
[说明]
花色是圣杯，数字对应牌阶，不是 78 张完整项目的序数。
:::

## 历史版本的线索
<!-- sources: met, waite, art -->

对比纸牌材料时宜记录牌背、图画风格、文字语言和牌名。早期游戏中的顺序和后来用于解释的象征系统可能不一致，应依据可辨明的牌组说明。

## 常见误区

- 塔罗牌号要和牌组版本一起记录。
- 大牌与小牌的编号各有对象，不能共享唯一数字索引。
- 出现在不同图像上的同一象征不等于同一张牌。

