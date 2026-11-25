---
capabilityId: pair:To%20Braille
title: Braille ASCII
topicGroup: communication
summary: 在 64 个字符和 64 种六点盲文点形之间做直接映射。
aliases:
  - Braille ASCII
  - 盲文编码
  - 六点转码
sources:
  - id: braille
    title: Unicode 17 第 21.1 节
    publisher: Unicode 联盟
    url: https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-21/
    language: en
    kind: standard
    locator: 点位、模式数量、盲文语言映射
  - id: table
    title: Braille ASCII 映射表
    publisher: GCHQ
    url: /vendor/knowledge/cyberchef/src/core/lib/Braille.mjs
    upstreamUrl: https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/lib/Braille.mjs
    license: Apache-2.0
    licenseUrl: /vendor/knowledge/LICENSE.txt
    language: en
    kind: implementation
    locator: BRAILLE_LOOKUP.ascii 与 dot6
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的输入和输出类型及选项
  - id: education
    title: 国家通用盲文方案研制组访谈
    publisher: 教育部／国家语委
    url: https://qspfw.moe.gov.cn/html/hotnews/20180523/12925.html
    language: zh-CN
    kind: official-doc
    locator: 第六问，声母、韵母、声调的规则
---

## 介绍
<!-- sources: braille, table -->

Braille ASCII 用一张 64 项表表示六点盲文点形。表的一边是可用键盘输入的字符，另一边是点位组合。这个映射用于交换和录入点阵，文字转为特定语言的盲文另有规则。

## 点位与编码
<!-- sources: braille, table -->

六点格从上到下编号为左列 1、2、3，右列 4、5、6。每位置有凸点或无凸点两种状态，共 2⁶＝64 种，含全空。Unicode 点形以点位编号给形状编码，给语言赋予读音或意义由语言规则决定。

:::example 从点形看编号
[输入]
1 4
2 5
3 6
从表中查 A 与 C
[结果]
A → ⠁（点 1）
C → ⠉（点 1、4）
[说明]
两格分别用了同一左上点和再加右上点。
:::

## 字母与数字的直接查表
<!-- sources: table, chef -->

数字也是 64 项表中的独立字符，有自己的点形。直接查表会把英文字母归入同一大小写形式，也不会自动加入特定语言的数字指示符。

:::example 同时输入字母与数字
[输入]
Ab1
[结果]
⠁⠃⠂
[说明]
字母 a、b 使用与对应大写相同的表项，字符 1 对应点 2。
:::

## 点形反查
<!-- sources: table, chef -->

已知点形时可逐格反查字符。任一漏点都可能使结果变成另一有效字符，所以抄录时应维持六个点的固定位置。超出查表范围的字符可能穿过转换而不改变。

:::example 核对符号格
[输入]
⠵⠮
[结果]
Z!
[说明]
两个六点组合各自查得一个字符，感叹号也是表内项。
:::

## 点阵表示与语言转写
<!-- sources: braille, education -->

Unicode 编码的是点形，六点形状可以在多种语言间重用。国家通用盲文中还涉及声母、韵母、声调和连写等规则。解读实物点阵时，可先记录点位，再依据标识的语言和规则查读。

## 常见误区

- 有相同点形不代表在所有语言中读法相同。
- 空格、空白点格和换行在转写文件里可能承担不同功能。
- 直接查表所得数字点形，不能自动当作语言盲文的完整数字写法。
