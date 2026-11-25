---
capabilityId: native:invisible-clean
title: 隐藏字符清理
topicGroup: characters
summary: 说明隐藏字符清理为何需要分类，并用实例区分断行、方向与 Emoji 组合。
aliases:
  - 移除隐藏字符
  - 选择性清理零宽字符
sources:
  - id: bidi
    title: UAX #9 — Unicode Bidirectional Algorithm
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr9/
    language: en
    kind: standard
    locator: 第 2 节，双向格式控制
  - id: lines
    title: UAX #14 — Unicode Line Breaking Algorithm
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr14/
    language: en
    kind: standard
    locator: 断行性质 ZW、GL
  - id: emoji
    title: UTS #51 — Unicode Emoji
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr51/
    language: en
    kind: standard
    locator: Emoji Presentation 和 Emoji ZWJ Sequences
  - id: core
    title: 隐藏字符的检查与分类清理
    publisher: 迷雾工具箱
    url: /basics/core.js
    language: zh-CN
    kind: implementation
    locator: inspect、emojiPreserved
---

## 介绍
<!-- sources: lines, emoji, core -->

隐藏字符清理按明确的类别从序列中删除字符。输出是在原有数据上做删减。确定清理类别时，需要知道码点原本承担的作用，因为删除后可能改变文字边界、显示方向或表情组合。

## 断行信息的改变
<!-- sources: lines, core -->

零宽空格和普通空格作用不同。删除 U+200B 会去掉一个原有的断行提示，原来的两个相邻片段可能连在一起。替换为空格则会插入一个可见的词间间隔。

:::example 删除和替换的差异
[输入]
A[U+200B]B
[结果]
删除 U+200B 得 AB
用 U+0020 替换则得 A B
[说明]
两种处理都去掉了原始零宽空格，但后一个结果包含新的码点。
:::

## 定向控制的成对范围
<!-- sources: bidi -->

方向隔离符成对限定一段文本。只删除起始或结束符会改变对应的范围关系。若目标是去掉某一层额外的方向信息，可以先在逻辑顺序里确认各控制符属于哪一对。

:::example 移除一个隔离范围
[输入]
A[U+2067]1[U+2069]B
[结果]
去掉两个隔离控制符后，逻辑序列为 A1B。
[说明]
A、1、B 的逻辑先后没有改变。渲染器不再因这对隔离控制符建立单独的方向范围。
:::

## 保留字形组合
<!-- sources: emoji, core -->

Emoji 连接序列由多个有效码点形成，零宽连接符 U+200D 可以参与其中。变体选择符也能让支持该组合的字体选择不同的呈现方式。清理流程应能将这些有用途的字符从一般的删除目标中排除。

:::example 一个连接符改变序列
[输入]
👩‍💻，由 U+1F469、U+200D 和 U+1F4BB 组成
[结果]
保留连接符：👩‍💻
只删除连接符：👩💻
[说明]
后者由两个未连接的 Emoji 字符组成。具体显示取决于平台字体支持。
:::

## 可核对的差异
<!-- sources: lines, bidi, emoji, core -->

清理前后的比较适合记录被删的码点和原始位置，并查看保留下来的换行、间隔和组合序列。若文本用于校验值、原始证据或密码输入，删除一个不可见字符也会改变数据本身。此时检查结果和清理结果具有不同用途。

## 常见误区

- 删除隐藏字符不是 Unicode 规范化，后者有关规范等价或兼容等价。
- 同一类字符可以同时涉及排版和内容，删除时应以实际用途选择范围。
- 清理输出无法自行恢复原始控制符。需要可逆审阅时保留原序列和位置记录。
