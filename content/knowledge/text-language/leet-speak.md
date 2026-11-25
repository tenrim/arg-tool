---
capabilityId: op:Convert%20Leet%20Speak
title: 转换 Leet 替代字母
topicGroup: text-language
summary: 按常见形状替代字符，识别 Leet 数字风格与逆向转换歧义。
aliases:
  - 1337
  - Leetspeak
sources:
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的处理规则和声明边界
  - id: code
    title: ConvertLeetSpeak 源码
    publisher: GCHQ
    url: https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/ConvertLeetSpeak.mjs
    language: en
    kind: implementation
    locator: to 和 from 的字符替代表
---

## 介绍
<!-- sources: chef, code -->

Leet 是网络文字中借形状相似的数字或符号替代部分字母的书写方式。不同社群或个人写法可以不同，工具按选定的一张替代表工作。

## 形状近似与逐字替代
<!-- sources: code, chef -->

替代表只改变收录的字符，诸如 E→3、A→4、O→0。原文中其他字母、空格与符号仍可原样留在结果中。

:::example 换成常见数字符号
[输入]
LEET
[结果]
L337
[说明]
L 没有被这张表改写，两个 E 变成 3，T 变成 7。
:::

## 从替代符号反查
<!-- sources: code, chef -->

反向操作为每个表内数字选一个固定字母。有些原写法以数字 1 模拟 I，有些用它模拟 L。固定替代表只能输出其预设结果，语境可以帮助辨认。

:::example 数字串的反查
[输入]
1337
[结果]
ieet
[说明]
这里将 1 反查为 i。历史习惯的拼读不是操作的机械输出。
:::

## 原文中可能已有数字
<!-- sources: code, chef -->

替代前若数字已经作为原文信息存在，替代后不会附上标记。逆向处理可能误把原先就是数字的内容变成字母。

:::example 一次可逐字往返的比较
[输入]
TEST → 7357，再反向
[结果]
test
[说明]
表内 7、3、5 还原成 t、e、s，原大写形式未恢复。
:::

## 判断一段线索的依据
<!-- sources: code, chef -->

先辨认可能代换的字符，再看还原片段是否符合上下文。电话号码、序号和短词都可能出现类似数字。把候选与题面同用，可以避免只凭 1337 的外观就认定采用了某种整句规则。

## 常见误区

- Leet 没有唯一通用的替代表。
- 输出的大小写不会总与原字母一致。
- 固定反查不能恢复输入中本来是数字的位置。

