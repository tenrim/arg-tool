---
capabilityId: native:currencies
title: 货币代码
topicGroup: world
summary: 读取 ISO 4217 的字母代码、数字代码、最小单位与历史状态。
aliases:
  - ISO 4217
  - CNY
  - USD
  - JPY
  - 币种
  - 货币
sources:
  - id: iso
    title: ISO 4217 — Currency Codes
    publisher: ISO
    url: https://www.iso.org/iso-4217-currency-codes.html
    language: en
    kind: standard
    locator: 字母代码、数字代码、最小单位和维护机构
  - id: boc
    title: 电话银行常用货币代码对照表
    publisher: 中国银行
    url: https://www.boc.cn/ebanking/service/cs1/201003/t20100326_992613.html
    language: zh-CN
    kind: official-doc
    locator: 常见币种代码与名称
  - id: data
    title: 币种资料记录
    publisher: 迷雾工具箱
    url: /vendor/discovery/currencies.json
    language: zh-CN
    kind: implementation
    locator: 字母代码、数字代码与最小单位
  - id: core
    title: 币种搜索与状态
    publisher: 迷雾工具箱
    url: /discovery/reference-core.js
    language: zh-CN
    kind: implementation
    locator: queryCurrencies、当前与历史数据
---

## 介绍
<!-- sources: iso -->

ISO 4217 提供货币和若干记账单位的标准标识。日常见到的三字母代码与三位数字代码通常指同一币种，金额符号则可能由不同货币共用。

## 字母和数字代码
<!-- sources: iso, boc, data -->

多数由国家发行的货币代码以地区前缀和币种首字母组合。跨国货币和特别记账单位存在例外，实际应按表查。数字代码是标识，不能用作价格。

:::example 人民币字段
[输入]
CNY
[结果]
Yuan Renminbi；数字代码 156；最小单位位数 2
[说明]
若金额按最小单位存储，1234 表示 12.34 个主单位。
:::

## 最小单位的位数
<!-- sources: iso, core, data -->

币种资料中的最小单位字段描述主要单位和较小单位的十进制比例。记载 n 位时，整数单位数除以 10ⁿ 可得到主单位数。具体现金面额则另由发行机构决定。

:::example 零位小数的示例
[输入]
JPY，最小单位整数 1234
[结果]
数字代码 392；位数 0；对应 1234 日元
[说明]
整数不需要再除以 100。
:::

:::example 三位小数的示例
[输入]
KWD，最小单位整数 1234
[结果]
数字代码 414；位数 3；对应 1.234 科威特第纳尔
[说明]
比例为千分之一。
:::

## 一个币种对应多个地区
<!-- sources: iso, core, data -->

币种和地区不是一对一。欧元等货币由多个地区共同使用。同一地区也可能在参考表中出现多个当前、历史或特殊用途条目。只读取首条记录可能遗漏关联地区。

## 历史代码与兑换值
<!-- sources: iso, core -->

货币转换或更名时可能有撤回日期，并留在历史表。资料会按维护更新，解读旧材料宜同时记录时间。该代码表用于识别单位，兑换价格需要单独的带日期和报价方向的数据。

## 常见误区

- 同一个 $ 符号可代表多种货币。
- 币种标准代码没有包含汇率。
- 最小单位位数不一定为 2，不能给所有币种套用分与元的比例。

