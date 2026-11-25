---
capabilityId: op:Unique
title: 去重
topicGroup: text-language
summary: 保留每种相同记录的一份，或按精确字符串统计出现次数。
aliases:
  - Unique
  - 移除重复行
  - 重复计数
sources:
  - id: spec
    title: ECMA-262 String.prototype.split
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.split
    language: en
    kind: standard
    locator: 分隔字符串、空项与空分隔符
  - id: keys
    title: ECMA-262 OrdinaryOwnPropertyKeys
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ordinaryownpropertykeys
    language: en
    kind: standard
    locator: 对象整数索引属性的枚举顺序
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Unique 的首次出现去重与对象计数路径
---

## 介绍
<!-- sources: spec, engine -->
去重把完全相同的记录归为一类。可以只保留一个代表，也可以同时输出该项重复了多少次。是否相同取决于切分后实际存留的文字。

## 大小写和空白
<!-- sources: spec, engine -->
相等比较使用确切的内容。a、A、带一个前导空格的 a 是不同字符串。对于需要忽略两端空格或文字大小写的材料，应在去重前明确应用相应的归一规则。

## 去重与计数的顺序
<!-- sources: keys, engine -->
只去重时通常保持第一次出现顺序。显示计数时实现先把字符串作为对象的键，再枚举。因此当键恰为非负且符合数组索引范围的十进制整数名称时，它们会按该类键的数值顺序提前，不能一概当成输入顺序。

## 去重的可核对例子
<!-- sources: spec, keys, engine -->
前两组为逐行处理，第三组专门观察计数模式的输出顺序。

:::example 只保留首次出现
[输入]
red
blue
red
[结果]
red
blue
[说明]
第二次出现的 red 被折叠。
:::

:::example 有大小写差别时计数
[输入]
red
Blue
red
blue
[结果]
2 red
1 Blue
1 blue
[说明]
Blue 与 blue 分开成为键。
:::

:::example 整数索引名称的显示顺序
[输入]
10,2,10,2,1，以逗号切分并启用计数
[结果]
1 1,2 2,2 10
[说明]
顺序为数字名称 1、2、10，每项前面是出现次数。
:::

## 重复项承载的线索
<!-- sources: keys, engine -->
重复次数可以是校验、频率或记录事件的数量。只保留代表会去掉这些信息。处理中间材料时，可把原列表、计数结果和唯一项列表各自保留供核对。

## 常见误区
- 默认比较不会先忽略前导空格。
- 只去重会失去频次信息。
- 计数输出的顺序和首次出现的顺序可能不同。
