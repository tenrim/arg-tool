---
capabilityId: native:extract-indices
title: 按每行索引提取
topicGroup: text-language
summary: 将索引列表与有效文本行逐一配对，一行只取一个码点。
aliases:
  - 逐行索引
  - 索引列表提取
  - indexed extraction
sources:
  - id: unicode
    title: ECMA-262 字符串迭代器
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-string-iterator-objects
    language: en
    kind: standard
    locator: 字符串迭代按代码点长度推进
  - id: grapheme
    title: Unicode Text Segmentation
    publisher: Unicode 联盟
    url: https://www.unicode.org/reports/tr29/
    language: en
    kind: standard
    locator: 第 3 节，扩展字素簇与多个码点
  - id: engine
    title: 答案提取核心
    publisher: 迷雾工具箱
    url: /hunt-extract.js
    language: zh-CN
    kind: implementation
    locator: extractAnswer 的 indices 分支、索引分隔和越界检查
---

## 介绍
<!-- sources: unicode, engine -->
按每行索引提取用于已知一串位置的材料。第一项索引指向第一条有效行，第二项索引指向第二条有效行，依此类推。相比每行都取同一个位置，它允许各条记录取不同字段。

## 索引与行的一一配对
<!-- sources: engine -->
索引可以用空格、半角逗号或全角逗号分隔。依次读取输入时忽略空行，去掉其他行内的空白，然后从 1 起算每个位置。索引缺少、不是整数或超出对应行长度时，提示该行无效。

## 一行贡献一个码点
<!-- sources: unicode, grapheme, engine -->
查找的是字符串的第 N 个 Unicode 码点。数字、标点或单码点表情在没有空格时各占一位，复合图标可跨多位。当前按有效行逐条读，额外的尾随索引不会生成更多输出。

## 逐行配对例子
<!-- sources: unicode, engine -->
记录顺序应与索引顺序一致。对照每条结果，可以从输出字符回到相应源行。

:::example 不同选择位置
[输入]
123
456
789
索引为 3 1 2
[结果]
348
[说明]
第一行取 3，第二行取 4，第三行取 8。
:::

:::example 全角分隔和符号
[输入]
7🧩β
👁27
索引为 2，1
[结果]
🧩👁
[说明]
先取第一行第二个码点，再取第二行第一个码点。
:::

:::example 空行不消耗索引
[输入]
ab

cd
ef
索引为 2,1,2
[结果]
bcf
[说明]
三个索引依次配对 ab、cd、ef；空行不占位置。
:::

## 核对索引的来源
<!-- sources: grapheme, engine -->
索引表常来自题号、长度或另一个数据列。如果答案行重新排序，配对关系也会改变。应保留有效行的次序，并考虑资料是否把可见图形或空格当作单独的位置。

## 常见误区
- 这里不是在每一行依次应用全部索引。
- 日志中间夹空行不会为它消耗索引。
- 有效行缺少对应索引时会提示错误。
