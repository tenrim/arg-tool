---
capabilityId: pair:To%20BCD
title: BCD
topicGroup: characters
summary: 二进制编码的十进制数逐位编码十进制数字。8421 BCD 以四位表示一个数字，紧凑格式按约定组合多个数字位。
aliases:
  - To BCD
  - From BCD
  - 二进制编码的十进制数
  - 8421 BCD
  - 余 3 码
sources:
  - id: ti
    title: SN74LS47 — BCD-to-Seven-Segment Decoder/Driver
    publisher: Texas Instruments
    url: https://www.ti.com/product/SN74LS47
    language: en
    kind: official-doc
    locator: BCD 输入到十进制数码显示
  - id: ibm
    title: PACK — IBM Sterling Transformation Extender
    publisher: IBM
    url: https://www.ibm.com/docs/en/ste/11.0.1?topic=functions-pack
    language: en
    kind: official-doc
    locator: 压缩十进制数的数字与符号半字节
  - id: worker
    title: CyberChef Worker（固定构建）
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: To BCD 与 From BCD 的编码方式和分组
  - id: catalogue
    title: CyberChef 操作目录（固定构建）
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To BCD 与 From BCD，位宽和数字编码
---

## 介绍
<!-- sources: ti, ibm -->
BCD 是 Binary-Coded Decimal 的缩写。它按十进制书写的每一位分别编码，常见于数码管电路与需要保留十进制数字结构的数字字段。8421 BCD 用四位分别代表权重 8、4、2 和 1，每组对应一个十进制数字。

## 逐位编码与二进制整数
<!-- sources: ti, ibm -->
在 8421 BCD 中，十进制的十位、个位要分别转换。通常二进制整数的最低位开始则依次乘以 1、2、4、8 等权重。因此同一组比特用两种数制读法，可以得到不同的值。

:::example 十进制 59 的两种写法
[输入]
59
[结果]
8421 BCD 为 0101 1001；普通 8 位二进制为 0011 1011
[说明]
BCD 中 5 与 9 分开处理。普通二进制中的 59 等于 32 + 16 + 8 + 2 + 1。
:::

## 压缩和非压缩布局
<!-- sources: ibm, worker, catalogue -->
压缩布局通常允许一个字节容纳两个四位组，非压缩布局则可为每个数字分配一个独立字节。若压缩后最后还剩一个空位，必须查明该字段约定如何填补。用于整数或记录接口的其他格式也可能在末尾保留一组作符号。

:::example 三个数字的两种布局
[输入]
507（8421，压缩布局按尾侧补零）
[结果]
压缩布局为 01010000 01110000，非压缩布局为 00000101 00000000 00000111
[说明]
在这一压缩约定下，最后四位是对齐补位。若未同时记录原数字位数，压缩布局无法区分 507 与具有同一码串的 5070。
:::

## 数字组与符号组
<!-- sources: ti, ibm -->
标准的 8421 数字组仅使用 0000 到 1001。一些压缩十进制字段使用末尾的四位表示符号，例如 IBM 文档含十六进制 C、D 等符号码。读取时要区分普通数字组与预留符号位置，并根据字段约定处理未使用码型。

## 余 3 编码
<!-- sources: worker, catalogue -->
余 3 编码也逐位拆分十进制数字，但每位先加 3，再写作四位二进制数。解码时逐组减 3，再检查结果是否落在 0 至 9。它与 8421 共用四位宽度，数字到位型的映射各有规则。

:::example 余 3 编码的 59
[输入]
59（每位加 3）
[结果]
1000 1100
[说明]
5 + 3 = 8，9 + 3 = 12。1100 在此表示数字 9，在普通 8421 数字位置则不属于有效数字码。
:::

## 常见误区
- 看到十进制 59 写作 0x59 时，应先区分它是 BCD 码字，还是整数 89 的普通十六进制表示。
- 末尾半字节的含义依字段约定，可以是数字、符号或对齐补位。
- 8421 与余 3 的组宽相同，恢复十进制值仍须知道采用哪种映射。
