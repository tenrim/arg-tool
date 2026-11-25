---
capabilityId: op:Luhn%20Checksum
title: 卢恩校验和
topicGroup: file-compression
summary: 从右端按交替权重计算数字串的取模校验，生成或核对校验位。
aliases:
  - Luhn Checksum
  - 模 10 校验
  - 校验数字
sources:
  - id: patent
    title: Computer for Verifying Numbers
    publisher: Hans Peter Luhn
    url: https://patents.google.com/patent/US2950048A/en
    language: en
    kind: author-spec
    locator: 交替按位变换与取模检查的专利原文
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Luhn Checksum：checksum、生成 checkdigit 与基数限制
---

## 介绍
<!-- sources: patent, engine -->
卢恩校验用于检查某些编号是否存在录入错误。发送方在编号末端加一位，接收方按同一规则计算完整编号的余数。它可检查很多单数字输错及相邻调换。

## 从右端交替加权
<!-- sources: patent, engine -->
按十进制查看完整编号时，最右端保留原值，从它左边一项开始每隔一位乘 2。乘出的两位数将十位和个位相加，也可写成大于 9 时减 9。所有项的和对 10 取模；完整有效串余数为 0。

## 计算应补的尾位
<!-- sources: patent, engine -->
已有正文时先假设附加一个 0，再计算这个假设编号的余数 r。应填的尾位为 (10−r) mod 10。当前实现还对偶数基数推广这个规则，使用相应的基数取模并读取等价数字。

## 三组输入算例
<!-- sources: patent, engine -->
示例仅为独立算术编号。计算器会分别显示原输入的余数、要附加的校验位和拼接结果。

:::example 生成十进制校验位
[输入]
7992739871，基数 10
[结果]
校验位 3；拼接后为 79927398713
[说明]
末尾先补 0 时，变换后总和的模 10 余数为 7。
:::

:::example 检查完整编号
[输入]
79927398713，基数 10
[结果]
原输入 Checksum 为 0
[说明]
这是完整串的校验。界面还会给出把它当作正文再附一位的新编号，应按任务读取对应栏位。
:::

:::example 十六进制编号
[输入]
A2，基数 16
[结果]
Checksum 7，Checkdigit 2，拼接 A22
[说明]
计算原输入时将 A 加倍为十进制 20，折成十六进制 14 的位数和 5，再加 2 得 7。
:::

## 检查的范围
<!-- sources: patent, engine -->
余数为零只能说明满足这项算术规则。两个错位或某些相邻交换可能抵消，校验也不能确认编号已经分配。含短横线的文本还应依材料规则先处理分隔符。

## 常见误区
- 计算时从右端开始分配权重，常数依基数改变。
- 已含校验位的原输入应看 Checksum。
- 检验通过不代表编号在某系统中存在。
