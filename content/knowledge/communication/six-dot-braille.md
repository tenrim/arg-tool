---
capabilityId: native:braille
title: 六点盲文
topicGroup: communication
summary: 解释六点单元、Unicode 点阵和字母数字读法，区分空格、数字标记与换组。
aliases:
  - Braille dots
  - 盲文点位
  - 六点盲文数字符
sources:
  - id: unicode
    title: Unicode 17.0 第 21.1 节 Braille
    publisher: Unicode 联盟
    url: https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-21/
    language: en
    kind: standard
    locator: Braille Patterns、点序及不规定语言含义的编码边界
  - id: dots
    title: “指趣”小课堂：国家通用盲文（一）
    publisher: 浙江特殊教育职业学院
    url: https://www.zcse.edu.cn/info/1696/40761.htm
    language: zh-CN
    kind: official-doc
    locator: 第 3 部分，六点的读面方向与编号
  - id: engine
    title: 六点盲文编解码
    publisher: 迷雾工具箱
    url: /engine.js
    language: zh-CN
    kind: implementation
    locator: brailleEncode、brailleDecode 与数字状态
---

## 介绍
<!-- sources: unicode, dots -->
六点盲文使用两列三行的单元。读面左列从上到下为 1、2、3，右列为 4、5、6。每一点可凸起或不凸起，因此有 2⁶=64 种点阵，其中一种是没有凸点的空白。

## 点阵的 Unicode 表示
<!-- sources: unicode -->
令每个凸起点 n 的权重为 2ⁿ⁻¹，相加后以 U+2800 为起点取码点。第 1 点和第 4 点的和为 1＋8=9，得到 U+2809。字符的 Unicode 编号只说明凸起了哪些点。

## 字母与数字模式
<!-- sources: unicode, engine -->
同一个点阵可在不同规则里记录不同字符。基础字母数字模式使用点 3456 作为数字标记，之后将 a 至 j 对应点阵读作 1 至 0，直到空白结束该段数字。字母到数字可以插入标记；数字后立即拼接字母会造成歧义，当前转换要求先给一个空格。

## 可逐点核对的例子
<!-- sources: unicode, engine -->
以下由读面编号解释凸点，也可直接用相应点阵读回图案或数字。

:::example 两点组成的单元
[输入]
读面上的第 1 和第 4 点凸起
[结果]
U+2809，⠉
[说明]
在基础字母表中为 C。在点阵层，取 1＋8=9。
:::

:::example 两位数字
[输入]
编码 12
[结果]
⠼⠁⠃
[说明]
先写点 3456 的数字标记，再写 1 点与 12 点。
:::

:::example 空白结束数字段
[输入]
解码 ⠁ ⠼⠁⠃ ⠃
[结果]
A 12 B
[说明]
末尾的 ⠃ 在数字段外读为 B，在数字段内读为 2。
:::

## 从实物确认方向
<!-- sources: unicode, dots -->
纸面凸点的读面不同于从背面压印时看到的点位。材料如果只有反面照片，应先确认镜像方向。较长的文字还要判定语言、缩写等级及标记规则，再作连续转写。

## 常见误区
- 先按左列 1、2、3 和右列 4、5、6 编号，不能按图像逐行从左向右数。
- 同一点阵可能是字母也可能是数字，数字标记和空格会影响读法。
- U+2800 是盲文空白，ASCII 空格是另一个字符。
