---
capabilityId: native:polybius
title: Polybius 方阵
topicGroup: communication
summary: 以一对数字给字母表方格编码，区分合并字母与六阶扩展。
aliases:
  - Polybius
  - 波利比乌斯
  - I/J
  - 坐标方阵
sources:
  - id: hist
    title: The Histories, Book 10
    publisher: Polybius / Loeb Classical Library
    url: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Polybius/10%2A.html
    language: en
    kind: author-spec
    locator: 第 45–47 节中的分组信号
  - id: aca
    title: Bifid
    publisher: American Cryptogram Association
    url: https://www.cryptogram.org/downloads/aca.info/ciphers/Bifid.pdf
    language: en
    kind: author-spec
    locator: Polybius 方阵的两个坐标
  - id: vendor
    title: PolybiusSquare 固定编码实现
    publisher: 迷雾工具箱随包上游
    url: /vendor/basics/PolybiusSquare.js
    language: en
    kind: implementation
    locator: 坐标表和编码顺序
  - id: model
    title: 5×5 与 6×6 方阵
    publisher: 迷雾工具箱
    url: /basics/model.js
    language: zh-CN
    kind: implementation
    locator: squareModel 的关键词、合并与六阶字符集
---

## 介绍
<!-- sources: hist, aca -->
Polybius 方阵将字元放入有行和列的表，用两项位置号码代替字元。名称来自波利比乌斯记录的分组火炬传信。现代拉丁字母表实例按五行五列或六行六列排布。

## 先行后列的双数字
<!-- sources: aca, vendor, model -->
从 1 开始给行、列编号。方阵第 r 行第 c 列的字母写为 rc。逆向读取时先分成两位组，第一位选择行，第二位在行中定位列。

:::example 三个字母的坐标
[输入]
默认 5×5 方阵，ARG
[结果]
11 42 22
[说明]
A 在第一行第一列，R 在第四行第二列，G 在第二行第二列。
:::

## 五阶表的字母合并
<!-- sources: aca, model -->
五行五列只有 25 个位置。常见的 Polybius 表将 J 并入 I。另有用于敲击码的表将 K 并入 C。两种字母排列会改变其余字母的位置。

:::example 同格不再区分 I/J
[输入]
默认 5×5 方阵，IJ
[结果]
24 24
[说明]
第二行第四列在该表代表 I 和 J。反查同一坐标不能判定原来是哪一个。
:::

## 六阶扩展和关键词
<!-- sources: vendor, model -->
6×6 方阵可安排 26 个字母和 10 个数字，不需要合并 I/J。关键词按第一次出现去重，放在方阵开头，其余字元按所定义的顺序补齐。解码要使用同样的表。

:::example 带数字的六阶方阵
[输入]
6×6 方阵，关键词 SECRET123，明文 J9
[结果]
34 66
[说明]
关键词去重为 SECRT123，补入未使用的字元后，J 在第三行第四列，9 在第六行第六列。
:::

## 与其他方阵方法的关系
<!-- sources: hist, aca, vendor -->
直接把字符换成坐标是方阵本身的作用。有的密码还对这些坐标作拆分、换位或加法。若材料只有成对数字，需确认它们是方阵的原始坐标还是其他算法的中间产物。

## 常见误区

- 先列后行会得到不一样的字母。
- 5×5 范围内每一位只允许 1 至 5。
- 5×5 合并的字母无法从同一格复原原始区别。
- 使用关键词后，不能再按未加关键词的字母次序解码。
